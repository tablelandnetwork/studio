import { ArrowUp01, HelpCircle, Plus, X } from "lucide-react";
import { type UseFormReturn } from "react-hook-form";
import { forwardRef, useState } from "react";
import { type z } from "zod";
import { type newDefFormSchema } from "@tableland/studio-validators";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface Props {
  columns: Array<{
    id: string;
    name: string;
    type: "text" | "integer" | "int" | "blob";
    notNull: boolean;
    primaryKey: boolean;
    unique: boolean;
  }>;
  form: UseFormReturn<z.infer<typeof newDefFormSchema>>;
}

const Columns = forwardRef<React.ElementRef<"div">, Props>(
  ({ columns, form }: Props, ref) => {
    const [columnTypes, setColumnTypes] = useState<string[]>([]);

    const { control, register, setValue, getValues } = form;

    const addColumn = () => {
      setValue("columns", [
        ...getValues("columns"),
        {
          id: new Date().getTime().toString(),
          name: "",
          type: "integer",
          notNull: false,
          primaryKey: false,
          unique: false,
        },
      ]);
      setColumnTypes([...columnTypes, "integer"]);
    };

    const removeColumn = (index: number) => {
      const cols = [...getValues("columns")];
      setValue("columns", cols.toSpliced(index, 1));
      setColumnTypes(columnTypes.toSpliced(index, 1));
    };

    const makeOnTypeChange = (
      index: number,
      target: (value: string) => void,
    ) => {
      return (value: string) => {
        setColumnTypes(columnTypes.toSpliced(index, 1, value));
        target(value);
      };
    };

    return (
      <div ref={ref}>
        {columns.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="flex items-center gap-2">
                  Type
                  <HoverCard>
                    <HoverCardTrigger>
                      <HelpCircle className="h-5 w-5 text-muted-foreground hover:text-accent-foreground" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <Table>
                        <TableCaption className="text-xs font-normal text-muted-foreground">
                          Explanation of supported column types.
                        </TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Description</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Int</TableCell>
                            <TableCell className="font-normal">
                              Signed integer values, stored in 0, 1, 2, 3, 4, 6,
                              or 8 bytes depending on the magnitude of the
                              value.
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              Integer
                            </TableCell>
                            <TableCell className="font-normal">
                              Same as Int, except it may also be used to
                              represent an auto-incrementing primary key field.
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Text</TableCell>
                            <TableCell className="font-normal">
                              Text string, stored using the database encoding
                              (UTF-8).
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Blob</TableCell>
                            <TableCell className="font-normal">
                              A blob of data, stored exactly as it was input.
                              Useful for byte slices etc.
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </HoverCardContent>
                  </HoverCard>
                </TableHead>
                <TableHead>Not Null</TableHead>
                <TableHead>Primary Key</TableHead>
                <TableHead>Unique</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {columns.map((column, index) => (
                <TableRow key={column.id}>
                  <TableCell>
                    <FormField
                      control={control}
                      name={`columns.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              key={column.id}
                              id={index.toString()}
                              placeholder="column_name"
                              {...register(`columns.${index}.name`)}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={control}
                      name={`columns.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            key={column.id}
                            value={field.value}
                            onValueChange={makeOnTypeChange(
                              index,
                              field.onChange,
                            )}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger
                                className="w-auto gap-x-2"
                                key={column.id}
                              >
                                <SelectValue placeholder="Select column type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="int">Int</SelectItem>
                              <SelectItem value="integer">Integer</SelectItem>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="blob">Blob</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={control}
                      name={`columns.${index}.notNull`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Checkbox
                              key={column.id}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              {...register(`columns.${index}.notNull`)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={control}
                      name={`columns.${index}.primaryKey`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center justify-start gap-2">
                              <Checkbox
                                key={column.id}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              {columnTypes[index] === "integer" && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <ArrowUp01 className="opacity-30 hover:opacity-100" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Primary key will be auto-incrementing
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={control}
                      name={`columns.${index}.unique`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Checkbox
                              key={column.id}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        removeColumn(index);
                      }}
                    >
                      <X />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-[0.8rem] text-muted-foreground">
            No columns to display, go ahead and add one.
          </p>
        )}
        <Button
          className="my-4"
          type="button"
          variant="outline"
          size="sm"
          onClick={addColumn}
        >
          <Plus className="mr-2" />
          Add Column
        </Button>
      </div>
    );
  },
);
Columns.displayName = "Columns";

export default Columns;
