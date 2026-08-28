import {
  NextRequest,
  NextResponse,
} from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

interface RouteContext {
  params: Promise<{
    matchId: string
  }>
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { matchId } = await context.params
    const body = await request.json()

    if (typeof body.gameChanger !== "boolean") {
      return NextResponse.json(
        {
          error: "gameChanger must be a boolean.",
        },
        {
          status: 400,
        }
      )
    }

    const supabase =
      createSupabaseServerClient()

    const { error } = await supabase
      .from("match_history")
      .update({
        game_changer: body.gameChanger,
      })
      .eq("match_id", matchId)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      gameChanger: body.gameChanger,
    })
  } catch (error) {
    console.error(
      "Failed to update Game Changer:",
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update Game Changer.",
      },
      {
        status: 500,
      }
    )
  }
}