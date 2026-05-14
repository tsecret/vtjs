import type Database from "@tauri-apps/plugin-sql";
import type {
	CurrentGameMatchResponse,
	CurrentPreGameMatchResponse,
	MatchDetailsResponse,
	PlayerNamesReponse,
} from "@/api/schemas/shared";
import type { SharedAPI } from "@/api/shared";
import * as utils from "@/utils";

export interface MatchProcessingConfig {
	api: SharedAPI;
	cache: Database;
}

export interface PlayerRowData {
	name: string;
	tag: string;
	puuid: string;
	agentId: string;
	agentName: string;
	agentImage: string;
	currentRank: string;
	currentRankColor: string;
	currentRR: number;
	rankPeak: string;
	rankPeakColor: string;
	rankPeakDate: Date | null;
	lastGameMMRDiff: number;
	enemy: boolean;
	accountLevel: number | null;
	dodge: boolean;
	inParty: boolean;
	partyId: number | null;
	kd?: number;
	hs?: number;
	adr?: number;
	lastGameResult?: string;
	lastGameScore?: string;
	bestAgents?: Array<{ agentId: string; agentUrl: string; avgKills: number; avgDeaths: number; avgKd: number; games: number }>;
	streak?: { type: string; number: number } | null;
}

export interface MatchProcessingResult {
	table: Record<string, PlayerRowData>;
	match: CurrentPreGameMatchResponse | CurrentGameMatchResponse;
	players: PlayerNamesReponse[];
}

export interface PlayerStatsResult {
	stats: Record<string, {
		kd: number;
		hs: number;
		adr: number;
		lastGameResult: string;
		lastGameScore: string;
		accountLevel: number;
		bestAgents: Array<{ agentId: string; agentUrl: string; avgKills: number; avgDeaths: number; avgKd: number; games: number }>;
		streak: { type: string; number: number } | null;
		name?: string;
		tag?: string;
	}>;
	partyLookup: Record<string, number>;
}

export class MatchProcessing {
	private api: SharedAPI;
	private cache: Database;

	constructor(config: MatchProcessingConfig) {
		this.api = config.api;
		this.cache = config.cache;
	}

	async handleMatch(
		matchId: string,
		isPreGame: boolean,
		puuid: string,
	): Promise<MatchProcessingResult> {
		const match = isPreGame
			? await this.api.getCurrentPreGameMatch(matchId)
			: await this.api.getCurrentGameMatch(matchId);

		if (!match) {
			throw new Error(`Failed to fetch match: ${matchId}`);
		}

		const puuids = utils.extractPlayers(match);
		const players = await this.api.getPlayerNames(puuids);

		const newTable = {} as Record<string, PlayerRowData>;

		if (isPreGame) {
			const preGameMatch = match as CurrentPreGameMatchResponse;
			preGameMatch.AllyTeam?.Players.forEach((player: any) => {
				newTable[player.Subject] = {} as PlayerRowData;
			});
		} else {
			const gameMatch = match as CurrentGameMatchResponse;
			gameMatch.Players.forEach((player: any) => {
				newTable[player.Subject] = {} as PlayerRowData;
			});
		}

		const playerTeamId = isPreGame
			? null
			: ((match as CurrentGameMatchResponse).Players.find(
					(player: any) => player.Subject === puuid,
				)?.TeamID as "RED" | "BLUE" | undefined);

		const playersToProcess = isPreGame
			? (match as CurrentPreGameMatchResponse).AllyTeam?.Players || []
			: (match as CurrentGameMatchResponse).Players;

		// Parallelize MMR fetch
		const playerMMRs = await Promise.all(
			playersToProcess.map(async (player) => {
				return {
					player,
					mmr: await this.api.getPlayerMMR(player.Subject),
				};
			}),
		);

		for (const { player, mmr } of playerMMRs) {
			if (!mmr) continue;

			const { currentRank, currentRR, peakRank, peakRankSeasonId, lastGameMMRDiff } =
				utils.calculateRanking(mmr);

			const { rankName: currentRankName, rankColor: currentRankColor } = utils.getRank(currentRank);
			const { rankName: rankPeakName, rankColor: rankPeakColor } = utils.getRank(peakRank);

			const playerInfo = players.find((p) => p.Subject === player.Subject)!;

			const { GameName, TagLine } = playerInfo;
			const {
				uuid: agentId,
				displayName: agentName,
				killfeedPortrait: agentImage,
			} = utils.getAgent(player.CharacterID as string);
			const isEnemy = isPreGame ? false : (player as any).TeamID !== playerTeamId;

			const dodgeFlag = await this.cache
				.select<{ dodge: boolean }[]>(
					'SELECT * FROM players WHERE puuid = $1 AND dodge = "true"',
					[player.Subject],
				)
				.then((rows) => rows[0]);

			newTable[player.Subject] = {
				name: GameName,
				tag: TagLine,
				puuid: player.Subject,
				agentId,
				agentName,
				agentImage,
				currentRank: currentRankName,
				currentRankColor,
				currentRR,
				rankPeak: rankPeakName,
				rankPeakColor: rankPeakColor,
				rankPeakDate: !isPreGame && peakRankSeasonId ? utils.getSeasonDateById(peakRankSeasonId) : null,
				lastGameMMRDiff,
				enemy: isEnemy,
				accountLevel: player.PlayerIdentity?.AccountLevel ?? null,
				dodge: !!dodgeFlag?.dodge,
				inParty: false,
				partyId: null,
			};
		}

		return { table: newTable, match, players };
	}

	async processPlayers(
		players: PlayerNamesReponse[],
		match: CurrentPreGameMatchResponse | CurrentGameMatchResponse,
	): Promise<PlayerStatsResult> {
		const partyInput: { puuid: string; matches: MatchDetailsResponse[] }[] = [];

		const stats: Record<string, {
			kd: number;
			hs: number;
			adr: number;
			lastGameResult: string;
			lastGameScore: string;
			accountLevel: number;
			bestAgents: Array<{ agentId: string; agentUrl: string; avgKills: number; avgDeaths: number; avgKd: number; games: number }>;
			streak: { type: string; number: number } | null;
			name?: string;
			tag?: string;
		}> = {};

		for (const player of players) {
			const { History: matchHistory } = await this.api.getPlayerMatchHistory(player.Subject);
			const matches = await Promise.all(
				matchHistory.map((m) => this.api.getMatchDetails(m.MatchID)),
			);
			partyInput.push({ puuid: player.Subject, matches });

			const { kd, hs, adr } = utils.calculateStatsForPlayer(player.Subject, matches);
			const {
				result: lastGameResult,
				score: lastGameScore,
				accountLevel,
			} = utils.getMatchResult(player.Subject, matches[0]);
			const bestAgents = utils.getPlayerBestAgent(player.Subject, matches, match.MapID);

			const streak = utils.calculateStreak(player.Subject, matches);

			const playerStats: typeof stats[string] = {
				kd,
				hs,
				adr,
				lastGameResult,
				lastGameScore,
				accountLevel,
				bestAgents,
				streak,
			};

			if (player.GameName === "") {
				const name = utils.extractPlayerName(player.Subject, matches);
				if (name) {
					playerStats.name = name.name;
					playerStats.tag = name.tag;
				}
			}

			stats[player.Subject] = playerStats;
		}

		const parties = utils.extractParties(partyInput);
		const partyLookup: Record<string, number> = {};

		for (const party of parties) {
			for (const partyMember of party.puuids) {
				partyLookup[partyMember] = party.partyId;
			}
		}

		return { stats, partyLookup };
	}
}
