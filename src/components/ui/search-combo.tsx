"use client";

import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
import { cn, isActionError } from "@/lib/utils";
import { Input } from "./input";
import { Search } from "lucide-react";
import { PopoverClose } from "@radix-ui/react-popover";
import { useDebounce } from "@uidotdev/usehooks";

type SearchComboContextProps = {
  isEmpty: boolean;
  query: string;
  list: any[];
  loading: boolean;
  onEmptyChange: (isEmpty: boolean) => void;
  onQueryChange: (query: string) => void;
  onListChange: (list: any[]) => void;
  getListItems: (query: string) => Promise<any[]>;
  onLoadingChange: (loading: boolean) => void;
};

const SearchComboContext = React.createContext<SearchComboContextProps | null>(
  null,
);
const useSearchComboProvider = () => {
  const context = React.useContext(SearchComboContext);
  if (!context) {
    throw new Error(
      "useSearchComboProvider must be used within a <SearchCombo />",
    );
  }
  return context;
};

const SearchCombo: React.FC<
  React.ComponentProps<typeof Popover> & Partial<SearchComboContextProps>
> = ({
  children,
  isEmpty,
  query,
  list,
  loading,
  onEmptyChange,
  onListChange,
  onQueryChange,
  getListItems,
  onLoadingChange,
  ...props
}) => {
  const [internal_isEmpty, internal_setEmpty] = React.useState(isEmpty ?? true);
  const [internal_query, internal_setQuery] = React.useState(query ?? "");
  const [internal_list, internal_setList] = React.useState<any[]>(list ?? []);
  const [internal_loading, internal_setLoading] = React.useState(
    loading ?? false,
  );

  const handleQueryChange = (query: string) => {
    internal_setQuery(query);
    onQueryChange?.(query);
  };

  const handleListChange = (list: any[]) => {
    console.log("changing the list internally", list);
    internal_setList(list);
    onListChange?.(list);
  };

  const handleLoadingChange = (loading: boolean) => {
    internal_setLoading(loading);
    onLoadingChange?.(loading);
  };

  const handleGetListItems = getListItems ?? (() => Promise.resolve([]));

  const handleEmptyChange = (isEmpty: boolean) => {
    internal_setEmpty(isEmpty);
    onEmptyChange?.(isEmpty);
  };

  React.useEffect(() => {
    internal_query &&
      handleGetListItems(internal_query).then((res) => {
        handleListChange(res);
        handleLoadingChange(false);
      });
    internal_query && handleLoadingChange(true);

    !internal_query && handleLoadingChange(false);
    !internal_query && handleListChange([]);
  }, [internal_query]);

  React.useEffect(() => {
    internal_setEmpty(isEmpty ?? true);
  }, [isEmpty]);

  React.useEffect(() => {
    internal_setLoading(loading ?? false);
  }, [loading]);

  React.useEffect(() => {
    internal_setList(list ?? []);
  }, [list]);

  React.useEffect(() => {
    handleEmptyChange(internal_list.length === 0 || internal_loading);
  }, [internal_list, internal_loading]);

  return (
    <SearchComboContext.Provider
      value={{
        isEmpty: internal_isEmpty,
        query: internal_query,
        list: internal_list,
        loading: internal_loading,
        onEmptyChange: handleEmptyChange,
        onQueryChange: handleQueryChange,
        onListChange: handleListChange,
        getListItems: handleGetListItems,
        onLoadingChange: handleLoadingChange,
      }}
    >
      <Popover {...props}>{children}</Popover>
    </SearchComboContext.Provider>
  );
};

const SearchComboTrigger: React.FC<
  React.ComponentProps<typeof PopoverTrigger>
> = ({ children, ...props }) => {
  return <PopoverTrigger {...props}>{children}</PopoverTrigger>;
};

const SearchComboContent: React.FC<
  React.ComponentProps<typeof PopoverContent>
> = ({ className, ...props }) => {
  return (
    <PopoverContent
      className={cn("min-w-[var(--radix-popper-anchor-width)] p-0", className)}
      {...props}
    />
  );
};

const SearchComboEmpty: React.FC<
  Omit<React.ComponentProps<"div">, "children"> & {
    children?: (state: SearchComboContextProps) => React.ReactNode;
  }
> = ({ className, ...props }) => {
  const state = useSearchComboProvider();
  return (
    <div
      className={cn(
        "p-5 flex justify-center items-center",
        !state.isEmpty && "hidden",
        className,
      )}
      {...props}
    >
      {props.children?.(state)}
    </div>
  );
};

const SearchComboInput: React.FC<React.ComponentProps<typeof Input>> = ({
  className,
  value,
  onChange,
  ...props
}) => {
  const state = useSearchComboProvider();
  const [internal_value, internal_setValue] = React.useState(
    value || state.query || "",
  );
  const deboundedValue = useDebounce(internal_value, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    internal_setValue(e.target.value);
    onChange?.(e);
  };

  React.useEffect(() => {
    state.onQueryChange(deboundedValue as string);
  }, [deboundedValue]);

  React.useEffect(() => {
    if (value !== undefined && value !== internal_value) {
      internal_setValue(value);
    }
  }, [value]);
  return (
    <div className="w-full relative border-b">
      <Input
        className="focus-visible:ring-0 pl-7 text-muted-foreground border-0"
        value={internal_value}
        onChange={handleChange}
        {...props}
      />
      <Search className="absolute left-2 top-1/2 -translate-y-1/2" size={14} />
    </div>
  );
};

const SearchComboList: React.FC<
  Omit<React.ComponentProps<"div">, "children"> & {
    children?: (state: SearchComboContextProps) => React.ReactNode;
  }
> = ({ className, children, ...props }) => {
  const state = useSearchComboProvider();
  return (
    <div
      className={cn(
        "w-full space-y-1 p-1",
        state.isEmpty && "hidden",
        className,
      )}
      {...props}
    >
      {children?.(state)}
    </div>
  );
};

const SearchComboListItem: React.FC<React.ComponentProps<"div">> = ({
  children,
  className,
  ...props
}) => {
  return (
    <PopoverClose className="block w-full">
      <div
        className={cn(
          "flex flex-col justify-between items-start gap-1",
          "p-2 hover:bg-muted cursor-pointer rounded text-left",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </PopoverClose>
  );
};

const SearchComboListItemTitle: React.FC<React.ComponentProps<"h2">> = ({
  children,
  className,
  ...props
}) => {
  return (
    <h2 className={cn("w-full font-normal", className)} {...props}>
      {children}
    </h2>
  );
};

const SearchComboListItemDescription: React.FC<React.ComponentProps<"p">> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p
      className={cn("w-full text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
};

export {
  SearchCombo,
  SearchComboTrigger,
  SearchComboContent,
  SearchComboEmpty,
  SearchComboInput,
  SearchComboList,
  SearchComboListItem,
  SearchComboListItemTitle,
  SearchComboListItemDescription,
};
