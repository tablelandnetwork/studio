import * as React from "react";
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
import { cn } from "@/lib/utils";

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
  { tooltipText?: string } & React.HTMLAttributes<HTMLDivElement>
>(({ tooltipText, className, children, ...props }, ref) => {
  return (
    <CardContent
      ref={ref}
      className={cn(
        "m-auto hyphens-auto text-center text-3xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    >
      {tooltipText ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>{children}</TooltipTrigger>
            <TooltipContent>{tooltipText}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        children
      )}
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
