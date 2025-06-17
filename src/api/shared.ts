import { fetch as httpfetch } from '@tauri-apps/plugin-http';
import { CurrentGameMatchResponse, CurrentGamePlayerResponse, MatchDetailsResponse, PlayerMatchHistoryResponse, PlayerNamesReponse } from '../interface';

export class SharedAPI {
  private HOSTNAME: string = `https://glz-eu-1.eu.a.pvp.net`
  private HEADERS = {};
  private queue = 'competitive'

  constructor({ entToken, accessToken }: { entToken: string, accessToken: string }){
    this.HEADERS = {
        'X-Riot-ClientPlatform': 'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9',
        'X-Riot-ClientVersion': '10.11.00.3556814',
        'X-Riot-Entitlements-JWT': entToken,
        'Authorization': `Bearer ${accessToken}`
    }
  }

  private delay(ms: number = 2000){
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async fetch(
    endpoint: string,
    options: { hostname?: string | null, body?: any, method?: 'GET' | 'PUT', try?: number } = { hostname: null, body: null, method: 'GET', try: 1 },
  ): Promise<any>{
    const res = await httpfetch(
      (options?.hostname || this.HOSTNAME) + endpoint,
      {
        body: options?.body,
        headers: this.HEADERS,
        method: options.method,
        danger: { acceptInvalidCerts: true, acceptInvalidHostnames: true }
      }
    )

    if (res.status === 200)
      return res.json()

    if (!options.try) options.try = 1

    if (res.status === 429){
      console.log('Rate limit hit, waiting for', options.try * 2000)
      await this.delay(options.try * 2000)
      return this.fetch(endpoint, { ...options, try: options.try + 1 })
    }

  }

  async getCurrentGamePlayer(puuid: string): Promise<CurrentGamePlayerResponse> {
    return this.fetch(`/core-game/v1/players/${puuid}`)
  }

  async getCurrentGameMatch(matchId: string): Promise<CurrentGameMatchResponse> {
    return this.fetch(`/core-game/v1/matches/${matchId}`)
  }

  async getPlayerNames(puuids: string[]): Promise<PlayerNamesReponse[]>{
    // TODO make this a separate service
    return this.fetch('/name-service/v2/players', { hostname: 'https://pd.eu.a.pvp.net', body: JSON.stringify(puuids), method: "PUT" })
  }

  async getPlayerMatchHistory(puuid: string): Promise<PlayerMatchHistoryResponse>{
    return this.fetch(`/match-history/v1/history/${puuid}?queue=${this.queue}`, { hostname: 'https://pd.eu.a.pvp.net' })
  }

  async getMatchdetails(matchId: string): Promise<MatchDetailsResponse>{
    const res = await this.fetch(`/match-details/v1/matches/${matchId}`, { hostname: 'https://pd.eu.a.pvp.net' })
    return res
  }

}
