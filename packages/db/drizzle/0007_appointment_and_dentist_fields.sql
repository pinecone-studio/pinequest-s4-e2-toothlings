-- Migration 0007: volunteer dentist experience/licence fields + Appointment (video-call booking)
-- Additive only. No DROP or destructive statements.

--> statement-breakpoint
ALTER TABLE `VolunteerDentist` ADD `experienceYears` integer;
--> statement-breakpoint
ALTER TABLE `VolunteerDentist` ADD `licenseNo` text;
--> statement-breakpoint
CREATE TABLE `Appointment` (
	`id` text PRIMARY KEY NOT NULL,
	`dentistId` text NOT NULL,
	`childKey` text NOT NULL,
	`schoolId` text NOT NULL,
	`level` text NOT NULL,
	`scheduledAt` integer NOT NULL,
	`roomName` text NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`createdById` text NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `Appointment_dentist_idx` ON `Appointment` (`dentistId`);
--> statement-breakpoint
CREATE INDEX `Appointment_childKey_idx` ON `Appointment` (`childKey`);
