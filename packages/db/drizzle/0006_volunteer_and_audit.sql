-- Migration 0006: volunteer dentist extended fields + audit hash chain
-- Additive only. No DROP or destructive statements.

--> statement-breakpoint
ALTER TABLE `VolunteerDentist` ADD `specialty` text;
--> statement-breakpoint
ALTER TABLE `VolunteerDentist` ADD `avatarUrl` text;
--> statement-breakpoint
ALTER TABLE `VolunteerDentist` ADD `lat` real;
--> statement-breakpoint
ALTER TABLE `VolunteerDentist` ADD `lng` real;
--> statement-breakpoint
ALTER TABLE `AuditLog` ADD `hash` text;
