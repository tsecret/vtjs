import type {
	SkinResponse as WeaponSkinResponse,
	BundleResponse,
	SprayResponse,
	PlayerCardResponse,
	BuddyResponse,
} from "@valpro-labs/valorant-api";
import { ValorantApi } from "@valpro-labs/valorant-api";
import type { StorefrontResponse, WalletResponse } from "../interface";
import { BaseAPI } from "./base";
import { StorefrontResponseSchema, WalletResponseSchema } from "./schemas/riot";

// Singleton — static data doesn't need per-request instantiation
const valorantApi = new ValorantApi({ language: "en-US" });

export class StoreAPI extends BaseAPI {
	async getStore(puuid: string): Promise<StorefrontResponse> {
		return this.fetch(`https://pd.${this.SHARD}.a.pvp.net`, `/store/v3/storefront/${puuid}`, {
			body: JSON.stringify({}),
			method: "POST",
			ttl: 5 * 60 * 1000,
			schema: StorefrontResponseSchema,
		});
	}

	async getWallet(puuid: string): Promise<WalletResponse> {
		return this.fetch(`https://pd.${this.SHARD}.a.pvp.net`, `/store/v1/wallet/${puuid}`, {
			schema: WalletResponseSchema,
		});
	}

	async getSkinByLevelId(levelId: string): Promise<WeaponSkinResponse> {
		return valorantApi.weaponsEndpoints.getWeaponSkinByUuidV1(levelId);
	}

	async getBundleById(bundleId: string): Promise<BundleResponse> {
		return valorantApi.bundlesEndpoints.getBundleByUuidV1(bundleId);
	}

	async getSprayById(sprayId: string): Promise<SprayResponse> {
		return valorantApi.spraysEndpoints.getSprayByUuidV1(sprayId);
	}

	async getPlayerCardById(playerCardId: string): Promise<PlayerCardResponse> {
		return valorantApi.playerCardsEndpoints.getPlayerCardByUuidV1(playerCardId);
	}

	async getBuddieById(buddieId: string): Promise<BuddyResponse> {
		return valorantApi.buddiesEndpoints.getBuddyByUuidV1(buddieId);
	}
}
