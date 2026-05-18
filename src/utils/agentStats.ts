import type { MatchDetailsResponse } from "@/api/schemas/shared";
import { getPlayerInMatch } from "./playerLookup";
import type { AgentStats } from "@/interface/common.interface";
import type { BestAgent, BestMaps } from "@/interface/utils.interface";

import { getAgent } from "./assetLookup";
import { calculateStatsForPlayer } from "./matchStats";

const getPlayerBestAgent = (puuid: string, matches: MatchDetailsResponse[], mapUrl: string): AgentStats[] => {
	const filtered = matches.filter((match) => match.matchInfo.mapId === mapUrl);

	const agents: {
		[key: string]: { k: number; d: number; kd: number; games: number };
	} = {};

	for (const match of filtered) {
		const player = getPlayerInMatch(match, puuid);

		if (!player?.stats) continue;

		const { kills, deaths } = player.stats;

		if (!(player.characterId in agents)) {
			agents[player.characterId] = { k: kills, d: deaths, kd: 0, games: 1 };
			continue;
		}

		agents[player.characterId].k += kills;
		agents[player.characterId].d += deaths;
		agents[player.characterId].games += 1;
	}

	for (const characterId in agents) {
		agents[characterId].k = Math.round(agents[characterId].k / agents[characterId].games);
		agents[characterId].d = Math.round(agents[characterId].d / agents[characterId].games);
		agents[characterId].kd = parseFloat((agents[characterId].k / agents[characterId].d).toFixed(2));
	}

	return Object.keys(agents)
		.map((characterId) => ({
			agentId: characterId,
			agentUrl: getAgent(characterId).displayIcon!,
			avgKills: agents[characterId].k,
			avgDeaths: agents[characterId].d,
			avgKd: agents[characterId].kd,
			games: agents[characterId].games,
		}))
		.sort((a, b) => b.avgKd - a.avgKd);
};

const calculateBestAgents = (puuid: string, matches: MatchDetailsResponse[]): BestAgent[] => {
	const bestAgents: BestAgent[] = [];

	const agentsByMatch: { [key: string]: MatchDetailsResponse[] } = {};

	for (const match of matches) {
		const player = getPlayerInMatch(match, puuid);

		if (!player?.characterId) continue;

		if (!(player.characterId in agentsByMatch)) {
			agentsByMatch[player.characterId] = [match];
		} else {
			agentsByMatch[player.characterId].push(match);
		}
	}

	for (const agentId in agentsByMatch) {
		const stats = calculateStatsForPlayer(puuid, agentsByMatch[agentId]);
		bestAgents.push({
			agentId,
			matches: agentsByMatch[agentId].length,
			...stats,
		});
	}

	return bestAgents.sort((a, b) => (b.matches || 1) - (a.matches || 0));
};

const calculateBestMaps = (puuid: string, matches: MatchDetailsResponse[]): BestMaps[] => {
	const bestMaps: BestMaps[] = [];

	const mapsByMatch: { [key: string]: MatchDetailsResponse[] } = {};

	for (const match of matches) {
		if (!(match.matchInfo.mapId in mapsByMatch)) {
			mapsByMatch[match.matchInfo.mapId] = [match];
		} else {
			mapsByMatch[match.matchInfo.mapId].push(match);
		}
	}

	for (const mapId in mapsByMatch) {
		const stats = calculateStatsForPlayer(puuid, mapsByMatch[mapId]);
		bestMaps.push({
			mapId,
			matches: mapsByMatch[mapId].length,
			...stats,
		});
	}

	return bestMaps.sort((a, b) => (b.matches || 1) - (a.matches || 0));
};

export { calculateBestAgents, calculateBestMaps, getPlayerBestAgent };
