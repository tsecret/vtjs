import type { PlayerRow } from "@/interface";
import { THRESHOLDS } from "./constants";

const isSmurf = (player: PlayerRow): boolean => {
	return Boolean(player.accountLevel && player.accountLevel < THRESHOLDS.SMURF_ACCOUNT_LEVEL_THRESHOLD && player.kd && player.kd > THRESHOLDS.SMURF_KD_THRESHOLD);
};

export { isSmurf };
