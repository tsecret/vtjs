import clsx from "clsx";
import { useAtomValue } from "jotai";
import { ChevronsDown, ChevronsUp, ExternalLink } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import type { MatchDetailsResponse } from "@/api/schemas/shared";
import { Alert } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyTitle } from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { BestAgent, BestMaps, BestServer, Rank } from "@/interface/utils.interface";
import { useServices } from "@/lib/services";
import { THRESHOLDS } from "@/utils/constants";
import { findPlayerInMatch } from "@/utils/playerLookup";
import type { Result } from "../interface";
import {
	calculateBestAgents,
	calculateBestMaps,
	calculateBestServers,
	calculateRanking,
	calculateStatsForPlayer,
	getAgent,
	getMap,
	getMatchResult,
	getRank,
	getWinrateColorClass,
} from "../utils";
import atoms from "../utils/atoms";

interface Row {
	matchId: string;
	mapName: string;
	kills: number;
	deaths: number;
	assists: number;
	hs: number;
	date: Date;
	result: Result;
	score: string;
	mmrUpdate: number | null;
	agentId: string | null;
	agentName: string | null;
	agentImage: string | null;
	rankBefore: Rank | null;
	rankAfter: Rank | null;
}

type PlayerCard = {
	name: string;
	tag: string;
	currentRank: string;
	currentTier: number;
	currentRR: number;
	currentRankColor: string;
	peakRank: string;
	peakRankColor: string;
	dodge?: boolean;
	dodgeTimestamp?: number;
};

type PlayerStats = {
	hs: number;
	kd: number;
	adr: number;
};

type ChartData = {
	i: number;
	kills: number;
	deaths: number;
	kd: number;
	adr: number;
	hs: number;
}[];

