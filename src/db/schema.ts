import { pgTable, uuid, varchar, text, timestamp, integer, pgEnum, jsonb, boolean, time } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["invitee", "requester", "both"]);
export const verificationStatusEnum = pgEnum("verification_status", ["unverified", "pending", "verified"]);
export const accountStatusEnum = pgEnum("account_status", ["active", "flagged", "suspended", "banned"]);
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
  accountStatus: accountStatusEnum("account_status").notNull().default("active"),
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
  expiresAt: timestamp("expires_at"),
  dateConfirmedAt: timestamp("date_confirmed_at"),
  confirmedDateTime: timestamp("confirmed_date_time"),
  confirmedLocation: varchar("confirmed_location", { length: 500 }),
  confirmedDetails: text("confirmed_details"),
  inviteeConfirmed: boolean("invitee_confirmed").notNull().default(false),
  requesterConfirmed: boolean("requester_confirmed").notNull().default(false),
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

export const photos = pgTable("photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  publicId: varchar("public_id", { length: 255 }).notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  order: integer("order").notNull().default(0),
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
  photos: many(photos),
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

export const photosRelations = relations(photos, ({ one }) => ({
  user: one(users, {
    fields: [photos.userId],
    references: [users.id],
  }),
}));

// Growth Data Plane Tables

export const eventSourceEnum = pgEnum("event_source", ["web", "app", "email", "stripe", "booking", "meta"]);
export const identityProviderEnum = pgEnum("identity_provider", ["posthog", "stripe", "meta", "app"]);
export const emailEventTypeEnum = pgEnum("email_event_type", ["delivered", "opened", "clicked", "bounced", "complained", "unsubscribed"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "canceled", "past_due", "trialing", "paused"]);
export const dealStageEnum = pgEnum("deal_stage", ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"]);

// Canonical person table for unified identity
export const person = pgTable("person", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  name: varchar("name", { length: 255 }),
  traits: jsonb("traits"), // Additional user attributes
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Identity linking table for cross-platform identity resolution
export const identityLink = pgTable("identity_link", {
  id: uuid("id").primaryKey().defaultRandom(),
  personId: uuid("person_id").notNull().references(() => person.id, { onDelete: "cascade" }),
  provider: identityProviderEnum("provider").notNull(),
  externalId: varchar("external_id", { length: 255 }).notNull(), // ID from external system
  metadata: jsonb("metadata"), // Additional provider-specific data
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Unified events table from all sources
export const event = pgTable("event", {
  id: uuid("id").primaryKey().defaultRandom(),
  personId: uuid("person_id").references(() => person.id, { onDelete: "set null" }),
  eventName: varchar("event_name", { length: 255 }).notNull(),
  source: eventSourceEnum("source").notNull(),
  properties: jsonb("properties"), // Event-specific data
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  sessionId: varchar("session_id", { length: 255 }),
  deviceId: varchar("device_id", { length: 255 }),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  eventId: varchar("event_id", { length: 255 }), // For Meta Pixel/CAPI deduplication
});

// Email messages sent
export const emailMessage = pgTable("email_message", {
  id: uuid("id").primaryKey().defaultRandom(),
  personId: uuid("person_id").references(() => person.id, { onDelete: "set null" }),
  messageId: varchar("message_id", { length: 255 }).notNull().unique(), // Resend message ID
  subject: varchar("subject", { length: 500 }),
  template: varchar("template", { length: 255 }),
  tags: jsonb("tags"), // For associating with campaigns/automations
  sentAt: timestamp("sent_at").notNull().defaultNow(),
});

// Email engagement events from Resend webhooks
export const emailEvent = pgTable("email_event", {
  id: uuid("id").primaryKey().defaultRandom(),
  emailMessageId: uuid("email_message_id").notNull().references(() => emailMessage.id, { onDelete: "cascade" }),
  eventType: emailEventTypeEnum("event_type").notNull(),
  link: varchar("link", { length: 1000 }), // For click events
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Subscription snapshot from Stripe
export const subscription = pgTable("subscription", {
  id: uuid("id").primaryKey().defaultRandom(),
  personId: uuid("person_id").notNull().references(() => person.id, { onDelete: "cascade" }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull(),
  status: subscriptionStatusEnum("status").notNull(),
  planName: varchar("plan_name", { length: 255 }),
  planInterval: varchar("plan_interval", { length: 50 }), // monthly, yearly
  mrr: integer("mrr"), // Monthly recurring revenue in cents
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Deal/opportunity tracking
export const deal = pgTable("deal", {
  id: uuid("id").primaryKey().defaultRandom(),
  personId: uuid("person_id").notNull().references(() => person.id, { onDelete: "cascade" }),
  stage: dealStageEnum("stage").notNull().default("lead"),
  value: integer("value"), // Deal value in cents
  source: varchar("source", { length: 255 }), // Where the lead came from
  notes: text("notes"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Computed person features for segmentation
export const personFeatures = pgTable("person_features", {
  id: uuid("id").primaryKey().defaultRandom(),
  personId: uuid("person_id").notNull().references(() => person.id, { onDelete: "cascade" }).unique(),
  activeDays: integer("active_days").notNull().default(0),
  coreActions: integer("core_actions").notNull().default(0), // Key product actions
  pricingViews: integer("pricing_views").notNull().default(0),
  emailOpens: integer("email_opens").notNull().default(0),
  emailClicks: integer("email_clicks").notNull().default(0),
  lastActiveAt: timestamp("last_active_at"),
  firstSeenAt: timestamp("first_seen_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Segment definitions and membership
export const segment = pgTable("segment", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  criteria: jsonb("criteria").notNull(), // Segment rules/filters
  automationConfig: jsonb("automation_config"), // Triggers (Resend, Meta, outbound)
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Segment membership tracking
export const segmentMembership = pgTable("segment_membership", {
  id: uuid("id").primaryKey().defaultRandom(),
  segmentId: uuid("segment_id").notNull().references(() => segment.id, { onDelete: "cascade" }),
  personId: uuid("person_id").notNull().references(() => person.id, { onDelete: "cascade" }),
  enteredAt: timestamp("entered_at").notNull().defaultNow(),
  exitedAt: timestamp("exited_at"),
});

// Relations for Growth Data Plane tables
export const personRelations = relations(person, ({ many }) => ({
  identityLinks: many(identityLink),
  events: many(event),
  emailMessages: many(emailMessage),
  subscriptions: many(subscription),
  deals: many(deal),
  features: many(personFeatures),
}));

export const identityLinkRelations = relations(identityLink, ({ one }) => ({
  person: one(person, {
    fields: [identityLink.personId],
    references: [person.id],
  }),
}));

export const eventRelations = relations(event, ({ one }) => ({
  person: one(person, {
    fields: [event.personId],
    references: [person.id],
  }),
}));

export const emailMessageRelations = relations(emailMessage, ({ one, many }) => ({
  person: one(person, {
    fields: [emailMessage.personId],
    references: [person.id],
  }),
  events: many(emailEvent),
}));

export const emailEventRelations = relations(emailEvent, ({ one }) => ({
  emailMessage: one(emailMessage, {
    fields: [emailEvent.emailMessageId],
    references: [emailMessage.id],
  }),
}));

export const subscriptionRelations = relations(subscription, ({ one }) => ({
  person: one(person, {
    fields: [subscription.personId],
    references: [person.id],
  }),
}));

export const dealRelations = relations(deal, ({ one }) => ({
  person: one(person, {
    fields: [deal.personId],
    references: [person.id],
  }),
}));

export const personFeaturesRelations = relations(personFeatures, ({ one }) => ({
  person: one(person, {
    fields: [personFeatures.personId],
    references: [person.id],
  }),
}));

export const segmentRelations = relations(segment, ({ many }) => ({
  memberships: many(segmentMembership),
}));

export const segmentMembershipRelations = relations(segmentMembership, ({ one }) => ({
  segment: one(segment, {
    fields: [segmentMembership.segmentId],
    references: [segment.id],
  }),
  person: one(person, {
    fields: [segmentMembership.personId],
    references: [person.id],
  }),
}));
