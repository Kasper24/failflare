import { DomainConfig } from "./config.js";
import { sleep } from "./utils.js";
import {
  getZoneId,
  getRecord,
  patchZoneSettings,
  patchRecord,
} from "./cloudflare.js";

// Track last global state
let lastCloudflareUp: boolean | null = null;

// Check Cloudflare global status via status page
export const isCloudflareUp = async (): Promise<boolean> => {
  try {
    const res = await fetch(
      "https://www.cloudflarestatus.com/api/v2/status.json"
    );
    const data = await res.json();
    return data.status?.indicator !== "major";
  } catch {
    return false;
  }
};

// Apply actions for all domains
export const applyActionsForDomains = async (
  token: string,
  domains: DomainConfig[],
  cloudflareUp: boolean
) => {
  for (const domain of domains) {
    const zoneId = await getZoneId(token, domain.domain);
    if (!zoneId) {
      console.error(`Zone not found: ${domain.domain}`);
      continue;
    }

    // Decide which actions to apply
    const actions = cloudflareUp
      ? domain.on_cloudflare_up
      : domain.on_cloudflare_down;

    // Apply zone-level actions
    if (actions) await patchZoneSettings(token, zoneId, actions);

    // Apply record-level actions
    if (!domain.records) continue;

    for (const rec of domain.records) {
      const record = await getRecord(token, zoneId, rec.name, rec.type);
      if (!record) continue;

      const recActions = cloudflareUp
        ? rec.on_cloudflare_up
        : rec.on_cloudflare_down;
      if (recActions) await patchRecord(token, zoneId, record.id, recActions);
    }
  }
};

// Main loop
export const runLoop = async (
  token: string,
  domains: DomainConfig[],
  interval = 60000
) => {
  while (true) {
    const cloudflareUp = await isCloudflareUp();

    if (lastCloudflareUp === null) {
      console.log(`[Init] Cloudflare is ${cloudflareUp ? "UP" : "DOWN"}`);
    } else if (cloudflareUp !== lastCloudflareUp) {
      console.log(
        `[Change] Cloudflare state changed: ${cloudflareUp ? "UP" : "DOWN"}`
      );
      await applyActionsForDomains(token, domains, cloudflareUp);
    } else {
      console.log(
        `[No Change] Cloudflare still ${cloudflareUp ? "UP" : "DOWN"}`
      );
    }

    lastCloudflareUp = cloudflareUp;
    await sleep(interval);
  }
};
