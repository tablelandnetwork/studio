CREATE TABLE `deployments` (
	`id` text PRIMARY KEY NOT NULL,
	`table_id` text NOT NULL,
	`environment_id` text NOT NULL,
	`table_uu_name` text,
	`chain` integer NOT NULL,
	`created_at` text NOT NULL,
	`schema` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `environments` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL
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
	`description` text
);
--> statement-breakpoint
CREATE TABLE `tables` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`schema` text NOT NULL
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
	UNIQUE(`member_team_id`,`team_id`)
);
--> statement-breakpoint
CREATE TABLE `team_projects` (
	`team_id` text NOT NULL,
	`project_id` text NOT NULL,
	`is_owner` integer NOT NULL,
	UNIQUE(`team_id`,`project_id`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL UNIQUE,
	`slug` text NOT NULL UNIQUE,
	`personal` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`address` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL UNIQUE,
	`sealed` text NOT NULL
);