import type { PlayerRow } from "@/interface";

const isSmurf = (player: PlayerRow): boolean => {
	return Boolean(player.accountLevel && player.accountLevel < 100 && player.kd && player.kd > 1.5);
};

export { isSmurf };
