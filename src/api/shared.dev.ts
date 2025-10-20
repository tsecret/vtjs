import { CompetitiveUpdatesResponse, CurrentGameMatchResponse, CurrentGamePlayerResponse, CurrentPreGameMatchResponse, CurrentPreGamePlayerResponse, MatchDetailsResponse, PenaltiesResponse, PlayerMatchHistoryResponse, PlayerMMRResponse, PlayerNamesReponse } from '../interface';
import { randomInt, sleep } from "../utils/utils";
import { SharedAPI } from "./shared";

import agents from '../assets/agents.json';
import maps from '../assets/maps.json';

import competitiveUpdates from '../../tests/fixtures/shared/competitive-updates.json';
import currentMatch from '../../tests/fixtures/shared/current-game-match.json';
import currentGamePlayer from '../../tests/fixtures/shared/current-game-player.json';
import currentPreGameMatch from '../../tests/fixtures/shared/current-pregame-match.json';
import currentPreGamePlayer from '../../tests/fixtures/shared/current-pregame-player.json';
import matchDetails from '../../tests/fixtures/shared/match-details.json';
import matchHistory from '../../tests/fixtures/shared/match-history.json';
import penaltiesClear from '../../tests/fixtures/shared/penalties-clear.json';
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
    await sleep(2000)

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

  async getMatchDetails(matchId: string): Promise<MatchDetailsResponse> {

    const match = JSON.parse(JSON.stringify(matchDetails))

    match.matchInfo.matchId = matchId
    match.matchInfo.gameStartMillis = randomInt(+new Date()- 365 * 24 * 60 * 60 * 1000, +new Date())
    match.matchInfo.mapId = maps.map(map => map.mapUrl)[randomInt(0, maps.length)]

    for (const player of match.players){
      player.stats.kills = randomInt(0, 30)
      player.stats.deaths = randomInt(10, 20)
      player.stats.assists = randomInt(0, 10)
      player.characterId = agents.map(agent => agent.uuid)[randomInt(0, agents.length)]
    }

    // @ts-ignore
    return match
  }

  async getCompetitiveUpdates(_puuid: string): Promise<CompetitiveUpdatesResponse> {
    // @ts-ignore
    return competitiveUpdates
  }

  async getPlayerMMR(_puuid: string): Promise<PlayerMMRResponse> {

    const mmr = { ...playerMMR }

    mmr.LatestCompetitiveUpdate.TierAfterUpdate = randomInt(3, 28)
    // @ts-ignore
    mmr.QueueSkills.competitive.SeasonalInfoBySeasonID[mmr.LatestCompetitiveUpdate.SeasonID].Rank = randomInt(mmr.LatestCompetitiveUpdate.TierAfterUpdate, 28)

    // @ts-ignore
    return mmr
  }

  async getPenalties(): Promise<PenaltiesResponse> {
    // @ts-ignore
    return penaltiesClear
  }

}
