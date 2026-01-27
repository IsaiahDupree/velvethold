import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  createAvailabilitySlot,
  createAvailabilitySlots,
  getAvailabilitySlotsByProfileId,
  getOpenAvailabilitySlots,
  deleteAvailabilitySlotsByProfileId,
} from "@/db/queries/availability";
import { getProfileByUserId, getProfileById } from "@/db/queries/profiles";
import {
  createAvailabilitySlotSchema,
  createAvailabilitySlotsSchema,
} from "@/lib/validations/availability";

/**
 * GET /api/availability/slots?profileId=xxx&startDate=xxx&endDate=xxx&openOnly=true
 * Get availability slots for a profile
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const profileId = searchParams.get("profileId");
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    const openOnly = searchParams.get("openOnly") === "true";

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId is required" },
        { status: 400 }
      );
    }

    // Verify the profile exists
    const profile = await getProfileById(profileId);
    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    let slots;
    if (openOnly) {
      slots = await getOpenAvailabilitySlots(profileId, startDate, endDate);
    } else {
      // Only allow authenticated users to see all slots (including booked/blocked)
      const session = await getServerSession(authOptions);
      const userProfile = session?.user?.id
        ? await getProfileByUserId(session.user.id)
        : null;

      // Only the profile owner can see all slots
      if (!userProfile || userProfile.id !== profileId) {
        slots = await getOpenAvailabilitySlots(profileId, startDate, endDate);
      } else {
        slots = await getAvailabilitySlotsByProfileId(profileId, startDate, endDate);
      }
    }

    return NextResponse.json(slots);
  } catch (error) {
    console.error("Error fetching availability slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability slots" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/availability/slots
 * Create one or multiple availability slots
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Check if creating multiple slots or a single slot
    const isMultiple = Array.isArray(body.slots);

    if (isMultiple) {
      // Validate multiple slots
      const validated = createAvailabilitySlotsSchema.parse(body);

      // Verify the profile belongs to the authenticated user
      const profile = await getProfileByUserId(session.user.id);
      if (!profile || profile.id !== validated.profileId) {
        return NextResponse.json(
          { error: "You can only create availability slots for your own profile" },
          { status: 403 }
        );
      }

      // Create multiple slots
      const slots = await createAvailabilitySlots(
        validated.slots.map(slot => ({
          ...slot,
          profileId: validated.profileId,
        }))
      );

      return NextResponse.json(slots, { status: 201 });
    } else {
      // Validate single slot
      const validated = createAvailabilitySlotSchema.parse(body);

      // Verify the profile belongs to the authenticated user
      const profile = await getProfileByUserId(session.user.id);
      if (!profile || profile.id !== validated.profileId) {
        return NextResponse.json(
          { error: "You can only create availability slots for your own profile" },
          { status: 403 }
        );
      }

      // Create single slot
      const slot = await createAvailabilitySlot(validated);
      return NextResponse.json(slot, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating availability slot:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create availability slot" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/availability/slots?profileId=xxx
 * Delete all availability slots for a profile
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId is required" },
        { status: 400 }
      );
    }

    // Verify the profile belongs to the authenticated user
    const profile = await getProfileByUserId(session.user.id);
    if (!profile || profile.id !== profileId) {
      return NextResponse.json(
        { error: "You can only delete your own availability slots" },
        { status: 403 }
      );
    }

    const deleted = await deleteAvailabilitySlotsByProfileId(profileId);
    return NextResponse.json({
      message: "Availability slots deleted successfully",
      count: deleted.length
    });
  } catch (error) {
    console.error("Error deleting availability slots:", error);
    return NextResponse.json(
      { error: "Failed to delete availability slots" },
      { status: 500 }
    );
  }
}
