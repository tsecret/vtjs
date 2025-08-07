import { useAtom } from "jotai"
import { SquareArrowOutUpRight } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { FriendsResponse, PresenceResponse } from "../interface"
import { base64Decode, getMap } from "../utils"
import atoms from "../utils/atoms"

export const FriendsPage = () => {
  const [localapi] = useAtom(atoms.localapi)
  const [friends, setFriends] = useState<FriendsResponse['friends']>()
  const [presences, setPresences] = useState<PresenceResponse['presences']>()

  const navigate = useNavigate()
  const ingameFriendsPuuids = presences?.map(p => p.puuid)

  useEffect(() => {
    (async () => {
      const friends = await localapi?.getFriends()
      if (friends) setFriends(friends.friends)

      const presences = await localapi?.getPresences()
      if (presences) setPresences(presences.presences.filter(p => p.private).map(p => ({...p, presence: p.private ? JSON.parse(base64Decode(p.private)) : null })))

    })()
  }, [])

  return <div>

    <section className="max-w-1/2 m-auto">
      <ul className="list bg-base-100 rounded-box shadow-md">
        <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Friends in Valorant</li>

        {
          presences?.length ?
            presences.filter(p => p.product === 'valorant').map(p => <IngameFriendRow key={p.puuid} friend={p} onExternalLinkClick={() => navigate(`/player/${p.puuid}`)} />) :
            <span className="p-4">No friends online</span>
        }

        <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Other Friends</li>

        {
          presences?.length ?
            presences.filter(p => p.product !== 'valorant').map(p => <IngameFriendRow key={p.puuid} friend={p} onExternalLinkClick={() => navigate(`/player/${p.puuid}`)} />) :
            <span className="p-4">No friends online</span>
        }

        {
          friends?.length ?
            friends
              .filter(friend => !ingameFriendsPuuids?.includes(friend.puuid))
              .sort((a, b) => a.game_name.localeCompare(b.game_name))
              .map(friend => <FriendRow key={friend.puuid} friend={friend} onExternalLinkClick={() => navigate(`/player/${friend.puuid}`)} />) :
            <span className="p-4">No friends online</span>
        }

      </ul>
    </section>

  </div>
}

const IngameFriendRow = ({ friend, onExternalLinkClick }: { friend: PresenceResponse['presences'][0], onExternalLinkClick: () => void }) => {

  const getDescription = () => {

    const queues = {
      'competitive': "Competitive",
      'deathmatch': 'Deathmatch',
      'swiftplay': 'Swiftplay',
    }

    switch (friend.product) {
      case 'valorant':

        if (!friend.presence)
          return ''

        if (friend.presence?.sessionLoopState === 'MENUS'){
          return 'In Menu'
        }

        return `${queues[friend.presence?.queueId] || 'Playing'} ${friend.presence?.partyOwnerMatchScoreAllyTeam}-${friend.presence?.partyOwnerMatchScoreEnemyTeam} on ${getMap(friend.presence.matchMap).displayName}`
      case 'league_of_legends':
        return 'Playing League of Legends'
      default:
        break;
    }
  }

  const getUrl = () => {
    if (friend.product === 'valorant')
      return `https://media.valorant-api.com/playercards/${friend.presence?.playerCardId}/displayicon.png`

    if (friend.product === 'league_of_legends')
      return 'https://wiki.leagueoflegends.com/en-us/images/League_of_Legends_icon.svg?b3310'

    return ''
  }

  return <li className="list-row">
      <div><img className="size-10 rounded-box" src={getUrl()}/></div>

      <div>
        <span className="font-bold">{friend.game_name} <span className="opacity-25">{friend.game_tag}</span></span>
        <div className="text-xs opacity-60">{getDescription()}</div>
      </div>

      { friend.presence && friend.presence.partySize > 1 ? <p className="uppercase self-center">+{friend.presence?.partySize-1} other</p> : null }

      <button className="btn btn-ghost btn-square" onClick={onExternalLinkClick}><SquareArrowOutUpRight /></button>

  </li>
}

const FriendRow = ({ friend, onExternalLinkClick }: { friend: FriendsResponse['friends'][0], onExternalLinkClick: () => void }) => {
  return <li className="list-row">
     <div className="avatar avatar-placeholder">
        <div className="bg-neutral size-10 rounded-box">
          <span>{friend.game_name.slice(0,1).toUpperCase()}</span>
        </div>
      </div>

      <div>
        <span className="font-bold">{friend.game_name} <span className="opacity-25">{friend.game_tag} {friend.note ? <span>({friend.note})</span> : null}</span></span>
        <div className="text-xs opacity-60">OFFLINE</div>
      </div>

      <button className="btn btn-ghost btn-square" onClick={onExternalLinkClick}><SquareArrowOutUpRight /></button>
  </li>
}
