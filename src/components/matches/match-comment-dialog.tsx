"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface MatchCommentDialogProps {
  matchId: string
  champion: string
  comment: string
}

export function MatchCommentDialog({
  matchId,
  champion,
  comment,
}: MatchCommentDialogProps) {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(comment)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    try {
      setIsSaving(true)
      setError(null)

      const response = await fetch(
        `/api/matches/${encodeURIComponent(matchId)}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comment: value,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ?? "Unable to save comment."
        )
      }

      setOpen(false)
      router.refresh()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save comment."
      )
    } finally {
      setIsSaving(false)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)

    if (nextOpen) {
      setValue(comment)
      setError(null)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-1"
          />
        }
      >
        {comment ? "Edit note" : "Add note"}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Match note
          </DialogTitle>

          <DialogDescription>
            Add a note about your {champion} game.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={value}
          onChange={(event) =>
            setValue(event.target.value)
          }
          placeholder="What happened this game?"
          rows={6}
          maxLength={2000}
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {error ? (
              <span className="text-destructive">
                {error}
              </span>
            ) : null}
          </span>

          <span>{value.length}/2000</span>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}