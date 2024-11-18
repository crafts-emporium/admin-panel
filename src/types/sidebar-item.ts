import { Icon } from "./icon";

export type SidebarItem = {
  id: number;
  label: string;
  Icon: Icon;
  href: string;
  pattern?: string;
  selected: (href: string) => boolean;
};
