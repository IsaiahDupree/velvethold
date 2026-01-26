# PRD: Event Tracking System for VelvetHold

**Status:** Active  
**Created:** 2026-01-25  
**Based On:** BlankLogo Event Tracking Pattern

## Overview

Implement sophisticated user event tracking for VelvetHold to optimize user engagement and monetization funnels.

## Event Categories

| Category | Events |
|----------|--------|
| **Acquisition** | `landing_view`, `cta_click`, `pricing_view`, `feature_preview` |
| **Activation** | `signup_start`, `login_success`, `activation_complete`, `profile_setup` |
| **Core Value** | `item_created`, `item_saved`, `collection_created`, `share_completed`, `export_completed` |
| **Monetization** | `checkout_started`, `purchase_completed`, `subscription_started`, `plan_upgraded` |
| **Retention** | `return_session`, `items_this_week`, `collection_updated` |
| **Reliability** | `error_shown`, `upload_failed`, `sync_failed` |

## Core Value Event Properties

### item_created
```json
{
  "item_id": "string",
  "item_type": "string",
  "collection_id": "string",
  "metadata": "object"
}
```

### export_completed
```json
{
  "export_id": "string",
  "format": "string",
  "item_count": "number",
  "file_size_mb": "number"
}
```

## 4 North Star Milestones

1. **Activated** = `profile_setup` complete
2. **First Value** = first `item_saved`
3. **Aha Moment** = first `share_completed` or `export_completed`
4. **Monetized** = `purchase_completed`

## Features

| ID | Name | Priority |
|----|------|----------|
| TRACK-001 | Tracking SDK Integration | P1 |
| TRACK-002 | Acquisition Event Tracking | P1 |
| TRACK-003 | Activation Event Tracking | P1 |
| TRACK-004 | Core Value Event Tracking | P1 |
| TRACK-005 | Monetization Event Tracking | P1 |
| TRACK-006 | Retention Event Tracking | P2 |
| TRACK-007 | Error & Performance Tracking | P2 |
| TRACK-008 | User Identification | P1 |
