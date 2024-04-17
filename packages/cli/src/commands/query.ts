import { createInterface } from "readline";
import type { Arguments } from "yargs";
import { Wallet, type Signer } from "ethers";
import { Database } from "@tableland/sdk";
import { studioAliases } from "@tableland/studio-client";
import chalk from "chalk";
import { type GlobalOptions } from "../cli.js";
import {
  type NormalizedStatement,
  ERROR_INVALID_PROJECT_ID,
  ERROR_INVALID_STORE_PATH,
  FileStore,
  helpers,
  logger,
  normalizePrivateKey,
} from "../utils.js";

export const command = "query";
export const desc =
  "open a shell to run sql statements  against your selected project";

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const store = helpers.getStringValue(argv.store, ERROR_INVALID_STORE_PATH);

    const fileStore = new FileStore(store);
    const apiUrl = helpers.getApiUrl({ apiUrl: argv.apiUrl, store: fileStore });
    const api = helpers.getApi(fileStore, apiUrl);
    const projectId = helpers.getUUID(
      helpers.getProject({ ...argv, store: fileStore }),
      ERROR_INVALID_PROJECT_ID,
    );

    const queryValidator = await helpers.getQueryValidator();
    const shell = new QueryShell({
      aliasMap: studioAliases({
        environmentId: await helpers.getEnvironmentId(api, projectId),
        apiUrl,
      }),
      queryValidator,
      providerUrl: helpers.getProviderUrl({
        providerUrl: argv.providerUrl,
        store: fileStore,
      }),
      privateKey: argv.privateKey
        ? normalizePrivateKey(argv.privateKey)
        : undefined,
      api,
    });

    shell.start();
  } catch (err: any) {
    logger.error(err);
    logger.error("exiting studio query shell");
  }
};

class QueryShell {
  statement = "";
  // readline interfaces don't immediately pause "line" events, so we have to
  // build our own mechanism to pause
  paused = false;
  captureLine: undefined | ((line: string) => void);
  databases: Record<string, Database> = {};
  aliasMap: ReturnType<typeof studioAliases>;
  api: ReturnType<typeof helpers.getApi>;
  queryValidator: (query: string) => Promise<NormalizedStatement>;
  providerUrl: string;
  privateKey: string | undefined;
  _interface: ReturnType<typeof createInterface>;

  constructor(opts: {
    aliasMap: ReturnType<typeof studioAliases>;
    api: ReturnType<typeof helpers.getApi>;
    queryValidator: (query: string) => Promise<NormalizedStatement>;
    providerUrl: string;
    privateKey?: string;
  }) {
    this.api = opts.api;
    this.aliasMap = opts.aliasMap;
    this.queryValidator = opts.queryValidator;
    this.providerUrl = opts.providerUrl;
    this.privateKey = opts.privateKey;

    this._interface = createInterface({
      input: process.stdin,
      output: process.stdout,
      completer,
      terminal: true,
      tabSize: 4,
    });
  }

  start() {
    // the _interface handler promise isn't being used, but that is ok in this case
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this._interface.on("line", this.handler.bind(this));

    // if the user is midway through a statement and they want to reset the
    // prompt, they can hit control + c, but if hit it twice or are at a fresh
    // prompt already we want to kill the process
    this._interface.on("SIGINT", () => {
      const currentPrompt = this._interface.getPrompt();
      if (currentPrompt === "> ") process.exit();
      this.resetPrompt();
    });

    this.resetPrompt();
  }

  async handler(line: string | undefined) {
    if (typeof line !== "string") return;
    if (this.paused) {
      if (typeof this.captureLine === "function") this.captureLine(line);
      return;
    }

    line = line.trim();
    if (line === "") {
      if (this.statement === "") return this.resetPrompt();
      return this.setMidPrompt();
    }

    // note: this gives the first index of ";", if there is more than one
    //   semicolon the check below will ensure the user isn't trying to run
    //   multiple statements at the same time.
    const semiColonIndex = line.indexOf(";");

    // if no semicolon exists they are inputting a multi line statement
    // we should change the prompt and save the previous line's text
    if (semiColonIndex < 0) {
      this.statement += line + " ";
      return this.setMidPrompt();
    }

    // if a semicolon exists but is not at the end of the statement they are
    // trying to run multiple statments together, which is not allowed
    if (semiColonIndex < line.length - 1) {
      logger.error(
        "statements must end with `;` and you cannot run more than one statement at a time",
      );
      this.resetPrompt();
      return;
    }

    this.statement += line;
    // at this point we have a full statement, we should attempt to run it
    await this.runQuery();
  }

