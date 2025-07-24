
export interface Lockfile {
  port: string
  password: string
}

export type AgentStats = {
  agentId: string
  agentUrl: string
  avgKills: number
  avgDeaths: number
  avgKd: number
  games: number
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
  bestAgents?: AgentStats[]
}

export type Payload = {
  data: {
    phase: 'Idle'
    version: string
  }
  eventType: 'Create' | 'Update',
  uri: string
}


export type GameState = 'Idle' | 'PreGame' | 'Game'
