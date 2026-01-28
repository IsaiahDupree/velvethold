/**
 * Link external identity to person
 *
 * Creates an identity link between a person and an external provider ID
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { linkIdentity } from "@/lib/growth/identity-service";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { personId, provider, externalId, metadata } = body;

    if (!personId || !provider || !externalId) {
      return NextResponse.json(
        { error: "Missing required fields: personId, provider, externalId" },
        { status: 400 }
      );
    }

    // Validate provider
    const validProviders = ["posthog", "stripe", "meta", "app"];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: "Invalid provider. Must be one of: posthog, stripe, meta, app" },
        { status: 400 }
      );
    }

    // Link identity
    const result = await linkIdentity(personId, {
      provider,
      externalId,
      metadata,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error linking identity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
