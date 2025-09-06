import { localDataDir } from '@tauri-apps/api/path';
import { readDir, readTextFile, readTextFileLines } from '@tauri-apps/plugin-fs';
import base64 from 'base-64';
import { Buffer } from 'buffer';
import pako from 'pako';

import lockfile from '../../lockfile.json';
import configs from '../../tests/fixtures/local/configs.json';
import ShooterGameLog from '../../tests/fixtures/ShooterGame.json';
import agents from '../assets/agents.json';
import maps from '../assets/maps.json';
import ranks from '../assets/ranks.json';
import seasons from '../assets/seasons.json';

import type { BestAgent, BestMaps, Penalties, PlayerMatchStats, PlayerRanking, Rank } from '@/interface/utils.interface';
import type { Agent, AgentStats, CurrentGameMatchResponse, CurrentPreGameMatchResponse, Map, MatchDetailsResponse, MatchResult, PenaltiesResponse, PlayerMMRResponse, PlayerRow, StorefrontResponse } from '../interface';

export const sleep = (ms: number = 2000) => new Promise(resolve => setTimeout(resolve, ms));

export const isMac = () => navigator.platform.toUpperCase().indexOf('MAC') >= 0;

export const base64Decode = (input: string): string => {
  return base64.decode(input)
}

export const zdecode = (input: string): any => {
  return JSON.parse(pako.inflateRaw(Buffer.from(input, 'base64'), { to: 'string' }))
}

export const zencode = (input: any): string => {
  return Buffer.from(pako.deflateRaw(Buffer.from(JSON.stringify(input), 'utf-8'))).toString('base64')
}

