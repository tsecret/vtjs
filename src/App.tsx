import { load } from "@tauri-apps/plugin-store";
import { useAtom } from "jotai";
import { useEffect } from "react";
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
import * as utils from './utils';
import atoms from './utils/atoms';
import { MATCHES_CACHE_NAME, REQUEST_CACHE_NAME } from "./utils/constants";

function App() {
  const [, setPlayer] = useAtom(atoms.player)
  const [, setLocalapi] = useAtom(atoms.localapi)
  const [, setSharedapi] = useAtom(atoms.sharedapi)
  const [, setpuuid] = useAtom(atoms.puuid)

  const [, setRequestsCache] = useAtom(atoms.requestsCache)
  const [, setMatchesCache] = useAtom(atoms.matchesCache)

  const navigate = useNavigate();

  async function init(){

    setRequestsCache(await load(REQUEST_CACHE_NAME, { autoSave: false }))
    setMatchesCache(await load(MATCHES_CACHE_NAME, { autoSave: true }))


    const localapi = import.meta.env.VITE_FROM_JSON === 'true' ? new TestLocalAPI({ port: '', password: '' }) :  new LocalAPI(utils.parseLockFile(await utils.readLockfile()))
    const player = await localapi.getPlayerAccount()

    console.log('localapi', localapi)

    const { accessToken, token: entToken, subject: puuid } = await localapi.getEntitlementToken()
    const sharedapi = import.meta.env.VITE_FROM_JSON === 'true' ? new TestSharedAPI({ entToken, accessToken }) : new SharedAPI({ entToken, accessToken })

    setPlayer(player)
    setpuuid(puuid)
    setLocalapi(localapi)
    setSharedapi(sharedapi)

    navigate('/dashboard')
  }

  useEffect(() => {
    init()
  }, [])

  return <main>
    <Header />
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/dashboard" element={<Main />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/player/:puuid" element={<PlayerDetails />} />
    </Routes>
  </main>
}

export default App;
