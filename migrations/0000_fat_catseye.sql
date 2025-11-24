CREATE TABLE `impression` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`work_id` integer,
	`hash` text NOT NULL,
	`name` text DEFAULT '',
	`country` text,
	`point` integer DEFAULT 100 NOT NULL,
	`is_vote` integer DEFAULT 0 NOT NULL,
	`comment` text DEFAULT '',
	`posted_at` integer,
	`fetched_at` integer,
	FOREIGN KEY (`work_id`) REFERENCES `work`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `member` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`avatar_url` text DEFAULT '',
	`is_leader` integer DEFAULT 0 NOT NULL,
	`is_concept` integer DEFAULT 1 NOT NULL,
	`is_final_striker` integer DEFAULT 0 NOT NULL,
	`ratio_point` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `member_role` (
	`member_id` integer,
	`role_id` integer,
	FOREIGN KEY (`member_id`) REFERENCES `member`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`role_id`) REFERENCES `role_master`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `role_master` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `work` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`register_no` integer NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`genre` text DEFAULT '' NOT NULL,
	`member_id` integer,
	`registered_at` integer NOT NULL,
	`stage_file_url` text DEFAULT '',
	`min_bpm` integer DEFAULT 0 NOT NULL,
	`max_bpm` integer DEFAULT 0 NOT NULL,
	`youtube_url` text DEFAULT '',
	`soundcloud_url` text DEFAULT '',
	`comment` text DEFAULT '',
	FOREIGN KEY (`member_id`) REFERENCES `member`(`id`) ON UPDATE no action ON DELETE no action
);
