# DesignFlow Architecture

## ?? Local-First Approach
DesignFlow operates on a **Local-First** architecture. This means the application prioritizes local storage over remote database synchronization.

### Why Local-First?
1. **Zero Friction:** Users can instantly start using the app without signing up.
2. **Speed:** Data is queried directly from the local device (0ms latency).
3. **Privacy:** User data never leaves their browser.

### Data Storage Strategy
We use **IndexedDB** (via [Dexie.js](https://dexie.org/)) as the primary database.

- **Storage Structure:** All projects, design briefs, moodboard configurations, and brand identities are stored in structured object stores within IndexedDB.
- **Images & Blobs:** Asset uploads (like logos or inspiration images) are stored as Blobs in IndexedDB. We generate transient `URL.createObjectURL()` references when displaying them in the UI.

### Export & Portability
Since data lives locally, we provide robust tools for users to:
- Export data as JSON backups.
- Import data from previous backups.
- Export visual artifacts as PDFs.

## ?? UI/UX Layer
- **Component System:** Custom-built React components using Tailwind CSS for styling.
- **State Management:** React Context for global UI state (like theme) and local component state for forms. 
- **Forms:** React Hook Form coupled with Zod for robust validation.

