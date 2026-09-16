import { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-surface-muted bg-surface p-5 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
