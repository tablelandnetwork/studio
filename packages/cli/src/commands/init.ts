import fs from "fs";
import { dirname, resolve, sep, isAbsolute } from "path";
import type { Arguments } from "yargs";
import { helpers, logger } from "../utils.js";
import { type GlobalOptions } from "../cli.js";

// note: abnormal spacing is needed to ensure help message is formatted correctly
export const command = "init";
export const desc = "create a tablelandrc config file";

export interface CommandOptions extends GlobalOptions {
  yes?: boolean;
  path?: string;
}

export const builder = {
  yes: {
    default: false,
    description: "use default values for all prompts",
    type: "boolean",
  },
  path: {
    type: "string",
    default: "",
    description: "path to create session store file",
  },
  // best practices using Yargs with typescript is not obvious. need to cast to
  // const so that the type isn't widened, specifically the "type" property
} as const;

export const handler = async (
  argv: Arguments<GlobalOptions>,
): Promise<void> => {
  try {
    const { yes } = argv;
    const answers = yes
      ? questions.map((q) => q.default)
      : await helpers.ask(questions.map((q) => q.message));

    const fileJson: {
      privateKey?: string;
      providerUrl?: string;
      chain?: string;
    } = {};
    if (answers[0]) fileJson.privateKey = answers[0];
    if (answers[1]) fileJson.providerUrl = answers[1];
    if (answers[2]) fileJson.chain = answers[2];

    const configFilePath = getFullConfigPath(answers[3]);
    if (typeof configFilePath !== "string") {
      throw new Error("invalid config file path");
    }

    const fileString = JSON.stringify(fileJson, null, 4);
    fs.writeFileSync(configFilePath, fileString);

    logger.log(`Config created at ${configFilePath}`);
  } catch (err: any) {
    logger.error(err);
  }
};

const defaultSessionFileName = ".tablelandrc.json";
const defaultSessionFilePath = dirname(resolve(defaultSessionFileName));
const questions = [
  {
    name: "privateKey",
    message:
      "Enter your private key (optional). If provided this will be stored in your `.tablelandrc.json` file ",
    default: undefined,
  },
  {
    name: "providerUrl",
    message: "Enter a default blockchain provider URL (optional) ",
    default: undefined,
  },
  {
    name: "chain",
    message: "Enter a default chain (optional) ",
    default: undefined,
  },
  {
    name: "path",
    message:
      "Enter path to store your `.tablelandrc.json` config file (default is `cwd`) ",
    default: defaultSessionFilePath,
  },
];

const getFullConfigPath = function (filepath?: string) {
  if (typeof filepath !== "string" || filepath.trim() === "") {
    return resolve(defaultSessionFilePath, defaultSessionFileName);
  }

  const filename = filepath.trim().endsWith(".json")
    ? filepath.split(sep).pop()
    : defaultSessionFileName;
  if (typeof filename !== "string") throw new Error("invalid file path");
  const dirpath = filepath.trim().endsWith(".json")
    ? dirname(filepath)
    : filepath;

  return isAbsolute(dirpath)
    ? resolve(dirpath, filename)
    : resolve(process.cwd(), dirpath, filename);
};
