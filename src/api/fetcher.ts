import { fetch as httpfetch } from "@tauri-apps/plugin-http";

export interface FetchResult {
  status: number;
  data: any;
  headers: Headers;
}

export interface FetchOptions {
  body?: any;
  headers?: Record<string, string> | null;
  method?: "GET" | "PUT" | "POST";
}

export class Fetcher {
  async request(
    hostname: string,
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<FetchResult> {
    const res = await httpfetch(hostname + endpoint, {
      body: options?.body,
      headers: options.headers || {},
      method: options.method || "GET",
      danger: { acceptInvalidCerts: true, acceptInvalidHostnames: true },
    });

    const data = res.status === 200 ? await res.json() : null;
    return { status: res.status, data, headers: res.headers };
  }
}
