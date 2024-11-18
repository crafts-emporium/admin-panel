import { PanelLeft } from "lucide-react";
import { Button, ButtonProps } from "../../ui/button";
import { useGlobalAppStore } from "@/store/global-app-store";
import { cn } from "@/lib/utils";

export default function SidebarTrigger({ className, ...props }: ButtonProps) {
  const { toggleSidebarMinimised } = useGlobalAppStore();
  return (
    <Button
      className={cn("p-3 py-5 hover:bg-accent", className)}
      variant={"ghost"}
      onClick={toggleSidebarMinimised}
      {...props}
    >
      <PanelLeft className="" />
    </Button>
  );
}
