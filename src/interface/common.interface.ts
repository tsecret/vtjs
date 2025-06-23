
export interface Lockfile {
  port: string
  password: string
}

export interface Match {
  MatchID: string
  State: 'IN_PROGRESS'
  Players: Player[]
}

export interface Player {
  Subject: string
  TeamID: string
  CharacterID: string
}

export interface PlayerRow {
  name: string
  tag: string
  puuid: string
  kd?: number
  agentName: string
  agentId: string
  agentImage: string
  lastGameWon?: boolean | string
  lastGameScore?: string
  currentRank?: string
  currentRankColor?: string
  currentRR?: number
  rankPeak?: string
  rankPeakColor?: string
  rankPeakDate?: string
  accountLevel?: number
  enemy: boolean
}
