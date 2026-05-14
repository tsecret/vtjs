import { z } from "zod";

// ── CurrentPreGamePlayerResponse ───────────────────────────────────────────────

export const CurrentPreGamePlayerResponseSchema = z.object({
	Subject: z.string(),
	MatchID: z.string(),
	Version: z.number(),
});

// ── CurrentGamePlayerResponse (same shape as CurrentPreGamePlayerResponse) ─────

export const CurrentGamePlayerResponseSchema = CurrentPreGamePlayerResponseSchema;

// ── PreGamePlayer ─────────────────────────────────────────────────────────────

const PlayerIdentity = z.object({
	Subject: z.string(),
	PlayerCardID: z.string(),
	PlayerTitleID: z.string(),
	AccountLevel: z.number(),
	PreferredLevelBorderID: z.string().or(z.literal("")),
	Incognito: z.boolean(),
	HideAccountLevel: z.boolean(),
});

const SeasonalBadgeInfo = z.object({
	SeasonID: z.string().or(z.literal("")),
	NumberOfWins: z.number(),
	WinsByTier: z.null(),
	Rank: z.number(),
	LeaderboardRank: z.number(),
});

export const PreGamePlayerSchema = z.object({
	Subject: z.string(),
	CharacterID: z.string(),
	CharacterSelectionState: z.enum(["", "selected", "locked"]),
	PregamePlayerState: z.literal("joined"),
	CompetitiveTier: z.number(),
	PlayerIdentity,
	SeasonalBadgeInfo,
	IsCaptain: z.boolean(),
});

// ── CurrentPreGameMatchResponse ───────────────────────────────────────────────

export const CurrentPreGameMatchResponseSchema = z.object({
	ID: z.string(),
	Version: z.number(),
	Teams: z.array(
		z.object({
			TeamID: z.string(),
			Players: PreGamePlayerSchema.array(),
		}),
	),
	AllyTeam: z
		.object({
			TeamID: z.string(),
			Players: PreGamePlayerSchema.array(),
		})
		.nullable(),
	EnemyTeam: z
		.object({
			TeamID: z.string(),
			Players: PreGamePlayerSchema.array(),
		})
		.nullable(),
	ObserverSubjects: z.array(z.unknown()),
	MatchCoaches: z.array(z.unknown()),
	EnemyTeamSize: z.number(),
	EnemyTeamLockCount: z.number(),
	PregameState: z.enum(["character_select_active", "provisioned"]),
	LastUpdated: z.string(),
	MapID: z.string(),
	MapSelectPool: z.array(z.unknown()),
	BannedMapIDs: z.array(z.unknown()),
	CastedVotes: z.unknown().optional(),
	MapSelectSteps: z.array(z.unknown()),
	MapSelectStep: z.number(),
	Team1: z.string(),
	GamePodID: z.string(),
	Mode: z.string(),
	VoiceSessionID: z.string(),
	MUCName: z.string(),
	TeamMatchToken: z.string(),
	QueueID: z.string().or(z.literal("")),
	ProvisioningFlowID: z.enum(["Matchmaking", "CustomGame"]),
	IsRanked: z.boolean(),
	PhaseTimeRemainingNS: z.number(),
	StepTimeRemainingNS: z.number(),
	altModesFlagADA: z.boolean(),
	TournamentMetadata: z.null(),
	RosterMetadata: z.null(),
});

// ── CurrentGameMatchResponse ──────────────────────────────────────────────────

const ConnectionDetails = z.object({
	GameServerHosts: z.array(z.string()),
	GameServerHost: z.string(),
	GameServerPort: z.number(),
	GameServerObfuscatedIP: z.number(),
	GameClientHash: z.number(),
	PlayerKey: z.string(),
});

export const CurrentGameMatchResponseSchema = z.object({
	MatchID: z.string(),
	Version: z.number(),
	State: z.literal("IN_PROGRESS"),
	MapID: z.string(),
	ModeID: z.string(),
	ProvisioningFlow: z.enum(["Matchmaking", "CustomGame"]),
	GamePodID: z.string(),
	AllMUCName: z.string(),
	TeamMUCName: z.string(),
	TeamVoiceID: z.string(),
	TeamMatchToken: z.string(),
	IsReconnectable: z.boolean(),
	ConnectionDetails,
	PostGameDetails: z.null(),
	Players: z.array(
		z.object({
			Subject: z.string(),
			TeamID: z.string(),
			CharacterID: z.string(),
			PlayerIdentity,
			SeasonalBadgeInfo,
			IsCoach: z.boolean(),
			IsAssociated: z.boolean(),
		}),
	),
	MatchmakingData: z.null(),
});

