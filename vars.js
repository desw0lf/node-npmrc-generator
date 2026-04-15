#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const argv = require("minimist")(process.argv.slice(2), { boolean: ["hide_logs", "always_auth"] });

function safeParseJson(str, defaultValue = undefined) {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

const DEFAULT_CONFIG_FOLDER_PATH = "./npmrc-config.json";
const DEFAULT_OUTPUT_FOLDER_PATH = "./";
const DEFAULT_ORGANISATIONS = safeParseJson(argv.organisations);

const configFolderResolved = path.resolve(process.cwd() + "/", argv.config_folder_path || DEFAULT_CONFIG_FOLDER_PATH);
const distFolderResolved = path.resolve(process.cwd() + "/", argv.output_path || DEFAULT_OUTPUT_FOLDER_PATH);

function readJSON(p) {
  try {
    const rawdata = fs.readFileSync(p);
    return safeParseJson(rawdata, {});
  } catch (err) {
    if (err.code === "ENOENT") {
      console.warn(`Can't find '${path.basename(err.path)}' file`);
    }
    return {};
  }
}

const config = readJSON(configFolderResolved);

const DEFAULTS = {
  hide_logs: false,
  npmrc_name: ".npmrc",
  output_path: DEFAULT_OUTPUT_FOLDER_PATH,
  config_folder_path: DEFAULT_CONFIG_FOLDER_PATH,
  dist_folder: distFolderResolved,
  email: process.env.EMAIL || "noop", // npm requires email to be set but doesn't use the value
  always_auth: false,
  url_template: "//pkgs.dev.azure.com/$organisation/_packaging/$username/npm/",
  organisations: DEFAULT_ORGANISATIONS
};
const ENV = Object.assign({}, DEFAULTS, config, argv);

module.exports = ENV; 