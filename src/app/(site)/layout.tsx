"use client";

import Navbar from "@/components/custom/navbar";
import NavigationHelper from "@/components/custom/navigation-helper";
import Sidebar from "@/components/custom/sidebar/sidebar";
import { cn } from "@/lib/utils";
import { useGlobalAppStore } from "@/store/global-app-store";

export default function Layout({
  children,
  dialog,
}: {
  children: React.ReactNode;
  dialog: React.ReactNode;
}) {
  const { isSidebarMinimised } = useGlobalAppStore();
  return (
    <main className="flex justify-end">
      <Sidebar
        className={cn(
          "shrink-0 h-[100dvh] transition-all sticky top-0",
          isSidebarMinimised ? "w-14" : "w-64",
        )}
      />
      <div className={cn("w-full")}>
        <Navbar />
        <div className="lg:p-6 p-4 bg-accent/70 min-h-[calc(100svh-56px)]">
          {children}
        </div>
      </div>
      <NavigationHelper />
      {dialog}
    </main>
  );
}
