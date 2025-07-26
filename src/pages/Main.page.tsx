import { useAptabase } from '@aptabase/react';
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { PlayersTable } from "../components/PlayersTable";
import { CurrentGameMatchResponse, CurrentGamePlayerResponse, CurrentPreGameMatchResponse, CurrentPreGamePlayerResponse } from "../interface";
import * as utils from '../utils';
import atoms from "../utils/atoms";

export const Main = () => {
    const [error, setError] = useState<string|null>()
    const [progress, setProgress] = useState<{ step: number, steps: number, player: string | null }>({ step: 0, steps: 0, player: null })
    const [currentMatchId, setCurrentMatchId] = useState<string | null>()
    const [currentMatch, setCurrentMatch] = useState<CurrentPreGameMatchResponse | CurrentGameMatchResponse>()

    const [puuid] = useAtom(atoms.puuid)
    const [player] = useAtom(atoms.player)
    const [localapi] = useAtom(atoms.localapi)
    const [sharedapi] = useAtom(atoms.sharedapi)
    const [table, setTable] = useAtom(atoms.table)
    const [allowAnalytics] = useAtom(atoms.allowAnalytics)
    const [gameState] = useAtom(atoms.gameState)

    const { trackEvent } = useAptabase();

    async function handlePreGameMatch(currentPreGamePlayer: CurrentPreGamePlayerResponse){
      if (!sharedapi) return

      if (allowAnalytics)
        await trackEvent('check_pregame')

      if (currentPreGamePlayer.MatchID !== currentMatchId)
        Object.keys(table).forEach(key => { delete table[key] })

      const match = await sharedapi.getCurrentPreGameMatch(currentPreGamePlayer.MatchID)

      const puuids = utils.extractPlayers(match)
      const players = await sharedapi.getPlayerNames(puuids)

      match.AllyTeam?.Players.forEach(player => { table[player.Subject] = {} as any });

      for (const player of players){

        // Current and Peak Rank
        const mmr = await sharedapi.getPlayerMMR(player.Subject)
        const { currentRank, currentRR, peakRank } = utils.calculateRanking(mmr)
        const { rankName: currentRankName, rankColor: currentRankColor } = utils.getRank(currentRank)
        const { rankName: rankPeakName, rankColor: rankPeakColor } = utils.getRank(peakRank)

        const { uuid: agentId, displayName: agentName, killfeedPortrait: agentImage } = utils.getAgent(match.AllyTeam?.Players.find(_player => _player.Subject === player.Subject)?.CharacterID as string)

        table[player.Subject] = {
          name: player.GameName,
          tag: player.TagLine,
          puuid: player.Subject,
          agentId: agentId,
          agentName: agentName,
          agentImage: agentImage,
          currentRank: currentRankName,
          currentRankColor,
          currentRR,
          rankPeak: rankPeakName,
          rankPeakColor: rankPeakColor,
          enemy: false
        }
      }

      setTable(table)

      for (const player of players) {
        setProgress(prevState => ({ step: prevState.step + 1, steps: players.length, player: player.GameName }))

        // Match history and stats
        const { History: matchHistory } = await sharedapi.getPlayerMatchHistory(player.Subject)
        const promises = matchHistory.map(match => sharedapi.getMatchDetails(match.MatchID))
        const matches = await Promise.all(promises)

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
      setCurrentMatchId(match.ID)
      setCurrentMatch(match)
      setProgress({ step: 0, steps: 0, player: null })
    }

    async function handleGameMatch(currentGamePlayer: CurrentGamePlayerResponse) {
      if (!sharedapi) return

      if (allowAnalytics)
        await trackEvent('check_game')

      if (currentGamePlayer.MatchID !== currentMatchId)
        Object.keys(table).forEach(key => { delete table[key] })

      const match = await sharedapi.getCurrentGameMatch(currentGamePlayer.MatchID)
      const puuids = utils.extractPlayers(match)
      const players = await sharedapi.getPlayerNames(puuids)
      const playerTeamId = match.Players.find(player => player.Subject === puuid)?.TeamID as 'RED' | 'BLUE'

      match.Players.forEach(player => { table[player.Subject] = {} as any });

      match.Players.sort((a, b) => { return a.TeamID < b.TeamID ? -1 : a.TeamID < b.TeamID ? 1 : 0 })

      for (const player of match.Players){
        // Current and Peak Rank
        const mmr = await sharedapi.getPlayerMMR(player.Subject)
        const { currentRank, currentRR, peakRank, peakRankSeasonId } = utils.calculateRanking(mmr)
        const { rankName: currentRankName, rankColor: currentRankColor } = utils.getRank(currentRank)
        const { rankName: rankPeakName, rankColor: rankPeakColor, } = utils.getRank(peakRank)
        const { GameName, TagLine } = players.find(_player => _player.Subject === player.Subject)!

        const { uuid: agentId, displayName: agentName, killfeedPortrait: agentImage } = utils.getAgent(match.Players.find(_player => _player.Subject === player.Subject)?.CharacterID as string)

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
          rankPeakDate: peakRankSeasonId ? utils.getSeasonDateById(peakRankSeasonId) : null,
          enemy: match.Players.find(_player => _player.Subject === player.Subject)?.TeamID !== playerTeamId,
        }
      }

      setTable(table)

      for (const player of players) {
        setProgress(prevState => ({ step: prevState.step + 1, steps: players.length, player: player.GameName }))

        // Match history and stats
        const { History: matchHistory } = await sharedapi.getPlayerMatchHistory(player.Subject)
        const promises = matchHistory.map(match => sharedapi.getMatchDetails(match.MatchID))
        const matches = await Promise.all(promises)

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
          bestAgents,
        }
      }

      if (allowAnalytics)
        await trackEvent('check_finish')

      setTable(table)
      setCurrentMatchId(match.MatchID)
      setCurrentMatch(match)
      setProgress({ step: 0, steps: 0, player: null })
    }

    async function onCheck() {
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

    useEffect(() => {

      if (gameState.state == 'PreGame'){
        handlePreGameMatch({ MatchID: gameState.matchId as string, Subject: '', Version: 0 })
      }

      if (gameState.state == 'Game'){
        handleGameMatch({ MatchID: gameState.matchId as string, Subject: '', Version: 0 })
      }

    }, [gameState])

    return (
      <div className="p-2 flex flex-col">
        { error && <div className="alert alert-error my-4 w-1/2 m-auto">{error}</div> }

        {
          currentMatch &&
            <section id='match-info' className="flex flex-row items-center my-10 space-x-4 m-auto">
              <div className="badge badge-soft badge-primary badge-lg">Server: {currentMatch.GamePodID.split('.')[currentMatch.GamePodID.split('.').length-1]}</div>
              <div className="badge badge-soft badge-primary badge-lg">Map: {utils.getMap(currentMatch.MapID).displayName}</div>
            </section>
        }

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
          <p className="text-xs text-slate-400">The check should start automatically. It case it didn't, click <button className="underline" onClick={onCheck}>here</button></p>
          </section>
        }

        {
          Object.keys(table).length > 1 && <button className="btn btn-primary m-auto btn-sm" onClick={onCheck}>Recheck</button>
        }

      </div>
    );
}
