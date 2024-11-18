import { cn } from "@/lib/utils";
import { HTMLProps } from "react";

export default function SidebarItem({
  className,
  children,
  selected,
  ...props
}: HTMLProps<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "p-2.5 flex justify-start items-center gap-3 rounded-md transition-all",
        selected
          ? "[&>*]:text-primary bg-primary/20 dark:[&>*]:text-primary dark:bg-muted"
          : "hover:bg-accent dark:[&>*]:text-muted-foreground text-gray-500 dark:hover:bg-muted",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SidebarItemIcon({
  children,
  className,
  ...props
}: HTMLProps<HTMLDivElement>) {
  return (
    <div className={cn("w-5 h-5 shrink-0", className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarItemLabel({
  children,
  className,
  ...props
}: HTMLProps<HTMLDivElement>) {
  return (
    <h2 className={cn("w-full font-medium text-sm", className)} {...props}>
      {children}
    </h2>
  );
}
