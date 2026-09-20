import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SharedAPI } from "../src/api/shared";
import type {
	CurrentGameMatchResponse,
	CurrentPreGameMatchResponse,
	MatchDetailsResponse,
	PlayerMMRResponse,
	PlayerNamesReponse,
	PlayerRow,
} from "../src/interface";
import * as utils from "../src/utils";
import currentGameMatch from "./fixtures/shared/current-game-match.json";
import currentPreGameMatch from "./fixtures/shared/current-pregame-match.json";
import matchDetails from "./fixtures/shared/match-details.json";
import playerMMR from "./fixtures/shared/player-mmr.json";
import playerNames from "./fixtures/shared/player-names.json";
import agents from "../src/assets/agents.json";
import maps from "../src/assets/maps.json";

describe("utils", () => {
	it("lockfile parse", async () => {
		const lockfile = await utils.readLockfile();
		const { port, password } = utils.parseLockFile(lockfile);
		expect(port).toEqual("12345");
		expect(password).toEqual("cmlvdDp0ZXN0LXBhc3N3b3Jk");
	});

	describe("extractPlayers", () => {
		it("extractPlayers from pre-game match", () => {
			expect(utils.extractPlayers(currentPreGameMatch as CurrentPreGameMatchResponse)).toStrictEqual(
				currentPreGameMatch.AllyTeam.Players.map((player) => player.Subject),
			);
		});

		it("extractPlayers from game match", () => {
			expect(utils.extractPlayers(currentGameMatch as CurrentGameMatchResponse)).toStrictEqual(
				currentGameMatch.Players.map((player) => player.Subject),
			);
		});
	});

	describe("exctractParties", () => {
		it("exctractParties simple", () => {
			const input = [
				{
					puuid: "player-1",
					matches: [
						{
							players: [
								{
									subject: "player-1",
									partyId: "wolves",
								},
								{
									subject: "player-2",
									partyId: "wolves",
								},
								{
									subject: "player-3",
									partyId: "tigers",
								},
							],
						},
					],
				},
				{
					puuid: "player-2",
					matches: [
						{
							players: [
								{
									subject: "player-1",
									partyId: "wolves",
								},
								{
									subject: "player-2",
									partyId: "wolves",
								},
								{
									subject: "player-3",
									partyId: "tigers",
								},
							],
						},
					],
				},
			] as unknown as { puuid: string; matches: MatchDetailsResponse[] }[];

			const output = [
				{
					partyId: 1,
					puuids: ["player-1", "player-2"],
				},
			];

			expect(utils.extractParties(input)).toStrictEqual(output);
		});

		it("exctractParties A-B, B-C = A-B-C", () => {
			const input = [
				{
					puuid: "player-1",
					matches: [
						{
							players: [
								{
									subject: "player-1",
									partyId: "wolves",
								},
								{
									subject: "player-2",
									partyId: "wolves",
								},
								{
									subject: "player-3",
									partyId: "tigers",
								},
							],
						},
						{
							players: [
								{
									subject: "player-1",
									partyId: "wolves",
								},
								{
									subject: "player-2",
									partyId: "wolves",
								},
								{
									subject: "player-3",
									partyId: "foxes",
								},
							],
						},
					],
				},
				{
					puuid: "player-2",
					matches: [
						{
							players: [
								{
									subject: "player-1",
									partyId: "boars",
								},
								{
									subject: "player-2",
									partyId: "bears",
								},
								{
									subject: "player-3",
									partyId: "bears",
								},
							],
						},
						{
							players: [
								{
									subject: "player-1",
									partyId: "wolves",
								},
								{
									subject: "player-2",
									partyId: "wolves",
								},
								{
									subject: "player-3",
									partyId: "tigers",
								},
							],
						},
					],
				},
				{
					puuid: "player-3",
					matches: [
						{
							players: [
								{
									subject: "player-1",
									partyId: "foxes",
								},
								{
									subject: "player-2",
									partyId: "bears",
								},
								{
									subject: "player-3",
									partyId: "bears",
								},
							],
						},
					],
				},
			] as unknown as { puuid: string; matches: MatchDetailsResponse[] }[];

			const output = [
				{
					partyId: 1,
					puuids: ["player-1", "player-2", "player-3"],
				},
			];

			expect(utils.extractParties(input)).toStrictEqual(output);
		});
	});

	describe("calculateStatsForPlayer", () => {
		it("execution time", () => {
			utils.calculateStatsForPlayer("test-player-1-puuid", Array(1000).fill(matchDetails));
		});

		it("no matches", () => {
			const expected = {
				kd: 0,
				adr: 0,
				hs: 0,
				assists: 0,
				deaths: 0,
				kills: 0,
				wins: 0,
				losses: 0,
				ties: 0,
				winrate: 0,
			};
			expect(utils.calculateStatsForPlayer("test-player-1-puuid", [] as any)).toEqual(expected);
		});

		it("player has 0 deaths", () => {
			const input = {
				players: [
					{
						subject: "test-player-1-puuid",
						stats: {
							kills: 5,
							assists: 0,
							deaths: 0,
						},
					},
				],
				teams: [
					{
						roundsWon: 13,
					},
					{
						roundsWon: 5,
					},
				],
			};

			const expected = {
				kd: 5,
				adr: 0,
				hs: 0,
				assists: 0,
				deaths: 0,
				kills: 5,
				wins: 0,
				losses: 1,
				ties: 0,
				winrate: 0,
			};
			expect(utils.calculateStatsForPlayer("test-player-1-puuid", [input] as any)).toEqual(expected);
		});

		it("all good", () => {
			const expected = {
				kd: 1.56,
				adr: 124,
				hs: 19,
				assists: 7,
				deaths: 16,
				kills: 25,
				wins: 0,
				losses: 1,
				ties: 0,
				winrate: 0,
			};
			expect(utils.calculateStatsForPlayer("test-player-1-puuid", [matchDetails] as any)).toEqual(expected);
		});

		it("two matches with different round counts — ADR is totalDamage / totalRounds", () => {
			// Match 1: 10 rounds, player deals 1500 damage (150 avg)
			// Match 2: 20 rounds, player deals 2000 damage (100 avg)
			// Correct ADR: 3500 / 30 = 117
			// Buggy ADR (avg of averages): (150 + 100) / 2 = 125
			const makeRoundResults = (rounds: number, damagePerRound: number) =>
				Array.from({ length: rounds }, (_, i) => ({
					roundNum: i,
					playerStats: [{ subject: "test-player-1-puuid", damage: [{ receiver: "enemy", damage: damagePerRound, legshots: 0, bodyshots: 1, headshots: 0 }] }],
				}));

			const match1 = {
				players: [{ subject: "test-player-1-puuid", teamId: "Red", stats: { kills: 20, deaths: 10, assists: 5 }, competitiveTier: 15, accountLevel: 50 }],
				teams: [{ teamId: "Red", roundsWon: 6, won: true }, { teamId: "Blue", roundsWon: 4, won: false }],
				roundResults: makeRoundResults(10, 150),
			};

			const match2 = {
				players: [{ subject: "test-player-1-puuid", teamId: "Blue", stats: { kills: 30, deaths: 20, assists: 10 }, competitiveTier: 15, accountLevel: 50 }],
				teams: [{ teamId: "Blue", roundsWon: 14, won: true }, { teamId: "Red", roundsWon: 6, won: false }],
				roundResults: makeRoundResults(20, 100),
			};

			const result = utils.calculateStatsForPlayer("test-player-1-puuid", [match1, match2] as any);

			// ADR should be weighted by rounds: 3500/30 = 117, not (150+100)/2 = 125
			// KD should be totalKills / totalDeaths: 50/30 = 1.67, not (2 + 1.5)/2 = 1.75
			expect(result.adr).toBe(117);
			expect(result.kd).toBe(1.67);
			expect(result.wins).toBe(2);
		});

		it("two matches — HS% is totalHeadshots / totalShots", () => {
			// Match 1: 1 shot, 1 headshot = 100%
			// Match 2: 100 shots, 90 headshots = 90%
			// Correct HS%: 91/101 = 90%
			// Buggy HS% (avg of averages): (100 + 90) / 2 = 95%
			const match1 = {
				players: [{ subject: "p", teamId: "Red", stats: { kills: 5, deaths: 5, assists: 0 }, competitiveTier: 15, accountLevel: 50 }],
				teams: [{ teamId: "Red", roundsWon: 5, won: false }, { teamId: "Blue", roundsWon: 7, won: true }],
				roundResults: [{ playerStats: [{ subject: "p", damage: [{ receiver: "e", damage: 100, legshots: 0, bodyshots: 0, headshots: 1 }] }] }],
			};
			const match2 = {
				players: [{ subject: "p", teamId: "Red", stats: { kills: 10, deaths: 10, assists: 0 }, competitiveTier: 15, accountLevel: 50 }],
				teams: [{ teamId: "Red", roundsWon: 7, won: true }, { teamId: "Blue", roundsWon: 5, won: false }],
				roundResults: Array.from({ length: 10 }, () => ({
					playerStats: [{ subject: "p", damage: [{ receiver: "e", damage: 100, legshots: 0, bodyshots: 1, headshots: 9 }] }],
				})),
			};

			const result = utils.calculateStatsForPlayer("p", [match1, match2] as any);
			expect(result.hs).toBe(90);
		});
	});

	describe("calculateCompetitiveUpdates", () => {
		it("SeasonalInfoBySeasonID is null", () => {
			const input = {
				LatestCompetitiveUpdate: {
					RankedRatingEarned: 0,
					TierAfterUpdate: 0,
					RankedRatingAfterUpdate: 0,
				},
				QueueSkills: {
					competitive: {
						SeasonalInfoBySeasonID: null,
					},
				},
			};
			expect(utils.calculateRanking(input as any)).toEqual({
				currentRank: 0,
				currentRR: 0,
				peakRank: 0,
				peakRankSeasonId: null,
				lastGameMMRDiff: 0,
			});
		});

		it("calculateCompetitiveUpdates", () => {
			const expected = {
				currentRank: 20,
				currentRR: 28,
				peakRank: 20,
				peakRankSeasonId: "aef237a0-494d-3a14-a1c8-ec8de84e309c",
				lastGameMMRDiff: -13,
			};
			expect(utils.calculateRanking(playerMMR as PlayerMMRResponse)).toEqual(expected);
		});
	});

	describe("getBestAgents", () => {
		const puuid = playerNames[0].Subject;
		const mapUrl = "/Game/Maps/Jam/Jam";
		const expected = [
			{
				agentId: "cc8b64c8-4b25-4ff9-6e7f-37b4da43d235",
				avgDeaths: 16,
				avgKills: 25,
				avgKd: 1.56,
				games: 1,
				agentUrl: "https://media.valorant-api.com/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/displayicon.png",
			},
		];

		it("1 game", () => {
			expect(utils.getPlayerBestAgent(puuid, [matchDetails] as MatchDetailsResponse[], mapUrl)).toStrictEqual(expected);
		});

		it("2 games", () => {
			expect(
				utils.getPlayerBestAgent(puuid, [matchDetails, matchDetails] as MatchDetailsResponse[], mapUrl),
			).toStrictEqual([{ ...expected[0], games: 2 }]);
		});
	});

	// calculateMostPlayedServer removed as dead code — no callers in the codebase

	describe("extractServerName", () => {
		it("extracts frankfurt from eu-gp-frankfurt-1", () => {
			expect(utils.extractServerName("aresriot.aws-euc1-prod.eu-gp-frankfurt-1")).toBe("frankfurt");
		});

		it("extracts paris from eu-gp-paris-1", () => {
			expect(utils.extractServerName("aresriot.aws-euw3-prod.eu-gp-paris-1")).toBe("paris");
		});

		it("handles short gamePodId", () => {
			expect(utils.extractServerName("abc-def")).toBe("abc");
		});

		it("returns full id when single part", () => {
			expect(utils.extractServerName("single")).toBe("single");
		});
	});

	describe("calculateBestServers", () => {
		const puuid = matchDetails.players[0].subject;

		it("returns server stats from single match", () => {
			const result = utils.calculateBestServers(puuid, [matchDetails] as MatchDetailsResponse[]);
			expect(result).toHaveLength(1);
			expect(result[0].serverName).toBe("frankfurt");
			expect(result[0].matches).toBe(1);
		});

		it("aggregates matches across servers", () => {
			const frankfurtMatch = matchDetails as MatchDetailsResponse;
			const parisMatch = {
				...matchDetails,
				matchInfo: {
					...matchDetails.matchInfo,
					gamePodId: "aresriot.aws-euw3-prod.eu-gp-paris-1",
				},
			} as MatchDetailsResponse;

			const result = utils.calculateBestServers(puuid, [frankfurtMatch, parisMatch, parisMatch]);
			expect(result).toHaveLength(2);
			expect(result[0].serverName).toBe("paris");
			expect(result[0].matches).toBe(2);
			expect(result[1].serverName).toBe("frankfurt");
			expect(result[1].matches).toBe(1);
		});

		it("sorts by most matches first", () => {
			const matches = [matchDetails, matchDetails, matchDetails] as MatchDetailsResponse[];
			const result = utils.calculateBestServers(puuid, matches);
			expect(result[0].matches).toBe(3);
		});
	});
});

