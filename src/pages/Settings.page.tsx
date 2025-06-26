import { useAtom } from "jotai"
import { useEffect, useState } from "react"
import atoms from "../utils/atoms"

export const Settings = () => {
  const [cache] = useAtom(atoms.cache)

  const [savedRequests, setSavedRequests] = useState<[[string, number, any]]>()

  useEffect(() => {

    const loadCache = async () => {
      setSavedRequests(await cache?.select('SELECT * from requests'))
    }

    loadCache()
  }, [])

  return <div className="flex flex-col space-y-4 p-4">

    <div className="divider w-9/10 m-auto" />

    <section className="flex flex-col space-y-4">
      <label>Cache</label>

      <div className="flex flex-row items-center space-x-2"><span>Saved Requests: {savedRequests?.length}</span></div>

      {/* <button className="btn">Clear Cache</button> */}
    </section>

  </div>
}
