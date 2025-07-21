import Database from '@tauri-apps/plugin-sql'
import { Store } from '@tauri-apps/plugin-store'
import { atom } from 'jotai'
import { LocalAPI, SharedAPI } from '../api'
import { PlayerAccount, PlayerRow } from '../interface'
import { StoreAPI } from '../api/store'


const appInfo = atom<{ version: string, tauriVersion: string, identifier: string }>()
const cache = atom<Database>()

const localapi = atom<LocalAPI>()
const sharedapi = atom<SharedAPI>()
const storeapi = atom<StoreAPI>()
const puuid = atom<string>()
const player = atom<PlayerAccount>()
const table = atom<{ [key: PlayerRow['puuid']]: PlayerRow }>({})

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

  // Settings
  store,
  allowAnalytics,
  firstTimeUser
}
