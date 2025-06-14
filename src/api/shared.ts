
import axios, { AxiosInstance } from 'axios'
import { CurrentGameMatchResponse, CurrentGamePlayerResponse } from '../interface'

export class SharedAPI {
  private HOSTNAME: string

  private instance: AxiosInstance

  constructor({ entToken, authToken }: { entToken: string, authToken: string }){
    this.HOSTNAME = `https://glz-eu-1.eu.a.pvp.net`

    this.instance = axios.create({
      baseURL: this.HOSTNAME,
      headers: {
        'X-Riot-ClientPlatform': 'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9',
        'X-Riot-ClientVersion': '10.11.00.3556814',
        'X-Riot-Entitlements-JWT': entToken,
        'Authorization': `Bearer ${authToken}`
      },
    })
  }

  async getCurrentGamePlayer(puuid: string): Promise<CurrentGamePlayerResponse> {
    const res = await this.instance.get(`/core-game/v1/players/${puuid}`)
    return res.data
  }

  async getCurrentGameMatch(matchId: string): Promise<CurrentGameMatchResponse> {
    const res = await this.instance.get(`/core-game/v1/matches/${matchId}`)
    return res.data
  }

}
