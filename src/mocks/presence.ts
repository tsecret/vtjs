import base64 from "base-64";
import type { GameState, PresenceJSON, PresenceResponse } from "../interface";
import template from "./fixtures/local/presence.json";

/** Puuid the app boots with in mock mode (see fixtures/local/ent-token.json). */
export const MOCK_PUUID = "test-player-1-puuid";

type DecodedPresence = PresenceJSON & {
	queueId: string;
	partyId: string;
	partySize: number;
	serviceLoopState?: string;
	[key: string]: unknown;
};

export type PresenceOverrides = {
	sessionLoopState?: GameState;
	partyId?: string;
	partySize?: number;
	queueId?: string;
};

/**
 * Builds a decoded Riot presence payload (the shape encoded into the
 * `private` field of the presence websocket/HTTP payloads).
 */
export function buildPresence(overrides: PresenceOverrides = {}): DecodedPresence {
	const presence = JSON.parse(JSON.stringify(template)) as DecodedPresence;
	const partyId = overrides.partyId ?? presence.partyPresenceData.partyId;
	const partySize = overrides.partySize ?? presence.partyPresenceData.partySize;

	presence.partyId = partyId;
	presence.partySize = partySize;
	presence.partyPresenceData.partyId = partyId;
	presence.partyPresenceData.partySize = partySize;

	if (overrides.sessionLoopState) {
		presence.matchPresenceData.sessionLoopState = overrides.sessionLoopState;
	}
	if (overrides.queueId) {
		presence.queueId = overrides.queueId;
		presence.matchPresenceData = {
			...presence.matchPresenceData,
			queueId: overrides.queueId,
		} as PresenceJSON["matchPresenceData"];
	}

	return presence;
}

/** HTTP response for GET /chat/v4/presences. */
export function getPresencesResponse(puuid: string = MOCK_PUUID): PresenceResponse {
	const privatePayload = base64.encode(JSON.stringify(buildPresence()));
	return { presences: [{ puuid, private: privatePayload }] };
}

/** Raw websocket frame the Rust client forwards as a `ws_message` event. */
export function getWsMessage(puuid: string = MOCK_PUUID, overrides: PresenceOverrides = {}): string {
	const presence = { puuid, private: base64.encode(JSON.stringify(buildPresence(overrides))) };
	return `///${JSON.stringify([null, null, { data: { presences: [presence] } }])}`;
}
