
import { useEffect, useState } from "react";
import { LocalAPI, SharedAPI } from "./api";
import { CurrentGameMatchResponse, PlayerAccount } from "./interface";
import * as utils from './utils';
import "./App.css";


function App() {
  const [lockfile, setLockfile] = useState<any>();
  const [player, setPlayer] = useState<PlayerAccount>()
  const [localapi, setLocalapi] = useState<LocalAPI>()
  const [sharedapi, setSharedapi] = useState<SharedAPI>()
  const [puuid, setpuuid] = useState<string>()
  const [error, setError] = useState<string|null>()

  const [match, setMatch] = useState<CurrentGameMatchResponse>()

  async function init(){
    const lockfile = await utils.readLockfile()
    const parsedLockFile = utils.parseLockFile(lockfile)
    setLockfile(parsedLockFile)

    const localapi = new LocalAPI(parsedLockFile)

    const player = await localapi.getPlayerAccount()
    setPlayer(player)

    const { accessToken, entToken, subject: puuid } = await localapi.getEntitlementToken()
    const sharedapi = new SharedAPI({ entToken, accessToken })

    setpuuid(puuid)
    setLocalapi(localapi)
    setSharedapi(sharedapi)
  }

  async function onCheck(){
    setError(null)
    if (!puuid) return

    const playerInfo = await sharedapi?.getCurrentGamePlayer(puuid)
    console.log('playerInfo', playerInfo)
    if (!playerInfo) {
      setError("No game found")
      return
    }

    const match = await sharedapi?.getCurrentGameMatch(playerInfo.MatchID)
    console.log('match', match)
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <main className="container">

      { error && <span>{error}</span> }
      { match && <span>{match.MatchID} {match.State}</span> }

      { localapi && sharedapi && puuid && <button onClick={onCheck}>Check</button> }

      { player && <span>Logged in as {player?.game_name}#{player?.tag_line}</span> }
      <span>{lockfile?.port} {lockfile?.password}</span>
      { puuid && <span>User ID: {puuid}</span> }
    </main>
  );
}

export default App;
