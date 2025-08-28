import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useAtom } from "jotai"
import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { Dot, LabelList, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"
import { MatchResult, MatchDetailsResponse } from "../interface"
import * as utils from '../utils/utils'
import atoms from "../utils/atoms"
import clsx from "clsx"
import moment from "moment"
import { ExternalLink } from "lucide-react"
import { BestAgent, BestMaps } from "@/interface/utils.interface"

interface Row {
  matchId: string
  mapName: string
  kills: number
  deaths: number
  assists: number
  hs: number
  date: Date,
  result: MatchResult
  score: string
  mmrUpdate: number | null
  agentId: string | null
  agentName: string | null
  agentImage: string | null
}

type PlayerCard = {
  name: string
  tag: string
  currentRank: string
  currentRR: number
  currentRankColor: string
  peakRank: string
  peakRankColor: string
  dodge?: boolean
  dodgeTimestamp?: number
}

type PlayerStats = {
  hs: number
  kd: number
  adr: number
}

type ChartData = {
  i: number
  kills: number
  deaths: number
  kd: number
  adr: number
  hs: number
}[]

type ChartType = 'kills/deaths' | 'kd' | 'adr' | 'hs'

export const PlayerPage = () => {
  const [error, setError] = useState<string|null>(null)

  const [sharedapi] = useAtom(atoms.sharedapi)
  const [cache] = useAtom(atoms.cache)
  const [ownPuuid] = useAtom(atoms.puuid)

  const [table, setTable] = useState<Row[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [playerCard, setPlayerCard] = useState<PlayerCard>()
  const [playerStats, setPlayerStats] = useState<PlayerStats>()
  const [accountLevel, setAccountLevel] = useState<number>()
  const [bestAgents, setBestAgents] = useState<(BestAgent & { agentName: string, agentUrl: string })[]>()
  const [bestMaps, setBestMaps] = useState<(BestMaps & { mapName: string, mapUrl: string })[]>()

  const [chartData, setChartData] = useState<ChartData>()
  const [chartType, setChartType] = useState<ChartType>('kills/deaths')

  const { puuid } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams();
  const refMatchId = searchParams.get('refMatchId')
  const refMapId = searchParams.get('mapId')
  const refAgentId = searchParams.get('agentId')

  const chartConfig = {
    kills: {
      label: "Kills",
      color: "#00d390",
    },
    deaths: {
      label: "Deaths",
      color: "#ff637d",
    },
  } satisfies ChartConfig

  const onDodgeChange = async (state: boolean) => {
    if (!playerCard) return

    const res = await cache?.execute('INSERT into players (puuid, dodge, dodgeTimestamp) VALUES ($1, $2, $3) ON CONFLICT(puuid) DO UPDATE SET dodge = $2, dodgeTimestamp = $3 WHERE puuid = $1', [puuid, state, +new Date()])

    if (res?.rowsAffected == 1)
      setPlayerCard({ ...playerCard, dodge: state, dodgeTimestamp: state ? +new Date() : 0 })
  }

  useEffect(() => {

    (async () => {
      if (!puuid || !sharedapi) return
      setLoading(true)

      const table: Row[] = []
      const _chartData: ChartData = []
      let accountLevel: number = 0

      try {
        const { History } = await sharedapi.getPlayerMatchHistory(puuid)
        const { Matches: mmrUpdates } = await sharedapi.getCompetitiveUpdates(puuid)

        const matches: MatchDetailsResponse[] = []

        for (const match of History){
          matches.push(await sharedapi.getMatchDetails(match.MatchID))
        }

        const { hs: avgHS, adr: avgAdr, kd: avgKd } = utils.calculateStatsForPlayer(puuid, matches)

        for (const i in matches){
          const match = matches[i]
          const mmrUpdate = mmrUpdates.find(update => update.MatchID === match.matchInfo.matchId)

          const player = match.players.find(player => player.subject === puuid) as MatchDetailsResponse['players'][0]
          const { uuid: agentId, displayName: agentName, killfeedPortrait: agentImage } = utils.getAgent(player.characterId)

          const { result, score } = utils.getMatchResult(player.subject, match)

          const { kills, deaths, assists, hs, adr, kd } = utils.calculateStatsForPlayer(puuid, [match])

          if (!accountLevel)
            accountLevel = player.accountLevel

          _chartData.push({
            i: parseInt(i),
            kills,
            deaths,
            kd,
            adr,
            hs
          })

          table.push({
            matchId: match.matchInfo.matchId,
            mapName: utils.getMap(match.matchInfo.mapId).displayName,
            kills,
            deaths,
            assists,
            hs,
            date: new Date(match.matchInfo.gameStartMillis),
            result,
            score,
            mmrUpdate: mmrUpdate?.RankedRatingEarned || null,
            agentId,
            agentName,
            agentImage
          })
        }

        // Top Agents
        const bestAgents = utils.calculateBestAgents(puuid, matches)
          .map(agent => {
            const { displayName: agentName, displayIcon: agentUrl } = utils.getAgent(agent.agentId)
            return { ...agent, agentName, agentUrl }
          })

        // Top Maps
        const bestMaps = utils.calculateBestMaps(puuid, matches)
          .map(map => {
            const { displayName: mapName, listViewIcon: mapUrl } = utils.getMap(map.mapId)
            return { ...map, mapName, mapUrl }
          })


        setBestAgents(bestAgents)
        setBestMaps(bestMaps)
        setTable(table)
        setLoading(false)
        setAccountLevel(accountLevel)
        setChartData(_chartData.reverse())
        setPlayerStats({
          hs: avgHS,
          adr: avgAdr,
          kd: avgKd
        })
      } catch (err){
        console.error(err)
        setError('Faled to load matches:' + err)
      }

    })()

  }, [])

  useEffect(() => {
    if (!sharedapi || !puuid) return

    (async () => {
      const [{ GameName, TagLine }] = await sharedapi.getPlayerNames([puuid])

      const mmr = await sharedapi?.getPlayerMMR(puuid)
      const { currentRank, currentRR, peakRank } = utils.calculateRanking(mmr)

      const player = await cache?.select<any[]>("SELECT * from players WHERE puuid = ?", [puuid]).then(players => players[0])

      setPlayerCard({
        name: GameName,
        tag: TagLine,
        currentRank: utils.getRank(currentRank).rankName,
        currentRR,
        currentRankColor: utils.getRank(currentRank).rankColor,
        peakRank: utils.getRank(peakRank).rankName,
        peakRankColor: utils.getRank(peakRank).rankColor,
        dodge: player?.dodge,
        dodgeTimestamp: player?.dodgeTimestamp
      })

    })()
  }, [])

  if (error)
    return <div className='flex flex-row justify-center space-x-4'>
      <p className="alert alert-error">{error}</p>
    </div>

  if (loading)
    return <div className='flex flex-col items-center space-y-4'>
      <p><span className="loading loading-spinner loading-xs mr-2"></span> Loading matches</p>
      <p className="alert max-w-md text-center text-xs">If loading takes too long, you probably hit the Riot's rate limit and matches will load in a minute or so</p>
    </div>

  return <div className="flex flex-col items-center p-4">

    <div className="flex flex-row space-x-4">
      {/* Player Data */}
      <section id="player-card" className="space-y-2 flex flex-col">

        <div className="flex flex-row">
            <div className="stat">
              <div className="stat-title">Name</div>
              <div className="stat-value">{playerCard?.name}</div>
              <div className="stat-desc">{playerCard?.tag}</div>
            </div>

            <div className="stat">
              <div className="stat-title">Account level</div>
              <div className="stat-value">{accountLevel}</div>
              <div className="stat-desc opacity-0">a</div>
            </div>
        </div>

        <div>
          <div className="stats shadow w-full">
            <div className="stat border-4" style={{ color: '#' + playerCard?.currentRankColor }}>
              <div className="stat-title">Rank</div>
              <div className="stat-value justify-between flex">
                <span>{playerCard?.currentRank}</span>
                <span>{playerCard?.currentRR} / 100</span>
              </div>
              <div className="stat-desc">Peak <span style={{ color: '#' + playerCard?.peakRankColor }}>{playerCard?.peakRank}</span></div>
            </div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Total Matches</div>
            <div className="stat-value">{table.length}</div>
          </div>

          <div className="stat">
            <div className="stat-title">Wins / Loss</div>
            <div className="stat-value">{table.filter(match => match.result === 'won').length} / {table.filter(match => match.result === 'loss').length}</div>
          </div>

          <div className="stat">
            <div className="stat-title">Winrate %</div>
            <div className="stat-value">{table.length ? (table.filter(match => match.result === 'won').length / table.length * 100).toFixed(0) : 0}%</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">K/D</div>
            <div className={clsx('stat-value', playerStats && playerStats?.kd >= 1 ? 'text-success' : 'text-error' )}>{playerStats?.kd}</div>
          </div>

          <div className="stat">
            <div className="stat-title">Average Damage per Round</div>
            <div className={clsx('stat-value', playerStats && playerStats?.adr >= 150 ? 'text-success' : 'text-error' )}>{playerStats?.adr}</div>
          </div>

          <div className="stat">
            <div className="stat-title">Headshot %</div>
            <div className="stat-value">{playerStats?.hs}%</div>
          </div>
        </div>

      </section>

      {
        puuid !== ownPuuid &&
        <div className="flex flex-col space-y-4 p-4 rounded-md max-w-64">
          <p>If this player ruined the game, trolled or played like dogshit, you can add this animal to your avoid list</p>
          <p className="text-xs text-gray-400">This avoid list is saved locally, meaning you still have a chance to queue with this player, but the warning will be displayed next to their name</p>

          {playerCard?.dodgeTimestamp ? <p className="text-xs text-gray-400">Dodge from {moment(playerCard.dodgeTimestamp).format('DD-MM-YYYY')}</p> : null}

          <button className="btn btn-soft btn-sm btn-warning" onClick={() => onDodgeChange(playerCard?.dodge ? false : true)}>{playerCard?.dodge ? 'Remove from Avoid list' : 'Avoid Player'}</button>
        </div>
      }

    </div>

    {
      chartData?.length ?
      <>
        <div className="divider px-32" />

        {/* Kills Death, KD and ADR Charts */}
        <section className="card w-full max-w-3xl">
          <div className="card-body">
            <div className="flex flex-row justify-between">
              <h2 className="card-title">Performance over last 20 matches</h2>
              <div className="join join-vertical sm:join-horizontal">
                <input className="join-item btn btn-soft btn-xs text-[0.5rem] sm:text-xs" type="radio" onClick={() => setChartType('kills/deaths')} defaultChecked={true} name="options" aria-label="Kills and Deaths" />
                <input className="join-item btn btn-soft btn-xs text-[0.5rem] sm:text-xs" type="radio" onClick={() => setChartType('kd')} name="options" aria-label="K/D Ratio" />
                <input className="join-item btn btn-soft btn-xs text-[0.5rem] sm:text-xs" type="radio" onClick={() => setChartType('adr')} name="options" aria-label="ADR" />
                <input className="join-item btn btn-soft btn-xs text-[0.5rem] sm:text-xs" type="radio" onClick={() => setChartType('hs')} name="options" aria-label="HS%" />
              </div>
            </div>

            <ChartContainer config={chartConfig} className="min-h-[200px]">
              <LineChart accessibilityLayer data={chartData}>
                <XAxis
                  dataKey="i"
                  tickLine={true}
                  axisLine={true}
                  padding={{ left: 16, right: 16 }}
                  tickFormatter={(_, i) => {
                    return i === 0 ? 'Oldest':
                          i === (chartData!.length-1) ? 'Recent':
                          ''
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" color="#00d390" />}
                />
                {
                  chartType === 'kills/deaths' ?
                  <>
                    <YAxis
                      type="number"
                      domain={[0, 'dataMax + 2']}
                      tickCount={30}
                      allowDecimals={false}
                      padding={{ bottom: 32, top: 32 }}
                    />
                    <Line
                      dataKey="kills"
                      type="linear"
                      stroke="var(--color-kills)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-kills)" }}
                      activeDot={{ r: 6 }}
                      isAnimationActive={false}
                    >
                      <LabelList
                        position="top"
                        offset={12}
                        className="fill-foreground"
                        fontSize={12}
                      />
                    </Line>
                    <Line
                        dataKey="deaths"
                        type="linear"
                        stroke="var(--color-deaths)"
                        strokeWidth={2}
                        dot={{ fill: "var(--color-deaths)" }}
                        activeDot={{ r: 6 }}
                        isAnimationActive={false}
                      >
                        <LabelList
                          position="top"
                          offset={12}
                          className="fill-foreground"
                          fontSize={12}
                        />
                    </Line>
                  </>:
                  chartType === 'kd' ?
                  <>
                    <YAxis
                      type="number"
                      domain={[0, (dataMax: number) => (Math.round(dataMax) + 0.5)]}
                      allowDecimals={false}
                      ticks={Array.from({length: Math.floor(3 / 0.5) + 1}, (_, i) => i * 0.5)}
                      padding={{ bottom: 32, top: 32 }}
                    />
                    <ReferenceLine y={playerStats?.kd} stroke="gray" strokeDasharray="4 1" />
                    { playerStats && chartData?.map(data => <ReferenceLine key={data.i} segment={[{ x: data.i, y: playerStats.kd }, { x: data.i, y: data.kd }]} strokeWidth={1} stroke={ data.kd >= playerStats.kd ? '#00d390' : '#ff637d' } />) }
                    <Line
                        dataKey="kd"
                        type="natural"
                        dot={({ payload, ...props }) => (
                          <Dot
                            key={payload.i}
                            r={4}
                            cx={props.cx}
                            cy={props.cy}
                            fill={ playerStats && props.value >= playerStats.kd ? '#00d390' : '#ff637d' }
                            stroke={payload.fill}
                          />
                        )}
                        strokeWidth={0}
                        activeDot={false}
                        isAnimationActive={false}
                      >
                        <LabelList
                          position="top"
                          offset={16}
                          className="fill-foreground"
                          fontSize={10}
                          content={({ value, x, y, offset }: any) => (
                            <text
                              x={Number.isInteger(value) ? x - 2 : x - 10}
                              y={playerStats && value > playerStats.kd ? y - offset + 4: y + offset}
                              fill="#666"
                            >
                              {value}
                            </text>
                          )}
                        />
                    </Line>
                  </>:
                  chartType === 'adr' ?
                  <>
                      <YAxis
                        type="number"
                        domain={[(dataMin: number) => dataMin - 50, (dataMax: number) => dataMax + 50]}
                        allowDecimals={false}
                        ticks={Array.from({ length: 12 }, (_, i) => i * 25)}
                        padding={{ bottom: 32, top: 32 }}
                      />
                      <ReferenceLine y={playerStats?.adr} stroke="gray" strokeDasharray="4 1" />
                      { chartData?.map(data => <ReferenceLine key={data.i} segment={[{ x: data.i, y: data.adr }, { x: data.i, y: playerStats?.adr }]} strokeWidth={1} stroke={ playerStats && data.adr >= playerStats?.adr ? '#00d390' : '#ff637d' } />) }
                      <Line
                          dataKey="adr"
                          type="natural"
                          dot={({ payload, ...props }) => (
                            <Dot
                              key={payload.i}
                              r={4}
                              cx={props.cx}
                              cy={props.cy}
                              fill={ playerStats && props.value >= playerStats?.adr ? '#00d390' : '#ff637d' }
                              stroke={payload.fill}
                            />
                          )}
                          strokeWidth={0}
                          activeDot={false}
                          isAnimationActive={false}
                        >
                          <LabelList
                            offset={16}
                            className="fill-foreground"
                            fontSize={10}
                            content={({ value, x, y, offset }: any) => (
                              <text
                                x={playerStats && value > playerStats?.adr ? x - 10 : x - 8}
                                y={playerStats && value > playerStats?.adr ? y - offset + 4: y + offset}
                                fill="#666"
                              >
                                {value}
                              </text>
                            )}
                          />
                      </Line>
                  </> :
                  chartType === 'hs' ?
                  <>
                      <YAxis
                        type="number"
                        domain={[0, 100]}
                        allowDecimals={false}
                        ticks={Array.from({ length: 5 }, (_, i) => i * 25)}
                        padding={{ bottom: 32, top: 32 }}
                      />
                      {/* { chartData?.map(data => <ReferenceLine key={data.i} segment={[{ x: data.i, y: data.hs }, { x: data.i, y: 100 }]} strokeWidth={1} stroke={ data.hs >= 100 ? '#00d390' : '#ff637d' } />) } */}
                      <Line
                        dataKey="hs"
                        type="linear"
                        stroke="var(--color-kills)"
                        strokeWidth={2}
                        dot={{ fill: "var(--color-kills)" }}
                        activeDot={{ r: 6 }}
                        isAnimationActive={false}
                      >
                        <LabelList
                          position="top"
                          offset={12}
                          className="fill-foreground"
                          fontSize={12}
                        />
                      </Line>
                  </> :
                  <></>
                }
              </LineChart>
            </ChartContainer>

          </div>
        </section>

        <div className="divider px-32" />

        {/* Best Agents Table */}
        <section className="flex flex-col space-y-8 lg:flex-row lg:space-x-8">
          <div className="flex flex-col space-y-4">
            <label className="font-bold my-4">Agent Performance</label>

            <div className="overflow-x-auto">
              <table className="table table-xs text-center">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Matches</th>
                    <th>KD</th>
                    <th>HS%</th>
                    <th>ADR</th>
                    <th>W / T / L</th>
                    <th>WR%</th>
                  </tr>
                </thead>
                <tbody>
                  {bestAgents?.map(agent => (
                    <tr key={agent.agentId} className={clsx(refAgentId === agent.agentId && 'border-2 border-primary')}>
                      <th className="flex flex-row items-center space-x-2">
                        <img src={agent.agentUrl} className="max-h-6" draggable={false} />
                        <span>{agent.agentName}</span>
                      </th>
                      <td>{agent.matches}</td>
                      <td className={clsx(agent.kd >= 1 ? 'text-success' : 'text-error')}>{agent.kd}</td>
                      <td>{agent.hs}%</td>
                      <td className={clsx(agent.adr >= 150 ? 'text-success' : 'text-error')}>{agent.adr}</td>
                      <td className="space-x-0.5">
                        <span className="text-success">{agent.wins}</span>
                        <span className="opacity-50">-</span>
                        <span>{agent.ties}</span>
                        <span className="opacity-50">-</span>
                        <span className="text-error">{agent.losses}</span>
                      </td>
                      <td className={clsx(agent.winrate > 50 ? 'text-success' : 'text-error')}>{agent.winrate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <label className="font-bold my-4">Map Performance</label>

            <div className="overflow-x-auto">
              <table className="table table-xs text-center">
                <thead>
                  <tr>
                    <th>Map</th>
                    <th>Matches</th>
                    <th>KD</th>
                    <th>HS%</th>
                    <th>ADR</th>
                    <th>W / T / L</th>
                    <th>WR%</th>
                  </tr>
                </thead>
                <tbody>
                  {bestMaps?.map(map => (
                    <tr key={map.mapId}  className={clsx(refMapId === map.mapId && 'border-2 border-primary')}>
                      <th className="flex flex-row items-center space-x-2">
                        <img src={map.mapUrl} className="max-h-6 blur-[1px] brightness-50" draggable={false} />
                        <span className="z-10 absolute left-4">{map.mapName}</span>
                      </th>
                      <td>{map.matches}</td>
                      <td className={clsx(map.kd >= 1 ? 'text-success' : 'text-error')}>{map.kd}</td>
                      <td>{map.hs}%</td>
                      <td className={clsx(map.adr >= 150 ? 'text-success' : 'text-error')}>{map.adr}</td>
                      <td className="space-x-0.5">
                        <span className="text-success">{map.wins}</span>
                        <span className="opacity-50">-</span>
                        <span>{map.ties}</span>
                        <span className="opacity-50">-</span>
                        <span className="text-error">{map.losses}</span>
                      </td>
                      <td className={clsx(map.winrate > 50 ? 'text-success' : 'text-error')}>{map.winrate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div className="divider px-32" />

        {/* Matches Table */}
        <section className="overflow-x-auto flex flex-col space-y-8">
          <label className="font-bold my-4">Player Match History</label>

          <table className="table table-xs">

            <thead>
              <tr className="text-center">
                <th>Date</th>
                <th>Agent</th>
                <th>Map</th>
                <th>K / D / A</th>
                <th>Result</th>
                <th>Score</th>
                <th>±RR</th>
                <th>HS%</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {table.map(match => (
                <tr key={match.matchId} className={clsx(match.result === 'won' ? 'bg-success/5' : match.result === 'loss' ? 'bg-error/5' : 'bg-white/5', 'text-center', refMatchId === match.matchId && 'border-2 border-primary')}>
                  <td className="text-left">{moment(match.date).format('HH:mm DD/MM/YY')} <span className="opacity-25">({moment(match.date).fromNow()})</span></td>
                  <td><img src={match.agentImage || undefined} className="max-h-6"/></td>
                  <td>{match.mapName}</td>
                  <td>{match.kills} / {match.deaths} / {match.assists}</td>
                  <td className={clsx(match.result === 'won' ? 'text-success' : match.result === 'loss' ? 'text-error' : null)}>{match.result === 'won' ? 'Win' : match.result === 'loss' ? 'Loss' : 'Draw'}</td>
                  <td className={clsx(match.result === 'won' ? 'text-success' : match.result === 'loss' ? 'text-error' : null)}>{match.score}</td>
                  <td className={clsx(match.mmrUpdate ? match.mmrUpdate > 0 ? 'text-success' : 'text-error' : null)}>{match.mmrUpdate ? match.mmrUpdate > 0 ? `+${match.mmrUpdate}` : match.mmrUpdate : null}</td>
                  <td>{match.hs ? match.hs + '%' : null}</td>
                  <td><button className="btn btn-xs btn-ghost" onClick={() => navigate(`/match/${match.matchId}`)}><ExternalLink size={14} /></button></td>
                </tr>
              ))}
            </tbody>

          </table>
        </section>
      </> :
      <p className="my-10">No competitive matches played</p>
    }


  </div>
}
