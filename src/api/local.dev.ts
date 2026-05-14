import entToken from "../../tests/fixtures/local/ent-token.json";
import friends from "../../tests/fixtures/local/friends.json";
import help from "../../tests/fixtures/local/help.json";
import playerAccount from "../../tests/fixtures/local/player-alias.json";
import presences from "../../tests/fixtures/local/presence.json";
import type { FriendsResponse, PresenceResponse } from "../interface";
import { LocalAPI } from "./local";

export class TestLocalAPI extends LocalAPI {
	async getEntitlementToken() {
		return entToken;
	}

	async getPlayerAccount() {
		return playerAccount;
	}

	async help() {
		return help;
	}

	async getFriends(): Promise<FriendsResponse> {
		return friends;
	}

	async getPresences(): Promise<PresenceResponse> {
		// @ts-expect-error
		return presences;
	}
}