export const ProfilePage = () => {
	const services = useServices();
	const sharedapi = services?.sharedapi;
	const cache = services?.cache;

	const [error, setError] = useState<string | null>(null);

	const ownPuuid = useAtomValue(atoms.puuid);

	const [table, setTable] = useState<Row[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [playerCard, setPlayerCard] = useState<PlayerCard>();
	const [playerStats, setPlayerStats] = useState<PlayerStats>();
	const [accountLevel, setAccountLevel] = useState<number>();
	const [bestAgents, setBestAgents] = useState<(BestAgent & { agentName: string; agentUrl: string })[]>();
	const [bestMaps, setBestMaps] = useState<(BestMaps & { mapName: string; mapUrl: string })[]>();
	const [bestServers, setBestServers] = useState<BestServer[]>();

	const [chartData, setChartData] = useState<ChartData>();
	// const [, setChartType] = useState<ChartType>('kills/deaths')

	const { puuid } = useParams();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const refMatchId = searchParams.get("refMatchId");
	const refMapId = searchParams.get("mapId");
	const refAgentId = searchParams.get("agentId");

	const onDodgeChange = async (state: boolean) => {
		if (!playerCard) return;

		const res = await cache?.execute(
			"INSERT into players (puuid, dodge, dodgeTimestamp) VALUES ($1, $2, $3) ON CONFLICT(puuid) DO UPDATE SET dodge = $2, dodgeTimestamp = $3 WHERE puuid = $1",
			[puuid, state, Date.now()],
		);

		if (res?.rowsAffected === 1)
			setPlayerCard({
				...playerCard,
				dodge: state,
				dodgeTimestamp: state ? Date.now() : 0,
			});
	};

	useEffect(() => {
		(async () => {
			if (!puuid || !sharedapi) return;
			setLoading(true);

			const table: Row[] = [];
			const _chartData: ChartData = [];
			let accountLevel: number = 0;

			try {
				const { History } = await sharedapi.getPlayerMatchHistory(puuid);
				const { Matches: mmrUpdates } = await sharedapi.getCompetitiveUpdates(puuid);

				const matches: MatchDetailsResponse[] = [];

				for (const match of History) {
					matches.push(await sharedapi.getMatchDetails(match.MatchID));
				}

				const { hs: avgHS, adr: avgAdr, kd: avgKd } = calculateStatsForPlayer(puuid, matches);

				for (const i in matches) {
					const match = matches[i];
					const mmrUpdate = mmrUpdates.find((update) => update.MatchID === match.matchInfo.matchId);

					const player = findPlayerInMatch(match, puuid);
					if (!player) continue;

					const { uuid: agentId, displayName: agentName, killfeedPortrait: agentImage } = getAgent(player.characterId);

					const { result, score } = getMatchResult(player.subject, match);

					const { kills, deaths, assists, hs, adr, kd } = calculateStatsForPlayer(puuid, [match]);

					const rankBefore = mmrUpdate?.TierBeforeUpdate ? getRank(mmrUpdate?.TierBeforeUpdate) : null;
					const rankAfter = mmrUpdate?.TierAfterUpdate ? getRank(mmrUpdate?.TierAfterUpdate) : null;

					if (!accountLevel) accountLevel = player.accountLevel;

					_chartData.push({
						i: parseInt(i, 10),
						kills,
						deaths,
						kd,
						adr,
						hs,
					});

					table.push({
						matchId: match.matchInfo.matchId,
						mapName: getMap(match.matchInfo.mapId).displayName,
						kills,
						deaths,
						assists,
						hs,
						date: new Date(match.matchInfo.gameStartMillis),
						result,
						score,
						mmrUpdate: mmrUpdate?.RankedRatingEarned || null,
						agentId,
						agentName,
						agentImage,
						rankBefore,
						rankAfter,
					});
				}

				// Top Agents
				const bestAgents = calculateBestAgents(puuid, matches).map((agent) => {
					const { displayName: agentName, displayIcon: agentUrl } = getAgent(agent.agentId);
					return { ...agent, agentName, agentUrl };
				});

				// Top Maps
				const bestMaps = calculateBestMaps(puuid, matches).map((map) => {
					const { displayName: mapName, listViewIcon: mapUrl } = getMap(map.mapId);
					return { ...map, mapName, mapUrl };
				});

				// Top Servers
				const bestServers = calculateBestServers(puuid, matches);

				setBestAgents(bestAgents);
				setBestMaps(bestMaps);
				setBestServers(bestServers);
				setTable(table);
				setLoading(false);
				setAccountLevel(accountLevel);
				setChartData(_chartData.reverse());
				setPlayerStats({
					hs: avgHS,
					adr: avgAdr,
					kd: avgKd,
				});
			} catch (err) {
				console.error(err);
				setError(`Faled to load matches:${err}`);
			}
		})();
	}, [puuid, sharedapi, cache]);

	useEffect(() => {
		if (!sharedapi || !puuid) return;

		(async () => {
			const [{ GameName, TagLine }] = await sharedapi.getPlayerNames([puuid]);

			const mmr = await sharedapi?.getPlayerMMR(puuid);
			const { currentRank, currentRR, peakRank } = calculateRanking(mmr);

			const player = await cache
				?.select<any[]>("SELECT * from players WHERE puuid = ?", [puuid])
				.then((players) => players[0]);

			setPlayerCard({
				name: GameName,
				tag: TagLine,
				currentRank: getRank(currentRank).rankName,
				currentTier: currentRank,
				currentRR,
				currentRankColor: getRank(currentRank).rankColor,
				peakRank: getRank(peakRank).rankName,
				peakRankColor: getRank(peakRank).rankColor,
				dodge: player?.dodge,
				dodgeTimestamp: player?.dodgeTimestamp,
			});
		})();
	}, [puuid, sharedapi, cache]);

	if (error)
		return (
			<div className="flex flex-row justify-center gap-4">
				<Alert variant="destructive">{error}</Alert>
			</div>
		);

	if (loading)
		return (
			<div className="flex flex-col items-center gap-4">
				<p className="flex items-center gap-2">
					<Spinner className="size-4" /> Loading matches
				</p>
				<Alert className="max-w-md text-center text-xs">
					If loading takes too long, you probably hit the Riot's rate limit and matches will load in a minute or so
				</Alert>
			</div>
		);

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col items-center p-4">
			{/* Player Data */}
			<div className="flex flex-row gap-4 w-full">
				<Card className="shadow-xl p-6 rounded-2xl flex-1 space-y-2">
					<CardHeader>
						<CardTitle className="text-2xl font-bold flex items-center gap-2">
							{playerCard?.name}
							<span className="text-muted-foreground">#{playerCard?.tag}</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-muted-foreground">Account Level: {accountLevel}</p>

						<div className="flex items-center justify-between">
							<Badge variant="secondary" className="text-base" style={{ color: `#${playerCard?.currentRankColor}` }}>
								{playerCard?.currentRank}
							</Badge>
							<p className="text-sm text-muted-foreground">
								Peak: <span style={{ color: `#${playerCard?.peakRankColor}` }}>{playerCard?.peakRank}</span>
							</p>
						</div>

						<div>
							<p className="text-sm text-muted-foreground mb-1">Rank Progress</p>
							<Progress
								value={playerCard?.currentRR ?? 0}
								max={
									playerCard?.currentTier && playerCard?.currentTier >= 24
										? THRESHOLDS.IMMORTAL_RR_CAP
										: THRESHOLDS.DIAMOND_AND_BELOW_RR_CAP
								}
								className="w-full"
							/>
							<p className="text-xs text-muted-foreground mt-1">
								{playerCard?.currentRR} /{" "}
								{playerCard?.currentTier && playerCard?.currentTier >= 24
									? THRESHOLDS.IMMORTAL_RR_CAP
									: THRESHOLDS.DIAMOND_AND_BELOW_RR_CAP}
							</p>
						</div>

						<Card size="sm">
							<CardContent className="grid gap-4 sm:grid-cols-3">
								<div>
									<div className="text-sm text-muted-foreground">Total Matches</div>
									<div className="font-medium text-xl">{table.length}</div>
								</div>

								<div>
									<div className="text-sm text-muted-foreground">Wins / Loss</div>
									<div className="font-medium">
										{table.filter((match) => match.result === "won").length} /{" "}
										{table.filter((match) => match.result === "loss").length}
									</div>
								</div>

								<div>
									<div className="text-sm text-muted-foreground">Winrate %</div>
									<div className="font-medium">
										{table.length
											? ((table.filter((match) => match.result === "won").length / table.length) * 100).toFixed(0)
											: 0}
										%
									</div>
								</div>
							</CardContent>
						</Card>

						<Card size="sm">
							<CardContent className="grid gap-4 sm:grid-cols-3">
								<div>
									<div className="text-sm text-muted-foreground">K/D</div>
									<div
										className={clsx(
											"font-medium text-xl",
											playerStats && playerStats?.kd >= 1 ? "text-emerald-500" : "text-red-500",
										)}
									>
										{playerStats?.kd}
									</div>
								</div>

								<div>
									<div className="text-sm text-muted-foreground">Average Damage / Round</div>
									<div
										className={clsx(
											"font-medium text-xl",
											playerStats && playerStats?.adr >= 150 ? "text-emerald-500" : "text-red-500",
										)}
									>
										{playerStats?.adr}
									</div>
								</div>

								<div>
									<div className="text-sm text-muted-foreground">Headshot %</div>
									<div className="font-medium text-xl">{playerStats?.hs}%</div>
								</div>
							</CardContent>
						</Card>
					</CardContent>
				</Card>

				{puuid !== ownPuuid && (
					<div className="flex flex-col gap-4 p-4 rounded-md max-w-64 border bg-card">
						<p className="text-sm">
							If this player ruined the game, trolled or played like dogshit, you can add this animal to your avoid list
						</p>
						<p className="text-xs text-muted-foreground">
							This avoid list is saved locally, meaning you still have a chance to queue with this player, but the
							warning will be displayed next to their name
						</p>

						{playerCard?.dodgeTimestamp ? (
							<p className="text-xs text-muted-foreground">
								Dodge from {moment(playerCard.dodgeTimestamp).format("DD-MM-YYYY")}
							</p>
						) : null}

						<Button variant="secondary" size="sm" onClick={() => onDodgeChange(!playerCard?.dodge)}>
							{playerCard?.dodge ? "Remove from Avoid list" : "Avoid Player"}
						</Button>
					</div>
				)}
			</div>

			{chartData?.length ? (
				<>
					<Separator className="w-full my-8" />

					{/* Matches Table */}
					<section className="overflow-x-auto w-full">
						<h3 className="font-bold mb-4">Player Match History</h3>

						<Table>
							<TableHeader>
								<TableRow className="text-center">
									<TableHead>Date</TableHead>
									<TableHead>Agent</TableHead>
									<TableHead>Map</TableHead>
									<TableHead>Rank</TableHead>
									<TableHead>K / D / A</TableHead>
									<TableHead>Result</TableHead>
									<TableHead>Score</TableHead>
									<TableHead>HS%</TableHead>
									<TableHead></TableHead>
								</TableRow>
							</TableHeader>

							<TableBody>
								{table.map((match) => (
									<TableRow
										key={match.matchId}
										className={clsx(
											match.result === "won"
												? "bg-emerald-500/10"
												: match.result === "loss"
													? "bg-red-500/10"
													: "bg-white/5",
											"text-center",
											refMatchId === match.matchId && "ring-2 ring-primary",
										)}
									>
										<TableCell className="text-left">
											{moment(match.date).format("HH:mm DD/MM/YY")}{" "}
											<span className="opacity-25">({moment(match.date).fromNow()})</span>
										</TableCell>
										<TableCell>
											<img src={match.agentImage || undefined} alt={match.agentName ?? ""} className="max-h-6" />
										</TableCell>
										<TableCell>{match.mapName}</TableCell>
										<TableCell>
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger>
														<div className="flex items-center gap-2">
															<img className="w-6 mr-2" src={match.rankBefore?.rankImg} alt={match.rankBefore?.rankName} />
															<span
																className={clsx(
																	match.mmrUpdate ? (match.mmrUpdate > 0 ? "text-emerald-500" : "text-red-500") : null,
																)}
															>
																{match.mmrUpdate
																	? match.mmrUpdate > 0
																		? `+${match.mmrUpdate}`
																		: match.mmrUpdate
																	: null}
															</span>
															{match.rankBefore &&
																match.rankAfter &&
																(match.rankAfter?.tier > match.rankBefore?.tier ? (
																	<ChevronsUp size={16} />
																) : match.rankAfter?.tier < match.rankBefore?.tier ? (
																	<ChevronsDown size={16} />
																) : null)}
														</div>
													</TooltipTrigger>
													<TooltipContent>{match.rankBefore?.rankName}</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</TableCell>
										<TableCell>
											{match.kills} / {match.deaths} / {match.assists}
										</TableCell>
										<TableCell
											className={clsx(
												match.result === "won" ? "text-emerald-500" : match.result === "loss" ? "text-red-500" : null,
											)}
										>
											{match.result === "won" ? "Win" : match.result === "loss" ? "Loss" : "Draw"}
										</TableCell>
										<TableCell
											className={clsx(
												match.result === "won" ? "text-emerald-500" : match.result === "loss" ? "text-red-500" : null,
											)}
										>
											{match.score}
										</TableCell>
										<TableCell>{match.hs ? `${match.hs}%` : null}</TableCell>
										<TableCell>
											<Button
												variant="ghost"
												size="icon-sm"
												aria-label="Open match"
												onClick={() => navigate(`/match/${match.matchId}`)}
											>
												<ExternalLink />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</section>

					<Separator className="w-full my-8" />

					{/* Best Agents Table */}
					<section className="flex flex-col gap-8 lg:flex-row lg:gap-8 w-full">
						<div className="flex min-w-0 flex-1 flex-col gap-4">
							<h3 className="font-bold mb-4">Agent Performance</h3>

							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Agent</TableHead>
										<TableHead className="text-center">Matches</TableHead>
										<TableHead className="text-right">KD</TableHead>
										<TableHead className="text-right">HS%</TableHead>
										<TableHead className="text-right">ADR</TableHead>
										<TableHead className="text-right">W / L</TableHead>
										<TableHead className="text-right">WR%</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{bestAgents?.map((agent) => (
										<TableRow
											key={agent.agentId}
											className={clsx(refAgentId === agent.agentId && "ring-2 ring-primary")}
										>
											<TableCell className="flex items-center gap-2">
												<Avatar className="size-6">
													<AvatarImage src={agent.agentUrl} alt={agent.agentName} />
													<AvatarFallback className="text-[0.6rem]">{agent.agentName?.slice(0, 1)}</AvatarFallback>
												</Avatar>
												<span className="whitespace-nowrap">{agent.agentName}</span>
											</TableCell>
											<TableCell className="text-center">{agent.matches}</TableCell>
											<TableCell className={clsx("text-right", agent.kd >= 1 ? "text-green-600" : "text-red-600")}>
												{agent.kd}
											</TableCell>
											<TableCell className="text-right">{agent.hs}%</TableCell>
											<TableCell className={clsx("text-right", agent.adr >= 150 ? "text-green-600" : "text-red-600")}>
												{agent.adr}
											</TableCell>
											<TableCell className="flex justify-end gap-1">
												<span className="text-green-600">{agent.wins}</span>
												<span className="opacity-50">-</span>
												<span className="text-red-600">{agent.losses}</span>
											</TableCell>
											<TableCell className={clsx("text-right", getWinrateColorClass(agent.winrate))}>
												{agent.winrate}%
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						<div className="flex min-w-0 flex-1 flex-col gap-4">
							<h3 className="font-bold mb-4">Map Performance</h3>

							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Map</TableHead>
										<TableHead className="text-center">Matches</TableHead>
										<TableHead className="text-right">KD</TableHead>
										<TableHead className="text-right">HS%</TableHead>
										<TableHead className="text-right">ADR</TableHead>
										<TableHead className="text-right">W / L</TableHead>
										<TableHead className="text-right">WR%</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{bestMaps?.map((map) => (
										<TableRow key={map.mapId} className={clsx(refMapId === map.mapId && "ring-2 ring-primary")}>
											<TableCell>
												<div className="relative h-6 w-20">
													<img
														src={map.mapUrl}
														alt={map.mapName}
														className="h-full w-full rounded object-cover blur-[1px] brightness-50"
														draggable={false}
													/>
													<span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
														{map.mapName}
													</span>
												</div>
											</TableCell>
											<TableCell className="text-center">{map.matches}</TableCell>
											<TableCell className={clsx("text-right", map.kd >= 1 ? "text-green-600" : "text-red-600")}>
												{map.kd}
											</TableCell>
											<TableCell className="text-right">{map.hs}%</TableCell>
											<TableCell className={clsx("text-right", map.adr >= 150 ? "text-green-600" : "text-red-600")}>
												{map.adr}
											</TableCell>
											<TableCell className="flex justify-end gap-1">
												<span className="text-green-600">{map.wins}</span>
												<span className="opacity-50">-</span>
												<span className="text-red-600">{map.losses}</span>
											</TableCell>
											<TableCell className={clsx("text-right", getWinrateColorClass(map.winrate))}>
												{map.winrate}%
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</section>

					<Separator className="w-full my-8" />

					{/* Server Performance Table */}
					<section className="w-full">
						<h3 className="font-bold mb-4">Server Performance</h3>

						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Server</TableHead>
									<TableHead className="text-center">Matches</TableHead>
									<TableHead className="text-right">KD</TableHead>
									<TableHead className="text-right">HS%</TableHead>
									<TableHead className="text-right">ADR</TableHead>
									<TableHead className="text-right">W / L</TableHead>
									<TableHead className="text-right">WR%</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{bestServers?.map((server) => (
									<TableRow key={server.serverName}>
										<TableCell className="flex items-center gap-2">
											<span className="capitalize">{server.serverName}</span>
										</TableCell>
										<TableCell className="text-center">{server.matches}</TableCell>
										<TableCell className={clsx("text-right", server.kd >= 1 ? "text-green-600" : "text-red-600")}>
											{server.kd}
										</TableCell>
										<TableCell className="text-right">{server.hs}%</TableCell>
										<TableCell className={clsx("text-right", server.adr >= 150 ? "text-green-600" : "text-red-600")}>
											{server.adr}
										</TableCell>
										<TableCell className="flex justify-end gap-1">
											<span className="text-green-600">{server.wins}</span>
											<span className="opacity-50">-</span>
											<span className="text-red-600">{server.losses}</span>
										</TableCell>
										<TableCell className={clsx("text-right", getWinrateColorClass(server.winrate))}>
											{server.winrate}%
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</section>
				</>
			) : (
				<Empty className="my-10">
					<EmptyTitle>No competitive matches played</EmptyTitle>
				</Empty>
			)}
		</div>
	);
};
