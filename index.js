#!/usr/bin/env node
const fs = require("fs");
// const path = require("path");
const ENV = require("./vars.js");

function ECHO(...str) {
  if (ENV.hide_logs) {
    return;
  }
  console.log(...str);
}

// let { ORGANISATION, TOKEN_LIST } = process.env;
// const { NPMRC_NAME, OUTPUT_PATH } = process.env;
// const { npm_package_npmrcConfig_npmrcName, npm_package_npmrcConfig_organisation, npm_package_npmrcConfig_tokenList, npm_package_npmrcConfig_outputPath } = process.env;

// if (!ORGANISATION) {
//   ORGANISATION = npm_package_npmrcConfig_organisation;
// }
// if (!TOKEN_LIST) {
//   TOKEN_LIST = npm_package_npmrcConfig_tokenList;
// }

// const outputFile = NPMRC_NAME || npm_package_npmrcConfig_npmrcName || ".npmrc";
// const outputPath = OUTPUT_PATH || npm_package_npmrcConfig_outputPath || "./"; 
// const distFolder = path.resolve(process.cwd() + "/", outputPath);
// const EMAIL = "npm requires email to be set but doesn't use the value"; // maybe will be required in future

function writeFile(content, path, name) {
  fs.writeFile(path + "/" + name, content, function(err) {
    if (err) {
      throw err;
    } else {
      console.log("=== " + name + " WAS SAVED! ===");
    }
  });
}

function generateTokenString(url, name, username, password, email) {
  return `${name ? name + ":" : ""}registry=https:${url}registry/
always-auth=true
; Treat this auth token like a password. Do not share it with anyone, including Microsoft support.
; begin auth token
${url}registry/:username=${username}
${url}registry/:_password=${password}
${url}registry/:email=${email}
${url}:username=${username}
${url}:_password=${password}
${url}:email=${email}
; end auth token

`;
}

function generateURL(organisation, username) {
  // TODO regex not just for azure
  return `//pkgs.dev.azure.com/${organisation}/_packaging/${username}/npm/`;
}

function generateCredentials() {
  const orgs = ENV.organisations;
  let list = [];
  for (let i = 0; i < orgs.length; i += 1) {
    try {
      const org = orgs[i];
      if (typeof org.organisation !== "string") {
        throw new Error("'organisation' field not present");
      }
      if (!Array.isArray(org.token_list)) {
        throw new Error("'token_list' field not present or array");
      }
      const l = org.token_list;
      for (let j = 0; j < l.length; j += 1) {
        const a = l[j];
        list.push({
          username: a.username,
          password: a.password,
          name: a.name,
          organisation: org.organisation
        });
      }
    } catch (e) {
      throw new Error("Wrong format");
    }
  }
  return list;
}

function isConfigValid() {
  if (!ENV.organisations || !Array.isArray(ENV.organisations) || ENV.organisations.length === 0) {
    throw new Error("You must provide the following required options: organisations");
  }
}

function init() {
  isConfigValid();
  const credentials = generateCredentials();
  ECHO(ENV.npmrc_name + " list:", credentials);
  let content = "";
  for (let i = 0; i < credentials.length; i += 1) {
    const c = credentials[i];
    content += generateTokenString(generateURL(c.organisation, c.username), c.name, c.username, c.password, ENV.email);
  }
  writeFile(content, ENV.dist_folder, ENV.npmrc_name);
}

init();