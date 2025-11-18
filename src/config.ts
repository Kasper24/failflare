import fs from "fs";
import path from "path";
import YAML from "yaml";
import envPaths from "env-paths";

export type DomainConfig = {
  domain: string;
  on_cloudflare_down?: { set?: Record<string, any> };
  on_cloudflare_up?: { set?: Record<string, any> };
  records?: {
    name: string;
    type: string;
    on_cloudflare_down?: { set?: Record<string, any> };
    on_cloudflare_up?: { set?: Record<string, any> };
  }[];
};

export type Config = {
  interval?: number;
  domains: DomainConfig[];
};

// Load a single YAML file
const loadYamlFile = (filePath: string): any | null => {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf8");
  return YAML.parse(content);
};

// Merge configs (later overrides earlier)
const mergeConfigs = (configs: any[]): any =>
  configs.filter(Boolean).reduce((acc, cfg) => ({ ...acc, ...cfg }), {});

// Load config from system/user/current dir
export const loadConfig = (): Config => {
  const paths = [];

  // system-level (platform-dependent)
  if (process.platform === "win32") {
    const programData = process.env.PROGRAMDATA || "C:\\ProgramData";
    paths.push(path.join(programData, "failflare", "config.yaml"));
  } else if (process.platform === "darwin") {
    paths.push("/Library/Application Support/failflare/config.yaml");
  } else {
    paths.push("/etc/failflare/config.yaml");
  }

  // user-level (cross-platform using env-paths)
  const userConfigDir = envPaths("failflare").config;
  paths.push(path.join(userConfigDir, "config.yaml"));

  // current directory (highest priority)
  paths.push(path.join(process.cwd(), "config.yaml"));

  const loadedConfigs = paths.map(loadYamlFile);
  const finalConfig = mergeConfigs(loadedConfigs);

  if (!finalConfig.domains || !Array.isArray(finalConfig.domains)) {
    throw new Error("Invalid config: 'domains' must be defined as an array");
  }

  return finalConfig as Config;
};

// Load CF token from env
export const loadToken = (): string => {
  const token = process.env.CF_TOKEN;
  if (!token) throw new Error("CF_TOKEN environment variable is required");
  return token;
};
