## Install

Install with [npm](https://www.npmjs.com/):

```sh
npm install node-npmrc-generator --save-dev
```
or preinstall script
```sh
npx --yes node-npmrc-generator@latest
```

## Required params

| Attribute | Description |
| --- | --- |
| `organisations` | Array of organisation configs (see below) |

## Optional params

| Attribute | Default | Description |
| --- | --- | --- |
| `--npmrc_name` | `.npmrc` | Name of the output file |
| `--output_path` | `./` | Output path, defaults to current directory |
| `--config_folder_path` | `./npmrc-config.json` | Config file path |
| `--email` | `process.env.EMAIL` | Email written into the .npmrc auth block |
| `--always_auth` | `false` | Emit `always-auth=true` in the .npmrc |
| `--url_template` | `//pkgs.dev.azure.com/$organisation/_packaging/$username/npm/` | Registry URL template. Use `$organisation` and `$username` as placeholders |
| `--settings` | `{}` | Key-value pairs written as prefix lines in the .npmrc. Arrays are expanded to one line per item using the same key. (e.g. `{"engine-strict":true,"exclude":["a","b"]}`) |

## Precedence

Each of `email`, `always_auth`, `url_template`, and `password` can be set at multiple levels. The most specific value wins:

**token item** > **organisation** > **global config / CLI arg / ENV**

## Example config file (npmrc-config.json)

```json
{
  "npmrc_name": ".npmrc",
  "email": "team@example.com",
  "always_auth": false,
  "url_template": "//pkgs.dev.azure.com/$organisation/_packaging/$username/npm/",
  "settings": {
    "engine-strict": true,
    "min-release-age": 7,
    "minimum-release-age-exclude[]": ["@scope/package1", "package2"]
  },
  "organisations": [
    {
      "organisation": "my-org",
      "password": "shared-token",
      "token_list": [
        {
          "username": "user1",
          "name": "@scope/package1"
        },
        {
          "username": "user2",
          "name": "@scope/package2",
          "password": "override-token",
          "email": "user2@example.com",
          "always_auth": true,
          "url_template": "//myprivate.registry.io/$organisation/$username/npm/"
        }
      ]
    }
  ]
}
```

## Usage
`npx --yes node-npmrc-generator@latest --organisations=\[{"organisation":"organisation-name"\,"token_list":\[{"username":"username2"\,"password":"password2"\,"name":"@packagename2"}\]\]}`

With settings via CLI:
`npx --yes node-npmrc-generator@latest --settings={"engine-strict":true,"min-release-age":7}`

## Usage as preinstall script
`npx --yes node-npmrc-generator@latest`

Best to use `./npmrc-config.json` file.

## Change log
- 3.1.0 - Add `settings` for prefix key-value lines in .npmrc, available via config file and CLI (`--settings`)
- 3.0.0 - Add `email`, `always_auth`, `url_template` and org-level `password`; all settable globally, per-org, or per token item
- 2.0.1 - Remove `npmrcConfig`, add POSIX params and `npmrc-config.json` file for config
- 1.0.4 - Ability to add ENV variables as `npmrcConfig` in package.json
- 1.0.3 - Added OUTPUT_PATH as new param
- 1.0.2 - Fix urls
- 1.0.1 - Readme updated
- 1.0.0 - Initial release
