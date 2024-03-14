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

const MetricCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardHeader ref={ref} className={cn(className)} {...props} />
));
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
  { tooltipText?: string; copy?: string } & React.HTMLAttributes<HTMLDivElement>
>(({ tooltipText, className, children, copy, ...props }, ref) => {
  const { toast } = useToast();

  return (
    <CardContent
      ref={ref}
      className={cn(
        "m-auto text-center text-3xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    >
      <div className="flex w-full tracking-tight">
        {!!tooltipText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="max-w-full cursor-default">
                <div className="truncate">{children}</div>
              </TooltipTrigger>
              <TooltipContent>{tooltipText}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {!!copy && !!tooltipText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                className="cursor-point -mt-4 h-auto w-0"
                onClick={() => handleCopy(tooltipText, toast)}
              >
                <Copy className="h-4 w-4 stroke-slate-300" />
                <span className="sr-only">{tooltipText}</span>
              </TooltipTrigger>
              <TooltipContent>click to copy table name</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {!tooltipText && children}
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
