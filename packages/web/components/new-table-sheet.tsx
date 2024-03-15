import NewTableForm from "@/app/[team]/[project]/new-table/_components/new-table-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function NewTableSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="overflow-scroll sm:max-w-xl"
        // closeDisabled
        // onPointerDownOutside={(e) => e.preventDefault()}
        // onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <SheetHeader>
          <SheetTitle>New Table</SheetTitle>
          <SheetDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </SheetDescription>
        </SheetHeader>
        <NewTableForm />
      </SheetContent>
    </Sheet>
  );
}
