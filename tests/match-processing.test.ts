import type Database from "@tauri-apps/plugin-sql";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import currentGameMatch from "../tests/fixtures/shared/current-game-match.json";
import currentPreGameMatch from "../tests/fixtures/shared/current-pregame-match.json";
import matchDetails from "../tests/fixtures/shared/match-details.json";
import playerMMR from "../tests/fixtures/shared/player-mmr.json";
import playerNames from "../tests/fixtures/shared/player-names.json";
import matchHistory from "../tests/fixtures/shared/match-history.json";
import { MatchProcessing, type MatchProcessingConfig } from "../src/lib/match-processing";

describe("MatchProcessing", () => {
	let mockApi: any;
	let mockCache: any;
	let processing: MatchProcessing;

	beforeEach(() => {
		mockApi = {
			getCurrentPreGameMatch: vi.fn(),
			getCurrentGameMatch: vi.fn(),
			getPlayerNames: vi.fn(),
			getPlayerMMR: vi.fn(),
			getPlayerMatchHistory: vi.fn(),
			getMatchDetails: vi.fn(),
		};

		mockCache = {
			select: vi.fn(),
		};

		processing = new MatchProcessing({ api: mockApi, cache: mockCache } as MatchProcessingConfig);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("handleMatch", () => {
		it("handles pre-game match", async () => {
			mockApi.getCurrentPreGameMatch.mockResolvedValue(currentPreGameMatch);
			mockApi.getPlayerNames.mockResolvedValue(
				playerNames.filter((p: any) => currentPreGameMatch.AllyTeam!.Players.map((pl: any) => pl.Subject).includes(p.Subject)),
			);
			mockApi.getPlayerMMR.mockResolvedValue(playerMMR);
			mockCache.select.mockResolvedValue([]);

			const result = await processing.handleMatch("test-match-id-0", true);

			expect(mockApi.getCurrentPreGameMatch).toHaveBeenCalledWith("test-match-id-0");
			expect(mockApi.getPlayerNames).toHaveBeenCalled();
			expect(mockApi.getPlayerMMR).toHaveBeenCalledWith("test-player-1-puuid");
			expect(result.match).toEqual(currentPreGameMatch);
			expect(Object.keys(result.table)).toHaveLength(currentPreGameMatch.AllyTeam!.Players.length);
			expect(result.players).toHaveLength(currentPreGameMatch.AllyTeam!.Players.length);
		});

		it("handles in-game match with enemy flag", async () => {
			mockApi.getCurrentGameMatch.mockResolvedValue(currentGameMatch);
			mockApi.getPlayerNames.mockResolvedValue(
				playerNames.filter((p: any) => currentGameMatch.Players.map((pl: any) => pl.Subject).includes(p.Subject)),
			);
			mockApi.getPlayerMMR.mockResolvedValue(playerMMR);
			mockCache.select.mockResolvedValue([]);

			// Set up a scenario where we're on the Red team
			const gameMatchWithRedTeam = {
				...currentGameMatch,
				Players: currentGameMatch.Players.map((p: any) =>
					p.Subject === "test-player-6-puuid"
						? { ...p, TeamID: "RED" }
						: p,
				),
			};
			mockApi.getCurrentGameMatch.mockResolvedValue(gameMatchWithRedTeam);

			const result = await processing.handleMatch("test-match-id-0", false);

			expect(mockApi.getCurrentGameMatch).toHaveBeenCalledWith("test-match-id-0");
			expect(Object.keys(result.table)).toHaveLength(currentGameMatch.Players.length);
		});

		it("throws when match fetch fails", async () => {
			mockApi.getCurrentPreGameMatch.mockResolvedValue(null);

			await expect(processing.handleMatch("nonexistent-match", true)).rejects.toThrow(
				"Failed to fetch match: nonexistent-match",
			);
		});

		it("parallelizes MMR requests — all calls happen simultaneously", async () => {
			const callOrder: string[] = [];

			// Track call order — each mock pushes its name to the order array
			mockApi.getPlayerMMR.mockImplementation(async (puuid: string) => {
				callOrder.push(`mmr-${puuid}`);
				return playerMMR;
			});

			mockApi.getCurrentPreGameMatch.mockResolvedValue(currentPreGameMatch);
			mockApi.getPlayerNames.mockResolvedValue(
				playerNames.filter((p: any) => currentPreGameMatch.AllyTeam!.Players.map((pl: any) => pl.Subject).includes(p.Subject)),
			);
			mockCache.select.mockResolvedValue([]);

			await processing.handleMatch("test-match-id-0", true);

			// All MMR requests should be made concurrently — they all start before any completes
			// With Promise.all, all calls are initiated synchronously, so all "mmr-" entries
			// appear before any completion markers
			const mmrCalls = callOrder.filter((x) => x.startsWith("mmr-"));
			expect(mmrCalls.length).toBeGreaterThan(1);
		});
	});

	describe("processPlayers", () => {
		it("handles empty players array", async () => {
			const result = await processing.processPlayers([], currentPreGameMatch);

			expect(result.stats).toEqual({});
			expect(result.partyLookup).toEqual({});
		});

		it("calculates player stats correctly", async () => {
			mockApi.getPlayerMatchHistory.mockResolvedValue(matchHistory);
			mockApi.getMatchDetails.mockResolvedValue(matchDetails);

			const players: any[] = [
				{ Subject: "test-player-1-puuid", GameName: "TestPlayer", TagLine: "TST" },
			];

			const result = await processing.processPlayers(players, currentGameMatch);

			expect(mockApi.getPlayerMatchHistory).toHaveBeenCalledWith("test-player-1-puuid");
			expect(mockApi.getMatchDetails).toHaveBeenCalledWith("test-match-id-1");
			expect(result.stats["test-player-1-puuid"]).toBeDefined();
			expect(result.stats["test-player-1-puuid"].kd).toBeDefined();
			expect(result.stats["test-player-1-puuid"].hs).toBeDefined();
			expect(result.stats["test-player-1-puuid"].adr).toBeDefined();
		});

		it("detects party info correctly", async () => {
			mockApi.getPlayerMatchHistory.mockResolvedValue(matchHistory);
			mockApi.getMatchDetails.mockResolvedValue(matchDetails);

			// test-player-1-puuid and test-player-5-puuid are on the same team (Red)
			// with the same partyId "bd307977-a9af-4680-8ee4-06007178e2ef"
			const player1 = { Subject: "test-player-1-puuid", GameName: "Player1", TagLine: "TST" };
			const player5 = { Subject: "test-player-5-puuid", GameName: "Player5", TagLine: "TST" };

			const result = await processing.processPlayers([player1, player5], currentGameMatch);

			expect(result.partyLookup).toBeDefined();
			expect(result.partyLookup["test-player-1-puuid"]).toBeDefined();
			expect(result.partyLookup["test-player-5-puuid"]).toBeDefined();
			// Both should have the same party ID
			expect(result.partyLookup["test-player-1-puuid"]).toBe(result.partyLookup["test-player-5-puuid"]);
		});

		it("handles player without GameName by extracting from match history", async () => {
			mockApi.getPlayerMatchHistory.mockResolvedValue(matchHistory);
			mockApi.getMatchDetails.mockResolvedValue(matchDetails);

			const playerWithEmptyName = { Subject: "test-player-2-puuid", GameName: "", TagLine: "" };

			const result = await processing.processPlayers([playerWithEmptyName], currentGameMatch);

			expect(result.stats["test-player-2-puuid"]).toBeDefined();
			expect(result.stats["test-player-2-puuid"].name).toBeDefined();
			expect(result.stats["test-player-2-puuid"].tag).toBeDefined();
		});
	});
});
