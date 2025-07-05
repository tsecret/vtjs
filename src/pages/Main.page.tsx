import { useAptabase } from '@aptabase/react';
import { useAtom } from "jotai";
import { User } from "lucide-react";
import { useState } from "react";
import { PlayersTable } from "../components/PlayersTable";
import { CurrentGameMatchResponse, Match } from "../interface";
import * as utils from '../utils';
import atoms from "../utils/atoms";

export const Main = () => {
    const [error, setError] = useState<string|null>()
    const [progress, setProgress] = useState<{ step: number, steps: number, player: string | null }>({ step: 0, steps: 0, player: null })
    const [currentMatch, setMatch] = useState<CurrentGameMatchResponse | null>()

    const [puuid] = useAtom(atoms.puuid)
    const [player] = useAtom(atoms.player)
    const [localapi] = useAtom(atoms.localapi)
    const [sharedapi] = useAtom(atoms.sharedapi)
    const [table, setTable] = useAtom(atoms.table)
    const [allowAnalytics] = useAtom(atoms.allowAnalytics)

    const { trackEvent } = useAptabase();

    async function onCheck(){
      setError(null)
      if (!puuid || !localapi || !sharedapi) return

      if (allowAnalytics)
        await trackEvent('check_start')

      const currentPlayer = await sharedapi.getCurrentGamePlayer(puuid)

      if (!currentPlayer){
        setError("No current game found")
        await trackEvent('check_nogame')
        return
      }

      if (currentPlayer.MatchID !== currentMatch?.MatchID) {
        setTable({})
        setMatch(null)
      }

      const match = await sharedapi?.getCurrentGameMatch(currentPlayer.MatchID)
      const puuids = utils.extractPlayers(match)
      const players = await sharedapi.getPlayerNames(puuids)
      const playerTeamId = match.Players.find(player => player.Subject === puuid)?.TeamID as 'RED' | 'BLUE'

      match.Players.forEach(player => { table[player.Subject] = {} as any });

      for (const player of players){
        console.log('Checking player', player.Subject)

        // Current and Peak Rank
        const mmr = await sharedapi.getPlayerMMR(player.Subject)
        const { currentRank, currentRR, peakRank } = utils.calculateRanking(mmr)
        const { rankName: currentRankName, rankColor: currentRankColor } = utils.getRank(currentRank)
        const { rankName: rankPeakName, rankColor: rankPeakColor } = utils.getRank(peakRank)

        const { uuid: agentId, name: agentName, img: agentImage } = utils.getAgent(match.Players.find(_player => _player.Subject === player.Subject)?.CharacterID as Match['Players'][0]['CharacterID'])

        table[player.Subject] = {
          name: player.GameName,
          tag: player.TagLine,
          puuid: player.Subject,
          agentId: agentId || 'N/A',
          agentName: agentName || 'N/A',
          agentImage: agentImage || 'N/A',
          currentRank: currentRankName,
          currentRankColor,
          currentRR,
          rankPeak: rankPeakName,
          rankPeakColor: rankPeakColor,
          enemy: match.Players.find(_player => _player.Subject === player.Subject)?.TeamID !== playerTeamId,
        }
      }

      setTable(table)

      for (const player of players){
        console.log('Checking player', player.Subject)
        setProgress(prevState => ({ step: prevState.step + 1, steps: players.length, player: player.GameName }))

        // Match history and stats
        const { History: matchHistory } = await sharedapi.getPlayerMatchHistory(player.Subject)
        const promises = matchHistory.map(match => sharedapi.getMatchDetails(match.MatchID))
        const matchStats = await Promise.all(promises)

        const { kd, lastGameWon, lastGameScore, accountLevel } = utils.calculateStatsForPlayer(player.Subject, matchStats)

        table[player.Subject] = {
          ...table[player.Subject],
          kd,
          lastGameWon,
          lastGameScore,
          accountLevel,
        }
      }

      setTable(table)
      setMatch(match)
      setProgress({ step: 0, steps: 0, player: null })

      if (allowAnalytics)
        await trackEvent('check_finish')
    }

    return (
      <div className="p-2 flex flex-col">
        { error && <div className="alert alert-error my-4">{error}</div> }

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

        {/* debug */}
        <section className="flex flex-row rounded-xl bg-base-100 p-4 text-sm mt-8">
            <div className="flex flex-row items-center space-x-2"><User size={16} /> <span>{player?.game_name}#{player?.tag_line}</span></div>
            <div className="divider divider-horizontal" />
        </section>

      </div>
    );
}
