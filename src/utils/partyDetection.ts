import type { MatchDetailsResponse } from "@/interface";
import type { Parties } from "@/interface/utils.interface";

const extractParties = (data: { puuid: string; matches: MatchDetailsResponse[] }[]): Parties => {
	const connections = new Map<string, Set<string>>();
	const currentLobbyIds = new Set(data.map(({ puuid }) => puuid));

	for (const { puuid, matches } of data) {
		if (!connections.has(puuid)) {
			connections.set(puuid, new Set<string>());
		}

		for (const match of matches) {
			const player = match.players.find((p) => p.subject === puuid);
			if (!player?.partyId) continue;

			for (const teammate of match.players) {
				if (teammate.subject === puuid) continue;
				if (!currentLobbyIds.has(teammate.subject)) continue;
				if (teammate.partyId !== player.partyId) continue;
				if (player.teamId && teammate.teamId && player.teamId !== teammate.teamId) continue;

				connections.get(puuid)?.add(teammate.subject);

				if (!connections.has(teammate.subject)) {
					connections.set(teammate.subject, new Set<string>());
				}

				connections.get(teammate.subject)?.add(puuid);
			}
		}
	}

	const visited = new Set<string>();
	const parties: Parties = [];
	let nextPartyId = 1;

	for (const puuid of currentLobbyIds) {
		if (visited.has(puuid)) continue;

		const stack = [puuid];
		const component = new Set<string>();

		while (stack.length) {
			const current = stack.pop()!;
			if (visited.has(current)) continue;

			visited.add(current);
			component.add(current);

			for (const neighbor of connections.get(current) || []) {
				if (!visited.has(neighbor)) {
					stack.push(neighbor);
				}
			}
		}

		if (component.size < 2) continue;

		parties.push({
			partyId: nextPartyId,
			puuids: [...component],
		});

		nextPartyId += 1;
	}

	return parties;
};

export { extractParties };
