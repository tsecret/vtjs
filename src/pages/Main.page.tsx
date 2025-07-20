import { useAptabase } from '@aptabase/react';
import { useAtom } from "jotai";
import { useState } from "react";
import { PlayersTable } from "../components/PlayersTable";
import { CurrentGamePlayerResponse, CurrentPreGamePlayerResponse } from "../interface";
import * as utils from '../utils';
import atoms from "../utils/atoms";

export const Main = () => {
    const [error, setError] = useState<string|null>()
    const [progress, setProgress] = useState<{ step: number, steps: number, player: string | null }>({ step: 0, steps: 0, player: null })
    const [currentMatchId, setCurrentMatchId] = useState<string | null>()

    const [puuid] = useAtom(atoms.puuid)
    const [player] = useAtom(atoms.player)
    const [localapi] = useAtom(atoms.localapi)
    const [sharedapi] = useAtom(atoms.sharedapi)
    const [table, setTable] = useAtom(atoms.table)
    const [allowAnalytics] = useAtom(atoms.allowAnalytics)

    const { trackEvent } = useAptabase();

    async function handlePreGameMatch(currentPreGamePlayer: CurrentPreGamePlayerResponse){
      if (!sharedapi) return

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

        const { kd, lastGameWon, lastGameScore, accountLevel } = utils.calculateStatsForPlayer(player.Subject, matches)

        table[player.Subject] = {
          ...table[player.Subject],
          kd,
          lastGameWon,
          lastGameScore,
          accountLevel,
        }
      }

      setTable(table)
      setCurrentMatchId(match.ID)
    }

    async function handleGameMatch(currentGamePlayer: CurrentGamePlayerResponse) {
      if (!sharedapi) return

      if (currentGamePlayer.MatchID !== currentMatchId)
        Object.keys(table).forEach(key => { delete table[key] })

      const match = await sharedapi.getCurrentGameMatch(currentGamePlayer.MatchID)
      const puuids = utils.extractPlayers(match)
      const players = await sharedapi.getPlayerNames(puuids)
      const playerTeamId = match.Players.find(player => player.Subject === puuid)?.TeamID as 'RED' | 'BLUE'

      match.Players.forEach(player => { table[player.Subject] = {} as any });

      for (const player of players){

        // Current and Peak Rank
        const mmr = await sharedapi.getPlayerMMR(player.Subject)
        const { currentRank, currentRR, peakRank } = utils.calculateRanking(mmr)
        const { rankName: currentRankName, rankColor: currentRankColor } = utils.getRank(currentRank)
        const { rankName: rankPeakName, rankColor: rankPeakColor } = utils.getRank(peakRank)

        const { uuid: agentId, displayName: agentName, killfeedPortrait: agentImage } = utils.getAgent(match.Players.find(_player => _player.Subject === player.Subject)?.CharacterID as string)

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

        const { kd, lastGameWon, lastGameScore, accountLevel } = utils.calculateStatsForPlayer(player.Subject, matches)
        const bestAgents = utils.getPlayerBestAgent(player.Subject, matches, match.MapID)

        table[player.Subject] = {
          ...table[player.Subject],
          kd,
          lastGameWon,
          lastGameScore,
          accountLevel,
          bestAgents,
        }
      }

      setTable(table)
      setCurrentMatchId(match.MatchID)
    }

    async function onCheck() {
      setError(null)
      if (!puuid || !localapi || !sharedapi) return

      if (allowAnalytics)
        await trackEvent('check_start')

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

      if (allowAnalytics)
        await trackEvent('check_finish')
    }

    return (
      <div className="p-2 flex flex-col">
        { error && <div className="alert alert-error my-4 w-1/2 m-auto">{error}</div> }

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

        { player && <button className="btn btn-primary btn-wide mx-auto" onClick={onCheck}>Check current game</button> }

      </div>
    );
}
