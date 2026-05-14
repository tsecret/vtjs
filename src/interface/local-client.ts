import { GameState, ProvisioningFlow, QueueId } from "./common.interface";

export interface PlayerAccount {
	game_name: string;
	tag_line: string;
}

export interface EntitlementsTokenResponse {
	accessToken: string;
	token: string;
	subject: string;
}

export interface HelpResponse {
	events: { [key: string]: string };
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
		presence: PresenceJSON | null;
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
	isValid: boolean;
	isIdle: boolean;
	queueId: QueueId;
	provisioningFlow: ProvisioningFlow;
	partyId: string;
	partySize: number;
	maxPartySize: number;
	partyOwnerMatchScoreAllyTeam: number;
	partyOwnerMatchScoreEnemyTeam: number;
	matchPresenceData: {
		sessionLoopState: GameState;
		matchMap: string | ""; // "/Game/Maps/Juliett/Juliett"
		provisioningFlow: ProvisioningFlow;
		queueId: QueueId;
	};
	partyPresenceData: {
		partyId: string;
		isPartyOwner: boolean;
		partyState: "DEFAULT" | "MATCHMAKING";
		partyAccessibility: "CLOSED";
		partyLFM: boolean;
		partyClientVersion: string;
		partyVersion: number;
		partySize: number;
		queueEntryTime: string;
		customGameName: string;
		customGameTeam: string;
		maxPartySize: number;
		partyOwnerMatchMap: string; // "/Game/Maps/Juliett/Juliett"
		partyOwnerMatchCurrentTeam: string;
		partyOwnerProvisioningFlow: ProvisioningFlow;
		partyOwnerSessionLoopState: GameState;
	};
	playerPresenceData: {
		playerCardId: string;
		playerTitleId: string;
		preferredLevelBorderId: string;
		accountLevel: number;
		competitiveTier: number;
	};
};
