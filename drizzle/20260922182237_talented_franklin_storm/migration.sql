CREATE TABLE `active_currencies` (
	`code` text PRIMARY KEY,
	`name` text NOT NULL,
	`symbol` text NOT NULL,
	`kind` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `active_currencies_kind_idx` ON `active_currencies` (`kind`);