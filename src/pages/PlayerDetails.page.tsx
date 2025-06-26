import { useAtom } from "jotai"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import atoms from "../utils/atoms"
import * as utils from '../utils'
import { MatchDetailsResponse } from "../interface"

interface Row {
  matchId: string
  mapName: string
  kills: number
  deaths: number
  assists: number
  date: Date,
  won: boolean
  score: string
  agentId: string
  agentName: string
  agentImage: string
}

export const PlayerDetails = () => {
  const [sharedapi] = useAtom(atoms.sharedapi)
  const [table, setTable] = useState<Row[]>([])

  const { puuid } = useParams()
  const navigate = useNavigate()

  useEffect(() => {

    const load = async () => {
      if (!puuid || !sharedapi) return

      const table: Row[] = []

      const { History } = await sharedapi.getPlayerMatchHistory(puuid)
      const matches = await Promise.all(History.map(match => sharedapi.getMatchDetails(match.MatchID)))

      for (const match of matches){
        const player = match.players.find(player => player.subject === puuid) as MatchDetailsResponse['players'][0]
        const { uuid: agentId, name: agentName, img: agentImage } = utils.getAgent(player.characterId)
        const team = match.teams.find(team => team.teamId === player.teamId)!


        table.push({
          matchId: match.matchInfo.matchId,
          mapName: utils.getMap(match.matchInfo.mapId).displayName,
          kills: player.stats.kills,
          deaths: player.stats.deaths,
          assists: player.stats.assists,
          date: new Date(match.matchInfo.gameStartMillis),
          won: utils.playerHasWon(puuid, match),
          score: `${team.roundsWon}-${team.roundsPlayed-team.roundsWon}`,
          agentId,
          agentName,
          agentImage
        })
      }

      setTable(table)
    }

    load()
  }, [])

  return <div className="flex flex-col items-center">

    <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Back</button>

    {/* table */}
    <div className="overflow-x-auto">
      <table className="table table-xs">
        <thead>
          <tr>
            <th>Date</th>
            <th>Agent</th>
            <th>Map</th>
            <th>Score</th>
            <th>Result</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {table.map(match => (
            <tr key={match.matchId}>
              <th>{match.date.toLocaleString()}</th>
              <th><img src={match.agentImage} className="max-h-6"/></th>
              <th>{match.mapName}</th>
              <td>{match.kills} / {match.deaths} /   {match.assists}</td>
              <td className={match.won ? 'text-success' : 'text-error'}>{match.won ? 'Win' : 'Loss'}</td>
              <td className={match.won ? 'text-success' : 'text-error'}>{match.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  </div>
}
