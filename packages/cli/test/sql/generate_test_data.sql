insert into `users` (
	`address`,
	`team_id`,
	`sealed`
) values (
	'0xBcd4042DE499D14e55001CcbB24a551F3b954096',
	'01a2d24d-3805-4a14-8059-7041f8b69afc',
	'Fe26.2*1*652c1023d0e4736ba7d42cacd6f867002a07d579cfc0d1e5b3f3bcd3108b2457*rjXc8VRyZqilT1AYgYys6w*ikJ3YfSspKPJqNcT5usduXzPmSHkc6cbLAJDUTWxUEU**9c10a3c433337ae33803cfd6b95f3de6d57653f947ae5d930073ee0d9fe91302*ckZjgCJ2n-dLDj_-S_hxnAMbjwBsvMDu0OnQqoOsOVY~2'
);
--> statement-breakpoint
insert into `teams` (
	`id`,
	`name`,
	`slug`,
	`personal`
) values (
	'01a2d24d-3805-4a14-8059-7041f8b69afc',
	'joe',
	'joe',
	1
);
--> statement-breakpoint
insert into `team_memberships` (
	`member_team_id`,
	`team_id`,
	`is_owner`,
	`joined_at`
) values (
	'01a2d24d-3805-4a14-8059-7041f8b69afc',
	'01a2d24d-3805-4a14-8059-7041f8b69afc',
	1,
	'2023-09-18T20:43:04.923Z'
);