import { useAtom } from "jotai"
import { Heart } from "lucide-react"
import { useEffect, useState } from "react"
import atoms from "../utils/atoms"

export const Settings = () => {
  const [appInfo] = useAtom(atoms.appInfo)
  const [cache] = useAtom(atoms.cache)
  const [store] = useAtom(atoms.store)
  const [allowAnalytics, setAllowAnalytics] = useAtom(atoms.allowAnalytics)

  const [savedRequests, setSavedRequests] = useState<number>()

  async function onChange(event: React.ChangeEvent<HTMLInputElement>){
    switch (event.target.name) {
      case 'allowAnalytics':
        setAllowAnalytics(event.target.checked);
        await store?.set('allowAnalytics', event.target.checked)
        break;
    }
  }

  async function clearCache(){
    const response = await cache?.execute('DELETE FROM requests WHERE ttl <= $1', [+new Date()])
    if (savedRequests && response)
      setSavedRequests(savedRequests - response.rowsAffected)
  }

  useEffect(() => {

    const loadCache = async () => {
      const res: any = await cache?.select('SELECT COUNT(*) from requests')
      setSavedRequests(res[0]['COUNT(*)'])
    }

    loadCache()
  }, [])

  return <div className="flex flex-col space-y-4 p-4 max-w-md m-auto">

    <section className="flex flex-row items-center space-x-2 text-xs">
      <div className="border-2 rounded-md p-2">App version {appInfo?.version}</div>
      <div className="border-2 rounded-md p-2">Tauri version {appInfo?.tauriVersion}</div>
      <div className="border-2 rounded-md p-2">Identifier {appInfo?.identifier}</div>
    </section>

    <div className="divider" />

    <section id="cache" className="flex flex-col space-y-4">
      <h2>Cache</h2>

      <div className="flex flex-row items-center space-x-2"><span>Saved Requests: {savedRequests}</span></div>

      <p className="alert">Its okay to have lots of requests cached, especially if you play daily. But if you feel like the app is lagging, try clearing the cache</p>

      <button className="btn btn-small btn-sm btn-warning" onClick={clearCache}>Clear Old Cache</button>
    </section>

    <div className="divider" />

    <section id="analytics" className="space-y-4">
      <h2>Privacy</h2>

      <label className="label space-x-4">
        <input name="allowAnalytics" type="checkbox" className="toggle" defaultChecked={allowAnalytics} onChange={onChange} />
        <span>Enable analytics</span>
      </label>

      <p className="alert text-sm">
        <Heart />Enabling analytics allows us to better understand how you use the app and helps us make the app better for everyone. We are NOT interested in your personal information, cookies, etc. Only app usage is tracked
      </p>

    </section>

  </div>
}
