CREATE TABLE `system_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`entityType` enum('agent','website','billing','system') NOT NULL,
	`entityId` int,
	`severity` enum('info','warning','critical') NOT NULL DEFAULT 'info',
	`title` varchar(256) NOT NULL,
	`message` text,
	`isRead` boolean DEFAULT false,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `system_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_health_checks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`entityType` enum('agent','website') NOT NULL,
	`entityId` int NOT NULL,
	`status` enum('healthy','degraded','down') NOT NULL DEFAULT 'healthy',
	`responseTimeMs` int,
	`errorMessage` text,
	`checkedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `system_health_checks_id` PRIMARY KEY(`id`)
);
