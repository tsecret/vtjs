import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SharedAPI } from '../src/api/shared';
import { CurrentGameMatchResponse, CurrentPreGameMatchResponse, MatchDetailsResponse, PlayerMMRResponse } from '../src/interface';
import * as utils from '../src/utils';

import maps from '../src/assets/maps.json'
import playerNames from './fixtures/shared/player-names.json'
import currentGameMatch from './fixtures/shared/current-game-match.json';
import currentPreGameMatch from './fixtures/shared/current-pregame-match.json';
import matchDetails from './fixtures/shared/match-details.json';
import playerMMR from './fixtures/shared/player-mmr.json';

describe('utils', () => {

  it('lockfile parse', async () => {
    const lockfile = await utils.readLockfile()
    const { port, password } = utils.parseLockFile(lockfile)
    expect(port).toEqual('12345')
    expect(password).toEqual('cmlvdDp0ZXN0LXBhc3N3b3Jk')
  })

  describe('extractPlayers', () => {
    it('extractPlayers from pre-game match', () => {
      expect(utils.extractPlayers(currentPreGameMatch as CurrentPreGameMatchResponse)).toStrictEqual(currentPreGameMatch.AllyTeam.Players.map(player => player.Subject))
    })

    it('extractPlayers from game match', () => {
      expect(utils.extractPlayers(currentGameMatch as CurrentGameMatchResponse)).toStrictEqual(currentGameMatch.Players.map(player => player.Subject))
    })
  })

  describe('calculateStatsForPlayer', () => {

    it('no matches', () => {
      const expected = { kd: 0, accountLevel: 0, lastGameWon: 'N/A', lastGameScore: 'N/A', adr: 0, hs: 0 }
      expect(utils.calculateStatsForPlayer('test-player-1-puuid', [] as any)).toEqual(expected)
    })

    it('player has 0 deaths', () => {
      const input = {
        players: [
          {
            subject: 'test-player-1-puuid',
            stats: {
              kills: 5,
              deaths: 0,
            },
            accountLevel: 10
          }
        ],
        teams: []
      }

      const expected = { kd: 5, accountLevel: 10, lastGameWon: 'N/A', lastGameScore: 'N/A', adr: 0, hs: 0 }
      expect(utils.calculateStatsForPlayer('test-player-1-puuid', [input] as any)).toEqual(expected)
    })

    it('all good', () => {
      const expected = { kd: 1.56, accountLevel: 89, lastGameWon: false, lastGameScore: '8:13', adr: 124, hs: 19 }
      expect(utils.calculateStatsForPlayer('test-player-1-puuid', [matchDetails] as any)).toEqual(expected)
    })

  })

  describe('calculateCompetitiveUpdates', () => {

    it('SeasonalInfoBySeasonID is null', () => {
      const input = {
        LatestCompetitiveUpdate: {
          RankedRatingEarned: 0
        },
        QueueSkills: {
          competitive: {
            SeasonalInfoBySeasonID: null
          }
        }
      }
      expect(utils.calculateRanking(input as any)).toEqual({ currentRank: 0, currentRR: 0, peakRank: 0, peakRankSeasonId: null, lastGameMMRDiff: 0 })
    })

    it('calculateCompetitiveUpdates', () => {
      const expected = { currentRank: 20, currentRR: 28, peakRank: 20, peakRankSeasonId: '16118998-4705-5813-86dd-0292a2439d90', lastGameMMRDiff: -13 }
      expect(utils.calculateRanking(playerMMR as PlayerMMRResponse)).toEqual(expected)
    })

  })

  describe('getBestAgents', () => {
    const puuid = playerNames[0].Subject
    const mapUrl = '/Game/Maps/Jam/Jam'
    const expected = [{ agentId: 'cc8b64c8-4b25-4ff9-6e7f-37b4da43d235', avgDeaths: 16, avgKills: 25, avgKd: 1.56, games: 1, agentUrl: 'https://media.valorant-api.com/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/displayicon.png' }]

    it('1 game', () => {
      expect(utils.getPlayerBestAgent(puuid, [matchDetails] as MatchDetailsResponse[], mapUrl)).toStrictEqual(expected)
    })

    it('2 games', () => {
      expect(utils.getPlayerBestAgent(puuid, [matchDetails, matchDetails] as MatchDetailsResponse[], mapUrl)).toStrictEqual([{ ...expected[0], games: 2 }])
    })
  })
})

describe('api', () => {

  let sharedapi: SharedAPI;

  beforeEach(() => {
    sharedapi = new SharedAPI({ entToken: '', accessToken: '' })
  })

  describe('shared', () => {

    it('getPlayerMatchHistory default', async () => {
      const { History } = await sharedapi.getPlayerMatchHistory('')
      expect(History.length).toEqual(20)
    })

  })

})

describe('request caching', () => {

  let sharedapi: SharedAPI
  const puuid = 'test-player'

  beforeEach(async () => {
    sharedapi = new SharedAPI({ entToken: 'test-ent-token', accessToken: 'test-access-token' })
    vi.useFakeTimers()
  })

  afterEach(async () => {
    vi.useRealTimers()
  })

  it('sends the request and checks for cache', async () => {
    await sharedapi.getMatchDetails('test-match-id')
    expect(Object.keys(globalThis.requestCache).length).toEqual(1)
  })

  it('checks cache after 30 days', async () => {
    const timestampBefore = +new Date(2025, 1, 1, 13, 0, 0)
    vi.setSystemTime(new Date(2025, 1, 1, 13, 0, 0))

    await sharedapi.getMatchDetails('')
    expect(Object.keys(globalThis.requestCache).length).toEqual(1)
    expect(Object.values(globalThis.requestCache as { [key: string]: [string, number, any] })[0][1]).toEqual(timestampBefore + 30 * 24 * 60 * 60 * 1000)

    const timestampAfter = +new Date(2025, 1, 30, 13, 30, 1)
    vi.setSystemTime(+new Date(2025, 1, 30, 13, 30, 1))

    await sharedapi.getMatchDetails('')
    expect(Object.values(globalThis.requestCache as { [key: string]: [string, number, any] })[0][1]).toEqual(timestampAfter + 30 * 24 * 60 * 60 * 1000)
  })

})
