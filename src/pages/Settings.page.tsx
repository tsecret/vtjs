import { useAtom } from "jotai"
import { useEffect, useState } from "react"
import atoms from "../utils/atoms"
import { Trash2 } from "lucide-react"
import { Store } from "@tauri-apps/plugin-store"

export const Settings = () => {
  const [requestsCache] = useAtom(atoms.requestsCache)
  const [matchesCache] = useAtom(atoms.matchesCache)

  const [savedRequests, setSavedRequests] = useState<any[]>()
  const [savedMatches, setSavedMatches] = useState<any[]>()

  const clearCache = async (key: 'requests' | 'matches') => {
    const c: { [key: string]: Store | undefined } = {
      'requests': requestsCache,
      'matches': matchesCache
    }

    const f: { [key: string]: any } = {
      'requests': setSavedRequests,
      'matches': setSavedMatches
    }

    await c[key]?.clear()

    f[key](await c[key]?.keys())
  }

  useEffect(() => {

    const loadCache = async () => {
      setSavedRequests(await requestsCache?.keys())
      setSavedMatches(await matchesCache?.keys())
    }

    loadCache()
  }, [])

  return <div className="flex flex-col space-y-4 p-4">

    <div className="divider w-9/10 m-auto" />

    <section className="flex flex-col space-y-4">
      <label>Cache</label>

      <div className="flex flex-row items-center space-x-2"><span>Saved Requests: {savedRequests?.length}</span> <Trash2 className="cursor-pointer" size={16} onClick={() => clearCache('requests')}/></div>
      <div className="flex flex-row items-center space-x-2"><span>Saved matches: {savedMatches?.length}</span> <Trash2 className="cursor-pointer" size={16} onClick={() => clearCache('matches')} /></div>

      {/* <button className="btn">Clear Cache</button> */}
    </section>

  </div>
}
