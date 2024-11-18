"use client";

import { usePathname } from "next/navigation";
import { useGlobalAppStore } from "@/store/global-app-store";
import { useEffect } from "react";

export default function NavigationHelper() {
  const pathname = usePathname();
  const { setIsSidebarOpen } = useGlobalAppStore();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname, setIsSidebarOpen]);
  return <></>;
}
