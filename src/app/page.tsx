import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { MatchTable } from "@/components/matches/match-table"
import { syncMatches } from "@/lib/riot/sync"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function Home() {
  const matches = await syncMatches()

  const totalGames = matches.length

  const wins = matches.filter(
    (match) => match.result === "Win"
  ).length

  const winRate =
    totalGames === 0
      ? 0
      : Math.round((wins / totalGames) * 100)

  const averageKda =
    totalGames === 0
      ? "0.00"
      : (
          matches.reduce((total, match) => {
            const deaths = Math.max(match.deaths, 1)

            return (
              total +
              (match.kills + match.assists) / deaths
            )
          }, 0) / totalGames
        ).toFixed(2)

  const championCounts = matches.reduce<
    Record<string, number>
  >((counts, match) => {
    counts[match.champion] =
      (counts[match.champion] ?? 0) + 1

    return counts
  }, {})

  const mostPlayedChampion =
    Object.entries(championCounts).sort(
      ([, countA], [, countB]) =>
        countB - countA
    )[0]?.[0] ?? "—"

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-8">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                100 Games: No Chat
              </h1>

              <Badge variant="secondary">
                League of Legends
              </Badge>
            </div>

            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              An expiremental project to see if Riot Games is injecting cope into its user community
            </p>
          </header>

          <Separator />

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Games
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">
                  {totalGames}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Win Rate
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">
                  {winRate}%
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {wins} wins · {totalGames - wins} losses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average KDA
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">
                  {averageKda}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Most Played
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="truncate text-3xl font-semibold tracking-tight">
                  {mostPlayedChampion}
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card>
              <CardHeader>
                <CardTitle>Match History</CardTitle>
              </CardHeader>

              <CardContent>
                {matches.length > 0 ? (
                  <MatchTable matches={matches} />
                ) : (
                  <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
                    No ranked Solo/Duo matches found yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  )
}