
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

export type CurrentPreGamePlayerResponse = {
  Subject: string;
  MatchID: string;
  Version: number;
}

export type CurrentGamePlayerResponse = CurrentPreGamePlayerResponse

export type CurrentPreGameMatchResponse = {
    ID: string;
    Teams: {
        TeamID: ("Blue" | "Red") | string;
        Players: {
            /** Player UUID */
            Subject: string;
            /** Character ID */
            CharacterID: string;
            CharacterSelectionState: "" | "selected" | "locked";
            PregamePlayerState: "joined";
            CompetitiveTier: number;
            PlayerIdentity: {
                /** Player UUID */
                Subject: string;
                /** Card ID */
                PlayerCardID: string;
                /** Title ID */
                PlayerTitleID: string;
                AccountLevel: number;
                /** Preferred Level Border ID */
                PreferredLevelBorderID: string | "";
                Incognito: boolean;
                HideAccountLevel: boolean;
            };
            SeasonalBadgeInfo: {
                /** Season ID */
                SeasonID: string | "";
                NumberOfWins: number;
                WinsByTier: null;
                Rank: number;
                LeaderboardRank: number;
            };
            IsCaptain: boolean;
        }[];
    }[];
    AllyTeam: {
        TeamID: ("Blue" | "Red") | string;
        Players: {
            /** Player UUID */
            Subject: string;
            /** Character ID */
            CharacterID: string;
            CharacterSelectionState: "" | "selected" | "locked";
            PregamePlayerState: "joined";
            CompetitiveTier: number;
            PlayerIdentity: {
                /** Player UUID */
                Subject: string;
                /** Card ID */
                PlayerCardID: string;
                /** Title ID */
                PlayerTitleID: string;
                AccountLevel: number;
                /** Preferred Level Border ID */
                PreferredLevelBorderID: string | "";
                Incognito: boolean;
                HideAccountLevel: boolean;
            };
            SeasonalBadgeInfo: {
                /** Season ID */
                SeasonID: string | "";
                NumberOfWins: number;
                WinsByTier: null;
                Rank: number;
                LeaderboardRank: number;
            };
            IsCaptain: boolean;
        }[];
    } | null;
    EnemyTeam: {
        TeamID: ("Blue" | "Red") | string;
        Players: {
            /** Player UUID */
            Subject: string;
            /** Character ID */
            CharacterID: string;
            CharacterSelectionState: "" | "selected" | "locked";
            PregamePlayerState: "joined";
            CompetitiveTier: number;
            PlayerIdentity: {
                /** Player UUID */
                Subject: string;
                /** Card ID */
                PlayerCardID: string;
                /** Title ID */
                PlayerTitleID: string;
                AccountLevel: number;
                /** Preferred Level Border ID */
                PreferredLevelBorderID: string | "";
                Incognito: boolean;
                HideAccountLevel: boolean;
            };
            SeasonalBadgeInfo: {
                /** Season ID */
                SeasonID: string | "";
                NumberOfWins: number;
                WinsByTier: null;
                Rank: number;
                LeaderboardRank: number;
            };
            IsCaptain: boolean;
        }[];
    } | null;
    MapID: string;
}

export type CurrentGameMatchResponse = {
    /** Current Game Match ID */
    MatchID: string;
    Version: number;
    State: "IN_PROGRESS";
    /** Map ID */
    MapID: string;
    /** Game Mode */
    ModeID: string;
    ProvisioningFlow: "Matchmaking" | "CustomGame";
    GamePodID: string;
    /** Chat room ID for "all" chat */
    AllMUCName: string;
    /** Chat room ID for "team" chat */
    TeamMUCName: string;
    TeamVoiceID: string;
    /** JWT containing match ID, participant IDs, and match region */
    TeamMatchToken: string;
    IsReconnectable: boolean;
    ConnectionDetails: {
        GameServerHosts: string[];
        GameServerHost: string;
        GameServerPort: number;
        GameServerObfuscatedIP: number;
        GameClientHash: number;
        PlayerKey: string;
    };
    PostGameDetails: null;
    Players: {
        /** Player UUID */
        Subject: string;
        TeamID: ("Blue" | "Red") | string;
        /** Character ID */
        CharacterID: string;
        PlayerIdentity: {
            /** Player UUID */
            Subject: string;
            /** Card ID */
            PlayerCardID: string;
            /** Title ID */
            PlayerTitleID: string;
            AccountLevel: number;
            /** Preferred Level Border ID */
            PreferredLevelBorderID: string | "";
            Incognito: boolean;
            HideAccountLevel: boolean;
        };
        SeasonalBadgeInfo: {
            /** Season ID */
            SeasonID: string | "";
            NumberOfWins: number;
            WinsByTier: null;
            Rank: number;
            LeaderboardRank: number;
        };
        IsCoach: boolean;
        IsAssociated: boolean;
    }[];
    MatchmakingData: null;
}

export type PlayerNamesReponse = {
  DisplayName: string;
  Subject: string;
  GameName: string;
  TagLine: string;
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
