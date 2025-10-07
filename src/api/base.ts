import { fetch as httpfetch } from '@tauri-apps/plugin-http';
import Database from "@tauri-apps/plugin-sql";
import { CACHE_NAME } from "../utils/constants";

type RateLimitCallback = (retryAfter: number) => void;

export class BaseAPI {
  private HEADERS = {};
  public REGION: string
  public SHARD: string
  private rateLimitCallback?: RateLimitCallback;


  // @ts-ignore
  private cache: Database
  public cacheTTL = 30 * 60 * 1000

  constructor({ entToken, accessToken, region, shard }: { entToken: string, accessToken: string, region: string, shard: string }){
    this.HEADERS = {
        'X-Riot-ClientPlatform': 'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9',
        'X-Riot-ClientVersion': 'release-10.11-shipping-6-3556814',
        'X-Riot-Entitlements-JWT': entToken,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    }
    this.REGION = region
    this.SHARD = shard
  }

  private delay(ms: number = 5000){
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  setRateLimitCallback(callback: RateLimitCallback) {
    this.rateLimitCallback = callback;
  }

  protected async fetch(
    hostname: string,
    endpoint: string,
    options: {
      body?: any,
      headers?: any | null
      method?: 'GET' | 'PUT' | 'POST',
      noCache?: boolean
      ttl?: number
    } = { body: null, headers: null, method: 'GET', ttl: this.cacheTTL },
  ): Promise<any>{

    if (!options.ttl)
      options.ttl = this.cacheTTL

    if (!options.noCache)
      options.noCache = false

    if (!this.cache)
      this.cache = await Database.load(CACHE_NAME)

    if (!options.noCache && this.cache){
      const [response] = await this.cache.select<[{ endpoint: string, ttl: number, data: any }]>('SELECT * FROM requests WHERE endpoint=$1 LIMIT 1', [endpoint])

      if (response && response.data){
        if (+new Date() < response.ttl){
          return JSON.parse(response.data)
        }
      }
    }

    const res = await httpfetch(
      hostname + endpoint,
      {
        body: options?.body,
        headers: options.headers || this.HEADERS,
        method: options.method,
        danger: { acceptInvalidCerts: true, acceptInvalidHostnames: true }
      }
    )

    if (res.status === 200){
      const response = await res.json()
      if (!options.noCache && options.ttl !== undefined) {
        await this.cache.execute(
          'INSERT or REPLACE into requests (endpoint, ttl, data) VALUES ($1, $2, $3)',
          [endpoint, +new Date() + options.ttl, response]
        )
      }
      return response
    }

    if (res.status === 429){
      const retrySeconds = parseInt(res.headers.get('retry-after') || '60')

      if (this.rateLimitCallback) {
        this.rateLimitCallback(retrySeconds);
      }

      await this.delay(retrySeconds * 1000)
      return this.fetch(hostname, endpoint, options)
    }

    return null

  }
}
