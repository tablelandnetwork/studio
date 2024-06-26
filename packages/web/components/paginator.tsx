import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

export function Paginator({
  numItems,
  pageSize,
  page,
  setPage,
  disabled,
}: {
  numItems: number;
  pageSize: number;
  page: number;
  setPage: (page: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-2 flex items-center justify-center gap-2">
      <Button
        variant="ghost"
        className="px-2"
        onClick={() => setPage(page === 0 ? page : page - 1)}
        disabled={page === 0 || disabled}
      >
        <ChevronLeft />
      </Button>
      <span className="text-muted-foreground">{page + 1}</span>
      <Button
        variant="ghost"
        className="px-2"
        onClick={() => setPage(page + 1)}
        disabled={numItems < pageSize * (page + 1) || disabled}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
