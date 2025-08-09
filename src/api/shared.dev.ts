import { CompetitiveUpdatesResponse, CurrentGameMatchResponse, CurrentGamePlayerResponse, CurrentPreGameMatchResponse, CurrentPreGamePlayerResponse, MatchDetailsResponse, PlayerMatchHistoryResponse, PlayerMMRResponse, PlayerNamesReponse } from '../interface';
import { sleep } from "../utils";
import { SharedAPI } from "./shared";

import competitiveUpdates from '../../tests/fixtures/shared/competitive-updates.json';
import currentMatch from '../../tests/fixtures/shared/current-game-match.json';
import currentGamePlayer from '../../tests/fixtures/shared/current-game-player.json';
import currentPreGameMatch from '../../tests/fixtures/shared/current-pregame-match.json';
import currentPreGamePlayer from '../../tests/fixtures/shared/current-pregame-player.json';
import matchDetails from '../../tests/fixtures/shared/match-details.json';
import matchHistory from '../../tests/fixtures/shared/match-history.json';
import playerMMR from '../../tests/fixtures/shared/player-mmr.json';
import playerNames from '../../tests/fixtures/shared/player-names.json';

export class TestSharedAPI extends SharedAPI {

  async getCurrentGamePlayer(_puuid: string): Promise<CurrentGamePlayerResponse> {
    return currentGamePlayer
  }

  async getCurrentPreGamePlayer(_puuid: string): Promise<CurrentPreGamePlayerResponse | null> {
    return null
    return currentPreGamePlayer
  }

  async getCurrentGameMatch(_matchId: string): Promise<CurrentGameMatchResponse> {
    // @ts-ignore
    return currentMatch
  }

  async getCurrentPreGameMatch(_matchId: string): Promise<CurrentPreGameMatchResponse> {
    // @ts-ignore
    return currentPreGameMatch
  }

  async getPlayerNames(puuids: string[]): Promise<PlayerNamesReponse[]> {
    return playerNames.slice(0, puuids.length)
  }

  async getPlayerMatchHistory(_puuid: string): Promise<PlayerMatchHistoryResponse> {
    await sleep(50)
    // @ts-ignore
    return matchHistory
  }

  async getMatchDetails(_matchId: string): Promise<MatchDetailsResponse> {
    // @ts-ignore
    return matchDetails
  }

  async getCompetitiveUpdates(_puuid: string): Promise<CompetitiveUpdatesResponse> {
    return competitiveUpdates
  }

  async getPlayerMMR(_puuid: string): Promise<PlayerMMRResponse> {
    // @ts-ignore
    return playerMMR
  }

}
