const [_node, _script, ref, sha] = process.argv;
const version = require("./package.json").version;
const info = `
VERSION="${version}"
BUILD="${sha}"
REF="${ref}"
RELEASED="${String(new Date())}"
SENTRY_DSN="${process.env.SENTRY_DSN}"
`;
console.log(info);