// ── PlayerNamesResponse ───────────────────────────────────────────────────────

export const PlayerNamesResponseSchema = z.object({
	DisplayName: z.string(),
	Subject: z.string(),
	GameName: z.string(),
	TagLine: z.string(),
});

// ── PlayerMatchHistoryResponse ─────────────────────────────────────────────────

const HistoryEntry = z.object({
	MatchID: z.string(),
	QueueID: z.string(),
	gameStartTime: z.number(),
});

export const PlayerMatchHistoryResponseSchema = z.object({
	Subject: z.string(),
	Total: z.number(),
	History: HistoryEntry.array(),
});

// ── PenaltiesResponse ─────────────────────────────────────────────────────────

const RiotRestrictionEffect = z.object({
	RestrictionType: z.enum(["TEXT_CHAT_MUTED", "VOICE_CHAT_MUTED", "PBE_LOGIN_TIME_BAN"]),
	RestrictionReason: z.enum(["INAPPROPRIATE_VOICE", "INAPPROPRIATE_TEXT"]),
});

const Penalty = z.object({
	Expiry: z.string(),
	ID: z.string(),
	InfractionID: z.string(),
	IssuingMatchID: z.string(),
	IsAutomatedDetection: z.boolean(),
	RiotRestrictionEffect,
});

const Infraction = z.object({
	ID: z.string(),
	Name: z.string(),
	RatingName: z.string(),
});

export const PenaltiesResponseSchema = z.object({
	Subject: z.string(),
	Penalties: Penalty.array(),
	Version: z.number(),
	Infractions: Infraction.array(),
});

// ── PartyResponse ─────────────────────────────────────────────────────────────

const PlayerPing = z.object({
	Ping: z.number(),
	GamePodID: z.string(),
});

const PartyMember = z.object({
	Subject: z.string(),
	CompetitiveTier: z.number(),
	PlayerIdentity,
	SeasonalBadgeInfo: z.null(),
	IsOwner: z.boolean().optional(),
	QueueEligibleRemainingAccountLevels: z.number(),
	Pings: PlayerPing.array(),
	IsReady: z.boolean(),
	IsModerator: z.boolean(),
	UseBroadcastHUD: z.boolean(),
	PlatformType: z.literal("PC"),
});

const CustomGameRules = z.object({
	AllowGameModifiers: z.string().optional(),
	IsOvertimeWinByTwo: z.string().optional(),
	PlayOutAllRounds: z.string().optional(),
	SkipMatchHistory: z.string().optional(),
	TournamentMode: z.string().optional(),
}).nullable();

const CustomGameData = z.object({
	Settings: z.object({
		Map: z.string(),
		Mode: z.string(),
		UseBots: z.boolean(),
		GamePod: z.string(),
		GameRules: CustomGameRules,
	}),
	Membership: z.object({
		teamOne: z.array(z.object({ Subject: z.string() })).nullable(),
		teamTwo: z.array(z.object({ Subject: z.string() })).nullable(),
		teamSpectate: z.array(z.object({ Subject: z.string() })).nullable(),
		teamOneCoaches: z.array(z.object({ Subject: z.string() })).nullable(),
		teamTwoCoaches: z.array(z.object({ Subject: z.string() })).nullable(),
	}),
	MaxPartySize: z.number(),
	AutobalanceEnabled: z.boolean(),
	AutobalanceMinPlayers: z.number(),
	HasRecoveryData: z.boolean(),
});

const ErrorNotification = z.object({
	ErrorType: z.string(),
	ErroredPlayers: z.array(z.object({ Subject: z.string() })).nullable(),
});

const MatchmakingData = z.object({
	QueueID: z.string(),
	PreferredGamePods: z.array(z.string()),
	SkillDisparityRRPenalty: z.number(),
});

export const PartyResponseSchema = z.object({
	ID: z.string(),
	MUCName: z.string(),
	VoiceRoomID: z.string(),
	Version: z.number(),
	ClientVersion: z.string(),
	Members: PartyMember.array(),
	State: z.string(),
	PreviousState: z.string(),
	StateTransitionReason: z.string(),
	Accessibility: z.enum(["OPEN", "CLOSED"]),
	CustomGameData,
	MatchmakingData,
	Invites: z.null(),
	Requests: z.array(z.unknown()),
	QueueEntryTime: z.string(),
	ErrorNotification,
	RestrictedSeconds: z.number(),
	EligibleQueues: z.array(z.string()),
	QueueIneligibilities: z.array(z.string()),
	CheatData: z.object({
		GamePodOverride: z.string(),
		ForcePostGameProcessing: z.boolean(),
	}),
	XPBonuses: z.array(z.unknown()),
	InviteCode: z.string(),
});

