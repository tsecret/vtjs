import { useAptabase } from '@aptabase/react';
import { getIdentifier, getTauriVersion, getVersion } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api/core';
import Database from '@tauri-apps/plugin-sql';
import { load } from '@tauri-apps/plugin-store';
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router";
import { LocalAPI, SharedAPI } from "./api";
import { TestLocalAPI } from "./api/local.dev";
import { TestSharedAPI } from "./api/shared.dev";
import { StoreAPI } from './api/store';
import { MatchHandler } from './components';
import { Header } from "./components/Header";
import { SocketListener } from './components/SocketListener';
import { FriendsPage } from './pages/Friends.page';
import { InitPage } from './pages/Init.page';
import { Main } from "./pages/Main.page";
import { PlayerPage } from "./pages/Player.page";
import { Settings } from "./pages/Settings.page";
import { StorePage } from './pages/Store.page';
import { WelcomePage } from './pages/Welcome.page';
import * as utils from './utils/utils';
import atoms from './utils/atoms';
import { CACHE_NAME } from './utils/constants';
import { MatchPage } from './pages/Match.page';
import { fetch as httpfetch } from '@tauri-apps/plugin-http';
import { Announcement } from './components/Announcement';

function App() {

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
  const [, setAnnouncement] = useAtom(atoms.announcement)

  const [initStatus, setInitStatus] = useState<string>('Preparing app')
  const [error, setError] = useState<string|null>(null)

  const navigate = useNavigate();
  const { trackEvent } = useAptabase();

  useEffect(() => {
    (async () => {
      const appInfo = {
        version: await getVersion(),
        tauriVersion: await getTauriVersion(),
        identifier: await getIdentifier()
      };

      // Settings
      const store = await load('settings.json', { autoSave: true });
      const allowAnalytics = await store.get('allowAnalytics') ? true : false;
      const firstTimeUserKey = await store.get<boolean | undefined>('firstTimeUser');
      const firstTimeUser = firstTimeUserKey || firstTimeUserKey == undefined ? true : false;

      if (allowAnalytics)
        await trackEvent('app_init');

      setInitStatus('Loading database');
      const db = await Database.load(CACHE_NAME);
      await db.execute('CREATE TABLE IF NOT EXISTS requests (endpoint str PRIMARY KEY, ttl int, data JSON)');
      await db.execute('CREATE TABLE IF NOT EXISTS matches (matchId str PRIMARY KEY, data JSON)');
      await db.execute('CREATE TABLE IF NOT EXISTS players (puuid str PRIMARY KEY, dodge boolean, dodgeTimestamp int)');

      db.execute('ALTER TABLE players ADD COLUMN dodge boolean');
      db.execute('ALTER TABLE players ADD COLUMN dodgeTimestamp int');


      try{
        const ANNOUNCEMENT_URL = 'https://gist.githubusercontent.com/tsecret/0b5f7094000f4063d72276c5e05824aa/raw/announcement.txt'
        const announcement = await httpfetch(ANNOUNCEMENT_URL).then(res => res.text())
        if (announcement)
          setAnnouncement(announcement)

      } catch (err){
        console.error('Failed to fetch announcement: ', err)
      }

      try {
        setInitStatus('Reading lockfile');

        let remoteLockfile = null

        if (import.meta.env.VITE_DEV === 'true')
          remoteLockfile = await httpfetch('http://192.168.31.197:8000').then(res => res.text())

        const { port, password } = utils.parseLockFile(remoteLockfile || await utils.readLockfile());

        setInitStatus('Reading logs');
        const [region, shard] = await utils.readLog()

        const localapi = import.meta.env.VITE_FROM_JSON === 'true' ? new TestLocalAPI({ port: '', password: '' }) :  new LocalAPI({ port, password });
        const player = await localapi.getPlayerAccount();

        setInitStatus('Loading Player');
        const { accessToken, token: entToken, subject: puuid } = await localapi.getEntitlementToken();
        const sharedapi = import.meta.env.VITE_FROM_JSON === 'true' ? new TestSharedAPI({ entToken, accessToken, region, shard }) : new SharedAPI({ entToken, accessToken, region, shard });
        const storeapi = new StoreAPI({ entToken, accessToken, region, shard });

        setAppInfo(appInfo);
        setstore(store);
        setAllowAnalytics(allowAnalytics);
        setFirstTimeUser(firstTimeUser);
        setcache(db);
        setPlayer(player);
        setpuuid(puuid);
        setLocalapi(localapi);
        setSharedapi(sharedapi);
        setStoreapi(storeapi);

        console.log('localapi', localapi);
        console.log('player', player);

        invoke('start_ws', {
          wsUrl: `wss://${import.meta.env.VITE_DEV === 'true' ? '192.168.31.197' : 'localhost'}:${port}`,
          headers: {
            Authorization: `Basic ${password}`,
          },
        });

        if (allowAnalytics)
          await trackEvent('app_load');

        navigate(firstTimeUser ? '/welcome' : '/dashboard');
      } catch (err){
        console.log('err', err);
        setError('Make sure Riot Client is open, and you have logged into your account');
        navigate('/');
      }
    })();
  }, [])

  return <main className="relative select-none cursor-default">
    <Announcement />
    <Header />
    <SocketListener />
    <MatchHandler />
    <Routes>
      <Route path="/" element={<InitPage status={initStatus} error={error} />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/dashboard" element={<Main />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/store" element={<StorePage />} />
      <Route path="/friends" element={<FriendsPage />} />
      <Route path="/player/:puuid" element={<PlayerPage />} />
      <Route path="/match/:matchId" element={<MatchPage />} />
    </Routes>
  </main>
}

export default App;
