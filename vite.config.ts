import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
	const env = loadEnv(mode, import.meta.dirname, "");
	// Mock mode: all API traffic is answered from src/mocks/fixtures (no Riot client needed).
	const useMocks = env.VITE_FROM_JSON === "true";

	return {
		plugins: [react(), tailwindcss()],
		// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
		//
		// 1. prevent vite from obscuring rust errors
		clearScreen: false,
		// 2. tauri expects a fixed port, fail if that port is not available
		server: {
			port: 1420,
			strictPort: true,
			host: host || false,
			hmr: host
				? {
						protocol: "ws",
						host,
						port: 1421,
					}
				: undefined,
			watch: {
				// 3. tell vite to ignore watching `src-tauri`
				ignored: ["**/src-tauri/**"],
			},
		},
		test: {
			environment: "jsdom",
			setupFiles: ["/tests/setup.ts"],
		},
		resolve: {
			alias: {
				"@": path.resolve(import.meta.dirname, "./src"),
				// In mock mode the real plugin-http is replaced, so every request
				// (LocalAPI, Fetcher, ...) is served from the fixtures.
				...(useMocks
					? { "@tauri-apps/plugin-http": path.resolve(import.meta.dirname, "./src/mocks/plugin-http.ts") }
					: {}),
			},
		},
	};
});
