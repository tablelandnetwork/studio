import type { Arguments } from "yargs";
// Yargs doesn't seem to export the type of `yargs`.  This causes a conflict
// between linting and building. Lint complains that yargs is only imported
// for it's type, and build complains that you cannot use namespace as a type.
// Solving this by disabling lint here.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import yargs from "yargs";
import { type GlobalOptions } from "../cli.js";
import {
  ERROR_INVALID_STORE_PATH,
  FileStore,
  helpers,
  logger,
} from "../utils.js";

type Yargs = typeof yargs;

export const command = "org <sub>";
export const desc = "manage studio orgs";

export interface CommandOptions extends GlobalOptions {
  name?: string;
  address?: string;
  orgId?: string;
  invites?: string;
}

export const builder = function (args: Yargs) {
  return args
    .command(
      "ls [public key]",
      "Get a list of your orgs, or the orgs for a public key address",
      function (args) {
        return args.positional("address", {
          type: "string",
          description:
            "Optional filter by user based on public key. If not provided the current user's session is used",
        });
      },
      async function (argv) {
        try {
          const { address } = argv;
          const store = helpers.getStringValue(
            argv.store,
            ERROR_INVALID_STORE_PATH,
          );

          const fileStore = new FileStore(store);
          const apiUrl = helpers.getApiUrl({
            apiUrl: argv.apiUrl,
            store: fileStore,
          });
          const api = helpers.getApi(fileStore, apiUrl);

          if (typeof address === "string" && address.trim() !== "") {
            // if address exists we will query based on address
            const orgs = await api.orgs.userOrgsFromAddress.query({
              userAddress: address.trim(),
            });

            const pretty = JSON.stringify(orgs, null, 4);
            return logger.log(pretty);
          }

          const orgs = await api.orgs.userOrgs.query();
          const pretty = JSON.stringify(orgs, null, 4);

          logger.log(pretty);
        } catch (err) {
          logger.error(err);
        }
      },
    )
    .command(
      "create <name>",
      "create a org with the given name",
      function (args) {
        return args
          .positional("name", {
            type: "string",
            description:
              "optional org name, if not provided all orgs are returned",
          })
          .option("invites", {
            type: "string",
            default: "",
            description:
              "comma separated list of emails to be invited to the org",
          }) as yargs.Argv<CommandOptions>;
      },
      async function (argv: CommandOptions) {
        const { invites } = argv;
        const name = helpers.getStringValue(argv.name, "must provide org name");
        const store = helpers.getStringValue(
          argv.store,
          ERROR_INVALID_STORE_PATH,
        );

        const fileStore = new FileStore(store);
        const apiUrl = helpers.getApiUrl({
          apiUrl: argv.apiUrl,
          store: fileStore,
        });
        const api = helpers.getApi(fileStore, apiUrl);

        const result = await api.orgs.newOrg.mutate({
          name,
          emailInvites: (invites ?? "")
            .split(",")
            .map((email) => email.trim())
            .filter((i) => i),
        });

        logger.log(JSON.stringify(result));
      },
    )
    .command(
      "invite <emails>",
      "invite a list of emails to a org. org id must either be a command option or available in the context.",
      function (args) {
        return args
          .positional("emails", {
            type: "string",
            description: "comma separated list of emails to be invited to org",
          })
          .option("orgId", {
            type: "string",
            description: "id of org to add to",
          });
      },
      async function (argv) {
        const emails = helpers.getStringValue(
          argv.emails,
          "must provide emails",
        );
        const store = helpers.getStringValue(
          argv.store,
          ERROR_INVALID_STORE_PATH,
        );

        const emailInvites = emails
          .split(",")
          .map((email) => email.trim())
          .filter((i) => i);

        if (emails.length < 1) {
          throw new Error("you must provide at least one email");
        }

        const fileStore = new FileStore(store);
        const org = helpers.getStringValue(
          helpers.getOrg({ orgId: argv.orgId, store: fileStore }),
          "must provide orgId as arg or context",
        );

        const apiUrl = helpers.getApiUrl({
          apiUrl: argv.apiUrl,
          store: fileStore,
        });
        const api = helpers.getApi(fileStore, apiUrl);

        // check if the email address is already invited and resend; else,
        // invite the email address (to avoid SQLite constraint error)
        const { invites } = await api.invites.invitesForOrg.query({
          orgId: org,
        });
        const pendingEmails = invites
          .filter((i) => i.invite.claimedAt == null)
          .map((i) => i.invite.email);
        if (pendingEmails.length > 0) {
          for (const i of invites) {
            await api.invites.resendInvite.mutate({
              orgId: org,
              inviteId: i.invite.id,
            });
          }
        }
        const newEmails = emailInvites.filter(
          (addr: any) => !pendingEmails.includes(addr),
        );
        if (newEmails.length > 0) {
          await api.invites.inviteEmails.mutate({
            orgId: org,
            emails: newEmails,
          });
        }

        logger.log(JSON.stringify({ emails: emailInvites, orgId: org }));
      },
    );
};

/* c8 ignore next 3 */
export const handler = async (
  argv: Arguments<CommandOptions>,
): Promise<void> => {
  // (args: ArgumentsCamelCase<Omit<{ name: string; }, "name"> & { name: string | undefined; } & { personalOrgId: string; } & { invites: string; } & { org: string | undefined; } & { user: string | undefined; }>) => void
  // noop
};
