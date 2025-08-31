export type BestAgent = {
  agentId: string,
  matches: number,
  wins: number,
  losses: number,
  ties: number,
  winrate: number,
  kills: number,
  deaths: number,
  assists: number,
  kd: number,
  hs: number,
  adr: number
}

export type BestMaps = {
  mapId: string,
  matches: number,
  wins: number,
  losses: number,
  ties: number,
  winrate: number,
  kills: number,
  deaths: number,
  assists: number,
  kd: number,
  hs: number,
  adr: number
}

export type PlayerMatchStats = {
  kills: number,
  deaths: number,
  assists: number,
  kd: number,
  hs: number,
  adr: number,
  wins: number,
  losses: number,
  ties: number,
  winrate: number
}

export type PlayerRanking = {
  currentRank: number,
  currentRR: number,
  peakRank: number,
  peakRankSeasonId: string | null,
  lastGameMMRDiff: number
  mmr: number
}

export type Rank = {
  tier: number
  rankName: string,
  rankColor: string,
  rankImg: string
}
