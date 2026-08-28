import "server-only"

import type {
  RiotAccount,
  RiotMatch,
} from "@/lib/riot/types"

const RIOT_API_KEY = process.env.RIOT_API_KEY
const RIOT_GAME_NAME = process.env.RIOT_GAME_NAME
const RIOT_TAG_LINE = process.env.RIOT_TAG_LINE

const REGIONAL_ROUTE = "americas"

function validateEnvironment() {
  if (!RIOT_API_KEY) {
    throw new Error("RIOT_API_KEY is not configured")
  }

  if (!RIOT_GAME_NAME) {
    throw new Error("RIOT_GAME_NAME is not configured")
  }

  if (!RIOT_TAG_LINE) {
    throw new Error("RIOT_TAG_LINE is not configured")
  }
}

async function riotFetch<T>(url: string): Promise<T> {
  validateEnvironment()

  const response = await fetch(url, {
    headers: {
      "X-Riot-Token": RIOT_API_KEY!,
    },
    cache: "no-store",
  })

  if (response.status === 429) {
    const retryAfter =
      response.headers.get("Retry-After")

    throw new Error(
      `Riot rate limit reached. Retry after ${
        retryAfter ?? "unknown"
      } seconds.`
    )
  }

  if (!response.ok) {
    const body = await response.text()

    throw new Error(
      `Riot request failed: ${response.status} ${response.statusText} - ${body}`
    )
  }

  return response.json() as Promise<T>
}

export async function getAccount(): Promise<RiotAccount> {
  validateEnvironment()

  const gameName =
    encodeURIComponent(RIOT_GAME_NAME!)

  const tagLine =
    encodeURIComponent(RIOT_TAG_LINE!)

  const url =
    `https://${REGIONAL_ROUTE}.api.riotgames.com` +
    `/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`

  return riotFetch<RiotAccount>(url)
}

export async function getMatchIds(
  puuid: string,
  startTime: number,
  start = 0
): Promise<string[]> {
  const params = new URLSearchParams({
    startTime: startTime.toString(),

    // Ranked Solo / Duo
    queue: "420",

    start: start.toString(),
    count: "100",
  })

  const url =
    `https://${REGIONAL_ROUTE}.api.riotgames.com` +
    `/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids` +
    `?${params.toString()}`

  return riotFetch<string[]>(url)
}

export async function getAllMatchIdsSince(
  puuid: string,
  startTime: number
): Promise<string[]> {
  const matchIds: string[] = []

  let start = 0

  while (true) {
    const page = await getMatchIds(
      puuid,
      startTime,
      start
    )

    matchIds.push(...page)

    if (page.length < 100) {
      break
    }

    start += 100
  }

  return matchIds
}

export async function getMatch(
  matchId: string
): Promise<RiotMatch> {
  const url =
    `https://${REGIONAL_ROUTE}.api.riotgames.com` +
    `/lol/match/v5/matches/${encodeURIComponent(matchId)}`

  return riotFetch<RiotMatch>(url)
}