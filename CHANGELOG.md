# Changelog

All notable changes to the **DesignFlow** creative direction platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-06

### 🎉 General Availability Launch

DesignFlow v1.0.0 is officially released! Built specifically for graphic designers, branding specialists, and creative agencies, DesignFlow provides a frictionless, local-first creative workspace without login walls, subscriptions, or cloud latency.

---

### ✨ Features & Capabilities

#### 🎨 Brand Identity Studio
- **Typography Engine:** Dual-font pairing system with live Google Fonts dynamic stylesheet loading and zero layout shift.
- **Color Palette Harmonies:** Image-based palette extraction from reference photography.
- **WCAG 2.1 AA/AAA Contrast Auditing:** Real-time luminance contrast score calculation for foreground and background color combinations.
- **Mission & Vision Form:** Structured capture for company core values, brand voice, and personality attributes.
- **One-Click Brand Deck PDF Export:** Compiles complete identity guidelines into client-ready presentation decks.

#### 🧠 Infinite Brainstorm Canvas
- **Focal-Point Zoom & Pan:** Smooth coordinate transform math with mouse wheel focal anchoring (documented in [Canvas Mathematical Architecture](docs/CANVAS_MATH.md)).
- **Custom Idea Nodes:** Color-coded cards (Indigo, Emerald, Rose, Amber, Cyan, Violet) with title and description editing.
- **Dynamic SVG Connectors:** Responsive cubic Bézier connection paths that adapt continuously to node drags.
- **Workspace Navigation:** Toggle between Select and Pan tools, multi-level dot grid rendering, and instant "Reset View" coordinate recentering.

#### 📋 Client Deliverables Kanban Board
- **Agile Status Columns:** Manage deliverables across To Do, In Progress, and Done.
- **Milestone Timeline View:** Chronological milestone groupings categorized into Overdue, Today, Upcoming This Week, and Completed deliverables.
- **Priority & Due Date Presets:** One-click quick presets (`Today`, `Tomorrow`, `Next Week`, `Next Month`) and visual priority badges.
- **Keyboard Shortcuts:** Press `N` for new task modal, `?` for shortcuts overlay, and `Escape` to clear search filters.

#### 📝 Rich-Text & Markdown Notes (TipTap)
- **WYSIWYG & Markdown Shortcuts:** Native header hierarchies, bullet lists, blockquotes, and formatting shortcuts.
- **Debounced Auto-Save:** Background persistence syncing changes to IndexedDB with 500ms debouncing and visual saved state indicator.
- **Note Templates:** Pre-built templates for Brand Discovery, Design Critiques, Client Feedback, and Meeting Notes.
- **Organization:** Pinned notes, project categorization, and instant full-text search.

#### 🖼️ Visual Inspiration Moodboards
- **Masonry Layout:** Responsive image card layout with drag-and-drop reordering.
- **Asset Management:** Client-side binary blob storage in IndexedDB with automated `URL.revokeObjectURL` cleanup preventing memory leaks.
- **Scale Adjustments:** Customizable card scale multipliers (1x, 1.5x, 2x) for hero reference items.

#### 📋 Design Brief Discovery Wizard
- **4-Step Client Intake:** Structured wizard capturing project scope, target demographics, aesthetic tone, and deliverables.
- **Draft Autosaving:** In-progress wizard state saved to IndexedDB allowing users to resume draft briefs anytime.

#### 🚀 Onboarding Walkthrough & Celebratory Confetti
- **4-Step Guided Tour:** Interactive introduction highlighting Local-First architecture, Brand Kits, Brainstorm Canvas, and Deliverables.
- **Celebratory Confetti:** Multi-stage dual-cannon confetti bursts (`canvas-confetti`) with DesignFlow brand palette colors upon walkthrough completion.
- **On-Demand Tour:** Reopen the tour anytime from the Sidebar or Command Palette (`G T`).

#### 🔒 Privacy & GDPR Article 20 Data Portability
- **Local-First Architecture:** 100% of workspace data resides in the user's browser via IndexedDB (Dexie.js). Zero analytics, zero cookies, zero telemetry.
- **Export All Data:** One-click download of all user entities as structured, machine-readable JSON.
- **Complete ZIP Archive:** Packages all projects, notes, tasks, canvas items, and raw binary media assets into a portable `.zip` bundle.

#### ⌨️ Power-User Command Palette
- **Global Shortcut (`Cmd+K` / `Ctrl+K`):** Fast launcher with live entity search across projects, notes, canvas nodes, and administrative actions.
- **Action Shortcuts:** `G E` for GDPR Export, `G T` for Onboarding Tour, `T T` for Theme Switch, and `?` for Keyboard Shortcuts.

---

### ⚡ Performance & Optimization
- **Route Code Splitting:** Code-split route bundles via `React.lazy` and `Suspense`, reducing the initial production bundle footprint from **1,694 kB** to **397 kB** (76% reduction).
- **Icon Chunk Consolidation:** Consolidated Lucide icon imports via Vite `manualChunks` into dedicated static chunks.
- **Responsive Image Pipeline:** Lazy image decoding (`decoding="async"`, `loading="lazy"`) and optimized asset preview fallbacks.
- **Storage Resilience:** `safeLocalStorage` abstraction gracefully handling Safari private browsing restrictions and corrupted JSON payloads.

---

### ♿ Accessibility (WCAG 2.1 AA Compliance)
- **High Contrast Palettes:** Strict WCAG AA contrast compliance across all text and UI elements in both light and dark themes.
- **Modal Focus Trapping:** Accessible focus trap hook (`useFocusTrap`) with `role="dialog"`, `aria-modal="true"`, and `Escape` dismiss across all modals.
- **Keyboard Navigation:** Full tab order and keyboard operability across the navigation sidebar, task boards, modals, and canvas controls.

---

### 🧪 Test Coverage & Quality Assurance
- **56 Test Suites Passing:** 276 automated unit, component, Storybook, and integration tests with 100% green pass rate.
- **E2E Lifecycle Verification:** Comprehensive manual regression test matrix documented in [`E2E_REGRESSION_TEST_REPORT.md`](docs/E2E_REGRESSION_TEST_REPORT.md).
- **Type-Check & Hygiene:** Clean TypeScript compilation with `tsc -b` and zero oxlint linter errors.
