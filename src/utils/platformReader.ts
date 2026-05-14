import { localDataDir } from "@tauri-apps/api/path";
import { readDir, readTextFile, readTextFileLines } from "@tauri-apps/plugin-fs";
import base64 from "base-64";

import lockfile from "@/../lockfile.json";
import configs from "@/../tests/fixtures/local/configs.json";
import ShooterGameLog from "@/../tests/fixtures/ShooterGame.json";

import { isMac } from "./isMac";

const readLockfile = async (): Promise<string> => {
	if (isMac()) {
		return lockfile;
	} else {
		const path = await localDataDir();
		const file = await readTextFile(path + "\\Riot Games\\Riot Client\\Config\\lockfile");
		return file.toString();
	}
};

const readConfigs = async (): Promise<string[]> => {
	if (isMac()) {
		return configs;
	} else {
		const path = await localDataDir();
		const files = await readDir(path + "\\Valorant\\Saved\\Config");
		return files.map((file) => file.name).filter((name) => name.match(/(.*)-(.*)-(.*)-(.*)-(.*)/));
	}
};

const readLog = async () => {
	if (isMac()) {
		for (const line of ShooterGameLog) {
			const res = parseShardFromLogline(line);
			if (res) return res;
		}
	} else {
		const path = await localDataDir();
		const lines = await readTextFileLines(path + "\\Valorant\\Saved\\Logs\\ShooterGame.log");
		for await (const line of lines) {
			const res = parseShardFromLogline(line);
			if (res) return res;
		}
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

export { readLockfile, readConfigs, readLog, parseShardFromLogline, parseLockFile };
