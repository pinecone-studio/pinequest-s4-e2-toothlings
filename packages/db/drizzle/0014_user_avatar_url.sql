-- Migration 0014: profile photo for a user, stored as a base64 data URL.
-- Additive, nullable. Set via PATCH /api/auth/me; legacy rows keep avatarUrl NULL
-- (the app falls back to rendering the name initial).

ALTER TABLE `User` ADD COLUMN `avatarUrl` text;
