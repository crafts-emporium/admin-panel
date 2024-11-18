import { cn } from "@/lib/utils";
import { HTMLProps } from "react";

export function PageHeader({
  children,
  className,
  ...props
}: HTMLProps<HTMLDivElement>) {
  return (
    <section className={cn("space-y-1 w-full", className)} {...props}>
      {children}
    </section>
  );
}

export function PageTitle({
  children,
  className,
  ...props
}: HTMLProps<HTMLDivElement>) {
  return (
    <h1
      className={cn("text-2xl font-semibold tracking-tight ", className)}
      {...props}
    >
      {children}
    </h1>
  );
}

export function PageDescription({
  children,
  className,
  ...props
}: HTMLProps<HTMLDivElement>) {
  return (
    <p
      className={cn("text-muted-foreground sm:text-base text-xs", className)}
      {...props}
    >
      {children}
    </p>
  );
}
