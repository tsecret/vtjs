import { mockIPC } from "@tauri-apps/api/mocks";
import { beforeAll, beforeEach, vi } from "vitest";
import { getMockResponse } from "../src/mocks/router";
import * as utils from "../src/utils";

globalThis.cache = {} as { [key: string]: [string, number, any] };
globalThis.requestCache = {};

// Every HTTP request goes through the same fixture router as mock/dev mode.
// strict: true makes an endpoint without a fixture fail the test loudly.
vi.mock("@tauri-apps/plugin-http", () => ({
	fetch: async (url: string | URL, init?: { body?: string | null; method?: string }) =>
		getMockResponse(String(url), init, { strict: true }),
}));

beforeAll(async () => {
	vi.spyOn(utils, "readLockfile").mockImplementation(async () => "Riot Test Client:1111:12345:test-password:https");

	mockIPC((cmd, pld) => {
		if (cmd === "plugin:store|load") return globalThis.requestCache;
		if (cmd === "plugin:store|get") {
			const key = (pld as any).key;
			if (key in globalThis.requestCache) return [globalThis.requestCache[key], true];
			return [null, false];
		}
		if (cmd === "plugin:store|set") {
			globalThis.requestCache[(pld as any).key] = (pld as any).value;
		}
		if (cmd === "plugin:store|delete") {
			delete globalThis.requestCache[(pld as any).key];
		}
		if (cmd === "plugin:store|clear") {
			for (const prop of Object.getOwnPropertyNames(globalThis.requestCache)) {
				delete globalThis.requestCache[prop];
			}
		}
		if (cmd === "plugin:store|keys") return Object.keys(globalThis.requestCache);
		if (cmd.startsWith("plugin:sql")) {
			const payload: { query: string; values: any[] } = pld as any;
			if (cmd === "plugin:sql|load") return {};
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
