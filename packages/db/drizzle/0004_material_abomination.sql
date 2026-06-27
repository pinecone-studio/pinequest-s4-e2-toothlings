CREATE INDEX `User_phone_idx` ON `User` (`phone`);--> statement-breakpoint
CREATE INDEX `Child_schoolId_idx` ON `Child` (`schoolId`);--> statement-breakpoint
CREATE INDEX `SchoolClass_schoolId_idx` ON `SchoolClass` (`schoolId`);--> statement-breakpoint
CREATE INDEX `ScreeningImage_screeningId_idx` ON `ScreeningImage` (`screeningId`);--> statement-breakpoint
CREATE INDEX `ToothFinding_screeningId_idx` ON `ToothFinding` (`screeningId`);