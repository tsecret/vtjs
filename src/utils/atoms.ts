import { atom } from 'jotai'
import { Pages } from '../interface/Pages.enum'
import { Store } from '@tauri-apps/plugin-store'
import { LocalAPI, SharedAPI } from '../api'
import { PlayerAccount } from '../interface'

const page = atom<Pages>(Pages.SPLASH)
const requestsCache = atom<Store>()
const matchesCache= atom<Store>()

const localapi = atom<LocalAPI>()
const sharedapi = atom<SharedAPI>()
const puuid = atom<string>()
const player = atom<PlayerAccount>()


export default {
  page,
  requestsCache,
  matchesCache,

  localapi,
  sharedapi,
  puuid,
  player
}
