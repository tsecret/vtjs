import { beforeAll, vi } from "vitest";
import { mockIPC } from '@tauri-apps/api/mocks'
import * as utils from '../src/utils'

// Local
import helpResponse from './fixtures/local/help.json'
import entTokenResponse from './fixtures/local/ent-token.json'
import playerAliasResponse from './fixtures/local/player-alias.json'

// Shared
import currentGamePlayer from './fixtures/shared/current-game-player.json'
import currentGameMatch from './fixtures/shared/current-game-match.json'
import playerNames from './fixtures/shared/player-names.json'
import playerMatchHistory from './fixtures/shared/match-history.json'
import matchDetails from './fixtures/shared/match-details.json'
import competitiveUpdates from './fixtures/shared/competitive-updates.json'

const getResponseFromUrl = (url: string) => {

    // Local

    if (url.includes('/help')){
      return helpResponse
    }

    if (url.includes('/entitlements/v1/token')){
      return entTokenResponse
    }

    if (url.includes('/player-account/aliases/v1/active')){
      return playerAliasResponse
    }

    // Shared

    if (url.includes('/core-game/v1/players/')){
      return currentGamePlayer
    }

    if (url.includes('/core-game/v1/matches/')){
      return currentGameMatch
    }

    if (url.includes('/name-service/v2/players')){
      return playerNames
    }

    if (url.includes('/match-history/v1/history/')){
      const [_, params] = url.split('?')
      const [startIndexStr, endIndexStr] = params.split('&')
      const startIndex = parseInt(startIndexStr.split('=')[1])
      const endIndex = parseInt(endIndexStr.split('=')[1])

      return { ...playerMatchHistory, History: playerMatchHistory.History.slice(startIndex, endIndex) }
    }

    if (url.includes('/match-details/v1/matches/')){
      return matchDetails
    }

    if (url.includes('/competitiveupdates')){
      return competitiveUpdates
    }
}

beforeAll(async () => {
  vi.mock('@tauri-apps/plugin-http', () => ({
    fetch: async (url: string) => ({
        status: 200,
        json: async () => getResponseFromUrl(url)
      })
  }));

  vi.spyOn(utils, 'readLockfile').mockImplementation(async () => "Riot Test Client:1111:12345:test-password:https")


  const mockStoreData: Record<string, any> = {}

  mockIPC((cmd, payload) => {
    if (cmd === 'plugin:store|load'){
      return mockStoreData
    }

    if (cmd === 'plugin:store|get'){
      // @ts-ignore
      if (payload.key in mockStoreData)
        // @ts-ignore
        return [mockStoreData[payload.key], true]

      return [null, false]
    }

    if (cmd === 'plugin:store|set'){
      // @ts-ignore
      mockStoreData[payload.key] = payload.value
    }

  })
})
