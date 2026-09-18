import { SquareArrowOutUpRight } from "lucide-react";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { AvoidedPlayer } from "@/interface";
import { useServices } from "@/lib/services";

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
				<ul className="list bg-base-100 rounded-box shadow-md">
					<li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Avoid List</li>

					{players?.map((p) => (
						<li className="list-row flex flex-row items-center justify-between">
							<div className="space-x-4">
								<span>{moment(p.dodgeTimeStamp).format("HH:mm DD/MM/YY")}</span>
								{p.name && p.tag ? (
									<span>
										{p.name}
										<span className="opacity-50 text-xs"> #{p.tag}</span>
									</span>
								) : (
									<span>Name is missing</span>
								)}
							</div>

							<Link to={`/player/${p.puuid}`} className="btn btn-ghost btn-square">
								<SquareArrowOutUpRight />
							</Link>
						</li>
					))}
				</ul>
			</section>
		</div>
	);
};
