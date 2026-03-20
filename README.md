## Install

Install with [npm](https://www.npmjs.com/):

```sh
npm install node-npmrc-generator --save-dev
```

## Required params

| Attribute | Description |
| --- | --- |
| `organisations` | Organisation name for the azure repository url |

.e.g. `[{'organisation':'organisation-name','token_list':[{'username':'username2','password':'password2','name':'@packagename2'}]`
| `TOKEN_LIST` | Comma separated list of tokens in `username:password@packagename` format |

## Optional params

| Attribute | Default | Description |
| --- | --- | --- |
| `--npmrc_name` | `.npmrc` | Name of the output file |
| `--output_path` | `./` | Output path, default to current directory |
| `--config_folder_path` | `./npmrc-config.json` | Config file path, can be used instead of params |

## Usage (unix)
`node-npmrc-generator --organisations=\[{\"organisation\":\"organisation-name\"\,\"token_list\":\[{\"username\":\"username2\"\,\"password\":\"password2\"\,\"name\":\"@packagename2\"}\]}\]`

## Usage as preinstall script (unix)
`npm install node-npmrc-generator@latest -g --prefix ./vendor/node_modules && node ./vendor/node_modules/lib/node_modules/node-npmrc-generator/index.js`

Best to use `./npmrc-config.json` file.

## Example config file (npmrc-config.json):
```
{
  "npmrc_name": ".npmrc",
  "organisations": [
    {
      "organisation": "organisation-name",
      "token_list": [
        {
          "username": "username2",
          "password": "password2",
          "name": "@packagename2"
        }
      ]
    }
  ]
}
```


## Change log
- 2.0.0 - Remove `npmrcConfig`, add POSIX params and `npmrc-config.json` file for config
- 1.0.4 - Ability to add ENV variables as `npmrcConfig` in package.json 
- 1.0.3 - Added OUTPUT_PATH as new param
- 1.0.2 - Fix urls
- 1.0.1 - Readme updated
- 1.0.0 - Initial release