// ── CompetitiveUpdatesResponse ────────────────────────────────────────────────

const CompetitiveMatch = z.object({
	MatchID: z.string(),
	MapID: z.string(),
	SeasonID: z.string(),
	MatchStartTime: z.number(),
	TierAfterUpdate: z.number(),
	TierBeforeUpdate: z.number(),
	RankedRatingAfterUpdate: z.number(),
	RankedRatingBeforeUpdate: z.number(),
	RankedRatingEarned: z.number(),
	RankedRatingPerformanceBonus: z.number(),
	CompetitiveMovement: z.literal("MOVEMENT_UNKNOWN"),
	AFKPenalty: z.number(),
});

export const CompetitiveUpdatesResponseSchema = z.object({
	Version: z.number(),
	Subject: z.string(),
	Matches: CompetitiveMatch.array(),
});

// ── PlayerMMRResponse ─────────────────────────────────────────────────────────

const LatestCompetitiveUpdate = z.object({
	MatchID: z.string(),
	MapID: z.string(),
	SeasonID: z.string(),
	MatchStartTime: z.number(),
	TierAfterUpdate: z.number(),
	TierBeforeUpdate: z.number(),
	RankedRatingAfterUpdate: z.number(),
	RankedRatingBeforeUpdate: z.number(),
	RankedRatingEarned: z.number(),
	RankedRatingPerformanceBonus: z.number(),
	CompetitiveMovement: z.literal("MOVEMENT_UNKNOWN"),
	AFKPenalty: z.number(),
});

export const PlayerMMRResponseSchema = z.object({
	Version: z.number(),
	Subject: z.string(),
	NewPlayerExperienceFinished: z.boolean(),
	QueueSkills: z.record(
		z.string(),
		z.object({
			TotalGamesNeededForRating: z.number(),
			TotalGamesNeededForLeaderboard: z.number(),
			CurrentSeasonGamesNeededForRating: z.number(),
			SeasonalInfoBySeasonID: z.record(
				z.string(),
				z.object({
					SeasonID: z.string(),
					NumberOfWins: z.number(),
					NumberOfWinsWithPlacements: z.number(),
					NumberOfGames: z.number(),
					Rank: z.number(),
					CapstoneWins: z.number(),
					LeaderboardRank: z.number(),
					CompetitiveTier: z.number(),
					RankedRating: z.number(),
					WinsByTier: z.record(z.string(), z.number()).nullable(),
					GamesNeededForRating: z.number(),
					TotalWinsNeededForRank: z.number(),
				}),
			),
		}),
	),
	LatestCompetitiveUpdate,
	IsLeaderboardAnonymized: z.boolean(),
	IsActRankBadgeHidden: z.boolean(),
});

// ── MatchDetailsResponse ──────────────────────────────────────────────────────

const MatchInfo = z.object({
		matchId: z.string(),
		mapId: z.string(),
		gamePodId: z.string(),
		gameLoopZone: z.string(),
		gameServerAddress: z.string(),
		gameVersion: z.string(),
		gameLengthMillis: z.number().nullable(),
		gameStartMillis: z.number(),
		provisioningFlowID: z.enum(["Matchmaking", "CustomGame"]),
		isCompleted: z.boolean(),
		customGameName: z.string(),
		forcePostProcessing: z.boolean(),
		queueID: z.string(),
		gameMode: z.string(),
		isRanked: z.boolean(),
		isMatchSampled: z.boolean(),
		seasonId: z.string(),
		completionState: z.enum(["Surrendered", "Completed", "VoteDraw", ""]),
		platformType: z.literal("PC"),
		premierMatchInfo: z.object({}).passthrough(),
		partyRRPenalties: z.record(z.string(), z.number()).nullable().optional(),
		shouldMatchDisablePenalties: z.boolean(),
	});

const AbilityCasts = z.object({
	grenadeCasts: z.number(),
	ability1Casts: z.number(),
	ability2Casts: z.number(),
	ultimateCasts: z.number(),
});

