
// Local

export interface PlayerAccount {
  game_name: string
  tag_line: string
}

export interface EntitlementsTokenResponse {
  accessToken: string
  subject: string
  token: string
}


// Shared

export interface CurrentGamePlayerResponse {
  Subject: string
  MatchID: string
}

export interface CurrentGameMatchResponse {
  MatchID: string
  State: 'IN_PROGRESS'
}
