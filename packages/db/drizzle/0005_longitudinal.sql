-- Migration 0005: longitudinal multi-season support
-- Additive only. No DROP or ALTER ... DROP COLUMN.
-- Rollback: drop FollowUpEvent, FollowUpEpisode, Season and the two new Screening indexes.

--> statement-breakpoint
CREATE TABLE `Season` (
  `id` text NOT NULL,
  `schoolId` text NOT NULL,
  `label` text,
  `openedAt` integer NOT NULL,
  `closedAt` integer,
  `closedById` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Season_school_id_uniq` ON `Season` (`schoolId`, `id`);
--> statement-breakpoint
CREATE INDEX `Season_schoolId_idx` ON `Season` (`schoolId`);

--> statement-breakpoint
CREATE TABLE `FollowUpEpisode` (
  `id` text PRIMARY KEY NOT NULL,
  `childKey` text NOT NULL,
  `schoolId` text NOT NULL,
  `triggerSeasonId` text NOT NULL,
  `triggerScreeningId` text NOT NULL,
  `triggerLevel` text NOT NULL,
  `triggerScore` real NOT NULL DEFAULT 0,
  `status` text NOT NULL DEFAULT 'flagged',
  `assignedToId` text,
  `appointmentAt` integer,
  `notifiedAt` integer,
  `notificationChannel` text,
  `notes` text,
  `closedAt` integer,
  `closedReason` text,
  `escalationFlag` integer NOT NULL DEFAULT 0,
  `previousEpisodeId` text,
  `updatedAt` integer NOT NULL,
  `updatedById` text NOT NULL,
  `version` integer NOT NULL DEFAULT 0
);
--> statement-breakpoint
CREATE UNIQUE INDEX `FollowUpEpisode_child_season_key` ON `FollowUpEpisode` (`childKey`, `triggerSeasonId`);
--> statement-breakpoint
CREATE INDEX `FollowUpEpisode_school_status_idx` ON `FollowUpEpisode` (`schoolId`, `status`);
--> statement-breakpoint
CREATE INDEX `FollowUpEpisode_childKey_idx` ON `FollowUpEpisode` (`childKey`);
--> statement-breakpoint
CREATE INDEX `FollowUpEpisode_open_idx` ON `FollowUpEpisode` (`schoolId`, `closedAt`);

--> statement-breakpoint
CREATE TABLE `FollowUpEvent` (
  `id` text PRIMARY KEY NOT NULL,
  `episodeId` text NOT NULL,
  `childKey` text NOT NULL,
  `seasonId` text NOT NULL,
  `fromStatus` text,
  `toStatus` text NOT NULL,
  `actorId` text NOT NULL,
  `actorRole` text NOT NULL,
  `channel` text,
  `note` text,
  `occurredAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `FollowUpEvent_episodeId_idx` ON `FollowUpEvent` (`episodeId`);
--> statement-breakpoint
CREATE INDEX `FollowUpEvent_childKey_idx` ON `FollowUpEvent` (`childKey`);

--> statement-breakpoint
CREATE INDEX `Screening_childKey_capturedAt_idx` ON `Screening` (`childKey`, `capturedAt`);
--> statement-breakpoint
CREATE INDEX `Screening_childKey_season_capturedAt_idx` ON `Screening` (`childKey`, `seasonId`, `capturedAt`);