const PlayerStats = z.object({
	score: z.number(),
	roundsPlayed: z.number(),
	kills: z.number(),
	deaths: z.number(),
	assists: z.number(),
	playtimeMillis: z.number(),
	abilityCasts: AbilityCasts.nullable().optional(),
});

const RoundDamage = z.object({
	round: z.number(),
	receiver: z.string(),
	damage: z.number(),
});

const BehaviorFactors = z.object({
	afkRounds: z.number(),
	commsRatingRecovery: z.number(),
	damageParticipationOutgoing: z.number(),
	collisions: z.number().optional(),
	friendlyFireIncoming: z.number().optional(),
	friendlyFireOutgoing: z.number().optional(),
	mouseMovement: z.number().optional(),
	stayedInSpawnRounds: z.number().optional(),
});

const XPMOD = z.object({
	Value: z.number(),
	ID: z.string(),
});

const BasicMovement = z.object({
	idleTimeMillis: z.literal(0),
	objectiveCompleteTimeMillis: z.literal(0),
});

const BasicGunSkill = z.object({
	idleTimeMillis: z.literal(0),
	objectiveCompleteTimeMillis: z.literal(0),
});

const AdaptiveBots = z.object({
	adaptiveBotAverageDurationMillisAllAttempts: z.literal(0),
	adaptiveBotAverageDurationMillisFirstAttempt: z.literal(0),
	killDetailsFirstAttempt: z.null(),
	idleTimeMillis: z.literal(0),
	objectiveCompleteTimeMillis: z.literal(0),
});

const Ability = z.object({
	idleTimeMillis: z.literal(0),
	objectiveCompleteTimeMillis: z.literal(0),
});

const BombPlant = z.object({
	idleTimeMillis: z.literal(0),
	objectiveCompleteTimeMillis: z.literal(0),
});

const DefendBombSite = z.object({
	success: z.literal(false),
	idleTimeMillis: z.literal(0),
	objectiveCompleteTimeMillis: z.literal(0),
});

const SettingStatus = z.object({
	isMouseSensitivityDefault: z.boolean(),
	isCrosshairDefault: z.boolean(),
});

const NewPlayerExperienceDetails = z.object({
	basicMovement: BasicMovement,
	basicGunSkill: BasicGunSkill,
	adaptiveBots: AdaptiveBots,
	ability: Ability,
	bombPlant: BombPlant,
	defendBombSite: DefendBombSite,
	settingStatus: SettingStatus,
	versionString: z.literal(""),
});

const Player = z.object({
	subject: z.string(),
	gameName: z.string(),
	tagLine: z.string(),
	platformInfo: z.object({
		platformType: z.literal("PC"),
		platformOS: z.literal("Windows"),
		platformOSVersion: z.string(),
		platformChipset: z.literal("Unknown"),
	}),
	teamId: z.string(),
	partyId: z.string(),
	characterId: z.string(),
	stats: PlayerStats.nullable(),
	roundDamage: RoundDamage.array().nullable(),
	competitiveTier: z.number(),
	isObserver: z.boolean(),
	playerCard: z.string(),
	playerTitle: z.string(),
	preferredLevelBorder: z.string().or(z.literal("")).optional(),
	accountLevel: z.number(),
	sessionPlaytimeMinutes: z.number().nullable().optional(),
	xpModifications: XPMOD.array().optional(),
	behaviorFactors: BehaviorFactors.optional(),
	newPlayerExperienceDetails: NewPlayerExperienceDetails.optional(),
});

const Coach = z.object({
	subject: z.string(),
	teamId: z.enum(["Blue", "Red"]),
});

const TeamInfo = z.object({
	teamId: z.string(),
	won: z.boolean(),
	roundsPlayed: z.number(),
	roundsWon: z.number(),
	numPoints: z.number(),
});

const PlayerLocation = z.object({
	subject: z.string(),
	viewRadians: z.number(),
	location: z.object({
		x: z.number(),
		y: z.number(),
	}),
});

const PlantLocation = z.object({
	x: z.number(),
	y: z.number(),
});

const FinishingDamage = z.object({
	damageType: z.enum(["Weapon", "Bomb", "Ability", "Fall", "Melee", "Invalid", ""]),
	damageItem: z.string().or(z.enum(["Ultimate", "Ability1", "Ability2", "GrenadeAbility", "Primary"])).or(z.literal("")),
	isSecondaryFireMode: z.boolean(),
});

