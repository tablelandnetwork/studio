import type { Arguments } from "yargs";
// Yargs doesn't seem to export the type of `yargs`.  This causes a conflict
// between linting and building. Lint complains that yargs is only imported
// for it's type, and build complains that you cannot use namespace as a type.
// Solving this by disabling lint here.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import yargs from "yargs";
import chalk from "chalk";
import { helpers as sdkHelpers, Database } from "@tableland/sdk";
import { generateCreateTableStatement } from "@tableland/studio-store";
import { FileStore, helpers, logger, normalizePrivateKey } from "../utils.js";

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
          const apiUrl = helpers.getApiUrl({
            apiUrl: apiUrlArg as string,
            store: fileStore,
          });
          const api = helpers.getApi(fileStore, apiUrl);

          const projectId = helpers.getProject({
            projectId: argv.project,
            store: fileStore,
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

          const chainInfo = sdkHelpers.getChainInfo(chain as number);
          const fileStore = new FileStore(store as string);
          const privateKey = normalizePrivateKey(argv.privateKey);

          const apiUrl = helpers.getApiUrl({
            apiUrl: apiUrlArg as string,
            store: fileStore,
          });
          const api = helpers.getApi(fileStore, apiUrl);
          const projectId = helpers.getProject({
            ...argv,
            store: fileStore,
          });

          const wallet = await helpers.getWalletWithProvider({
            privateKey,
            chain: chainInfo.chainId,
            providerUrl: providerUrl as string,
            api,
          });

          if (typeof name !== "string" || name.trim() === "") {
            throw new Error("must provide table name");
          }
          if (typeof projectId !== "string" || projectId.trim() === "") {
            throw new Error("must provide project for deployment");
          }

          const environmentId = await helpers.findOrCreateDefaultEnvironment(
            api,
            projectId,
          );

          // lookup table data from project and name
          const table = await api.tables.tableByProjectIdAndSlug.query({
            projectId,
            slug: name,
          });

          if (!(table?.name && table?.schema)) {
            throw new Error("could not get table to deploy within project");
          }

          // TODO: setup a "ping" endpoint in the api so we can be sure the api is responding before
          //       the deployment is created

          const stmt = generateCreateTableStatement(table.name, table.schema);

          const cost = await helpers.estimateCost({
            signer: wallet,
            chainId: chain as number,
            method: "create(address,string)",
            args: [wallet.address, stmt],
          });

          // confirm they want to deploy their table
          const confirm = await helpers.ask([
            `You are about to use address: ${chalk.yellow(
              wallet.address,
            )} to deploy a table on chain ${chain as number}
The estimated cost is ${cost}
Do you want to continue (y/n)? `,
          ]);

          if (confirm[0].length < 1 || confirm[0][0].toLowerCase() !== "y") {
            logger.log("aborting deployment");
          }

          const db = new Database({
            signer: wallet,
            baseUrl: sdkHelpers.getBaseUrl(chainInfo.chainId),
            autoWait: true,
          });

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
            tableName: txn?.name,
            chainId: txn?.chainId,
            tableId: table.id,
            tokenId: txn?.tableId,
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
