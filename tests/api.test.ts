import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Match } from '../src/interface'
import * as utils from '../src/utils'
import { SharedAPI } from '../src/api/shared'
import { load, Store } from '@tauri-apps/plugin-store';

import currentGameMatch from './fixtures/shared/current-game-match.json'
import matchDetails from './fixtures/shared/match-details.json'
import competitiveUpdates from './fixtures/shared/competitive-updates.json'
import matchHistory from './fixtures/shared/match-history.json'
import playerMMR from './fixtures/shared/player-mmr.json'

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

  it('calculateStatsForPlayer', () => {
    const expected = { kd: 1.56, lastGameWon: false, lastGameScore: '8:13', accountLevel: 89 }
    expect(utils.calculateStatsForPlayer('test-player-1-puuid', [matchDetails] as any)).toEqual(expected)
  })

  it('calculateCompetitiveUpdates', () => {
    expect(utils.calculateRanking(playerMMR)).toEqual({ currentRank: 20, currentRR: 28, peakRank: 20 })
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

  beforeEach(() => {
    sharedapi = new SharedAPI({ entToken: 'test-ent-token', accessToken: 'test-access-token' })
    vi.useFakeTimers()
  })

  afterEach(async () => {
    vi.useRealTimers()
  })

  it('sends the request and checks for cache', async () => {
    const spy = vi.spyOn((window as any).__TAURI_INTERNALS__, "invoke");
    await sharedapi.getMatchDetails('')
    expect(Object.keys(globalThis.requestCache).length).toEqual(1)
  })

  it('checks cache after 30 mins', async () => {
    const timestampBefore = +new Date(2025, 1, 1, 13, 0, 0)
    vi.setSystemTime(new Date(2025, 1, 1, 13, 0, 0))

    const spy = vi.spyOn((window as any).__TAURI_INTERNALS__, "invoke");
    await sharedapi.getMatchDetails('')
    expect(Object.keys(globalThis.requestCache).length).toEqual(1)
    expect(Object.values(globalThis.requestCache)[0].ttl).toEqual(timestampBefore + sharedapi.cacheTTL)

    const timestampAfter = +new Date(2025, 1, 1, 13, 30, 1)
    vi.setSystemTime(new Date(2025, 1, 1, 13, 30, 1))

    await sharedapi.getMatchDetails('')
    expect(Object.keys(globalThis.requestCache).length).toEqual(1)
    expect(Object.values(globalThis.requestCache)[0].ttl).toEqual(timestampAfter + sharedapi.cacheTTL)
  })

})
