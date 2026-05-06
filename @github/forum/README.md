# ForumSpace website module

This folder contains the imported forum website code and starter database design.

## Files

- `forum-home.tsx` — the Next.js forum homepage UI.
- `database.ts` — typed seed data used by the forum UI while the backend is being connected.
- `schema.sql` — PostgreSQL schema for users, categories, threads, posts, reactions, reports, and notifications.

## Next implementation steps

1. Replace the typed seed data with real database queries.
2. Add authentication for registration, login, password reset, and email verification.
3. Wire the create-thread form to a server action/API route.
4. Add category and thread detail routes.
5. Add moderation actions for reports, locks, pins, deletions, and bans.
