PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_impression` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`work_no` integer NOT NULL,
	`hash` text NOT NULL,
	`name` text DEFAULT '',
	`country` text,
	`point` integer DEFAULT 100 NOT NULL,
	`is_vote` integer DEFAULT 0 NOT NULL,
	`comment` text DEFAULT '',
	`posted_at` integer,
	`fetched_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_impression`("id", "work_no", "hash", "name", "country", "point", "is_vote", "comment", "posted_at", "fetched_at") SELECT "id", "work_no", "hash", "name", "country", "point", "is_vote", "comment", "posted_at", "fetched_at" FROM `impression`;--> statement-breakpoint
DROP TABLE `impression`;--> statement-breakpoint
ALTER TABLE `__new_impression` RENAME TO `impression`;--> statement-breakpoint
PRAGMA foreign_keys=ON;