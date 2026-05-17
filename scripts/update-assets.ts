import { writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "https://valorant-api.com/v1";
const ASSETS = join(__dirname, "..", "src", "assets");

async function fetchJSON(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const json = await res.json();
  return json.data;
}

function slimAgents(data: any[]) {
  return data.map((a) => ({
    uuid: a.uuid,
    displayName: a.displayName,
    displayIcon: a.displayIcon,
    killfeedPortrait: a.killfeedPortrait,
  }));
}

function slimMaps(data: any[]) {
  return data.map((m) => ({
    uuid: m.uuid,
    displayName: m.displayName,
    displayIcon: m.displayIcon ?? "",
    listViewIcon: m.listViewIcon ?? "",
    mapUrl: m.mapUrl,
  }));
}

function save(name: string, data: any) {
  const path = join(ASSETS, `${name}.json`);
  writeFileSync(path, JSON.stringify(data, null, "\t") + "\n");
  console.log(`✓ ${name}.json — ${data.length} items`);
}

async function main() {
  console.log("Fetching assets from valorant-api.com...\n");

  const [agents, maps] = await Promise.all([
    fetchJSON(`${BASE}/agents`),
    fetchJSON(`${BASE}/maps`),
  ]);

  save("agents", slimAgents(agents));
  save("maps", slimMaps(maps));

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
