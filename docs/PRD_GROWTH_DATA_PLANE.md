# PRD: Growth Data Plane for VelvetHold

**Status:** Active  
**Created:** 2026-01-25  
**Priority:** P0  
**Reference:** `autonomous-coding-dashboard/harness/prompts/PRD_GROWTH_DATA_PLANE.md`

## Overview

Implement the Growth Data Plane for VelvetHold: unified event tracking for user engagement and monetization funnels.

## VelvetHold-Specific Events

| Event | Source | Segment Trigger |
|-------|--------|-----------------|
| `landing_view` | web | - |
| `feature_preview` | web | warm_lead |
| `signup_completed` | web | new_signup |
| `profile_setup` | app | activated |
| `item_created` | app | first_action |
| `item_saved` | app | first_value |
| `collection_created` | app | power_user |
| `share_completed` | app | aha_moment |
| `export_completed` | app | - |
| `checkout_started` | web | checkout_started |
| `purchase_completed` | stripe | - |
| `subscription_started` | stripe | monetized |
| `email.clicked` | resend | newsletter_clicker |

## Segments for VelvetHold

1. **signup_no_profile_24h** → email: "Complete your profile"
2. **profile_done_no_items_48h** → email: "Create your first item"
3. **items_created_no_share** → email: "Share your collection"
4. **high_usage_free_tier** → email: "Unlock premium features"
5. **inactive_7d** → email: "Your items are waiting"

## Features

| ID | Name | Priority |
|----|------|----------|
| GDP-001 | Supabase Schema Setup | P0 |
| GDP-002 | Person & Identity Tables | P0 |
| GDP-003 | Unified Events Table | P0 |
| GDP-004 | Resend Webhook Edge Function | P0 |
| GDP-005 | Email Event Tracking | P0 |
| GDP-006 | Click Redirect Tracker | P1 |
| GDP-007 | Stripe Webhook Integration | P1 |
| GDP-008 | Subscription Snapshot | P1 |
| GDP-009 | PostHog Identity Stitching | P1 |
| GDP-010 | Meta Pixel + CAPI Dedup | P1 |
| GDP-011 | Person Features Computation | P1 |
| GDP-012 | Segment Engine | P1 |
