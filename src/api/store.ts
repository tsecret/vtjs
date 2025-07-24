import { SkinResponse, StorefrontResponse, WalletResponse } from "../interface";
import { BaseAPI } from "./base";

export class StoreAPI extends BaseAPI {
  private SHARD = 'eu'

  async getStore(puuid: string): Promise<StorefrontResponse> {
    return this.fetch(`https://pd.${this.SHARD}.a.pvp.net`, `/store/v3/storefront/${puuid}`, { body: JSON.stringify({}), method: 'POST' })
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
}
