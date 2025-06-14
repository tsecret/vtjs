import axios, { Axios, AxiosInstance } from 'axios'
import { Config, EntitlementsTokenResponse, PlayerAccount } from '../interface'
import https from 'https'

export class LocalAPI {
  private HOSTNAME: string
  private HEADERS: any

  private instance: AxiosInstance

  constructor(config: Config){
    this.HOSTNAME = `https://192.168.31.197:${config.port}`
    this.instance = axios.create({
      baseURL: this.HOSTNAME,
      headers: { 'Authorization': `Basic ${config.lockfilePassword}` },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
        requestCert: false,
      })
    })
  }

  async getEntitlementToken(): Promise<EntitlementsTokenResponse> {
    const res = await this.instance.get('/entitlements/v1/token')
    return res.data
  }

  async getPlayerAccount(): Promise<PlayerAccount> {
    const res = await this.instance.get('/player-account/aliases/v1/active')
    return res.data
  }

  async help(): Promise<any> {
    const res = await this.instance.get('/help')
    return res.data
  }

}
