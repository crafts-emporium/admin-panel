import { Button, ButtonProps } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useGlobalAppStore } from "@/store/global-app-store";
import { AlignJustify } from "lucide-react";
import AppLogo from "../app-logo";
import { AppName } from "@/constants/names";
import React from "react";
import { sidebarItems } from "@/constants/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SidebarItem, { SidebarItemIcon, SidebarItemLabel } from "./sidebar-item";

export default function SidebarSheetTrigger({
  className,
  ...props
}: ButtonProps) {
  const { isSidebarOpen, setIsSidebarOpen } = useGlobalAppStore();
  const pathname = usePathname();
  return (
    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <SheetTrigger asChild>
        <Button className={cn("px-3", className)} variant={"ghost"} {...props}>
          <AlignJustify />
        </Button>
      </SheetTrigger>
      <SheetContent side={"left"}>
        <SheetTitle asChild>
          <div className="flex items-center gap-2 mb-5">
            <AppLogo />
            <h2 className={cn("text-2xl font-semibold font-sans")}>
              {AppName}
            </h2>
          </div>
        </SheetTitle>

        <main className="w-full h-[calc(100%-4rem)] overflow-y-auto space-y-2">
          {sidebarItems.map((i) => (
            <Link href={i.href} key={i.id} className="block">
              <SidebarItem selected={i.selected(pathname)}>
                <SidebarItemIcon>
                  <i.Icon className="w-5 h-5" />
                </SidebarItemIcon>
                <SidebarItemLabel>{i.label}</SidebarItemLabel>
              </SidebarItem>
            </Link>
          ))}
        </main>
      </SheetContent>
    </Sheet>
  );
}
