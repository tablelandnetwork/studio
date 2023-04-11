import { cva, VariantProps } from "class-variance-authority";

const button = cva(
  [
    "font-semibold",
    "border",
    "hover:bg-fuchsia-800",
    "hover:border-transparent",
    "uppercase",
    "disabled:opacity-20",
    "disabled:pointer-events-none",
  ],
  {
    variants: {
      intent: {
        primary: ["bg-black", "text-white", "border-black", ,],
        // **or**
        // primary: "bg-blue-500 text-white border-transparent hover:bg-blue-600",
        secondary: ["text-black", "hover:text-white", "border-black"],
      },
      size: {
        small: ["text-sm", "py-1", "px-2"],
        medium: ["text-base", "py-2", "px-4"],
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "medium",
    },
  }
);

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
