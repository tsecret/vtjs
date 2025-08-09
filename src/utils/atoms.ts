import Database from '@tauri-apps/plugin-sql'
import { Store } from '@tauri-apps/plugin-store'
import { atom } from 'jotai'
import { LocalAPI, SharedAPI } from '../api'
import { GameState, PlayerAccount, PlayerRow } from '../interface'
import { StoreAPI } from '../api/store'


const appInfo = atom<{ version: string, tauriVersion: string, identifier: string }>()
const cache = atom<Database>()

const localapi = atom<LocalAPI>()
const sharedapi = atom<SharedAPI>()
const storeapi = atom<StoreAPI>()
const puuid = atom<string>()
const player = atom<PlayerAccount>()
const table = atom<{ [key: PlayerRow['puuid']]: PlayerRow }>({})

const gameState = atom<{ state: GameState, matchId: string | null }>({ state: 'Idle', matchId: null })
const matchProcessing = atom<{ isProcessing: boolean, currentPlayer: string | null, progress: { step: number, total: number } }>({
  isProcessing: false,
  currentPlayer: null,
  progress: { step: 0, total: 0 }
})
const currentMatch = atom<any>(null)

// Settings
const store = atom<Store>()
const allowAnalytics = atom<boolean>(false)
const firstTimeUser = atom<boolean>(true)

export default {
  appInfo,
  cache,
  localapi,
  sharedapi,
  storeapi,
  puuid,
  player,
  table,

  gameState,
  matchProcessing,
  currentMatch,

  // Settings
  store,
  allowAnalytics,
  firstTimeUser
}
