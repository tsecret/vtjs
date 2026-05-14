import type { MatchDetailsResponse, Result } from "@/interface";
import type { MatchResult, PlayerMatchStats, Streak } from "@/interface/utils.interface";

const getMatchResult = (puuid: string, match: MatchDetailsResponse): MatchResult => {
	if (!match?.teams) return { result: "N/A", score: "", accountLevel: 0 };

	const player = match.players.find((player) => player.subject === puuid);
	const team = match.teams.find((team) => team.teamId === player?.teamId);

	if (match.teams[0].roundsWon === match.teams[1].roundsWon)
		return {
			result: "tie" as Result,
			score: `${match.teams[0].roundsWon}:${match.teams[1].roundsWon}`,
			accountLevel: player?.accountLevel || 0,
		};

	return {
		result: team?.won ? ("won" as Result) : ("loss" as Result),
		score: `${team?.roundsWon ?? 0}:${team?.roundsPlayed ?? 0 - (team?.roundsWon ?? 0)}`,
		accountLevel: player?.accountLevel || 0,
	};
};

const calculateStreak = (puuid: string, matches: MatchDetailsResponse[]): Streak | null => {
	if (!matches.length) return null;

	const results: Result[] = [];

	for (const match of matches) {
		const { result } = getMatchResult(puuid, match);
		results.push(result);
	}

	const streak: Streak = {
		type: results[0],
		number: 0,
	};

	for (const result of results) {
		if (result === streak.type) {
			streak.number += 1;
		} else {
			break;
		}
	}

	return streak;
};

const calculateStatsForPlayer = (puuid: string, matches: MatchDetailsResponse[]): PlayerMatchStats => {
	let validMatches = 0;
	const stats = {
		kills: 0,
		deaths: 0,
		assists: 0,
		kd: 0,
		hs: 0,
		adr: 0,
		wins: 0,
		losses: 0,
		ties: 0,
		winrate: 0,
	};

	for (const match of matches) {
		const player = match.players.find((player) => player.subject === puuid);

		if (!player?.stats) continue;

		validMatches += 1;
		stats.kills += player.stats.kills;
		stats.deaths += player.stats.deaths;
		stats.assists += player.stats.assists;
		stats.kd += player.stats.kills / (player.stats.deaths || 1);

		const { result } = getMatchResult(puuid, match);
		if (result === "won") stats.wins += 1;
		else if (result === "loss") stats.losses += 1;
		else if (result === "tie") stats.ties += 1;

		if (match.roundResults) {
			const shots = { legshots: 0, bodyshots: 0, headshots: 0 };
			let damagePerRound = 0;

			for (const roundResult of match.roundResults) {
				const playerDamage = roundResult.playerStats.find((result) => result.subject === puuid);
				if (!playerDamage) continue;
				for (const damage of playerDamage.damage) {
					shots.legshots += damage.legshots;
					shots.bodyshots += damage.bodyshots;
					shots.headshots += damage.headshots;
					damagePerRound += damage.damage;
				}
			}

			stats.adr += damagePerRound / match.roundResults.length;
			stats.hs += shots.headshots / (shots.headshots + shots.bodyshots + shots.legshots);
		}
	}

	if (validMatches === 0) return stats;

	return {
		kills: Math.round(stats.kills / validMatches),
		deaths: Math.round(stats.deaths / validMatches),
		assists: Math.round(stats.assists / validMatches),
		kd: Number((stats.kd / validMatches).toFixed(2)),
		hs: Math.round((stats.hs / validMatches) * 100),
		adr: Math.round(stats.adr / validMatches),
		wins: stats.wins,
		losses: stats.losses,
		ties: stats.ties,
		winrate: Math.round((stats.wins / validMatches) * 100),
	};
};

export { calculateStatsForPlayer, calculateStreak, getMatchResult };
