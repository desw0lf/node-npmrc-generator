#!/usr/bin/env node
const fs = require("fs");
const ENV = require("./vars.js");

function ECHO(...str) {
  if (ENV.hide_logs) return;
  console.log(...str);
}

function writeFile(content, path, name) {
  fs.writeFile(path + "/" + name, content, function(err) {
    if (err) throw err;
    console.log("=== " + name + " WAS SAVED! ===");
  });
}

function generateTokenString(url, name, username, password, email, alwaysAuth) {
  return `${name ? name + ":" : ""}registry=https:${url}registry/
${alwaysAuth ? "always-auth=true\n" : ""}; Treat this auth token like a password. Do not share it with anyone.
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
  return url_template.replace(/\$organisation/g, organisation).replace(/\$username/g, username);
}

function generateCredentials() {
  const orgs = ENV.organisations;
  let list = [];
  for (let i = 0; i < orgs.length; i += 1) {
    try {
      const org = orgs[i];
      if (!Array.isArray(org.token_list)) {
        throw new Error("'token_list' field not present or array");
      }
      const l = org.token_list;
      for (let j = 0; j < l.length; j += 1) {
        const a = l[j];
        list.push({
          username: a.username ?? org.username ?? ENV.username,
          password: a.password ?? org.password ?? ENV.password,
          name: a.name ?? org.name ?? ENV.name,
          organisation: org.organisation,
          email: a.email ?? org.email ?? ENV.email,
          always_auth: a.always_auth ?? org.always_auth ?? ENV.always_auth,
          url_template: a.url_template ?? org.url_template ?? ENV.url_template
        });
      }
    } catch (e) {
      throw new Error(`Wrong format: ${e.message}`);
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
  ECHO(ENV.npmrc_name + " list:");
  let content = "";
  for (let i = 0; i < credentials.length; i += 1) {
    const c = credentials[i];
    ECHO({ ...c, password: "********" });
    content += generateTokenString(generateURL(c.organisation, c.username, c.url_template), c.name, c.username, c.password, c.email, c.always_auth);
  }
  writeFile(content, ENV.dist_folder, ENV.npmrc_name);
}

init();