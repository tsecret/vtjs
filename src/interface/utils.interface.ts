import type { Encounters, MostPlayedServer, Result } from "./common.interface";

export type BestAgent = {
	agentId: string;
	matches: number;
	wins: number;
	losses: number;
	winrate: number;
	kills: number;
	deaths: number;
	assists: number;
	kd: number;
	hs: number;
	adr: number;
};

export type BestMaps = {
	mapId: string;
	matches: number;
	wins: number;
	losses: number;
	winrate: number;
	kills: number;
	deaths: number;
	assists: number;
	kd: number;
	hs: number;
	adr: number;
};

export type BestServer = {
	serverName: string;
	matches: number;
	wins: number;
	losses: number;
	winrate: number;
	kills: number;
	deaths: number;
	assists: number;
	kd: number;
	hs: number;
	adr: number;
};

export type PlayerMatchStats = {
	kills: number;
	deaths: number;
	assists: number;
	kd: number;
	hs: number;
	adr: number;
	wins: number;
	losses: number;
	winrate: number;
};

export type PlayerRanking = {
	currentRank: number;
	currentRR: number;
	peakRank: number;
	peakRankSeasonId: string | null;
	lastGameMMRDiff: number;
};

export type Rank = {
	tier: number;
	rankName: string;
	rankColor: string;
	rankImg: string;
};

export type MatchResult = {
	result: Result;
	score: string;
	accountLevel: number;
};

export type Parties = {
	partyId: number;
	puuids: string[];
}[];

export type { Encounters, MostPlayedServer };
