CREATE TABLE `notification_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`alertId` int,
	`channel` enum('push','email') NOT NULL DEFAULT 'push',
	`title` varchar(256) NOT NULL,
	`message` text,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`delivered` boolean DEFAULT false,
	CONSTRAINT `notification_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailEnabled` boolean NOT NULL DEFAULT true,
	`minSeverity` enum('info','warning','critical') NOT NULL DEFAULT 'warning',
	`cooldownMinutes` int NOT NULL DEFAULT 15,
	`lastNotifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_userId_unique` UNIQUE(`userId`)
);
