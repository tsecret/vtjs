import atoms from "@/utils/atoms"
import { useAtom } from "jotai"
import { useEffect } from "react"

export const Sync = () => {
  const [puuid] = useAtom(atoms.puuid)
  const [sharedapi] = useAtom(atoms.sharedapi)
  const [party] = useAtom(atoms.party)
  const [, setPrefetching] = useAtom(atoms.prefetching)


  useEffect(() => {
    if (!puuid || !sharedapi) return

    (async () => {

      try {
        setPrefetching(true)
        const { History } = await sharedapi.getPlayerMatchHistory(puuid)

        for (const match of History){
          await sharedapi.getMatchDetails(match.MatchID)
        }

      } catch (err) {
        console.error('Failed to sync: ', err)
      } finally {
        setPrefetching(false)
      }
    })()

  }, [puuid])

  useEffect(() => {
    if (!sharedapi) return

    (async () => {

    try {
      setPrefetching(true)

      for (const member of party){
        if (member.puuid === puuid) continue

        const { History } = await sharedapi.getPlayerMatchHistory(member.puuid)

        for (const match of History){
          await sharedapi.getMatchDetails(match.MatchID)
        }
      }


    } catch (err) {
      console.error('Failed to sync: ', err)
    } finally {
      setPrefetching(false)
    }
    })()

  }, [party])

  return null
}
