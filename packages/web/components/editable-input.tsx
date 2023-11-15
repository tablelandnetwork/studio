import { cn } from "@/lib/utils";
import { Check, Loader2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input, InputProps } from "./ui/input";

export default function EditableInput({
  status,
  onSubmit,
  className,
  defaultValue,
  disabled,
  onChange,
  ...rest
}: {
  defaultValue: string | undefined;
  status: "error" | "idle" | "loading" | "success";
  onSubmit: (value: string | undefined) => void;
} & Omit<InputProps, "onSubmit" | "defaultValue">) {
  const [dirty, setDirty] = useState(false);
  const [value, setValue] = useState(defaultValue);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setDirty(e.target.value !== defaultValue);
    if (onChange) onChange(e);
  };

  const handleSubmit = () => {
    onSubmit(value);
  };

  const handleCancel = () => {
    setValue(defaultValue);
    setDirty(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        {...rest}
        defaultValue={defaultValue}
        value={value}
        onChange={handleOnChange}
        className={cn(className, "border-gray-100 shadow-none")}
        disabled={status === "loading" || disabled}
      />
      {dirty && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            disabled={status === "loading"}
          >
            <X />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSubmit}
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Check />
            )}
          </Button>
        </>
      )}
    </div>
  );
}
