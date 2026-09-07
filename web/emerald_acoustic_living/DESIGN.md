---
name: Emerald Acoustic Living
colors:
  surface: '#ebfef2'
  surface-dim: '#ccdfd3'
  surface-bright: '#ebfef2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e5f8ed'
  surface-container: '#dff2e7'
  surface-container-high: '#daede1'
  surface-container-highest: '#d4e7dc'
  on-surface: '#0f1f18'
  on-surface-variant: '#3e4942'
  inverse-surface: '#24342c'
  inverse-on-surface: '#e2f5ea'
  outline: '#6e7a72'
  outline-variant: '#bdc9c0'
  surface-tint: '#006c49'
  primary: '#006544'
  on-primary: '#ffffff'
  primary-container: '#0e8058'
  on-primary-container: '#d6ffe6'
  inverse-primary: '#78d9aa'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#7c4d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#9d6300'
  on-tertiary-container: '#fff3e9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#94f6c5'
  primary-fixed-dim: '#78d9aa'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#ebfef2'
  on-background: '#0f1f18'
  surface-variant: '#d4e7dc'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 42px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  spacing-2xs: 4px
  spacing-xs: 8px
  spacing-sm: 12px
  spacing-md: 16px
  spacing-lg: 20px
  spacing-xl: 24px
  spacing-2xl: 32px
  spacing-3xl: 40px
  screen-margin: 16px
  card-padding: 18px
  grid-gutter: 12px
---

## Brand & Style

This design system defines the resident-facing mini-program experience for modern smart communities. It departs from the clinical, bureaucratic utility of traditional property management applications, establishing an editorial, tactile, and voice-rich atmosphere.

### Brand Personality & Emotional Core
- **Warm & Neighborly (温暖亲民):** Accessible and welcoming, stripping away corporate distance with organic jade tones and soft ivory surfaces.
- **Modern Soft-Luxury (轻奢高级感):** Exuding intentional craftsmanship through diffuse ambient backdrops, subtle specular rims, and generous white space rather than heavy ornamentation.
- **Acoustic Media Warmth (融媒体温度):** Celebrating neighborhood voices, ambient audio, and multimedia community life with dynamic sound wave motifs and broadcast-grade micro-widgets.

### Design Movement: Tactile Glass & Organic Modernism
The visual philosophy marries **Frosted Glassmorphism** with **Tactile Micro-depth**. Key surfaces leverage translucent milk-glass panels layered above soft emerald-tinted canvas backdrops. Crisp 1px translucent inner borders mimic physical beveled glass, while tactile buttons and audio capsules deliver immediate, responsive physical feedback.

## Colors

The palette balances deep emerald forestry with warm, breathable neutrals and energetic acoustic accents.

### Palette Roles
- **Primary (`#0E8058` - Emerald Jade):** Anchors main navigation states, core actions (e.g., service requests, verification), and strong brand anchors. Deep, trustworthy, and organic.
- **Secondary (`#10B981` - Mint Emerald):** Used for micro-interactions, active toggle states, positive status confirmations, and media wave progress highlights.
- **Tertiary (`#F59E0B` - Warm Amber):** Evokes acoustic warmth and morning sunlight. Reserved for audio playback heads, live broadcasting tags, VIP privileges, and attention-worthy community notices. Accompanied by Coral Spark (`#FF7849`) for urgent broadcasts or energetic community interactions.
- **Canvas & Backgrounds:**
  - `Surface Base`: `#F8FAF8` (Warm Ivory Mist)
  - `Surface Subdued`: `#F1F5F2` (Soft Rice Grey)
  - `Surface Glass`: `rgba(255, 255, 255, 0.82)` with backdrop blur filter
- **Neutral Typographic Stack:**
  - `Text Primary`: `#14241D` (Deep Forest Charcoal - softer than absolute black)
  - `Text Secondary`: `#4F6359` (Moss Slate)
  - `Text Tertiary / Placeholder`: `#8C9E94` (Pale Willow)
  - `Border / Hairline`: `rgba(14, 128, 88, 0.08)`

## Typography

The type hierarchy prioritizes high legibility on high-density mobile screens (OLED/Retina) while maintaining optical softness.

### Font Family Strategy
- **Latin & Numerals:** `Plus Jakarta Sans` delivers geometric modernity with friendly, wide apertures and clean tabular figures for building/room numbers, timestamps, and audio counters.
- **CJK Fallback:** Inherits `-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei"` for native, crisp Chinese character rendering across iOS and Android WeChat containers.

### Typographic Principles
- Headings maintain strict structural tracking to emphasize editorial quality.
- Body copy is set at generous line-height ratios (`1.55` - `1.6`) to prevent visual strain in announcement blocks and long community articles.
- Small indicators, audio elapsed times, and verification badges use elevated medium weights to retain sharpness on frosted surfaces.

## Layout & Spacing

Mini-program viewport constraints demand dynamic breathing room, edge isolation, and ergonomic tap targets.

