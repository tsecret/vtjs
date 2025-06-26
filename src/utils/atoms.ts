import Database from '@tauri-apps/plugin-sql'
import { atom } from 'jotai'
import { LocalAPI, SharedAPI } from '../api'
import { PlayerAccount } from '../interface'

const cache = atom<Database>()

const localapi = atom<LocalAPI>()
const sharedapi = atom<SharedAPI>()
const puuid = atom<string>()
const player = atom<PlayerAccount>()


export default {
  cache,

  localapi,
  sharedapi,
  puuid,
  player
}
