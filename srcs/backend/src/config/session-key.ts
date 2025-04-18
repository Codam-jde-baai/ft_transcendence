import { readFileSync } from 'fs';

const sessionKey = readFileSync('cookie-key/secret-key');

console.log("sessoin key length: ", sessionKey.length)

export default sessionKey;
