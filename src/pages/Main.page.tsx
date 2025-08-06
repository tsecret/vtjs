import { useAptabase } from '@aptabase/react';
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { PlayersTable } from "../components/PlayersTable";
import { CurrentGameMatchResponse, CurrentGamePlayerResponse, CurrentPreGameMatchResponse, CurrentPreGamePlayerResponse, MatchDetailsResponse } from "../interface";
import * as utils from '../utils';
import atoms from "../utils/atoms";

export const Main = () => {
    const [error, setError] = useState<string|null>()
    const [progress, setProgress] = useState<{ step: number, steps: number, player: string | null }>({ step: 0, steps: 0, player: null })
    const [currentMatchId, setCurrentMatchId] = useState<string | null>()
    const [currentMatch, setCurrentMatch] = useState<CurrentPreGameMatchResponse | CurrentGameMatchResponse | null>()

    const [puuid] = useAtom(atoms.puuid)
    const [player] = useAtom(atoms.player)
    const [localapi] = useAtom(atoms.localapi)
    const [sharedapi] = useAtom(atoms.sharedapi)
    const [table, setTable] = useAtom(atoms.table)
    const [allowAnalytics] = useAtom(atoms.allowAnalytics)
    const [gameState] = useAtom(atoms.gameState)

    const { trackEvent } = useAptabase();

    async function handleMatch(
      matchId: string,
      isPreGame: boolean,
      trackEventName: string
    ) {
      if (!sharedapi) return

      if (allowAnalytics)
        await trackEvent(trackEventName)

      if (matchId !== currentMatchId)
        Object.keys(table).forEach(key => { delete table[key] })

      const match = isPreGame
        ? await sharedapi.getCurrentPreGameMatch(matchId)
        : await sharedapi.getCurrentGameMatch(matchId)

      setCurrentMatchId(isPreGame ? (match as CurrentPreGameMatchResponse).ID : (match as CurrentGameMatchResponse).MatchID)
      setCurrentMatch(match)

      const puuids = utils.extractPlayers(match)
      const players = await sharedapi.getPlayerNames(puuids)

      if (isPreGame) {
        const preGameMatch = match as CurrentPreGameMatchResponse
        preGameMatch.AllyTeam?.Players.forEach((player: any) => { table[player.Subject] = {} as any });
      } else {
        const gameMatch = match as CurrentGameMatchResponse
        gameMatch.Players.forEach((player: any) => { table[player.Subject] = {} as any });
        gameMatch.Players.sort((a: any, b: any) => { return a.TeamID < b.TeamID ? -1 : a.TeamID < b.TeamID ? 1 : 0 })
      }

      const playerTeamId = isPreGame ? null : (match as CurrentGameMatchResponse).Players.find((player: any) => player.Subject === puuid)?.TeamID as 'RED' | 'BLUE'

      const playersToProcess = isPreGame
        ? (match as CurrentPreGameMatchResponse).AllyTeam?.Players || []
        : (match as CurrentGameMatchResponse).Players

      for (const player of playersToProcess) {
        const mmr = await sharedapi.getPlayerMMR(player.Subject)
        const { currentRank, currentRR, peakRank, peakRankSeasonId, lastGameMMRDiff } = utils.calculateRanking(mmr)
        const { rankName: currentRankName, rankColor: currentRankColor } = utils.getRank(currentRank)
        const { rankName: rankPeakName, rankColor: rankPeakColor } = utils.getRank(peakRank)

        const playerInfo = players.find(_player => _player.Subject === player.Subject)!
        const { GameName, TagLine } = playerInfo

        const { uuid: agentId, displayName: agentName, killfeedPortrait: agentImage } = utils.getAgent(player.CharacterID as string)

        const isEnemy = isPreGame ? false : (player as any).TeamID !== playerTeamId

        table[player.Subject] = {
          name: GameName,
          tag: TagLine,
          puuid: player.Subject,
          agentId: agentId,
          agentName: agentName,
          agentImage: agentImage,
          currentRank: currentRankName,
          currentRankColor,
          currentRR,
          rankPeak: rankPeakName,
          rankPeakColor: rankPeakColor,
          rankPeakDate: !isPreGame && peakRankSeasonId ? utils.getSeasonDateById(peakRankSeasonId) : null,
          lastGameMMRDiff,
          enemy: isEnemy,
          accountLevel: player.PlayerIdentity.AccountLevel || null
        }
      }

      setTable(table)

      for (const player of players) {
        setProgress(prevState => ({ step: prevState.step + 1, steps: players.length, player: player.GameName }))

        const { History: matchHistory } = await sharedapi.getPlayerMatchHistory(player.Subject)

        const matches: MatchDetailsResponse[] = []

        for (const match of matchHistory){
          matches.push(await sharedapi.getMatchDetails(match.MatchID))
        }

        const { kd, hs, adr, lastGameWon, lastGameScore, accountLevel } = utils.calculateStatsForPlayer(player.Subject, matches)
        const bestAgents = utils.getPlayerBestAgent(player.Subject, matches, match.MapID)

        table[player.Subject] = {
          ...table[player.Subject],
          kd,
          hs,
          adr,
          lastGameWon,
          lastGameScore,
          accountLevel,
          bestAgents
        }
      }

      if (allowAnalytics)
        await trackEvent('check_finish')

      setTable(table)
      setProgress({ step: 0, steps: 0, player: null })
    }

    async function handlePreGameMatch(currentPreGamePlayer: CurrentPreGamePlayerResponse) {
      await handleMatch(currentPreGamePlayer.MatchID, true, 'check_pregame')
    }

    async function handleGameMatch(currentGamePlayer: CurrentGamePlayerResponse) {
      await handleMatch(currentGamePlayer.MatchID, false, 'check_game')
    }

    async function handleGameEnd(){
      setTable({})
      setCurrentMatchId(null)
      setCurrentMatch(null)
    }

    async function check() {
      setError(null)
      if (!puuid || !localapi || !sharedapi) return

      const currentPreGamePlayer = await sharedapi.getCurrentPreGamePlayer(puuid)
      const currentGamePlayer = currentPreGamePlayer ? null : await sharedapi.getCurrentGamePlayer(puuid)

      if (!currentPreGamePlayer && !currentGamePlayer){
        setError("No current game found")
        await trackEvent('check_nogame')
        return
      }

      if (currentPreGamePlayer)
        await handlePreGameMatch(currentPreGamePlayer)

      if (currentGamePlayer)
        await handleGameMatch(currentGamePlayer)

      setProgress({ step: 0, steps: 0, player: null })

    }

    async function silentCheck() {
      if (!sharedapi || !puuid) return

      const currentPreGamePlayer = await sharedapi.getCurrentPreGamePlayer(puuid)
      const currentGamePlayer = currentPreGamePlayer ? null : await sharedapi.getCurrentGamePlayer(puuid)

      if (currentPreGamePlayer)
        await handlePreGameMatch(currentPreGamePlayer)

      if (currentGamePlayer)
        await handleGameMatch(currentGamePlayer)
    }

    useEffect(() => {

      if (gameState.state === 'PreGame'){
        handlePreGameMatch({ MatchID: gameState.matchId as string, Subject: '', Version: 0 })
      }

      if (gameState.state === 'Game'){
        handleGameMatch({ MatchID: gameState.matchId as string, Subject: '', Version: 0 })
      }

      if (gameState.state === 'Idle'){
        handleGameEnd()
      }

    }, [gameState])

    useEffect(() => {
      if (localapi && sharedapi && player)
        silentCheck()
    }, [localapi, sharedapi, player])

    return (
      <div className="p-2 flex flex-col">
        { error && <div className="alert alert-error border-error my-4 w-1/2 m-auto">{error}</div> }

        {
          progress.steps > 1 &&
          <div className="flex flex-col m-auto my-4 space-y-4">
            <progress className="progress progress-primary w-56 " value={progress.step} max={progress.steps}></progress>
            <div className="flex flex-row items-center space-x-4">
              <span className="loading loading-spinner loading-xs"></span>
              <span className="w-full">Checking {progress.player}</span>
            </div>
          </div>
        }

        {/* table */}
        <PlayersTable table={table} puuid={puuid as string} />

        { player && Object.keys(table).length === 0 && <section className="m-auto text-center mt-20">
          <h2 className="font-bold">Waiting for match</h2>
          <p className="text-xs text-slate-400">The check should start automatically. It case it didn't, click <button className="underline" onClick={check}>here</button></p>
          </section>
        }

        {
          currentMatch &&
            <section id='match-info' className="flex flex-row items-center my-10 space-x-4 m-auto">
              <div className="badge badge-soft badge-primary badge-lg">Server: {currentMatch.GamePodID.split('.')[currentMatch.GamePodID.split('.').length-1]}</div>
              <div className="badge badge-soft badge-primary badge-lg">Map: {utils.getMap(currentMatch.MapID).displayName}</div>
            </section>
        }

        {
          Object.keys(table).length > 1 && <button className="btn btn-primary m-auto btn-sm" onClick={check}>Recheck</button>
        }


        { import.meta.env.VITE_DEV === 'true' && Object.keys(table).length > 1 && <button className="btn btn-sm m-auto" onClick={handleGameEnd}>Game End</button> }
      </div>
    );
}
