"use client";

import * as React from "react";
import { Copy } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn, handleCopy } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const MetricCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn("rounded-sm shadow-sm", className)}
    {...props}
  />
));
MetricCard.displayName = "MetricCard";

type HeaderMainProps = React.HTMLAttributes<HTMLDivElement>;
interface HeaderCopyProps {
  copyValue: string;
  valueDesc: string;
  tooltipText: string;
}
interface HeaderNoCopyProps {
  copyValue?: undefined;
  valueDesc?: never;
  tooltipText?: never;
}
type HeaderProps = HeaderMainProps & (HeaderCopyProps | HeaderNoCopyProps);

const MetricCardHeader = React.forwardRef<HTMLDivElement, HeaderProps>(
  (
    { className, children, copyValue, valueDesc, tooltipText, ...props },
    ref,
  ) => {
    const { toast } = useToast();
    return (
      <CardHeader ref={ref} className={cn(className)} {...props}>
        {children}
        {copyValue && tooltipText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                className="cursor-point ml-auto"
                onClick={() => handleCopy(copyValue, valueDesc, toast)}
              >
                <Copy className="h-4 w-4 stroke-slate-300" />
                <span className="sr-only">{"hi"}</span>
              </TooltipTrigger>
              <TooltipContent>{tooltipText}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardHeader>
    );
  },
);
MetricCardHeader.displayName = "MetricCardHeader";

const MetricCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <CardTitle
    ref={ref}
    className={cn("text-sm uppercase", className)}
    {...props}
  />
));
MetricCardTitle.displayName = "MetricCardTitle";

const MetricCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <CardDescription ref={ref} className={cn(className)} {...props} />
));
MetricCardDescription.displayName = "MetricCardDescription";

const MetricCardContent = React.forwardRef<
  HTMLDivElement,
  { tooltipText?: string } & React.HTMLAttributes<HTMLDivElement>
>(({ tooltipText, className, children, ...props }, ref) => {
  return (
    <CardContent
      ref={ref}
      className={cn(
        "m-auto text-center text-3xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    >
      <div className="flex w-full max-w-full">
        {tooltipText ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="max-w-full cursor-default">
                <div className="truncate tracking-tight">{children}</div>
              </TooltipTrigger>
              <TooltipContent>{tooltipText}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="truncate tracking-tight">{children}</div>
        )}
      </div>
    </CardContent>
  );
});
MetricCardContent.displayName = "MetricCardContent";

const MetricCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardFooter
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
MetricCardFooter.displayName = "MetricCardFooter";

export {
  MetricCard,
  MetricCardContent,
  MetricCardDescription,
  MetricCardFooter,
  MetricCardHeader,
  MetricCardTitle,
};
