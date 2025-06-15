
// Local

export interface PlayerAccount {
  game_name: string
  tag_line: string
}

export interface EntitlementsTokenResponse {
  accessToken: string
  entToken: string
  subject: string
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
