import { mockIPC } from "@tauri-apps/api/mocks";
import { beforeAll, beforeEach, vi } from "vitest";
import * as utils from "../src/utils";
import entTokenResponse from "./fixtures/local/ent-token.json";
// Local
import helpResponse from "./fixtures/local/help.json";
import playerAliasResponse from "./fixtures/local/player-alias.json";
import competitiveUpdates from "./fixtures/shared/competitive-updates.json";
import currentGameMatch from "./fixtures/shared/current-game-match.json";
// Shared
import currentGamePlayer from "./fixtures/shared/current-game-player.json";
import currentPreGameMatch from "./fixtures/shared/current-pregame-match.json";
import currentPreGamePlayer from "./fixtures/shared/current-pregame-player.json";
import matchDetails from "./fixtures/shared/match-details.json";
import playerMatchHistory from "./fixtures/shared/match-history.json";
import penalties from "./fixtures/shared/penalties.json";
import playerNames from "./fixtures/shared/player-names.json";

globalThis.cache = {} as { [key: string]: [string, number, any] };
globalThis.requestCache = {};

const getResponseFromUrl = (url: string) => {
	// Local

	if (url.includes("/help")) {
		return helpResponse;
	}

	if (url.includes("/entitlements/v1/token")) {
		return entTokenResponse;
	}

	if (url.includes("/player-account/aliases/v1/active")) {
		return playerAliasResponse;
	}

	// Shared

	if (url.includes("/core-game/v1/players/")) {
		return currentGamePlayer;
	}

	if (url.includes("/pregame/v1/players/")) {
		return currentPreGamePlayer;
	}

	if (url.includes("/core-game/v1/matches/")) {
		return currentGameMatch;
	}

	if (url.includes("/pregame/v1/matches/")) {
		return currentPreGameMatch;
	}

	if (url.includes("/name-service/v2/players")) {
		return playerNames;
	}

	if (url.includes("/match-history/v1/history/")) {
		const [_, params] = url.split("?");
		const [startIndexStr, endIndexStr] = params.split("&");
		const startIndex = parseInt(startIndexStr.split("=")[1], 10);
		const endIndex = parseInt(endIndexStr.split("=")[1], 10);

		return {
			...playerMatchHistory,
			History: playerMatchHistory.History.slice(startIndex, endIndex),
		};
	}

	if (url.includes("/match-details/v1/matches/")) {
		return matchDetails;
	}

	if (url.includes("/competitiveupdates")) {
		return competitiveUpdates;
	}

	if (url.includes("/restrictions/v3/penalties")) {
		return penalties;
	}
};

beforeAll(async () => {
	vi.mock("@tauri-apps/plugin-http", () => ({
		fetch: async (url: string) => ({
			status: 200,
			json: async () => getResponseFromUrl(url),
		}),
	}));

	vi.spyOn(utils, "readLockfile").mockImplementation(async () => "Riot Test Client:1111:12345:test-password:https");

	mockIPC((cmd, pld) => {
		// Store

		if (cmd === "plugin:store|load") {
			return globalThis.requestCache;
		}

		if (cmd === "plugin:store|get") {
			// @ts-expect-error
			if (payload.key in globalThis.requestCache)
				// @ts-expect-error
				return [globalThis.requestCache[payload.key], true];

			return [null, false];
		}

		if (cmd === "plugin:store|set") {
			// @ts-expect-error
			globalThis.requestCache[payload.key] = payload.value;
		}

		if (cmd === "plugin:store|delete") {
			// @ts-expect-error
			delete globalThis.requestCache[payload.key];
		}

		if (cmd === "plugin:store|clear") {
			for (const prop of Object.getOwnPropertyNames(globalThis.requestCache)) {
				delete globalThis.requestCache[prop];
			}
		}

		if (cmd === "plugin:store|keys") {
			return Object.keys(globalThis.requestCache);
		}

		// SQL

		if (cmd.startsWith("plugin:sql")) {
			const payload: { query: string; values: any[] } = pld as any;

			if (cmd === "plugin:sql|load") {
				return {};
			}

			if (cmd === "plugin:sql|select") {
				if (payload.values[0] in globalThis.requestCache) return [globalThis.requestCache[payload.values[0]]];

				return [];
			}

			if (cmd === "plugin:sql|execute") {
				if (payload.query.startsWith("INSERT")) {
					globalThis.requestCache[payload.values[0]] = payload.values;
					return [1, payload.values[0]];
				}

				if (payload.query.startsWith("DELETE")) {
					Object.values(globalThis.requestCache as { [key: string]: any }).forEach((cache) => {
						if (cache[1] === payload.values[0]) {
						}
						delete globalThis.requestCache[cache[0]];
					});
					return [1, 1];
				}
			}
		}
	});
});

beforeEach(() => {
	globalThis.requestCache = {};
});
