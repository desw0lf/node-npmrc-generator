#!/usr/bin/env node
const fs = require("fs");
const path = require("path");


let { ORGANISATION, TOKEN_LIST } = process.env;
const { NPMRC_NAME, OUTPUT_PATH } = process.env;
const { npm_package_npmrcConfig_npmrcName, npm_package_npmrcConfig_organisation, npm_package_npmrcConfig_tokenList, npm_package_npmrcConfig_outputPath } = process.env;

if (!ORGANISATION) {
  ORGANISATION = npm_package_npmrcConfig_organisation;
}
if (!TOKEN_LIST) {
  TOKEN_LIST = npm_package_npmrcConfig_tokenList;
}

const outputFile = NPMRC_NAME || npm_package_npmrcConfig_npmrcName || ".npmrc";
const outputPath = OUTPUT_PATH || npm_package_npmrcConfig_outputPath || "./"; 
const distFolder = path.resolve(process.cwd() + "/", outputPath);
const EMAIL = "npm requires email to be set but doesn't use the value"; // maybe will be required in future

function writeFile(content, path, name) {
  fs.writeFile(path + "/" + name, content, function(err) {
    if (err) {
      throw err;
    } else {
      console.log(name + " was saved!");
    }
  });
}

function generateTokenString(url, name, username, password) {
  return `${name ? name + ":" : ""}registry=https:${url}registry/
always-auth=true
; Treat this auth token like a password. Do not share it with anyone, including Microsoft support.
; begin auth token
${url}registry/:username=${username}
${url}registry/:_password=${password}
${url}registry/:email=${EMAIL}
${url}:username=${username}
${url}:_password=${password}
${url}:email=${EMAIL}
; end auth token

`;
}

function generateURL(organisation, username) {
  // TODO regex not just for azure
  return `//pkgs.dev.azure.com/${organisation}/_packaging/${username}/npm/`;
}

function generateCredentials() {
  const tokens = TOKEN_LIST.split(",");
  let list = [];
  for (let i = 0; i < tokens.length; i += 1) {
    try {
      const credentials = tokens[i].split(/:|@/);
      if (credentials.length !== 3) {
        throw new Error("Wrong format");
      }
      const username = credentials[0];
      const password = credentials[1];
      const name = "@" + credentials[2];
      list.push({
        username: username,
        password: password,
        name: name
      })
    } catch (e) {
      throw new Error("Wrong format");
    }
  }
  return list;
}

function init() {
  if (!ORGANISATION || !TOKEN_LIST) {
    throw new Error("You must provide the following required ENV variables: [ORGANISATION, TOKEN_LIST]");
  }
  const credentials = generateCredentials();
  let content = "";
  for (let i = 0; i < credentials.length; i += 1) {
    const c = credentials[i];
    content += generateTokenString(generateURL(ORGANISATION, c.username), c.name, c.username, c.password);
  }
  writeFile(content, distFolder, outputFile);
}

init();