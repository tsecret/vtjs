import { SquareArrowOutUpRight } from "lucide-react";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { AvoidedPlayer } from "@/interface";
import { useServices } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";

export const AvoidListPage = () => {
	const services = useServices();
	const cache = services?.cache;
	const sharedapi = services?.sharedapi;
	const [players, setPlayers] = useState<(AvoidedPlayer & { name: string; tag: string })[]>();

	const cacheRef = useRef(cache);
	cacheRef.current = cache;
	const sharedapiRef = useRef(sharedapi);
	sharedapiRef.current = sharedapi;

	useEffect(() => {
		(async () => {
			const list = (await cacheRef.current?.select<AvoidedPlayer[]>("SELECT * FROM players")) || [];
			const names = await sharedapiRef.current?.getPlayerNames(list.map((p) => p.puuid));

			setPlayers(
				list.map((p) => {
					const name = names?.find((name) => name.Subject === p.puuid);

					return {
						...p,
						name: name?.GameName || "",
						tag: name?.TagLine || "",
					};
				}),
			);
		})();
	}, []);

	return (
		<div>
			<section className="max-w-1/2 m-auto">
			<Card>
				<CardHeader className="border-b pb-2">
					<CardTitle className="text-xs font-normal tracking-wide opacity-60">Avoid List</CardTitle>
				</CardHeader>

				{players?.map((p) => (
					<Item key={p.puuid} className="border-b last:border-0">
						<ItemContent>
							<ItemTitle>
								{p.name && p.tag ? (
									<>
										{p.name}
										<span className="text-xs opacity-50"> #{p.tag}</span>
									</>
								) : (
									<span className="text-muted-foreground">Name is missing</span>
								)}
							</ItemTitle>
							<ItemDescription className="text-xs">{moment(p.dodgeTimeStamp).format("HH:mm DD/MM/YY")}</ItemDescription>
						</ItemContent>
						<ItemActions>
							<Link to={`/player/${p.puuid}`}>
								<Button variant="ghost" size="icon" className="h-8 w-8">
									<SquareArrowOutUpRight size={14} />
								</Button>
							</Link>
						</ItemActions>
					</Item>
				))}
			</Card>
			</section>
		</div>
	);
};
