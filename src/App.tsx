
import { useEffect, useState } from "react";
import * as utils from './utils'
import "./App.css";
import { LocalAPI } from "./api";
import { SharedAPI } from "./api/shared";
import { PlayerAccount } from "./interface";

function App() {
  const [lockfile, setLockfile] = useState<any>();
  const [player, setPlayer] = useState<PlayerAccount>()

  async function init(){
    const lockfile = await utils.readLockfile()
    const parsedLockFile = utils.parseLockFile(lockfile)
    setLockfile(parsedLockFile)

    const localapi = new LocalAPI(parsedLockFile)

    const player = await localapi.getPlayerAccount()
    setPlayer(player)

    // const { accessToken, entToken, subject: puuid } = await localapi.getEntitlementToken()
    // const sharedapi = new SharedAPI({ entToken, accessToken })

  }

  useEffect(() => {
    init()
  }, [])

  return (
    <main className="container">
      { player && <span>Logged in as {player?.game_name}#{player?.tag_line}</span> }
      <span>{lockfile?.port} {lockfile?.password}</span>

    </main>
  );
}

export default App;
