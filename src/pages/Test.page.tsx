import { useServices } from "@/lib/services";
import { useEffect } from "react"

export const TestPage = () => {
  const services = useServices()
  const cache = services?.cache

  useEffect(() => {
    (async () => {

      console.log('Loading requests')
      const requests = await cache?.select('SELECT endpoint, ttl from requests', [+new Date()])
      console.log('requests', requests)

    })();
  }, [cache])

  return <div className="p-4">


  </div>
}
