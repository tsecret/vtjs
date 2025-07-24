import { listen } from "@tauri-apps/api/event";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { GameState, Payload } from "../interface";
import atoms from "../utils/atoms";

export const SocketListener = () => {
  const [, setGameState] = useAtom(atoms.gameState)
  const state = useRef<{ state: GameState, matchId: string | null }>({ state: 'Idle', matchId: null });


  useEffect(() => {
      listen<string>('ws_message', (event) => {

          try {
            const [, , payload]: [null, null, Payload] = JSON.parse(event.payload.replace('///', ''))

            if (payload.data.version === '-1') return

            if (payload.eventType === 'Create'){
              const match = payload.uri.match(/\/(.*)\/(.*)\/(.*)\/(.*)\/(.*)\/(.*)\/matches\/(.*)/)

              if (match){
                const [, , , , , type, , matchId] = match

                if (type === 'pregame' && state.current.state !== 'PreGame'){
                  if (state.current.matchId && matchId !== state.current.matchId) return

                  state.current = { state: 'PreGame', matchId }
                  setGameState(state.current)
                }

                if (type === 'core-game' && state.current.state !== 'Game'){
                  if (state.current.matchId && matchId !== state.current.matchId) return

                  state.current = { state: 'Game', matchId }
                  setGameState(state.current)
                }

              }
            }

            if (payload.eventType === 'Update' && payload.data.phase === 'Idle' && state.current.state !== 'Idle'){
              state.current = { state: 'Idle', matchId: null }
              setGameState(state.current)
            }

          } catch(err) {
            console.log('err', err)
          }
        });

        return () => {};
    }, [])

    return null
}