const Kill = z.object({
	gameTime: z.number(),
	roundTime: z.number(),
	killer: z.string(),
	victim: z.string(),
	victimLocation: z.object({
		x: z.number(),
		y: z.number(),
	}),
	assistants: z.array(z.string()),
	playerLocations: z.array(PlayerLocation),
	finishingDamage: FinishingDamage,
	round: z.number(),
});

const Economy = z.object({
	loadoutValue: z.number(),
	weapon: z.string().or(z.literal("")),
	armor: z.string().or(z.literal("")),
	remaining: z.number(),
	spent: z.number(),
});

const AbilityEffects = z.object({
	grenadeEffects: z.null(),
	ability1Effects: z.null(),
	ability2Effects: z.null(),
	ultimateEffects: z.null(),
});

const RoundPlayerStats = z.object({
	subject: z.string(),
	kills: z.array(
		z.object({
			gameTime: z.number(),
			roundTime: z.number(),
			killer: z.string(),
			victim: z.string(),
			victimLocation: z.object({
				x: z.number(),
				y: z.number(),
			}),
			assistants: z.array(z.string()),
			playerLocations: z.array(PlayerLocation),
			finishingDamage: FinishingDamage,
		}),
	),
	damage: z.array(
		z.object({
			receiver: z.string(),
			damage: z.number(),
			legshots: z.number(),
			bodyshots: z.number(),
			headshots: z.number(),
		}),
	),
	score: z.number(),
	economy: Economy,
	ability: AbilityEffects,
	wasAfk: z.boolean(),
	wasPenalized: z.boolean(),
	stayedInSpawn: z.boolean(),
});

const RoundResult = z.object({
	roundNum: z.number(),
	roundResult: z.enum(["Eliminated", "Bomb detonated", "Bomb defused", "Surrendered", "Round timer expired"]),
	roundCeremony: z.enum(["CeremonyDefault", "CeremonyTeamAce", "CeremonyFlawless", "CeremonyCloser", "CeremonyClutch", "CeremonyThrifty", "CeremonyAce", ""]).or(z.literal("")),
	winningTeam: z.string(),
	bombPlanter: z.string().optional(),
	bombDefuser: z.string().optional(),
	plantRoundTime: z.number().optional(),
	plantPlayerLocations: z.array(PlayerLocation).nullable(),
	plantLocation: PlantLocation,
	plantSite: z.enum(["A", "B", "C", ""]),
	defuseRoundTime: z.number().optional(),
	defusePlayerLocations: z.array(PlayerLocation).nullable(),
	defuseLocation: PlantLocation,
	playerStats: z.array(RoundPlayerStats),
	roundResultCode: z.enum(["Elimination", "Detonate", "Defuse", "Surrendered", ""]).or(z.literal("")),
	playerEconomies: z.array(Economy).nullable(),
	playerScores: z.array(z.object({ subject: z.string(), score: z.number() })).nullable(),
});

export const MatchDetailsResponseSchema = z.object({
	matchInfo: MatchInfo,
	players: z.array(Player),
	bots: z.array(z.unknown()),
	coaches: z.array(Coach),
	teams: z.array(TeamInfo).nullable(),
	roundResults: z.array(RoundResult).nullable(),
	kills: z.array(Kill).nullable(),
});

// ── Derived types ─────────────────────────────────────────────────────────────

export type CurrentPreGamePlayerResponse = z.infer<typeof CurrentPreGamePlayerResponseSchema>;
export type CurrentGamePlayerResponse = z.infer<typeof CurrentGamePlayerResponseSchema>;
export type PreGamePlayer = z.infer<typeof PreGamePlayerSchema>;
export type CurrentPreGameMatchResponse = z.infer<typeof CurrentPreGameMatchResponseSchema>;
export type CurrentGameMatchResponse = z.infer<typeof CurrentGameMatchResponseSchema>;
export type PlayerNamesReponse = z.infer<typeof PlayerNamesResponseSchema>;
export type PlayerMatchHistoryResponse = z.infer<typeof PlayerMatchHistoryResponseSchema>;
export type PenaltiesResponse = z.infer<typeof PenaltiesResponseSchema>;
export type PartyResponse = z.infer<typeof PartyResponseSchema>;
export type CompetitiveUpdatesResponse = z.infer<typeof CompetitiveUpdatesResponseSchema>;
export type PlayerMMRResponse = z.infer<typeof PlayerMMRResponseSchema>;
export type MatchDetailsResponse = z.infer<typeof MatchDetailsResponseSchema>;
