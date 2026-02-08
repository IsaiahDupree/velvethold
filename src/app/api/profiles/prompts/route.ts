import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProfileByUserId, setProfilePrompts, addPromptToProfile } from "@/db/queries/profiles";
import { validateProfilePrompts, getAllPrompts } from "@/lib/prompts";
import { z } from "zod";

const updatePromptsSchema = z.object({
  prompts: z.array(
    z.object({
      promptId: z.string(),
      answer: z.string().min(10).max(500),
    })
  ),
});

/**
 * GET /api/profiles/prompts - Get available prompts and user's answers
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const profile = await getProfileByUserId(session.user.id);

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const userPrompts = Array.isArray(profile.prompts) ? profile.prompts : [];

    return NextResponse.json({
      availablePrompts: getAllPrompts(),
      userPrompts,
      maxPrompts: 5,
      answeredPromptIds: userPrompts.map((p: any) => p.promptId),
    });
  } catch (error) {
    console.error("[GET /api/profiles/prompts]", error);
    return NextResponse.json(
      { error: "Failed to fetch prompts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profiles/prompts - Update user's profile prompts
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { prompts } = updatePromptsSchema.parse(body);

    const profile = await getProfileByUserId(session.user.id);

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Validate and add timestamps
    const validatedPrompts = prompts.map((p) => ({
      ...p,
      answeredAt: new Date().toISOString(),
    }));

    const updatedProfile = await setProfilePrompts(
      profile.id,
      validatedPrompts
    );

    return NextResponse.json({
      success: true,
      prompts: updatedProfile?.prompts || [],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[POST /api/profiles/prompts]", error);
    return NextResponse.json(
      { error: "Failed to update prompts" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profiles/prompts - Remove a specific prompt answer
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const promptId = searchParams.get("promptId");

    if (!promptId) {
      return NextResponse.json(
        { error: "Missing promptId parameter" },
        { status: 400 }
      );
    }

    const profile = await getProfileByUserId(session.user.id);

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const currentPrompts = Array.isArray(profile.prompts) ? profile.prompts : [];
    const newPrompts = currentPrompts.filter((p: any) => p.promptId !== promptId);

    const updatedProfile = await setProfilePrompts(profile.id, newPrompts);

    return NextResponse.json({
      success: true,
      prompts: updatedProfile?.prompts || [],
    });
  } catch (error) {
    console.error("[DELETE /api/profiles/prompts]", error);
    return NextResponse.json(
      { error: "Failed to delete prompt" },
      { status: 500 }
    );
  }
}
