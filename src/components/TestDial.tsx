import { GameState } from "@/interface"
import { TestTubeDiagonal } from "lucide-react"
import { emit } from "@tauri-apps/api/event";
import events from '../../tests/fixtures/local/events.json'

export const  TestDial = () => {

  const onGameTrigger = (state: GameState) => {
    let message

    switch (state) {
      case 'PREGAME':
        message = events[2]
        break;
      case 'INGAME':
        message = events[3]
        break;
      case 'MENUS':
      default:
        message = events[4]
        break;
    }

    emit('ws_message', JSON.stringify([null, null, message]))
  }

  const onPartyJoin = () => {
    emit('ws_message', JSON.stringify([null, null, events[5]]))
  }

  if (import.meta.env.VITE_DEV !== 'true')
    return null

  return (
    <div className="fab">
      {/* a focusable div with tabIndex is necessary to work on all browsers. role="button" is necessary for accessibility */}
      <div tabIndex={0} role="button" className="btn btn-lg btn-circle btn-info"><TestTubeDiagonal /></div>

      {/* buttons that show up when FAB is open */}
      <button className="btn btn-sm" onClick={() => onGameTrigger('PREGAME')}>Trigger PreGame</button>
      <button className="btn btn-sm" onClick={() => onGameTrigger('INGAME')}>Trigger Game</button>
      <button className="btn btn-sm" onClick={() => onGameTrigger('MENUS')}>Trigger Match End</button>
      <button className="btn btn-sm" onClick={onPartyJoin}>Trigger Trigger Friend Join</button>
    </div>
  )
}
