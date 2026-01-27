import { pgTable, uuid, varchar, text, timestamp, integer, pgEnum, jsonb, boolean, time } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["invitee", "requester", "both"]);
export const verificationStatusEnum = pgEnum("verification_status", ["unverified", "pending", "verified"]);
export const intentEnum = pgEnum("intent", ["dating", "relationship", "friends"]);
export const slotStatusEnum = pgEnum("slot_status", ["open", "requested", "booked", "completed"]);
export const depositStatusEnum = pgEnum("deposit_status", ["pending", "held", "refunded", "released"]);
export const approvalStatusEnum = pgEnum("approval_status", ["pending", "approved", "declined"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "succeeded", "failed", "refunded"]);
export const visibilityLevelEnum = pgEnum("visibility_level", ["public", "verified", "paid", "approved"]);
export const reportTypeEnum = pgEnum("report_type", ["harassment", "inappropriate_behavior", "fake_profile", "scam", "offensive_content", "other"]);
export const reportStatusEnum = pgEnum("report_status", ["pending", "under_review", "resolved", "dismissed"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  role: userRoleEnum("role").notNull().default("requester"),
  verificationStatus: verificationStatusEnum("verification_status").notNull().default("unverified"),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  twoFactorSecret: varchar("two_factor_secret", { length: 255 }),
  twoFactorBackupCodes: jsonb("two_factor_backup_codes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  age: integer("age").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  bio: text("bio"),
  intent: intentEnum("intent").notNull().default("dating"),
  datePreferences: jsonb("date_preferences"),
  boundaries: text("boundaries"),
  screeningQuestions: jsonb("screening_questions"),
  depositAmount: integer("deposit_amount"),
  cancellationPolicy: text("cancellation_policy"),
  availabilityVisibility: visibilityLevelEnum("availability_visibility").default("verified"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const availabilityRules = pgTable("availability_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  active: boolean("active").notNull().default(true),
});

export const availabilitySlots = pgTable("availability_slots", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  startDatetime: timestamp("start_datetime").notNull(),
  endDatetime: timestamp("end_datetime").notNull(),
  status: slotStatusEnum("status").notNull().default("open"),
});

export const dateRequests = pgTable("date_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  inviteeId: uuid("invitee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  requesterId: uuid("requester_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  slotId: uuid("slot_id").references(() => availabilitySlots.id, { onDelete: "set null" }),
  screeningAnswers: jsonb("screening_answers"),
  introMessage: text("intro_message").notNull(),
  depositAmount: integer("deposit_amount").notNull(),
  depositStatus: depositStatusEnum("deposit_status").notNull().default("pending"),
  approvalStatus: approvalStatusEnum("approval_status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestId: uuid("request_id").notNull().references(() => dateRequests.id, { onDelete: "cascade" }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  amount: integer("amount").notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const chats = pgTable("chats", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestId: uuid("request_id").notNull().references(() => dateRequests.id, { onDelete: "cascade" }).unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatId: uuid("chat_id").notNull().references(() => chats.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reporterId: uuid("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reportedUserId: uuid("reported_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reportType: reportTypeEnum("report_type").notNull(),
  description: text("description").notNull(),
  context: varchar("context", { length: 50 }),
  contextId: uuid("context_id"),
  status: reportStatusEnum("status").notNull().default("pending"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
  actionTaken: varchar("action_taken", { length: 50 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const blocks = pgTable("blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  blockerId: uuid("blocker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  blockedUserId: uuid("blocked_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  sentRequests: many(dateRequests, { relationName: "requester" }),
  receivedRequests: many(dateRequests, { relationName: "invitee" }),
  messages: many(messages),
  passwordResetTokens: many(passwordResetTokens),
  emailVerificationTokens: many(emailVerificationTokens),
  submittedReports: many(reports, { relationName: "reporter" }),
  receivedReports: many(reports, { relationName: "reported" }),
  reviewedReports: many(reports, { relationName: "reviewer" }),
  blockedUsers: many(blocks, { relationName: "blocker" }),
  blockedByUsers: many(blocks, { relationName: "blocked" }),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  availabilityRules: many(availabilityRules),
  availabilitySlots: many(availabilitySlots),
}));

export const dateRequestsRelations = relations(dateRequests, ({ one, many }) => ({
  invitee: one(users, {
    fields: [dateRequests.inviteeId],
    references: [users.id],
    relationName: "invitee",
  }),
  requester: one(users, {
    fields: [dateRequests.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  slot: one(availabilitySlots, {
    fields: [dateRequests.slotId],
    references: [availabilitySlots.id],
  }),
  payment: one(payments),
  chat: one(chats),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  request: one(dateRequests, {
    fields: [chats.requestId],
    references: [dateRequests.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const emailVerificationTokensRelations = relations(emailVerificationTokens, ({ one }) => ({
  user: one(users, {
    fields: [emailVerificationTokens.userId],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
    relationName: "reporter",
  }),
  reportedUser: one(users, {
    fields: [reports.reportedUserId],
    references: [users.id],
    relationName: "reported",
  }),
  reviewer: one(users, {
    fields: [reports.reviewedBy],
    references: [users.id],
    relationName: "reviewer",
  }),
}));

export const blocksRelations = relations(blocks, ({ one }) => ({
  blocker: one(users, {
    fields: [blocks.blockerId],
    references: [users.id],
    relationName: "blocker",
  }),
  blockedUser: one(users, {
    fields: [blocks.blockedUserId],
    references: [users.id],
    relationName: "blocked",
  }),
}));
