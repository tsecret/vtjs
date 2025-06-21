import { load } from "@tauri-apps/plugin-store";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { LocalAPI, SharedAPI } from "./api";
import "./App.css";
import { Splash } from "./components";
import { Pages } from "./interface/Pages.enum";
import { Main } from "./pages/Main.page";
import { Settings } from "./pages/Settings.page";
import * as utils from './utils';
import atoms from './utils/atoms';
import { MATCHES_CACHE_NAME, REQUEST_CACHE_NAME } from "./utils/constants";
import { Header } from "./components/Header";


function App() {
  const [page, setPage] = useAtom(atoms.page)
  const [, setPlayer] = useAtom(atoms.player)
  const [, setLocalapi] = useAtom(atoms.localapi)
  const [, setSharedapi] = useAtom(atoms.sharedapi)
  const [, setpuuid] = useAtom(atoms.puuid)

  const [, setRequestsCache] = useAtom(atoms.requestsCache)
  const [, setMatchesCache] = useAtom(atoms.matchesCache)

  async function init(){

    setRequestsCache(await load(REQUEST_CACHE_NAME, { autoSave: false }))
    setMatchesCache(await load(MATCHES_CACHE_NAME, { autoSave: true }))

    const localapi = new LocalAPI(utils.parseLockFile(await utils.readLockfile()))
    const player = await localapi.getPlayerAccount()

    const { accessToken, token: entToken, subject: puuid } = await localapi.getEntitlementToken()
    const sharedapi = new SharedAPI({ entToken, accessToken })

    setPlayer(player)
    setpuuid(puuid)
    setLocalapi(localapi)
    setSharedapi(sharedapi)

    setPage(Pages.MAIN)
  }

  const renderPage = () => {
    switch (page) {
      case Pages.MAIN:
        return <Main />
      case Pages.SETTINGS:
        return <Settings />
      case Pages.SPLASH:
        return <Splash />
    }
  }

  useEffect(() => {
    init()
  }, [])

  return <main>
    <Header />
    {renderPage()}
  </main>
}

export default App;
