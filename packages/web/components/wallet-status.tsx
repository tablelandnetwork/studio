import { type Auth } from "@tableland/studio-api";
import { type HTMLAttributes } from "react";
import { skipToken } from "@tanstack/react-query";
import { AlertTriangle, Crown, KeyRound, User } from "lucide-react";
import HashDisplay from "./hash-display";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { api } from "@/trpc/react";
import { type ACLItem } from "@/lib/validator-queries";
import { cn } from "@/lib/utils";

type Props = {
  auth?: Auth;
  owner?: string;
  address?: string;
  accountPermissions?: ACLItem;
} & HTMLAttributes<HTMLDivElement>;

export default function WalletStatus({
  auth,
  owner,
  address,
  accountPermissions,
  className,
  ...rest
}: Props) {
  const { data: authorizedStudioUser } = api.users.userForAddress.useQuery(
    address ? { address } : skipToken,
  );

  return (
    <div
      className={cn(
        "ml-auto flex items-center gap-x-4 text-sm text-foreground",
        className,
      )}
      {...rest}
    >
      {address && (
        <span>
          Connected as{" "}
          <div className="inline-block">
            <HashDisplay hash={address} copy className="text-foreground" />
          </div>
        </span>
      )}
      <div className="flex items-center gap-x-2">
        {authorizedStudioUser && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <User className="size-4 shrink-0 stroke-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Studio user {authorizedStudioUser.org.name}
                {authorizedStudioUser.user.orgId === auth?.user.orgId
                  ? " (you)"
                  : ""}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {auth && address && auth.user.address !== address && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertTriangle className="size-4 shrink-0 stroke-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                This address is different than the one associated with your
                Studio account.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {owner && owner === address && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Crown className="size-4 shrink-0 stroke-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>Table owner</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {accountPermissions && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <KeyRound className="size-4 shrink-0 stroke-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Permissions:
                <ul className="list-disc px-3">
                  {accountPermissions.privileges.insert && <li>Insert</li>}
                  {accountPermissions.privileges.update && <li>Update</li>}
                  {accountPermissions.privileges.delete && <li>Delete</li>}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
