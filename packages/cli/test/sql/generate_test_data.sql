insert into `users` (
	`address`,
	`team_id`,
	`sealed`
) values (
	'0xBcd4042DE499D14e55001CcbB24a551F3b954096',
	'a3cd7fac-4528-4765-9ae1-304460555429',
	'Fe26.2*1*730d3a5c800757f03e3a503e606cda108c557a410511aeb34c074434f96564ba*N1HpYtaonMQfFeotwe8JFQ*-PZAZv2WtrRDOM1l2VNvQixsN7DPsSS3Ypv7vlrTa0c**0df8f54d61958542316ada84c7ffb145790c0705f787df629083c44362d2f173*cjYKzkzmtHvL6Z2lqLz_o0tKSLK4cXB7XV8tm2MAW-U~2'
);
--> statement-breakpoint
insert into `teams` (
	`id`,
	`name`,
	`slug`,
	`personal`
) values (
	'a3cd7fac-4528-4765-9ae1-304460555429',
	'testuser',
	'testuser',
	1
);
--> statement-breakpoint
insert into `team_memberships` (
	`member_team_id`,
	`team_id`,
	`is_owner`,
	`joined_at`
) values (
	'a3cd7fac-4528-4765-9ae1-304460555429',
	'a3cd7fac-4528-4765-9ae1-304460555429',
	1,
	'2023-10-16T07:14:06.661Z'
);
--> statement-breakpoint
insert into `projects` (
	`id`,
	`name`,
	`slug`,
	`description`
) values (
	'2f403473-de7b-41ba-8d97-12a0344aeccb',
	'test_project',
	'test_project',
	'project for automated testing'
);
--> statement-breakpoint
insert into `team_projects` (
	`team_id`,
	`project_id`,
	`is_owner`
) values (
	'a3cd7fac-4528-4765-9ae1-304460555429',
	'2f403473-de7b-41ba-8d97-12a0344aeccb',
	1
);
--> statement-breakpoint
insert into `environments` (
	`id`,
	`project_id`,
	`name`,
	`slug`
) values (
	'c862f12c-f2f8-451a-bae3-bbf633e3ae57',
	'2f403473-de7b-41ba-8d97-12a0344aeccb',
	'default',
	'default'
);
--> statement-breakpoint
insert into `project_tables` (
	`project_id`,
	`table_id`
) values (
	'2f403473-de7b-41ba-8d97-12a0344aeccb',
	'48cbba6f-ff44-4461-a926-9ae5a1ce73f9'
);
--> statement-breakpoint
insert into `tables` (
	`id`,
	`slug`,
	`name`,
	`description`,
	`schema`
) values (
	'48cbba6f-ff44-4461-a926-9ae5a1ce73f9',
	'table1',
	'table1',
	'first test table',
	'{"columns":[{"name":"id","type":"integer","constraints":["primary key"]},{"name":"info","type":"text"}]}'
);
