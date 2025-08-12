import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useAtom } from "jotai"
import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { Dot, LabelList, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"
import { MatchResult, MatchDetailsResponse } from "../interface"
import * as utils from '../utils'
import atoms from "../utils/atoms"
import clsx from "clsx"
import moment from "moment"
import { ExternalLink } from "lucide-react"

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
  const [sharedapi] = useAtom(atoms.sharedapi)

  const [table, setTable] = useState<Row[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [playerCard, setPlayerCard] = useState<PlayerCard>()
  const [playerStats, setPlayerStats] = useState<PlayerStats>()
  const [accountLevel, setAccountLevel] = useState<number>()

  const [chartData, setChartData] = useState<ChartData>()
  const [chartType, setChartType] = useState<ChartType>('kills/deaths')

  const { puuid } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams();
  const refMatchId = searchParams.get('refMatchId')

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

  useEffect(() => {

    (async () => {
      if (!puuid || !sharedapi) return
      setLoading(true)

      const table: Row[] = []
      const _chartData: ChartData = []
      let accountLevel: number = 0

      const { History } = await sharedapi.getPlayerMatchHistory(puuid)

      const matches: MatchDetailsResponse[] = []

      for (const match of History){
        matches.push(await sharedapi.getMatchDetails(match.MatchID))
      }

      const { hs: avgHS, adr: avgAdr, kd: avgKd } = utils.calculateStatsForPlayer(puuid, matches)

      for (const i in matches){
        const match = matches[i]

        const player = match.players.find(player => player.subject === puuid) as MatchDetailsResponse['players'][0]
        const { uuid: agentId, displayName: agentName, killfeedPortrait: agentImage } = utils.getAgent(player.characterId)

        const { result, score } = utils.getMatchResult(player.subject, [match])

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
          agentId,
          agentName,
          agentImage
        })
      }

      setTable(table)
      setLoading(false)
      setAccountLevel(accountLevel)
      setChartData(_chartData.reverse())
      setPlayerStats({
        hs: avgHS,
        adr: avgAdr,
        kd: avgKd
      })
    })()

  }, [])

  useEffect(() => {
    if (!sharedapi || !puuid) return

    (async () => {
      const [{ GameName, TagLine }] = await sharedapi.getPlayerNames([puuid])

      const mmr = await sharedapi?.getPlayerMMR(puuid)
      const { currentRank, currentRR, peakRank } = utils.calculateRanking(mmr)

      setPlayerCard({
        name: GameName,
        tag: TagLine,
        currentRank: utils.getRank(currentRank).rankName,
        currentRR,
        currentRankColor: utils.getRank(currentRank).rankColor,
        peakRank: utils.getRank(peakRank).rankName,
        peakRankColor: utils.getRank(peakRank).rankColor,
      })

    })()
  }, [])

  if (loading)
    return <div className='flex flex-row justify-center space-x-4'>
      <span className="loading loading-spinner loading-xs"></span>
      <p>Loading matches</p>
    </div>

  return <div className="flex flex-col items-center p-4">

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
            <div className="stat-value">{playerCard?.currentRank}</div>
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
      chartData?.length ?
      <>
        {/* Kills Death, KD and ADR Charts */}
        <div className="card w-full max-w-3xl my-10">
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
        </div>

        <section className="overflow-x-auto flex flex-col items-center">
          <span className="font-bold my-4">Player Match History</span>

          <table className="table table-xs">

            <thead>
              <tr className="text-center">
                <th>Date</th>
                <th>Agent</th>
                <th>Map</th>
                <th>K / D / A</th>
                <th>Result</th>
                <th>Score</th>
                <th>±Δ</th>
                <th>HS%</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {table.map(match => (
                <tr key={match.matchId} className={clsx(match.result === 'won' ? 'bg-success/5' : match.result === 'loss' ? 'bg-error/5' : 'bg-white/5', 'text-center', refMatchId === match.matchId && 'outline-2 outline-primary')}>
                  <td className="text-left">{moment(match.date).format('HH:mm DD/MM/YY')} <span className="opacity-25">({moment(match.date).fromNow()})</span></td>
                  <td><img src={match.agentImage || undefined} className="max-h-6"/></td>
                  <td>{match.mapName}</td>
                  <td>{match.kills} / {match.deaths} / {match.assists}</td>
                  <td className={clsx(match.result === 'won' ? 'text-success' : match.result === 'loss' ? 'text-error' : null)}>{match.result === 'won' ? 'Win' : match.result === 'loss' ? 'Loss' : 'Draw'}</td>
                  <td className={clsx(match.result === 'won' ? 'text-success' : match.result === 'loss' ? 'text-error' : null)}>{match.score}</td>
                  <td className={(match.kills - match.deaths) >= 1 ? 'text-success' : (match.kills - match.deaths) == 0 ? '' : 'text-error'}>{(match.kills - match.deaths) >= 1 ? '+' : null}{(match.kills - match.deaths)}</td>
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
