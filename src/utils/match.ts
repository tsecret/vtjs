import type { CurrentPreGameMatchResponse, CurrentGameMatchResponse, MatchDetailsResponse, PlayerNamesReponse, PlayerRow } from "@/interface";

const extractPlayers = (
	match: CurrentPreGameMatchResponse | CurrentGameMatchResponse | MatchDetailsResponse,
): string[] => {
	if ("AllyTeam" in match && match.AllyTeam?.Players) return match.AllyTeam.Players.map((player) => player.Subject) || [];

	if ("Players" in match) return match.Players.map((player) => player.Subject);

	return (match as MatchDetailsResponse).players.map((player) => player.subject);
};

const extractPlayerName = (
	puuid: string,
	matches: MatchDetailsResponse[],
): { name: string; tag: string } | null => {
	for (const match of matches) {
		const player = match.players.find((player) => player.subject === puuid);
		if (!player) continue;

		if (player.subject !== "" && player.tagLine !== "") return { name: player.gameName, tag: player.tagLine };
	}
	return null;
};

const sortPlayersForProcessing = (
	players: PlayerNamesReponse[],
	table: Record<string, PlayerRow>,
): PlayerNamesReponse[] => {
	const playersObj: Record<string, PlayerNamesReponse> = {};
	for (const player of players) {
		playersObj[player.Subject] = player;
	}

	const tableAsArray = Object.values(table).sort((a, b) => {
		if (a.enemy !== b.enemy) {
			return +a.enemy - +b.enemy;
		}

		if (a.accountLevel && b.accountLevel) return a.accountLevel - b.accountLevel;
		if (a.accountLevel) return -1;
		if (b.accountLevel) return 1;
		return 0;
	});

	return tableAsArray.map((p) => playersObj[p.puuid]);
};

export { extractPlayers, extractPlayerName, sortPlayersForProcessing };
