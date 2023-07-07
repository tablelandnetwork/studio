import { Search } from "@/components/search";

export default function HeaderTeam() {
  return (
    <header className="sticky top-0 flex flex-col space-y-4 border-b bg-white px-4 py-3">
      <div className="flex">
        {/* <NavTeam team={team} /> */}
        <div className="ml-auto flex items-center space-x-4">
          <Search placeholder="Search Project Blueprints..." />
        </div>
      </div>
      {/* <nav></nav> */}
    </header>
  );
}
