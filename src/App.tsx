import { useAptabase } from "@aptabase/react";
import { getIdentifier, getTauriVersion, getVersion } from "@tauri-apps/api/app";
import { invoke } from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";
import { load } from "@tauri-apps/plugin-store";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router";
import { LocalAPI, SharedAPI } from "./api";
import { MatchHandler } from "./components";
import { Header } from "./components/Header";
import { RateLimitNotification } from "./components/RateLimitAlert";
import { SocketListener } from "./components/SocketListener";
import { Sync } from "./components/Sync";
import { type AppServices, ServicesProvider } from "./lib/services";
import { AvoidListPage } from "./pages/AvoidList.page";
import { InitPage } from "./pages/Init.page";
import { Main } from "./pages/Main.page";
import { MatchPage } from "./pages/Match.page";
import { ProfilePage } from "./pages/Profile.page";
import { Settings } from "./pages/Settings.page";
import { TestPage } from "./pages/Test.page";
import { WelcomePage } from "./pages/Welcome.page";
import { Toaster } from "./components/ui/sonner";
import { parseLockFile, readLockfile, readLog } from "./utils";
import atoms from "./utils/atoms";
import { CACHE_NAME, DEV_PORT, DEV_REGION, DEV_SHARD, DEV_TOKEN, RIOT_CLIENT_HOST } from "./utils/constants";

/** VITE_FROM_JSON=true serves every request from src/mocks instead of the Riot client. */
const IS_MOCK_MODE = import.meta.env.VITE_FROM_JSON === "true";

function App() {
	const setAppInfo = useSetAtom(atoms.appInfo);
	const setPlayer = useSetAtom(atoms.player);
	const setpuuid = useSetAtom(atoms.puuid);
	const setAllowAnalytics = useSetAtom(atoms.allowAnalytics);
	const setFirstTimeUser = useSetAtom(atoms.firstTimeUser);
	const setRateLimitNotification = useSetAtom(atoms.rateLimitNotification);

	const [initStatus, setInitStatus] = useState<string>("Preparing app");
	const [error, setError] = useState<string | null>(null);
	const [services, setServices] = useState<AppServices | null>(null);

	const navigate = useNavigate();
	const { trackEvent } = useAptabase();

	useEffect(() => {
		(async () => {
			const [appVersion, tauriVersion, identifier] = await Promise.all([
				getVersion(),
				getTauriVersion(),
				getIdentifier(),
			]);
			const appInfo = { appVersion, tauriVersion, identifier };

			// Settings
			const store = await load("settings.json");
			const allowAnalytics = !!(await store.get("allowAnalytics"));
			const firstTimeUserKey = await store.get<boolean | undefined>("firstTimeUser");
			const firstTimeUser = !!(firstTimeUserKey || firstTimeUserKey === undefined);

			if (allowAnalytics) await trackEvent("app_init");

			setInitStatus("Loading database");
			const db = await Database.load(CACHE_NAME);
			await db.execute("CREATE TABLE IF NOT EXISTS requests (endpoint str PRIMARY KEY, ttl int, data JSON)");
			await db.execute("CREATE TABLE IF NOT EXISTS players (puuid str PRIMARY KEY, dodge boolean, dodgeTimestamp int)");

			setInitStatus("Cleaning cache");
			await db.execute("DELETE FROM requests WHERE ttl <= $1", [Date.now()]);
			if (IS_MOCK_MODE) {
				// Fixtures reuse the same cache keys as real responses; never let stale real data shadow them.
				await db.execute("DELETE FROM requests");
			}

			try {
				setInitStatus(IS_MOCK_MODE ? "Loading fixtures" : "Reading lockfile");
				const { port, password } = IS_MOCK_MODE
					? parseLockFile(`Riot Client:1:${DEV_PORT || 12345}:${DEV_TOKEN || "developer"}:https`)
					: parseLockFile(await readLockfile());

				setInitStatus("Reading logs");
				const [region, shard] = IS_MOCK_MODE ? [DEV_REGION || "eu", DEV_SHARD || "eu"] : await readLog();

				setInitStatus("Connecting to Riot Client");
				const localapi = new LocalAPI({ port, password });
				const player = await localapi.getPlayerAccount();

				setInitStatus("Loading Player");
				const { accessToken, token: entToken, subject: puuid } = await localapi.getEntitlementToken();
				const sharedapi = new SharedAPI({ entToken, accessToken, region, shard, noCache: IS_MOCK_MODE });

				sharedapi.setRateLimitCallback((retryAfter: number) => {
					setRateLimitNotification({ isActive: true, retryAfter });
				});

				sharedapi.setRefreshAuthCallback(async () => {
					const { accessToken, token: entToken } = await localapi.getEntitlementToken();
					return { accessToken, entToken };
				});

				setAppInfo(appInfo);
				setAllowAnalytics(allowAnalytics);
				setFirstTimeUser(firstTimeUser);
				setPlayer(player);
				setpuuid(puuid);
				setServices({ cache: db, localapi, sharedapi, store });

				if (IS_MOCK_MODE) {
					// No Riot client to connect to: drive SocketListener from fixtures instead.
					const { startMockEvents } = await import("./mocks/events");
					startMockEvents();
				} else {
					invoke("start_ws", {
						wsUrl: `wss://${RIOT_CLIENT_HOST}:${port}`,
						headers: {
							Authorization: `Basic ${password}`,
						},
					});
				}

				if (allowAnalytics) await trackEvent("app_load");

				navigate(firstTimeUser ? "/welcome" : "/dashboard");
			} catch (err) {
				console.log("err", err);
				setError("Make sure Riot Client is open, and you have logged into your account");
				navigate("/");
			}
		})();
	}, []);

	return (
		<ServicesProvider value={services}>
			<main className="relative select-none cursor-default">
				<Toaster />
				<Header />
				<SocketListener />
				<RateLimitNotification />
				<MatchHandler />
				<Sync />
				<Routes>
					<Route path="/" element={<InitPage status={initStatus} error={error} />} />
					<Route path="/welcome" element={<WelcomePage />} />
					<Route path="/dashboard" element={<Main />} />
					<Route path="/test" element={<TestPage />} />
					<Route path="/settings" element={<Settings />} />
					<Route path="/player/:puuid" element={<ProfilePage />} />
					<Route path="/match/:matchId" element={<MatchPage />} />
					<Route path="/avoid-list" element={<AvoidListPage />} />
				</Routes>
			</main>
		</ServicesProvider>
	);
}

export default App;
