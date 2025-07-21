
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

export type StorefrontResponse = {
    FeaturedBundle: {
        Bundle: {
            /** UUID */
            ID: string;
            /** UUID */
            DataAssetID: string;
            /** Currency ID */
            CurrencyID: string;
            Items: {
                Item: {
                    /** Item Type ID */
                    ItemTypeID: string;
                    /** Item ID */
                    ItemID: string;
                    Amount: number;
                };
                BasePrice: number;
                /** Currency ID */
                CurrencyID: string;
                DiscountPercent: number;
                DiscountedPrice: number;
                IsPromoItem: boolean;
            }[];
            ItemOffers: {
                /** UUID */
                BundleItemOfferID: string;
                Offer: {
                    OfferID: string;
                    IsDirectPurchase: boolean;
                    /** Date in ISO 8601 format */
                    StartDate: string;
                    Cost: {
                        [x: string]: number;
                    };
                    Rewards: {
                        /** Item Type ID */
                        ItemTypeID: string;
                        /** Item ID */
                        ItemID: string;
                        Quantity: number;
                    }[];
                };
                DiscountPercent: number;
                DiscountedCost: {
                    [x: string]: number;
                };
            }[] | null;
            TotalBaseCost: {
                [x: string]: number;
            } | null;
            TotalDiscountedCost: {
                [x: string]: number;
            } | null;
            TotalDiscountPercent: number;
            DurationRemainingInSeconds: number;
            WholesaleOnly: boolean;
        };
        Bundles: {
            /** UUID */
            ID: string;
            /** UUID */
            DataAssetID: string;
            /** Currency ID */
            CurrencyID: string;
            Items: {
                Item: {
                    /** Item Type ID */
                    ItemTypeID: string;
                    /** Item ID */
                    ItemID: string;
                    Amount: number;
                };
                BasePrice: number;
                /** Currency ID */
                CurrencyID: string;
                DiscountPercent: number;
                DiscountedPrice: number;
                IsPromoItem: boolean;
            }[];
            ItemOffers: {
                /** UUID */
                BundleItemOfferID: string;
                Offer: {
                    OfferID: string;
                    IsDirectPurchase: boolean;
                    /** Date in ISO 8601 format */
                    StartDate: string;
                    Cost: {
                        [x: string]: number;
                    };
                    Rewards: {
                        /** Item Type ID */
                        ItemTypeID: string;
                        /** Item ID */
                        ItemID: string;
                        Quantity: number;
                    }[];
                };
                DiscountPercent: number;
                DiscountedCost: {
                    [x: string]: number;
                };
            }[] | null;
            TotalBaseCost: {
                [x: string]: number;
            } | null;
            TotalDiscountedCost: {
                [x: string]: number;
            } | null;
            TotalDiscountPercent: number;
            DurationRemainingInSeconds: number;
            WholesaleOnly: boolean;
        }[];
        BundleRemainingDurationInSeconds: number;
    };
    SkinsPanelLayout: {
        SingleItemOffers: string[];
        SingleItemStoreOffers: {
            OfferID: string;
            IsDirectPurchase: boolean;
            /** Date in ISO 8601 format */
            StartDate: string;
            Cost: {
                [x: string]: number;
            };
            Rewards: {
                /** Item Type ID */
                ItemTypeID: string;
                /** Item ID */
                ItemID: string;
                Quantity: number;
            }[];
        }[];
        SingleItemOffersRemainingDurationInSeconds: number;
    };
    UpgradeCurrencyStore: {
        UpgradeCurrencyOffers: {
            /** UUID */
            OfferID: string;
            /** Item ID */
            StorefrontItemID: string;
            Offer: {
                OfferID: string;
                IsDirectPurchase: boolean;
                /** Date in ISO 8601 format */
                StartDate: string;
                Cost: {
                    [x: string]: number;
                };
                Rewards: {
                    /** Item Type ID */
                    ItemTypeID: string;
                    /** Item ID */
                    ItemID: string;
                    Quantity: number;
                }[];
            };
            DiscountedPercent: number;
        }[];
    };
    AccessoryStore: {
        AccessoryStoreOffers: {
            Offer: {
                OfferID: string;
                IsDirectPurchase: boolean;
                /** Date in ISO 8601 format */
                StartDate: string;
                Cost: {
                    [x: string]: number;
                };
                Rewards: {
                    /** Item Type ID */
                    ItemTypeID: string;
                    /** Item ID */
                    ItemID: string;
                    Quantity: number;
                }[];
            };
            /** UUID */
            ContractID: string;
        }[];
        AccessoryStoreRemainingDurationInSeconds: number;
        /** UUID */
        StorefrontID: string;
    };
    /** Night market */
    BonusStore?: {
        BonusStoreOffers: {
            /** UUID */
            BonusOfferID: string;
            Offer: {
                OfferID: string;
                IsDirectPurchase: boolean;
                /** Date in ISO 8601 format */
                StartDate: string;
                Cost: {
                    [x: string]: number;
                };
                Rewards: {
                    /** Item Type ID */
                    ItemTypeID: string;
                    /** Item ID */
                    ItemID: string;
                    Quantity: number;
                }[];
            };
            DiscountPercent: number;
            DiscountCosts: {
                [x: string]: number;
            };
            IsSeen: boolean;
        }[];
        BonusStoreRemainingDurationInSeconds: number;
    } | undefined;
};

export type SkinResponse = {
  status: number
  data: {
    uuid: string
    displayName: string
    displayIcon: string
  }
}

export type WalletResponse = {
    Balances: {
        [x: string]: number;
    };
};
