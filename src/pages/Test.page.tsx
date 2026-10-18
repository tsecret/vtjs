import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useServices } from "@/lib/services";

/** VITE_FROM_JSON=true serves every request from src/mocks instead of the Riot client. */
const IS_MOCK_MODE = import.meta.env.VITE_FROM_JSON === "true";

export const TestPage = () => {
	const services = useServices();
	const cache = services?.cache;

	useEffect(() => {
		(async () => {
			console.log("Loading requests");
			const requests = await cache?.select("SELECT endpoint, ttl from requests", [Date.now()]);
			console.log("requests", requests);
		})();
	}, [cache]);

	const emitPresence = (state: "MENUS" | "PREGAME" | "INGAME") => {
		const mock = (window as unknown as { vtjsMock?: { presence: (o: { sessionLoopState: string }) => void } }).vtjsMock;
		mock?.presence({ sessionLoopState: state });
	};

	return (
		<div className="p-4 flex flex-col gap-2">
			{IS_MOCK_MODE && (
				<section className="flex flex-row items-center gap-2">
					<span className="text-xs text-muted-foreground">Mock game state:</span>
					<Button size="sm" variant="outline" onClick={() => emitPresence("MENUS")}>
						Menus
					</Button>
					<Button size="sm" variant="outline" onClick={() => emitPresence("PREGAME")}>
						Agent select
					</Button>
					<Button size="sm" variant="outline" onClick={() => emitPresence("INGAME")}>
						In game
					</Button>
				</section>
			)}
		</div>
	);
};
