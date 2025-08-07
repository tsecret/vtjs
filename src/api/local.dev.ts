import { LocalAPI } from "./local";
import entToken from '../../tests/fixtures/local/ent-token.json'
import playerAccount from '../../tests/fixtures/local/player-alias.json'
import help from '../../tests/fixtures/local/help.json'


export class TestLocalAPI extends LocalAPI {
  async getEntitlementToken() {
    return entToken
  }
  async getPlayerAccount() {
    return playerAccount
  }
  async help() {
    return help
  }
}
