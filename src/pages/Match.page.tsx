import { MatchDetailsResponse } from "@/interface"
import atoms from "@/utils/atoms"
import clsx from "clsx"
import { useAtom } from "jotai"
import { ExternalLink } from "lucide-react"
import moment from "moment"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import * as utils from '../utils/utils'

type Match = {
  mapName: string
  date: number
  type: string
  players: {
    puuid: string
    name: string
    tag: string
    kills: number | undefined
    deaths: number | undefined
    assists: number | undefined
    kd: number
    hs: number
    agentName: string
    agentImg: string
    team: string
    partyId: string
    partyNumber: number
    rankName: string
    rankColor: string
    accountLevel: number
  }[]
  roundResults: MatchDetailsResponse['roundResults']
  teams: {
    red: {
      won: boolean
      score: number
    },
    blue: {
      won: boolean
      score: number
    }
  }
}

export const MatchPage = () => {
  const [sharedapi] = useAtom(atoms.sharedapi)
  const [error, setError] = useState<string|null>(null)
  const [match, setMatch] = useState<Match>()

  const { matchId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (!matchId) return

    (async () => {
      const match = await sharedapi?.getMatchDetails(matchId)

      if (!match){
        setError('Error while loading match details')
        return
      }

      const teamRed = match.teams?.find(team => team.teamId === 'Red')!
      const teamBlue = match.teams?.find(team => team.teamId === 'Blue')!

      const parties = Object.keys(match.matchInfo.partyRRPenalties || {})

      setMatch({
        mapName: utils.getMap(match.matchInfo.mapId).displayName,
        date: match.matchInfo.gameStartMillis,
        type: match.matchInfo.queueID,
        players: match.players.map(player => {

          const { kd, hs } = utils.calculateStatsForPlayer(player.subject, [match])
          const { displayIcon: agentImg, displayName: agentName } = utils.getAgent(player.characterId)
          const { rankName, rankColor }  = utils.getRank(player.competitiveTier)

          return {
            puuid: player.subject,
            name: player.gameName,
            tag: player.tagLine,
            kills: player.stats?.kills,
            deaths: player.stats?.deaths,
            assists: player.stats?.assists,
            kd: kd,
            hs: hs,
            agentName: agentName || '',
            agentImg: agentImg || '',
            team: player.teamId,
            partyId: player.partyId,
            partyNumber: parties.indexOf(player.partyId)! + 1,
            rankName,
            rankColor,
            accountLevel: player.accountLevel
          } as Match['players'][0]
        }).sort((a, b) => b.kd - a.kd),
        roundResults: match.roundResults,
        teams: {
          red: {
            won: teamRed.won,
            score: teamRed.roundsWon
          },
          blue: {
            won: teamBlue.won,
            score: teamBlue.roundsWon
          },
        }
      })

    })();

  }, [matchId])

  if (!match)
    return <div></div>

  return <div className="flex flex-col items-center space-y-8 p-8">
    { error && <p className="alert alert-error">{error}</p> }

    {/* Match Info */}
    <section>
      <div className="stats stats-vertical lg:stats-horizontal shadow">

        <div className="stat">
          <div className="stat-title">Map</div>
          <div className="stat-value">{match.mapName}</div>
        </div>

        <div className="stat">
          <div className="stat-title">Mode</div>
          <div className="stat-value">{match.type.toUpperCase()}</div>
        </div>

        <div className="stat">
          <div className="stat-title">Date</div>
          <div className="stat-value">{moment(match.date).format('DD/MM/YY')}</div>
        </div>

      </div>
    </section>

    {/* Score */}
    <section className="flex flex-row">
      <div className="stat">
        <div className="stat-title">Team Red</div>
        <div className="stat-value text-error">{match.teams.red.score}</div>
      </div>
      <div className="stat">
        <div className="stat-title">Team Blue</div>
        <div className="stat-value text-info">{match.teams.blue.score}</div>
      </div>
    </section>

    {/* Player Table */}
    <section>
      <table className="table table-xs sm:table-sm">
        <thead>
          <tr className="text-center">
            <th></th>
            <th>Agent</th>
            <th>Name</th>
            <th>Rank</th>
            <th>LVL</th>
            <th>K/D/A</th>
            <th>KD Ratio</th>
            <th>HS%</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {match.players.map(player => (
            <tr key={player.puuid} className={clsx(player.team === 'Blue' ? 'bg-info/10' : 'bg-error/5', 'text-center')}>
              <td>{player.partyNumber}</td>
              <td className="flex flex-row items-center"><img src={player.agentImg} className="max-h-8"/></td>
              <td className="text-left">
                <span>{player.name}</span>
                <span className="text-xs opacity-50">#{player.tag}</span>
              </td>
              <td><span className="text-xs font-bold" style={{ color: `#${player.rankColor}` }} >{player.rankName}</span></td>
              <td>{player.accountLevel}</td>
              <td>{player.kills} / {player.deaths} / {player.assists}</td>
              <td><span className={player.kd >= 1 ? 'text-success' : 'text-error'}>{player.kd}</span></td>
              <td>{player.hs}%</td>
              <td><button className="btn btn-ghost btn-sm" onClick={() => navigate(`/player/${player.puuid}?refMatchId=${matchId}`)}><ExternalLink size={16} /></button></td>
            </tr>
          ))}
        </tbody>

      </table>
    </section>

    {/* Round Timeline */}
    {/* <section>
      <ul className="timeline">
        {
          match.roundResults?.map(round => (
             <li key={round.roundNum}>
                <div className={clsx('timeline-box', round.winningTeam === 'Red' ? 'timeline-start bg-error/5' : 'timeline-end bg-info/10')}>{}</div>
                <div className="timeline-middle bg-base-300 rounded-full p-2">
                  {
                    round.roundResultCode === 'Defuse' ? <ScissorsLineDashed size={20} />
                    : round.roundResultCode === 'Elimination' ? <Skull size={20} />
                    : round.roundResultCode === 'Detonate' ? <Bomb size={20} />
                    : round.roundResultCode === 'Surrendered' ? <FlagOff size={20} />
                    : null
                  }
                </div>
                <hr />
            </li>
          ))
        }
      </ul>
    </section> */}

  </div>
}
