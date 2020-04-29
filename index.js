#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const { NPMRC_NAME, ORGANISATION, TOKEN_LIST } = process.env;

// "username:password@name,username2:password2@name2";

const outputFile = NPMRC_NAME || ".npmrc";
const outputPath = "./"; // maybe allow different path in future
const distFolder = path.resolve(process.cwd() + "/", outputPath);

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
  return `${name ? name + ":" : ""}registry=${url}
always-auth=true
; Treat this auth token like a password. Do not share it with anyone, including Microsoft support.
; begin auth token
//pkgs.dev.azure.com/transforming-systems/_packaging/validation/npm/registry/:username=${username}
//pkgs.dev.azure.com/transforming-systems/_packaging/validation/npm/registry/:_password=${password}
//pkgs.dev.azure.com/transforming-systems/_packaging/validation/npm/registry/:email=npm requires email to be set but doesn't use the value
//pkgs.dev.azure.com/transforming-systems/_packaging/validation/npm/:username=${username}
//pkgs.dev.azure.com/transforming-systems/_packaging/validation/npm/:_password=${password}
//pkgs.dev.azure.com/transforming-systems/_packaging/validation/npm/:email=npm requires email to be set but doesn't use the value
; end auth token

`;
}

function generateURL(organisation, username) {
  // TODO regex not just for azure
  return `https://pkgs.dev.azure.com/${organisation}/_packaging/${username}/npm/registry/`;
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