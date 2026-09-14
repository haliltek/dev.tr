---
version: 1.0.0
name: Devcore Admin Design Tokens
description: Design specifications and visual token contract for devcore.tr management center and admin dashboard.
colors:
  primary: "#2563eb"
  primary-hover: "#1d4ed8"
  primary-light: "#dbeafe"
  secondary: "#0f172a"
  accent: "#10b981"
  accent-hover: "#059669"
  warning: "#f59e0b"
  danger: "#ef4444"
  background: "#090d16"
  surface: "#111827"
  surface-hover: "#1f2937"
  surface-border: "#1f2937"
  text-primary: "#f8fafc"
  text-secondary: "#94a3b8"
  text-muted: "#64748b"
typography:
  heading-xl:
    fontFamily: "Inter, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  heading-lg:
    fontFamily: "Inter, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body-md:
    fontFamily: "Inter, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label-sm:
    fontFamily: "Inter, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "20px"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
---

# Devcore.tr Admin Panel - Design Rationale & Style Guide

## Overview
Devcore.tr Admin Panel provides system monitoring, moderation, and management for the Turkish Developer Ecosystem. It is built upon TailAdmin (Next.js App Router + Tailwind CSS) with a tailored dark & light aesthetic, prioritized developer readability, dense data views, and responsive operations.

## Colors
- **Primary Electric Blue (`#2563eb`)**: Used for primary action buttons, active navigation items, interactive links, and focus rings.
- **Emerald Accent (`#10b981`)**: Used for healthy status indicators (active ads, successful crawl, live feeds, approved items).
- **Amber Warning (`#f59e0b`)**: Used for pending reviews, crawl in progress, and warning alerts.
- **Rose / Danger (`#ef4444`)**: Used for deletions, error messages, and disabled accounts.
- **Dark Surface (`#090d16` & `#111827`)**: Deep slate dark theme minimizing eye strain during long moderation sessions.
- **Purple Ban Compliance**: Strict avoidance of generic purple gradients; clean slate, obsidian, and electric blue hues are used.

## Typography
- **Primary Font**: `Inter`, with fallbacks to system UI fonts.
- Crisp numeric weights for tabular data, stats cards, and timestamp formatting.

## Elevation & Depth
- Subtle 1px borders (`#1f2937`) over high-blur drop shadows for a crisp modern flat-dashboard aesthetic.
- Interactive cards elevate with smooth hover transitions.

## Components
- **Stats Card**: High-contrast numeral, mini trend icon, contextual badge.
- **Data Table**: Sticky header, zebra-striping or hover-highlighting, compact row heights for high information density.
- **Modal Dialog**: Centered backdrop blur, autofocus on primary input, explicit escape/dismiss.
- **Status Badges**: Rounded pills with dot indicators.

## Do's and Don'ts
- **DO** keep actions explicit with confirmation dialogs for destructive actions (e.g. deleting a post or source).
- **DO** provide live feedback upon triggering the crawler bot.
- **DON'T** use unauthenticated open endpoints.
- **DON'T** introduce raw arbitrary hex codes outside the token scale.
