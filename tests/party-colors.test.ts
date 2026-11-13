import { describe, expect, it } from "vitest";
import { PARTY_COLORS, PARTY_ICON_CLASSES, getPartyIconClass } from "../src/utils/partyColors";

describe("party colors", () => {
	it("has 7 colors, one class per hex", () => {
		expect(PARTY_COLORS).toHaveLength(7);
		expect(PARTY_ICON_CLASSES).toHaveLength(7);
		expect(new Set(PARTY_COLORS).size).toBe(7);
		expect(new Set(PARTY_ICON_CLASSES).size).toBe(7);
	});

	it("returns null for missing party ids", () => {
		expect(getPartyIconClass(null)).toBeNull();
		expect(getPartyIconClass(undefined)).toBeNull();
		expect(getPartyIconClass("")).toBeNull();
	});

	it("always returns one of the 7 classes", () => {
		for (const id of [0, 1, 42, 999999, "party-a", "0e39b6e0-9b8a-4b7c-8f2a-1d2e3f4a5b6c"]) {
			const cls = getPartyIconClass(id);
			expect(cls).not.toBeNull();
			expect(PARTY_ICON_CLASSES).toContain(cls);
		}
	});

	it("is deterministic: same id always gets the same class", () => {
		for (const id of [101, 303, "party-a"]) {
			expect(getPartyIconClass(id)).toBe(getPartyIconClass(id));
			expect(getPartyIconClass(String(id))).toBe(getPartyIconClass(id));
		}
	});

	it("maps known ids to stable golden classes", () => {
		expect(getPartyIconClass(101)).toBe("text-yellow-600");
		expect(getPartyIconClass(303)).toBe("text-purple-500");
		expect(getPartyIconClass(404)).toBe("text-orange-500");
		expect(getPartyIconClass(505)).toBe("text-pink-500");
		expect(getPartyIconClass(707)).toBe("text-blue-500");
		expect(getPartyIconClass("party-a")).toBe("text-orange-500");
		expect(getPartyIconClass("party-b")).toBe("text-purple-500");
	});

	it("accepts collisions: different ids may share a class", () => {
		// 101 and 202 hash into the same bucket; both stay a valid class.
		expect(getPartyIconClass(101)).toBe(getPartyIconClass(202));
	});
});