export const randomInt = (min: number, max: number): number =>  {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
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

export const readConfigs = async (): Promise<string[]> => {
  if (isMac()){
    return configs
  } else {
    const path = await localDataDir()
    const files = await readDir(path + '\\Valorant\\Saved\\Config')
    return files.map(file => file.name).filter(name => name.match(/(.*)-(.*)-(.*)-(.*)-(.*)/))
  }
}

export const readLog = async () => {
  if (isMac()){
    for (const line of ShooterGameLog){
      const res = parseShardFromLogline(line)
      if (res) return res
    }
  } else {
    const path = await localDataDir()
    const lines = await readTextFileLines(path + '\\Valorant\\Saved\\Logs\\ShooterGame.log')
    for await (const line of lines){
      const res = parseShardFromLogline(line)
      if (res) return res
    }
  }

  return ['', '']
}

export const parseShardFromLogline = (line: string): [string, string] | undefined => {
    if (!line.includes('https://glz')) return

    const urlMatch = line.match(/URL \[GET (https?:\/\/[^\]]+)\]/)
    if (!urlMatch) return

    const regionMatch = urlMatch[1].match(/glz-([a-zA-Z]+)-\d+\.([a-zA-Z]+)\.a\.pvp\.net/)
    if (regionMatch) return [regionMatch[1], regionMatch[2]]
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

export const calculateStatsForPlayer = (puuid: string, matches: MatchDetailsResponse[]): PlayerMatchStats => {

  let validMatches = 0
  const stats = {
    kills: 0,
    deaths: 0,
    assists: 0,
    kd: 0,
    hs: 0,
    adr: 0,
    wins: 0,
    losses: 0,
    ties: 0,
    winrate: 0,
  }

  for (const match of matches){
    const player = match.players.find(player => player.subject === puuid)

    if (!player || !player.stats) continue

    validMatches += 1
    stats.kills += player.stats.kills
    stats.deaths += player.stats.deaths
    stats.assists += player.stats.assists
    stats.kd += player.stats.kills / (player.stats.deaths || 1)

    const { result } = getMatchResult(puuid, match)
    result == 'won' ? stats.wins += 1 :
    result == 'loss' ? stats.losses += 1 :
    result == 'tie' ? stats.ties += 1 :
    null

    if (match.roundResults){

      const shots = { legshots: 0, bodyshots: 0, headshots: 0 }
      let damagePerRound = 0

      for (const roundResult of match.roundResults){

        for (const damage of roundResult.playerStats.find(result => result.subject === puuid)!.damage){
          shots.legshots += damage.legshots
          shots.bodyshots += damage.bodyshots
          shots.headshots += damage.headshots
          damagePerRound += damage.damage
        }

      }

      stats.adr += damagePerRound / match.roundResults.length
      stats.hs += shots.headshots / (shots.headshots + shots.bodyshots + shots.legshots)
    }

  }

  if (validMatches == 0)
    return stats

  return {
    kills: Math.round(stats.kills / matches.length),
    deaths: Math.round(stats.deaths / matches.length),
    assists: Math.round(stats.assists / matches.length),
    kd: Number((stats.kd / matches.length).toFixed(2)),
    hs: Math.round((stats.hs / matches.length) * 100),
    adr: Math.round(stats.adr / matches.length),
    wins: stats.wins,
    losses: stats.losses,
    ties: stats.ties,
    winrate: Math.round((stats.wins / matches.length) * 100),
  }
}

export const calculateRanking = (playerMMR: PlayerMMRResponse): PlayerRanking =>  {
  return {
    currentRank: playerMMR.LatestCompetitiveUpdate?.TierAfterUpdate || 0,
    currentRR: playerMMR.LatestCompetitiveUpdate?.RankedRatingAfterUpdate || 0,
    peakRank: playerMMR.QueueSkills.competitive.SeasonalInfoBySeasonID ?
      Object.values(playerMMR.QueueSkills.competitive.SeasonalInfoBySeasonID).sort((a, b) => b.CompetitiveTier - a.CompetitiveTier)[0].CompetitiveTier
      : 0,
    peakRankSeasonId: playerMMR.QueueSkills.competitive.SeasonalInfoBySeasonID ?
      Object.values(playerMMR.QueueSkills.competitive.SeasonalInfoBySeasonID).sort((a, b) => b.CompetitiveTier - a.CompetitiveTier)[0].SeasonID
      : null,
    lastGameMMRDiff: playerMMR.LatestCompetitiveUpdate?.RankedRatingEarned,
    mmr: playerMMR.LatestCompetitiveUpdate?.TierAfterUpdate * 100 + playerMMR.LatestCompetitiveUpdate?.RankedRatingAfterUpdate
  }
}

export const getMatchResult = (puuid: string, match: MatchDetailsResponse): { result: MatchResult, score: string, accountLevel: number } => {

  if (!match || !match.teams)
    return { result: 'N/A', score: '', accountLevel: 0 }

  const player = match.players.find(player => player.subject === puuid)!
  const team = match.teams.find(team => team.teamId === player.teamId)!

  if (match.teams[0].roundsWon === match.teams[1].roundsWon)
    return { result: 'tie', score: `${match.teams[0].roundsWon}:${match.teams[1].roundsWon}`, accountLevel: player.accountLevel }

  return { result: team.won ? 'won' : 'loss', score: `${team.roundsWon}:${team.roundsPlayed - team.roundsWon}`, accountLevel: player.accountLevel }
}

export const getAgent = (uuid: string): Agent =>  {
  return agents.find(agent => agent.uuid === uuid.toLowerCase())!
}

export const getRank = (rank: number): Rank => {
  const _rank = ranks.find(_rank => _rank.tier === rank)
  return {
    tier: rank,
    rankName: _rank?.tierName as string,
    rankColor: _rank?.color as string,
    rankImg: _rank?.largeIcon as string
  }
}

export const getMap = (uuid: string): Map => {
  return maps.find(map => map.mapUrl === uuid)!
}

export const getSeasonDateById = (seasonId: string): Date | null => {
  const season = seasons.find(season => season.seasonUuid === seasonId)
  if (!season) return null

  return new Date(season.endTime)
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

export const calculateBestAgents = (puuid: string, matches: MatchDetailsResponse[]): BestAgent[] => {
  const bestAgents: BestAgent[] = []

  const agents: { [key: string]: MatchDetailsResponse[] } = {}

  for (const match of matches){
    const player = match.players.find(player => player.subject === puuid)!

    if (!(player.characterId in agents)){
      agents[player.characterId] = [match]
    } else {
      agents[player.characterId].push(match)
    }

  }

  for (const agentId in agents){
    const stats = calculateStatsForPlayer(puuid, agents[agentId])
    bestAgents.push({
      agentId,
      matches: agents[agentId].length,
      ...stats
    })

  }

  return bestAgents.sort((a, b) => (b.matches || 1) - (a.matches || 0))
}

export const calculateBestMaps = (puuid: string, matches: MatchDetailsResponse[]): BestMaps[] => {
  const bestMaps: BestMaps[] = []

  const maps: { [key: string]: MatchDetailsResponse[] } = {}

  for (const match of matches){

    if (!(match.matchInfo.mapId in maps)){
      maps[match.matchInfo.mapId] = [match]
    } else {
      maps[match.matchInfo.mapId].push(match)
    }

  }

  for (const mapId in maps){
    const stats = calculateStatsForPlayer(puuid, maps[mapId])
    bestMaps.push({
      mapId,
      matches: maps[mapId].length,
      ...stats
    })

  }

  return bestMaps.sort((a, b) => (b.matches || 1) - (a.matches || 0))
}

export const getStoreItemInfo = (offers: StorefrontResponse['AccessoryStore']['AccessoryStoreOffers'] | StorefrontResponse['SkinsPanelLayout']['SingleItemStoreOffers']): { uuid: string, price: number, type: 'weaponskin' | 'spray' | 'playercard' | 'buddy' }[] => {

  return offers.map(offer => {
    const rawOffer = "Offer" in offer ? offer.Offer : offer

    return {
      uuid: rawOffer.Rewards[0]['ItemID'],
      price: Object.values(rawOffer.Cost)[0],
      type:
        rawOffer.Rewards[0]['ItemTypeID'] === 'e7c63390-eda7-46e0-bb7a-a6abdacd2433' ? 'weaponskin' :
        rawOffer.Rewards[0]['ItemTypeID'] === 'd5f120f8-ff8c-4aac-92ea-f2b5acbe9475' ? 'spray' :
        rawOffer.Rewards[0]['ItemTypeID'] === '3f296c07-64c3-494c-923b-fe692a4fa1bd' ? 'playercard' :
        'buddy'
    }
  })
}

export const extractPenalties = (penalties: PenaltiesResponse): Penalties | null => {
  if (!penalties.Infractions.length)
    return null

  penalties.Penalties = penalties.Penalties.filter(p => p.RiotRestrictionEffect)

  const penalty = penalties.Penalties.find(penalty => penalty.RiotRestrictionEffect.RestrictionType === 'PBE_LOGIN_TIME_BAN')

  if (!penalty)
    return null

  return {
    freeTimestamp: +new Date(penalty.Expiry),
    type: penalties.Penalties.map(p => p.RiotRestrictionEffect.RestrictionType),
    reason: penalties.Penalties.map(p => p.RiotRestrictionEffect.RestrictionReason).filter(p => p.length),
    matchId: penalty.IssuingMatchID
  }
}
