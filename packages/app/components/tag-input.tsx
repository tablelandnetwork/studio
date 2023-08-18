import { X } from "lucide-react";
import React, { forwardRef } from "react";
import { Input } from "./ui/input";

type Props = {
  id?: string;
  placeholder: string;
  tags: string[];
  setTags: (tags: string[]) => void;
};

const TagInput = forwardRef<HTMLDivElement, Props>(
  ({ id, placeholder, tags, setTags }: Props, ref) => {
    const [input, setInput] = React.useState("");
    // const [tags, setTags] = React.useState<string[]>([]);
    const [isKeyReleased, setIsKeyReleased] = React.useState(false);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setInput(value);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const { key } = e;
      const trimmedInput = input.trim();
      if (
        (key === "," || key === "Enter") &&
        trimmedInput.length &&
        !tags.includes(trimmedInput)
      ) {
        e.preventDefault();
        setTags([...tags, trimmedInput]);
        setInput("");
      }

      if (
        key === "Backspace" &&
        !input.length &&
        tags.length &&
        isKeyReleased
      ) {
        const tagsCopy = [...tags];
        const poppedTag = tagsCopy.pop();
        e.preventDefault();
        setTags(tagsCopy);
        if (poppedTag) {
          setInput(poppedTag);
        }
      }
      setIsKeyReleased(false);
    };

    const onKeyUp = () => {
      setIsKeyReleased(true);
    };

    const deleteTag = (index: number) => {
      setTags(tags.filter((_, i) => i !== index));
    };

    return (
      <div
        id={id}
        ref={ref}
        className="flex w-full max-w-full flex-wrap space-x-1 overflow-scroll rounded-md border pl-1 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      >
        {tags.map((tag, i) => (
          <div
            key={i}
            className="my-1 flex items-center space-x-2 rounded-md bg-black px-2 py-1 text-white"
          >
            <span className="text-sm">{tag}</span>
            <button
              onClick={() => deleteTag(i)}
              className="flex cursor-pointer hover:opacity-80"
            >
              <X className="h-4 w-4 fill-white" />
            </button>
          </div>
        ))}
        <Input
          className="m-0 w-full min-w-fit flex-1 border-none outline-none focus-visible:outline-none focus-visible:ring-0"
          value={input}
          placeholder={placeholder}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          onChange={onChange}
        />
      </div>
    );
  }
);
TagInput.displayName = "TagInput";

export default TagInput;