describe("api", () => {
	let sharedapi: SharedAPI;

	beforeEach(() => {
		sharedapi = new SharedAPI({
			entToken: "",
			accessToken: "",
			region: "",
			shard: "",
		});
	});

	describe("shared", () => {
		it("getPlayerMatchHistory default", async () => {
			const { History } = await sharedapi.getPlayerMatchHistory("");
			expect(History.length).toEqual(20);
		});
	});
});

describe("request caching", () => {
	let sharedapi: SharedAPI;
	const _puuid = "test-player";

	beforeEach(async () => {
		sharedapi = new SharedAPI({
			entToken: "test-ent-token",
			accessToken: "test-access-token",
			region: "",
			shard: "",
		});
		vi.useFakeTimers();
	});

	afterEach(async () => {
		vi.useRealTimers();
	});

	it("sends the request and checks for cache", async () => {
		await sharedapi.getMatchDetails("test-match-id");
		expect(Object.keys(globalThis.requestCache).length).toEqual(1);
	});

	it("checks cache after 7 days", async () => {
		const matchDetailsTTL = 7 * 24 * 60 * 60 * 1000;
		const timestampBefore = +new Date(2025, 1, 1, 13, 0, 0);
		vi.setSystemTime(new Date(2025, 1, 1, 13, 0, 0));

		await sharedapi.getMatchDetails("");
		expect(Object.keys(globalThis.requestCache).length).toEqual(1);
		expect(Object.values(globalThis.requestCache as { [key: string]: [string, number, any] })[0][1]).toEqual(
			timestampBefore + matchDetailsTTL,
		);

		const timestampAfter = +new Date(2025, 1, 30, 13, 30, 1);
		vi.setSystemTime(+new Date(2025, 1, 30, 13, 30, 1));

		await sharedapi.getMatchDetails("");
		expect(Object.values(globalThis.requestCache as { [key: string]: [string, number, any] })[0][1]).toEqual(
			timestampAfter + matchDetailsTTL,
		);
	});
});

