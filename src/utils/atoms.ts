import Database from '@tauri-apps/plugin-sql'
import { Store } from '@tauri-apps/plugin-store'
import { atom } from 'jotai'
import { LocalAPI, SharedAPI } from '../api'
import { GameState, PlayerAccount, PlayerRow } from '../interface'
import { StoreAPI } from '../api/store'
import { Penalties } from '@/interface/utils.interface'


const appInfo = atom<{ version: string, tauriVersion: string, identifier: string }>()
const cache = atom<Database>()
const announcement = atom<string|null>()

const localapi = atom<LocalAPI>()
const sharedapi = atom<SharedAPI>()
const storeapi = atom<StoreAPI>()
const puuid = atom<string>()
const player = atom<PlayerAccount>()
const table = atom<Record<PlayerRow['puuid'], PlayerRow>>({})
const party = atom<{ puuid: string, name: string, tag: string, playerCardId: string }[]>([])

const prefetching = atom<boolean>(false)
const gameState = atom<{ state: GameState, matchId: string | null }>({ state: 'MENUS', matchId: null })
const matchProcessing = atom<{ isProcessing: boolean, currentPlayer: string | null, progress: { step: number, total: number } }>({
  isProcessing: false,
  currentPlayer: null,
  progress: { step: 0, total: 0 }
})
const currentMatch = atom<any>(null)
const penalty = atom<Penalties>()
const rateLimitNotification = atom<{ isActive: boolean, retryAfter: number }>({
  isActive: false,
  retryAfter: 0
})



// Settings
const store = atom<Store>()
const allowAnalytics = atom<boolean>(false)
const firstTimeUser = atom<boolean>(true)

export default {
  appInfo,
  cache,
  announcement,
  localapi,
  sharedapi,
  storeapi,
  puuid,
  player,
  table,
  penalty,
  rateLimitNotification,
  party,

  gameState,
  matchProcessing,
  currentMatch,
  prefetching,

  // Settings
  store,
  allowAnalytics,
  firstTimeUser
}
