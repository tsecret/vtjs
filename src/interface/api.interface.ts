import { GameState, ProvisioningFlow, QueueId } from "./common.interface"

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

export type FriendsResponse = {
    friends: {
        activePlatform: string | null;
        displayGroup: string;
        game_name: string;
        game_tag: string;
        group: string;
        /** Milliseconds since epoch */
        last_online_ts: number | null;
        name: string;
        note: string;
        pid: string;
        /** Player UUID */
        puuid: string;
        region: string;
    }[];
};

export type PresenceResponse = {
    presences: {
        actor?: unknown | null;
        basic: string;
        details?: unknown | null;
        game_name: string;
        game_tag: string;
        location?: unknown | null;
        msg?: unknown | null;
        name: string;
        patchline?: unknown | null;
        pid: string;
        platform?: unknown | null;
        private: string | null;
        privateJwt?: string | null;
        presence: PresenceJSON | null
        product: "valorant" | "league_of_legends";
        /** Player UUID */
        puuid: string;
        region: string;
        resource: string;
        state: "mobile" | "dnd" | "away" | "chat";
        summary: string;
        /** Milliseconds since epoch */
        time: number;
    }[];
};

export type PresenceJSON = {
  isValid: boolean
  isIdle: boolean
  queueId: QueueId
  provisioningFlow: ProvisioningFlow
  partyId: string
  partySize: number
  maxPartySize: number
  partyOwnerMatchScoreAllyTeam: number
  partyOwnerMatchScoreEnemyTeam: number
  matchPresenceData: {
    sessionLoopState: GameState
    matchMap: string | "" // "/Game/Maps/Juliett/Juliett"
    provisioningFlow: ProvisioningFlow
    queueId: QueueId
  }
  partyPresenceData: {
    partyId: string
    isPartyOwner: boolean
    partyState: 'DEFAULT' | 'MATCHMAKING'
    partyAccessibility: 'CLOSED'
    partyLFM: boolean
    partyClientVersion: string
    partyVersion: number
    partySize: number
    queueEntryTime: string
    customGameName: string
    customGameTeam: string
    maxPartySize: number
    partyOwnerMatchMap: string // "/Game/Maps/Juliett/Juliett"
    partyOwnerMatchCurrentTeam: string
    partyOwnerProvisioningFlow: ProvisioningFlow
    partyOwnerSessionLoopState: GameState
  }
  playerPresenceData: {
    playerCardId: string
    playerTitleId: string
    preferredLevelBorderId: string
    accountLevel: number
    competitiveTier: number
  }
}

export type CurrentPreGamePlayerResponse = {
  Subject: string;
  MatchID: string;
  Version: number;
}

export type CurrentGamePlayerResponse = CurrentPreGamePlayerResponse

