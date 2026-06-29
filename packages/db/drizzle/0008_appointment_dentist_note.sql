-- Migration 0008: dentist's post-call advice note on an appointment.
-- Additive only. No DROP or destructive statements.

--> statement-breakpoint
ALTER TABLE `Appointment` ADD `dentistNote` text;
