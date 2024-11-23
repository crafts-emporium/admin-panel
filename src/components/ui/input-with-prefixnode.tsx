import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Icon } from "@/types/icon";

export default function InputWithPrefixNode({
  PrefixNode,
  className,
  ...props
}: React.ComponentProps<"input"> & { PrefixNode?: Icon }) {
  return (
    <div className="relative">
      <Input {...props} className={cn("pl-7", className)} />
      {PrefixNode && (
        <PrefixNode
          size={14}
          className="absolute left-2 top-1/2 -translate-y-1/2"
        />
      )}
    </div>
  );
}
