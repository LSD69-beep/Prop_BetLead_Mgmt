---
name: "GlassWindow Design System"
description: "An architectural, transparent, light-mode design system for GlassWindow—a data-backed homebuying advisory platform with dedicated Customer and Agent portals."
---

## Overview

GlassWindow is built on clarity, objectivity, and calm confidence. Buying a home is one of the largest financial decisions a person makes, so the interface avoids aggressive sales tactics, visual clutter, and neon urgency. Instead, it pairs a **cool mineral-mist background** with crisp white content cards, deep slate-teal primary actions, and warm terracotta highlights for key metrics and advisory calls to action.

- **Brand Personality:** Transparent, analytical, reassuring, and architectural.
- **Target Audience:** Urban homebuyers seeking unbiased property due diligence, alongside real estate advisors/agents managing client shortlists and inspection reports.
- **Design Style:** **Editorial Minimalism** — generous whitespace, clear typographic hierarchy, structured data scorecards, and soft tonal layering.

## Colors

The palette replaces stark white backgrounds with a calm, architectural **Mineral Mist** canvas (`#F2F5F3`) that lets crisp white property cards and structured scorecards stand out naturally without heavy drop shadows.

- **Primary (`#0F4C5C`):** Deep Slate Teal conveys trust, analytical rigor, and architectural stability. Used for primary CTAs, active navigation states, and key headings.
- **Secondary (`#B44D27`):** Warm Terracotta adds human warmth for advisory highlights, featured scores, and Agent Portal accents.
- **Surfaces:** Layered neutral-cool tones (`surface` → `surface-container-low` → `surface-container`) create clear visual separation.
- **Semantic:** Strictly reserved for verification badges, RERA compliance status, price-fairness indicators, and form feedback.

```yaml
colors:
  primary: "#0F4C5C"
  on-primary: "#FFFFFF"
  primary-container: "#D2E8ED"
  on-primary-container: "#09323D"
  secondary: "#B44D27"
  on-secondary: "#FFFFFF"
  secondary-container: "#FCE8E0"
  on-secondary-container: "#5C220D"
  accent: "#D97736"
  on-accent: "#2A2A2A"
  surface: "#F2F5F3"
  surface-container-low: "#E9EFEA"
  surface-container: "#FFFFFF"
  surface-container-high: "#DDE6E0"
  on-surface: "#152226"
  on-surface-variant: "#4B5E63"
  outline: "#8FA3A8"
  outline-variant: "#D0DDD7"
  success: "#1F7A4C"
  on-success: "#FFFFFF"
  success-container: "#DCFCE7"
  on-success-container: "#14532D"
  warning: "#B45309"
  on-warning: "#FFFFFF"
  error: "#B91C1C"
  on-error: "#FFFFFF"
```

## Typography

GlassWindow pairs **Playfair Display** for editorial headlines with **Montserrat** for clean, highly legible UI copy and **Red Hat Mono** for property scores, RERA IDs, carpet-area percentages, and price-per-sq-ft figures.

```yaml
typography:
  display-lg:
    fontFamily: "Playfair Display"
    fontSize: 48px
    fontWeight: 700
    lineHeight: 56px
    letterSpacing: -0.75px
  display-lg-mobile:
    fontFamily: "Playfair Display"
    fontSize: 32px
    fontWeight: 700
    lineHeight: 40px
    letterSpacing: -0.5px
  display-md:
    fontFamily: "Playfair Display"
    fontSize: 38px
    fontWeight: 700
    lineHeight: 46px
    letterSpacing: -0.5px
  display-md-mobile:
    fontFamily: "Playfair Display"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 36px
    letterSpacing: -0.25px
  headline-lg:
    fontFamily: "Playfair Display"
    fontSize: 34px
    fontWeight: 600
    lineHeight: 42px
    letterSpacing: -0.25px
  headline-lg-mobile:
    fontFamily: "Playfair Display"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: 0px
  headline-md:
    fontFamily: "Montserrat"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 32px
    letterSpacing: -0.2px
  headline-sm:
    fontFamily: "Montserrat"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 28px
    letterSpacing: 0px
  title-lg:
    fontFamily: "Montserrat"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 26px
    letterSpacing: 0px
  title-md:
    fontFamily: "Montserrat"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: 0px
  body-lg:
    fontFamily: "Montserrat"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 26px
    letterSpacing: 0px
  body-md:
    fontFamily: "Montserrat"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 22px
    letterSpacing: 0px
  body-sm:
    fontFamily: "Montserrat"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 18px
    letterSpacing: 0.1px
  label-lg:
    fontFamily: "Montserrat"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0.1px
  label-md:
    fontFamily: "Montserrat"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 16px
    letterSpacing: 0.2px
  label-sm:
    fontFamily: "Montserrat"
    fontSize: 11px
    fontWeight: 600
    lineHeight: 14px
    letterSpacing: 0.3px
  mono-md:
    fontFamily: "Red Hat Mono"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
    letterSpacing: 0px
  mono-sm:
    fontFamily: "Red Hat Mono"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0px
```

