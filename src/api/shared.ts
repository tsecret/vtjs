import type {
	CompetitiveUpdatesResponse,
	CurrentGameMatchResponse,
	CurrentGamePlayerResponse,
	CurrentPreGameMatchResponse,
	CurrentPreGamePlayerResponse,
	MatchDetailsResponse,
	PartyResponse,
	PenaltiesResponse,
	PlayerMatchHistoryResponse,
	PlayerMMRResponse,
	PlayerNamesReponse,
} from "./schemas/shared";
import type { GameSettingsResponse } from "./schemas/riot";
import { BaseAPI } from "./base";
import { API_CONFIG, URLS } from "../utils/constants";

export class SharedAPI extends BaseAPI {
	async getCurrentPreGamePlayer(puuid: string): Promise<CurrentPreGamePlayerResponse | null> {
		return this.fetch(`https://glz-${this.REGION}-1.${this.SHARD}.a.pvp.net`, `/pregame/v1/players/${puuid}`, {
			noCache: true,
		});
	}

	async getCurrentGamePlayer(puuid: string): Promise<CurrentGamePlayerResponse | null> {
		return this.fetch(`https://glz-${this.REGION}-1.${this.SHARD}.a.pvp.net`, `/core-game/v1/players/${puuid}`, {
			noCache: true,
		});
	}

	async getCurrentPreGameMatch(matchId: string): Promise<CurrentPreGameMatchResponse> {
		return this.fetch(`https://glz-${this.REGION}-1.${this.SHARD}.a.pvp.net`, `/pregame/v1/matches/${matchId}`, {
			noCache: true,
		});
	}

	async getCurrentGameMatch(matchId: string): Promise<CurrentGameMatchResponse> {
		return this.fetch(`https://glz-${this.REGION}-1.${this.SHARD}.a.pvp.net`, `/core-game/v1/matches/${matchId}`, {
			noCache: true,
		});
	}

	async getPlayerNames(puuids: string[]): Promise<PlayerNamesReponse[]> {
		return this.fetch(`https://pd.${this.SHARD}.a.pvp.net`, "/name-service/v2/players", {
			body: JSON.stringify(puuids),
			method: "PUT",
			noCache: true,
		});
	}

	async getPlayerMatchHistory(puuid: string): Promise<PlayerMatchHistoryResponse> {
		const startIndex = 0;
		const endIndex = API_CONFIG.MATCH_HISTORY_COUNT;
		const queue = "competitive";
		return this.fetch(
			`https://pd.${this.SHARD}.a.pvp.net`,
			`/match-history/v1/history/${puuid}?startIndex=${startIndex}&endIndex=${endIndex}&queue=${queue}`,
			{ ttl: API_CONFIG.MATCH_HISTORY_TTL_MS },
		);
	}

	async getMatchDetails(matchId: string): Promise<MatchDetailsResponse> {
		return this.fetch(`https://pd.${this.SHARD}.a.pvp.net`, `/match-details/v1/matches/${matchId}`, {
			ttl: API_CONFIG.MATCH_DETAILS_TTL_MS,
		});
	}

	async getCompetitiveUpdates(puuid: string): Promise<CompetitiveUpdatesResponse> {
		const startIndex = 0;
		const endIndex = API_CONFIG.COMPETITIVE_UPDATES_COUNT;
		const queue = "competitive";
		return this.fetch(
			`https://pd.${this.SHARD}.a.pvp.net`,
			`/mmr/v1/players/${puuid}/competitiveupdates?startIndex=${startIndex}&endIndex=${endIndex}&queue=${queue}`,
		);
	}

	async getPlayerMMR(puuid: string): Promise<PlayerMMRResponse> {
		return this.fetch(`https://pd.${this.SHARD}.a.pvp.net`, `/mmr/v1/players/${puuid}`);
	}

	async getGameSettings(): Promise<GameSettingsResponse> {
		return this.fetch(
			URLS.PLAYER_PREFERENCES_BASE_URL,
			"/playerPref/v3/getPreference/Ares.PlayerSettings",
			{ noCache: true },
		);
	}

	async setGameSettings(data: GameSettingsResponse): Promise<GameSettingsResponse> {
		return this.fetch(URLS.PLAYER_PREFERENCES_BASE_URL, "/playerPref/v3/savePreference", {
			noCache: true,
			body: JSON.stringify(data),
			method: "PUT",
		});
	}

	async getPenalties(): Promise<PenaltiesResponse> {
		return this.fetch(`https://pd.${this.SHARD}.a.pvp.net`, "/restrictions/v3/penalties", { noCache: true });
	}

	async getParty(partyId: string): Promise<PartyResponse> {
		return this.fetch(`https://glz-${this.REGION}-1.${this.SHARD}.a.pvp.net`, `/parties/v1/parties/${partyId}`, {
			noCache: true,
		});
	}
}
