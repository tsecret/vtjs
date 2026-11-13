import { getMockResponse, type MockHttpInit } from "./router";

/**
 * Drop-in replacement for `@tauri-apps/plugin-http` used when VITE_FROM_JSON=true
 * (see vite.config.ts). Consumers only use `status`, `headers` and `json()`.
 */
export function fetch(input: string | URL, init?: MockHttpInit): Promise<unknown> {
	return Promise.resolve(getMockResponse(String(input), init));
}

export default { fetch };
