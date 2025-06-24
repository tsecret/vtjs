
// Local

import { Match } from "./common.interface"

export interface PlayerAccount {
  game_name: string
  tag_line: string
}

export interface EntitlementsTokenResponse {
  accessToken: string
  token: string
  subject: string
}

export interface HelpResponse {
  events: { [key: string]: string }
}

// Shared

export interface CurrentGamePlayerResponse {
  Subject: string
  MatchID: string
}

export interface CurrentGameMatchResponse extends Match {}

export interface PlayerNamesReponse {
  Subject: string
  GameName: string
  TagLine: string
}

export interface PlayerMatchHistoryResponse {
  Subject: string
  Total: number
  History: {
    MatchID: string
    QueueID: string
    gameStartTime: number // unix in ms (e.g 1749759442793)
  }[]
}

export interface MatchDetailsResponse {
  matchInfo: {
    matchId: string
    gameStartMillis: number
    mapId: string
  }
  players: {
    subject: string
    teamId: 'Red' | 'Blue'
    characterId: string
    competitiveTier: number
    accountLevel: number
    stats: {
      score: number
      kills: number
      deaths: number
      assists: number
    }
  }[]
  teams: {
    teamId: 'Red' | 'Blue'
    won: boolean
    roundsWon: number
    roundsPlayed: number
  }[]
}

export interface CompetitiveUpdatesResponse {
  Matches: {
    MatchID: string
    MapID: string
    SeasonID: string
    TierAfterUpdate: number
    RankedRatingAfterUpdate: number
  }[]
}

export interface PlayerMMRResponse {
  LatestCompetitiveUpdate: {
    TierAfterUpdate: number
    RankedRatingAfterUpdate: number
  }
  QueueSkills: {
    competitive: {
      SeasonalInfoBySeasonID: {
        [key: string]: {
          SeasonID: string
          Rank: number
        }
      } | null
    }
  }
}
