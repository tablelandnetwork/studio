import { type schema } from "@tableland/studio-store";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function OrgAvatar({ org }: { org: schema.Org }) {
  return (
    <Avatar>
      <AvatarImage
        src={`https://avatar.vercel.sh/${org.slug}.png`}
        alt={org.name}
      />
      <AvatarFallback>{org.name.charAt(0)}</AvatarFallback>
    </Avatar>
  );
}
