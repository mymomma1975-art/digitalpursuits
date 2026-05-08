CREATE TABLE `copilot_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`topic` enum('agent_building','website_creation','analytics','troubleshooting','general') NOT NULL DEFAULT 'general',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `copilot_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `copilot_knowledge_base` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`category` enum('agent_building','website_creation','analytics','deployment','troubleshooting','api_reference','best_practices') NOT NULL,
	`content` text NOT NULL,
	`embedding` text,
	`sourceUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `copilot_knowledge_base_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `copilot_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`sourceUrls` text,
	`context` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `copilot_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `copilot_suggestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`entityType` enum('agent','website','analytics') NOT NULL,
	`entityId` int,
	`title` varchar(256) NOT NULL,
	`description` text NOT NULL,
	`suggestedAction` text,
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`isImplemented` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`implementedAt` timestamp,
	CONSTRAINT `copilot_suggestions_id` PRIMARY KEY(`id`)
);
