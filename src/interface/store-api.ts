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
			ItemOffers:
				| {
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
				  }[]
				| null;
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
			ItemOffers:
				| {
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
				  }[]
				| null;
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
	};
};

export type SkinResponse = {
	status: number;
	data: {
		uuid: string;
		displayName: string;
		displayIcon: string;
		fullTransparentIcon: string;
		wideArt: string;
		largeArt: string;
	};
};

export type WalletResponse = {
	Balances: {
		[x: string]: number;
	};
};

export type GameSettingsResponse = {
	type: "Ares.PlayerSettings";
	data: string;
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
			teamOne:
				| {
						/** Player UUID */
						Subject: string;
				  }[]
				| null;
			teamTwo:
				| {
						/** Player UUID */
						Subject: string;
				  }[]
				| null;
			teamSpectate:
				| {
						/** Player UUID */
						Subject: string;
				  }[]
				| null;
			teamOneCoaches:
				| {
						/** Player UUID */
						Subject: string;
				  }[]
				| null;
			teamTwoCoaches:
				| {
						/** Player UUID */
						Subject: string;
				  }[]
				| null;
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
		ErroredPlayers:
			| {
					/** Player UUID */
					Subject: string;
			  }[]
			| null;
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
