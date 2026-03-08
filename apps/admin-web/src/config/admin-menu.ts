import type { Component } from "vue";
import {
  AlertTriangle,
  BarChart3,
  Braces,
  FileUp,
  Layers,
  Plug,
  RefreshCw,
  Users,
  Database,
  FileText,
  Gauge,
  Image,
  LayoutGrid,
  Menu,
  Settings,
  Wallet,
} from "lucide-vue-next";

export type MenuChild = {
  label: string;
  to: string;
};

export type MenuItemDef = {
  id: string;
  label: string;
  to: string;
  icon: Component;
  children?: MenuChild[];
  /** Required permission to see this item. Omit = visible to all authenticated users. */
  permission?: string;
};

export type MenuGroupDef = {
  id: string;
  label: string;
  items: MenuItemDef[];
};

export type AdminMenuPrefs = {
  groupOrder: string[];
  itemOrder: Record<string, string[]>;
  hidden: string[];
  hiddenGroups: string[];
};

export const DEFAULT_MENU: MenuGroupDef[] = [
  {
    id: "dashboard",
    label: "",
    items: [
      { id: "main-dashboard", label: "Dashboard", to: "/", icon: Gauge },
    ],
  },
  {
    id: "profil-pembayar",
    label: "Profil Pembayar",
    items: [
      {
        id: "pembayar-individu",
        label: "Individu",
        to: "/payers/individual/list",
        icon: Users,
        permission: "users.view",
        children: [
          { label: "Senarai", to: "/payers/individual/list" },
          { label: "Daftar Baru", to: "/payers/individual/new" },
        ],
      },
      {
        id: "pembayar-korporat",
        label: "Korporat/Syarikat",
        to: "/payers/corporate/list",
        icon: Users,
        permission: "users.view",
        children: [
          { label: "Senarai", to: "/payers/corporate/list" },
          { label: "Daftar Baru", to: "/payers/corporate/new" },
        ],
      },
    ],
  },
  {
    id: "spg",
    label: "Skim Potongan Gaji (SPG)",
    items: [
      {
        id: "spg-majikan",
        label: "Majikan SPG",
        to: "/payers/spg/list",
        icon: Users,
        permission: "users.view",
        children: [
          { label: "Senarai", to: "/payers/spg/list" },
          { label: "Daftar Baru", to: "/payers/spg/new" },
        ],
      },
      {
        id: "spg-semakan-bayaran",
        label: "Semakan Bayaran",
        to: "/spg/payments/pending",
        icon: Wallet,
      },
    ],
  },
  {
    id: "portal",
    label: "Portal",
    items: [
      { id: "dashboard", label: "Portal Dashboard", to: "/portal/dashboard", icon: Gauge, permission: "posts.view" },
      {
        id: "duplicates",
        label: "Duplicate Cases",
        to: "/duplicates",
        icon: Users,
        permission: "posts.view",
        children: [{ label: "Case List", to: "/duplicates" }],
      },
      {
        id: "posts",
        label: "Posts",
        to: "/posts",
        icon: FileText,
        permission: "posts.view",
        children: [
          { label: "All Posts", to: "/posts" },
          { label: "Add New", to: "/posts/new" },
          { label: "Categories", to: "/categories" },
        ],
      },
      {
        id: "pages",
        label: "Pages",
        to: "/pages",
        icon: FileText,
        permission: "pages.view",
        children: [
          { label: "All Pages", to: "/pages" },
          { label: "Add New", to: "/pages/new" },
        ],
      },
      {
        id: "media",
        label: "Media",
        to: "/media",
        icon: Image,
        permission: "media.view",
        children: [{ label: "Library", to: "/media" }],
      },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    items: [
      { id: "menus", label: "Menus", to: "/menus", icon: Menu, permission: "menus.view" },
      {
        id: "settings",
        label: "Settings",
        to: "/settings",
        icon: Settings,
        permission: "settings.view",
        children: [
          { label: "General", to: "/settings" },
          { label: "Users", to: "/settings/users" },
          { label: "Roles", to: "/settings/roles" },
          { label: "System", to: "/settings/system" },
        ],
      },
    ],
  },
  {
    id: "integration-3rd-party",
    label: "Integration 3rd Party",
    items: [
      {
        id: "integration-overview",
        label: "Overview",
        to: "/integration/3rd-party",
        icon: Plug,
        permission: "integration.view",
      },
      {
        id: "integration-file-upload",
        label: "File Upload",
        to: "/integration/3rd-party/file-upload",
        icon: FileUp,
        permission: "integration.upload",
      },
      {
        id: "integration-batch-processing",
        label: "Batch Processing",
        to: "/integration/3rd-party/batch-processing",
        icon: Layers,
        permission: "integration.process",
      },
      {
        id: "integration-reconciliation",
        label: "Reconciliation",
        to: "/integration/3rd-party/reconciliation",
        icon: RefreshCw,
        permission: "integration.reconcile",
      },
      {
        id: "integration-exceptions",
        label: "Exceptions",
        to: "/integration/3rd-party/exceptions",
        icon: AlertTriangle,
        permission: "integration.exceptions",
      },
      {
        id: "integration-reports",
        label: "Reports",
        to: "/integration/3rd-party/reports",
        icon: BarChart3,
        permission: "integration.reports",
      },
    ],
  },
  {
    id: "kutipan-kaunter",
    label: "Kutipan Kaunter",
    items: [
      { id: "counter-payments", label: "Senarai Kutipan", to: "/counter/payments", icon: Wallet },
      { id: "counter-deposits", label: "Konsolidasi Bank-In", to: "/counter/deposits", icon: Wallet },
      { id: "counter-reconciliation", label: "Rekonsiliasi Bank", to: "/counter/reconciliation", icon: Wallet },
    ],
  },
  {
    id: "zakat-configuration",
    label: "Konfigurasi Zakat",
    items: [
      {
        id: "zakat-types",
        label: "Jenis Zakat",
        to: "/zakat-config/types",
        icon: FileText,
        permission: "settings.view",
      },
      {
        id: "zakat-payment-gateways",
        label: "Gerbang Pembayaran",
        to: "/zakat-config/payment-gateways",
        icon: Settings,
        permission: "settings.view",
      },
      {
        id: "zakat-source-categories",
        label: "Kategori Sumber",
        to: "/zakat-config/source-categories",
        icon: Layers,
        permission: "settings.view",
      },
      {
        id: "zakat-source-data",
        label: "Sumber Data",
        to: "/zakat-config/source-data",
        icon: Database,
        permission: "settings.view",
      },
      {
        id: "amil",
        label: "Amil",
        to: "/integration/3rd-party/amil",
        icon: Users,
        permission: "settings.view",
        children: [
          { label: "Senarai", to: "/integration/3rd-party/amil" },
          { label: "Daftar Baru", to: "/integration/3rd-party/amil/new" },
        ],
      },
    ],
  },
  {
    id: "development",
    label: "Development",
    items: [
      { id: "database-schema", label: "Database Schema", to: "/development/database-schema", icon: Database, permission: "roles.view" },
      { id: "api-management", label: "API Management", to: "/development/api-management", icon: Braces, permission: "roles.view" },
      {
        id: "kitchen-sink",
        label: "Kitchen Sink",
        to: "/kitchen-sink",
        icon: LayoutGrid,
        permission: "roles.view",
        children: [
          { label: "Components", to: "/kitchen-sink" },
          { label: "Forms", to: "/kitchen-sink/forms" },
          { label: "Charts", to: "/kitchen-sink/charts" },
        ],
      },
    ],
  },
];
