import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import clsx from "clsx";
import { ExternalLink, Users } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { PlayerRow } from "../interface";
import { getPartyIconClass, getWinrateColorClass, isSmurf } from "../utils";

export const PlayersTable = ({
	table,
	puuid,
	mapId,
}: {
	table: { [key: PlayerRow["puuid"]]: PlayerRow };
	puuid: string;
	mapId: string;
}) => {
	const navigate = useNavigate();

	const onCopyName = async (event: any) => {
		await writeText(event.currentTarget.textContent);
		toast.success("Copied to clipboard");
	};

	const Row = ({ player }: { player: PlayerRow }) => {
		const isStaff = player.role === "coach" || player.role === "observer";
		const roleLabel = player.role === "coach" ? "Coach" : "Observer";
		const partyMembers = player.partyId
			? Object.values(table).filter((member) => member.partyId === player.partyId)
			: [];

		return (
			<TableRow key={player.puuid} className={clsx(isStaff ? "" : player.enemy ? "bg-red-500/5" : "bg-emerald-500/5", "text-center")}>
				<TableCell>
					{isStaff ? (
						<span className="text-muted-foreground">{roleLabel}</span>
					) : (
						<div className="flex items-center gap-2">
							<img src={player.agentImage || undefined} alt={player.agentName ?? ""} className="h-6" draggable={false} />
							<span>{player.agentName}</span>
						</div>
					)}
				</TableCell>
				<TableCell className="text-start">
					{player.name === "" ? null : player.puuid === puuid ? (
						<span>You</span>
					) : (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>
									<Button variant="ghost" size="sm" className="h-auto px-1" onClick={onCopyName}>
										<span>{player.name}</span>
										<span className="text-muted-foreground">
											#<span>{player.tag}</span>
										</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent>Click to copy</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
				</TableCell>
				<TableCell>
					<span style={{ color: `#${player.currentRankColor}` }}>
						{player.currentRank} (RR {player.currentRR})
					</span>
				</TableCell>
				<TableCell className="flex flex-col">
					<span style={{ color: `#${player.rankPeakColor}` }}>{player.rankPeak}</span>
					{player.rankPeakDate ? (
						<span className="text-xs text-muted-foreground">({player.rankPeakDate.toLocaleDateString()})</span>
					) : null}
				</TableCell>
				<TableCell>
					<span>{player.accountLevel}</span>
				</TableCell>
				<TableCell>
					<span className={clsx(isStaff ? null : !player.kd ? null : player.kd >= 1 ? "text-emerald-500" : "text-red-500")}>
						{isStaff ? "—" : player.kd}
					</span>
				</TableCell>
				<TableCell>
					{isStaff ? (
						<span>—</span>
					) : (
						<span>
							{player.hs}
							{player.hs ? "%" : null}
						</span>
					)}
				</TableCell>
				<TableCell>
					<span>{isStaff ? "—" : player.adr}</span>
				</TableCell>
				<TableCell>
					{isStaff ? (
						<span>—</span>
					) : (
						<span
							className={clsx(
								player.lastGameResult === "won"
									? "text-emerald-500"
									: player.lastGameResult === "loss"
										? "text-red-500"
										: null,
							)}
						>
							{player.lastGameScore}
							{player.lastGameMMRDiff && player.lastGameScore
								? ` (${player.lastGameMMRDiff > 0 ? `+${player.lastGameMMRDiff}` : player.lastGameMMRDiff})`
								: null}
						</span>
					)}
				</TableCell>
				<TableCell>
					{isStaff ? (
						<span>—</span>
					) : (
						(() => {
							const streak = player.streak || 0;
							return (
								<span className={clsx(streak > 0 ? "text-emerald-500" : streak < 0 ? "text-red-500" : undefined)}>
									{Math.abs(streak)}
								</span>
							);
						})()
					)}
				</TableCell>
				<TableCell>
					{isStaff ? (
						<span>—</span>
					) : (
						<span className={clsx(player.winrate !== undefined && getWinrateColorClass(player.winrate))}>
							{player.winrate !== undefined ? `${player.winrate}%` : null}
						</span>
					)}
				</TableCell>
				<TableCell>
					{isStaff ? (
						<span>—</span>
					) : (
						<div className="flex gap-2">
							{player.bestAgents?.map((agent) => (
								<TooltipProvider key={agent.agentId}>
									<Tooltip>
										<TooltipTrigger>
											<div className={clsx("rounded-md p-1", agent.avgKd >= 1 ? "bg-emerald-500/25" : "bg-red-500/25")}>
												<img className="w-6 rounded-md" src={agent.agentUrl} alt={agent.agentName} />
											</div>
										</TooltipTrigger>
										<TooltipContent className="flex flex-col items-start gap-1">
											<span>Avg Kills: {agent.avgKills}</span>
											<span>Avg Deaths: {agent.avgDeaths}</span>
											<span>Avg K/D: {agent.avgKd}</span>
											<span>Games Played: {agent.games}</span>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							))}
						</div>
					)}
				</TableCell>
				<TableCell>
					{isStaff ? null : (
						<div className="flex flex-wrap gap-1 justify-center">
							{isSmurf(player) && (
								<Badge variant="secondary" className="text-xs">
									Possible Smurf
								</Badge>
							)}
							{player.dodge && (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger>
											<Badge variant="secondary" className="text-xs">
												Avoid
											</Badge>
										</TooltipTrigger>
										<TooltipContent>This player is in your avoid list. Check player profile to learn more</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							)}
							{player.hasGunBuddy && (
								<Badge variant="secondary" className="text-xs">
									Riot Buddy
								</Badge>
							)}
						</div>
					)}
				</TableCell>
				<TableCell>
					{player.inParty ? (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>
									<Users size={14} className={clsx(getPartyIconClass(player.partyId) ?? "text-muted-foreground", "hover:text-foreground cursor-pointer")} />
								</TooltipTrigger>
								<TooltipContent className="flex flex-col items-start gap-1">
									<p className="mb-2">Party #{player.partyId}</p>
									{partyMembers.map((member) => (
										<p key={member.puuid}>
											{member.name || "Unknown"}
											{member.tag ? `#${member.tag}` : ""}
										</p>
									))}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					) : null}
				</TableCell>
				<TableCell>
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label={`Open ${player.name}`}
						onClick={() => navigate(`/player/${player.puuid}?mapId=${mapId}&agentId=${player.agentId}`)}
					>
						<ExternalLink />
					</Button>
				</TableCell>
			</TableRow>
		);
	};

	if (!Object.keys(table).length) return null;

	const players = Object.values(table);
	const combatants = players.filter((player) => player.role !== "coach" && player.role !== "observer");
	const staff = players.filter((player) => player.role === "coach" || player.role === "observer");

	return (
		<Table className="text-xs">
			<TableHeader>
				<TableRow className="text-center">
					<TableHead>Agent</TableHead>
					<TableHead>Player</TableHead>
					<TableHead>Rank</TableHead>
					<TableHead>Peak Rank</TableHead>
					<TableHead>LVL</TableHead>
					<TableHead>K/D</TableHead>
					<TableHead>HS%</TableHead>
					<TableHead>ADR</TableHead>
					<TableHead>Last Game</TableHead>
					<TableHead>Streak</TableHead>
					<TableHead>Winrate</TableHead>
					<TableHead>Top Agents on Current Map</TableHead>
					<TableHead>Note</TableHead>
					<TableHead></TableHead>
					<TableHead></TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{combatants
					.filter((player) => !player.enemy)
					.sort((a, b) => (b.kd || 1) - (a.kd || 0))
					.map((player) => (
						<Row player={player} key={player.puuid} />
					))}
			</TableBody>

			<TableBody>
				{combatants
					.filter((player) => player.enemy)
					.sort((a, b) => (b.kd || 1) - (a.kd || 0))
					.map((player) => (
						<Row player={player} key={player.puuid} />
					))}
			</TableBody>

			{staff.length > 0 && (
				<TableBody>
					{staff.map((player) => (
						<Row player={player} key={player.puuid} />
					))}
				</TableBody>
			)}
		</Table>
	);
};
