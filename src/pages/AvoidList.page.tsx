import { AvoidedPlayer } from "@/interface"
import atoms from "@/utils/atoms"
import { useAtom } from "jotai"
import { SquareArrowOutUpRight } from "lucide-react"
import moment from "moment"
import { useEffect, useState } from "react"
import { Link } from "react-router"

export const AvoidListPage = () => {
  const [cache] = useAtom(atoms.cache)
  const [sharedapi] = useAtom(atoms.sharedapi)
  const [players, setPlayers] = useState<(AvoidedPlayer & { name: string, tag: string })[]>()

  useEffect(() => {
    (async () => {
      const list = await cache?.select<AvoidedPlayer[]>('SELECT * FROM players') || []
      const names = await sharedapi?.getPlayerNames(list.map(p => p.puuid))

      setPlayers(
        list.map(p => {
          const name = names?.find(name => name.Subject === p.puuid)

          return {
            ...p,
            name: name?.GameName || '',
            tag: name?.TagLine || ''
          }
        })
      )

    })()
  }, [])

  return <div>
    <section className="max-w-1/2 m-auto">
      <ul className="list bg-base-100 rounded-box shadow-md">
        <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Avoid List</li>

        {
          players?.map(p => (
            <li className="list-row flex flex-row items-center justify-between">
              <div className="space-x-4">
                <span>{moment(p.dodgeTimeStamp).format('HH:mm DD/MM/YY')}</span>
                { p.name && p.tag ? <span>{p.name}<span className="opacity-50 text-xs"> #{p.tag}</span></span> : <span>Name is missing</span> }
              </div>

              <Link to={`/player/${p.puuid}`} className="btn btn-ghost btn-square"><SquareArrowOutUpRight /></Link>
            </li>
          ))
        }

      </ul>
    </section>

  </div>
}
