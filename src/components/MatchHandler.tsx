import { useAptabase } from "@aptabase/react";
import { useServices } from "@/lib/services";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import { CurrentGameMatchResponse, CurrentPreGameMatchResponse, MatchDetailsResponse, PlayerNamesReponse } from "../interface";
import atoms from "../utils/atoms";
import * as utils from "../utils/utils";

export const MatchHandler = () => {
	const services = useServices();
	const sharedapi = services?.sharedapi;
	const cache = services?.cache;

	const [table, setTable] = useAtom(atoms.table);
	const puuid = useAtomValue(atoms.puuid);
	const allowAnalytics = useAtomValue(atoms.allowAnalytics);
	const gameState = useAtomValue(atoms.gameState);
	const setMatchProcessing = useSetAtom(atoms.matchProcessing);
	const setCurrentMatch = useSetAtom(atoms.currentMatch);

	const { trackEvent } = useAptabase();

	const currentMatchRef = useRef<{
		matchId: string | null;
		isProcessing: boolean;
	}>({
		matchId: null,
		isProcessing: false,
	});

	async function handleMatch(matchId: string, isPreGame: boolean, trackEventName: string) {
		if (!sharedapi || !puuid) return;
		if (currentMatchRef.current.isProcessing) return;

		currentMatchRef.current = { matchId, isProcessing: true };
		setMatchProcessing({
			isProcessing: true,
			currentPlayer: null,
			progress: { step: 0, total: 0 },
		});

		try {
			if (allowAnalytics) await trackEvent(trackEventName);

			const newTable = { ...table };
			Object.keys(newTable).forEach((key) => {
				delete newTable[key];
			});
			setTable(newTable);

			const match = isPreGame
				? await sharedapi.getCurrentPreGameMatch(matchId)
				: await sharedapi.getCurrentGameMatch(matchId);

			if (!match) return;

			const puuids = utils.extractPlayers(match);
			const players = await sharedapi.getPlayerNames(puuids);

			const updatedTable = { ...table };

			if (isPreGame) {
				const preGameMatch = match as CurrentPreGameMatchResponse;
				preGameMatch.AllyTeam?.Players.forEach((player: any) => {
					updatedTable[player.Subject] = {} as any;
				});
			} else {
				const gameMatch = match as CurrentGameMatchResponse;
				gameMatch.Players.forEach((player: any) => {
					updatedTable[player.Subject] = {} as any;
				});
			}

			const playerTeamId = isPreGame
				? null
				: ((match as CurrentGameMatchResponse).Players.find((player: any) => player.Subject === puuid)?.TeamID as
						| "RED"
						| "BLUE");

			const playersToProcess = isPreGame
				? (match as CurrentPreGameMatchResponse).AllyTeam?.Players || []
				: (match as CurrentGameMatchResponse).Players;

			for (const player of playersToProcess) {
				try {
					// const playerMMR = await sharedapi.getPlayerMMR(player.Subject);
					// const { currentRank, currentRR, peakRank, peakRankSeasonId, lastGameMMRDiff, mmr } = utils.calculateRanking(playerMMR);

					const compUpdates = await sharedapi.getCompetitiveUpdates(player.Subject);
					const {
						TierAfterUpdate: currentRank,
						RankedRatingAfterUpdate: currentRR,
						RankedRatingEarned: lastGameMMRDiff,
					} = compUpdates.Matches.length > 0
						? compUpdates.Matches[0]
						: {
								TierAfterUpdate: 1,
								RankedRatingAfterUpdate: 1,
								RankedRatingEarned: 1,
							};
					const peakRank = 1;
					const mmr = 0;

					const { rankName: currentRankName, rankColor: currentRankColor } = utils.getRank(currentRank);
					const { rankName: rankPeakName, rankColor: rankPeakColor } = utils.getRank(peakRank);

					const playerInfo = players.find((p) => p.Subject === player.Subject)!;

					const { GameName, TagLine } = playerInfo;
					const {
						uuid: agentId,
						displayName: agentName,
						killfeedPortrait: agentImage,
					} = utils.getAgent(player.CharacterID as string);
					const isEnemy = isPreGame ? false : (player as any).TeamID !== playerTeamId;

					const retard = await cache
						?.select<{ dodge: boolean }[]>('SELECT * FROM players WHERE puuid = $1 AND dodge = "true"', [
							player.Subject,
						])
						.then((players) => players[0]);

					updatedTable[player.Subject] = {
						name: GameName,
						tag: TagLine,
						puuid: player.Subject,
						agentId: agentId,
						agentName: agentName,
						agentImage: agentImage,
						currentRank: currentRankName,
						currentRankColor,
						currentRR,
						mmr,
						rankPeak: rankPeakName,
						rankPeakColor: rankPeakColor,
						rankPeakDate: null,
						// rankPeakDate: !isPreGame && peakRankSeasonId ? utils.getSeasonDateById(peakRankSeasonId) : null,
						lastGameMMRDiff,
						enemy: isEnemy,
						accountLevel: player.PlayerIdentity.AccountLevel || null,
						dodge: retard?.dodge || false,
						inParty: false,
						partyId: null,
					};
				} catch (error) {
					console.error(`Failed to process player ${player.Subject}:`, error);
				}
			}

			setTable(updatedTable);
			setCurrentMatch(match);

			processPlayers(utils.sortPlayersForProcessing(players, updatedTable), match);
		} catch (error) {
			console.error("Error processing match:", error);
		} finally {
			currentMatchRef.current.isProcessing = false;
			setMatchProcessing({
				isProcessing: false,
				currentPlayer: null,
				progress: { step: 0, total: 0 },
			});
		}
	}

	async function processPlayers(
		players: PlayerNamesReponse[],
		match: CurrentPreGameMatchResponse | CurrentGameMatchResponse,
	) {
		if (!sharedapi) return;

		try {
			const partyInput: { puuid: string; matches: MatchDetailsResponse[] }[] = [];

			setMatchProcessing({
				isProcessing: true,
				currentPlayer: null,
				progress: { step: 0, total: players.length },
			});

			for (const i in players) {
				const player = players[i];

				setMatchProcessing({
					isProcessing: true,
					currentPlayer: player.GameName || player.Subject,
					progress: { step: parseInt(i) + 1, total: players.length },
				});

				const { History: matchHistory } = await sharedapi.getPlayerMatchHistory(player.Subject);
				const matches = await Promise.all(matchHistory.map((match) => sharedapi.getMatchDetails(match.MatchID)));
				partyInput.push({ puuid: player.Subject, matches });

				const { kd, hs, adr } = utils.calculateStatsForPlayer(player.Subject, matches);
				const {
					result: lastGameResult,
					score: lastGameScore,
					accountLevel,
				} = utils.getMatchResult(player.Subject, matches[0]);
				const bestAgents = utils.getPlayerBestAgent(player.Subject, matches, match.MapID);

				const streak = utils.calculateStreak(player.Subject, matches);

				let data = {
					kd,
					hs,
					adr,
					lastGameResult,
					lastGameScore,
					accountLevel,
					bestAgents,
					streak,
				};

				if (player.GameName === "") {
					const name = utils.extractPlayerName(player.Subject, matches);
					if (name) {
						data = {
							...data,
							...name,
						};
					}
				}

				setTable((prevTable) => ({
					...prevTable,
					[player.Subject]: {
						...prevTable[player.Subject],
						...data,
					},
				}));
			}

			const parties = utils.extractParties(partyInput);
			const partyLookup: Record<string, number> = {};

			for (const party of parties) {
				for (const partyMember of party.puuids) {
					partyLookup[partyMember] = party.partyId;
				}
			}

			setTable((prevTable) => {
				const nextTable = { ...prevTable };

				for (const player of players) {
					nextTable[player.Subject] = {
						...nextTable[player.Subject],
						inParty: player.Subject in partyLookup,
						partyId: partyLookup[player.Subject] ?? null,
					};
				}

				return nextTable;
			});

			setMatchProcessing({
				isProcessing: false,
				currentPlayer: null,
				progress: { step: 0, total: 0 },
			});

			if (allowAnalytics) await trackEvent("check_finish");
		} catch (error) {
			console.error("Error processing detailed stats:", error);
		}
	}

	async function handleGameEnd() {
		if (!currentMatchRef.current.matchId) return;

		try {
			console.log("Match ended, data cleared");
		} finally {
			setTable({});
			setCurrentMatch(null);
			setMatchProcessing({
				isProcessing: false,
				currentPlayer: null,
				progress: { step: 0, total: 0 },
			});
			currentMatchRef.current = { matchId: null, isProcessing: false };
		}
	}

	useEffect(() => {
		if (!sharedapi || !puuid) return;

		switch (gameState.state) {
			case "PREGAME":
				sharedapi.getCurrentPreGamePlayer(puuid).then((match) => {
					if (match) handleMatch(match.MatchID, true, "check_pregame");
				});
				break;
			case "INGAME":
				sharedapi.getCurrentGamePlayer(puuid).then((match) => {
					if (match) handleMatch(match.MatchID, false, "check_game");
				});
				break;
			case "MENUS":
			default:
				handleGameEnd();
		}
	}, [gameState, sharedapi, puuid]);

	return null;
};
