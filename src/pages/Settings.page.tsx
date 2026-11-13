import { useAtom, useAtomValue } from "jotai";
import { Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { GameSettingsResponse } from "@/api/schemas/riot";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Item, ItemActions, ItemContent, ItemGroup, ItemTitle } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useServices } from "@/lib/services";
import atoms from "../utils/atoms";

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
			const settings: { name: string; data: GameSettingsResponse } | undefined =
				await storeRef.current?.get("gamesettings");
			if (settings) setGameSettings(settings);
		})();
	}, []);

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4">
			{/* Game Settings */}
			<Card>
				<CardHeader>
					<CardTitle>Game Settings</CardTitle>
					<CardDescription>
						Copy and paste game settings like mouse and ADS sensitivity, minimap config and keybinds from one account to
						another.
					</CardDescription>
				</CardHeader>

				<CardContent className="flex flex-col gap-4">
					<Alert className="text-sm">
						<ol className="list-decimal list-inside space-y-1">
							<li>Log into the account you want to copy the settings from</li>
							<li>
								Press <Badge variant="secondary">Save Current Settings</Badge>
							</li>
							<li>Log into the account you want to paste the settings to</li>
							<li>
								Press <Badge variant="secondary">Load Saved Settings</Badge>
							</li>
							<li>Launch Valorant and check</li>
						</ol>
					</Alert>

					{savedGameSettings && (
						<p className="text-sm text-muted-foreground">Settings saved for account: {savedGameSettings.name}</p>
					)}
				</CardContent>

				<CardFooter className="gap-2">
					<Button
						variant={gameSettingsState.copied ? "default" : "outline"}
						className="flex-1"
						disabled={gameSettingsState.modifying}
						onClick={copyGameSettings}
					>
						{gameSettingsState.copied ? "Saved" : "Save Current Settings"}
					</Button>
					<Button
						variant={gameSettingsState.pasted ? "default" : "outline"}
						className="flex-1"
						disabled={gameSettingsState.modifying || !savedGameSettings}
						onClick={pasteGameSettings}
					>
						{gameSettingsState.pasted ? "Loaded" : "Load Saved Settings"}
					</Button>
				</CardFooter>
			</Card>

			{/* Cache */}
			<Card>
				<CardHeader>
					<CardTitle>Cache</CardTitle>
					<CardDescription>
						Plenty of cached requests is fine if you play daily. Clear them if the app starts to feel sluggish.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<ItemGroup className="gap-2">
						<Item variant="muted" size="sm">
							<ItemContent>
								<ItemTitle>Saved requests</ItemTitle>
							</ItemContent>
							<ItemActions>{savedRequests ?? 0}</ItemActions>
						</Item>
						<Item variant="muted" size="sm">
							<ItemContent>
								<ItemTitle>Avoid list</ItemTitle>
							</ItemContent>
							<ItemActions>{dodgedPlayers ?? 0}</ItemActions>
						</Item>
					</ItemGroup>
				</CardContent>

				<CardFooter className="gap-2">
					<Button variant="secondary" className="flex-1" disabled={clearingCache} onClick={clearCache}>
						Clear Old Cache
					</Button>
					<Button variant="destructive" className="flex-1" disabled={clearingCache} onClick={clearAllCache}>
						Clear All Cache
					</Button>
				</CardFooter>
			</Card>

			{/* Avoid List */}
			<Card>
				<CardHeader>
					<CardTitle>Avoid List</CardTitle>
					<CardDescription>Players VTJS steers you away from when you party up.</CardDescription>
				</CardHeader>

				<CardFooter>
					<Button variant="outline" className="w-full" render={<Link to="/avoid-list" />}>
						View Avoid List
					</Button>
				</CardFooter>
			</Card>

			{/* Privacy */}
			<Card>
				<CardHeader>
					<CardTitle>Privacy</CardTitle>
					<CardDescription>Usage analytics only. No personal information, no cookies.</CardDescription>
				</CardHeader>

				<CardContent className="flex flex-col gap-4">
					<div className="flex items-center justify-between gap-4">
						<Label htmlFor="allow-analytics">Enable analytics</Label>
						<Switch
							id="allow-analytics"
							name="allowAnalytics"
							checked={allowAnalytics}
							onCheckedChange={setAllowAnalytics}
						/>
					</div>

					<Alert className="text-sm">
						<Heart className="size-4" />
						Enabling analytics allows us to better understand how you use the app and helps us make the app better for
						everyone. We are NOT interested in your personal information, cookies, etc. Only app usage is tracked.
					</Alert>
				</CardContent>
			</Card>

			{/* About */}
			<Card size="sm">
				<CardHeader>
					<CardTitle>About</CardTitle>
				</CardHeader>

				<CardContent>
					<ItemGroup className="gap-2">
						<Item variant="muted" size="sm">
							<ItemContent>
								<ItemTitle>App version</ItemTitle>
							</ItemContent>
							<ItemActions>{appInfo?.appVersion}</ItemActions>
						</Item>
						<Item variant="muted" size="sm">
							<ItemContent>
								<ItemTitle>Tauri version</ItemTitle>
							</ItemContent>
							<ItemActions>{appInfo?.tauriVersion}</ItemActions>
						</Item>
						<Item variant="muted" size="sm">
							<ItemContent>
								<ItemTitle>Identifier</ItemTitle>
							</ItemContent>
							<ItemActions className="font-mono text-xs">{appInfo?.identifier}</ItemActions>
						</Item>
					</ItemGroup>
				</CardContent>
			</Card>
		</div>
	);
};
