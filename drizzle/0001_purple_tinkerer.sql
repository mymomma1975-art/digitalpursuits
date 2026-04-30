CREATE TABLE `accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`type` enum('asset','liability','equity','revenue','expense') NOT NULL,
	`subtype` varchar(128),
	`balance` decimal(14,2) DEFAULT '0.00',
	`currency` varchar(3) DEFAULT 'USD',
	`description` text,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_training_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`type` enum('file','url','text') NOT NULL,
	`name` varchar(256),
	`content` text,
	`fileUrl` varchar(512),
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`processedContent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_training_sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256),
	`context` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_memory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`key` varchar(256) NOT NULL,
	`value` text NOT NULL,
	`category` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_memory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('system','user','assistant') NOT NULL,
	`content` text NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analytics_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`entityType` enum('agent','website') NOT NULL,
	`entityId` int NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bank_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`plaidItemId` varchar(256),
	`plaidAccessToken` varchar(512),
	`institutionName` varchar(256),
	`institutionId` varchar(128),
	`accountName` varchar(256),
	`accountMask` varchar(8),
	`accountType` varchar(64),
	`currentBalance` decimal(14,2),
	`availableBalance` decimal(14,2),
	`currency` varchar(3) DEFAULT 'USD',
	`lastSynced` timestamp,
	`status` enum('active','disconnected','error') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bank_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `client_agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`description` text,
	`systemPrompt` text,
	`model` varchar(64) DEFAULT 'default',
	`status` enum('draft','active','paused','archived') NOT NULL DEFAULT 'draft',
	`trainingData` text,
	`webAccessEnabled` boolean DEFAULT true,
	`deploymentUrl` varchar(512),
	`clientName` varchar(256),
	`monthlyFee` decimal(10,2) DEFAULT '0.00',
	`totalInteractions` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_agents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `client_billing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientName` varchar(256) NOT NULL,
	`entityType` enum('agent','website') NOT NULL,
	`entityId` int NOT NULL,
	`monthlyAmount` decimal(10,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'USD',
	`status` enum('active','paused','cancelled') NOT NULL DEFAULT 'active',
	`lastBilledDate` timestamp,
	`nextBillingDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_billing_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `client_websites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`domain` varchar(256),
	`description` text,
	`status` enum('draft','published','paused') NOT NULL DEFAULT 'draft',
	`template` varchar(128),
	`pages` text,
	`chatbotEnabled` boolean DEFAULT false,
	`chatbotAgentId` int,
	`clientName` varchar(256),
	`monthlyFee` decimal(10,2) DEFAULT '0.00',
	`totalVisits` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_websites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`firstName` varchar(128) NOT NULL,
	`lastName` varchar(128),
	`email` varchar(320),
	`phone` varchar(32),
	`company` varchar(256),
	`title` varchar(256),
	`tags` text,
	`notes` text,
	`status` enum('active','inactive','lead','customer') NOT NULL DEFAULT 'lead',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contactId` int,
	`pipelineId` int NOT NULL,
	`stageId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`value` decimal(12,2) DEFAULT '0.00',
	`currency` varchar(3) DEFAULT 'USD',
	`status` enum('open','won','lost') NOT NULL DEFAULT 'open',
	`expectedCloseDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contactId` int,
	`invoiceNumber` varchar(64) NOT NULL,
	`status` enum('draft','sent','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`subtotal` decimal(12,2) DEFAULT '0.00',
	`tax` decimal(12,2) DEFAULT '0.00',
	`total` decimal(12,2) DEFAULT '0.00',
	`currency` varchar(3) DEFAULT 'USD',
	`dueDate` timestamp,
	`paidDate` timestamp,
	`notes` text,
	`items` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contactId` int,
	`invoiceId` int,
	`method` enum('ach','wire','rtp','credit_card','instant') NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'USD',
	`status` enum('initiated','pending','processing','settled','failed','reversed') NOT NULL DEFAULT 'initiated',
	`transactionNumber` varchar(256),
	`trackingNumber` varchar(256),
	`modernTreasuryId` varchar(256),
	`cardLast4` varchar(4),
	`cardBrand` varchar(32),
	`description` text,
	`metadata` text,
	`settledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pipeline_stages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pipelineId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`order` int NOT NULL DEFAULT 0,
	`color` varchar(32) DEFAULT '#3b82f6',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pipeline_stages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pipelines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pipelines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`accountId` int,
	`invoiceId` int,
	`type` enum('income','expense','transfer','refund') NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'USD',
	`description` text,
	`category` varchar(128),
	`reference` varchar(256),
	`status` enum('pending','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`transactionDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
