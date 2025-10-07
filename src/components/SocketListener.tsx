import { base64Decode } from "@/utils";
import { listen } from "@tauri-apps/api/event";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { GameState, Payload, PresenceJSON } from "../interface";
import atoms from "../utils/atoms";

export const SocketListener = () => {
  const [, setGameState] = useAtom(atoms.gameState)
  const [puuid] = useAtom(atoms.puuid)
  const state = useRef<{ state: GameState, matchId: string | null }>({ state: 'MENUS', matchId: null });


  useEffect(() => {
    if (!puuid) return

    listen<string>('ws_message', (event) => {

        try {
          const [, , payload]: [null, null, Payload] = JSON.parse(event.payload.replace('///', ''))

          const presence = payload.data.presences.find(p => p.puuid === puuid)
          if (!presence) return

          const decoded: PresenceJSON  = JSON.parse(base64Decode(presence.private))

          if (decoded.matchPresenceData.sessionLoopState === state.current.state)
            return

          if (decoded.matchPresenceData.sessionLoopState === 'PREGAME'){
            state.current = { state: decoded.matchPresenceData.sessionLoopState, matchId: '' }
            setGameState(state.current)
          }

          if (decoded.matchPresenceData.sessionLoopState === 'INGAME'){
            state.current = { state: decoded.matchPresenceData.sessionLoopState, matchId: '' }
            setGameState(state.current)
          }

          if (decoded.matchPresenceData.sessionLoopState === 'MENUS'){
            state.current = { state: decoded.matchPresenceData.sessionLoopState, matchId: '' }
            setGameState(state.current)
          }

        } catch(err) {
          console.log('err', err)
        }
    });

    return () => {};
  }, [puuid])

  return null
}
