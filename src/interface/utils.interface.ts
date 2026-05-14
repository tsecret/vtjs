import type { Encounters, MostPlayedServer, Result, Streak } from "./common.interface";
import type { PenaltiesResponse } from "../api/schemas/shared";

export type BestAgent = {
	agentId: string;
	matches: number;
	wins: number;
	losses: number;
	ties: number;
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
	ties: number;
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
	ties: number;
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

export type Penalties = {
	freeTimestamp: number;
	type: PenaltiesResponse["Penalties"][0]["RiotRestrictionEffect"]["RestrictionType"][];
	reason: PenaltiesResponse["Penalties"][0]["RiotRestrictionEffect"]["RestrictionReason"][];
	matchId: string;
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

// Re-export from common.interface for backwards compatibility
export type { Encounters, MostPlayedServer, Streak };
