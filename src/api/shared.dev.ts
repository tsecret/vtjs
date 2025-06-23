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

  async getCurrentGamePlayer(puuid: string): Promise<CurrentGamePlayerResponse> {
    return currentGame
  }

  async getCurrentGameMatch(matchId: string): Promise<CurrentGameMatchResponse> {
    return currentMatch
  }

  async getPlayerNames(puuids: string[]): Promise<PlayerNamesReponse[]> {
    return playerNames
  }

  async getPlayerMatchHistory(puuid: string): Promise<PlayerMatchHistoryResponse> {
    return matchHistory
  }

  async getMatchDetails(matchId: string): Promise<MatchDetailsResponse> {
    return matchDetails
  }

  async getCompetitiveUpdates(puuid: string): Promise<CompetitiveUpdatesResponse> {
    return competitiveUpdates
  }

  async getPlayerMMR(puuid: string): Promise<PlayerMMRResponse> {
    return playerMMR
  }

}
