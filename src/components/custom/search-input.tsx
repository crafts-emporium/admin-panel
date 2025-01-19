"use client";

import { useSearchparamsChange } from "@/hooks/use-searchparams-change";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function SearchInput({ placeholder }: { placeholder?: string }) {
  const count = useRef(0);
  const { deleteParam, replace, setParam, getParam } = useSearchparamsChange();
  const [input, setInput] = useState<string>(getParam("query") || "");
  const deboundedInput = useDebounce(input, 500);

  useEffect(() => {
    if (count.current === 0) {
      count.current += 1;
      return;
    }

    replace(deleteParam(setParam("query", deboundedInput), "page"));
  }, [deboundedInput]);

  return (
    <div className="w-full relative">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full bg-input border-black/70 dark:border-white/10 focus-visible:ring-0 pl-8"
        placeholder={placeholder || "Search..."}
      />
      <Search className="absolute left-2 top-1/2 -translate-y-1/2" size={16} />
    </div>
  );
}
