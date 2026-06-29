-- Migration 0009: 1-to-1 video-call invites (ringing signal). Additive only.

--> statement-breakpoint
CREATE TABLE `CallInvite` (
	`id` text PRIMARY KEY NOT NULL,
	`roomId` text NOT NULL,
	`fromUserId` text NOT NULL,
	`fromName` text NOT NULL,
	`toUserId` text NOT NULL,
	`status` text DEFAULT 'ringing' NOT NULL,
	`createdAt` integer NOT NULL,
	`expiresAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `CallInvite_to_status_idx` ON `CallInvite` (`toUserId`,`status`);
--> statement-breakpoint
CREATE INDEX `CallInvite_room_idx` ON `CallInvite` (`roomId`);
