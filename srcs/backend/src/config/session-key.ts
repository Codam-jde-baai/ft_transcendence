import { readFileSync } from 'fs';

const sessionKey = readFileSync('cookie-key/secret-key');

export default sessionKey;
