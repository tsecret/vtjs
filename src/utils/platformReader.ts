import { localDataDir } from "@tauri-apps/api/path";
import { readTextFile, readTextFileLines } from "@tauri-apps/plugin-fs";
import base64 from "base-64";
import { isMac } from "./isMac";
import { DEV_PORT, DEV_REGION, DEV_SHARD, DEV_TOKEN } from "./constants";

const readLockfile = async (): Promise<string> => {
	if (isMac()) {
		return `Riot Client:1:${DEV_PORT}:${DEV_TOKEN}:https`;
	}
	const path = await localDataDir();
	const file = await readTextFile(`${path}\\Riot Games\\Riot Client\\Config\\lockfile`);
	return file.toString();
};

const readLog = async () => {
	if (isMac()) {
		return [DEV_REGION, DEV_SHARD];
	}
	const path = await localDataDir();
	const lines = await readTextFileLines(`${path}\\Valorant\\Saved\\Logs\\ShooterGame.log`);
	for await (const line of lines) {
		const res = parseShardFromLogline(line);
		if (res) return res;
	}
	return ["", ""];
};

const parseShardFromLogline = (line: string): [string, string] | undefined => {
	if (!line.includes("https://glz")) return;

	const urlMatch = line.match(/URL \[GET (https?:\/\/[^\]]+)\]/);
	if (!urlMatch) return;

	const regionMatch = urlMatch[1].match(/glz-([a-zA-Z]+)-\d+\.([a-zA-Z]+)\.a\.pvp\.net/);
	if (regionMatch) return [regionMatch[1], regionMatch[2]];
};

const parseLockFile = (content: string): { port: string; password: string } => {
	const [_, __, port, password, ___] = content.split(":");

	return { port, password: base64.encode(`riot:${password}`) };
};

export { parseLockFile, parseShardFromLogline, readLockfile, readLog };
