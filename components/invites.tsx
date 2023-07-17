import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Team } from "@/db/schema";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { Invite } from "./invite";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en-US");

type Props = {
  invites: {
    inviter: {
      id: string;
      name: string;
      slug: string;
      personal: number;
    };
    invite: {
      email: string;
      id: string;
      teamId: string;
      inviterTeamId: string;
      createdAt: string;
      claimedByTeamId: string | null;
      claimedAt: string | null;
    };
    claimedBy: {
      id: string;
      name: string;
      slug: string;
      personal: number;
    } | null;
  }[];
  team: Team;
  personalTeam: Team;
};

export function Invites({ invites, team, personalTeam }: Props) {
  invites.sort((a, b) => {
    const aVal = a.invite.claimedAt || a.invite.createdAt;
    const bVal = b.invite.claimedAt || b.invite.createdAt;
    return new Date(bVal).getTime() - new Date(aVal).getTime();
  });

  return (
    <Card>
      <div className="flex items-center pr-6">
        <CardHeader>
          <CardTitle>Invites</CardTitle>
          <CardDescription>
            Invite your team members to collaborate.
          </CardDescription>
        </CardHeader>
        <Invite invites={invites} team={team} />
      </div>
      <CardContent className="grid gap-6">
        {invites.map(({ invite, inviter, claimedBy }) => (
          <div
            key={invite.id}
            className="flex items-center justify-between space-x-4"
          >
            <div className="flex items-center space-x-4">
              <Avatar>
                {claimedBy && (
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${claimedBy.slug}.png`}
                    alt={claimedBy.name}
                  />
                )}
                <AvatarFallback>
                  {claimedBy
                    ? claimedBy.name.charAt(0)
                    : invite.email.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="text-sm font-medium leading-none">
                  {invite.email}
                </p>

                {claimedBy && invite.claimedAt && (
                  <p className="text-sm text-muted-foreground">
                    Claimed by{" "}
                    <span className="font-medium">
                      {claimedBy.id === personalTeam.id
                        ? "you"
                        : claimedBy.name}
                    </span>{" "}
                    {timeAgo.format(new Date(invite.claimedAt))}
                  </p>
                )}
                {!claimedBy && (
                  <p className="text-sm text-muted-foreground">
                    Invited by{" "}
                    <span className="font-medium">
                      {inviter.id === personalTeam.id ? "you" : inviter.name}
                    </span>{" "}
                    {timeAgo.format(new Date(invite.createdAt))}
                  </p>
                )}
              </div>
            </div>
            {/* <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    Owner{" "}
                    <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="end">
                  <Command>
                    <CommandInput placeholder="Select new role..." />
                    <CommandList>
                      <CommandEmpty>No roles found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                          <p>Viewer</p>
                          <p className="text-sm text-muted-foreground">
                            Can view and comment.
                          </p>
                        </CommandItem>
                        <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                          <p>Developer</p>
                          <p className="text-sm text-muted-foreground">
                            Can view, comment and edit.
                          </p>
                        </CommandItem>
                        <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                          <p>Billing</p>
                          <p className="text-sm text-muted-foreground">
                            Can view, comment and manage billing.
                          </p>
                        </CommandItem>
                        <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                          <p>Owner</p>
                          <p className="text-sm text-muted-foreground">
                            Admin-level access to all resources.
                          </p>
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover> */}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
