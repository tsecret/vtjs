
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
  History: {
    MatchID: string
    QueueID: string
    gameStartTime: number // unix in ms (e.g 1749759442793)
  }[]
}

export interface MatchDetailsResponse {
  matchInfo: {
    matchId: string
  }
  players: {
    subject: string
    teamId: 'Red' | 'Blue'
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
