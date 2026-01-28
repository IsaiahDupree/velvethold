import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getAvailabilitySlotById,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
  bookAvailabilitySlot,
  blockAvailabilitySlot,
  openAvailabilitySlot,
} from "@/db/queries/availability";
import { getProfileByUserId } from "@/db/queries/profiles";
import { updateAvailabilitySlotSchema } from "@/lib/validations/availability";

/**
 * GET /api/availability/slots/[id]
 * Get a specific availability slot
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const slot = await getAvailabilitySlotById(id);

    if (!slot) {
      return NextResponse.json(
        { error: "Availability slot not found" },
        { status: 404 }
      );
    }

    // Anyone can view individual slots (for booking purposes)
    // But we might want to hide booked/blocked slots from non-owners
    const session = await auth();
    const profile = session?.user?.id
      ? await getProfileByUserId(session.user.id)
      : null;

    // If the slot is not open and the user is not the owner, don't show it
    if (slot.status !== "open" && (!profile || profile.id !== slot.profileId)) {
      return NextResponse.json(
        { error: "Availability slot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(slot);
  } catch (error) {
    console.error("Error fetching availability slot:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability slot" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/availability/slots/[id]
 * Update an availability slot
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const slot = await getAvailabilitySlotById(id);

    if (!slot) {
      return NextResponse.json(
        { error: "Availability slot not found" },
        { status: 404 }
      );
    }

    // Verify the slot belongs to the authenticated user's profile
    const profile = await getProfileByUserId(session.user.id);
    if (!profile || profile.id !== slot.profileId) {
      return NextResponse.json(
        { error: "You can only update your own availability slots" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Check for special action parameters
    if (body.action) {
      let updated;
      switch (body.action) {
        case "book":
          updated = await bookAvailabilitySlot(id);
          break;
        case "block":
          updated = await blockAvailabilitySlot(id);
          break;
        case "open":
          updated = await openAvailabilitySlot(id);
          break;
        default:
          return NextResponse.json(
            { error: "Invalid action. Valid actions: book, block, open" },
            { status: 400 }
          );
      }
      return NextResponse.json(updated);
    }

    // Regular update
    const validated = updateAvailabilitySlotSchema.parse(body);
    const updated = await updateAvailabilitySlot(id, validated);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating availability slot:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update availability slot" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/availability/slots/[id]
 * Delete a specific availability slot
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const slot = await getAvailabilitySlotById(id);

    if (!slot) {
      return NextResponse.json(
        { error: "Availability slot not found" },
        { status: 404 }
      );
    }

    // Verify the slot belongs to the authenticated user's profile
    const profile = await getProfileByUserId(session.user.id);
    if (!profile || profile.id !== slot.profileId) {
      return NextResponse.json(
        { error: "You can only delete your own availability slots" },
        { status: 403 }
      );
    }

    await deleteAvailabilitySlot(id);

    return NextResponse.json({
      message: "Availability slot deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting availability slot:", error);
    return NextResponse.json(
      { error: "Failed to delete availability slot" },
      { status: 500 }
    );
  }
}
