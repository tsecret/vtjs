import { useAtom } from "jotai"
import { Heart } from "lucide-react"
import { useEffect, useState } from "react"
import atoms from "../utils/atoms"

export const Settings = () => {
  const [version] = useAtom(atoms.version)
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

  useEffect(() => {

    const loadCache = async () => {
      const res: any = await cache?.select('SELECT COUNT(*) from requests')
      setSavedRequests(res[0]['COUNT(*)'])
    }

    loadCache()
  }, [])

  return <div className="flex flex-col space-y-4 p-4">

    <div className="badge badge-soft badge-primary">App version {version}</div>


    <section id="cache" className="flex flex-col space-y-4">
      <label>Cache</label>

      <div className="flex flex-row items-center space-x-2"><span>Saved Requests: {savedRequests}</span></div>

    </section>

    <div className="divider" />

    <section id="analytics" className="space-y-4">

      <label className="label space-x-4">
        <input name="allowAnalytics" type="checkbox" className="toggle" defaultChecked={allowAnalytics} onChange={onChange} />
        <span>Enable analytics</span>
      </label>

      <p className="alert text-sm w-1/2">
        <Heart />Enabling analytics allows us to better understand how you use the app and helps us make the app better for everyone. We are NOT interested in your personal information, cookies, etc. Only app usage is tracked
      </p>

    </section>

  </div>
}
