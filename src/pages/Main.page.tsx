
import clsx from "clsx";
import { useState } from "react";

import { CurrentGameMatchResponse, Match, PlayerRow } from "../interface";
import * as utils from '../utils';

import { useAtom } from "jotai";
import { User } from "lucide-react";
import atoms from "../utils/atoms";

export const Main = () => {
    const [error, setError] = useState<string|null>()
    const [progress, setProgress] = useState<{ step: number, steps: number, player: string | null }>({ step: 0, steps: 0, player: null })
    const [currentMatch, setMatch] = useState<CurrentGameMatchResponse | null>()
    const [table, setTable] = useState<{ [key: PlayerRow['puuid']]: PlayerRow }>({})

    const [puuid] = useAtom(atoms.puuid)
    const [player] = useAtom(atoms.player)
    const [localapi] = useAtom(atoms.localapi)
    const [sharedapi] = useAtom(atoms.sharedapi)

    async function onCheck(){
      setError(null)
      if (!puuid || !localapi || !sharedapi) return

      const playerInfo = await sharedapi?.getCurrentGamePlayer(puuid)

      if (playerInfo.MatchID !== currentMatch?.MatchID) {
        setTable({})
        setMatch(null)
      }

      if (!playerInfo) {
        setError("No current game found")
        return
      }

      const match = await sharedapi?.getCurrentGameMatch(playerInfo.MatchID)
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
          accountLevel
        }
      }

      setTable(table)
      setMatch(match)
      setProgress({ step: 0, steps: 0, player: null })
    }

    const Row = ({ player }: { player: PlayerRow }) => {
      return <tr key={player.puuid}>
        <td className="flex flex-row items-center"><img src={player.agentImage} className='max-h-6 mr-4' /> {player.agentName}</td>
        <th>{ player.puuid === puuid ? <span>You</span> : <><span>{player.name}</span><span className="text-gray-500">#{player.tag}</span></>}</th>
        <th><span style={{ color: `#${player.currentRankColor}` }}>{player.currentRank} (RR {player.currentRR})</span></th>
        <th><span style={{ color: `#${player.rankPeakColor}` }}>{player.rankPeak}</span></th>
        <th><span>{player.accountLevel}</span></th>
        <td><span className={clsx(!player.kd? null : player.kd >= 1 ? 'text-green-400' : 'text-red-400')}>{player.kd}</span></td>
        <td><span className={clsx(player.lastGameScore === 'N/A' ? null : player.lastGameWon ? 'text-green-400' : 'text-red-500')}>{player.lastGameScore}</span></td>
      </tr>
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
        {
          table &&
          <section className="overflow-x-auto mx-auto my-4">
            <table className="table table-xs">

              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Player</th>
                  <th>Rank</th>
                  <th>Peak Rank</th>
                  <th>LVL</th>
                  <th>K/D</th>
                  <th>Last Game</th>
                </tr>
              </thead>

              <tbody>
                {
                  Object.values(table)
                  .filter(player => !player.enemy)
                  .sort((a, b) => (b.kd || 1) - (a.kd || 0))
                  .map((player) => <Row player={player} /> )
                }
              </tbody>

              <th />

              <tbody>
                {
                  Object.values(table)
                  .filter(player => player.enemy)
                  .sort((a, b) => (b.kd || 1) - (a.kd || 0))
                  .map((player) => <Row player={player} /> )
                }
              </tbody>

            </table>
          </section>
        }

        { player && <button className="btn btn-primary btn-wide mx-auto" onClick={onCheck}>Check current game</button> }

        {/* debug */}
        <section className="flex flex-row rounded-xl bg-base-100 p-4 text-sm mt-8">
            <div className="flex flex-row items-center space-x-2"><User size={16} /> <span>{player?.game_name}#{player?.tag_line}</span></div>
            <div className="divider divider-horizontal" />
        </section>

      </div>
    );
}
