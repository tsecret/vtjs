import { useAptabase } from "@aptabase/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useServices } from "@/lib/services";
import { PlayersTable } from "../components/PlayersTable";
import { extractServerName, getMap } from "../utils";
import atoms from "../utils/atoms";

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

		const map = getMap(currentMatch.MapID);

		return {
			mapName: map.displayName,
			mapPreview: map.listViewIcon,
			mapId: currentMatch.MapID,
			gameServer: extractServerName(currentMatch.GamePodID),
		};
	};

	const matchDisplayInfo = getMatchDisplayInfo();

	return (
		<div className="p-8 flex flex-col">
			{error && (
				<Alert variant="destructive" className="my-4 w-1/2 m-auto">
					{error}
				</Alert>
			)}

			{/* Progress Indicator */}
			{matchProcessing.isProcessing && matchProcessing.progress.total > 0 && (
				<div className="flex flex-col m-auto my-4 gap-4">
					<Progress value={matchProcessing.progress.step} max={matchProcessing.progress.total} className="w-56" />
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
				<Card size="sm" className="mx-auto my-6 w-full max-w-xl">
					<CardHeader>
						<CardTitle className="flex items-center gap-3">
							{matchDisplayInfo.mapPreview ? (
								<div className="relative h-6 w-20 shrink-0">
									<img
										src={matchDisplayInfo.mapPreview}
										alt={matchDisplayInfo.mapName}
										className="h-full w-full rounded object-cover blur-[1px] brightness-50"
										draggable={false}
									/>
									<span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
										{matchDisplayInfo.mapName}
									</span>
								</div>
							) : (
								<span>{matchDisplayInfo.mapName}</span>
							)}

							<Separator orientation="vertical" className="h-4 self-center" />

							<span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Server</span>
							<span className="text-sm font-normal text-muted-foreground capitalize">
								{matchDisplayInfo.gameServer}
							</span>
						</CardTitle>
					</CardHeader>
				</Card>
			)}

			{/* Players Table */}
			<PlayersTable table={table} puuid={puuid as string} mapId={matchDisplayInfo?.mapId} />

			{/* Waiting State */}
			{player && Object.keys(table).length === 0 && gameState.state === "MENUS" && (
				<Empty className="m-auto mt-20 w-full max-w-sm">
					<EmptyMedia className="size-10">
						<Spinner className="size-8" />
					</EmptyMedia>
					<EmptyTitle>Waiting for match</EmptyTitle>
					<EmptyDescription className="text-xs">
						The check should start automatically when a match is found.
						<br />
						If it didn't work, click{" "}
						<button type="button" className="underline" onClick={manualCheck}>
							here
						</button>{" "}
						to check manually.
					</EmptyDescription>
				</Empty>
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
