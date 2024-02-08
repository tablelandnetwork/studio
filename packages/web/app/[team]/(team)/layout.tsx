import NavTeam from "@/components/nav-team";

// export default async function LayoutTeam({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="flex flex-1 flex-col">
//       <header className="sticky top-0 flex flex-col space-y-4 border-b bg-white px-4 py-3">
//         <div className="flex">
//           <NavTeam />
//         </div>
//       </header>
//       {children}
//     </div>
//   );
// }

import { ScrollArea } from "@/components/ui/scroll-area";

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function LayoutTeam({ children }: DocsLayoutProps) {
  return (
    <div className="flex flex-1">
      <aside className="min-w-[200px] bg-slate-200"></aside>
      <div className="bg-slate-400">{children}</div>
    </div>
  );
}
