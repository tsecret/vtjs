import { useAtom } from "jotai"
import { useEffect, useState } from "react"
import { PresenceResponse } from "../interface"
import { base64Decode, getMap } from "../utils"
import atoms from "../utils/atoms"
import { SquareArrowOutUpRight } from "lucide-react"
import { useNavigate } from "react-router"

// TODO handle LOL

export const FriendsPage = () => {
  const [localapi] = useAtom(atoms.localapi)
  // const [friends, setFriends] = useState<FriendsResponse['friends']>()
  const [presences, setPresences] = useState<PresenceResponse['presences']>()

  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      // const friends = await localapi?.getFriends()
      // if (friends) setFriends(friends.friends)

      const presences = await localapi?.getPresences()
      if (presences) setPresences(presences.presences.filter(p => p.product === 'valorant').map(p => ({...p, presence: p.private ?  JSON.parse(base64Decode(p.private)) : null })))

    })()
  }, [])

  return <div>

    <section className="max-w-1/2 m-auto">
      <ul className="list bg-base-100 rounded-box shadow-md">
        <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Friends in Valorant</li>

        { presences?.map(p => <FriendRow friend={p} onExternalLinkClick={() => navigate('/player/' + p.puuid)} />) }

      </ul>
    </section>

  </div>
}

const FriendRow = ({ friend, onExternalLinkClick }: { friend: PresenceResponse['presences'][0], onExternalLinkClick: () => void }) => {

  const getDescription = () => {

    const queues = {
      'competitive': "Competitive"
    }

    switch (friend.product) {
      case 'valorant':
        return `${queues[friend.presence?.queueId]} ${friend.presence?.partyOwnerMatchScoreAllyTeam}-${friend.presence?.partyOwnerMatchScoreEnemyTeam} on ${getMap(friend.presence?.matchMap).displayName}`
      default:
        break;
    }
  }

  return <li className="list-row" key={friend.puuid}>
      <div><img className="size-10 rounded-box" src={`https://media.valorant-api.com/playercards/${friend.presence?.playerCardId}/displayicon.png`}/></div>

      <div>
        <span className="font-bold">{friend.game_name} <span className="opacity-25">{friend.game_tag}</span></span>
        <div className="text-xs opacity-60">{getDescription()}</div>
      </div>

      { friend.presence.partySize > 1 ? <p className="uppercase self-center">+{friend.presence?.partySize-1} other</p> : null }

      <button className="btn btn-ghost btn-square" onClick={onExternalLinkClick}><SquareArrowOutUpRight /></button>

  </li>
}
