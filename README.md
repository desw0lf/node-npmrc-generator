## Install

Install with [npm](https://www.npmjs.com/):

```sh
npm install node-npmrc-generator --save-dev
```

## Required params

| Attribute | Description |
| --- | --- |
| `ORGANISATION` | Organisation name for the azure repository url |
| `TOKEN_LIST` | Comma separated list of tokens in `username:password@packagename` format |

## Optional params

| Attribute | Default | Description |
| --- | --- | --- |
| `NPMRC_NAME` | `.npmrc` | Name of the output file |

## Usage
`BUCKET=BUCKET_NAME KEY=KEY SECRET=SECRET node-npmrc-generator`

## Change log
- 1.0.0 - Initial release