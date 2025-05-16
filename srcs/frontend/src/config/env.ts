/* 
 * Using 'import.meta.env' instead of 'process.env' because:
 * - 'import.meta.env' reads variables from a `.env` file at build time (only variables prefixed with `VITE_`).
 * - Ensure all environment variables you want to use in the frontend start with `VITE_`.
 * - 'process.env' is only available in Node.js and requires installing 'dotenv' for loading `.env` files.
 * - 'process.env' does NOT work in Vite because it runs in the browser.
 */
const envConfig = {
    privateKey: import.meta.env.VITE_PRIVATE_KEY,
};

export default envConfig;
