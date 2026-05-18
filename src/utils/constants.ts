export const CACHE_NAME = "sqlite:cache.db";

const riotClientHost = import.meta.env.VITE_RIOT_CLIENT_HOST || import.meta.env.VITE_REMOTE_PC_IP || "localhost";

export const RIOT_CLIENT_HOST = riotClientHost.replace(/^https?:\/\//, "").replace(/\/+$/, "");

/** Game item type UUIDs used to classify store offers */
export const GAME_IDS = {
  /** Weapon skin item type */
  WEAPON_SKIN_TYPE_ID: "e7c63390-eda7-46e0-bb7a-a6abdacd2433",
  /** Spray item type */
  SPRAY_TYPE_ID: "d5f120f8-ff8c-4aac-92ea-f2b5acbe9475",
  /** Player card item type */
  PLAYERCARD_TYPE_ID: "3f296c07-64c3-494c-923b-fe692a4fa1bd",
  /** The Range map ID */
  RANGE_MAP_ID: "/Game/Maps/PovegliaV2/RangeV2",
} as const;

/** Thresholds for smurf detection and rank progress */
export const THRESHOLDS = {
  /** Account level below which a player may be a smurf */
  SMURF_ACCOUNT_LEVEL_THRESHOLD: 100,
  /** KD ratio above which a low-level player may be a smurf */
  SMURF_KD_THRESHOLD: 1.5,
  /** Maximum RR for Immortal rank (no RR cap) */
  IMMORTAL_RR_CAP: 500,
  /** Maximum RR for Diamond and below ranks */
  DIAMOND_AND_BELOW_RR_CAP: 100,
} as const;

/** API request configuration values */
export const API_CONFIG = {
  /** Number of matches to fetch in match history */
  MATCH_HISTORY_COUNT: 20,
  /** Cache TTL for match history (5 minutes) */
  MATCH_HISTORY_TTL_MS: 5 * 60 * 1000,
  /** Cache TTL for match details (7 days) */
  MATCH_DETAILS_TTL_MS: 7 * 24 * 60 * 60 * 1000,
  /** Number of competitive updates to fetch */
  COMPETITIVE_UPDATES_COUNT: 20,
} as const;

/** Base URLs for external services */
export const URLS = {
  /** Valorant API media base URL */
  VALORANT_API_BASE_URL: "https://media.valorant-api.com",
  /** Announcement text source */
  ANNOUNCEMENT_URL: "https://gist.githubusercontent.com/tsecret/0b5f7094000f4063d72276c5e05824aa/raw/announcement.txt",
  /** Player preferences service base URL */
  PLAYER_PREFERENCES_BASE_URL: "https://player-preferences-usw2.pp.sgp.pvp.net",
} as const;

/** Riot client HTTP headers */
export const HEADERS = {
  /** Base64-encoded platform identifier */
  RIOT_CLIENT_PLATFORM_B64: "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9",
  /** Riot client version string */
  RIOT_CLIENT_VERSION: "release-12.05-shipping-22-4360629",
} as const;