  async runQuery() {
    try {
      const queryObject = await this.queryValidator(this.statement);

      if (queryObject.type === "create") {
        throw new Error(
          "you cannot create studio project table definitions with the cli",
        );
      }

      if (queryObject.type !== "read" && !this.privateKey) {
        throw new Error(
          "you did not provide a private key, you can only run read queries",
        );
      }

      const aliasMap = await this.aliasMap.read();
      const chainId = helpers.getChainIdFromTableName(
        aliasMap[queryObject.tables[0]],
      );

      const db = await this.getDatabase(chainId);

      if (queryObject.type !== "read") {
        // TODO: all sub-queries I can think of work here, but ask others for try and break this.
        const tableId = helpers.getTableIdFromTableName(
          aliasMap[queryObject.tables[0]],
        );

        if (
          typeof this.privateKey !== "string" ||
          typeof db.config.signer === "undefined"
        ) {
          throw new Error("cannot get wallet");
        }
        const wallet = new Wallet(this.privateKey);

        // We have to pause the sql interface so we can use the confirm interface
        this.pause();
        const proceed = await this.confirmWrite({
          chainId,
          signer: db.config.signer,
          args: [
            // args for contract `mutate` methods
            wallet.address,
            tableId,
            this.statement,
          ],
        });
        this.resume();

        if (!proceed) {
          logger.log("aborting write query.");
          return this.resetPrompt();
        }
      }

      const preparedStatement = db.prepare(this.statement);
      const result = await preparedStatement.all();

      logger.log(JSON.stringify(result, null, 4));
      this.resetPrompt();
    } catch (err: any) {
      logger.error(err);
      this.resetPrompt();
    }
  }

  // we have to do some trickery here because we can't have two interfaces open
  // at the same time
  async confirmWrite(info: { signer: Signer; chainId: number; args: any[] }) {
    const cost = await helpers.estimateCost({
      signer: info.signer,
      chainId: info.chainId,
      method: "mutate(address,uint256,string)",
      args: info.args,
    });

    process.stdout.write(
      `You are about to use address: ${chalk.yellow(
        info.args[0],
      )} to write to a table on chain ${chalk.yellow(info.chainId)}
The estimated cost is ${cost}
Do you want to continue (${chalk.bold("y/n")})? `,
    );

    return await new Promise((resolve, reject) => {
      this.captureLine = function (line: string) {
        this.captureLine = undefined;
        if (line.toLowerCase()[0] !== "y") {
          resolve(false);
        }

        resolve(true);
      };
    });
  }

  resetPrompt() {
    this.statement = "";
    this._interface.setPrompt("> ");
    this._interface.prompt();
  }

  setMidPrompt() {
    this._interface.setPrompt("... ");
    this._interface.prompt();
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  async getDatabase(chainId: string | number) {
    if (typeof chainId === "number") chainId = chainId.toString();
    if (this.databases[chainId]) return this.databases[chainId];

    // if no private key was given, the databases will be read only
    const wallet = this.privateKey
      ? await helpers.getWalletWithProvider({
          privateKey: this.privateKey,
          chain: parseInt(chainId, 10),
          providerUrl: this.providerUrl,
          api: this.api,
        })
      : undefined;

    this.databases[chainId] = new Database({
      signer: wallet,
      aliases: this.aliasMap,
    });

    return this.databases[chainId];
  }
}

const sqlTerms = ["select", "insert", "from", "order", "values"];
const completer = function (line: string) {
  // TODO:
  //    - add more common sql terms
  //    - make completer a method then check against all table names in this project
  const words = line.split(" ");
  const word = words.pop();
  if (typeof word !== "string") return [[], line];

  const hits = sqlTerms.filter(function (term: string | undefined) {
    if (typeof term !== "string" || term === "") return false;
    return term.indexOf(word) === 0;
  });
  return [
    hits.map((hit: string) => {
      words.push(hit);
      return words.join(" ");
    }),
    line,
  ];
};
