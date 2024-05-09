import { type ComponentProps } from "react";
import TableMenu from "./table-menu";

export default async function TableWrapper({
  displayName,
  children,
  ...props
}: ComponentProps<typeof TableMenu> & {
  displayName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-medium">{displayName}</h1>
        <TableMenu {...props} />
      </div>
      {children}
    </div>
  );
}
