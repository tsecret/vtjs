import { SkinResponse, StorefrontResponse, WalletResponse } from "../interface";
import { BaseAPI } from "./base";

export class StoreAPI extends BaseAPI {
  async getStore(puuid: string): Promise<StorefrontResponse> {
    return this.fetch(`https://pd.${this.SHARD}.a.pvp.net`, `/store/v3/storefront/${puuid}`, { body: JSON.stringify({}), method: 'POST', ttl: 5 * 60 * 1000 })
  }

  async getWallet(puuid: string): Promise<WalletResponse> {
    return this.fetch(`https://pd.${this.SHARD}.a.pvp.net`, `/store/v1/wallet/${puuid}`)
  }

  async getSkinByLevelId(levelId: string): Promise<SkinResponse> {
    return this.fetch('https://valorant-api.com', `/v1/weapons/skinlevels/${levelId}`, { headers: {} })
  }

  async getBundleById(bundleId: string): Promise<SkinResponse> {
    return this.fetch('https://valorant-api.com', `/v1/bundles/${bundleId}`, { headers: {} })
  }

  async getSprayById(sprayId: string): Promise<SkinResponse> {
    return this.fetch('https://valorant-api.com', `/v1/sprays/${sprayId}`, { headers: {} })
  }

  async getPlayerCardById(playerCardId: string): Promise<SkinResponse> {
    return this.fetch('https://valorant-api.com', `/v1/playercards/${playerCardId}`, { headers: {} })
  }

  async getBuddieById(buddieId: string): Promise<SkinResponse> {
    return this.fetch('https://valorant-api.com', `/v1/buddies/levels/${buddieId}`, { headers: {} })
  }
}
