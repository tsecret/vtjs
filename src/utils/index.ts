import { localDataDir } from '@tauri-apps/api/path';
import { readTextFile } from '@tauri-apps/plugin-fs';
import base64 from 'base-64';
import lockfile from '../../lockfile.json';
import { CompetitiveUpdatesResponse, Match, MatchDetailsResponse } from '../interface';
import agents from '../assets/agents.json'
import ranks from '../assets/ranks.json'

export const sleep = (ms: number = 2000) => new Promise(resolve => setTimeout(resolve, ms));

export const isMac = () => navigator.platform.toUpperCase().indexOf('MAC') >= 0;

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

export const extractPlayers = (match: Match): string[] => {
  return match.Players.map(player => player.Subject)
}

export const calculateStatsForPlayer = (puuid: string, matches: MatchDetailsResponse[]) => {

  let kds: number[] = []

  for (const match of matches){
    const player = match.players.find(player => player.subject === puuid)
    if (!player) continue

    kds.push(player.stats.kills / player.stats.deaths)

  }

  // Last Game Won and Score
  const team = matches.length ? matches[0].teams.find(team => team.teamId === matches[0].players.find(player => player.subject === puuid)?.teamId) : undefined

  return {
    kd: kds.length ? parseFloat((kds.reduce((a, b) => a + b) / kds.length).toFixed(2)) : 0,
    lastGameWon: typeof team === 'undefined' ? 'N/A' : team.won,
    lastGameScore: typeof team === 'undefined' ? 'N/A' : `${team.roundsWon}:${team.roundsPlayed - team.roundsWon}`,
  }
}

export const calculateCompetitiveUpdates = (matches: CompetitiveUpdatesResponse['Matches']): { currentRank: number, currentRR: number } =>  {
  if (!matches.length)
    return { currentRank: 0, currentRR: 0 }

  return {
    currentRank: matches[0].TierAfterUpdate,
    currentRR: matches[0].RankedRatingAfterUpdate
  }
}

export const getAgent = (uuid: string) => {
  const agent = agents.find(agent => agent.uuid === uuid)
  return { uuid, name: agent?.displayName, img: agent?.killfeedPortrait }
}

export const getRank = (rank: number): { rankName: string, rankColor: string } => {
  const _rank = ranks.find(_rank => _rank.tier === rank)
  return { rankName: _rank?.tierName as string, rankColor: _rank?.color as string }
}
