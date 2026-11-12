# DesignFlow v1.1 Roadmap & Feature Proposals

Following the successful **v1.0.0 General Availability** launch of DesignFlow, this document outlines the feature roadmap, technical architecture investigations, and community RFC proposals planned for the upcoming **v1.1.0** release cycle.

---

## 🎯 Strategic Themes for v1.1

DesignFlow will stay committed to its foundational ethos:
1. **Local-First & Zero-Tracking**: User data remains private and owned 100% by the designer.
2. **Instant-On Performance**: Zero login walls, zero subscription friction, sub-millisecond persistence.
3. **Agency-Grade Design Deliverables**: Professional tools that produce client-ready assets.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DesignFlow v1.1 Pillars                         │
├───────────────────┬───────────────────┬────────────────────────────────┤
│  P2P Multiplayer  │   Vector Tools    │  Client Presentation View      │
│  • WebRTC Data    │  • Bézier Pens    │  • Fullscreen Slide Deck       │
│  • Yjs / CRDTs    │  • Shape Prims    │  • Interactive Swatch Pickers  │
├───────────────────┼───────────────────┼────────────────────────────────┤
│  Token Ecosystem  │   Encrypted Sync  │  AI Design Assistant (Opt-in)  │
│  • Figma Tokens   │  • WebDAV Vaults  │  • Local LLMs (WebLLM/ONNX)    │
│  • Tailwind V4    │  • P2P Swarms     │  • Smart Palette Generation    │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

---

## 🚀 Pillar 1: Peer-to-Peer Real-Time Collaboration (CRDTs)

### Problem Statement
Currently, multi-designer studios must manually share workspace JSON exports or work sequentially. Designers want real-time co-ideation without submitting to centralized cloud surveillance.

### Technical Proposal: WebRTC + Yjs
- **Zero-Server Signaling**: Establish peer-to-peer WebRTC data channels using short-lived public signaling relays or QR codes/copyable session tokens.
- **Conflict-Free Replicated Data Types (CRDTs)**:
  - Integrate `yjs` with `y-indexeddb` to allow automatic local-first reconciliation.
  - Multi-cursor presence on the Brainstorm Canvas showing real-time peer movements.
  - Granular conflict resolution for Kanban deliverables and shared project notes.

---

## ✏️ Pillar 2: Vector Pen & Freehand Ideation on Canvas

### Capabilities
- **Freehand Pen & Marker**: Pressure-sensitive stroke smoothing using Catmull-Rom or cubic spline algorithms.
- **Vector Primitive Shapes**: Rectangles, ellipses, arrows, callout bubbles, and diamond decision nodes.
- **Direct SVG Export**: Export canvas sections or individual artboards directly to clean, editable `.svg` files for importation into Figma, Illustrator, or Inkscape.

---

## 🖥️ Pillar 3: Client Presentation Deck View

### Capabilities
- **Presentation Mode**: Press `P` or click "Present" to enter an immersive fullscreen slide presentation of the Brand Guidelines.
- **Presenter View**: Split view providing private notes, timing counters, and upcoming slide previews.
- **Interactive Demonstrations**: Embedded live typography scales, clickable WCAG AA contrast testers, and interactive color palettes for client review meetings.

---

## 🎨 Pillar 4: Design Token Ecosystem & Export Pipeline

### Capabilities
- **Figma Tokens / Tokens Studio Compatibility**: Export brand colors, typography pairings, and spacing scales to the W3C Design Tokens Community Group specification.
- **Tailwind CSS v4 Presets**: One-click download of `theme.extend` variables ready to paste directly into `tailwind.config.js` or modern CSS variables (`@theme`).
- **Adobe Swatch Exchange (`.ase`)**: Generate binary ASE palette files loadable into Adobe Illustrator, Photoshop, and InDesign.

---

## 🔒 Pillar 5: Zero-Knowledge Private Vault Backup

### Capabilities
- **Client-Side AES-256-GCM Encryption**: Encrypt workspace snapshots using a user-held passphrase before any external transmission.
- **Self-Hosted Storage Adapters**: Optional automated backups to personal storage targets:
  - WebDAV (Nextcloud, OwnCloud).
  - Local File System Access API (auto-sync to a designated desktop folder).

---

## 💬 Community Discussion RFC Process

We invite all community members, designers, and engineers to collaborate on RFCs (Requests for Comment) in [GitHub Discussions](https://github.com/Mariyamalikho/Design-Flow-/discussions).

### RFC Submission Template
```markdown
## Title: [Feature Proposal Name]

### Summary
Brief 1-2 paragraph description of the proposed capability.

### Motivation & Use Cases
Who needs this feature? What friction does it eliminate for creative agencies?

### Proposed Technical Design
- Client-side data model impact (Dexie IndexedDB schema versioning)
- UI/UX component tree
- Accessibility considerations (WCAG 2.1 AA)
- Performance & bundle size implications

### Alternatives Considered
What other approaches or existing libraries were evaluated?
```

---

## 📅 Target Milestones
| Milestone | Focus | Target |
| :--- | :--- | :--- |
| **v1.0.x** | Minor bug fixes, mobile refinements, community issue responses | Nov 2026 |
| **v1.1.0-alpha** | Vector Pen tool and Presentation Deck mode | Dec 2026 |
| **v1.1.0-beta** | Design Token exports (Figma, Tailwind, ASE) | Jan 2027 |
| **v1.1.0-GA** | P2P WebRTC real-time multiplayer co-editing | Feb 2027 |
