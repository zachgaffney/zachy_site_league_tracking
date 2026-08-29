import "server-only"

import {
  getAllMatchIdsSince,
  getMatch,
} from "@/lib/riot/client"

import type {
  MatchRow,
  RiotMatch,
} from "@/lib/riot/types"

import {
  getExistingMatchIds,
  getLatestStoredMatch,
  getStoredMatches,
  saveMatch,
  storedMatchToMatchRow,
  type StoredMatch,
} from "@/lib/supabase/matches"

/*
 * Temporary testing cutoff.
 *
 * Once you're ready to officially begin
 * tracking, change only this date.
 */
const INITIAL_TRACKING_DATE = new Date(
  "2026-08-28T00:00:00-07:00"
)

function riotMatchToStoredMatch(
  match: RiotMatch,
  puuid: string
): StoredMatch {
  const participant =
    match.info.participants.find(
      (player) => player.puuid === puuid
    )

  if (!participant) {
    throw new Error(
      `Could not find player in ${match.metadata.matchId}`
    )
  }

  const gameStartTimestamp =
    match.info.gameStartTimestamp ??
    match.info.gameCreation

  const gameEndTimestamp =
    match.info.gameEndTimestamp ??
    gameStartTimestamp +
      match.info.gameDuration * 1000

  return {
    match_id: match.metadata.matchId,

    puuid,

    game_start_timestamp:
      gameStartTimestamp,

    game_end_timestamp:
      gameEndTimestamp,

    champion_name:
      participant.championName,

    win:
      participant.win,

    kills:
      participant.kills,

    deaths:
      participant.deaths,

    assists:
      participant.assists,

    cs:
      participant.totalMinionsKilled +
      participant.neutralMinionsKilled,

    duration:
      match.info.gameDuration,

    queue_id:
      match.info.queueId,

    position:
      participant.teamPosition ||
      participant.individualPosition ||
      null,

    /*
     * These are app-owned fields.
     *
     * New Riot matches begin with
     * no comment and are not marked
     * as Game Changers.
     */
    comment: null,
    game_changer: false,

    raw_match: match,
  }
}

export async function syncMatches(): Promise<
  MatchRow[]
> {
  /*
   * PUUID is stored directly in our
   * environment so we don't need the
   * extra Riot account lookup on every
   * page load.
   */
  const puuid = process.env.RIOT_PUUID

  if (!puuid) {
    throw new Error(
      "RIOT_PUUID is not configured"
    )
  }

  /*
   * Find the newest match we already
   * have stored in Supabase.
   */
  const latestStoredMatch =
    await getLatestStoredMatch()

  /*
   * Riot expects Unix time in seconds.
   *
   * First run:
   * August 20, 2026.
   *
   * Future runs:
   * Start at the newest stored game's
   * timestamp. We intentionally allow
   * overlap and deduplicate by match ID.
   */
  const startTime =
    latestStoredMatch
      ? Math.floor(
          latestStoredMatch
            .game_start_timestamp /
            1000
        )
      : Math.floor(
          INITIAL_TRACKING_DATE.getTime() /
            1000
        )

  try {
    /*
     * Retrieve Ranked Solo/Duo match IDs
     * from Riot.
     */
    const riotMatchIds =
      await getAllMatchIdsSince(
        puuid,
        startTime
      )

    /*
     * Check Supabase before retrieving
     * full match details.
     *
     * This prevents us from re-fetching
     * the overlapping newest match.
     */
    const existingMatchIds =
      await getExistingMatchIds(
        riotMatchIds
      )

    const newMatchIds =
      riotMatchIds.filter(
        (matchId) =>
          !existingMatchIds.has(matchId)
      )

    console.log(
      `Riot sync: ${riotMatchIds.length} IDs returned, ${newMatchIds.length} new matches`
    )

    /*
     * Retrieve details only for genuinely
     * new matches.
     *
     * Keep these sequential to avoid
     * unnecessarily hammering Riot's API.
     */
    for (const matchId of newMatchIds) {
      const riotMatch =
        await getMatch(matchId)

      /*
       * Defense-in-depth:
       * Ranked Solo/Duo is queue 420.
       */
      if (
        riotMatch.info.queueId !== 420 ||
        riotMatch.info.gameDuration < 900
      ) {
        continue
      }

      const storedMatch =
        riotMatchToStoredMatch(
          riotMatch,
          puuid
        )

      await saveMatch(storedMatch)

      console.log(
        `Saved ${matchId}`
      )
    }
  } catch (error) {
    /*
     * If Riot is unavailable, rate
     * limited, or the development key
     * expires, still render everything
     * already stored in Supabase.
     */
    console.error(
      "Riot synchronization failed:",
      error
    )
  }

  /*
   * The page always renders from our
   * database, not directly from Riot.
   */
  const storedMatches =
    await getStoredMatches()

  return storedMatches.map(
    storedMatchToMatchRow
  )
}