import { cn } from "@/lib/utils";
import ModeToggle from "./mode-toggle";
import { HTMLProps } from "react";

import AppLogo from "./app-logo";
import SidebarSheetTrigger from "./sidebar/sidebar-sheet-trigger";

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
      <div className="h-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <SidebarSheetTrigger className="md:hidden inline-block" />
          <AppLogo className="md:hidden inline-block" />
        </div>
        <ModeToggle className="h-full w-10" />
      </div>
    </nav>
  );
}
