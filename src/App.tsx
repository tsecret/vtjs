import { useAptabase } from '@aptabase/react';
import { getVersion } from '@tauri-apps/api/app';
import Database from '@tauri-apps/plugin-sql';
import { load } from '@tauri-apps/plugin-store';
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router";
import { LocalAPI, SharedAPI } from "./api";
import { TestLocalAPI } from "./api/local.dev";
import { TestSharedAPI } from "./api/shared.dev";
import "./App.css";
import { Splash } from "./components";
import { Header } from "./components/Header";
import { Main } from "./pages/Main.page";
import { PlayerDetails } from "./pages/PlayerDetails.page";
import { Settings } from "./pages/Settings.page";
import { WelcomePage } from './pages/Welcome.page';
import * as utils from './utils';
import atoms from './utils/atoms';
import { CACHE_NAME } from './utils/constants';

function App() {
  const [, setVersion] = useAtom(atoms.version)
  const [, setPlayer] = useAtom(atoms.player)
  const [, setLocalapi] = useAtom(atoms.localapi)
  const [, setSharedapi] = useAtom(atoms.sharedapi)
  const [, setpuuid] = useAtom(atoms.puuid)
  const [, setcache] = useAtom(atoms.cache)
  const [, setstore] = useAtom(atoms.store)
  const [, setAllowAnalytics] = useAtom(atoms.allowAnalytics)
  const [, setFirstTimeUser] = useAtom(atoms.firstTimeUser)

  const [initStatus, setInitStatus] = useState<string>('Preparing app')

  const navigate = useNavigate();
  const { trackEvent } = useAptabase();

  async function init(){

    // App version
    setVersion(await getVersion())

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

    setcache(db)

    setInitStatus('Loading Lockfile')
    const localapi = import.meta.env.VITE_FROM_JSON === 'true' ? new TestLocalAPI({ port: '', password: '' }) :  new LocalAPI(utils.parseLockFile(await utils.readLockfile()))
    console.log('localapi', localapi)
    const player = await localapi.getPlayerAccount()
    console.log('player', player)

    setInitStatus('Loading Player')
    const { accessToken, token: entToken, subject: puuid } = await localapi.getEntitlementToken()
    const sharedapi = import.meta.env.VITE_FROM_JSON === 'true' ? new TestSharedAPI({ entToken, accessToken }) : new SharedAPI({ entToken, accessToken })

    setPlayer(player)
    setpuuid(puuid)
    setLocalapi(localapi)
    setSharedapi(sharedapi)

    navigate(firstTimeUser ? '/welcome' : '/dashboard')
  }

  useEffect(() => {
    init()
  }, [])

  return <main className="relative">
    <Header />
    <Routes>
      <Route path="/" element={<Splash status={initStatus} />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/dashboard" element={<Main />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/player/:puuid" element={<PlayerDetails />} />
    </Routes>
  </main>
}

export default App;
