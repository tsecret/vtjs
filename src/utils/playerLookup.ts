import type { MatchDetailsResponse } from "@/api/schemas/shared";

/**
 * Find a player in match details by their PUUID.
 * Throws if player not found — caller guarantees player exists in match.
 */
export function getPlayerInMatch(
	match: MatchDetailsResponse,
	puuid: string,
): MatchDetailsResponse["players"][0] {
	const player = match.players.find((p) => p.subject === puuid);
	if (!player) {
		throw new Error(`Player ${puuid} not found in match ${match.metadata.matchId}`);
	}
	return player;
}
