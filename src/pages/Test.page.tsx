import atoms from "@/utils/atoms";
import { useAtom } from "jotai";
import { useEffect } from "react"

export const TestPage = () => {
  const [cache] = useAtom(atoms.cache)

  useEffect(() => {
    (async () => {

      console.log('Loading requests')
      const requests = await cache?.select('SELECT endpoint, ttl from requests', [+new Date()])
      console.log('requests', requests)

    })();
  }, [])

  return <div className="p-4">


  </div>
}
