import { useAtom, useAtomValue } from "jotai";
import { Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { GameSettingsResponse } from "@/api/schemas/riot";
import { useServices } from "@/lib/services";
import atoms from "../utils/atoms";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Settings = () => {
	const services = useServices();
	const cache = services?.cache;
	const store = services?.store;
	const sharedapi = services?.sharedapi;

	const appInfo = useAtomValue(atoms.appInfo);
	const player = useAtomValue(atoms.player);
	const [allowAnalytics, setAllowAnalytics] = useAtom(atoms.allowAnalytics);

	const [clearingCache, setClearingCache] = useState<boolean>(false);
	const [savedRequests, setSavedRequests] = useState<number>();
	const [dodgedPlayers, setDodgedPlayers] = useState<number>();

	const [savedGameSettings, setGameSettings] = useState<{
		name: string;
		data: GameSettingsResponse;
	} | null>(null);
	const [gameSettingsState, setGameSettingsState] = useState<{
		copied: boolean;
		pasted: boolean;
		modifying: boolean;
	}>({ copied: false, pasted: false, modifying: false });

	async function clearCache() {
		setClearingCache(true);

		const response = await cache?.execute("DELETE FROM requests WHERE ttl <= $1", [Date.now()]);
		if (savedRequests && response) setSavedRequests(savedRequests - response.rowsAffected);

		setClearingCache(false);
	}

	async function clearAllCache() {
		setClearingCache(true);

		const requests = await cache?.execute("DELETE FROM requests");

		if (savedRequests && requests) setSavedRequests(savedRequests - requests?.rowsAffected);

		setClearingCache(false);
	}

	async function copyGameSettings() {
		setGameSettingsState({ ...gameSettingsState, modifying: true });

		const settings = await sharedapi!.getGameSettings();
		if (settings) {
			await store?.set("gamesettings", {
				name: player!.game_name,
				data: settings,
			});
			setGameSettings({ name: player!.game_name, data: settings });
			setGameSettingsState({
				...gameSettingsState,
				copied: true,
				modifying: false,
			});
			return;
		}

		setGameSettingsState({ ...gameSettingsState, modifying: false });
	}

	async function pasteGameSettings() {
		if (!savedGameSettings) return;

		setGameSettingsState({ ...gameSettingsState, modifying: true });

		const response = await sharedapi?.setGameSettings(savedGameSettings.data);
		if (response) {
			setGameSettingsState({
				...gameSettingsState,
				pasted: true,
				modifying: false,
			});
			return;
		}

		setGameSettingsState({ ...gameSettingsState, modifying: false });
	}

	const cacheRef = useRef(cache);
	cacheRef.current = cache;
	const storeRef = useRef(store);
	storeRef.current = store;

	useEffect(() => {
		(async () => {
			const requests: any = await cacheRef.current?.select("SELECT COUNT(*) from requests");
			setSavedRequests(requests[0]["COUNT(*)"]);

			const dodged: any = await cacheRef.current?.select('SELECT COUNT(*) from players WHERE dodge = "true"');
			setDodgedPlayers(dodged[0]["COUNT(*)"]);
		})();

		(async () => {
			const settings: { name: string; data: GameSettingsResponse } | undefined = await storeRef.current?.get("gamesettings");
			if (settings) setGameSettings(settings);
		})();
	}, []);

	return (
		<div className="flex flex-col gap-4 p-4 max-w-md m-auto">
			<section className="flex flex-row items-center gap-2 text-xs">
				<div className="border-2 rounded-md p-2">App version {appInfo?.appVersion}</div>
				<div className="border-2 rounded-md p-2">Tauri version {appInfo?.tauriVersion}</div>
				<div className="border-2 rounded-md p-2">Identifier {appInfo?.identifier}</div>
			</section>

			<Separator />

			<Link to="/avoid-list">
				<Button variant="outline" className="w-full">View Avoid List</Button>
			</Link>

			<Separator />

			{/* Game Settings */}
			<section id="cache" className="flex flex-col gap-4">
				<h2 className="text-lg font-semibold">Game Settings</h2>

				<p className="text-sm text-muted-foreground">
					VTJS allows you to easily copy and paste game settings like Mouse and ADS sensitivity, minimap config and
					keybinds from one account to another
				</p>

				<Alert className="text-sm">
					<ol className="list-decimal list-inside space-y-1">
						<li>Log into account you want to copy the settings from</li>
						<li>Press <Badge variant="secondary" className="text-xs">Save Current Settings</Badge> button</li>
						<li>Log into account you want to paste the settings to</li>
						<li>Press <Badge variant="secondary" className="text-xs">Load Saved Settings</Badge></li>
						<li>Launch Valorant and check</li>
					</ol>
				</Alert>

				{savedGameSettings && <p className="text-sm text-muted-foreground">Settings saved for account: {savedGameSettings.name}</p>}

				<div className="flex gap-2">
					<Button
						variant={gameSettingsState.copied ? "default" : "outline"}
						size="sm"
						className="flex-1"
						disabled={gameSettingsState.modifying}
						onClick={copyGameSettings}
					>
						{gameSettingsState.copied ? "Saved" : "Save Current Settings"}
					</Button>
					<Button
						variant={gameSettingsState.pasted ? "default" : "outline"}
						size="sm"
						className="flex-1"
						disabled={gameSettingsState.modifying || !savedGameSettings}
						onClick={pasteGameSettings}
					>
						{gameSettingsState.pasted ? "Loaded" : "Load Saved Settings"}
					</Button>
				</div>
			</section>

			<Separator />

			{/* Cache */}
			<section id="cache" className="flex flex-col gap-4">
				<h2 className="text-lg font-semibold">Cache</h2>

				<div className="space-y-1 text-sm">
					<div className="flex items-center gap-2">
						<span>Saved requests: {savedRequests}</span>
					</div>
					<div className="flex items-center gap-2">
						<span>Avoid list: {dodgedPlayers}</span>
					</div>
				</div>

				<p className="text-sm text-muted-foreground">
					Its okay to have lots of requests cached, especially if you play daily. But if you feel like the app is
					lagging, try clearing the cache
				</p>

				<div className="flex gap-2">
					<Button variant="secondary" size="sm" className="flex-1" disabled={clearingCache} onClick={clearCache}>
						Clear Old Cache
					</Button>
					<Button variant="destructive" size="sm" className="flex-1" disabled={clearingCache} onClick={clearAllCache}>
						Clear All Cache
					</Button>
				</div>
			</section>

			<Separator />

			{/* Privacy */}
			<section id="analytics" className="space-y-4">
				<h2 className="text-lg font-semibold">Privacy</h2>

				<Label className="flex items-center gap-4 cursor-pointer">
					<Switch
						name="allowAnalytics"
						checked={allowAnalytics}
						onCheckedChange={setAllowAnalytics}
					/>
					<span>Enable analytics</span>
				</Label>

				<Alert className="text-sm">
					<Heart className="mr-2 size-4" />
					Enabling analytics allows us to better understand how you use the app and helps us make the app better for
					everyone. We are NOT interested in your personal information, cookies, etc. Only app usage is tracked
				</Alert>
			</section>
		</div>
	);
};
