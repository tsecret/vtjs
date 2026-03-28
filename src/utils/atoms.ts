import { atom } from 'jotai'
import { GameState, PlayerAccount, PlayerRow } from '../interface'
import { Penalties } from '@/interface/utils.interface'


const appInfo = atom<{ appVersion: string, tauriVersion: string, identifier: string }>()
const announcement = atom<string|null>()

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
const allowAnalytics = atom<boolean>(false)
const firstTimeUser = atom<boolean>(true)

export default {
  appInfo,
  announcement,
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
  allowAnalytics,
  firstTimeUser
}
