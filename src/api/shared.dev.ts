import { SharedAPI } from "./shared";
import { CompetitiveUpdatesResponse, CurrentGameMatchResponse, CurrentGamePlayerResponse, MatchDetailsResponse, PlayerMatchHistoryResponse, PlayerMMRResponse, PlayerNamesReponse } from '../interface';


import currentGame from '../../tests/fixtures/shared/current-game-player.json'
import currentMatch from '../../tests/fixtures/shared/current-game-match.json'
import playerNames from '../../tests/fixtures/shared/player-names.json'
import matchHistory from '../../tests/fixtures/shared/match-history.json'
import matchDetails from '../../tests/fixtures/shared/match-details.json'
import competitiveUpdates from '../../tests/fixtures/shared/competitive-updates.json'
import playerMMR from '../../tests/fixtures/shared/player-mmr.json'

export class TestSharedAPI extends SharedAPI {

  // @ts-ignore
  async getCurrentGamePlayer(puuid: string): Promise<CurrentGamePlayerResponse> {
    return currentGame
  }

  // @ts-ignore
  async getCurrentGameMatch(matchId: string): Promise<CurrentGameMatchResponse> {
    // @ts-ignore
    return currentMatch
  }

  // @ts-ignore
  async getPlayerNames(puuids: string[]): Promise<PlayerNamesReponse[]> {
    return playerNames
  }

  // @ts-ignore
  async getPlayerMatchHistory(puuid: string): Promise<PlayerMatchHistoryResponse> {
    // @ts-ignore
    return matchHistory
  }

  // @ts-ignore
  async getMatchDetails(matchId: string): Promise<MatchDetailsResponse> {
    // @ts-ignore
    return matchDetails
  }

  // @ts-ignore
  async getCompetitiveUpdates(puuid: string): Promise<CompetitiveUpdatesResponse> {
    return competitiveUpdates
  }

  // @ts-ignore
  async getPlayerMMR(puuid: string): Promise<PlayerMMRResponse> {
    return playerMMR
  }

}
