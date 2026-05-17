import { useAptabase } from "@aptabase/react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { useServices } from "@/lib/services";
import { MatchProcessing } from "@/lib/match-processing";
import type { PlayerRow } from "@/interface/common.interface";
import atoms from "../utils/atoms";

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

	const processingRef = useRef<MatchProcessing | null>(null);
	const currentMatchRef = useRef<{
		matchId: string | null;
		isProcessing: boolean;
	}>({
		matchId: null,
		isProcessing: false,
	});

	useEffect(() => {
		if (sharedapi && cache && !processingRef.current) {
			processingRef.current = new MatchProcessing({ api: sharedapi, cache });
		}
	}, [sharedapi, cache]);

	const handleMatch = useCallback(
		async (matchId: string, isPreGame: boolean) => {
			if (!sharedapi || !puuid) return;
			if (currentMatchRef.current.isProcessing) return;

			const processing = processingRef.current;
			if (!processing) return;

			currentMatchRef.current = { matchId, isProcessing: true };

			setMatchProcessing({
				isProcessing: true,
				currentPlayer: null,
				progress: { step: 0, total: 0 },
			});

			try {
				if (allowAnalytics) await trackEvent(isPreGame ? "check_pregame" : "check_game");

				const newTable = { ...table };
				Object.keys(newTable).forEach((key) => {
					delete newTable[key];
				});
				setTable(newTable);

				const result = await processing.handleMatch(matchId, isPreGame, puuid);

				setTable(result.table as Record<string, PlayerRow>);
				setCurrentMatch(result.match);

				// Process player stats using the same players array from handleMatch
				const { stats, partyLookup } = await processing.processPlayers(result.players, result.match);

				setTable((prevTable) => {
					const nextTable = { ...prevTable };

					for (const puuid of Object.keys(stats)) {
						nextTable[puuid] = {
							...nextTable[puuid],
							...stats[puuid],
						} as PlayerRow;
					}

					for (const player of result.players) {
						nextTable[player.Subject] = {
							...nextTable[player.Subject],
							inParty: player.Subject in partyLookup,
							partyId: partyLookup[player.Subject] ?? null,
						};
					}

					return nextTable;
				});

				if (allowAnalytics) await trackEvent("check_finish");
			} catch (error) {
				console.error("Error processing match:", error);
			} finally {
				currentMatchRef.current = { matchId: null, isProcessing: false };
				setMatchProcessing({
					isProcessing: false,
					currentPlayer: null,
					progress: { step: 0, total: 0 },
				});
			}
		},
		[sharedapi, puuid, table, setTable, setCurrentMatch, setMatchProcessing, allowAnalytics, trackEvent],
	);

	const handleGameEnd = useCallback(async () => {
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
	}, [setTable, setCurrentMatch, setMatchProcessing]);

	useEffect(() => {
		if (!sharedapi || !puuid) return;

		switch (gameState.state) {
			case "PREGAME":
				sharedapi.getCurrentPreGamePlayer(puuid).then((match) => {
					if (match) handleMatch(match.MatchID, true);
				});
				break;
			case "INGAME":
				sharedapi.getCurrentGamePlayer(puuid).then((match) => {
					if (match) handleMatch(match.MatchID, false);
				});
				break;
			default:
				handleGameEnd();
		}
	}, [gameState, sharedapi, puuid, handleMatch, handleGameEnd]);

	return null;
};
