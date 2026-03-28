import { useAptabase } from '@aptabase/react';
import { getIdentifier, getTauriVersion, getVersion } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api/core';
import { fetch as httpfetch } from '@tauri-apps/plugin-http';
import Database from '@tauri-apps/plugin-sql';
import { load } from '@tauri-apps/plugin-store';
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router";
import { LocalAPI, SharedAPI } from "./api";
import { TestLocalAPI } from "./api/local.dev";
import { TestSharedAPI } from "./api/shared.dev";
import { StoreAPI } from './api/store';
import { MatchHandler } from './components';
import { Announcement } from './components/Announcement';
import { Header } from "./components/Header";
import { RateLimitNotification } from './components/RateLimitAlert';
import { SocketListener } from './components/SocketListener';
import { Sync } from './components/Sync';
import { TestDial } from './components/TestDial';
import { AvoidListPage } from './pages/AvoidList.page';
import { FriendsPage } from './pages/Friends.page';
import { InitPage } from './pages/Init.page';
import { Main } from "./pages/Main.page";
import { MatchPage } from './pages/Match.page';
import { ProfilePage } from "./pages/Profile.page";
import { Settings } from "./pages/Settings.page";
import { StorePage } from './pages/Store.page';
import { TestPage } from './pages/Test.page';
import { WelcomePage } from './pages/Welcome.page';
import { AppServices, ServicesProvider } from './lib/services';
import atoms from './utils/atoms';
import { CACHE_NAME } from './utils/constants';
import * as utils from './utils/utils';

function App() {

  const setAppInfo = useSetAtom(atoms.appInfo)
  const setPlayer = useSetAtom(atoms.player)
  const setpuuid = useSetAtom(atoms.puuid)
  const setAllowAnalytics = useSetAtom(atoms.allowAnalytics)
  const setFirstTimeUser = useSetAtom(atoms.firstTimeUser)
  const setAnnouncement = useSetAtom(atoms.announcement)
  const setPenalty = useSetAtom(atoms.penalty)
  const setRateLimitNotification = useSetAtom(atoms.rateLimitNotification)

  const [initStatus, setInitStatus] = useState<string>('Preparing app')
  const [error, setError] = useState<string|null>(null)
  const [services, setServices] = useState<AppServices | null>(null)

  const navigate = useNavigate();
  const { trackEvent } = useAptabase();

  useEffect(() => {
    (async () => {

      const [appVersion, tauriVersion, identifier] = await Promise.all([getVersion(), getTauriVersion(), getIdentifier()])
      const appInfo = { appVersion, tauriVersion, identifier };

      // Settings
      const store = await load('settings.json');
      const allowAnalytics = await store.get('allowAnalytics') ? true : false;
      const firstTimeUserKey = await store.get<boolean | undefined>('firstTimeUser');
      const firstTimeUser = firstTimeUserKey || firstTimeUserKey == undefined ? true : false;

      if (allowAnalytics)
        await trackEvent('app_init');

      setInitStatus('Loading database');
      const db = await Database.load(CACHE_NAME);
      await db.execute('CREATE TABLE IF NOT EXISTS requests (endpoint str PRIMARY KEY, ttl int, data JSON)');
      await db.execute('CREATE TABLE IF NOT EXISTS players (puuid str PRIMARY KEY, dodge boolean, dodgeTimestamp int)');

      setInitStatus('Cleaning cache');
      await db.execute('DELETE FROM requests WHERE ttl <= $1', [+new Date()]);

      try {
        const ANNOUNCEMENT_URL = 'https://gist.githubusercontent.com/tsecret/0b5f7094000f4063d72276c5e05824aa/raw/announcement.txt'
        const announcement = await httpfetch(ANNOUNCEMENT_URL).then(res => res.text())
        if (announcement)
          setAnnouncement(announcement)
      } catch (err){
        console.error('Failed to fetch announcement: ', err)
      }

      try {
        setInitStatus('Reading lockfile');
        const { port, password } = utils.parseLockFile(await utils.readLockfile());

        setInitStatus('Reading logs');
        const [region, shard] = await utils.readLog()

        const localapi = import.meta.env.VITE_FROM_JSON === 'true' ? new TestLocalAPI({ port: '', password: '' }) :  new LocalAPI({ port, password });
        const player = await localapi.getPlayerAccount();

        setInitStatus('Loading Player');
        const { accessToken, token: entToken, subject: puuid } = await localapi.getEntitlementToken();
        const sharedapi = import.meta.env.VITE_FROM_JSON === 'true' ? new TestSharedAPI({ entToken, accessToken, region, shard }) : new SharedAPI({ entToken, accessToken, region, shard });
        const storeapi = new StoreAPI({ entToken, accessToken, region, shard });

        const penalties = await sharedapi.getPenalties()
        if (penalties?.Infractions.length){
          const penalty = utils.extractPenalties(penalties)
          if (penalty) setPenalty(penalty)
        }

        sharedapi.setRateLimitCallback((retryAfter: number) => {
          setRateLimitNotification({ isActive: true, retryAfter })
        })

        setAppInfo(appInfo);
        setAllowAnalytics(allowAnalytics);
        setFirstTimeUser(firstTimeUser);
        setPlayer(player);
        setpuuid(puuid);
        setServices({ cache: db, localapi, sharedapi, storeapi, store })

        console.log('localapi', localapi);
        console.log('player', player);

        invoke('start_ws', {
          wsUrl: `wss://${import.meta.env.VITE_DEV === 'true' ? import.meta.env.VITE_REMOTE_PC_IP : 'localhost'}:${port}`,
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

  return <ServicesProvider value={services}>
    <main className="relative select-none cursor-default">
      <Announcement />
      <Header />
      <SocketListener />
      <RateLimitNotification />
      <MatchHandler />
      <Sync />
      <TestDial />
      <Routes>
        <Route path="/" element={<InitPage status={initStatus} error={error} />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/dashboard" element={<Main />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/player/:puuid" element={<ProfilePage />} />
        <Route path="/match/:matchId" element={<MatchPage />} />
        <Route path="/avoid-list" element={<AvoidListPage />} />
      </Routes>
    </main>
  </ServicesProvider>
}

export default App;
