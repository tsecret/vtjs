import clsx from "clsx"
import { ExternalLink } from "lucide-react"
import { useNavigate } from "react-router"
import { PlayerRow } from "../interface"
import * as utils from '../utils'

export const PlayersTable = ({ table, puuid }: { table: { [key: PlayerRow['puuid']]: PlayerRow }, puuid: string }) => {

  const navigate = useNavigate()

  const Row = ({ player }: { player: PlayerRow }) => {
      return <tr key={player.puuid} className='select-none'>
        <td className="flex flex-row items-center"><img src={player.agentImage || undefined} className='h-6 mr-4' draggable={false} /> {player.agentName}</td>
        <th>{ player.puuid === puuid ? <span>You</span> : <><span>{player.name}</span><span className="text-gray-500">#{player.tag}</span></>}</th>
        <th><span style={{ color: `#${player.currentRankColor}` }}>{player.currentRank} (RR {player.currentRR})</span></th>
        <th><span style={{ color: `#${player.rankPeakColor}` }}>{player.rankPeak}</span></th>
        <th><span>{player.accountLevel}</span></th>
        <td><span className={clsx(!player.kd? null : player.kd >= 1 ? 'text-green-400' : 'text-red-400')}>{player.kd}</span></td>
        <td><span className={clsx(player.lastGameScore === 'N/A' ? null : player.lastGameWon ? 'text-green-400' : 'text-red-500')}>{player.lastGameScore}</span></td>
        <td>{ utils.isSmurf(player) && <div className="badge badge-soft badge-warning">Possible Smurf</div> }</td>
        <td><ExternalLink className="cursor-pointer" size={16} onClick={() => navigate('/player/' + player.puuid)}/></td>
      </tr>
    }

  return <section className="overflow-x-auto mx-auto my-4">
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
