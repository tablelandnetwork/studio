import { CheckCircle2, CircleDashed, Loader2 } from "lucide-react";
import { type ChangeEvent, forwardRef, useEffect, useState } from "react";
import { Input, type InputProps } from "@/components/ui/input";

export type CheckStatus = "idle" | "pending" | "passed" | "failed" | "error";

export interface QueryStatus {
  data: boolean | undefined;
  isError: boolean;
  isFetching: boolean;
  isSuccess: boolean;
}

export type Props = Omit<InputProps, "defaultValue"> & {
  defaultValue?: string;
  updateQuery: (inputValue: string) => void;
  queryStatus: QueryStatus;
  onResult?: (result: boolean | undefined) => void;
  debounceDuration?: number;
  successMessage?: string;
  failedMessage?: string;
  errorMessage?: string;
};

const InputWithCheck = forwardRef<HTMLDivElement, Props>(
  (
    {
      defaultValue,
      updateQuery,
      queryStatus,
      onResult,
      onChange,
      debounceDuration = 500,
      successMessage = "available",
      failedMessage = "unavailable",
      errorMessage = "error checking availability",
      ...props
    }: Props,
    ref,
  ) => {
    const [inputValue, setInputValue] = useState(defaultValue ?? "");
    const [debouncing, setDebouncing] = useState(false);
    const [debouncedValue, setDebouncedValue] = useState("");
    const [result, setResult] = useState<boolean | undefined>(undefined);

    useEffect(() => {
      setDebouncing(true);
      const id = setTimeout(() => {
        setDebouncing(false);
        setDebouncedValue(inputValue);
      }, debounceDuration);
      return () => {
        setDebouncing(false);
        clearTimeout(id);
      };
    }, [inputValue, debounceDuration]);

    useEffect(() => {
      if (debouncing) {
        setResult(undefined);
      }
    }, [debouncing]);

    useEffect(() => {
      if (!debouncedValue.length) {
        setResult(undefined);
        return;
      }
      updateQuery(debouncedValue);
    }, [debouncedValue, updateQuery]);

    useEffect(() => {
      if (queryStatus.isSuccess) {
        setResult(queryStatus.data);
      }
    }, [queryStatus.data, queryStatus.isSuccess]);

    useEffect(() => {
      if (onResult) {
        onResult(result);
      }
    }, [onResult, result]);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value);
      if (onChange) {
        onChange(event);
      }
    };

    return (
      <div className="flex items-center space-x-2">
        <Input {...props} onChange={handleInputChange} />
        {statusComponent()}
      </div>
    );

    function statusComponent() {
      if (debouncing || !inputValue.length) {
        return <CircleDashed className="text-gray-300" />;
      } else if (queryStatus.isFetching) {
        return <Loader2 className="animate-spin" />;
      } else if (queryStatus.isSuccess) {
        if (queryStatus.data) {
          return <p className="text-xs text-green-500">{successMessage}</p>;
        } else {
          return <p className="text-xs text-red-500">{failedMessage}</p>;
        }
      } else if (queryStatus.isError) {
        return <p className="text-xs text-red-500">{errorMessage}</p>;
      } else {
        return <CircleDashed className="text-gray-300" />;
      }
    }
  },
);

InputWithCheck.displayName = "InputWithCheck";

export default InputWithCheck;