### Screen Layout Principles
- **Global Inset:** A persistent horizontal screen margin of `16px` keeps components safely separated from physical hardware bezels and WeChat overlay menus.
- **Card-centric Rhythm:** Information is chunked into discrete floating panels. Adjacent cards maintain a vertical pitch of `12px` to `16px`.
- **Safe Area Insets:** All fixed bottom bars (audio control docks, persistent action trays) strictly integrate `env(safe-area-inset-bottom) + 12px` to prevent collisions with iOS home indicators.
- **Service Portal Grid (金刚区):** A 4-column fluid arrangement with `8px` internal gap and `12px` vertical flow, optimized for comfortable single-hand thumb zones.

## Elevation & Depth

Visual hierarchy uses warm, tinted ambient light instead of harsh charcoal drops. Shadows reflect the emerald canvas below, preventing dirty edges on pale backgrounds.

### Elevation Levels
- **Level 0 (Flat Canvas):** `#F8FAF8` with no shadow. Used for base view background.
- **Level 1 (Card & Module Resting):**
  - Background: `#FFFFFF`
  - Shadow: `0 4px 16px -2px rgba(14, 128, 88, 0.05), 0 2px 6px -1px rgba(20, 36, 29, 0.03)`
  - Border: `1px solid rgba(14, 128, 88, 0.06)`
- **Level 2 (Active Capsules & Media Players):**
  - Background: `rgba(255, 255, 255, 0.88)` with `backdrop-filter: blur(16px)`
  - Shadow: `0 8px 24px -4px rgba(14, 128, 88, 0.10), 0 3px 8px -2px rgba(245, 158, 11, 0.06)`
  - Border: `1px solid rgba(255, 255, 255, 0.60)` inside edge
- **Level 3 (Floating Modal / Sticky Audio Dock):**
  - Background: `rgba(255, 255, 255, 0.94)` with `backdrop-filter: blur(24px)`
  - Shadow: `0 16px 36px -6px rgba(14, 128, 88, 0.14), 0 6px 12px -2px rgba(0, 0, 0, 0.04)`
  - Border: `1px solid rgba(255, 255, 255, 0.85)`

## Shapes

The interface embraces organic, generous geometry mirroring smooth river jade and polished stone.

- **Standard Cards & Containers:** Radii strictly adhere to `16px` (`rounded-lg`) or `20px` (`rounded-xl`), imparting a tactile, approachable quality.
- **Action Buttons & Badges:** Use pure pill shapes (`border-radius: 9999px`) to distinguish actionable objects from descriptive content cards.
- **Visual Smoothness:** Outer containers use `20px` while child image masks or nested media thumbnails step down to `12px` or `14px` to maintain concentric visual harmony.

## Components

### 1. Buttons
- **Primary Button:** Pill-shaped, gradient-infused surface (`linear-gradient(135deg, #10B981 0%, #0E8058 100%)`). Text is stark white, bold, with a soft top inner-highlight line (`inset 0 1px 0 rgba(255,255,255,0.3)`).
- **Secondary Button:** Translucent ivory pill (`rgba(14, 128, 88, 0.08)`), text in `#0E8058`, zero shadow, borderless.
- **Tactile Pressed States:** Subtle scale transform (`scale(0.97)`) with opacity dip to `0.92`.

### 2. Acoustic Capsule Player (声边音频胶囊)
- **Container:** Floating horizontal pill (`height: 48px`), frosted glass body (`rgba(255,255,255,0.85)`), hairline emerald border.
- **Visual Waveform:** Animated, organic vertical bars (varying heights 4px to 22px, width 2.5px, radius 2px). Inactive bars colored `#D4DFD8`; active played bars glow with Amber-Gold (`#F59E0B`).
- **Play/Pause Trigger:** Round emerald button with high-contrast white audio play/pause glyphs and micro-press depth.

### 3. Converged Media Cards (融媒体内容卡片)
- **Official Editorial Card (公众号图文卡片):**
  - Radius: `18px`, pure white card base.
  - Image header: `16:9` ratio, with smooth nested radius (`14px`), subtle bottom vignette overlay for title contrast.
  - Footer meta: Author avatar (`20px` circle), reading duration, and audio narration attachment badge.
- **Community Radio Bar (社区电台微播放条):**
  - Attached beneath urgent announcements or community bulletins.
  - Features speaker tag, duration badge, live waveform equalizer graphic, and an instant tap-to-listen trigger.

### 4. Service Portal Icons (金刚区微质感微渐变卡片)
- Each tile features a softly rounded square (`56x56px`, `16px` radius) backdropped by an ultra-soft dual tint (e.g., `#E8F6F0` to `#F4FAF7`).
- Icons render in deep emerald line art with subtle warm amber micro-accents.
- High-level labels sit directly below in `#14241D` (`13px`, medium weight).

### 5. Status Badges & Chips
- **Live / Broadcast:** Pill container with pulsing amber dot, background `rgba(245, 158, 11, 0.12)`, text `#B45309`.
- **Property Notice / Normal:** Background `rgba(14, 128, 88, 0.10)`, text `#0E8058`.
- **Emergency Alert:** Background `rgba(255, 120, 73, 0.12)`, text `#C2410C`.

### 6. Inputs & Search Elements
- Input bars rest inside `44px` high rounded pills with `#F1F5F2` fills. Focus triggers an animated border glow of `1.5px solid #0E8058` alongside subtle elevation lift.