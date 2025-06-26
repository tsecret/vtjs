import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SharedAPI } from '../src/api/shared';
import { Match, PlayerMMRResponse } from '../src/interface';
import * as utils from '../src/utils';

import currentGameMatch from './fixtures/shared/current-game-match.json';
import matchDetails from './fixtures/shared/match-details.json';
import playerMMR from './fixtures/shared/player-mmr.json';

describe('utils', () => {

  it('lockfile parse', async () => {
    const lockfile = await utils.readLockfile()
    const { port, password } = utils.parseLockFile(lockfile)
    expect(port).toEqual('12345')
    expect(password).toEqual('cmlvdDp0ZXN0LXBhc3N3b3Jk')
  })

  it('extractPlayers', () => {
    expect(utils.extractPlayers(currentGameMatch as Match)).toStrictEqual(currentGameMatch.Players.map(player => player.Subject))
  })

  describe('calculateStatsForPlayer', () => {

    it('no matches', () => {
      const expected = { kd: 0, accountLevel: 0, lastGameWon: 'N/A', lastGameScore: 'N/A' }
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

      const expected = { kd: 5, accountLevel: 10, lastGameWon: 'N/A', lastGameScore: 'N/A' }
      expect(utils.calculateStatsForPlayer('test-player-1-puuid', [input] as any)).toEqual(expected)
    })

    it('all good', () => {
      const expected = { kd: 1.56, accountLevel: 89, lastGameWon: false, lastGameScore: '8:13' }
      expect(utils.calculateStatsForPlayer('test-player-1-puuid', [matchDetails] as any)).toEqual(expected)
    })

  })

  describe('calculateCompetitiveUpdates', () => {

    it('SeasonalInfoBySeasonID is null', () => {
      const input = {
        QueueSkills: {
          competitive: {
            SeasonalInfoBySeasonID: null
          }
        }
      } as Partial<PlayerMMRResponse>
      expect(utils.calculateRanking(input as PlayerMMRResponse)).toEqual({ currentRank: 0, currentRR: 0, peakRank: 0 })
    })

    it('calculateCompetitiveUpdates', () => {
      expect(utils.calculateRanking(playerMMR)).toEqual({ currentRank: 20, currentRR: 28, peakRank: 20 })
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
    expect(Object.keys(globalThis.cache).length).toEqual(1)
  })

  it('checks cache after 30 mins', async () => {
    const timestampBefore = +new Date(2025, 1, 1, 13, 0, 0)
    vi.setSystemTime(new Date(2025, 1, 1, 13, 0, 0))

    await sharedapi.getMatchDetails('')
    expect(Object.keys(globalThis.cache).length).toEqual(1)
    expect(Object.values(globalThis.cache as { [key: string]: [string, number, any] })[0][1]).toEqual(timestampBefore + sharedapi.cacheTTL)

    vi.setSystemTime(new Date(2025, 1, 1, 13, 30, 1))

    await sharedapi.cleanCache()
    expect(Object.keys(globalThis.cache).length).toEqual(0)
  })

})
