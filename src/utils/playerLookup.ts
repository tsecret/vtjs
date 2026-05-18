import type { MatchDetailsResponse } from "@/api/schemas/shared";

/**
 * Find a player in match details by their PUUID.
 * Returns undefined if player not found in this match.
 */
export function findPlayerInMatch(
	match: MatchDetailsResponse,
	puuid: string,
): MatchDetailsResponse["players"][0] | undefined {
	return match.players.find((p) => p.subject === puuid);
}
