/**
 * Seven colors to tell parties apart. A 5v5 game holds at most 4 real parties
 * (2+2+1 split per team), so the last three are spare for other modes.
 *
 * Each entry has both forms of the same color:
 * - `hex`: party pill background in the match table.
 * - `cls`: party icon class in the players table.
 * Keep the two lists in sync, one entry per color.
 */
const PALETTE = [
	{ hex: "#ef4444", cls: "text-red-500" },
	{ hex: "#3b82f6", cls: "text-blue-500" },
	{ hex: "#22c55e", cls: "text-green-500" },
	{ hex: "#ca8a04", cls: "text-yellow-600" },
	{ hex: "#a855f7", cls: "text-purple-500" },
	{ hex: "#f97316", cls: "text-orange-500" },
	{ hex: "#ec4899", cls: "text-pink-500" },
];

export const PARTY_COLORS = PALETTE.map((entry) => entry.hex);
export const PARTY_ICON_CLASSES = PALETTE.map((entry) => entry.cls);

export type PartyAssignment = {
	partyNumber: number | null;
	partyColor: string | null;
};

/** FNV-1a 32-bit: the same string always hashes to the same value. */
const hashString = (value: string): number => {
	let hash = 0x811c9dc5;
	for (let i = 0; i < value.length; i += 1) {
		hash ^= value.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return hash >>> 0;
};

/**
 * Stable color class for a party: the same `partyId` always maps to the same
 * class, no matter which table it shows up in. Returns `null` when the player
 * has no party so the icon can fall back to the muted color.
 */
export const getPartyIconClass = (partyId: string | number | null | undefined): string | null => {
	if (partyId === null || partyId === undefined || partyId === "") return null;
	return PARTY_ICON_CLASSES[hashString(String(partyId)) % PARTY_ICON_CLASSES.length];
};

/**
 * Assign a number and a color to every player that belongs to a real party.
 *
 * A "real party" is 2 or more players sharing the same non-empty `partyId`.
 * Solo players (empty or unique `partyId`) get `null` for both fields.
 *
 * Numbers start at 1 and are assigned globally in order of first appearance,
 * so every member of a party shares the same number and color.
 */
export const assignPartyColors = <T extends { partyId: string }>(players: T[]): (T & PartyAssignment)[] => {
	const partySizes = new Map<string, number>();
	for (const player of players) {
		if (!player.partyId) continue;
		partySizes.set(player.partyId, (partySizes.get(player.partyId) || 0) + 1);
	}

	let nextPartyNumber = 0;
	const partyNumbers = new Map<string, number>();

	return players.map((player) => {
		if (!player.partyId || (partySizes.get(player.partyId) || 0) < 2) {
			return { ...player, partyNumber: null, partyColor: null };
		}

		let partyNumber = partyNumbers.get(player.partyId);
		if (partyNumber === undefined) {
			partyNumber = nextPartyNumber;
			partyNumbers.set(player.partyId, partyNumber);
			nextPartyNumber += 1;
		}

		return {
			...player,
			partyNumber: partyNumber + 1,
			partyColor: PARTY_COLORS[partyNumber % PARTY_COLORS.length],
		};
	});
};
