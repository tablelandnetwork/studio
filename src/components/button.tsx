import { cva, VariantProps } from "class-variance-authority";

const button = cva(["font-semibold", "border"], {
  variants: {
    intent: {
      primary: [
        "text-black",
        "hover:bg-indigo-700",
        "hover:text-white",
        "border-black",
        "hover:border-transparent",
      ],
      // **or**
      // primary: "bg-blue-500 text-white border-transparent hover:bg-blue-600",
      secondary: [
        "bg-white",
        "text-gray-800",
        "border-gray-400",
        "hover:bg-gray-100",
      ],
    },
    size: {
      small: ["text-sm", "py-1", "px-2"],
      medium: ["text-base", "py-2", "px-4"],
    },
  },
  compoundVariants: [
    {
      intent: "primary",
      size: "medium",
      class: "uppercase",
      // **or** if you're a React.js user, `className` may feel more consistent:
      // className: "uppercase"
    },
  ],
  defaultVariants: {
    intent: "primary",
    size: "medium",
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export default function Button({
  className,
  intent,
  size,
  ...props
}: ButtonProps) {
  return <button className={button({ intent, size, className })} {...props} />;
}
