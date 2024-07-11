import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
  type Cell,
} from "@tanstack/react-table";
import { type RouterOutputs } from "@tableland/studio-api";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import Link from "next/link";
import { DataTable } from "./data-table";
import HashDisplay from "./hash-display";
import { type ACLItem } from "@/lib/validator-queries";

type UserValue =
  RouterOutputs["users"]["usersForAddresses"] extends Map<any, infer I>
    ? I
    : never;

type TableRowData = ACLItem &
  Partial<UserValue> & {
    isOwner: boolean;
  };

interface Props {
  acl: ACLItem[];
  authorizedStudioUsers: RouterOutputs["users"]["usersForAddresses"];
  owner: string;
}

export default function ACL({ acl, authorizedStudioUsers, owner }: Props) {
  const data: TableRowData[] = acl.map((item) => {
    const studioUser = authorizedStudioUsers.get(item.controller);
    const isOwner = item.controller === owner;
    return {
      ...item,
      ...studioUser,
      isOwner,
    };
  });

  const columns: Array<ColumnDef<TableRowData>> = [
    {
      accessorKey: "controller",
      header: "Address",
      cell: AddressCell,
    },
    {
      accessorKey: "team.name",
      header: "Studio User",
      cell: UserCell,
    },
    {
      accessorKey: "isOwner",
      header: "Table Owner",
      cell: BoolCell,
    },
    {
      accessorKey: "privileges.insert",
      header: "Insert",
      cell: BoolCell,
    },
    {
      accessorKey: "privileges.update",
      header: "Update",
      cell: BoolCell,
    },
    {
      accessorKey: "privileges.delete",
      header: "Delete",
      cell: BoolCell,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return <DataTable table={table} />;
}

function AddressCell({
  getValue,
}: ReturnType<Cell<TableRowData, unknown>["getContext"]>) {
  const initialValue = getValue<string>();

  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <HashDisplay hash={value} copy className="justify-start text-foreground" />
  );
}

function BoolCell({
  getValue,
}: ReturnType<Cell<TableRowData, unknown>["getContext"]>) {
  const initialValue = getValue<boolean>();

  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return value ? <Check /> : null;
}

function UserCell({
  getValue,
  row,
}: ReturnType<Cell<TableRowData, unknown>["getContext"]>) {
  const initialValue = getValue<string>();

  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return row.original.team ? (
    <Link href={`/${row.original.team.slug}`}>{value}</Link>
  ) : (
    <span>{value}</span>
  );
}
