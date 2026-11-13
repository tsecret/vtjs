import type { GameSettingsResponse } from "../api/schemas/riot";
import type {
	CompetitiveUpdatesResponse,
	CoreGameLoadoutResponse,
	CurrentGameMatchResponse,
	CurrentGamePlayerResponse,
	CurrentPreGameMatchResponse,
	CurrentPreGamePlayerResponse,
	MatchDetailsResponse,
	PartyResponse,
	PlayerMatchHistoryResponse,
	PlayerMMRResponse,
	PlayerNamesReponse,
	PreGameLoadoutResponse,
} from "../api/schemas/shared";
import type { EntitlementsTokenResponse, PlayerAccount } from "../interface";
import entToken from "./fixtures/local/ent-token.json";
import playerAccount from "./fixtures/local/player-alias.json";
import competitiveUpdates from "./fixtures/shared/competitive-updates.json";
import currentGameMatch from "./fixtures/shared/current-game-match.json";
import currentGamePlayer from "./fixtures/shared/current-game-player.json";
import currentPreGameMatch from "./fixtures/shared/current-pregame-match.json";
import currentPreGamePlayer from "./fixtures/shared/current-pregame-player.json";
import matchDetails from "./fixtures/shared/match-details.json";
import matchHistory from "./fixtures/shared/match-history.json";
import party from "./fixtures/shared/parties.json";
import playerMMR from "./fixtures/shared/player-mmr.json";
import playerNames from "./fixtures/shared/player-names.json";
import playerSettings from "./fixtures/shared/player-settings.json";
import { getPresencesResponse } from "./presence";

export interface MockHttpInit {
	body?: string | null;
	method?: string;
}

export interface MockHttpResponse {
	status: number;
	headers: Headers;
	json: () => Promise<unknown>;
}

export interface MockOptions {
	/** Throw instead of returning 404 for endpoints without a fixture. Tests use this. */
	strict?: boolean;
}

const ok = (data: unknown): MockHttpResponse => ({
	status: 200,
	headers: new Headers(),
	json: async () => data,
});

const notFound = (): MockHttpResponse => ({
	status: 404,
	headers: new Headers(),
	json: async () => null,
});

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const playerSubjects = {
	pregame:
		(currentPreGameMatch as unknown as CurrentPreGameMatchResponse).AllyTeam?.Players.map((p) => p.Subject) ?? [],
	core: (currentGameMatch as unknown as CurrentGameMatchResponse).Players.map((p) => p.Subject),
};

/**
 * Fixture-backed HTTP layer shared by mock/dev mode (via the Vite alias in
 * vite.config.ts) and the test setup (tests/setup.ts).
 *
 * Every endpoint used by LocalAPI and SharedAPI has a handler here.
 * Coverage is enforced by tests/mocks.test.ts with `strict: true`.
 */
export function getMockResponse(input: string, init: MockHttpInit = {}, options: MockOptions = {}): MockHttpResponse {
	const url = new URL(input);
	const path = url.pathname;
	const method = (init.method ?? "GET").toUpperCase();

	// LocalAPI
	if (path === "/entitlements/v1/token") return ok(entToken satisfies EntitlementsTokenResponse);
	if (path === "/player-account/aliases/v1/active") return ok(playerAccount satisfies PlayerAccount);
	if (path === "/chat/v4/presences") return ok(getPresencesResponse());

	// SharedAPI — current match
	if (path.startsWith("/pregame/v1/players/"))
		return ok(currentPreGamePlayer as unknown as CurrentPreGamePlayerResponse);
	if (path.startsWith("/core-game/v1/players/")) return ok(currentGamePlayer as unknown as CurrentGamePlayerResponse);
	if (path.startsWith("/pregame/v1/matches/") && path.endsWith("/loadouts")) {
		const response: PreGameLoadoutResponse = {
			Loadouts: playerSubjects.pregame.map((Subject) => ({ Subject, Items: [] })),
		};
		return ok(response);
	}
	if (path.startsWith("/core-game/v1/matches/") && path.endsWith("/loadouts")) {
		const response: CoreGameLoadoutResponse = {
			Loadouts: playerSubjects.core.map((Subject) => ({ Loadout: { Subject, Items: [] } })),
		};
		return ok(response);
	}
	if (path.startsWith("/pregame/v1/matches/")) return ok(currentPreGameMatch as unknown as CurrentPreGameMatchResponse);
	if (path.startsWith("/core-game/v1/matches/")) return ok(currentGameMatch as unknown as CurrentGameMatchResponse);

	// SharedAPI — players
	if (path === "/name-service/v2/players") {
		const requested = parseJsonBody<string[]>(init.body);
		const names = playerNames as unknown as PlayerNamesReponse[];
		return ok(requested ? names.filter((name) => requested.includes(name.Subject)) : names);
	}
	if (path.startsWith("/match-history/v1/history/")) {
		const startIndex = Number(url.searchParams.get("startIndex") ?? 0);
		const endIndex = Number(url.searchParams.get("endIndex") ?? matchHistory.History.length);
		const response: PlayerMatchHistoryResponse = {
			...(matchHistory as unknown as PlayerMatchHistoryResponse),
			History: (matchHistory.History as PlayerMatchHistoryResponse["History"]).slice(startIndex, endIndex),
		};
		return ok(response);
	}
	if (path.startsWith("/match-details/v1/matches/")) {
		const matchId = decodeURIComponent(path.split("/").pop() ?? "");
		const response = clone(matchDetails) as unknown as MatchDetailsResponse;
		response.matchInfo.matchId = matchId;
		return ok(response);
	}
	if (path.startsWith("/mmr/v1/players/") && path.endsWith("/competitiveupdates")) {
		return ok(competitiveUpdates as unknown as CompetitiveUpdatesResponse);
	}
	if (path.startsWith("/mmr/v1/players/")) return ok(playerMMR as unknown as PlayerMMRResponse);

	// SharedAPI — settings
	if (path === "/playerPref/v3/getPreference/Ares.PlayerSettings") {
		return ok(playerSettings as GameSettingsResponse);
	}
	if (path === "/playerPref/v3/savePreference" && method === "PUT") {
		const body = parseJsonBody<GameSettingsResponse>(init.body);
		return ok(body ?? playerSettings);
	}

	// SharedAPI — parties
	if (path.startsWith("/parties/v1/parties/")) return ok(party as unknown as PartyResponse);

	if (options.strict) {
		throw new Error(
			`[mocks] No fixture for ${method} ${input}. Add a handler in src/mocks/router.ts and a fixture in src/mocks/fixtures/.`,
		);
	}
	return notFound();
}

function parseJsonBody<T>(body: string | null | undefined): T | null {
	if (!body) return null;
	try {
		return JSON.parse(body) as T;
	} catch {
		return null;
	}
}
