import clsx from "clsx"
import { CircleEllipsis } from "lucide-react"
import { useNavigate } from "react-router"
import { PlayerRow } from "../interface"
import * as utils from '../utils'

export const PlayersTable = ({ table, puuid }: { table: { [key: PlayerRow['puuid']]: PlayerRow }, puuid: string }) => {

  const navigate = useNavigate()

  const Row = ({ player }: { player: PlayerRow }) => {
      return <tr key={player.puuid} className={clsx(player.enemy ? 'bg-error/5' : 'bg-success/5')}>
        <td>
          <div className="flex flex-row items-center">
            <img src={player.agentImage || undefined} className='h-6 mr-4' draggable={false} />
            <span>{player.agentName}</span>
          </div>
        </td>
        <th>{ player.puuid === puuid ? <span>You</span> : <><span>{player.name}</span><span className="text-gray-500">#{player.tag}</span></>}</th>
        <th><span style={{ color: `#${player.currentRankColor}` }}>{player.currentRank} (RR {player.currentRR})</span></th>
        <th className="flex-col flex">
          <span style={{ color: `#${player.rankPeakColor}` }}>{player.rankPeak}</span>
          {player.rankPeakDate ? <span className="text-mini text-center text-slate-400">({player.rankPeakDate.toLocaleDateString()})</span> : null}
        </th>
        <th><span>{player.accountLevel}</span></th>
        <td><span className={clsx(!player.kd? null : player.kd >= 1 ? 'text-green-400' : 'text-red-400')}>{player.kd}</span></td>
        <td><span className="text-center">{player.hs}{player.hs ? '%' : null}</span></td>
        <td><span className="text-center">{player.adr}</span></td>
        <td><span className={clsx('text-center', player.lastGameScore === 'N/A' ? null : player.lastGameWon ? 'text-green-400' : 'text-red-500')}>{player.lastGameScore}{player.lastGameMMRDiff && player.lastGameScore ? ` (${player.lastGameMMRDiff > 0 ? '+'+player.lastGameMMRDiff : player.lastGameMMRDiff})` : null}</span></td>
        <td>
          <div className="flex flex-row space-x-2">
            {player.bestAgents?.map(agent => (
              <div key={agent.agentId} className="tooltip tooltip-left">
                <div className="tooltip-content flex flex-col items-start">
                  <span>Avg Kills: {agent.avgKills}</span>
                  <span>Avg Deaths: {agent.avgDeaths}</span>
                  <span>Avg K/D: {agent.avgKd}</span>
                  <span>Games Played: {agent.games}</span>
                </div>
                <img className="w-6" src={agent.agentUrl} />
              </div>
            ))}
          </div>
        </td>
        <td>{ utils.isSmurf(player) && <div className="badge badge-soft badge-warning">Possible Smurf</div> }</td>
        <td><CircleEllipsis className="cursor-pointer" size={20} onClick={() => navigate('/player/' + player.puuid)}/></td>
      </tr>
    }

  if (!Object.keys(table).length)
    return null

  return <section className="mx-auto my-4">
      <table className="table table-xs">

        <thead>
          <tr className="text-center">
            <th>Agent</th>
            <th>Player</th>
            <th>Rank</th>
            <th>Peak Rank</th>
            <th>LVL</th>
            <th>K/D</th>
            <th>HS%</th>
            <th>ADR</th>
            <th>Last Game</th>
            <th>Top Agents on Current Map</th>
            <th>Note</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {
            Object.values(table)
            .filter(player => !player.enemy)
            .sort((a, b) => (b.kd || 1) - (a.kd || 0))
            .map((player) => <Row player={player} key={player.puuid} /> )
          }
        </tbody>

        <tbody><tr><td></td></tr></tbody>

        <tbody>
          {
            Object.values(table)
            .filter(player => player.enemy)
            .sort((a, b) => (b.kd || 1) - (a.kd || 0))
            .map((player) => <Row player={player} key={player.puuid} /> )
          }

        </tbody>

      </table>
    </section>
}
