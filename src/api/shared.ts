import { fetch as httpfetch } from '@tauri-apps/plugin-http';
import { load, Store } from '@tauri-apps/plugin-store';
import { CompetitiveUpdatesResponse, CurrentGameMatchResponse, CurrentGamePlayerResponse, MatchDetailsResponse, PlayerMatchHistoryResponse, PlayerMMRResponse, PlayerNamesReponse } from '../interface';

export class SharedAPI {
  private HOSTNAME: string = `https://glz-eu-1.eu.a.pvp.net`
  private HEADERS = {};
  private queue = 'competitive'

  // @ts-ignore
  private requestCache: Store
  public cacheTTL = 30 * 60 * 1000

  constructor({ entToken, accessToken }: { entToken: string, accessToken: string }){
    this.HEADERS = {
        'X-Riot-ClientPlatform': 'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9',
        'X-Riot-ClientVersion': 'release-10.11-shipping-6-3556814',
        'X-Riot-Entitlements-JWT': entToken,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    }
  }

  private delay(ms: number = 5000){
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async clearCache(){
    if (this.requestCache)
    await this.requestCache.clear()
  }

  private async fetch(
    endpoint: string,
    options: {
      hostname?: string | null,
      body?: any,
      method?: 'GET' | 'PUT',
      try?: number,
      noCache?: boolean
    } = { hostname: null, body: null, method: 'GET', try: 1 },
  ): Promise<any>{

    if (!this.requestCache)
      this.requestCache = await load('requests.json', { autoSave: false })

    if (!options.noCache && this.requestCache){
      const response = await this.requestCache.get<{ value: any, ttl: number }>(`request:shared:${endpoint}`)

      if (response && response.value && response.ttl > +new Date())
        return response.value

      if (response === undefined || response.ttl < +new Date())
        await this.requestCache.delete(`request:shared:${endpoint}`)
    }

    const res = await httpfetch(
      (options?.hostname || this.HOSTNAME) + endpoint,
      {
        body: options?.body,
        headers: this.HEADERS,
        method: options.method,
        danger: { acceptInvalidCerts: true, acceptInvalidHostnames: true }
      }
    )

    if (res.status === 200){
      const response = await res.json()
      if (!options.noCache) await this.requestCache.set(`request:shared:${endpoint}`, { value: response, ttl: +new Date() + this.cacheTTL })
      return response
    }

    if (!options.try) options.try = 1

    if (res.status === 429){
      console.log('Rate limit hit, waiting for', options.try * 5000)
      await this.delay(options.try * 5000)
      return this.fetch(endpoint, { ...options, try: options.try + 1 })
    }

    console.log('res.status', res.status)

  }

  async getCurrentGamePlayer(puuid: string): Promise<CurrentGamePlayerResponse> {
    return this.fetch(`/core-game/v1/players/${puuid}`, { noCache: true })
  }

  async getCurrentGameMatch(matchId: string): Promise<CurrentGameMatchResponse> {
    return this.fetch(`/core-game/v1/matches/${matchId}`)
  }

  async getPlayerNames(puuids: string[]): Promise<PlayerNamesReponse[]>{
    // TODO make this a separate service
    return this.fetch('/name-service/v2/players', { hostname: 'https://pd.eu.a.pvp.net', body: JSON.stringify(puuids), method: "PUT" })
  }

  async getPlayerMatchHistory(puuid: string): Promise<PlayerMatchHistoryResponse> {
    const startIndex = 0
    const endIndex = 20
    return this.fetch(`/match-history/v1/history/${puuid}?startIndex=${startIndex}&endIndex=${endIndex}&queue=${this.queue}`, { hostname: 'https://pd.eu.a.pvp.net' })
  }

  async getMatchDetails(matchId: string): Promise<MatchDetailsResponse>{
    return this.fetch(`/match-details/v1/matches/${matchId}`, { hostname: 'https://pd.eu.a.pvp.net' })
  }

  async getCompetitiveUpdates(puuid: string): Promise<CompetitiveUpdatesResponse> {
    return this.fetch(`/mmr/v1/players/${puuid}/competitiveupdates?queue=competitive`, { hostname: 'https://pd.eu.a.pvp.net' })
  }

  async getPlayerMMR(puuid: string): Promise<PlayerMMRResponse> {
    return this.fetch(`/mmr/v1/players/${puuid}`, { hostname: 'https://pd.eu.a.pvp.net' })
  }

}