export type CurrentPreGameMatchResponse = {
    /** Pre-Game Match ID */
    ID: string;
    Version: number;
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
    ObserverSubjects: unknown[];
    MatchCoaches: unknown[];
    EnemyTeamSize: number;
    EnemyTeamLockCount: number;
    PregameState: "character_select_active" | "provisioned";
    /** Date in ISO 8601 format */
    LastUpdated: string;
    /** Map ID */
    MapID: string;
    MapSelectPool: unknown[];
    BannedMapIDs: unknown[];
    CastedVotes?: unknown;
    MapSelectSteps: unknown[];
    MapSelectStep: number;
    Team1: ("Blue" | "Red") | string;
    GamePodID: string;
    /** Game Mode */
    Mode: string;
    VoiceSessionID: string;
    MUCName: string;
    /** JWT containing match ID and player IDs */
    TeamMatchToken: string;
    /** Queue ID */
    QueueID: string | "";
    ProvisioningFlowID: "Matchmaking" | "CustomGame";
    IsRanked: boolean;
    PhaseTimeRemainingNS: number;
    StepTimeRemainingNS: number;
    altModesFlagADA: boolean;
    TournamentMetadata: null;
    RosterMetadata: null;
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

export type MatchDetailsResponse = {
    matchInfo: {
        /** Match ID */
        matchId: string;
        /** Map ID */
        mapId: string;
        gamePodId: string;
        gameLoopZone: string;
        gameServerAddress: string;
        gameVersion: string;
        gameLengthMillis: number | null;
        gameStartMillis: number;
        provisioningFlowID: "Matchmaking" | "CustomGame";
        isCompleted: boolean;
        customGameName: string;
        forcePostProcessing: boolean;
        queueID: string;
        gameMode: string;
        isRanked: boolean;
        isMatchSampled: boolean;
        seasonId: string;
        completionState: "Surrendered" | "Completed" | "VoteDraw" | "";
        platformType: "PC";
        premierMatchInfo: {};
        partyRRPenalties?: {
            [x: string]: number;
        } | undefined;
        shouldMatchDisablePenalties: boolean;
    };
    players: {
        /** Player UUID */
        subject: string;
        gameName: string;
        tagLine: string;
        platformInfo: {
            platformType: "PC";
            platformOS: "Windows";
            platformOSVersion: string;
            platformChipset: "Unknown";
        };
        teamId: ("Blue" | "Red") | string;
        /** Party ID */
        partyId: string;
        /** Character ID */
        characterId: string;
        stats: {
            score: number;
            roundsPlayed: number;
            kills: number;
            deaths: number;
            assists: number;
            playtimeMillis: number;
            abilityCasts?: ({
                grenadeCasts: number;
                ability1Casts: number;
                ability2Casts: number;
                ultimateCasts: number;
            } | null) | undefined;
        } | null;
        roundDamage: {
            round: number;
            /** Player UUID */
            receiver: string;
            damage: number;
        }[] | null;
        competitiveTier: number;
        isObserver: boolean;
        /** Card ID */
        playerCard: string;
        /** Title ID */
        playerTitle: string;
        /** Preferred Level Border ID */
        preferredLevelBorder?: (string | "") | undefined;
        accountLevel: number;
        sessionPlaytimeMinutes?: (number | null) | undefined;
        xpModifications?: {
            /** XP multiplier */
            Value: number;
            /** XP Modification ID */
            ID: string;
        }[] | undefined;
        behaviorFactors?: {
            afkRounds: number;
            /** Float value of unknown significance. Possibly used to quantify how much the player was in the way of their teammates? */
            collisions?: number | undefined;
            commsRatingRecovery: number;
            damageParticipationOutgoing: number;
            friendlyFireIncoming?: number | undefined;
            friendlyFireOutgoing?: number | undefined;
            mouseMovement?: number | undefined;
            stayedInSpawnRounds?: number | undefined;
        } | undefined;
        newPlayerExperienceDetails?: {
            basicMovement: {
                idleTimeMillis: 0;
                objectiveCompleteTimeMillis: 0;
            };
            basicGunSkill: {
                idleTimeMillis: 0;
                objectiveCompleteTimeMillis: 0;
            };
            adaptiveBots: {
                adaptiveBotAverageDurationMillisAllAttempts: 0;
                adaptiveBotAverageDurationMillisFirstAttempt: 0;
                killDetailsFirstAttempt: null;
                idleTimeMillis: 0;
                objectiveCompleteTimeMillis: 0;
            };
            ability: {
                idleTimeMillis: 0;
                objectiveCompleteTimeMillis: 0;
            };
            bombPlant: {
                idleTimeMillis: 0;
                objectiveCompleteTimeMillis: 0;
            };
            defendBombSite: {
                success: false;
                idleTimeMillis: 0;
                objectiveCompleteTimeMillis: 0;
            };
            settingStatus: {
                isMouseSensitivityDefault: boolean;
                isCrosshairDefault: boolean;
            };
            versionString: "";
        } | undefined;
    }[];
    bots: unknown[];
    coaches: {
        /** Player UUID */
        subject: string;
        teamId: "Blue" | "Red";
    }[];
    teams: {
        teamId: ("Blue" | "Red") | string;
        won: boolean;
        roundsPlayed: number;
        roundsWon: number;
        numPoints: number;
    }[] | null;
    roundResults: {
        roundNum: number;
        roundResult: "Eliminated" | "Bomb detonated" | "Bomb defused" | "Surrendered" | "Round timer expired";
        roundCeremony: "CeremonyDefault" | "CeremonyTeamAce" | "CeremonyFlawless" | "CeremonyCloser" | "CeremonyClutch" | "CeremonyThrifty" | "CeremonyAce" | "";
        winningTeam: ("Blue" | "Red") | string;
        /** Player UUID */
        bombPlanter?: string | undefined;
        bombDefuser?: (("Blue" | "Red") | string) | undefined;
        /** Time in milliseconds since the start of the round when the bomb was planted. 0 if not planted */
        plantRoundTime?: number | undefined;
        plantPlayerLocations: {
            /** Player UUID */
            subject: string;
            viewRadians: number;
            location: {
                x: number;
                y: number;
            };
        }[] | null;
        plantLocation: {
            x: number;
            y: number;
        };
        plantSite: "A" | "B" | "C" | "";
        /** Time in milliseconds since the start of the round when the bomb was defused. 0 if not defused */
        defuseRoundTime?: number | undefined;
        defusePlayerLocations: {
            /** Player UUID */
            subject: string;
            viewRadians: number;
            location: {
                x: number;
                y: number;
            };
        }[] | null;
        defuseLocation: {
            x: number;
            y: number;
        };
        playerStats: {
            /** Player UUID */
            subject: string;
            kills: {
                /** Time in milliseconds since the start of the game */
                gameTime: number;
                /** Time in milliseconds since the start of the round */
                roundTime: number;
                /** Player UUID */
                killer: string;
                /** Player UUID */
                victim: string;
                victimLocation: {
                    x: number;
                    y: number;
                };
                assistants: string[];
                playerLocations: {
                    /** Player UUID */
                    subject: string;
                    viewRadians: number;
                    location: {
                        x: number;
                        y: number;
                    };
                }[];
                finishingDamage: {
                    damageType: "Weapon" | "Bomb" | "Ability" | "Fall" | "Melee" | "Invalid" | "";
                    /** Item ID of the weapon used to kill the player. Empty string if the player was killed by the spike, fall damage, or melee. */
                    damageItem: (string | ("Ultimate" | "Ability1" | "Ability2" | "GrenadeAbility" | "Primary")) | "";
                    isSecondaryFireMode: boolean;
                };
            }[];
            damage: {
                /** Player UUID */
                receiver: string;
                damage: number;
                legshots: number;
                bodyshots: number;
                headshots: number;
            }[];
            score: number;
            economy: {
                loadoutValue: number;
                /** Item ID */
                weapon: string | "";
                /** Armor ID */
                armor: string | "";
                remaining: number;
                spent: number;
            };
            ability: {
                grenadeEffects: null;
                ability1Effects: null;
                ability2Effects: null;
                ultimateEffects: null;
            };
            wasAfk: boolean;
            wasPenalized: boolean;
            stayedInSpawn: boolean;
        }[];
        /** Empty string if the timer expired */
        roundResultCode: "Elimination" | "Detonate" | "Defuse" | "Surrendered" | "";
        playerEconomies: {
            /** Player UUID */
            subject: string;
            loadoutValue: number;
            /** Item ID */
            weapon: string | "";
            /** Armor ID */
            armor: string | "";
            remaining: number;
            spent: number;
        }[] | null;
        playerScores: {
            /** Player UUID */
            subject: string;
            score: number;
        }[] | null;
    }[] | null;
    kills: {
        /** Time in milliseconds since the start of the game */
        gameTime: number;
        /** Time in milliseconds since the start of the round */
        roundTime: number;
        /** Player UUID */
        killer: string;
        /** Player UUID */
        victim: string;
        victimLocation: {
            x: number;
            y: number;
        };
        assistants: string[];
        playerLocations: {
            /** Player UUID */
            subject: string;
            viewRadians: number;
            location: {
                x: number;
                y: number;
            };
        }[];
        finishingDamage: {
            damageType: "Weapon" | "Bomb" | "Ability" | "Fall" | "Melee" | "Invalid" | "";
            /** Item ID of the weapon used to kill the player. Empty string if the player was killed by the spike, fall damage, or melee. */
            damageItem: (string | ("Ultimate" | "Ability1" | "Ability2" | "GrenadeAbility" | "Primary")) | "";
            isSecondaryFireMode: boolean;
        };
        round: number;
    }[] | null;
};

export type CompetitiveUpdatesResponse = {
    Version: number;
    /** Player UUID */
    Subject: string;
    Matches: {
        /** Match ID */
        MatchID: string;
        /** Map ID */
        MapID: string;
        /** Season ID */
        SeasonID: string;
        /** Milliseconds since epoch */
        MatchStartTime: number;
        TierAfterUpdate: number;
        TierBeforeUpdate: number;
        RankedRatingAfterUpdate: number;
        RankedRatingBeforeUpdate: number;
        RankedRatingEarned: number;
        RankedRatingPerformanceBonus: number;
        CompetitiveMovement: "MOVEMENT_UNKNOWN";
        AFKPenalty: number;
    }[];
};

export type PlayerMMRResponse = {
    Version: number;
    /** Player UUID */
    Subject: string;
    NewPlayerExperienceFinished: boolean;
    QueueSkills: {
        [x: string]: {
            TotalGamesNeededForRating: number;
            TotalGamesNeededForLeaderboard: number;
            CurrentSeasonGamesNeededForRating: number;
            SeasonalInfoBySeasonID: {
                [x: string]: {
                    /** Season ID */
                    SeasonID: string;
                    NumberOfWins: number;
                    NumberOfWinsWithPlacements: number;
                    NumberOfGames: number;
                    Rank: number;
                    CapstoneWins: number;
                    LeaderboardRank: number;
                    CompetitiveTier: number;
                    RankedRating: number;
                    WinsByTier: {
                        [x: string]: number;
                    } | null;
                    GamesNeededForRating: number;
                    TotalWinsNeededForRank: number;
                };
            };
        };
    };
    LatestCompetitiveUpdate: {
        /** Match ID */
        MatchID: string;
        /** Map ID */
        MapID: string;
        /** Season ID */
        SeasonID: string;
        MatchStartTime: number;
        TierAfterUpdate: number;
        TierBeforeUpdate: number;
        RankedRatingAfterUpdate: number;
        RankedRatingBeforeUpdate: number;
        RankedRatingEarned: number;
        RankedRatingPerformanceBonus: number;
        CompetitiveMovement: "MOVEMENT_UNKNOWN";
        AFKPenalty: number;
    };
    IsLeaderboardAnonymized: boolean;
    IsActRankBadgeHidden: boolean;
};

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
    BonusStore: {
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
    }
};

