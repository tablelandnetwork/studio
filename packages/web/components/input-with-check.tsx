import { Input, InputProps } from "@/components/ui/input";
import { CheckCircle2, CircleDashed, Loader2 } from "lucide-react";
import { ChangeEvent, useEffect, useState, useTransition } from "react";

export default function InputWithCheck({
  check,
  onCheckResult,
  debounceDuration = 500,
  failedMessage = "unavailable",
  onChange,
  ...props
}: InputProps & {
  check: (inputValue: string) => Promise<boolean>;
  onCheckResult?: (result: boolean | undefined) => void;
  debounceDuration?: number;
  failedMessage?: string;
}) {
  const [inputValue, setInputValue] = useState("");
  const [debouncing, setDebouncing] = useState(false);
  const [debouncedName, setDebouncedName] = useState("");
  const [checkPassed, setCheckPassed] = useState<boolean | undefined>(
    undefined,
  );
  const [checkPending, startCheckPendingTransition] = useTransition();

  useEffect(() => {
    setDebouncing(true);
    setCheckPassed(undefined);
    const id = setTimeout(() => {
      setDebouncing(false);
      setDebouncedName(inputValue);
    }, debounceDuration);
    return () => {
      setDebouncing(false);
      clearTimeout(id);
    };
  }, [inputValue, debounceDuration]);

  useEffect(() => {
    if (!debouncedName.length) {
      setCheckPassed(undefined);
      return;
    }
    startCheckPendingTransition(async () => {
      const res = await check(debouncedName);
      if (!debouncing) {
        setCheckPassed(res);
      }
    });
    // Leaving debouncing out of the deps array here is intentional
    // because we don't want to retrigger this effect when debouncing changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedName]);

  useEffect(() => {
    if (onCheckResult) {
      onCheckResult(checkPassed);
    }
  }, [checkPassed, onCheckResult]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Input {...props} onChange={handleInputChange} />
      {checkPassed === undefined && <CircleDashed className="text-gray-300" />}
      {checkPending && <Loader2 className="animate-spin" />}
      {checkPassed && <CheckCircle2 />}
      {checkPassed === false && (
        <p className="text-xs text-red-500">{failedMessage}</p>
      )}
    </div>
  );
}
