import { join } from "node:path";
import { createInterface } from "node:readline/promises";
import openloginUtils from "@toruslabs/openlogin-utils";
import type yargs from "yargs";
import type { Arguments, CommandBuilder } from "yargs";
import { type GlobalOptions } from "../cli.js";
import { OpenLogin, LoginOptions } from "../open-login.js";
import { logger } from "../utils.js";

// TODO: recovering the web3auth wallet still doesn't work because the `@toruslabs/broadcast-channel`
//       module isn't getting the message from https://broadcast-server.tor.us when the user confirms
//       their login via email.  Pausing on working out how to get this going, so I can investigate
//       the Particle Network

const {
  OPENLOGIN_NETWORK,
  // @ts-ignore
  OPENLOGIN_NETWORK_TYPE
} = openloginUtils;

export interface CommandOptions extends GlobalOptions {
  url?: string;
  network?: string;
  store?: string;
}

export const command = "login";
export const desc = "create a login session via Open Login";

export const builder: CommandBuilder<Record<string, unknown>, CommandOptions> = (
  yargs
) =>
  yargs
    .option("url", {
      type: "string",
      description: "specific url for Open Login",
    })
    .option("network", {
      type: "string",
      default: OPENLOGIN_NETWORK.TESTNET,
      description: "network open login should use",
    })
    .option("store", {
      description: "path to file store to use for login session",
    }) as yargs.Argv<CommandOptions>;

export const handler = async (argv: Arguments<CommandOptions>): Promise<void> => {

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  logger.log("logging in via passwordless email");

  const email = await rl.question("email address: ");

  const options: LoginOptions = {
    storePath: argv.store ?? join(process.cwd(), "studio-cli-session-store"),
    // @ts-ignore
    network: argv.network as OPENLOGIN_NETWORK_TYPE,
    clientId: "BKUFrAxFsYPsF63ysXJ2EzCGo4kvLh7N3gPUQpc16eI3vAmTGncL9siwsB9wQ8RmMZycezTNxAzVp4jqxNEcnPY"// process.env.OPENLOGIN_CLIENT_ID as string
  };

  if (argv.url) options.sdkUrl = argv.url;

  const openLogin = new OpenLogin(options);

  await openLogin.init();

  if (openLogin.privKey) {
    return logger.log("you are already logged in, you can logout with the logout command");
  }

  openLogin.login({
    loginProvider: "email_passwordless"
    //getWalletKey: true
  }, email);
};
