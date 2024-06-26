import { CheckCircle2, CircleDashed, Loader2 } from "lucide-react";
import { type ChangeEvent, forwardRef, useEffect, useState } from "react";
import { type RouterError } from "@tableland/studio-api";
import { type TRPCClientErrorBase } from "@trpc/client";
import { Input, type InputProps } from "@/components/ui/input";

export interface QueryStatus {
  data: boolean | undefined;
  isError: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  error: TRPCClientErrorBase<RouterError> | null;
}

export type Props = InputProps & {
  updateQuery: (inputValue: string) => void;
  queryStatus: QueryStatus;
  debounceDuration?: number;
  failedMessage?: string;
  errorFieldName?: string;
};

const InputWithCheck = forwardRef<HTMLInputElement, Props>(
  (
    {
      updateQuery,
      queryStatus,
      onChange,
      debounceDuration = 500,
      failedMessage = "unavailable",
      errorFieldName = "name",
      value,
      ...props
    }: Props,
    ref,
  ) => {
    const [inputValue, setInputValue] = useState<
      string | number | readonly string[] | undefined
    >(value);
    const [debouncing, setDebouncing] = useState(false);
    const [debouncedValue, setDebouncedValue] = useState<
      string | number | readonly string[] | undefined
    >();

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
      if (typeof debouncedValue === "string" && !!debouncedValue.length) {
        updateQuery(debouncedValue);
      }
    }, [debouncedValue, updateQuery]);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value);
      if (onChange) {
        onChange(event);
      }
    };

    return (
      <div className="flex items-center space-x-2">
        <Input
          {...props}
          value={value}
          onChange={handleInputChange}
          ref={ref}
        />
        {statusComponent()}
      </div>
    );

    function statusComponent() {
      if (debouncing || !value) {
        return <CircleDashed className="text-foreground" />;
      } else if (queryStatus.isFetching) {
        return <Loader2 className="animate-spin" />;
      } else if (queryStatus.isSuccess) {
        if (queryStatus.data) {
          return <CheckCircle2 />;
        } else {
          return <p className="text-xs text-red-500">{failedMessage}</p>;
        }
      } else if (queryStatus.isError && queryStatus.error) {
        return (
          <p className="text-xs text-destructive">
            {queryStatus.error.data?.zodError
              ? queryStatus.error.data.zodError.fieldErrors[errorFieldName]
              : queryStatus.error.message}
          </p>
        );
      } else {
        return <CircleDashed className="text-foreground" />;
      }
    }
  },
);

InputWithCheck.displayName = "InputWithCheck";

export default InputWithCheck;
