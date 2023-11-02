import type { Arguments } from "yargs";
import yargs from "yargs";
import { helpers, Database } from "@tableland/sdk";
import { generateCreateTableStatement } from "@tableland/studio-store";
import { waitForTransaction } from "wagmi/actions";
// import { createTeamByPersonalTeam } from "../../../db/api/teams.js";
import { type GlobalOptions } from "../cli.js";
import {
  ask,
  FileStore,
  getApi,
  getApiUrl,
  getChainName,
  getProject,
  findOrCreateDefaultEnvironment,
  getWalletWithProvider,
  logger,
  normalizePrivateKey,
} from "../utils.js";

type Yargs = typeof yargs;

export const command = "deployment <sub>";
export const desc = "manage studio deployments";

export interface CommandOptions {
  project?: string;
  name?: string;
}

export const builder = function (args: Yargs) {
  return args
    .command(
      "ls [project]",
      "list the deployments for the given projectId, or the default projectId",
      function (args) {
        return args.positional("project", {
          type: "string",
          description: "optional project id",
        });
      },
      async function (argv) {
        try {
          const { store, apiUrl: apiUrlArg } = argv;
          const fileStore = new FileStore(store as string);
          const apiUrl = getApiUrl({ apiUrl: apiUrlArg as string, store: fileStore})
          const api = getApi(fileStore, apiUrl as string);

          const projectId = getProject({
            projectId: argv.project,
            store: fileStore
          });

          if (typeof projectId !== "string") {
            throw new Error("must provide project for deployment");
          }

          const deployments = await api.deployments.projectDeployments.query({
            projectId,
          });

          logger.log(JSON.stringify(deployments, null, 4));
        } catch (err: any) {
          logger.error(err);
        }
      },
    )
    .command(
      "create <name>",
      "deploy the given table name. A projectId value is required, but the default is used if no command flag is set",
      function (args) {
        return args.positional("project", {
          type: "string",
          description: "optional project id",
        });
      },
      async function (argv) {
        try {
          const { chain, name, store, apiUrl: apiUrlArg, providerUrl } = argv;

          const chainInfo = helpers.getChainInfo(chain as number);
          const fileStore = new FileStore(store as string);
          const privateKey = normalizePrivateKey(argv.privateKey);
          const wallet = await getWalletWithProvider({
            privateKey,
            chain: chainInfo.chainId as number,
            providerUrl: providerUrl as string,
          });

          const apiUrl = getApiUrl({ apiUrl: apiUrlArg as string, store: fileStore})
          const api = getApi(fileStore, apiUrl);
          const projectId = getProject({
            ...argv,
            store: fileStore
          });

          if (typeof name !== "string" || name.trim() === "") {
            throw new Error("must provide table name");
          }
          if (typeof projectId !== "string" || projectId.trim() === "") {
            throw new Error("must provide project for deployment");
          }

          const environmentId = await findOrCreateDefaultEnvironment(api, projectId);

          // lookup table data from project and name
          const table = await api.tables.tableByProjectIdAndSlug.query({
            // TODO: the type check above isn't working, using `as string` as a work around
            projectId: projectId as string,
            slug: name as string,
          });

          if (!(table && table.name && table.schema)) {
            throw new Error("could not get table to deploy within project");
          }

          // TODO: setup a "ping" endpoint in the api so we can be sure the api is responding before
          //       the deployment is created

          // confirm they want to deploy their table
          const confirm = await ask([
            `you are about to use funds from account ${wallet.address} on ${chainInfo.name} to deploy a table
are you sure you want to continue (y/n)? `
          ]);

          if (confirm[0].length < 1 || confirm[0][0].toLowerCase() !== "y") {
            logger.log("aborting deployment");
          }

          const db = new Database({
            signer: wallet,
            baseUrl: helpers.getBaseUrl(chainInfo.chainId as number),
            autoWait: true,
          });

          const stmt = generateCreateTableStatement(table.name, table.schema);
          const res = await db.prepare(stmt).all();
          if (res.error) {
            throw new Error(res.error);
          }
          if (!res.success) {
            throw new Error("Unsucessful call to exec transaction");
          }
          if (!res.meta.txn) {
            throw new Error("No transaction found in metadata");
          }
          const txn = res.meta.txn;

          const result = await api.deployments.recordDeployment.mutate({
            environmentId,
            tableName: txn?.name as string,
            chainId: txn?.chainId as number,
            tableId: table.id,
            tokenId: txn?.tableId as string,
            createdAt: new Date(),
            blockNumber: txn?.blockNumber,
            txnHash: txn?.transactionHash,
          });

          logger.log("table deployed");
          logger.log(JSON.stringify(result, null, 4));
        } catch (err: any) {
          logger.error(err);
        }
      },
    );
};

/* c8 ignore next 3 */
export const handler = async (
  argv: Arguments<CommandOptions>,
): Promise<void> => {
  // noop
};
