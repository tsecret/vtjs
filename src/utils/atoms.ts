import { Store } from '@tauri-apps/plugin-store'
import { atom } from 'jotai'
import { LocalAPI, SharedAPI } from '../api'
import { PlayerAccount } from '../interface'

const requestsCache = atom<Store>()
const matchesCache= atom<Store>()

const localapi = atom<LocalAPI>()
const sharedapi = atom<SharedAPI>()
const puuid = atom<string>()
const player = atom<PlayerAccount>()


export default {
  requestsCache,
  matchesCache,

  localapi,
  sharedapi,
  puuid,
  player
}
