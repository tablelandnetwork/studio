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
--> statement-breakpoint
CREATE TABLE `environments` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`created_at` text,
	`updated_at` text,
	UNIQUE (`project_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `project_tables` (
	`project_id` text NOT NULL,
	`table_id` text NOT NULL,
	UNIQUE (`project_id`,`table_id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text NOT NULL,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `tables` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`schema` text NOT NULL,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `team_invites` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`sealed` text NOT NULL,
	`inviter_team_id` text NOT NULL,
	`created_at` text NOT NULL,
	`claimed_by_team_id` text,
	`claimed_at` text
);
--> statement-breakpoint
CREATE TABLE `team_memberships` (
	`member_team_id` text NOT NULL,
	`team_id` text NOT NULL,
	`is_owner` integer NOT NULL,
	`joined_at` text NOT NULL,
	UNIQUE (`member_team_id`,`team_id`)
);
--> statement-breakpoint
CREATE TABLE `team_projects` (
	`team_id` text NOT NULL,
	`project_id` text NOT NULL,
	`is_owner` integer NOT NULL,
	UNIQUE (`team_id`,`project_id`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text UNIQUE NOT NULL,
	`slug` text UNIQUE NOT NULL,
	`personal` integer NOT NULL,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `users` (
	`address` text PRIMARY KEY NOT NULL,
	`team_id` text UNIQUE NOT NULL,
	`sealed` text NOT NULL
);
