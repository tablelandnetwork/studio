import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Team, TeamInvite, TeamMembership } from "@/db/schema";
import { cn } from "@/lib/utils";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import {
  Cake,
  InfoIcon,
  LucideProps,
  MailQuestion,
  Merge,
  UserPlus,
} from "lucide-react";

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en-US");

type Props = LucideProps & {
  team: Team;
  inviter?: Team;
  invite?: TeamInvite;
  membership: TeamMembership;
};

export default function Info({
  className,
  invite,
  inviter,
  membership,
  ...props
}: Props) {
  function content() {
    if (!invite) {
      return (
        <div className="flex items-center space-x-2">
          <Cake />
          <div>
            <p className="text-xs text-muted-foreground">Founded team</p>
            <p className="text-sm">
              {timeAgo.format(new Date(membership.joinedAt))}
            </p>
          </div>
        </div>
      );
    } else if (invite && inviter) {
      return (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <UserPlus />
            <div>
              <p className="text-xs text-muted-foreground">Invited by</p>
              <p className="text-sm">{inviter.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <MailQuestion />
            <div>
              <p className="text-xs text-muted-foreground">Invited at</p>
              <p className="text-sm">{invite.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Merge />
            <div>
              <p className="text-xs text-muted-foreground">Joined</p>
              <p className="text-sm">
                {timeAgo.format(new Date(membership.joinedAt))}
              </p>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <InfoIcon
          {...props}
          className={cn(className, "text-slate-200 hover:text-slate-300")}
        />
      </HoverCardTrigger>
      <HoverCardContent className="w-auto">{content()}</HoverCardContent>
    </HoverCard>
  );
}
