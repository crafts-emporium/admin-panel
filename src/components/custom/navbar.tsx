import { cn } from "@/lib/utils";
import ModeToggle from "./mode-toggle";
import { HTMLProps } from "react";
import AppLogo from "./app-logo";
import SidebarSheetTrigger from "./sidebar/sidebar-sheet-trigger";
import { UserButton } from "@clerk/nextjs";

export default function Navbar({
  className,
  ...props
}: HTMLProps<HTMLDivElement>) {
  return (
    <nav
      className={cn(
        "p-2 shadow bg-background z-[999]",
        "sticky top-0 z-40",
        className,
      )}
      suppressHydrationWarning
      {...props}
    >
      <div className="h-10 flex justify-between items-center gap-4">
        <div className="flex w-full items-center gap-2">
          <SidebarSheetTrigger className="md:hidden inline-block" />
          <AppLogo className="md:hidden inline-block" />
        </div>
        <ModeToggle className="h-10 w-10 shrink-0" />
        <UserButton />
      </div>
    </nav>
  );
}
