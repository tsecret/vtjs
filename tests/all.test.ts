import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SharedAPI } from '../src/api/shared';
import { CurrentGameMatchResponse, CurrentPreGameMatchResponse, MatchDetailsResponse, PenaltiesResponse, PlayerMMRResponse } from '../src/interface';
import type { Penalties } from '../src/interface/utils.interface'
import * as utils from '../src/utils';

import maps from '../src/assets/maps.json'
import playerNames from './fixtures/shared/player-names.json'
import currentGameMatch from './fixtures/shared/current-game-match.json';
import currentPreGameMatch from './fixtures/shared/current-pregame-match.json';
import matchDetails from './fixtures/shared/match-details.json';
import playerMMR from './fixtures/shared/player-mmr.json';
import storefront from './fixtures/shared/storefront.json';
import penalties from './fixtures/shared/penalties.json'

describe('utils', () => {

  it('lockfile parse', async () => {
    const lockfile = await utils.readLockfile()
    const { port, password } = utils.parseLockFile(lockfile)
    expect(port).toEqual('12345')
    expect(password).toEqual('cmlvdDp0ZXN0LXBhc3N3b3Jk')
  })

  describe('zlib', () => {
    const d = { text: 'test' }
    const t = 'q1YqSa0oUbICUsUlSrUA'

    it('encode', async () => {
      expect(utils.zencode(d)).toBe(t)
    })

    it('decodd', async () => {
      expect(utils.zdecode(t)).toStrictEqual(d)
    })
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

    it('execution time', () => {
      utils.calculateStatsForPlayer('test-player-1-puuid', Array(1000).fill(matchDetails))
    })

    it('no matches', () => {
      const expected = {
        kd: 0,
        adr: 0,
        hs: 0,
        assists: 0,
        deaths: 0,
        kills: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        winrate: 0
      }
      expect(utils.calculateStatsForPlayer('test-player-1-puuid', [] as any)).toEqual(expected)
    })

    it('player has 0 deaths', () => {
      const input = {
        players: [
          {
            subject: 'test-player-1-puuid',
            stats: {
              kills: 5,
              assists: 0,
              deaths: 0,
            },
          }
        ],
        teams: [
          {
            roundsWon: 13
          },
          {
            roundsWon: 5
          },
        ]
      }

      const expected = {
        kd: 5,
        adr: 0,
        hs: 0,
        assists: 0,
        deaths: 0,
        kills: 5,
        wins: 0,
        losses: 1,
        ties: 0,
        winrate: 0
      }
      expect(utils.calculateStatsForPlayer('test-player-1-puuid', [input] as any)).toEqual(expected)
    })

    it('all good', () => {
      const expected = {
        kd: 1.56,
        adr: 124,
        hs: 19,
        assists: 7,
        deaths: 16,
        kills: 25,
        wins: 0,
        losses: 1,
        ties: 0,
        winrate: 0
      }
      expect(utils.calculateStatsForPlayer('test-player-1-puuid', [matchDetails] as any)).toEqual(expected)
    })

  })

  describe('calculateCompetitiveUpdates', () => {

    it('SeasonalInfoBySeasonID is null', () => {
      const input = {
        LatestCompetitiveUpdate: {
          RankedRatingEarned: 0,
          TierAfterUpdate: 0,
          RankedRatingAfterUpdate: 0
        },
        QueueSkills: {
          competitive: {
            SeasonalInfoBySeasonID: null
          }
        }
      }
      expect(utils.calculateRanking(input as any)).toEqual({ currentRank: 0, currentRR: 0, peakRank: 0, peakRankSeasonId: null, lastGameMMRDiff: 0, mmr: 0 })
    })

    it('calculateCompetitiveUpdates', () => {
      const expected = { currentRank: 20, currentRR: 28, peakRank: 20, peakRankSeasonId: 'aef237a0-494d-3a14-a1c8-ec8de84e309c', lastGameMMRDiff: -13, mmr: 2028 }
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

  describe('getStoreItemInfo', () => {

    it('gets accessories info', () => {
      const expected = [
        {
          price: 4000,
          type: 'spray',
          uuid: "d80c7de5-4625-7ed6-f2b6-4eb4ec963717"
        },
        {
          price: 4500,
          type: 'playercard',
          uuid: "82b5cd0d-4b81-c336-2332-61a753849355"
        },
        {
          price: 6000,
          type: 'spray',
          uuid: "eb1455b9-4b48-8a79-c16b-8592043285d4"
        },
        {
          price: 6000,
          type: 'spray',
          uuid: "a0a399da-4322-83f0-e734-49a81ab6e820"
        }
      ]
      expect(utils.getStoreItemInfo(storefront.AccessoryStore.AccessoryStoreOffers)).toStrictEqual(expected)
    })

    it('gets item info', () => {
      const expected = [
        {
          price: 1775,
          type: 'weaponskin',
          uuid: "e16ea577-4d7f-e686-456a-54b4b1d9cba2"
        },
        {
          price: 2550,
          type: 'weaponskin',
          uuid: "155ba654-4afa-1029-9e71-e0b6962d5410"
        },
        {
          price: 875,
          type: 'weaponskin',
          uuid: "b8bc5d1b-44aa-aa83-0246-b1a6bb496177"
        },
        {
          price: 1775,
          type: 'weaponskin',
          uuid: "46048768-4499-72f7-820b-7cbe1d4ad844"
        }
      ]
      expect(utils.getStoreItemInfo(storefront.SkinsPanelLayout.SingleItemStoreOffers)).toStrictEqual(expected)
    })
  })

  describe('extractPenalties', () => {
    it('with penalties', () => {
      const expected = {
        freeTimestamp: 1757204835300,
        type: ['TEXT_CHAT_MUTED', 'VOICE_CHAT_MUTED', 'PBE_LOGIN_TIME_BAN'],
        reason: ['INAPPROPRIATE_TEXT', 'INAPPROPRIATE_VOICE'],
        matchId: 'test-match-id-1'
      } as Penalties
      expect(utils.extractPenalties(penalties as PenaltiesResponse)).toEqual(expected)
    })

    it('with no penalties', async () => {
      expect(utils.extractPenalties({ Infractions: [], Penalties: [], Subject: '', Version: 1 } as PenaltiesResponse)).toEqual(null)
    })
  })
})

describe('api', () => {

  let sharedapi: SharedAPI;

  beforeEach(() => {
    sharedapi = new SharedAPI({ entToken: '', accessToken: '', region: '', shard: '' })
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
    sharedapi = new SharedAPI({ entToken: 'test-ent-token', accessToken: 'test-access-token', region: '', shard: '' })
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
