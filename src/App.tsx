
import { useEffect, useState } from "react";
import { LocalAPI, SharedAPI } from "./api";
import { CurrentGameMatchResponse, Match, PlayerAccount, ResultStats } from "./interface";
import * as utils from './utils';
import "./App.css";
import clsx from "clsx";
import { check, Update } from '@tauri-apps/plugin-updater';
// import { relaunch } from '@tauri-apps/plugin-process';
import { Splash } from './components'


function App() {
  const [lockfile, setLockfile] = useState<any>();
  const [player, setPlayer] = useState<PlayerAccount>()
  const [localapi, setLocalapi] = useState<LocalAPI>()
  const [sharedapi, setSharedapi] = useState<SharedAPI>()
  const [puuid, setpuuid] = useState<string>()
  const [error, setError] = useState<string|null>()
  const [update, setUpdate] = useState<Update|null>()

  const [_, setMatch] = useState<CurrentGameMatchResponse>()
  const [stats, setStats] = useState<ResultStats[]>([])

  async function checkForUpdate(){
    const update = await check();
    if (update) setUpdate(update)

    await utils.sleep()
  }

  //@ts-ignore
  async function init(){
    await checkForUpdate()
    utils.sleep()

    const lockfile = await utils.readLockfile()
    const parsedLockFile = utils.parseLockFile(lockfile)
    console.log('parsedLockFile.password', parsedLockFile.password)
    setLockfile(parsedLockFile)

    const localapi = new LocalAPI(parsedLockFile)

    const player = await localapi.getPlayerAccount()
    setPlayer(player)

    const { accessToken, token: entToken, subject: puuid } = await localapi.getEntitlementToken()
    console.log('accessToken', accessToken)
    console.log('entToken', entToken)
    const sharedapi = new SharedAPI({ entToken, accessToken })

    setpuuid(puuid)
    setLocalapi(localapi)
    setSharedapi(sharedapi)
  }

  async function onCheck(){
    setError(null)
    if (!puuid || !localapi || !sharedapi) return

    let result: ResultStats[] = []

    const playerInfo = await sharedapi?.getCurrentGamePlayer(puuid)

    if (!playerInfo) {
      setError("No game found")
      return
    }

    const match = await sharedapi?.getCurrentGameMatch(playerInfo.MatchID)
    const puuids = utils.extractPlayers(match)
    const players = await sharedapi.getPlayerNames(puuids)

    for (const player of players){
      console.log('Checking player', player.GameName, player.Subject)
      const { History: matchHistory } = await sharedapi.getPlayerMatchHistory(player.Subject)

      const promises = matchHistory.map(match => sharedapi.getMatchdetails(match.MatchID))
      const matchStats = await Promise.all(promises)

      const { kd, lastGameWon, lastGameScore } = utils.calculateStatsForPlayer(player.Subject, matchStats)

      const { uuid: agentId, name: agentName, img: agentImage } = utils.getAgent(match.Players.find(_player => _player.Subject === player.Subject)?.CharacterID as Match['Players'][0]['CharacterID'])

      result.push({
        name: player.GameName,
        tag: player.TagLine,
        puuid: player.Subject,
        kd,
        agentId: agentId || 'N/A',
        agentName: agentName || 'N/A',
        agentImage: agentImage || 'N/A',
        lastGameWon,
        lastGameScore
      })

      await utils.sleep()
    }

    setStats(result)
    setMatch(match)
  }

  useEffect(() => {
      init()
  }, [])

  return (
    <main className="p-2 flex flex-col">

      { !lockfile ? <Splash /> : <>

        { error && <div className="alert alert-error my-4">{error}</div> }

        {
          update && <div className="alert alert-info cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-6 w-6 shrink-0 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Update available. Click to update
            </div>
        }

        <div className="overflow-x-auto max-w-1/2 mx-auto my-4">
          <table className="table table-xs">

            <thead>
              <tr>
                <th>Agent</th>
                <th>Player</th>
                <th>K/D</th>
                <th>Last Game</th>
              </tr>
            </thead>

            <tbody>
              { stats.map((player) => (
                <tr className={player.puuid === puuid ? "bg-base-100" : ""}>
                  <td className="flex flex-row items-center"><img src={player.agentImage} className='max-h-6 mr-4' /> {player.agentName}</td>
                  <th><span>{player.name}</span><span className="text-gray-500">#{player.tag}</span> </th>
                  <td>{player.kd}</td>
                  <td><span className={clsx(player.lastGameWon ? 'text-green-400' : 'text-red-500')}>{player.lastGameScore}</span></td>
                </tr>
              )) }
            </tbody>

          </table>
        </div>

        { localapi && sharedapi && puuid && <button className="btn btn-primary btn-wide mx-auto" onClick={onCheck}>Check current game</button> }

        {/* debug */}
        <section className="flex flex-row absolute bottom-2 rounded-xl bg-base-100 p-4 text-sm">
            <span>Logged in as {player?.game_name}#{player?.tag_line}</span>
            <div className="divider divider-horizontal" />
            <span>Riot Client Port: {lockfile?.port}</span>
            <div className="divider divider-horizontal" />
            <span>Lockfile Password: {lockfile?.password}</span>
        </section>

      </> }

    </main>
  );
}

export default App;
