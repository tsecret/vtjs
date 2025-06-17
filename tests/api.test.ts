import { describe, expect, it } from 'vitest'
import { Match } from '../src/interface'
import * as utils from '../src/utils'

import currentGameMatch from './fixtures/shared/current-game-match.json'
import matchDetails from './fixtures/shared/match-details.json'

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
    const expected = { kd: 1.56, lastGameWon: false, lastGameScore: '8:13' }
    expect(utils.calculateStatsForPlayer('test-player-1-puuid', [matchDetails] as any)).toEqual(expected)
  })

})
