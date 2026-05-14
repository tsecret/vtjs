import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GameState } from "../src/interface";
import { GameStateModule } from "../src/lib/game-state";

describe("GameStateModule", () => {
	let module: GameStateModule;

	beforeEach(() => {
		module = new GameStateModule();
	});

	describe("getState", () => {
		it("returns initial state", () => {
			const state = module.getState();
			expect(state.state).toBe("MENUS");
			expect(state.matchId).toBeNull();
		});
	});

	describe("setState", () => {
		it("updates state when it differs", () => {
			module.setState("PREGAME");
			const state = module.getState();
			expect(state.state).toBe("PREGAME");
		});

		it("does not update when state is identical", () => {
			module.setState("MENUS");
			const state = module.getState();
			expect(state.state).toBe("MENUS");
		});

		it("updates matchId when provided", () => {
			module.setState("PREGAME", "test-match-id");
			const state = module.getState();
			expect(state.matchId).toBe("test-match-id");
		});

		it("preserves matchId when not provided", () => {
			module.setState("PREGAME", "test-match-id");
			module.setState("INGAME");
			const state = module.getState();
			expect(state.matchId).toBe("test-match-id");
		});
	});

	describe("subscribe/unsubscribe", () => {
		it("notifies subscribers when state changes", () => {
			const callback = vi.fn();
			const _unsubscribe = module.subscribe(callback);

			module.setState("PREGAME", "test-match-id");

			expect(callback).toHaveBeenCalledTimes(1);
			expect(callback).toHaveBeenCalledWith({
				state: "PREGAME",
				matchId: "test-match-id",
			});
		});

		it("notifies multiple subscribers", () => {
			const callback1 = vi.fn();
			const callback2 = vi.fn();
			module.subscribe(callback1);
			module.subscribe(callback2);

			module.setState("INGAME");

			expect(callback1).toHaveBeenCalledTimes(1);
			expect(callback2).toHaveBeenCalledTimes(1);
		});

		it("does not notify after unsubscribe", () => {
			const callback = vi.fn();
			const unsubscribe = module.subscribe(callback);

			unsubscribe();
			module.setState("INGAME");

			expect(callback).not.toHaveBeenCalled();
		});
	});

	describe("unsubscribe", () => {
		it("clears all listeners", () => {
			const callback = vi.fn();
			module.subscribe(callback);
			module.unsubscribe();

			module.setState("INGAME");

			expect(callback).not.toHaveBeenCalled();
		});
	});

	describe("processPresenceMessage", () => {
		it("updates state when state differs", () => {
			const callback = vi.fn();
			module.subscribe(callback);

			const result = module.processPresenceMessage({
				sessionLoopState: "PREGAME",
				matchId: "presence-match-id",
			});

			expect(result).toBe(true);
			expect(callback).toHaveBeenCalledWith({
				state: "PREGAME",
				matchId: "presence-match-id",
			});
		});

		it("returns false when state is unchanged", () => {
			const callback = vi.fn();
			module.subscribe(callback);

			const result = module.processPresenceMessage({
				sessionLoopState: "MENUS",
				matchId: null,
			});

			expect(result).toBe(false);
			expect(callback).not.toHaveBeenCalled();
		});

		it("preserves matchId when none provided", () => {
			module.setState("PREGAME", "existing-match-id");

			const result = module.processPresenceMessage({
				sessionLoopState: "INGAME",
				matchId: null,
			});

			expect(result).toBe(true);
			expect(module.getState().matchId).toBe("existing-match-id");
		});
	});

	describe("transition sequences", () => {
		it("MENUS → PREGAME → INGAME → MENUS", () => {
			const transitions: GameState[] = [];
			module.subscribe((state) => transitions.push(state.state));

			// Start from PREGAME so MENUS is a transition
			module.setState("PREGAME");
			module.setState("INGAME");
			module.setState("MENUS");

			expect(transitions).toEqual(["PREGAME", "INGAME", "MENUS"]);
		});

		it("ignores duplicate states in sequence", () => {
			const transitions: GameState[] = [];
			module.subscribe((state) => transitions.push(state.state));

			// Start from PREGAME so MENUS→PREGAME is a real transition
			module.setState("PREGAME");
			module.setState("PREGAME"); // duplicate — ignored
			module.setState("INGAME");

			expect(transitions).toEqual(["PREGAME", "INGAME"]);
		});
	});
});
