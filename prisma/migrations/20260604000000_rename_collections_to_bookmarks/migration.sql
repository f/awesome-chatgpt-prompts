-- Rename collections table to bookmarks
-- Prerequisite for Phase 1: frees "collections" table name for the new Collection model
ALTER TABLE "collections" RENAME TO "bookmarks";
