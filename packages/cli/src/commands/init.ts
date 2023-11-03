import fs from "fs";
import { resolve, dirname } from "path";
import {
  type WriteStream,
  createWriteStream,
  mkdirSync,
  writeFileSync,
} from "fs";
import type yargs from "yargs";
import type { Arguments, CommandBuilder } from "yargs";
import yaml from "js-yaml";
import { ask, logger } from "../utils.js";
import { type GlobalOptions } from "../cli.js";

type Yargs = typeof yargs;

export interface CommandOptions extends GlobalOptions {
  yes?: boolean;
  path?: string;
}

const defaults = {
  chain: "maticmum",
  rpcRelay: false,
};
// note: abnormal spacing is needed to ensure help message is formatted correctly
export const command = "init";
export const desc = "create a tablelandrc config file";

export const builder = (yargs: Yargs) => {
  return yargs
    .command(
      command,
      desc,
      function (args) {
        return args.option("yes", {
          type: "boolean",
          description: "Skip the interactive prompts and use default values",
          default: false,
        })
        .option("path", {
          type: "string",
          description: "The path at which to create the config file",
          default: ""
        }) as yargs.Argv<CommandOptions>;
      },
      async function (argv: CommandOptions) {
        try {
          const { yes } = argv;
          const answers = yes ? questions.map(q => q.default) : await ask(questions.map(q => q.message));

          const fileJson: { privateKey?: string; providerUrl?: string; } = {};
          if (answers[0]) fileJson.privateKey = answers[0];
          if (answers[1]) fileJson.providerUrl = answers[1];

          const configFilePath = answers[2];
          if (typeof configFilePath !== "string") throw new Error("invalid config file path");

          const fileString = JSON.stringify(fileJson, null, 4);
          fs.writeFileSync(configFilePath, fileString);

          logger.log(`Config created at ${configFilePath}`);
        } catch (err: any) {
          logger.error(err);
        }
      }
    )
};

const questions = [
  {
    name: "privateKey",
    message: "Enter your private key (optional). If provided this will be stored in your `.tablelandrc.json` file ",
    default: undefined
  },
  {
    name: "providerUrl",
    message: "Enter a default blockchain provider URL (optional) ",
    default: undefined
  },
  {
    name: "path",
    message: "Enter path to store your `.tablelandrc.json` config file (default is `cwd`) ",
    default: resolve(`.tablelandrc.json`)
  }
];

/* c8 ignore next 3 */
export const handler = async (
  argv: Arguments<CommandOptions>,
): Promise<void> => {
  //(args: Arguments<CommandOptions>) => void | Promise<void>
  // noop
};
