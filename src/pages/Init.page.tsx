import { useAptabase } from '@aptabase/react';
import { getIdentifier, getTauriVersion, getVersion } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api/core';
import Database from '@tauri-apps/plugin-sql';
import { load } from '@tauri-apps/plugin-store';
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { LocalAPI, SharedAPI } from "../api";
import { TestLocalAPI } from "../api/local.dev";
import { TestSharedAPI } from "../api/shared.dev";
import { StoreAPI } from '../api/store';
import * as utils from '../utils';
import atoms from '../utils/atoms';
import { CACHE_NAME } from '../utils/constants';

export const InitPage = () => {
  const [, setAppInfo] = useAtom(atoms.appInfo)
  const [, setPlayer] = useAtom(atoms.player)
  const [, setLocalapi] = useAtom(atoms.localapi)
  const [, setSharedapi] = useAtom(atoms.sharedapi)
  const [, setStoreapi] = useAtom(atoms.storeapi)
  const [, setpuuid] = useAtom(atoms.puuid)
  const [, setcache] = useAtom(atoms.cache)
  const [, setstore] = useAtom(atoms.store)
  const [, setAllowAnalytics] = useAtom(atoms.allowAnalytics)
  const [, setFirstTimeUser] = useAtom(atoms.firstTimeUser)


  const [initStatus, setInitStatus] = useState<string>('Preparing app')
  const [error, setError] = useState<string|null>()

  const navigate = useNavigate();
  const { trackEvent } = useAptabase();

  async function init(){

    // App info
    setAppInfo({
      version: await getVersion(),
      tauriVersion: await getTauriVersion(),
      identifier: await getIdentifier()
    })

    // Settings
    const store = await load('settings.json', { autoSave: true });
    setstore(store)

    const allowAnalytics = await store.get('allowAnalytics')
    setAllowAnalytics(allowAnalytics ? true : false)

    const firstTimeUserKey = await store.get<boolean | undefined>('firstTimeUser')
    const firstTimeUser = firstTimeUserKey || firstTimeUserKey == undefined ? true : false
    setFirstTimeUser(firstTimeUser)
    //

    if (allowAnalytics)
      await trackEvent('app_init')

    setInitStatus('Loading database')
    const db = await Database.load(CACHE_NAME);
    await db.execute('CREATE TABLE IF NOT EXISTS requests (endpoint str PRIMARY KEY, ttl int, data JSON)')
    await db.execute('CREATE TABLE IF NOT EXISTS matches (matchId str PRIMARY KEY, data JSON)')

    setcache(db)

    try {
      setInitStatus('Loading Lockfile')
      const { port, password } = utils.parseLockFile(await utils.readLockfile())
      const localapi = import.meta.env.VITE_FROM_JSON === 'true' ? new TestLocalAPI({ port: '', password: '' }) :  new LocalAPI({ port, password })
      const player = await localapi.getPlayerAccount()

      setInitStatus('Loading Player')
      const { accessToken, token: entToken, subject: puuid } = await localapi.getEntitlementToken()
      const sharedapi = import.meta.env.VITE_FROM_JSON === 'true' ? new TestSharedAPI({ entToken, accessToken }) : new SharedAPI({ entToken, accessToken })

      const storeapi = new StoreAPI({ entToken, accessToken })

      setPlayer(player)
      setpuuid(puuid)
      setLocalapi(localapi)
      setSharedapi(sharedapi)
      setStoreapi(storeapi)

      console.log('localapi', localapi)
      console.log('player', player)

      invoke('start_ws', {
        wsUrl: `wss://${import.meta.env.VITE_DEV === 'true' ? '192.168.31.197' : 'localhost'}:${port}`,
        headers: {
          Authorization: `Basic ${password}`,
        },
      });

      if (allowAnalytics)
        await trackEvent('app_load')

      navigate(firstTimeUser ? '/welcome' : '/dashboard')
    } catch (err){
      console.log('err', err)
      setError('Make sure Riot Client is open, and you have logged into your account')
    }

  }

  useEffect(() => {
    init()
  }, [])

  return <div className="h-screen w-screen flex flex-col items-center bg-primary/15 relative justify-evenly">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] bg-black"></div>

      <section className="text-center space-y-4">
        <p className="text-8xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">VTJS</p>

        {
          error ?
            <div className="alert alert-error">{error}</div> :
            <p className="text-xl"><span className="loading loading-spinner mr-4" ></span>{initStatus || 'Loading'}</p>
        }

        <button className="btn btn-sm btn-primary" onClick={() => navigate(0)}>Reload</button>
      </section>

      {/* <section className="flex flex-row space-x-4">
        <a className="btn btn-sm btn-soft" href="https://www.facebook.com/aiocean.io/" target='_blank'><Github size={16} />GitHub</a>
      </section> */}
  </div>
}