describe("assets", () => {
	describe("agents.json", () => {
		it("is non-empty array", () => {
			expect(Array.isArray(agents)).toBe(true);
			expect(agents.length).toBeGreaterThan(0);
		});

		it("has unique uuids", () => {
			const uuids = agents.map((a) => a.uuid);
			expect(new Set(uuids).size).toBe(uuids.length);
		});

		it("has required fields with valid values", () => {
			for (const agent of agents) {
				expect(agent.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
				expect(agent.displayName).toBeTruthy();
				expect(agent.displayIcon).toMatch(/^https?:\/\//);
				expect(agent.killfeedPortrait).toMatch(/^https?:\/\//);
			}
		});

		it("has no null or empty required fields", () => {
			for (const agent of agents) {
				expect(agent.uuid).not.toBe("");
				expect(agent.displayName).not.toBe("");
				expect(agent.displayIcon).not.toBe("");
				expect(agent.killfeedPortrait).not.toBe("");
			}
		});
	});

	describe("maps.json", () => {
		it("is non-empty array", () => {
			expect(Array.isArray(maps)).toBe(true);
			expect(maps.length).toBeGreaterThan(0);
		});

		it("has unique uuids", () => {
			const uuids = maps.map((m) => m.uuid);
			expect(new Set(uuids).size).toBe(uuids.length);
		});

		it("has required fields with valid values", () => {
			for (const map of maps) {
				expect(map.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
				expect(map.displayName).toBeTruthy();
				expect(map.mapUrl).toMatch(/^\/Game\/Maps\//);
			}
		});

		it("has no null or empty required fields", () => {
			for (const map of maps) {
				expect(map.uuid).not.toBe("");
				expect(map.displayName).not.toBe("");
				expect(map.mapUrl).not.toBe("");
			}
		});
	});
});
