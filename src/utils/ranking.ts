import type { PlayerRanking } from "@/interface/utils.interface";
import type { PlayerMMRResponse } from "@/interface";

const calculateRanking = (playerMMR: PlayerMMRResponse): PlayerRanking => {
	const seasonalInfo = playerMMR?.QueueSkills.competitive.SeasonalInfoBySeasonID
		? Object.values(playerMMR.QueueSkills.competitive.SeasonalInfoBySeasonID)
		: [];

	const getSeasonPeakTier = (season: (typeof seasonalInfo)[number]) =>
		season.WinsByTier ? Math.max(...Object.keys(season.WinsByTier).map((tier) => Number(tier))) : season.CompetitiveTier;

	const peakSeason = seasonalInfo.reduce<(typeof seasonalInfo)[number] | null>((best, season) => {
		if (!best) return season;

		const seasonPeakTier = getSeasonPeakTier(season);
		const bestPeakTier = getSeasonPeakTier(best);

		if (seasonPeakTier !== bestPeakTier) {
			return seasonPeakTier > bestPeakTier ? season : best;
		}

		if (season.CompetitiveTier !== best.CompetitiveTier) {
			return season.CompetitiveTier > best.CompetitiveTier ? season : best;
		}

		return season.RankedRating > best.RankedRating ? season : best;
	}, null);

	return {
		currentRank: playerMMR?.LatestCompetitiveUpdate?.TierAfterUpdate || 0,
		currentRR: playerMMR?.LatestCompetitiveUpdate?.RankedRatingAfterUpdate || 0,
		peakRank: peakSeason ? getSeasonPeakTier(peakSeason) : 0,
		peakRankSeasonId: peakSeason?.SeasonID || null,
		lastGameMMRDiff: playerMMR?.LatestCompetitiveUpdate?.RankedRatingEarned || 0,
	};
};

export { calculateRanking };
