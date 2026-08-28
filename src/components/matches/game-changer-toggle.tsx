"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Star } from "lucide-react"

import { Button } from "@/components/ui/button"

interface GameChangerToggleProps {
  matchId: string
  gameChanger: boolean
}

export function GameChangerToggle({
  matchId,
  gameChanger,
}: GameChangerToggleProps) {
  const router = useRouter()

  const [isGameChanger, setIsGameChanger] =
    useState(gameChanger)

  const [isSaving, setIsSaving] =
    useState(false)

  async function handleToggle() {
    if (isSaving) return

    const nextValue = !isGameChanger

    setIsGameChanger(nextValue)
    setIsSaving(true)

    try {
      const response = await fetch(
        `/api/matches/${encodeURIComponent(matchId)}/game-changer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gameChanger: nextValue,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          "Failed to update Game Changer"
        )
      }

      router.refresh()
    } catch (error) {
      console.error(error)

      setIsGameChanger(!nextValue)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isSaving}
      className="rounded-full"
      aria-label={
        isGameChanger
          ? "Unmark Game Changer"
          : "Mark Game Changer"
      }
    >
      <Star
        className="size-5"
        fill={
          isGameChanger
            ? "currentColor"
            : "none"
        }
      />
    </Button>
  )
}