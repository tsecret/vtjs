
export interface Lockfile {
  port: string
  password: string
}

export interface PlayerRow {
  name: string
  tag: string
  puuid: string
  kd?: number
  agentName: string | null
  agentId: string | null
  agentImage: string | null
  lastGameWon?: boolean | string
  lastGameScore?: string
  gameHistory?: string[]
  currentRank?: string
  currentRankColor?: string
  currentRR?: number
  rankPeak?: string
  rankPeakColor?: string
  rankPeakDate?: string
  accountLevel?: number
  enemy: boolean
}
