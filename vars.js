#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const argv = require("minimist")(process.argv.slice(2), {boolean: ["hide_logs"]});
// console.log(argv);
const DEFAULT_CONFIG_FOLDER_PATH = "./npmrc-config.json";
const DEFAULT_OUTPUT_FOLDER_PATH = "./";
const DEFAULT_ORGANISATIONS = function() {
  try {
    return JSON.parse(argv.organisations);
  } catch {
    return undefined;
  }
}();

const configFolderResolved = path.resolve(process.cwd() + "/", argv.config_folder_path || DEFAULT_CONFIG_FOLDER_PATH);
const distFolderResolved = path.resolve(process.cwd() + "/", argv.output_path || DEFAULT_OUTPUT_FOLDER_PATH);

function readJSON(p) {
  try {
    const rawdata = fs.readFileSync(p);
    const output = JSON.parse(rawdata);
    return output;
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
  email: "npm requires email to be set but doesn't use the value",
  organisations: DEFAULT_ORGANISATIONS
};
const ENV = Object.assign({}, DEFAULTS, argv, config);

module.exports = ENV; 