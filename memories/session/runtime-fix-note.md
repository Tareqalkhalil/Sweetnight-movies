If the Next.js dev server shows a runtime error with [object Event] or cached compilation issues, clear the .next cache and restart the dev server.

Steps:
1. Stop the dev server.
2. Remove the .next folder.
3. Run npm run dev again.

This project previously hit a transient Next.js cache issue after UI changes.
