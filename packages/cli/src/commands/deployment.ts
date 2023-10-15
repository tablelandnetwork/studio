import type { Arguments } from "yargs";
import yargs from "yargs";
import { helpers, Database } from "@tableland/sdk";
// import { createTeamByPersonalTeam } from "../../../db/api/teams.js";
import { type GlobalOptions } from "../cli.js";
import {
  FileStore,
  getApi,
  getApiUrl,
  getProject,
  getEnvironmentId,
  logger,
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
          throw new Error("creating projects in the cli isn't implemented yet");

          const { name, store, apiUrl: apiUrlArg, providerUrl } = argv;
          const fileStore = new FileStore(store as string);
          const privateKey = normalizePrivateKey(argv.privateKey);
          const wallet = await getWalletWithProvider({
            privateKey,
            chain,
            providerUrl,
          });

          const apiUrl = getApiUrl({ apiUrl: apiUrlArg as string, store: fileStore})
          const api = getApi(fileStore, apiUrl);
          const projectId = getProject({
            ...argv,
            store: fileStore
          });

          if (typeof name !== "string") {
            throw new Error("must provide table name");
          }
          if (typeof projectId !== "string") {
            throw new Error("must provide project for deployment");
          }

          const environmentId = await getEnvironmentId(projectId);

          // lookup table data from project and name
          const table = await api.tables.tableByProjectIdAndSlug.query({
            projectId,
            slug: name,
          });

          if (!(table && table.name && table.schema)) {
            throw new Error("could not get table to deploy within project");
          }

          // TODO: setup a "ping" endpoint in the api so we can be sure the api is responding before
          //       the deployment is created

          // TODO: setup readline interface to let the user
          //       confirm they want to deploy their tables

          const db = new Database({
            signer: wallet,
            baseUrl: helpers.getBaseUrl(chainId),
            autoWait: true,
          });

          const stmt = generateCreateTableStatement(table.name, table.schema);
          const res = await db.exec(stmt);
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
          const evmReceipt = await waitForTransaction({
            hash: txn.transactionHash as `0x${string}`,
          });
          if (evmReceipt.status === "reverted") {
            throw new Error("Transaction reverted");
          }

          const result = await api.deployments.recordDeployment.mutate({
            environmentId,
            tableName: txn.name,
            chainId: txn.chainId,
            tableId: txn.tableId,
            createdAt: new Date(),
            blockNumber: txn.blockNumber,
            txnHash: txn.transactionHash,
          });

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
