
import { useEffect, useState } from "react";
import { LocalAPI, SharedAPI } from "./api";
import { CurrentGameMatchResponse, Match, PlayerAccount, ResultStats } from "./interface";
import * as utils from './utils';
import "./App.css";
import clsx from "clsx";

function App() {
  const [lockfile, setLockfile] = useState<any>();
  const [player, setPlayer] = useState<PlayerAccount>()
  const [localapi, setLocalapi] = useState<LocalAPI>()
  const [sharedapi, setSharedapi] = useState<SharedAPI>()
  const [puuid, setpuuid] = useState<string>()
  const [error, setError] = useState<string|null>()

  const [_, setMatch] = useState<CurrentGameMatchResponse>()
  const [stats, setStats] = useState<ResultStats[]>([])

  async function init(){
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
    <main className="p-8 flex flex-col">
      { error && <div className="alert alert-error my-4">{error}</div> }

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
      <section className="my-4 opacity-50 flex flex-col">
        { player && <span>Logged in as {player?.game_name}#{player?.tag_line}</span> }
        <span>{lockfile?.port} {lockfile?.password}</span>
        { puuid && <span>User ID: {puuid}</span> }
      </section>
    </main>
  );
}

export default App;
