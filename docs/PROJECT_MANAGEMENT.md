# Project Management Workflow

DesignFlow uses a local-first architecture (via Dexie.js and IndexedDB) to manage your projects seamlessly without requiring a persistent internet connection.

## Project Lifecycle

1. **Creation**: Projects are created via the `/projects` dashboard using the `CreateProjectModal`. When created, the project is written directly to the `projects` table in IndexedDB. A success animation confirms creation.
2. **Details View**: Accessing a project via `/projects/:id` opens the detail view, which subscribes to the database using `useLiveQuery`. This ensures the UI is always completely synchronized with local data changes.
3. **Status Management**: Projects can be toggled between `active`, `completed`, and `archived` states directly from the dropdown header in the detail view.
4. **Metadata Editing**: Titles and descriptions can be edited via the `EditProjectModal`, built with `react-hook-form` and `zod` for robust validation.
5. **Tags**: The `TagsInput` component allows for comma-separated categorization, immediately syncing changes back to IndexedDB.
6. **Deletion & Cascading Deletes**: When a project is deleted, DesignFlow automatically performs a cascading delete via `db.tasks.bulkDelete()` to remove all orphaned tasks associated with the project ID before removing the project itself.

## Kanban Integration (Upcoming)
Projects serve as the top-level container for tasks, design briefs, and moodboards. Tasks created within a project are displayed on the project-specific Kanban board and linked via `projectId`.

## State Management
- **Local Data**: Dexie (`db.ts`)
- **Global UI State**: Zustand (`useAppStore.ts` for theme, sidebar toggles)
- **Form State**: react-hook-form + zod
- **Notifications**: Sonner (Toast notifications)

