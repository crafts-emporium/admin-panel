import { SidebarItem } from "@/types/sidebar-item";
import {
  Amphora,
  BadgeDollarSign,
  BedDouble,
  LayoutDashboard,
  UsersRound,
  Utensils,
} from "lucide-react";
import micromatch from "micromatch";

export const sidebarItems: SidebarItem[] = [
  {
    id: 1,
    label: "Dashboard",
    href: "/",
    Icon: LayoutDashboard,
    selected: function (href: string) {
      return this.href === href;
    },
  },
  {
    id: 2,
    label: "Customers",
    href: "/customers",
    Icon: UsersRound,
    pattern: "/customers/**",
    selected: function (href: string) {
      return micromatch.isMatch(href, this.pattern!);
    },
  },
  {
    id: 3,
    label: "Products",
    Icon: Amphora,
    href: "/products",
    pattern: "/products/**",
    selected: function (href: string) {
      return micromatch.isMatch(href, this.pattern!);
    },
  },
  {
    id: 4,
    label: "Sales",
    href: "/sales",
    Icon: BadgeDollarSign,
    pattern: "/sales/**",
    selected: function (href: string) {
      return micromatch.isMatch(href, this.pattern!);
    },
  },
];
