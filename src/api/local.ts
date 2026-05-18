import { fetch as httpfetch } from "@tauri-apps/plugin-http";
import type {
  EntitlementsTokenResponse,
  FriendsResponse,
  Lockfile,
  PlayerAccount,
  PresenceResponse,
} from "../interface";
import { RIOT_CLIENT_HOST } from "../utils/constants";

export class LocalAPI {
  private HOSTNAME: string;
  private HEADERS: Record<string, string>;

  constructor({ port, password }: Lockfile) {
    this.HOSTNAME = `https://${RIOT_CLIENT_HOST}:${port}`;
    this.HEADERS = { Authorization: `Basic ${password}` };
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const res = await httpfetch(this.HOSTNAME + endpoint, {
      headers: this.HEADERS,
      method: "GET",
      danger: { acceptInvalidCerts: true, acceptInvalidHostnames: true },
    });

    if (res.status !== 200) {
      throw new Error(`LocalAPI request failed: ${endpoint} returned status ${res.status}`);
    }

    return res.json();
  }

  async getEntitlementToken(): Promise<EntitlementsTokenResponse> {
    return this.fetch("/entitlements/v1/token");
  }

  async getPlayerAccount(): Promise<PlayerAccount> {
    return this.fetch("/player-account/aliases/v1/active");
  }

   async getFriends(): Promise<FriendsResponse> {
    return this.fetch("/chat/v4/friends");
  }

  async getPresences(): Promise<PresenceResponse> {
    return this.fetch("/chat/v4/presences");
  }
}
