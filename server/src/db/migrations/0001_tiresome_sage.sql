ALTER TABLE `parties` ADD `party_time` text;--> statement-breakpoint
ALTER TABLE `parties` ADD `customer_name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `parties` ADD `child_name` text;--> statement-breakpoint
ALTER TABLE `parties` ADD `child_age` integer;--> statement-breakpoint
ALTER TABLE `parties` ADD `kids_count` integer;--> statement-breakpoint
ALTER TABLE `parties` ADD `adults_count` integer;--> statement-breakpoint
ALTER TABLE `parties` ADD `deposit_amount` real;--> statement-breakpoint
ALTER TABLE `parties` ADD `status` text DEFAULT 'booked' NOT NULL;--> statement-breakpoint
ALTER TABLE `parties` ADD `event_type` text;