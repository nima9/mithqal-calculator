CREATE TABLE `currencies` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`symbol` text NOT NULL,
	`rate_to_usd` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `metals` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`price_usd` real NOT NULL,
	`last_updated` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rate_fetch_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`fetched_at` integer NOT NULL,
	`metals_source` text NOT NULL,
	`currency_source` text NOT NULL,
	`success` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `right_of_god_quotes` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`author` text NOT NULL,
	`source` text NOT NULL,
	`text` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `currencies_code_unique` ON `currencies` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `metals_name_unique` ON `metals` (`name`);--> statement-breakpoint
CREATE INDEX `rate_fetch_log_fetched_at_idx` ON `rate_fetch_log` (`fetched_at`);