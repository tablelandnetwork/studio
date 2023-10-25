import { Input, InputProps } from "@/components/ui/input";
import { CheckCircle2, CircleDashed, Loader2 } from "lucide-react";
import { ChangeEvent, forwardRef, useEffect, useState } from "react";

export type Props = InputProps & {
  onCheck: (inputValue: string) => void;
  checkPending: boolean;
  checkPassed?: boolean;
  debounceDuration?: number;
  failedMessage?: string;
};

const InputWithCheck = forwardRef<HTMLDivElement, Props>(
  (
    {
      onCheck,
      checkPending,
      checkPassed,
      onChange,
      debounceDuration = 500,
      failedMessage = "unavailable",
      ...props
    }: Props,
    ref,
  ) => {
    const [inputValue, setInputValue] = useState("");
    const [debouncing, setDebouncing] = useState(false);
    const [debouncedValue, setDebouncedValue] = useState("");

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
      if (!debouncedValue.length) {
        return;
      }
      onCheck(debouncedValue);
    }, [debouncedValue, onCheck]);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value);
      if (onChange) {
        onChange(event);
      }
    };

    return (
      <div className="flex items-center space-x-2">
        <Input {...props} onChange={handleInputChange} />
        {checkPassed === undefined && (
          <CircleDashed className="text-gray-300" />
        )}
        {checkPending && <Loader2 className="animate-spin" />}
        {checkPassed && <CheckCircle2 />}
        {checkPassed === false && (
          <p className="text-xs text-red-500">{failedMessage}</p>
        )}
      </div>
    );
  },
);

InputWithCheck.displayName = "InputWithCheck";

export default InputWithCheck;
