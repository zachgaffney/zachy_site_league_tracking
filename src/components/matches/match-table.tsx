import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MatchCommentDialog } from "@/components/matches/match-comment-dialog"
import { GameChangerToggle } from "@/components/matches/game-changer-toggle"

import type { MatchRow } from "@/lib/riot/types"

interface MatchTableProps {
  matches: MatchRow[]
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp))
}

export function MatchTable({
  matches,
}: MatchTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead>Champion</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>KDA</TableHead>
            <TableHead>CS</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Date</TableHead>

            <TableHead className="w-80">
              Notes
            </TableHead>

            <TableHead className="text-center">
              Game Changer
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {matches.map((match) => (
            <TableRow key={match.id}>
              <TableCell className="font-medium">
                {match.champion}
              </TableCell>

              <TableCell>
                <Badge
                  variant={
                    match.result === "Win"
                      ? "default"
                      : "secondary"
                  }
                >
                  {match.result}
                </Badge>
              </TableCell>

              <TableCell className="font-medium">
                {match.kills} / {match.deaths} /{" "}
                {match.assists}
              </TableCell>

              <TableCell>
                {match.cs}
              </TableCell>

              <TableCell className="text-muted-foreground">
                {match.position}
              </TableCell>

              <TableCell className="text-muted-foreground">
                {formatDuration(match.duration)}
              </TableCell>

              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatDate(match.date)}
              </TableCell>

              <TableCell className="w-80 max-w-80">
                <div className="space-y-2">
                  {match.comment ? (
                    <p className="whitespace-normal break-words text-sm leading-relaxed text-muted-foreground">
                      {match.comment}
                    </p>
                  ) : null}

                  <MatchCommentDialog
                    matchId={match.id}
                    champion={match.champion}
                    comment={match.comment}
                  />
                </div>
              </TableCell>

              <TableCell className="text-center">
                <GameChangerToggle
                    matchId={match.id}
                    gameChanger={match.game_changer}
                />
                </TableCell>
            </TableRow>
          ))}

          {matches.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={9}
                className="h-24 text-center text-muted-foreground"
              >
                No matches found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}