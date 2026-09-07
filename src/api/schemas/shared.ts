export type CurrentPreGamePlayerResponse = {
	Subject: string;
	MatchID: string;
	Version: number;
};

export type CurrentGamePlayerResponse = CurrentPreGamePlayerResponse;

export type PreGamePlayer = {
	Subject: string;
	CharacterID: string;
	CharacterSelectionState: "" | "selected" | "locked";
	PregamePlayerState: "joined";
	CompetitiveTier: number;
	PlayerIdentity: {
		Subject: string;
		PlayerCardID: string;
		PlayerTitleID: string;
		AccountLevel: number;
	};
	SeasonalBadgeInfo: {
		SeasonID: string | "";
		Rank: number;
	};
	IsCaptain: boolean;
};

export type CurrentPreGameMatchResponse = {
	ID: string;
	Version: number;
	Teams: {
		TeamID: ("Blue" | "Red") | string;
		Players: PreGamePlayer[];
	}[];
	AllyTeam: {
		TeamID: ("Blue" | "Red") | string;
		Players: PreGamePlayer[];
	} | null;
	EnemyTeam: {
		TeamID: ("Blue" | "Red") | string;
		Players: PreGamePlayer[];
	} | null;
	PregameState: "character_select_active" | "provisioned";
	LastUpdated: string;
	MapID: string;
	Team1: ("Blue" | "Red") | string;
	GamePodID: string;
	Mode: string;
	ProvisioningFlowID: "Matchmaking" | "CustomGame";
};

export type CurrentGameMatchResponse = {
	MatchID: string;
	Version: number;
	State: "IN_PROGRESS";
	MapID: string;
	ModeID: string;
	ProvisioningFlow: "Matchmaking" | "CustomGame";
	GamePodID: string;
	Players: {
		Subject: string;
		TeamID: ("Blue" | "Red") | string;
		CharacterID: string;
		PlayerIdentity: {
			Subject: string;
			PlayerCardID: string;
			PlayerTitleID: string;
			AccountLevel: number;
		};
		SeasonalBadgeInfo: {
			SeasonID: string | "";
			Rank: number;
		};
	}[];
};

export type PlayerNamesReponse = {
	DisplayName: string;
	Subject: string;
	GameName: string;
	TagLine: string;
};

export interface PlayerMatchHistoryResponse {
	Subject: string;
	Total: number;
	History: {
		MatchID: string;
		QueueID: string;
		gameStartTime: number;
	}[];
}

export type MatchDetailsResponse = {
	matchInfo: {
		matchId: string;
		mapId: string;
		gamePodId: string;
		gameStartMillis: number;
		queueID: string;
		partyRRPenalties?:
			| {
					[x: string]: number;
			  }
			| undefined;
	};
	players: {
		subject: string;
		gameName: string;
		tagLine: string;
		teamId: ("Blue" | "Red") | string;
		partyId: string;
		characterId: string;
		competitiveTier: number;
		stats: {
			kills: number;
			deaths: number;
			assists: number;
		} | null;
		accountLevel: number;
	}[];
	teams:
		| {
				teamId: ("Blue" | "Red") | string;
				won: boolean;
				roundsPlayed: number;
				roundsWon: number;
		  }[]
		| null;
	roundResults:
		| {
				playerStats: {
					subject: string;
					damage: {
						receiver: string;
						damage: number;
						legshots: number;
						bodyshots: number;
						headshots: number;
					}[];
				}[];
		  }[]
		| null;
};

export type CompetitiveUpdatesResponse = {
	Subject: string;
	Matches: {
		MatchID: string;
		MapID: string;
		SeasonID: string;
		MatchStartTime: number;
		TierAfterUpdate: number;
		TierBeforeUpdate: number;
		RankedRatingAfterUpdate: number;
		RankedRatingEarned: number;
	}[];
};

export type PlayerMMRResponse = {
	Subject: string;
	QueueSkills: {
		[x: string]: {
			SeasonalInfoBySeasonID: {
				[x: string]: {
					SeasonID: string;
					NumberOfGames: number;
					Rank: number;
					CompetitiveTier: number;
					RankedRating: number;
					WinsByTier: {
						[x: string]: number;
					} | null;
				};
			};
		};
	};
	LatestCompetitiveUpdate: {
		MatchID: string;
		MapID: string;
		SeasonID: string;
		MatchStartTime: number;
		TierAfterUpdate: number;
		TierBeforeUpdate: number;
		RankedRatingAfterUpdate: number;
		RankedRatingEarned: number;
	};
};

export type PartyResponse = {
	Members: {
		Subject: string;
		PlayerIdentity: {
			PlayerCardID: string;
		};
	}[];
};

export type Loadout = {
	Subject: string;
	Items: {
    [x: string]: {
      Sockets: {
        [x: string]: {
          ID: string;
        };
      };
    };
  }[];
};

export type PreGameLoadoutResponse = {
  Loadouts: Loadout[]
};

export type CoreGameLoadoutResponse = {
  Loadouts: {
    Loadout: Loadout
  }[]
};
