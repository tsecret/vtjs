import type { PenaltiesResponse } from "@/api/schemas/shared";
import type { Penalties } from "@/interface/utils.interface";

const extractPenalties = (penalties: PenaltiesResponse): Penalties | null => {
	if (!penalties.Infractions.length) return null;

	const filteredPenalties = penalties.Penalties.filter((p) => p.RiotRestrictionEffect);

	const penalty = filteredPenalties.find(
		(penalty) => penalty.RiotRestrictionEffect.RestrictionType === "PBE_LOGIN_TIME_BAN",
	);

	if (!penalty) return null;

	return {
		freeTimestamp: +new Date(penalty.Expiry),
		type: filteredPenalties.map((p) => p.RiotRestrictionEffect.RestrictionType),
		reason: filteredPenalties.map((p) => p.RiotRestrictionEffect.RestrictionReason).filter((p) => p.length),
		matchId: penalty.IssuingMatchID,
	};
};

export { extractPenalties };
