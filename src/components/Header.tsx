import { relaunch } from "@tauri-apps/plugin-process";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { useAtom } from "jotai";
import { ChevronLeft, Download, RefreshCw, Settings, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useLongPress } from "use-long-press";
import atoms from "../utils/atoms";
import { URLS } from "../utils/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export const Header = () => {
	const [update, setUpdate] = useState<Update | null>();
	const [puuid] = useAtom(atoms.puuid);
	const [party] = useAtom(atoms.party);
	const [prefetching] = useAtom(atoms.prefetching);

	const location = useLocation();
	const navigate = useNavigate();

	const checkForUpdate = useCallback(async () => {
		try {
      const update = await check();
			console.log('update', update)
			if (update) {
				setUpdate(update);
			}
		} catch (err) {
			console.error("Update check failed:", err);
		}
	}, []);

	async function onUpdate() {
		let downloaded = 0;
		let contentLength = 0;

		await update?.downloadAndInstall((event) => {
			switch (event.event) {
				case "Started":
					contentLength = event.data.contentLength as number;
					console.log(`started downloading ${event.data.contentLength} bytes`);
					break;
				case "Progress":
					downloaded += event.data.chunkLength;
					console.log(`downloaded ${downloaded} from ${contentLength}`);
					break;
				case "Finished":
					console.log("download finished");
					break;
			}
		});

		await relaunch();
	}

	const handlers = useLongPress(() => {
		navigate("/test");
	});

	useEffect(() => {
		checkForUpdate();
	}, [checkForUpdate]);

if (location.pathname === "/")
		return update ? (
			<Button variant="secondary" className="absolute bottom-8 right-8 z-10" onClick={onUpdate}>
				<Download data-icon="inline-start" size={16} /> Update available
			</Button>
		) : null;

	return (
		<header className="w-full p-2 flex flex-row items-center gap-4 px-4">
			{location.pathname === "/dashboard" ? (
				<>
					<a className="font-bold" href="/">
						VTJS
					</a>
					<Badge variant="secondary" className="cursor-pointer" {...handlers()}>
						Beta
					</Badge>

					<div className="ml-auto flex flex-row items-center gap-2">
						{update && (
							<Button variant="secondary" size="sm" onClick={onUpdate}>
								<Download data-icon="inline-start" size={16} /> Update available
							</Button>
						)}
						{prefetching && (
							<Button variant="secondary" size="sm" disabled>
								<RefreshCw data-icon="inline-start" size={16} className="animate-spin" /> Fetching player data
							</Button>
						)}

						<div className="flex -space-x-6">
							{party.map((p) => (
								<Avatar key={p.puuid} className="size-8">
									<AvatarImage src={`${URLS.VALORANT_API_BASE_URL}/playercards/${p.playerCardId}/displayicon.png`} />
								</Avatar>
							))}
						</div>

						<Button variant="secondary" size="sm" onClick={() => navigate(`/player/${puuid}`)}>
							<User data-icon="inline-start" size={20} /> My Profile
						</Button>
						<Button variant="secondary" size="icon" onClick={() => navigate("/settings")}>
							<Settings size={20} />
						</Button>
					</div>
				</>
			) : location.pathname === "/settings" ? (
				<>
					<Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
						<ChevronLeft data-icon="inline-start" size={16} />
					</Button>

					<span className="font-bold">Settings</span>
				</>
			) : location.pathname.startsWith("/player/") ? (
				<>
					<Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
						<ChevronLeft data-icon="inline-start" size={16} />
					</Button>

					<span className="font-bold">Player Details</span>
				</>
			) : location.pathname.startsWith("/match/") ? (
				<>
					<Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
						<ChevronLeft data-icon="inline-start" size={16} />
					</Button>

					<span className="font-bold">Match Details</span>
				</>
			) : location.pathname.startsWith("/test") ? (
				<>
					<Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
						<ChevronLeft data-icon="inline-start" size={16} />
					</Button>

					<span className="font-bold">Test</span>
				</>
			) : location.pathname.startsWith("/avoid-list") ? (
				<Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
					<ChevronLeft data-icon="inline-start" size={16} />
				</Button>
			) : null}
		</header>
	);
};
