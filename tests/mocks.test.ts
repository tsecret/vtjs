import base64 from "base-64";
import { describe, expect, it } from "vitest";
import { LocalAPI, SharedAPI } from "../src/api";
import type { GameSettingsResponse } from "../src/api/schemas/riot";
import agents from "../src/assets/agents.json";
import { MatchProcessing } from "../src/lib/match-processing";
import currentGameMatch from "../src/mocks/fixtures/shared/current-game-match.json";
import currentPreGameMatch from "../src/mocks/fixtures/shared/current-pregame-match.json";
import matchDetails from "../src/mocks/fixtures/shared/match-details.json";
import playerNames from "../src/mocks/fixtures/shared/player-names.json";
import { MOCK_PUUID } from "../src/mocks/presence";
import { getMockResponse } from "../src/mocks/router";

const localapi = new LocalAPI({ port: "12345", password: "test-password" });
const sharedapi = new SharedAPI({
	entToken: "test-ent-token",
	accessToken: "test-access-token",
	region: "eu",
	shard: "eu",
});

describe("mock fixtures cover every API request", () => {
	describe("LocalAPI", () => {
		it("getEntitlementToken", async () => {
			const token = await localapi.getEntitlementToken();
			expect(token.subject).toBe(MOCK_PUUID);
			expect(token.accessToken).toBeTruthy();
		});

		it("getPlayerAccount", async () => {
			const player = await localapi.getPlayerAccount();
			expect(player.game_name).toBeTruthy();
		});

		it("getPresences", async () => {
			const { presences } = await localapi.getPresences();
			expect(presences).toHaveLength(1);
			const decoded = JSON.parse(base64.decode(presences[0].private ?? ""));
			expect(decoded.matchPresenceData.sessionLoopState).toBe("MENUS");
		});
	});

	describe("SharedAPI", () => {
		it("getCurrentPreGamePlayer / getCurrentGamePlayer", async () => {
			const pregame = await sharedapi.getCurrentPreGamePlayer(MOCK_PUUID);
			expect(pregame?.MatchID).toBe("test-match-id-0");
			const ingame = await sharedapi.getCurrentGamePlayer(MOCK_PUUID);
			expect(ingame?.MatchID).toBe("test-match-id-0");
		});

		it("getCurrentPreGameMatch / getCurrentGameMatch", async () => {
			const pregame = await sharedapi.getCurrentPreGameMatch("test-match-id-0");
			expect(pregame.AllyTeam?.Players.length).toBeGreaterThan(0);
			const ingame = await sharedapi.getCurrentGameMatch("test-match-id-0");
			expect(ingame.Players).toHaveLength(10);
		});

		it("getPlayerNames returns only requested players", async () => {
			const names = await sharedapi.getPlayerNames([MOCK_PUUID, "test-player-4-puuid"]);
			expect(names.map((n) => n.Subject).sort()).toEqual([MOCK_PUUID, "test-player-4-puuid"].sort());
		});

		it("getPlayerMatchHistory", async () => {
			const { History, Total } = await sharedapi.getPlayerMatchHistory(MOCK_PUUID);
			expect(History).toHaveLength(20);
			expect(Total).toBe(20);
			expect(History[0].MatchID).toBe("test-match-id-1");
		});

		it("getMatchDetails echoes the requested match id", async () => {
			const match = await sharedapi.getMatchDetails("test-match-id-7");
			expect(match.matchInfo.matchId).toBe("test-match-id-7");
			expect(match.players).toHaveLength(10);
		});

		it("getCompetitiveUpdates / getPlayerMMR", async () => {
			const updates = await sharedapi.getCompetitiveUpdates(MOCK_PUUID);
			expect(updates.Subject).toBe(MOCK_PUUID);
			expect(updates.Matches.length).toBeGreaterThan(0);
			const mmr = await sharedapi.getPlayerMMR(MOCK_PUUID);
			expect(mmr.Subject).toBe(MOCK_PUUID);
		});

		it("getGameSettings / setGameSettings", async () => {
			const settings = await sharedapi.getGameSettings();
			expect(settings.type).toBe("Ares.PlayerSettings");
			const echoed = await sharedapi.setGameSettings(settings as GameSettingsResponse);
			expect(echoed).toEqual(settings);
		});

		it("getParty", async () => {
			const party = await sharedapi.getParty("test-party-id");
			expect(party.Members.length).toBeGreaterThan(0);
			expect(party.Members.map((m) => m.Subject)).toContain(MOCK_PUUID);
		});

		it("getCurrentPreGameLoadouts covers every pregame player", async () => {
			const { Loadouts } = await sharedapi.getCurrentPreGameLoadouts("test-match-id-0");
			const subjects = currentPreGameMatch.AllyTeam?.Players.map((p) => p.Subject) ?? [];
			expect(Loadouts.map((l) => l.Subject).sort()).toEqual([...subjects].sort());
		});

		it("getCurrentGameLoadouts covers every in-game player", async () => {
			const { Loadouts } = await sharedapi.getCurrentGameLoadouts("test-match-id-0");
			const subjects = currentGameMatch.Players.map((p) => p.Subject);
			expect(Loadouts.map((l) => l.Loadout.Subject).sort()).toEqual([...subjects].sort());
		});
	});

	it("fixture identities are consistent", () => {
		expect(currentGameMatch.Players.map((p) => p.Subject)).toContain(MOCK_PUUID);
		expect(currentPreGameMatch.AllyTeam?.Players.map((p) => p.Subject)).toContain(MOCK_PUUID);
	});

	describe("match fixtures render a full table", () => {
		const agentIds = new Set(agents.map((agent) => agent.uuid));

		it("every player has an agent that resolves to an image", () => {
			for (const player of currentGameMatch.Players) {
				expect(agentIds.has(player.CharacterID)).toBe(true);
			}
			for (const team of currentPreGameMatch.Teams) {
				for (const player of team.Players) {
					expect(agentIds.has(player.CharacterID)).toBe(true);
				}
			}
		});

		it("pregame fixture has both teams", () => {
			expect(currentPreGameMatch.Teams.map((team) => team.TeamID)).toEqual(["Blue", "Red"]);
			expect(currentPreGameMatch.EnemyTeam?.Players).toHaveLength(5);
		});

		it("player names use one name/tag convention", () => {
			for (const player of playerNames) {
				expect(player.GameName).not.toBe("");
				expect(player.TagLine).toBe("test");
			}
			// match-details backs the name fallback and the profile/match views.
			for (const player of matchDetails.players) {
				expect(player.gameName).toMatch(/^Player\d+$/);
				expect(player.tagLine).toBe("test");
			}
		});

		it("processed rows have agent images and enemy flags", async () => {
			const processing = new MatchProcessing({ api: sharedapi, cache: { select: async () => [] } } as never);

			const pregame = await processing.handleMatch("test-match-id-0", true, MOCK_PUUID);
			for (const row of Object.values(pregame.table) as { agentImage?: string; agentName?: string }[]) {
				expect(row.agentImage).toBeTruthy();
				expect(row.agentName).toBeTruthy();
			}

			const ingame = await processing.handleMatch("test-match-id-0", false, MOCK_PUUID);
			const rows = Object.values(ingame.table) as { agentImage?: string; enemy: boolean }[];
			expect(rows).toHaveLength(10);
			expect(rows.filter((row) => row.enemy)).toHaveLength(5);
			for (const row of rows) expect(row.agentImage).toBeTruthy();
		});
	});

	it("every tag in every fixture is 'test'", () => {
		const fixtureModules = import.meta.glob("../src/mocks/fixtures/**/*.json", { eager: true }) as Record<
			string,
			unknown
		>;
		expect(Object.keys(fixtureModules).length).toBeGreaterThan(0);
		const offenders: string[] = [];
		const visit = (value: unknown, path: string) => {
			if (Array.isArray(value)) {
				value.forEach((item, index) => {
					visit(item, `${path}[${index}]`);
				});
				return;
			}
			if (value && typeof value === "object") {
				for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
					if (/^tag_?line$/i.test(key) && child !== "test") offenders.push(`${path}.${key}=${JSON.stringify(child)}`);
					visit(child, `${path}.${key}`);
				}
			}
		};
		for (const [file, module] of Object.entries(fixtureModules)) {
			const data = (module as { default?: unknown })?.default ?? module;
			visit(data, file);
		}
		expect(offenders).toEqual([]);
	});

	it("mock mode never touches the response cache", async () => {
		const api = new SharedAPI({ entToken: "t", accessToken: "t", region: "eu", shard: "eu", noCache: true });
		await api.getMatchDetails("test-match-id-0");
		expect(Object.keys(globalThis.requestCache)).toHaveLength(0);
	});

	it("strict mode fails on endpoints without a fixture", () => {
		expect(() => getMockResponse("https://example.com/not-a-real-endpoint", {}, { strict: true })).toThrow(
			/No fixture for GET/,
		);
	});
});
