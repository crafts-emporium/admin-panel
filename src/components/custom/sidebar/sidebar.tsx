import { cn } from "@/lib/utils";
import { HTMLProps } from "react";
import SidebarTrigger from "./sidebar-trigger";
import AppLogo from "../app-logo";
import { useGlobalAppStore } from "@/store/global-app-store";
import SidebarItem, { SidebarItemIcon, SidebarItemLabel } from "./sidebar-item";
import Link from "next/link";
import { sidebarItems } from "@/constants/sidebar";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AppName } from "@/constants/names";

export default function Sidebar({
  className,
  ...props
}: HTMLProps<HTMLDivElement>) {
  const { isSidebarMinimised } = useGlobalAppStore();
  const pathname = usePathname();
  return (
    <aside
      className={cn(
        "border-r md:flex hidden flex-col justify-between p-2 gap-1",
        className,
      )}
      {...props}
    >
      <Link href={"/"}>
        <header className="flex gap-2 items-center mb-9">
          <AppLogo />
          <h1
            className={cn(
              "text-xl font-semibold font-sans whitespace-nowrap",
              isSidebarMinimised ? "hidden" : "block",
            )}
          >
            {AppName}
          </h1>
        </header>
      </Link>
      <main className="space-y-2 h-full overflow-y-auto">
        {sidebarItems.map((i) => (
          <Link href={i.href} key={i.id} className="block">
            <TooltipProvider>
              <Tooltip delayDuration={20}>
                <TooltipTrigger className="w-full">
                  <SidebarItem selected={i.selected(pathname)}>
                    <SidebarItemIcon>
                      <i.Icon className="w-full h-full" />
                    </SidebarItemIcon>
                    <SidebarItemLabel
                      className={isSidebarMinimised ? "hidden" : "text-left"}
                    >
                      {i.label}
                    </SidebarItemLabel>
                  </SidebarItem>
                </TooltipTrigger>
                <TooltipContent side="right" hidden={!isSidebarMinimised}>
                  {i.label}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Link>
        ))}
      </main>
      <footer className={cn("shrink-0", "flex items-center justify-start")}>
        <SidebarTrigger />
      </footer>
    </aside>
  );
}
