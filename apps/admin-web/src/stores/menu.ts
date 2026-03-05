import { defineStore } from "pinia";
import { DEFAULT_MENU, type AdminMenuPrefs, type MenuGroupDef, type MenuItemDef } from "@/config/admin-menu";
import { getAdminMenuPrefs, saveAdminMenuPrefs } from "@/api/cms";
import { useAuthStore } from "@/stores/auth";

function mergePrefsWithDefaults(prefs: AdminMenuPrefs): AdminMenuPrefs {
  const allGroupIds = DEFAULT_MENU.map((g) => g.id);
  const groupOrder = [...(prefs.groupOrder || [])];
  for (const gid of allGroupIds) {
    if (!groupOrder.includes(gid)) groupOrder.push(gid);
  }
  const itemOrder: Record<string, string[]> = { ...(prefs.itemOrder || {}) };
  for (const group of DEFAULT_MENU) {
    const allItemIds = group.items.map((i) => i.id);
    const saved = itemOrder[group.id] || [];
    const merged = [...saved];
    for (const iid of allItemIds) {
      if (!merged.includes(iid)) merged.push(iid);
    }
    itemOrder[group.id] = merged.filter((iid) => allItemIds.includes(iid));
  }
  return {
    groupOrder: groupOrder.filter((gid) => allGroupIds.includes(gid)),
    itemOrder,
    hidden: (prefs.hidden || []).filter((id) =>
      DEFAULT_MENU.some((g) => g.items.some((i) => i.id === id)),
    ),
    hiddenGroups: (prefs.hiddenGroups || []).filter((gid) => allGroupIds.includes(gid)),
  };
}

function resolveMenu(prefs: AdminMenuPrefs | null): MenuGroupDef[] {
  if (!prefs) return DEFAULT_MENU;

  const merged = mergePrefsWithDefaults(prefs);
  const groupMap = new Map(DEFAULT_MENU.map((g) => [g.id, g]));
  const ordered: MenuGroupDef[] = [];

  for (const gid of merged.groupOrder) {
    if (groupMap.has(gid)) {
      ordered.push(groupMap.get(gid)!);
      groupMap.delete(gid);
    }
  }
  for (const g of groupMap.values()) {
    const defaultIdx = DEFAULT_MENU.findIndex((dg) => dg.id === g.id);
    let insertAt = 0;
    for (let i = 0; i < ordered.length; i++) {
      const orderedIdx = DEFAULT_MENU.findIndex((dg) => dg.id === ordered[i].id);
      if (orderedIdx < defaultIdx) insertAt = i + 1;
    }
    ordered.splice(insertAt, 0, g);
  }

  const hiddenGroups = merged.hiddenGroups || [];

  return ordered
    .filter((g) => !hiddenGroups.includes(g.id))
    .map((group) => {
      const itemMap = new Map(group.items.map((i) => [i.id, i]));
      const sortedItems: typeof group.items = [];
      const itemOrderList = merged.itemOrder[group.id] || [];

      for (const iid of itemOrderList) {
        if (itemMap.has(iid)) {
          sortedItems.push(itemMap.get(iid)!);
          itemMap.delete(iid);
        }
      }
      for (const i of itemMap.values()) sortedItems.push(i);

      return {
        ...group,
        items: sortedItems.filter((i) => !(merged.hidden || []).includes(i.id)),
      };
    })
    .filter((g) => g.items.length > 0);
}

function canSeeMenuItem(item: MenuItemDef, permissions: string[] | undefined): boolean {
  if (!item.permission) return true;
  if (!permissions) return false;
  return permissions.includes(item.permission);
}

function filterMenuByPermissions(menu: MenuGroupDef[]): MenuGroupDef[] {
  const auth = useAuthStore();
  const permissions = auth.user?.permissions;

  return menu
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canSeeMenuItem(item, permissions)),
    }))
    .filter((g) => g.items.length > 0);
}

export const useMenuStore = defineStore("menu", {
  state: () => ({
    prefs: null as AdminMenuPrefs | null,
    initialized: false,
  }),
  getters: {
    resolvedMenu(): MenuGroupDef[] {
      const menu = resolveMenu(this.prefs);
      return filterMenuByPermissions(menu);
    },
  },
  actions: {
    async load() {
      if (this.initialized) return;
      try {
        const res = await getAdminMenuPrefs();
        this.prefs = res.data;
      } catch {
        // use defaults
      }
      this.initialized = true;
    },
    async save(prefs: AdminMenuPrefs) {
      await saveAdminMenuPrefs(prefs);
      this.prefs = prefs;
    },
  },
});
