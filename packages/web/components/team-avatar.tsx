import { type schema } from "@tableland/studio-store";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function TeamAvatar({ team }: { team: schema.Team }) {
  return (
    <Avatar>
      <AvatarImage
        src={`https://avatar.vercel.sh/${team.slug}.png`}
        alt={team.name}
      />
      <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
    </Avatar>
  );
}
