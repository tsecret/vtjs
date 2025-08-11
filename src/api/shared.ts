import { CompetitiveUpdatesResponse, CurrentGameMatchResponse, CurrentGamePlayerResponse, CurrentPreGameMatchResponse, CurrentPreGamePlayerResponse, GameSettingsResponse, MatchDetailsResponse, PlayerMatchHistoryResponse, PlayerMMRResponse, PlayerNamesReponse } from '../interface';
import { BaseAPI } from './base';

export class SharedAPI extends BaseAPI {

  private REGION = 'eu'
  private SHARD = 'eu'

  async getCurrentPreGamePlayer(puuid: string): Promise<CurrentPreGamePlayerResponse|null> {
    return this.fetch(`https://glz-${this.REGION}-1.${this.SHARD}.a.pvp.net`, `/pregame/v1/players/${puuid}`, { noCache: true })
  }

  async getCurrentGamePlayer(puuid: string): Promise<CurrentGamePlayerResponse|null> {
    return this.fetch(`https://glz-${this.REGION}-1.${this.SHARD}.a.pvp.net`, `/core-game/v1/players/${puuid}`, { noCache: true })
  }

  async getCurrentPreGameMatch(matchId: string): Promise<CurrentPreGameMatchResponse> {
    return this.fetch(`https://glz-${this.REGION}-1.${this.SHARD}.a.pvp.net`, `/pregame/v1/matches/${matchId}`, { noCache: true })
  }

  async getCurrentGameMatch(matchId: string): Promise<CurrentGameMatchResponse> {
    return this.fetch(`https://glz-${this.REGION}-1.${this.SHARD}.a.pvp.net`, `/core-game/v1/matches/${matchId}`, { noCache: true })
  }

  async getPlayerNames(puuids: string[]): Promise<PlayerNamesReponse[]> {
    return this.fetch(`https://pd.${this.SHARD}.a.pvp.net`, '/name-service/v2/players', { body: JSON.stringify(puuids), method: "PUT", noCache: true })
  }

  async getPlayerMatchHistory(puuid: string): Promise<PlayerMatchHistoryResponse> {
    const startIndex = 0
    const endIndex = 20
    const queue = 'competitive'
    return this.fetch(`https://pd.${this.SHARD}.a.pvp.net`, `/match-history/v1/history/${puuid}?startIndex=${startIndex}&endIndex=${endIndex}&queue=${queue}`, { ttl: 5 * 60 * 1000 })
  }

  async getMatchDetails(matchId: string): Promise<MatchDetailsResponse> {
    return this.fetch(`https://pd.${this.SHARD}.a.pvp.net`, `/match-details/v1/matches/${matchId}`, { ttl: 30 * 24 * 60 * 60 * 1000 })
  }

  async getCompetitiveUpdates(puuid: string): Promise<CompetitiveUpdatesResponse> {
    return this.fetch(`https://pd.${this.SHARD}.a.pvp.net`, `/mmr/v1/players/${puuid}/competitiveupdates?queue=competitive`)
  }

  async getPlayerMMR(puuid: string): Promise<PlayerMMRResponse> {
    return this.fetch(`https://pd.${this.SHARD}.a.pvp.net`, `/mmr/v1/players/${puuid}`)
  }

  async getGameSettings(): Promise<GameSettingsResponse> {
    return this.fetch('https://player-preferences-usw2.pp.sgp.pvp.net', '/playerPref/v3/getPreference/Ares.PlayerSettings', { noCache: true })
  }

  async setGameSettings(data: GameSettingsResponse): Promise<GameSettingsResponse> {
    return this.fetch('https://player-preferences-usw2.pp.sgp.pvp.net', '/playerPref/v3/savePreference', { noCache: true, body: JSON.stringify(data), method: 'PUT' })
  }

}
