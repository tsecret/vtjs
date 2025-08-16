import { fetch as httpfetch } from '@tauri-apps/plugin-http';
import Database from "@tauri-apps/plugin-sql";
import { CACHE_NAME } from "../utils/constants";

export class BaseAPI {
  private HEADERS = {};
  public REGION: string
  public SHARD: string

  // @ts-ignore
  private cache: Database
  public cacheTTL = 30 * 60 * 1000

  // Rate limiting tracking
  private static callTimestamps: number[] = [];
  private static MAX_CALLS_PER_MINUTE = 45;

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

  private async ensureRateLimit(): Promise<void> {
    const now = Date.now();

    // Remove timestamps older than 60s
    BaseAPI.callTimestamps = BaseAPI.callTimestamps.filter(
      ts => now - ts < 60_000
    );

    if (BaseAPI.callTimestamps.length >= BaseAPI.MAX_CALLS_PER_MINUTE) {
      const waitTime = 60_000 - (now - BaseAPI.callTimestamps[0]);
      console.log(`Rate limit reached, waiting ${waitTime}ms`);
      await this.delay(waitTime);
      return this.ensureRateLimit(); // Re-check after waiting
    }

    // Record this call
    BaseAPI.callTimestamps.push(now);
  }

  protected async fetch(
    hostname: string,
    endpoint: string,
    options: {
      body?: any,
      headers?: any | null
      method?: 'GET' | 'PUT' | 'POST',
      try?: number,
      noCache?: boolean
      ttl?: number
    } = { body: null, headers: null, method: 'GET', try: 1, ttl: this.cacheTTL },
  ): Promise<any>{

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

    await this.ensureRateLimit();

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

    if (!options.try) options.try = 1

    if (res.status === 429){
      console.log('Rate limit hit, waiting for', options.try * 10_000)
      await this.delay(options.try * 10_000)
      return this.fetch(hostname, endpoint, { ...options, try: options.try + 1 })
    }

    return null

  }
}
