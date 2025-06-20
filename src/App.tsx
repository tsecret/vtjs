
import { useEffect, useState } from "react";
import { LocalAPI, SharedAPI } from "./api";
import { CurrentGameMatchResponse, Match, PlayerAccount, ResultStats } from "./interface";
import * as utils from './utils';
import "./App.css";
import clsx from "clsx";
import { check, Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { Splash } from './components'


function App() {
  const [lockfile, setLockfile] = useState<any>();
  const [player, setPlayer] = useState<PlayerAccount>()
  const [localapi, setLocalapi] = useState<LocalAPI>()
  const [sharedapi, setSharedapi] = useState<SharedAPI>()
  const [puuid, setpuuid] = useState<string>()
  const [error, setError] = useState<string|null>()
  const [update, setUpdate] = useState<Update|null>()
  const [progress, setProgress] = useState<{ step: number, steps: number }>({ step: 0, steps: 0 })

  const [_, setMatch] = useState<CurrentGameMatchResponse>()
  const [stats, setStats] = useState<ResultStats[]>()

  async function checkForUpdate(){
    const update = await check();
    if (update) setUpdate(update)
  }

  async function onUpdate(){
    let downloaded = 0;
    let contentLength = 0;

    await update?.downloadAndInstall(event => {
      switch (event.event) {
        case 'Started':
          contentLength = event.data.contentLength as number;
          console.log(`started downloading ${event.data.contentLength} bytes`);
          break;
        case 'Progress':
          downloaded += event.data.chunkLength;
          console.log(`downloaded ${downloaded} from ${contentLength}`);
          break;
        case 'Finished':
          console.log('download finished');
          break;
      }
    })

    await relaunch()
  }

  async function init(){
    checkForUpdate()

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
      console.log('Checking player', player.Subject)
      setProgress(prevState => ({ step: prevState.step + 1, steps: players.length }))

      // Current and Peak Rank
      const mmr = await sharedapi.getPlayerMMR(player.Subject)
      const { currentRank, currentRR, peakRank } = utils.calculateRanking(mmr)
      const { rankName: currentRankName, rankColor: currentRankColor } = utils.getRank(currentRank)
      const { rankName: rankPeakName, rankColor: rankPeakColor } = utils.getRank(peakRank)

      // Match history and stats
      const { History: matchHistory } = await sharedapi.getPlayerMatchHistory(player.Subject)
      const promises = matchHistory.map(match => sharedapi.getMatchDetails(match.MatchID))
      const matchStats = await Promise.all(promises)

      const { kd, lastGameWon, lastGameScore, accountLevel } = utils.calculateStatsForPlayer(player.Subject, matchStats)
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
        lastGameScore,
        currentRank: currentRankName,
        currentRankColor,
        currentRR,
        rankPeak: rankPeakName,
        rankPeakColor: rankPeakColor,
        accountLevel
      })
    }

    setStats(result)
    setMatch(match)
    setProgress({ step: 0, steps: 0 })
  }

  useEffect(() => {
      init()
  }, [])

  return (
    <main className="p-2 flex flex-col">

      { !lockfile ? <Splash /> : <>

        { error && <div className="alert alert-error my-4">{error}</div> }

        { update && <button className="btn btn-soft btn-primary absolute right-2" onClick={onUpdate}>Update available</button> }

        { progress.steps > 1 && <progress className="progress progress-primary w-56 m-auto my-4" value={progress.step} max={progress.steps}></progress> }

        {/* table */}
        {
          stats &&
          <section className="overflow-x-auto max-w-1/2 mx-auto my-4">
            <table className="table table-xs">

              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Player</th>
                  <th>Rank</th>
                  <th>Peak Rank</th>
                  <th>LVL</th>
                  <th>K/D</th>
                  <th>Last Game</th>
                </tr>
              </thead>

              <tbody>
                { stats.map((player) => (
                  <tr key={player.puuid} className={player.puuid === puuid ? "bg-base-100" : ""}>
                    <td className="flex flex-row items-center"><img src={player.agentImage} className='max-h-6 mr-4' /> {player.agentName}</td>
                    <th><span>{player.name}</span><span className="text-gray-500">#{player.tag}</span> </th>
                    <th><span style={{ color: `#${player.currentRankColor}` }}>{player.currentRank} (RR {player.currentRR})</span></th>
                    <th><span style={{ color: `#${player.rankPeakColor}` }}>{player.rankPeak}</span></th>
                    <th>{player.accountLevel}</th>
                    <td>{player.kd}</td>
                    <td><span className={clsx(player.lastGameScore === 'N/A' ? null : player.lastGameWon ? 'text-green-400' : 'text-red-500')}>{player.lastGameScore}</span></td>
                  </tr>
                )) }
              </tbody>

            </table>
          </section>
        }

        { localapi && sharedapi && puuid && <button className="btn btn-primary btn-wide mx-auto" onClick={onCheck}>Check current game</button> }

        {/* debug */}
        <section className="flex flex-row rounded-xl bg-base-100 p-4 text-sm mt-8">
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
