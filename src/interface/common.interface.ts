
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
  hs?: number
  adr?: number
  agentName: string | null
  agentId: string | null
  agentImage: string | null
  lastGameResult?: MatchResult
  lastGameScore?: string
  lastGameMMRDiff?: number
  gameHistory?: string[]
  currentRank?: string
  currentRankColor?: string
  currentRR?: number
  rankPeak?: string
  rankPeakColor?: string
  rankPeakDate?: Date | null
  accountLevel?: number | null
  enemy: boolean
  bestAgents?: AgentStats[]
}

export type Payload = {
  data: {
    phase: 'Idle' | 'Gameplay'
    version: string
    presences: {
      private: string
      puuid: string
    }[]
  }
  eventType: 'Create' | 'Update',
  uri: string
}

export type GameState = 'MENUS' | 'PREGAME' | 'INGAME'

export type MatchResult = 'won' | 'loss' | 'tie' | 'N/A'
