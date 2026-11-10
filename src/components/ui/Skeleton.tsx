import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "circular";
}

function Skeleton({
  className,
  variant = "default",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "skeleton-editorial transition-all select-none pointer-events-none",
        variant === "circular" && "rounded-full",
        variant === "text" && "rounded h-4 my-1",
        variant === "default" && "rounded-md",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Skeleton };