export type SkinResponse = {
  status: number
  data: {
    uuid: string
    displayName: string
    displayIcon: string
    fullTransparentIcon: string
    wideArt: string
    largeArt: string
  }
}

export type WalletResponse = {
    Balances: {
        [x: string]: number;
    };
};

export type GameSettingsResponse = {
  type: 'Ares.PlayerSettings'
  data: string
}

export type PenaltiesResponse = {
    Subject: string;
    Penalties: {
      Expiry: string
      ID: string
      InfractionID: string
      IssuingMatchID: string
      IsAutomatedDetection: boolean
      RiotRestrictionEffect: {
        RestrictionType: 'TEXT_CHAT_MUTED' | 'VOICE_CHAT_MUTED' | 'PBE_LOGIN_TIME_BAN'
        RestrictionReason: 'INAPPROPRIATE_VOICE' | 'INAPPROPRIATE_TEXT'
      }
    }[];
    Version: number;
    Infractions: {
      ID: string
      Name: string
      RatingName: string
    }[]
};

export type PartyResponse = {
    /** Party ID */
    ID: string;
    MUCName: string;
    VoiceRoomID: string;
    Version: number;
    ClientVersion: string;
    Members: {
        /** Player UUID */
        Subject: string;
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
        SeasonalBadgeInfo: null;
        IsOwner?: boolean | undefined;
        QueueEligibleRemainingAccountLevels: number;
        Pings: {
            Ping: number;
            GamePodID: string;
        }[];
        IsReady: boolean;
        IsModerator: boolean;
        UseBroadcastHUD: boolean;
        PlatformType: "PC";
    }[];
    State: string;
    PreviousState: string;
    StateTransitionReason: string;
    Accessibility: "OPEN" | "CLOSED";
    CustomGameData: {
        Settings: {
            /** Map ID */
            Map: string;
            /** Game Mode */
            Mode: string;
            UseBots: boolean;
            GamePod: string;
            GameRules: {
                AllowGameModifiers?: string | undefined;
                IsOvertimeWinByTwo?: string | undefined;
                PlayOutAllRounds?: string | undefined;
                SkipMatchHistory?: string | undefined;
                TournamentMode?: string | undefined;
            } | null;
        };
        Membership: {
            teamOne: {
                /** Player UUID */
                Subject: string;
            }[] | null;
            teamTwo: {
                /** Player UUID */
                Subject: string;
            }[] | null;
            teamSpectate: {
                /** Player UUID */
                Subject: string;
            }[] | null;
            teamOneCoaches: {
                /** Player UUID */
                Subject: string;
            }[] | null;
            teamTwoCoaches: {
                /** Player UUID */
                Subject: string;
            }[] | null;
        };
        MaxPartySize: number;
        AutobalanceEnabled: boolean;
        AutobalanceMinPlayers: number;
        HasRecoveryData: boolean;
    };
    MatchmakingData: {
        /** Queue ID */
        QueueID: string;
        PreferredGamePods: string[];
        SkillDisparityRRPenalty: number;
    };
    Invites: null;
    Requests: unknown[];
    /** Date in ISO 8601 format */
    QueueEntryTime: string;
    ErrorNotification: {
        ErrorType: string;
        ErroredPlayers: {
            /** Player UUID */
            Subject: string;
        }[] | null;
    };
    RestrictedSeconds: number;
    EligibleQueues: string[];
    QueueIneligibilities: string[];
    CheatData: {
        GamePodOverride: string;
        ForcePostGameProcessing: boolean;
    };
    XPBonuses: unknown[];
    /** Empty string when there is no invite code */
    InviteCode: string;
};
