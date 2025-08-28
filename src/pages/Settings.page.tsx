import { GameSettingsResponse } from "@/interface"
import clsx from "clsx"
import { useAtom } from "jotai"
import { Heart } from "lucide-react"
import { useEffect, useState } from "react"
import atoms from "../utils/atoms"

export const Settings = () => {
  const [appInfo] = useAtom(atoms.appInfo)
  const [cache] = useAtom(atoms.cache)
  const [store] = useAtom(atoms.store)
  const [allowAnalytics, setAllowAnalytics] = useAtom(atoms.allowAnalytics)
  const [sharedapi] = useAtom(atoms.sharedapi)
  const [player] = useAtom(atoms.player)

  const [clearingCache, setClearingCache] = useState<boolean>(false)
  const [savedRequests, setSavedRequests] = useState<number>()
  const [savedMatches, setSavedMatces] = useState<number>()
  const [dodgedPlayers, setDodgedPlayers] = useState<number>()

  const [savedGameSettings, setGameSettings] = useState<{ name: string, data: GameSettingsResponse } |null>(null)
  const [gameSettingsState, setGameSettingsState] = useState<{ copied: boolean, pasted: boolean, modifying: boolean }>({ copied: false, pasted: false, modifying: false })

  async function onChange(event: React.ChangeEvent<HTMLInputElement>){
    switch (event.target.name) {
      case 'allowAnalytics':
        setAllowAnalytics(event.target.checked);
        await store?.set('allowAnalytics', event.target.checked)
        break;
    }
  }

  async function clearCache(){
    setClearingCache(true)

    const response = await cache?.execute('DELETE FROM requests WHERE ttl <= $1', [+new Date()])
    if (savedRequests && response)
      setSavedRequests(savedRequests - response.rowsAffected)

    setClearingCache(false)
  }

  async function clearAllCache(){
    setClearingCache(true)

    const requests = await cache?.execute('DELETE FROM requests')
    const matches = await cache?.execute('DELETE FROM matches')

    if (savedRequests && requests)
      setSavedRequests(savedRequests - requests?.rowsAffected)

    if (savedMatches && matches)
    setSavedMatces(savedMatches - matches?.rowsAffected)

    setClearingCache(false)
  }

  async function copyGameSettings(){
    setGameSettingsState({ ...gameSettingsState, modifying: true })

    const settings = await sharedapi!.getGameSettings()
    if (settings){
      await store?.set('gamesettings', { name: player!.game_name, data: settings })
      setGameSettings({ name: player!.game_name, data: settings })
      setGameSettingsState({ ...gameSettingsState, copied: true, modifying: false })
      return
    }

    setGameSettingsState({ ...gameSettingsState, modifying: false })
  }

  async function pasteGameSettings(){
    if (!savedGameSettings) return

    setGameSettingsState({ ...gameSettingsState, modifying: true })

    const response = await sharedapi?.setGameSettings(savedGameSettings.data)
    if (response){
      setGameSettingsState({ ...gameSettingsState, pasted: true, modifying: false })
      return
    }

    setGameSettingsState({ ...gameSettingsState, modifying: false })
  }

  useEffect(() => {
    (async () => {
      const requests: any = await cache?.select('SELECT COUNT(*) from requests')
      setSavedRequests(requests[0]['COUNT(*)'])

      const matches: any = await cache?.select('SELECT COUNT(*) from matches')
      setSavedMatces(matches[0]['COUNT(*)'])

      const retards: any  = await cache?.select('SELECT COUNT(*) from players WHERE dodge = "true"')
      setDodgedPlayers(retards[0]['COUNT(*)'])


    })();

    (async () => {

      const settings: { name: string, data: GameSettingsResponse } | undefined = await store?.get('gamesettings')
      if (settings)
        setGameSettings(settings)

    })();
  }, [])

  return <div className="flex flex-col space-y-4 p-4 max-w-md m-auto">

    <section className="flex flex-row items-center space-x-2 text-xs">
      <div className="border-2 rounded-md p-2">App version {appInfo?.version}</div>
      <div className="border-2 rounded-md p-2">Tauri version {appInfo?.tauriVersion}</div>
      <div className="border-2 rounded-md p-2">Identifier {appInfo?.identifier}</div>
    </section>

    <div className="divider" />

    {/* App Settings */}
    {/* <section className="flex flex-col space-y-4">
      <h2>App Settings</h2>

      <label className="label space-x-4">
        <input name="allowAnalytics" type="checkbox" className="toggle" defaultChecked={allowAnalytics} onChange={onChange} />
        <span>Show Hidden Player Names</span>
      </label>
    </section> */}

    {/* <div className="divider" /> */}

    {/* Game Settings */}
    <section id="cache" className="flex flex-col space-y-4">

      <h2>Game Settings</h2>

      <p className="">VTJS allows you to easily copy and paste game settings like Mouse and ADS sensitivity, minimap config and keybinds from one account to another</p>

      <div className="alert alert-dash">
        <ol className="text-sm">
          <li>1. Log into account you want to copy the settings from</li>
          <li>2. Press <span className="badge badge-sm">Save Current Settings</span> button</li>
          <li>3. Log into account you want to paste the settings to</li>
          <li>4. Press <span className="badge badge-sm">Load Saved Settings</span></li>
          <li>5. Launch Valorant and check</li>
        </ol>
      </div>

      { savedGameSettings && <p>Settings saved for account: {savedGameSettings.name}</p> }

      <div className="flex flex-row items-center space-x-2">
        <button className={clsx("btn flex-1 btn-sm", gameSettingsState.copied && 'btn-success')} disabled={gameSettingsState.modifying} onClick={copyGameSettings}>{ gameSettingsState.copied ? 'Saved' : 'Save Current Settings' }</button>
        <button className={clsx("btn flex-1 btn-sm", gameSettingsState.pasted && 'btn-success')} disabled={gameSettingsState.modifying || !savedGameSettings} onClick={pasteGameSettings}>{gameSettingsState.pasted ? 'Loaded' : 'Load Saved Settings'}</button>
      </div>
    </section>

    <div className="divider" />

    {/* Cache */}
    <section id="cache" className="flex flex-col space-y-4">
      <h2>Cache</h2>

      <div>
        <div className="flex flex-row items-center space-x-2"><span>Saved requests: {savedRequests}</span></div>
        <div className="flex flex-row items-center space-x-2"><span>Saved matches: {savedMatches}</span></div>
        <div className="flex flex-row items-center space-x-2"><span>Avoid list: {dodgedPlayers}</span></div>
      </div>

      <p>Its okay to have lots of requests cached, especially if you play daily. But if you feel like the app is lagging, try clearing the cache</p>

      <div className="flex flex-row items-center space-x-2">
        <button className="btn flex-1 btn-sm btn-warning" disabled={clearingCache} onClick={clearCache}>Clear Old Cache</button>
        <button className="btn flex-1 btn-sm btn-error" disabled={clearingCache} onClick={clearAllCache}>Clear All Cache</button>
      </div>
    </section>

    <div className="divider" />

    {/* Privacy */}
    <section id="analytics" className="space-y-4">
      <h2>Privacy</h2>

      <label className="label space-x-4">
        <input name="allowAnalytics" type="checkbox" className="toggle" defaultChecked={allowAnalytics} onChange={onChange} />
        <span>Enable analytics</span>
      </label>

      <div className="alert alert-dash text-sm">
        <Heart />Enabling analytics allows us to better understand how you use the app and helps us make the app better for everyone. We are NOT interested in your personal information, cookies, etc. Only app usage is tracked
      </div>

    </section>

  </div>
}
