import { z } from "zod";
import { Fetcher } from "./fetcher";
import { SQLiteCache } from "./cache";
import { Auth, RefreshAuthCallback } from "./auth";
import { HEADERS } from "../utils/constants";

type RateLimitCallback = (retryAfter: number) => void;

export class BaseAPI {
  private fetcher: Fetcher;
  private cache: SQLiteCache;
  private auth: Auth;
  private rateLimitCallback?: RateLimitCallback;
  public REGION: string;
  public SHARD: string;
  public cacheTTL = 30 * 60 * 1000;

  constructor({
    entToken,
    accessToken,
    region,
    shard,
  }: { entToken: string; accessToken: string; region: string; shard: string }) {
   	const headers = {
      "X-Riot-ClientPlatform": HEADERS.RIOT_CLIENT_PLATFORM_B64,
      "X-Riot-ClientVersion": HEADERS.RIOT_CLIENT_VERSION,
      "X-Riot-Entitlements-JWT": entToken,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    this.fetcher = new Fetcher();
    this.cache = new SQLiteCache();
    this.auth = new Auth(headers);
    this.REGION = region;
    this.SHARD = shard;
  }

  setRateLimitCallback(callback: RateLimitCallback) {
    this.rateLimitCallback = callback;
  }

  setRefreshAuthCallback(callback: RefreshAuthCallback) {
    this.auth.setCallback(callback);
  }

  private delay(ms: number = 5000) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected async fetch(
    hostname: string,
    endpoint: string,
    options: {
      body?: any;
      headers?: any | null;
      method?: "GET" | "PUT" | "POST";
      noCache?: boolean;
      ttl?: number;
      _authRetried?: boolean;
      schema?: z.ZodObject<any, any>;
    } = { body: null, headers: null, method: "GET", ttl: this.cacheTTL },
  ): Promise<any> {
    if (!options.ttl) options.ttl = this.cacheTTL;
    if (!options.noCache) options.noCache = false;

    // Check cache
    if (!options.noCache) {
      const cached = await this.cache.get(endpoint);
      if (cached !== null) return cached;
    }

    // HTTP request
    const res = await this.fetcher.request(hostname, endpoint, {
      body: options?.body,
      headers: options.headers || this.auth.getHeaders(),
      method: options.method,
    });

    if (res.status === 404) {
      console.log(hostname + endpoint, {
        body: options?.body,
        headers: options.headers || this.auth.getHeaders(),
        method: options.method,
      });
    }

    if (res.status === 200) {
      if (options.schema) {
        const result = options.schema.safeParse(res.data);
        if (!result.success) {
          console.error(`Schema validation failed for ${hostname}${endpoint}:`, result.error);
          throw new Error(`Riot API response validation failed for ${endpoint}: ${result.error.message}`);
        }
      }
      if (!options.noCache && options.ttl !== undefined) {
        await this.cache.set(endpoint, res.data, options.ttl);
      }
      return res.data;
    }

    // Auth retry
    if (res.status === 401 || res.status === 403) {
      if (options._authRetried) return null;
      const refreshed = await this.auth.refreshIfNeeded();
      if (!refreshed) return null;
      return this.fetch(hostname, endpoint, {
        ...options,
        headers: null,
        _authRetried: true,
      });
    }

    // Rate limit
    if (res.status === 429) {
      const retrySeconds = parseInt(res.headers.get("retry-after") || "60", 10);
      if (this.rateLimitCallback) {
        this.rateLimitCallback(retrySeconds);
      }
      await this.delay(retrySeconds * 1000);
      return this.fetch(hostname, endpoint, options);
    }

    return null;
  }
}
