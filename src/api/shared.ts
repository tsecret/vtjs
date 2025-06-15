import { fetch as httpfetch } from '@tauri-apps/plugin-http';
import { CurrentGameMatchResponse, CurrentGamePlayerResponse } from '../interface'

export class SharedAPI {
  private HOSTNAME: string = `https://glz-eu-1.eu.a.pvp.net`
  private HEADERS = {};

  constructor({ entToken, accessToken }: { entToken: string, accessToken: string }){
    this.HEADERS = {
        'X-Riot-ClientPlatform': 'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9',
        'X-Riot-ClientVersion': '10.11.00.3556814',
        'X-Riot-Entitlements-JWT': entToken,
        'Authorization': `Bearer ${accessToken}`
    }
  }

  private async fetch(endpoint: string){
    const res = await httpfetch(
      this.HOSTNAME + endpoint,
      {
        headers: this.HEADERS,
        method: "GET",
        danger: { acceptInvalidCerts: true, acceptInvalidHostnames: true }
      }
    )

    if (res.status === 200)
      return res.json()
  }

  async getCurrentGamePlayer(puuid: string): Promise<CurrentGamePlayerResponse> {
    return this.fetch(`/core-game/v1/players/${puuid}`)
  }

  async getCurrentGameMatch(matchId: string): Promise<CurrentGameMatchResponse> {
    return this.fetch(`/core-game/v1/matches/${matchId}`)
  }

}
