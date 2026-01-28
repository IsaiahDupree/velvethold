import { z } from "zod";

// Time format validation (HH:MM)
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

// Day of week validation (0-6, Sunday-Saturday)
const dayOfWeekSchema = z.number().int().min(0).max(6);

// Time string validation
const timeSchema = z.string().regex(timeRegex, {
  message: "Time must be in HH:MM format (e.g., 09:00, 14:30)",
});

// Slot status enum (matches database schema)
const slotStatusSchema = z.enum(["open", "requested", "booked", "completed"]);

// ===========================
// AVAILABILITY RULES SCHEMAS
// ===========================

export const createAvailabilityRuleSchema = z.object({
  profileId: z.string().uuid(),
  dayOfWeek: dayOfWeekSchema,
  startTime: timeSchema,
  endTime: timeSchema,
  active: z.boolean().optional().default(true),
}).refine(
  (data) => {
    // Validate that endTime is after startTime
    const [startHour, startMin] = data.startTime.split(":").map(Number);
    const [endHour, endMin] = data.endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes > startMinutes;
  },
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

export const updateAvailabilityRuleSchema = z.object({
  dayOfWeek: dayOfWeekSchema.optional(),
  startTime: timeSchema.optional(),
  endTime: timeSchema.optional(),
  active: z.boolean().optional(),
}).refine(
  (data) => {
    // If both times are provided, validate that endTime is after startTime
    if (data.startTime && data.endTime) {
      const [startHour, startMin] = data.startTime.split(":").map(Number);
      const [endHour, endMin] = data.endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      return endMinutes > startMinutes;
    }
    return true;
  },
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

export const createAvailabilityRulesSchema = z.object({
  profileId: z.string().uuid(),
  rules: z.array(
    z.object({
      dayOfWeek: dayOfWeekSchema,
      startTime: timeSchema,
      endTime: timeSchema,
      active: z.boolean().optional().default(true),
    })
  ).min(1, "At least one availability rule is required"),
});

// ===========================
// AVAILABILITY SLOTS SCHEMAS
// ===========================

export const createAvailabilitySlotSchema = z.object({
  profileId: z.string().uuid(),
  startDatetime: z.coerce.date(),
  endDatetime: z.coerce.date(),
  status: slotStatusSchema.optional().default("open"),
}).refine(
  (data) => {
    // Validate that endDatetime is after startDatetime
    return data.endDatetime > data.startDatetime;
  },
  {
    message: "End datetime must be after start datetime",
    path: ["endDatetime"],
  }
);

export const updateAvailabilitySlotSchema = z.object({
  startDatetime: z.coerce.date().optional(),
  endDatetime: z.coerce.date().optional(),
  status: slotStatusSchema.optional(),
}).refine(
  (data) => {
    // If both datetimes are provided, validate that endDatetime is after startDatetime
    if (data.startDatetime && data.endDatetime) {
      return data.endDatetime > data.startDatetime;
    }
    return true;
  },
  {
    message: "End datetime must be after start datetime",
    path: ["endDatetime"],
  }
);

export const createAvailabilitySlotsSchema = z.object({
  profileId: z.string().uuid(),
  slots: z.array(
    z.object({
      startDatetime: z.coerce.date(),
      endDatetime: z.coerce.date(),
      status: slotStatusSchema.optional().default("open"),
    })
  ).min(1, "At least one availability slot is required"),
});

// Query parameters schema for fetching slots
export const getAvailabilitySlotsQuerySchema = z.object({
  profileId: z.string().uuid(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: slotStatusSchema.optional(),
});

// Types exported from schemas
export type CreateAvailabilityRuleInput = z.infer<typeof createAvailabilityRuleSchema>;
export type UpdateAvailabilityRuleInput = z.infer<typeof updateAvailabilityRuleSchema>;
export type CreateAvailabilityRulesInput = z.infer<typeof createAvailabilityRulesSchema>;
export type CreateAvailabilitySlotInput = z.infer<typeof createAvailabilitySlotSchema>;
export type UpdateAvailabilitySlotInput = z.infer<typeof updateAvailabilitySlotSchema>;
export type CreateAvailabilitySlotsInput = z.infer<typeof createAvailabilitySlotsSchema>;
export type GetAvailabilitySlotsQuery = z.infer<typeof getAvailabilitySlotsQuerySchema>;
