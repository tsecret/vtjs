import { z } from "zod";

// ── Reusable Offer cost/reward types ──────────────────────────────────────────

const Cost = z.record(z.string(), z.number());

const Reward = z.object({
	ItemTypeID: z.string(),
	ItemID: z.string(),
	Quantity: z.number(),
});

const Offer = z.object({
	OfferID: z.string(),
	IsDirectPurchase: z.boolean(),
	StartDate: z.string(), // ISO 8601 date
	Cost,
	Rewards: Reward.array(),
});

// ── Bundle item types ─────────────────────────────────────────────────────────

const BundleItem = z.object({
	Item: z.object({
		ItemTypeID: z.string(),
		ItemID: z.string(),
		Amount: z.number(),
	}),
	BasePrice: z.number(),
	CurrencyID: z.string(),
	DiscountPercent: z.number(),
	DiscountedPrice: z.number(),
	IsPromoItem: z.boolean(),
});

// ── Bundle item offer ─────────────────────────────────────────────────────────

const DiscountedCost = z.record(z.string(), z.number());

const BundleItemOffer = z.object({
	BundleItemOfferID: z.string(),
	Offer,
	DiscountPercent: z.number(),
	DiscountedCost,
});

// ── Bundle ────────────────────────────────────────────────────────────────────

const Bundle = z.object({
	ID: z.string(),
	DataAssetID: z.string(),
	CurrencyID: z.string(),
	Items: BundleItem.array(),
	ItemOffers: z.array(BundleItemOffer).nullable(),
	TotalBaseCost: z.record(z.string(), z.number()).nullable(),
	TotalDiscountedCost: z.record(z.string(), z.number()).nullable(),
	TotalDiscountPercent: z.number(),
	DurationRemainingInSeconds: z.number(),
	WholesaleOnly: z.boolean(),
});

// ── StorefrontResponse ────────────────────────────────────────────────────────

export const StorefrontResponseSchema = z.object({
	FeaturedBundle: z.object({
		Bundle,
		Bundles: Bundle.array(),
		BundleRemainingDurationInSeconds: z.number(),
	}),
	SkinsPanelLayout: z.object({
		SingleItemOffers: z.array(z.string()),
		SingleItemStoreOffers: z.array(
			z.object({
				OfferID: z.string(),
				IsDirectPurchase: z.boolean(),
				StartDate: z.string(),
				Cost,
				Rewards: Reward.array(),
			}),
		),
		SingleItemOffersRemainingDurationInSeconds: z.number(),
	}),
	UpgradeCurrencyStore: z.object({
		UpgradeCurrencyOffers: z.array(
			z.object({
				OfferID: z.string(),
				StorefrontItemID: z.string(),
				Offer,
				DiscountedPercent: z.number(),
			}),
		),
	}),
	AccessoryStore: z.object({
		AccessoryStoreOffers: z.array(
			z.object({
				Offer,
				ContractID: z.string(),
			}),
		),
		AccessoryStoreRemainingDurationInSeconds: z.number(),
		StorefrontID: z.string(),
	}),
	BonusStore: z.object({
		BonusStoreOffers: z.array(
			z.object({
				BonusOfferID: z.string(),
				Offer,
				DiscountPercent: z.number(),
				DiscountCosts: z.record(z.string(), z.number()),
				IsSeen: z.boolean(),
			}),
		),
		BonusStoreRemainingDurationInSeconds: z.number(),
	}),
}).strict();

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

export type StorefrontResponse = z.infer<typeof StorefrontResponseSchema>;
export type SkinResponse = z.infer<typeof SkinResponseSchema>;
export type WalletResponse = z.infer<typeof WalletResponseSchema>;
export type GameSettingsResponse = z.infer<typeof GameSettingsResponseSchema>;
