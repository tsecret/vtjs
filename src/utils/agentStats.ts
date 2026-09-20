import type { MatchDetailsResponse } from "@/api/schemas/shared";
import { findPlayerInMatch } from "./playerLookup";
import type { AgentStats } from "@/interface/common.interface";
import type { BestAgent, BestMaps, BestServer } from "@/interface/utils.interface";

import { getAgent } from "./assetLookup";
import { calculateStatsForPlayer } from "./matchStats";

const getPlayerBestAgent = (puuid: string, matches: MatchDetailsResponse[], mapUrl: string): AgentStats[] => {
	const filtered = matches.filter((match) => match.matchInfo.mapId === mapUrl);

	const matchesByAgent: { [key: string]: MatchDetailsResponse[] } = {};

	for (const match of filtered) {
		const player = findPlayerInMatch(match, puuid);

		if (!player?.characterId) continue;

		if (!(player.characterId in matchesByAgent)) {
			matchesByAgent[player.characterId] = [match];
		} else {
			matchesByAgent[player.characterId].push(match);
		}
	}

	return Object.entries(matchesByAgent)
		.map(([characterId, agentMatches]) => {
			const stats = calculateStatsForPlayer(puuid, agentMatches);

			return {
				agentId: characterId,
				agentUrl: getAgent(characterId).displayIcon!,
				avgKills: stats.kills,
				avgDeaths: stats.deaths,
				avgKd: stats.kd,
				games: agentMatches.length,
			};
		})
		.sort((a, b) => b.avgKd - a.avgKd);
};

const calculateBestAgents = (puuid: string, matches: MatchDetailsResponse[]): BestAgent[] => {
	const bestAgents: BestAgent[] = [];

	const agentsByMatch: { [key: string]: MatchDetailsResponse[] } = {};

	for (const match of matches) {
		const player = findPlayerInMatch(match, puuid);

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

const extractServerName = (gamePodId: string): string => {
	const parts = gamePodId.split("-");
	if (parts.length >= 2) {
		return parts[parts.length - 2];
	}
	return gamePodId;
};

const calculateBestServers = (puuid: string, matches: MatchDetailsResponse[]): BestServer[] => {
	const bestServers: BestServer[] = [];

	const serversByMatch: { [key: string]: MatchDetailsResponse[] } = {};

	for (const match of matches) {
		const serverName = extractServerName(match.matchInfo.gamePodId);

		if (!(serverName in serversByMatch)) {
			serversByMatch[serverName] = [match];
		} else {
			serversByMatch[serverName].push(match);
		}
	}

	for (const serverName in serversByMatch) {
		const stats = calculateStatsForPlayer(puuid, serversByMatch[serverName]);
		bestServers.push({
			serverName,
			matches: serversByMatch[serverName].length,
			...stats,
		});
	}

	return bestServers.sort((a, b) => (b.matches || 1) - (a.matches || 0));
};

export { calculateBestAgents, calculateBestMaps, calculateBestServers, extractServerName, getPlayerBestAgent };
