import { loadConfig, loadToken } from "./config";
import { runLoop } from "./runner";

// Load config
const config = loadConfig();

// Load Cloudflare API token from environment
const token = loadToken();

// Start the monitoring loop
runLoop(token, config.domains, config.interval ?? 60000);
