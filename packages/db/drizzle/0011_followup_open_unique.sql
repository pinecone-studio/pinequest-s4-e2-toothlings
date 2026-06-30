-- Migration 0011: make per-child-per-season follow-up uniqueness apply ONLY to
-- OPEN episodes. The episode lifecycle closes an old episode and opens a new one
-- within the same season, so a full UNIQUE(childKey, triggerSeasonId) blocked the
-- second insert with a constraint violation. A partial index (closedAt IS NULL)
-- enforces the real invariant: at most one OPEN episode per child per season.
-- Closed episodes may now coexist for the same (childKey, triggerSeasonId).

--> statement-breakpoint
DROP INDEX `FollowUpEpisode_child_season_key`;--> statement-breakpoint
CREATE UNIQUE INDEX `FollowUpEpisode_child_season_open_key` ON `FollowUpEpisode` (`childKey`,`triggerSeasonId`) WHERE `closedAt` is null;
