import clsx from "clsx";
import { ExternalLink } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { MatchDetailsResponse } from "@/api/schemas/shared";
import { useServices } from "@/lib/services";
import { getMap, calculateStatsForPlayer, getAgent, getRank } from "../utils";
import { Alert } from "@/components/ui/alert";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type Match = {
	mapName: string;
	date: number;
	type: string;
	players: {
		puuid: string;
		name: string;
		tag: string;
		kills: number | undefined;
		deaths: number | undefined;
		assists: number | undefined;
		kd: number;
		hs: number;
		agentName: string;
		agentImg: string;
		team: string;
		partyId: string;
		partyNumber: number;
		rankName: string;
		rankColor: string;
		accountLevel: number;
	}[];
	roundResults: MatchDetailsResponse["roundResults"];
	teams: {
		red: {
			won: boolean;
			score: number;
		};
		blue: {
			won: boolean;
			score: number;
		};
	};
};

export const MatchPage = () => {
	const services = useServices();
	const sharedapi = services?.sharedapi;
	const [error, setError] = useState<string | null>(null);
	const [match, setMatch] = useState<Match>();

	const { matchId } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		if (!matchId) return;

		(async () => {
			const match = await sharedapi?.getMatchDetails(matchId);

			if (!match) {
				setError("Error while loading match details");
				return;
			}

			const puuids = match.players.map((player) => player.subject);
			const names = await sharedapi?.getPlayerNames(puuids);
			const nameMap = new Map(names?.map((n) => [n.Subject, n]));

			const teamRed = match.teams?.find((team) => team.teamId === "Red")!;
			const teamBlue = match.teams?.find((team) => team.teamId === "Blue")!;

			const parties = Object.keys(match.matchInfo.partyRRPenalties || {});

			setMatch({
				mapName: getMap(match.matchInfo.mapId).displayName,
				date: match.matchInfo.gameStartMillis,
				type: match.matchInfo.queueID,
				players: match.players
					.map((player) => {
						const { kd, hs } = calculateStatsForPlayer(player.subject, [match]);
						const { displayIcon: agentImg, displayName: agentName } = getAgent(player.characterId);
						const { rankName, rankColor } = getRank(player.competitiveTier);
						const playerName = nameMap.get(player.subject);

						return {
							puuid: player.subject,
							name: playerName?.GameName || player.gameName || "",
							tag: playerName?.TagLine || player.tagLine || "",
							kills: player.stats?.kills,
							deaths: player.stats?.deaths,
							assists: player.stats?.assists,
							kd: kd,
							hs: hs,
							agentName: agentName || "",
							agentImg: agentImg || "",
							team: player.teamId,
							partyId: player.partyId,
							partyNumber: parties.indexOf(player.partyId)! + 1,
							rankName,
							rankColor,
							accountLevel: player.accountLevel,
						} as Match["players"][0];
					})
					.sort((a, b) => a.team.localeCompare(b.team) || b.kd - a.kd),
				roundResults: match.roundResults,
				teams: {
					red: {
						won: teamRed.won,
						score: teamRed.roundsWon,
					},
					blue: {
						won: teamBlue.won,
						score: teamBlue.roundsWon,
					},
				},
			});
		})();
	}, [matchId, sharedapi]);

if (!match) return <div></div>;

	return (
		<div className="flex flex-col items-center gap-8 p-8">
			{error && <Alert variant="destructive">{error}</Alert>}

			{/* Match Info */}
			<section className="w-full">
				<div className="grid gap-4 lg:grid-cols-3">
					<div className="p-4 border rounded-lg shadow-sm">
						<div className="text-sm text-muted-foreground">Map</div>
						<div className="font-medium">{match.mapName}</div>
					</div>

					<div className="p-4 border rounded-lg shadow-sm">
						<div className="text-sm text-muted-foreground">Mode</div>
						<div className="font-medium">{match.type.toUpperCase()}</div>
					</div>

					<div className="p-4 border rounded-lg shadow-sm">
						<div className="text-sm text-muted-foreground">Date</div>
						<div className="font-medium">{moment(match.date).format("DD/MM/YY")}</div>
					</div>
				</div>
			</section>

			{/* Score */}
			<section className="w-full flex gap-8">
				<div className="p-4 border rounded-lg shadow-sm">
					<div className="text-sm text-muted-foreground">Team Red</div>
					<div className="font-medium text-destructive">{match.teams.red.score}</div>
				</div>
				<div className="p-4 border rounded-lg shadow-sm">
					<div className="text-sm text-muted-foreground">Team Blue</div>
					<div className="font-medium text-primary">{match.teams.blue.score}</div>
				</div>
			</section>

			{/* Player Table */}
			<section className="w-full">
				<Table>
					<TableHeader>
						<TableRow className="text-center">
							<TableHead></TableHead>
							<TableHead>Agent</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Rank</TableHead>
							<TableHead>LVL</TableHead>
							<TableHead>K/D/A</TableHead>
							<TableHead>KD Ratio</TableHead>
							<TableHead>HS%</TableHead>
							<TableHead></TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{match.players.map((player) => (
							<TableRow
								key={player.puuid}
								className={clsx(player.team === "Blue" ? "bg-primary/10" : "bg-destructive/10", "text-center")}
							>
								<TableCell>{player.partyNumber}</TableCell>
								<TableCell className="flex items-center">
									<img src={player.agentImg} className="max-h-8" />
								</TableCell>
								<TableCell className="text-left">
									<span>{player.name}</span>
									<span className="text-xs opacity-50">#{player.tag}</span>
								</TableCell>
								<TableCell>
									<span className="text-xs font-bold" style={{ color: `#${player.rankColor}` }}>
										{player.rankName}
									</span>
								</TableCell>
								<TableCell>{player.accountLevel}</TableCell>
								<TableCell>
									{player.kills} / {player.deaths} / {player.assists}
								</TableCell>
								<TableCell>
									<span className={player.kd >= 1 ? "text-green-600" : "text-red-600"}>{player.kd}</span>
								</TableCell>
								<TableCell>{player.hs}%</TableCell>
								<TableCell>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => navigate(`/player/${player.puuid}?refMatchId=${matchId}`)}
									>
										<ExternalLink data-icon="inline-start" size={16} />
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</section>

		</div>
	);
};
