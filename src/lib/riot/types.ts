export interface RiotAccount {
  puuid: string
  gameName: string
  tagLine: string
}

export interface RiotParticipant {
  puuid: string

  championName: string
  win: boolean

  kills: number
  deaths: number
  assists: number

  totalMinionsKilled: number
  neutralMinionsKilled: number

  teamPosition: string
  individualPosition: string
}

export interface RiotMatchInfo {
  gameCreation: number
  gameStartTimestamp?: number
  gameEndTimestamp?: number

  gameDuration: number
  gameId: number
  gameMode: string

  queueId: number

  participants: RiotParticipant[]
}

export interface RiotMatch {
  metadata: {
    matchId: string
    participants: string[]
  }

  info: RiotMatchInfo
}

export interface MatchRow {
  id: string

  champion: string
  result: "Win" | "Loss"

  kills: number
  deaths: number
  assists: number

  cs: number

  duration: number
  date: number

  queueId: number
  position: string

  comment: string

  game_changer: boolean
}