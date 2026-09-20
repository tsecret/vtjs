import type { MatchDetailsResponse } from "@/api/schemas/shared";
import { findPlayerInMatch } from "./playerLookup";
import type { Result } from "@/interface";
import type { MatchResult, PlayerMatchStats, Streak } from "@/interface/utils.interface";

const getMatchResult = (puuid: string, match: MatchDetailsResponse): MatchResult => {
	if (!match?.teams) return { result: "N/A", score: "", accountLevel: 0 };

	const player = findPlayerInMatch(match, puuid);
	if (!player) return { result: "N/A" as Result, score: "", accountLevel: 0 };

	const team = match.teams.find((team) => team.teamId === player.teamId);

	if (match.teams[0].roundsWon === match.teams[1].roundsWon)
		return {
			result: "tie" as Result,
			score: `${match.teams[0].roundsWon}:${match.teams[1].roundsWon}`,
			accountLevel: player.accountLevel || 0,
		};

	const opponentTeam = match.teams.find((t) => t.teamId !== player.teamId);

	return {
		result: team?.won ? ("won" as Result) : ("loss" as Result),
		score: `${team?.roundsWon ?? 0}:${opponentTeam?.roundsWon ?? 0}`,
		accountLevel: player.accountLevel || 0,
	};
};

const calculateStreak = (puuid: string, matches: MatchDetailsResponse[]): Streak | null => {
	if (!matches.length) return null;

	const results: Result[] = [];

	for (const match of matches) {
		const { result } = getMatchResult(puuid, match);
		if (result === "N/A") continue;
		results.push(result);
	}

	if (!results.length) return null;

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
	let totalKills = 0;
	let totalDeaths = 0;
	let totalAssists = 0;
	let wins = 0;
	let losses = 0;
	let totalDamage = 0;
	let totalRounds = 0;
	let totalHeadshots = 0;
	let totalShots = 0;

	for (const match of matches) {
		const player = findPlayerInMatch(match, puuid);

		if (!player?.stats) continue;

		validMatches += 1;
		totalKills += player.stats.kills;
		totalDeaths += player.stats.deaths;
		totalAssists += player.stats.assists;

		const { result } = getMatchResult(puuid, match);
		if (result === "won") wins += 1;
		else if (result === "loss" || result === "tie") losses += 1;

		if (match.roundResults) {
			let matchDamage = 0;

			for (const roundResult of match.roundResults) {
				const playerDamage = roundResult.playerStats.find((r) => r.subject === puuid);
				if (!playerDamage) continue;
				for (const damage of playerDamage.damage) {
					totalHeadshots += damage.headshots;
					totalShots += damage.headshots + damage.bodyshots + damage.legshots;
					matchDamage += damage.damage;
				}
			}

			totalDamage += matchDamage;
			totalRounds += match.roundResults.length;
		}
	}

	if (validMatches === 0) return {
		kills: 0, deaths: 0, assists: 0, kd: 0, hs: 0, adr: 0, wins: 0, losses: 0, winrate: 0,
	};

	return {
		kills: Math.round(totalKills / validMatches),
		deaths: Math.round(totalDeaths / validMatches),
		assists: Math.round(totalAssists / validMatches),
		kd: Number((totalKills / (totalDeaths || 1)).toFixed(2)),
		hs: totalShots ? Math.round((totalHeadshots / totalShots) * 100) : 0,
		adr: totalRounds ? Math.round(totalDamage / totalRounds) : 0,
		wins,
		losses,
		winrate: Math.round((wins / validMatches) * 100),
	};
};

export { calculateStatsForPlayer, calculateStreak, getMatchResult };
