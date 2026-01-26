# PRD: Meta Pixel & CAPI Integration for VelvetHold

**Status:** Active  
**Created:** 2026-01-25  
**Priority:** P1

## Overview

Implement Facebook Meta Pixel and Conversions API for VelvetHold to optimize user sign-ups and subscriptions.

## Standard Events Mapping

| VelvetHold Event | Meta Standard Event | Parameters |
|------------------|---------------------|------------|
| `landing_view` | `PageView` | - |
| `feature_preview` | `ViewContent` | `content_type: 'feature'` |
| `signup_complete` | `CompleteRegistration` | `content_name`, `status` |
| `item_created` | `AddToCart` | `content_type: 'item'` |
| `export_completed` | `ViewContent` | `content_ids` |
| `checkout_started` | `InitiateCheckout` | `value`, `currency` |
| `purchase_completed` | `Purchase` | `value`, `currency` |
| `subscription_started` | `Subscribe` | `value`, `currency` |

## Features

| ID | Name | Priority |
|----|------|----------|
| META-001 | Meta Pixel Installation | P1 |
| META-002 | PageView Tracking | P1 |
| META-003 | Standard Events Mapping | P1 |
| META-004 | CAPI Server-Side Events | P1 |
| META-005 | Event Deduplication | P1 |
| META-006 | User Data Hashing (PII) | P1 |
| META-007 | Custom Audiences Setup | P2 |
| META-008 | Conversion Optimization | P2 |
