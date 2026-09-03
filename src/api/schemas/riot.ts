import { z } from "zod";

// ── SkinResponse ──────────────────────────────────────────────────────────────

export const SkinResponseSchema = z.object({
	status: z.number(),
	data: z.object({
		uuid: z.string(),
		displayName: z.string(),
		displayIcon: z.string(),
		fullTransparentIcon: z.string(),
		wideArt: z.string(),
		largeArt: z.string(),
	}),
});

// ── WalletResponse ────────────────────────────────────────────────────────────

export const WalletResponseSchema = z.object({
	Balances: z.record(z.string(), z.number()),
});

// ── GameSettingsResponse ──────────────────────────────────────────────────────

export const GameSettingsResponseSchema = z.object({
	type: z.literal("Ares.PlayerSettings"),
	data: z.string(),
});

// ── Derived types ─────────────────────────────────────────────────────────────

export type SkinResponse = z.infer<typeof SkinResponseSchema>;
export type WalletResponse = z.infer<typeof WalletResponseSchema>;
export type GameSettingsResponse = z.infer<typeof GameSettingsResponseSchema>;
