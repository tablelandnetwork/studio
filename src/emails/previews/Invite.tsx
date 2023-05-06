import Invite from "../Invite";

export function preview() {
  return (
    <Invite
      includeUnsubscribe
      inviterUsername="aaron"
      teamName="GreatTeam"
      link="https://example.com"
    />
  );
}
