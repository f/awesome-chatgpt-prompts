-- ROLLBACK: Rename bookmarks table back to collections
-- Run this migration to revert 20260604000000_rename_collections_to_bookmarks
ALTER TABLE "bookmarks" RENAME TO "collections";
