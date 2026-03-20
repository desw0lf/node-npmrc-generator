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

function generateTokenString(url, name, username, password, email, alwaysAuth) {
  return `${name ? name + ":" : ""}registry=https:${url}registry/
${alwaysAuth ? "always-auth=true\n" : ""}; Treat this auth token like a password. Do not share it with anyone, including Microsoft support.
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

function generateURL(organisation, username, url_template) {
  return url_template
    .replace(/\$organisation/g, organisation)
    .replace(/\$username/g, username);
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
          password: a.password !== undefined ? a.password : org.password,
          name: a.name,
          organisation: org.organisation,
          email: a.email !== undefined ? a.email : org.email,
          always_auth: a.always_auth !== undefined ? a.always_auth : org.always_auth,
          url_template: a.url_template !== undefined ? a.url_template : org.url_template
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
    const email = c.email !== undefined ? c.email : ENV.email;
    const always_auth = c.always_auth !== undefined ? c.always_auth : ENV.always_auth;
    const url_template = c.url_template !== undefined ? c.url_template : ENV.url_template;
    content += generateTokenString(generateURL(c.organisation, c.username, url_template), c.name, c.username, c.password, email, always_auth);
  }
  writeFile(content, ENV.dist_folder, ENV.npmrc_name);
}

init();