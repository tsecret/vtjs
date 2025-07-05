import { useAtom } from "jotai"
import { useEffect, useState } from "react"
import { useParams } from "react-router"
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

    <section id="stats" className="space-x-2">

      <div className="stats shadow">
        <div className="stat">
          <div className="stat-title">Total Matches</div>
          <div className="stat-value">{table.length}</div>
        </div>
      </div>

      <div className="stats shadow">
        <div className="stat">
          <div className="stat-title">Wins / Loss</div>
          <div className="stat-value">{table.filter(match => match.won).length} / {table.filter(match => !match.won).length}</div>
        </div>
      </div>

      <div className="stats shadow">
        <div className="stat">
          <div className="stat-title">Winrate %</div>
          <div className="stat-value">{(table.filter(match => match.won).length / table.length * 100).toFixed(0)}%</div>
        </div>
      </div>

    </section>

    <section className="overflow-x-auto flex flex-col items-center">
      <span className="font-bold my-4">Player Match History</span>

      <table className="table table-xs">

        <thead>
          <tr>
            <th>Date</th>
            <th>Agent</th>
            <th>Map</th>
            <th>Score</th>
            <th>Result</th>
            <th>Score</th>
            <th>-+</th>
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
              <td className={match.kills - match.deaths > 1 ? 'text-success' : 'text-error'}>{match.kills - match.deaths > 1 ? '+' : null}{match.kills - match.deaths}</td>
            </tr>
          ))}
        </tbody>

      </table>
    </section>

  </div>
}
