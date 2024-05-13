import {
  Cake,
  Hourglass,
  InfoIcon,
  type LucideProps,
  MailQuestion,
  Merge,
  UserPlus,
} from "lucide-react";
import { type schema } from "@tableland/studio-store";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { TimeSince } from "@/components/time";
import { cn } from "@/lib/utils";

type Props = LucideProps & {
  user?: schema.Team;
  userMembership?: schema.TeamMembership;
  team: schema.Team;
  inviter?: schema.Team;
  invite?: schema.TeamInvite;
  membership?: schema.TeamMembership;
};

export default function Info({
  className,
  user,
  userMembership,
  invite,
  inviter,
  membership,
  ...props
}: Props) {
  function content() {
    if (userMembership && membership && !invite) {
      return (
        <div className="flex items-center space-x-2">
          <Cake />
          <div>
            <p className="text-xs text-muted-foreground">Founded team</p>
            <p className="text-sm">
              <TimeSince time={membership.joinedAt} />
            </p>
          </div>
        </div>
      );
    } else if (membership && invite && inviter) {
      return (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <UserPlus />
            <div>
              <p className="text-xs text-muted-foreground">Invited by</p>
              <p className="text-sm">
                {inviter.name}
                {inviter.id === user?.id && " (You)"}
              </p>
            </div>
          </div>
          {userMembership && (
            <div className="flex items-center space-x-2">
              <MailQuestion />
              <div>
                <p className="text-xs text-muted-foreground">Invited at</p>
                <p className="text-sm">{invite.email}</p>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Merge />
            <div>
              <p className="text-xs text-muted-foreground">Joined</p>
              <p className="text-sm">
                <TimeSince time={membership.joinedAt} />
              </p>
            </div>
          </div>
        </div>
      );
    } else if (membership) {
      return (
        <div className="flex items-center space-x-2">
          <Merge />
          <div>
            <p className="text-xs text-muted-foreground">Joined</p>
            <p className="text-sm">
              <TimeSince time={membership.joinedAt} />
            </p>
          </div>
        </div>
      );
    } else if (inviter && invite) {
      return (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <UserPlus />
            <div>
              <p className="text-xs text-muted-foreground">Invited by</p>
              <p className="text-sm">
                {inviter.name}
                {inviter.id === user?.id && " (You)"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Hourglass />
            <div>
              <p className="text-xs text-muted-foreground">Invited</p>
              <p className="text-sm">
                <TimeSince time={invite.createdAt} />
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
          className={cn(
            className,
            "text-muted-foreground hover:text-accent-foreground",
          )}
        />
      </HoverCardTrigger>
      <HoverCardContent className="w-auto">{content()}</HoverCardContent>
    </HoverCard>
  );
}
