import type {
	CurrentGameMatchResponse,
	CurrentPreGameMatchResponse,
	MatchDetailsResponse,
} from "@/api/schemas/shared";
import { findPlayerInMatch } from "./playerLookup";

const extractPlayers = (
	match: CurrentPreGameMatchResponse | CurrentGameMatchResponse | MatchDetailsResponse,
): string[] => {
	if ("AllyTeam" in match && match.AllyTeam?.Players)
		return match.AllyTeam.Players.map((player) => player.Subject) || [];

	if ("Players" in match) return match.Players.map((player) => player.Subject);

	return (match as MatchDetailsResponse).players.map((player) => player.subject);
};

const extractPlayerName = (puuid: string, matches: MatchDetailsResponse[]): { name: string; tag: string } | null => {
	for (const match of matches) {
		const player = findPlayerInMatch(match, puuid);
		if (!player) continue;

		if (player.subject !== "" && player.tagLine !== "") return { name: player.gameName, tag: player.tagLine };
	}
	return null;
};

export { extractPlayerName, extractPlayers };
