import { MainNav } from "@/components/main-nav";
import TeamSwitcher from "@/components/team-switcher";
import { Search } from "@/components/search";

export default function AuthedHeader({ userId }: { userId: string }) {
  return (
    <div className="border-b sticky top-0 bg-white">
      <div className="flex h-16 items-center px-4">
        <TeamSwitcher userId={userId} />
        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          <Search placeholder="Search Project Blueprints..." />
          {/* <UserNav /> */}
        </div>
      </div>
    </div>
  );
}
