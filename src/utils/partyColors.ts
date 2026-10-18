/**
 * Distinct colors used to tell parties apart in the match table.
 * A 5v5 game fits at most 4 parties (2+2+1 per team), so 4 colors is enough.
 */
export const PARTY_COLORS = ["#8b5cf6", "#f59e0b", "#10b981", "#ec4899"];

export type PartyAssignment = {
	partyNumber: number | null;
	partyColor: string | null;
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
