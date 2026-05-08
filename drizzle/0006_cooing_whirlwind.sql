CREATE TABLE `pricing_tiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(64) NOT NULL,
	`monthlyPrice` decimal(8,2) NOT NULL,
	`maxAgents` int NOT NULL,
	`maxWebsites` int NOT NULL,
	`maxUsers` int NOT NULL,
	`features` text,
	`stripePriceId` varchar(256),
	`isActive` boolean DEFAULT true,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pricing_tiers_id` PRIMARY KEY(`id`),
	CONSTRAINT `pricing_tiers_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `subscription_invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subscriptionId` int,
	`pricingTierId` int,
	`invoiceNumber` varchar(64) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'USD',
	`status` enum('draft','sent','paid','overdue','cancelled') DEFAULT 'draft',
	`billingPeriodStart` timestamp NOT NULL,
	`billingPeriodEnd` timestamp NOT NULL,
	`dueDate` timestamp,
	`paidDate` timestamp,
	`description` text,
	`lineItems` text,
	`pdfUrl` varchar(512),
	`generatedByAI` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscription_invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscription_invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
