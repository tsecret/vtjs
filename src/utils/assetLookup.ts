import agents from "@/assets/agents.json";
import maps from "@/assets/maps.json";
import ranks from "@/assets/ranks.json";
import seasons from "@/assets/seasons.json";

import type { Agent, Map as MapType, Rank } from "@/interface";

const getAgent = (uuid: string): Agent => {
	if (!uuid) return { uuid: "", displayName: "", killfeedPortrait: "", displayIcon: "" };

	return (
		agents.find((agent) => agent.uuid === uuid.toLowerCase()) || {
			uuid: "",
			displayName: "New Agent",
			killfeedPortrait: "",
			displayIcon: "",
		}
	);
};

const getRank = (rank: number): Rank => {
	const _rank = ranks.find((_rank) => _rank.tier === rank);
	return {
		tier: rank,
		rankName: _rank?.tierName as string,
		rankColor: _rank?.color as string,
		rankImg: _rank?.largeIcon as string,
	};
};

const getMap = (uuid: string): MapType => {
	const map = maps.find((map) => map.mapUrl === uuid);
	return map || { uuid, displayName: "New Map", displayIcon: "", listViewIcon: "" };
};

const getSeasonDateById = (seasonId: string): Date | null => {
	const season = seasons.find((season) => season.seasonUuid === seasonId);
	if (!season) return null;

	return new Date(season.endTime);
};

export { getAgent, getMap, getRank, getSeasonDateById };
