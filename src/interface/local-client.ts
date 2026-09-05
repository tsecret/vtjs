import type { GameState } from "./common.interface";

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

export type PresenceResponse = {
	presences: {
		puuid: string;
		private: string | null;
	}[];
};

export type PresenceJSON = {
	partyPresenceData: {
		partyId: string;
		partySize: number;
	};
	matchPresenceData: {
		sessionLoopState: GameState;
	};
};
