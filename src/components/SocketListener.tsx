import { listen } from "@tauri-apps/api/event";
import { useAtom, useSetAtom } from "jotai";
import { useEffect } from "react";
import { useServices } from "@/lib/services";
import { base64Decode } from "@/utils";
import type { Payload, PresenceJSON } from "../interface";
import atoms from "../utils/atoms";

export const SocketListener = () => {
	const services = useServices();
	const sharedapi = services?.sharedapi;
	const setParty = useSetAtom(atoms.party);
	const setGameState = useSetAtom(atoms.gameState);
	const [puuid] = useAtom(atoms.puuid);
	const [party] = useAtom(atoms.party);

	useEffect(() => {
		if (!puuid) return;

		listen<string>("ws_message", async (event) => {
			try {
				const [, , payload]: [null, null, Payload] = JSON.parse(event.payload.replace("///", ""));

				const presence = payload.data.presences.find((p) => p.puuid === puuid);
				if (!presence) return;

				const decoded: PresenceJSON = JSON.parse(base64Decode(presence.private));

				if (decoded.partyPresenceData.partySize > 1 && party.length !== decoded.partyPresenceData.partySize) {
					const partyData = await sharedapi?.getParty(decoded.partyPresenceData.partyId);
					if (partyData)
						setParty(
							partyData.Members.map((p) => ({
								puuid: p.Subject,
								name: "",
								tag: "",
								playerCardId: p.PlayerIdentity.PlayerCardID,
							})),
						);
				}

				const newState = decoded.matchPresenceData.sessionLoopState;
				setGameState(prev => {
					if (newState !== prev.state) {
						return { state: newState, matchId: prev.matchId };
					}
					return prev;
				});
			} catch (err) {
				console.log("err", err);
			}
		});

	}, [puuid, setParty, setGameState, party.length, sharedapi]);

	return null;
};
