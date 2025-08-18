import { useAptabase } from '@aptabase/react';
import { useAtom } from "jotai";
import { useState } from "react";
import { PlayersTable } from "../components/PlayersTable";
import * as utils from '../utils/utils';
import atoms from "../utils/atoms";


export const Main = () => {
    const [error, setError] = useState<string | null>(null);

    const [puuid] = useAtom(atoms.puuid);
    const [player] = useAtom(atoms.player);
    const [sharedapi] = useAtom(atoms.sharedapi);
    const [table] = useAtom(atoms.table);
    const [gameState, setGameState] = useAtom(atoms.gameState);
    const [allowAnalytics] = useAtom(atoms.allowAnalytics);
    const [matchProcessing] = useAtom(atoms.matchProcessing);
    const [currentMatch] = useAtom(atoms.currentMatch);

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
                    await trackEvent('check_nogame');
                }
                return;
            }

            if (allowAnalytics) {
                await trackEvent('manual_check');
            }

            if (currentPreGamePlayer)
              setGameState({ state: 'PreGame', matchId: currentPreGamePlayer.MatchID })

            if (currentGamePlayer)
              setGameState({ state: 'Game', matchId: currentGamePlayer.MatchID })

        } catch (err) {
            console.error('Manual check failed:', err);
            setError("Failed to check for current game");
        }
    }

    // Get match display info
    const getMatchDisplayInfo = () => {
        if (!currentMatch) return null;

        return {
            matchId: gameState.matchId,
            state: gameState.state,
            mapName: currentMatch.MapID ? utils.getMap(currentMatch.MapID)?.displayName : 'Unknown',
            mapId: currentMatch.MapID,
            gameServer: currentMatch.GamePodID ?
                currentMatch.GamePodID.split('.')[currentMatch.GamePodID.split('.').length - 1] :
                'Unknown'
        };
    };

    const matchDisplayInfo = getMatchDisplayInfo();

    return (
        <div className="p-2 flex flex-col">
            {error && <div className="alert alert-error my-4 w-1/2 m-auto">{error}</div> }

            {/* Progress Indicator */}
            {matchProcessing.isProcessing && matchProcessing.progress.total > 0 && (
                <div className="flex flex-col m-auto my-4 space-y-4">
                    <progress
                        className="progress progress-primary w-56"
                        value={matchProcessing.progress.step}
                        max={matchProcessing.progress.total}
                    />
                    <div className="flex flex-row items-center space-x-4">
                        <span className="loading loading-spinner loading-xs"></span>
                        <span className="w-full">
                            {matchProcessing.currentPlayer ?
                                `Checking ${matchProcessing.currentPlayer}` :
                                'Processing match data...'
                            }
                        </span>
                    </div>
                </div>
            )}

            {/* Players Table */}
            <PlayersTable table={table} puuid={puuid as string} mapId={matchDisplayInfo?.mapId} />

            {/* Waiting State */}
            {player && Object.keys(table).length === 0 && gameState.state === 'Idle' && (
                <section className="m-auto text-center mt-20">
                    <span className="loading loading-ring loading-lg my-4" />
                    <h2 className="font-bold">Waiting for match</h2>
                    <p className="text-xs text-slate-400">
                        The check should start automatically when a match is found.
                        <br />
                        If it didn't work, click{" "}
                        <button className="underline" onClick={manualCheck}>
                            here
                        </button>{" "}
                        to check manually.
                    </p>
                </section>
            )}

            {/* Match Info */}
            {matchDisplayInfo && Object.keys(table).length > 0 && (
                <section id="match-info" className="flex flex-row items-center my-10 space-x-4 m-auto">
                    <div className="badge badge-soft badge-primary badge-lg">
                        Server: {matchDisplayInfo.gameServer}
                    </div>
                    <div className="badge badge-soft badge-primary badge-lg">
                        Map: {matchDisplayInfo.mapName}
                    </div>
                    {matchDisplayInfo.state !== 'Idle' && (
                        <div className="badge badge-soft badge-secondary badge-lg">
                            {matchDisplayInfo.state === 'PreGame' ? 'Agent Select' : 'In Game'}
                        </div>
                    )}
                </section>
            )}

            {/* Manual Recheck Button */}
            {Object.keys(table).length > 1 && <button className="btn btn-primary m-auto btn-sm" onClick={manualCheck}>Recheck</button>}
        </div>
    );
};
