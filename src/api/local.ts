import { Lockfile, EntitlementsTokenResponse, PlayerAccount, HelpResponse } from '../interface'
import { fetch as httpfetch } from '@tauri-apps/plugin-http';

export class LocalAPI {
  private HOSTNAME: string;
  private HEADERS = {};

  constructor({ port, password }: Lockfile){
    this.HOSTNAME = `https://192.168.31.197:${port}`
    this.HEADERS= { 'Authorization': `Basic ${password}` }
  }

  private async fetch(endpoint: string){
    const res = await httpfetch(
      this.HOSTNAME + endpoint,
      { headers: this.HEADERS, method: "GET", danger: { acceptInvalidCerts: true, acceptInvalidHostnames: true } }
    )

    if (res.status === 200)
      return res.json()

    console.log('res.status', res.status)
  }

  async getEntitlementToken(): Promise<EntitlementsTokenResponse> {
    return this.fetch('/entitlements/v1/token')
  }

  async getPlayerAccount(): Promise<PlayerAccount> {
    return this.fetch('/player-account/aliases/v1/active')
  }

  async help(): Promise<HelpResponse> {
    return this.fetch('/help')
  }

}
