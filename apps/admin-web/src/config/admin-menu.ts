import type { Component } from "vue";
import {
  Braces,
  Database,
  FileText,
  Gauge,
  Image,
  LayoutGrid,
  Link2,
  Menu,
  Settings,
} from "lucide-vue-next";

export type MenuNode = {
  id: string;
  label: string;
  to: string;
  children?: MenuNode[];
};

export type MenuItemDef = MenuNode & {
  icon: Component;
};

export type MenuGroupDef = {
  id: string;
  label: string;
  items: MenuItemDef[];
};

export type AdminMenuPrefs = {
  groupOrder: string[];
  itemOrder: Record<string, string[]>;
  childOrder: Record<string, string[]>;
  grandchildOrder: Record<string, string[]>;
  hidden: string[];
  hiddenChildren: string[];
  hiddenGrandchildren: string[];
  hiddenGroups: string[];
};

export const DEFAULT_MENU: MenuGroupDef[] = [
  {
    id: "dashboard",
    label: "",
    items: [
      { id: "main-dashboard", label: "Dashboard", to: "/admin", icon: Gauge },
    ],
  },
  {
    id: "portal",
    label: "Webfront",
    items: [
      { id: "dashboard", label: "Dashboard", to: "/admin/portal/dashboard", icon: Gauge },
      {
        id: "posts",
        label: "Posts",
        to: "/admin/posts",
        icon: FileText,
        children: [
          { id: "posts-all", label: "All Posts", to: "/admin/posts" },
          { id: "posts-new", label: "Add New", to: "/admin/posts/new" },
          { id: "posts-categories", label: "Categories", to: "/admin/categories" },
        ],
      },
      {
        id: "pages",
        label: "Pages",
        to: "/admin/pages",
        icon: FileText,
        children: [
          { id: "pages-all", label: "All Pages", to: "/admin/pages" },
          { id: "pages-new", label: "Add New", to: "/admin/pages/new" },
        ],
      },
      {
        id: "media",
        label: "Media",
        to: "/admin/media",
        icon: Image,
        children: [{ id: "media-library", label: "Library", to: "/admin/media" }],
      },
      { id: "storefront-menu", label: "Menus", to: "/admin/webfront-menu", icon: Link2 },
      { id: "webfront-settings", label: "Settings", to: "/admin/webfront-settings", icon: Settings },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    items: [
      { id: "menus", label: "Menus", to: "/admin/menus", icon: Menu },
      {
        id: "settings",
        label: "Settings",
        to: "/admin/settings",
        icon: Settings,
        children: [
          { id: "settings-general", label: "General", to: "/admin/settings" },
          {
            id: "settings-users",
            label: "Users",
            to: "/admin/settings/users",
            children: [
              { id: "settings-users-all", label: "All Users", to: "/admin/settings/users" },
              { id: "settings-users-new", label: "Add User", to: "/admin/settings/users/new" },
            ],
          },
          { id: "settings-roles", label: "Roles", to: "/admin/settings/roles" },
          { id: "settings-system", label: "System", to: "/admin/settings/system" },
        ],
      },
    ],
  },
  {
    id: "development",
    label: "Development",
    items: [
      { id: "database-schema", label: "Database Schema", to: "/admin/development/database-schema", icon: Database },
      { id: "api-management", label: "API Management", to: "/admin/development/api-management", icon: Braces },
      {
        id: "kitchen-sink",
        label: "Kitchen Sink",
        to: "/admin/kitchen-sink",
        icon: LayoutGrid,
        children: [
          { id: "kitchen-components", label: "Components", to: "/admin/kitchen-sink" },
          { id: "kitchen-forms", label: "Forms", to: "/admin/kitchen-sink/forms" },
          { id: "kitchen-charts", label: "Charts", to: "/admin/kitchen-sink/charts" },
        ],
      },
    ],
  },
];
