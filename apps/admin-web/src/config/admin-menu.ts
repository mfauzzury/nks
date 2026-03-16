import type { Component } from "vue";
import {
  AlertTriangle,
  BarChart3,
  Banknote,
  Braces,
  CalendarClock,
  Database,
  FileUp,
  FileText,
  Gauge,
  Image,
  LayoutGrid,
  Layers,
  Link2,
  Menu,
  Plug,
  RefreshCw,
  Settings,
  Users,
  Wallet,
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
        children: [
          { id: "pembayar-individu-list", label: "Senarai", to: "/payers/individual/list" },
          { id: "pembayar-individu-new", label: "Daftar Baru", to: "/payers/individual/new" },
        ],
      },
      {
        id: "pembayar-korporat",
        label: "Korporat/Syarikat",
        to: "/payers/corporate/list",
        icon: Users,
        children: [
          { id: "pembayar-korporat-list", label: "Senarai", to: "/payers/corporate/list" },
          { id: "pembayar-korporat-new", label: "Daftar Baru", to: "/payers/corporate/new" },
        ],
      },
      {
        id: "account-merge",
        label: "Account Merge",
        to: "/reconciliation/account-merge",
        icon: Users,
        children: [
          { id: "account-merge-queue", label: "Queue", to: "/reconciliation/account-merge/queue" },
          { id: "account-merge-detection", label: "Detection & Merge", to: "/reconciliation/account-merge" },
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
        children: [
          { id: "spg-majikan-list", label: "Senarai", to: "/payers/spg/list" },
          { id: "spg-majikan-new", label: "Daftar Baru", to: "/payers/spg/new" },
        ],
      },
      { id: "spg-semakan-bayaran", label: "Semakan Bayaran", to: "/spg/payments/pending", icon: Wallet },
    ],
  },
  {
    id: "portal",
    label: "Webfront",
    items: [
      { id: "dashboard", label: "Dashboard", to: "/portal/dashboard", icon: Gauge },
      {
        id: "duplicates",
        label: "Duplicate Cases",
        to: "/duplicates",
        icon: Users,
        children: [{ id: "duplicates-list", label: "Case List", to: "/duplicates" }],
      },
      {
        id: "posts",
        label: "Posts",
        to: "/posts",
        icon: FileText,
        children: [
          { id: "posts-all", label: "All Posts", to: "/posts" },
          { id: "posts-new", label: "Add New", to: "/posts/new" },
          { id: "posts-categories", label: "Categories", to: "/categories" },
        ],
      },
      {
        id: "pages",
        label: "Pages",
        to: "/pages",
        icon: FileText,
        children: [
          { id: "pages-all", label: "All Pages", to: "/pages" },
          { id: "pages-new", label: "Add New", to: "/pages/new" },
        ],
      },
      {
        id: "media",
        label: "Media",
        to: "/media",
        icon: Image,
        children: [{ id: "media-library", label: "Library", to: "/media" }],
      },
    ],
  },
  {
    id: "counter",
    label: "Kutipan Kaunter",
    items: [
      { id: "counter-payments", label: "Senarai Kutipan", to: "/counter/payments", icon: Banknote },
      { id: "counter-desk", label: "Counter Desk", to: "/counter/desk", icon: LayoutGrid },
      { id: "counter-pos", label: "POS Kaunter", to: "/counter/pos", icon: Gauge },
      { id: "counter-deposits", label: "Konsolidasi Bank-In", to: "/counter/deposits", icon: Database },
      { id: "counter-reconciliation", label: "Rekonsiliasi Bank", to: "/counter/reconciliation", icon: Link2 },
      { id: "scheduled-payments", label: "Penjadualan Bayaran", to: "/scheduled-payments", icon: CalendarClock },
    ],
  },
  {
    id: "zakat-configuration",
    label: "Konfigurasi Zakat",
    items: [
      { id: "zakat-types", label: "Jenis Zakat", to: "/zakat-config/types", icon: FileText },
      { id: "zakat-payment-gateways", label: "Gerbang Pembayaran", to: "/zakat-config/payment-gateways", icon: Settings },
      { id: "zakat-source-categories", label: "Kategori Sumber", to: "/zakat-config/source-categories", icon: Layers },
      { id: "zakat-source-data", label: "Sumber Data", to: "/zakat-config/source-data", icon: Database },
      {
        id: "amil",
        label: "Amil",
        to: "/integration/3rd-party/amil",
        icon: Users,
        children: [
          { id: "amil-list", label: "Senarai", to: "/integration/3rd-party/amil" },
        ],
      },
    ],
  },
  {
    id: "integration-3rd-party",
    label: "Integration 3rd Party",
    items: [
      { id: "integration-overview", label: "Overview", to: "/integration/3rd-party", icon: Plug },
      { id: "integration-file-upload", label: "File Upload", to: "/integration/3rd-party/file-upload", icon: FileUp },
      { id: "integration-batch-processing", label: "Batch Processing", to: "/integration/3rd-party/batch-processing", icon: Layers },
      { id: "integration-reconciliation", label: "Reconciliation", to: "/integration/3rd-party/reconciliation", icon: RefreshCw },
      { id: "integration-exceptions", label: "Exceptions", to: "/integration/3rd-party/exceptions", icon: AlertTriangle },
      { id: "integration-reports", label: "Reports", to: "/integration/3rd-party/reports", icon: BarChart3 },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    items: [
      { id: "menus", label: "Menus", to: "/menus", icon: Menu },
      {
        id: "settings",
        label: "Settings",
        to: "/settings",
        icon: Settings,
        children: [
          { id: "settings-general", label: "General", to: "/settings" },
          {
            id: "settings-users",
            label: "Users",
            to: "/settings/users",
            children: [
              { id: "settings-users-all", label: "All Users", to: "/settings/users" },
              { id: "settings-users-new", label: "Add User", to: "/settings/users/new" },
            ],
          },
          { id: "settings-roles", label: "Roles", to: "/settings/roles" },
          { id: "settings-system", label: "System", to: "/settings/system" },
        ],
      },
    ],
  },
  {
    id: "development",
    label: "Development",
    items: [
      { id: "database-schema", label: "Database Schema", to: "/development/database-schema", icon: Database },
      { id: "api-management", label: "API Management", to: "/development/api-management", icon: Braces },
      {
        id: "kitchen-sink",
        label: "Kitchen Sink",
        to: "/kitchen-sink",
        icon: LayoutGrid,
        children: [
          { id: "kitchen-components", label: "Components", to: "/kitchen-sink" },
          { id: "kitchen-forms", label: "Forms", to: "/kitchen-sink/forms" },
          { id: "kitchen-charts", label: "Charts", to: "/kitchen-sink/charts" },
        ],
      },
    ],
  },
];
