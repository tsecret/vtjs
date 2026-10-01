import { useAptabase } from "@aptabase/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import { useServices } from "@/lib/services";
import { PlayersTable } from "../components/PlayersTable";
import { getMap } from "../utils";
import atoms from "../utils/atoms";
import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Main = () => {
	const services = useServices();
	const [error, setError] = useState<string | null>(null);

	const puuid = useAtomValue(atoms.puuid);
	const player = useAtomValue(atoms.player);
	const sharedapi = services?.sharedapi;
	const table = useAtomValue(atoms.table);
	const allowAnalytics = useAtomValue(atoms.allowAnalytics);
	const matchProcessing = useAtomValue(atoms.matchProcessing);
	const currentMatch = useAtomValue(atoms.currentMatch);
	const gameState = useAtomValue(atoms.gameState);
	const setGameState = useSetAtom(atoms.gameState);

	const { trackEvent } = useAptabase();

	async function manualCheck() {
		setError(null);
		if (!puuid || !sharedapi) return;

		try {
			const currentPreGamePlayer = await sharedapi.getCurrentPreGamePlayer(puuid);
			const currentGamePlayer = currentPreGamePlayer ? null : await sharedapi.getCurrentGamePlayer(puuid);

			if (!currentPreGamePlayer && !currentGamePlayer) {
				setError("No current game found");
				if (allowAnalytics) {
					await trackEvent("check_nogame");
				}
				return;
			}

			if (allowAnalytics) {
				await trackEvent("manual_check");
			}

			if (currentPreGamePlayer) setGameState({ state: "PREGAME", matchId: currentPreGamePlayer.MatchID });

			if (currentGamePlayer) setGameState({ state: "INGAME", matchId: currentGamePlayer.MatchID });
		} catch (err) {
			console.error("Manual check failed:", err);
			setError("Failed to check for current game");
		}
	}

	// Get match display info
	const getMatchDisplayInfo = () => {
		if (!currentMatch) return null;

		return {
			matchId: gameState.matchId,
			state: gameState.state,
			mapName: getMap(currentMatch.MapID).displayName,
			mapId: currentMatch.MapID,
			gameServer: currentMatch.GamePodID
				? currentMatch.GamePodID.split(".")[currentMatch.GamePodID.split(".").length - 1]
				: "Unknown",
		};
	};

	const matchDisplayInfo = getMatchDisplayInfo();

return (
		<div className="p-2 flex flex-col">
			{error && <Alert variant="destructive" className="my-4 w-1/2 m-auto">{error}</Alert>}

			{/* Progress Indicator */}
			{matchProcessing.isProcessing && matchProcessing.progress.total > 0 && (
				<div className="flex flex-col m-auto my-4 gap-4">
					<Progress
						value={matchProcessing.progress.step}
						max={matchProcessing.progress.total}
						className="w-56"
					/>
					<div className="flex items-center gap-4">
						<Spinner className="size-4" />
						<span className="w-full">
							{matchProcessing.currentPlayer ? `Checking ${matchProcessing.currentPlayer}` : "Processing match data..."}
						</span>
					</div>
				</div>
			)}

			{/* Match Info */}
			{matchDisplayInfo && Object.keys(table).length > 0 && (
				<section id="match-info" className="flex items-center my-10 gap-4 m-auto">
					<Badge variant="secondary" className="text-base">Server: {matchDisplayInfo.gameServer}</Badge>
					<Badge variant="secondary" className="text-base">Map: {matchDisplayInfo.mapName}</Badge>
					{matchDisplayInfo.state !== "MENUS" && (
						<Badge variant="outline" className="text-base">
							{matchDisplayInfo.state === "PREGAME" ? "Agent Select" : "In Game"}
						</Badge>
					)}
				</section>
			)}

			{/* Players Table */}
			<PlayersTable table={table} puuid={puuid as string} mapId={matchDisplayInfo?.mapId} />

			{/* Waiting State */}
			{player && Object.keys(table).length === 0 && gameState.state === "MENUS" && (
				<section className="m-auto text-center mt-20">
					<Spinner className="size-8 mx-auto my-4" />
					<h2 className="font-bold">Waiting for match</h2>
					<p className="text-xs text-muted-foreground">
						The check should start automatically when a match is found.
						<br />
						If it didn't work, click{" "}
						<button type="button" className="underline" onClick={manualCheck}>
							here
						</button>{" "}
						to check manually.
					</p>
				</section>
			)}

			{/* Manual Recheck Button */}
			{Object.keys(table).length > 1 && (
				<Button variant="default" size="sm" className="m-auto" onClick={manualCheck}>
					Recheck
				</Button>
			)}
		</div>
	);
};