## Layout & Spacing

The desktop layout uses a **Fixed-Max-Width 12-Column Grid** (`max-w-7xl`, 1280px max container) with 24px page margins and 24px column gutters. On mobile (`390px`), grids collapse to a single column with 16px page margins. A strict 4px/8px spacing scale keeps card padding, form fields, and section rhythm aligned.

```yaml
spacing:
  gutter-xs: 4px
  gutter-sm: 8px
  gutter-md: 16px
  gutter-lg: 24px
  gutter-xl: 32px
  section: 64px
  page-margin: 24px
```

## Elevation & Depth

Hierarchy relies on **tonal surface stepping** (`surface` `#F2F5F3` → `surface-container` `#FFFFFF`) paired with crisp 1px `outline-variant` (`#D0DDD7`) borders. Shadows are kept ultra-subtle (`shadow-sm`) and used only for floating navigation bars, interactive hover states, and modal overlays. Avoid heavy drop shadows or frosted-glass blur effects so typography and property data stay razor-sharp.

## Shapes

Corners are refined and architectural—moderately rounded to feel approachable without looking playful or bubbly. Cards use `lg` (`16px`), buttons and inputs use `md` (`12px`) or `DEFAULT` (`8px`), and filter pills or status badges use `full` (`9999px`).

```yaml
rounded:
  sm: 4px
  DEFAULT: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px
```

## Motion & Micro-interaction

Interactions are crisp, immediate, and purposeful. Hover and focus transitions settle within `150ms`, while modal dialogs and accordion panels enter smoothly over `250ms`. Only `transform`, `opacity`, and color properties are animated.

```yaml
motion:
  state-change:
    duration: 150ms
    delay: 0ms
    timingFunction: ease-out
  surface-enter:
    duration: 250ms
    delay: 0ms
    timingFunction: cubic-bezier(0.2, 0, 0, 1)
  surface-exit:
    duration: 150ms
    delay: 0ms
    timingFunction: cubic-bezier(0.3, 0, 1, 1)
```

## Voice & Content Strategy

- **Tone of Voice:** Clear, objective, and reassuring. Speak like a knowledgeable architect or financial advisor—never like a pushy real estate broker. Avoid hype words ("dream home", "unbelievable deal", "luxury redefined").
- **Capitalisation:** Sentence case for headings, form labels, and table headers. Title case for brand names, navigation items, and primary CTA buttons (`Book Free Consultation`, `Customer Login`, `Agent Login`).
- **Terminology:** Use *GlassWindow Score* (not rating), *Carpet Area Efficiency*, *RERA Verified*, *Customer Portal*, and *Agent Portal* consistently.
- **Numbers & Currency:** Use `tabular-nums` for all prices (`₹1.85 Cr`, `₹11,400 / sq.ft`), scores (`8.9 / 10`), and metrics (`80+ Data Points`).

## Components

Component implementations live as individual HTML sticker sheet files in
`components/`. Each file contains the canonical, styled HTML components with
`<!-- COMPONENT: name -->` comment markers. Read each file before use.

- **Badge** → `@components/badge.html`: `badge-numeric`, `badge-dot`
- **Button** → `@components/button.html`: `button-primary`, `button-icon`, `button-with-icon`
- **Card** → `@components/card.html`: `card-elevated`, `card-action`, `card-interactive`, `card-interactive-2`
- **Input Field** → `@components/input-field.html`: `input-field-text`, `input-field-icon`
- **Tabs** → `@components/tabs.html`: `tabs-horizontal`, `tabs-with-icon`
