import { relaunch } from "@tauri-apps/plugin-process";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { useAtom } from "jotai";
import { ChevronLeft, Download, RefreshCw, Settings, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import atoms from "../utils/atoms";
import { URLS } from "../utils/constants";

const SUBPAGES = [
	{ path: "/settings", title: "Settings" },
	{ path: "/player/", title: "Player Details" },
	{ path: "/match/", title: "Match Details" },
	{ path: "/avoid-list", title: "Avoid List" },
];

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
			console.log("update", update);
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

	useEffect(() => {
		checkForUpdate();
	}, [checkForUpdate]);

	if (location.pathname === "/")
		return update ? (
			<Button variant="secondary" className="absolute right-8 bottom-8 z-10" onClick={onUpdate}>
				<Download data-icon="inline-start" /> Update available
			</Button>
		) : null;

	const isDashboard = location.pathname === "/dashboard";
	const subPage = SUBPAGES.find((page) => location.pathname.startsWith(page.path));

	return (
		<header className="flex w-full flex-row items-center gap-3 px-4 py-2">
			{isDashboard ? (
				<>
					<a className="text-lg font-bold tracking-tight" href="/">
						VTJS
					</a>

					<div className="ml-auto flex flex-row items-center gap-2">
						{update && (
							<Button variant="secondary" onClick={onUpdate}>
								<Download data-icon="inline-start" /> Update available
							</Button>
						)}
						{prefetching && (
							<Button variant="secondary" disabled>
								<RefreshCw data-icon="inline-start" className="animate-spin" /> Fetching player data
							</Button>
						)}

						<AvatarGroup>
							{party.slice(0, 4).map((p) => (
								<Avatar key={p.puuid}>
									<AvatarImage src={`${URLS.VALORANT_API_BASE_URL}/playercards/${p.playerCardId}/displayicon.png`} />
									<AvatarFallback className="text-xs">?</AvatarFallback>
								</Avatar>
							))}
							{party.length > 4 && <AvatarGroupCount>+{party.length - 4}</AvatarGroupCount>}
						</AvatarGroup>

						<Button variant="secondary" onClick={() => navigate(`/player/${puuid}`)}>
							<User data-icon="inline-start" /> My Profile
						</Button>
						<Button variant="secondary" size="icon" aria-label="Settings" onClick={() => navigate("/settings")}>
							<Settings />
						</Button>
					</div>
				</>
			) : subPage ? (
				<>
					<Button variant="ghost" size="icon" aria-label="Back" onClick={() => navigate(-1)}>
						<ChevronLeft />
					</Button>
					<span className="font-bold">{subPage.title}</span>
				</>
			) : null}
		</header>
	);
};
