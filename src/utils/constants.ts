export const CACHE_NAME = "sqlite:cache.db";

const riotClientHost = import.meta.env.VITE_RIOT_CLIENT_HOST || import.meta.env.VITE_REMOTE_PC_IP || "localhost";

export const RIOT_CLIENT_HOST = riotClientHost.replace(/^https?:\/\//, "").replace(/\/+$/, "");
export const RIOT_GBUDDY_UUID = 'ad508aeb-44b7-46bf-f923-959267483e78'

export const THRESHOLDS = {
  SMURF_ACCOUNT_LEVEL_THRESHOLD: 100,
  SMURF_KD_THRESHOLD: 1.5,
  IMMORTAL_RR_CAP: 500,
  DIAMOND_AND_BELOW_RR_CAP: 100,
} as const;

export const API_CONFIG = {
  MATCH_HISTORY_COUNT: 20,
  MATCH_HISTORY_TTL_MS: 5 * 60 * 1000,
  MATCH_DETAILS_TTL_MS: 7 * 24 * 60 * 60 * 1000,
  COMPETITIVE_UPDATES_COUNT: 20,
} as const;

export const URLS = {
  VALORANT_API_BASE_URL: "https://media.valorant-api.com",
  PLAYER_PREFERENCES_BASE_URL: "https://player-preferences-usw2.pp.sgp.pvp.net",
} as const;

export const HEADERS = {
  RIOT_CLIENT_PLATFORM_B64: "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9",
  RIOT_CLIENT_VERSION: "release-13.05-shipping-11-5350494",
} as const;

export const DEV_REGION = import.meta.env.VITE_DEV_REGION;
export const DEV_SHARD = import.meta.env.VITE_DEV_SHARD;
export const DEV_TOKEN = import.meta.env.VITE_DEV_TOKEN;
export const DEV_PORT = parseInt(import.meta.env.VITE_DEV_PORT, 10);
