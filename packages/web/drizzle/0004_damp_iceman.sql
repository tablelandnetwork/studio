CREATE TABLE `deployments` (
	`table_id` text NOT NULL,
	`environment_id` text NOT NULL,
	`table_name` text NOT NULL,
	`chain_id` integer NOT NULL,
	`token_id` text NOT NULL,
	`block_number` integer,
	`txn_hash` text,
	`created_at` text NOT NULL,
	PRIMARY KEY(`environment_id`, `table_id`)
);
