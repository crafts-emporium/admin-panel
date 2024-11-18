import { AvatarProps } from "@radix-ui/react-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";

export default function AppLogo({ className, ...props }: AvatarProps) {
  return (
    <Avatar className={cn("w-10", className)} {...props}>
      {/** @ts-ignore */}
      <AvatarImage src={null} />
      <AvatarFallback className="text-sm">CE</AvatarFallback>
    </Avatar>
  );
}
