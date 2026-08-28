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

    const comment =
      typeof body.comment === "string"
        ? body.comment.trim()
        : ""

    if (comment.length > 2000) {
      return NextResponse.json(
        {
          error:
            "Comment must be 2000 characters or fewer.",
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
        comment: comment || null,
      })
      .eq("match_id", matchId)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      comment,
    })
  } catch (error) {
    console.error(
      "Failed to update match comment:",
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save comment.",
      },
      {
        status: 500,
      }
    )
  }
}