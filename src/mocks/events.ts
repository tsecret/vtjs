import { emit } from "@tauri-apps/api/event";
import { getWsMessage, type PresenceOverrides } from "./presence";

/**
 * Mock websocket driver. Emits the same `ws_message` events the Rust side
 * forwards from the Riot client, so match detection works without a client.
 *
 * Also exposed on `window.vtjsMock` for console use:
 *   vtjsMock.menus() / vtjsMock.pregame() / vtjsMock.ingame()
 *   vtjsMock.presence({ sessionLoopState: "INGAME", partyId: "test-party-id", partySize: 3 })
 */
export function emitPresence(overrides: PresenceOverrides = {}): Promise<void> {
	return emit("ws_message", getWsMessage(undefined, overrides));
}

export function startMockEvents(): void {
	(window as unknown as { vtjsMock?: unknown }).vtjsMock = {
		presence: emitPresence,
		menus: () => emitPresence({ sessionLoopState: "MENUS" }),
		pregame: () => emitPresence({ sessionLoopState: "PREGAME" }),
		ingame: () => emitPresence({ sessionLoopState: "INGAME" }),
	};

	// SocketListener ignores events until the boot puuid is set, so emit after init settles.
	setTimeout(() => {
		void emitPresence({ sessionLoopState: "MENUS" });
	}, 1000);
}
