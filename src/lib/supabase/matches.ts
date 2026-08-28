import "server-only"

import type {
  MatchRow,
  RiotMatch,
} from "@/lib/riot/types"

import {
  createSupabaseServerClient
} from "@/lib/supabase/server"

export interface StoredMatch {
  match_id: string

  puuid: string

  game_start_timestamp: number
  game_end_timestamp: number

  champion_name: string
  win: boolean

  kills: number
  deaths: number
  assists: number

  cs: number
  duration: number

  queue_id: number
  position: string | null

  comment: string | null

  game_changer: boolean

  raw_match: RiotMatch

  fetched_at?: string
}

export async function getStoredMatches(): Promise<
  StoredMatch[]
> {
  const supabase =
    createSupabaseServerClient()

  const { data, error } = await supabase
    .from("match_history")
    .select("*")
    .eq("queue_id", 420)
    .order(
      "game_start_timestamp",
      {
        ascending: false,
      }
    )

  if (error) {
    throw new Error(
      `Failed to load stored matches: ${error.message}`
    )
  }

  return (data ?? []) as StoredMatch[]
}

export async function getLatestStoredMatch(): Promise<
  Pick<
    StoredMatch,
    "match_id" | "game_start_timestamp"
  > | null
> {
  const supabase =
    createSupabaseServerClient()

  const { data, error } = await supabase
    .from("match_history")
    .select(
      "match_id, game_start_timestamp"
    )
    .eq("queue_id", 420)
    .order(
      "game_start_timestamp",
      {
        ascending: false,
      }
    )
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(
      `Failed to retrieve latest match: ${error.message}`
    )
  }

  return data
}

export async function getExistingMatchIds(
  matchIds: string[]
): Promise<Set<string>> {
  if (matchIds.length === 0) {
    return new Set()
  }

  const supabase =
    createSupabaseServerClient()

  const { data, error } = await supabase
    .from("match_history")
    .select("match_id")
    .in("match_id", matchIds)

  if (error) {
    throw new Error(
      `Failed checking existing matches: ${error.message}`
    )
  }

  return new Set(
    (data ?? []).map(
      (row) => row.match_id
    )
  )
}

export async function saveMatch(
  match: StoredMatch
) {
  const supabase =
    createSupabaseServerClient()

  /*
   * We intentionally exclude comment.
   *
   * Riot synchronization must never
   * overwrite a user-entered comment.
   */
  const {
    comment: _comment,
    game_changer: _gameChanger,
    ...riotOwnedData
  } = match

  const { error } = await supabase
    .from("match_history")
    .upsert(
      riotOwnedData,
      {
        onConflict: "match_id",
      }
    )

  if (error) {
    throw new Error(
      `Failed to save ${match.match_id}: ${error.message}`
    )
  }
}

export function storedMatchToMatchRow(
  match: StoredMatch
): MatchRow {
  return {
    id: match.match_id,

    champion:
      match.champion_name,

    result:
      match.win
        ? "Win"
        : "Loss",

    kills:
      match.kills,

    deaths:
      match.deaths,

    assists:
      match.assists,

    cs:
      match.cs,

    duration:
      match.duration,

    date:
      match.game_end_timestamp,

    queueId:
      match.queue_id,

    position:
      match.position ?? "UNKNOWN",

    comment:
      match.comment ?? "",

    game_changer:
      match.game_changer,
  }
}