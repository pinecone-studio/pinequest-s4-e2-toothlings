-- Migration 0010: dentist-managed blocked time slots (self availability). Additive only.

--> statement-breakpoint
CREATE TABLE `DentistBlock` (
	`id` text PRIMARY KEY NOT NULL,
	`dentistId` text NOT NULL,
	`blockedAt` integer NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `DentistBlock_dentist_at_key` ON `DentistBlock` (`dentistId`,`blockedAt`);
