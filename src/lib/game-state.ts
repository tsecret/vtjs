import type { GameState } from "../interface";

export type GameStateListener = (state: { state: GameState; matchId: string | null }) => void;

export class GameStateModule {
	private state: { state: GameState; matchId: string | null } = {
		state: "MENUS",
		matchId: null,
	};
	private listeners: Set<GameStateListener> = new Set();

	getState(): { state: GameState; matchId: string | null } {
		return this.state;
	}

	setState(state: GameState, matchId?: string | null): void {
		const prevState = this.state.state;
		const prevMatchId = this.state.matchId;

		if (state === prevState && (!matchId || matchId === prevMatchId)) {
			return;
		}

		this.state = {
			state,
			matchId: matchId ?? prevMatchId,
		};

		for (const listener of this.listeners) {
			listener(this.state);
		}
	}

	subscribe(callback: GameStateListener): () => void {
		this.listeners.add(callback);
		return () => this.listeners.delete(callback);
	}

	unsubscribe(): void {
		this.listeners.clear();
	}

	/**
	 * Process a raw WebSocket presence message and update state if the state changed.
	 * Returns true if state was updated, false if it was unchanged.
	 */
	processPresenceMessage(presenceData: PresenceData): boolean {
		const newState = presenceData.sessionLoopState;
		const currentState = this.state.state;

		if (newState === currentState) {
			return false;
		}

		this.state = {
			state: newState,
			matchId: presenceData.matchId ?? this.state.matchId,
		};

		for (const listener of this.listeners) {
			listener(this.state);
		}

		return true;
	}
}

export interface PresenceData {
	sessionLoopState: GameState;
	matchId: string | null;
}

export const gameStateModule = new GameStateModule();
