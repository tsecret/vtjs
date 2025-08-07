import { localDataDir } from '@tauri-apps/api/path';
import { readTextFile } from '@tauri-apps/plugin-fs';
import base64 from 'base-64';
import lockfile from '../../lockfile.json';
import agents from '../assets/agents.json';
import maps from '../assets/maps.json';
import ranks from '../assets/ranks.json';
import seasons from '../assets/seasons.json';

import type { Agent, AgentStats, CurrentGameMatchResponse, CurrentPreGameMatchResponse, MatchDetailsResponse, PlayerMMRResponse, PlayerRow } from '../interface';

export const sleep = (ms: number = 2000) => new Promise(resolve => setTimeout(resolve, ms));

export const isMac = () => navigator.platform.toUpperCase().indexOf('MAC') >= 0;

export const base64Decode = (input: string): string => {
  return base64.decode(input)
}

export const readLockfile = async (): Promise<string> => {
  if (isMac()){
    return lockfile
  } else {
    const path = await localDataDir()
    const file = await readTextFile(path + '\\Riot Games\\Riot Client\\Config\\lockfile')
    return file.toString()
  }
}

export const parseLockFile = (content: string): { port: string, password: string } => {
  const [_, __, port, password, ___] =  content.split(':')

  return { port, password: base64.encode(`riot:${password}`) }
}

export const extractPlayers = (match: CurrentPreGameMatchResponse | CurrentGameMatchResponse): string[] => {
  if ('AllyTeam' in match)
    return match.AllyTeam?.Players.map(player => player.Subject) || []

  return match.Players.map(player => player.Subject)
}

export const calculateStatsForPlayer = (puuid: string, matches: MatchDetailsResponse[]) => {

  let kds: number[] = []
  let hss: number[] = []
  let adr: number[] = []
  let accountLevel = 0

  for (const match of matches){
    const player = match.players.find(player => player.subject === puuid)!

    if (!player.stats) continue

    if (player.stats.deaths == 0)
      player.stats.deaths = 1

    kds.push(player.stats.kills / player.stats.deaths)

    if (match.roundResults){
      const shots = { legshots: 0, bodyshots: 0, headshots: 0 }
      const damagePerRound: number[] = []

      for (const roundResult of match.roundResults){
        let dmg = 0;
        for (const damage of roundResult.playerStats.find(result => result.subject === puuid)!.damage){
          shots.legshots += damage.legshots
          shots.bodyshots += damage.bodyshots
          shots.headshots += damage.headshots
          dmg += damage.damage
        }

        damagePerRound.push(dmg)
      }

      hss.push(shots.headshots / (shots.legshots + shots.bodyshots + shots.headshots))
      adr.push(damagePerRound.reduce((a, b) => a + b) / damagePerRound.length)
    }

    accountLevel = Math.max(accountLevel, player.accountLevel)
  }

  // Last Game Won and Score
  const team = matches.length ? matches[0].teams?.find(team => team.teamId === matches[0].players.find(player => player.subject === puuid)!.teamId)! : undefined
 

  return {
    kd: kds.length ? parseFloat((kds.reduce((a, b) => a + b) / kds.length).toFixed(2)) : 0,
    hs: hss.length ? Math.round(hss.reduce((a, b) => a + b) / hss.length * 100) : 0,
    adr: adr.length ? Math.round(adr.reduce((a, b) => a + b) / adr.length) : 0,
    lastGameWon: team ? team.won : 'N/A',
    lastGameScore: team ? `${team.roundsWon}:${team.roundsPlayed - team.roundsWon}` : 'N/A',
    accountLevel,
  }
}

export const calculateRanking = (playerMMR: PlayerMMRResponse): { currentRank: number, currentRR: number, peakRank: number, peakRankSeasonId: string | null, lastGameMMRDiff: number } =>  {
  return {
    currentRank: playerMMR.LatestCompetitiveUpdate?.TierAfterUpdate || 0,
    currentRR: playerMMR.LatestCompetitiveUpdate?.RankedRatingAfterUpdate || 0,
    peakRank: playerMMR.QueueSkills.competitive.SeasonalInfoBySeasonID ?
      Object.values(playerMMR.QueueSkills.competitive.SeasonalInfoBySeasonID).sort((a, b) => b.Rank - a.Rank)[0].Rank
      : 0,
    peakRankSeasonId: playerMMR.QueueSkills.competitive.SeasonalInfoBySeasonID ?
      Object.values(playerMMR.QueueSkills.competitive.SeasonalInfoBySeasonID).sort((a, b) => b.Rank - a.Rank)[0].SeasonID
      : null,
    lastGameMMRDiff: playerMMR.LatestCompetitiveUpdate?.RankedRatingEarned
  }
}

export const getAgent = (uuid: string): Agent => {
  if (!uuid)
    return { uuid, displayIcon: null, displayName: null, killfeedPortrait: null }

  return agents.find(agent => agent.uuid === uuid.toLowerCase())!
}

export const getRank = (rank: number): { rankName: string, rankColor: string } => {
  const _rank = ranks.find(_rank => _rank.tier === rank)
  return { rankName: _rank?.tierName as string, rankColor: _rank?.color as string }
}

export const getMap = (uuid: string) => {
  return maps.find(map => map.mapUrl === uuid)!
}

export const getSeasonDateById = (seasonId: string): Date | null => {
  const season = seasons.find(season => season.seasonUuid === seasonId)
  if (!season) return null

  return new Date(season.endTime)
}

export const playerHasWon = (puuid: string, match: MatchDetailsResponse) => {
  return match.teams?.find(team => team.teamId === match.players.find(player => player.subject === puuid)?.teamId)?.won ?? false
}

export const isSmurf = (player: PlayerRow) => {
  return Boolean((player.accountLevel && player.accountLevel < 100)
    && (player.kd && player.kd > 1.5))
}

export const getPlayerBestAgent = (puuid: string, matches: MatchDetailsResponse[], mapUrl: string): AgentStats[] => {
  matches = matches.filter(match => match.matchInfo.mapId === mapUrl)

  const agents: { [key: string]: { k: number, d: number, kd: number, games: number } }  = {}

  for (const match of matches){
    const player = match.players.find(player => player.subject === puuid)!

    if (!player.stats) continue

    const { kills, deaths } = player?.stats

    if (!(player.characterId in agents)){
      agents[player.characterId] = { k: kills, d: deaths, kd: 0, games: 1 }
      continue
    }

    agents[player.characterId].k += kills
    agents[player.characterId].d += deaths
    agents[player.characterId].games += 1

  }

  for (const characterId in agents){
      agents[characterId].k = Math.round(agents[characterId].k / agents[characterId].games)
      agents[characterId].d = Math.round(agents[characterId].d / agents[characterId].games)
      agents[characterId].kd = parseFloat((agents[characterId].k / agents[characterId].d).toFixed(2))
  }

  return Object.keys(agents).map(characterId => ({
    agentId: characterId,
    agentUrl: getAgent(characterId).displayIcon!,
    avgKills: agents[characterId].k,
    avgDeaths: agents[characterId].d,
    avgKd: agents[characterId].kd,
    games: agents[characterId].games,
  })).sort((a, b) => b.avgKd - a.avgKd)
}
