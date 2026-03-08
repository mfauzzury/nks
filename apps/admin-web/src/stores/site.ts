import { defineStore } from "pinia";
import { getSettings } from "@/api/cms";
import type { SettingsPayload } from "@/types";

const SITE_STORE_CACHE_KEY = "admin_site_settings_cache_v1";

type SiteCache = {
  siteTitle: string;
  titleFormat: string;
  siteIconUrl: string;
  sidebarLogoUrl: string;
  portalLogoUrl: string;
  footerText: string;
};

function getDefaultSiteState(): SiteCache {
  return {
    siteTitle: "CORRAD Xpress",
    titleFormat: "%page% | %site%",
    siteIconUrl: "",
    sidebarLogoUrl: "",
    portalLogoUrl: "",
    footerText: "",
  };
}

function readCachedSiteState(): SiteCache {
  if (typeof window === "undefined") return getDefaultSiteState();
  try {
    const raw = window.localStorage.getItem(SITE_STORE_CACHE_KEY);
    if (!raw) return getDefaultSiteState();
    const parsed = JSON.parse(raw) as Partial<SiteCache>;
    return {
      siteTitle: parsed.siteTitle || "CORRAD Xpress",
      titleFormat: parsed.titleFormat || "%page% | %site%",
      siteIconUrl: parsed.siteIconUrl || "",
      sidebarLogoUrl: parsed.sidebarLogoUrl || "",
      portalLogoUrl: parsed.portalLogoUrl || "",
      footerText: parsed.footerText || "",
    };
  } catch {
    return getDefaultSiteState();
  }
}

export const useSiteStore = defineStore("site", {
  state: () => ({
    ...readCachedSiteState(),
    initialized: false,
  }),
  actions: {
    persist() {
      if (typeof window === "undefined") return;
      const cache: SiteCache = {
        siteTitle: this.siteTitle || "CORRAD Xpress",
        titleFormat: this.titleFormat || "%page% | %site%",
        siteIconUrl: this.siteIconUrl || "",
        sidebarLogoUrl: this.sidebarLogoUrl || "",
        portalLogoUrl: this.portalLogoUrl || "",
        footerText: this.footerText || "",
      };
      window.localStorage.setItem(SITE_STORE_CACHE_KEY, JSON.stringify(cache));
    },
    async load() {
      try {
        const res = await getSettings();
        const d = res.data;
        this.siteTitle = d.siteTitle || "CORRAD Xpress";
        this.titleFormat = d.titleFormat || "%page% | %site%";
        this.siteIconUrl = d.siteIconUrl || "";
        this.sidebarLogoUrl = d.sidebarLogoUrl || "";
        this.portalLogoUrl = d.portalLogoUrl || "";
        this.footerText = d.footerText || "";
      } catch {
        // Keep cached/current values if loading fails.
      } finally {
        this.initialized = true;
        this.persist();
      }
    },
    applyFrom(payload: SettingsPayload) {
      this.siteTitle = payload.siteTitle || "CORRAD Xpress";
      this.titleFormat = payload.titleFormat || "%page% | %site%";
      this.siteIconUrl = payload.siteIconUrl || "";
      this.sidebarLogoUrl = payload.sidebarLogoUrl || "";
      this.portalLogoUrl = payload.portalLogoUrl || "";
      this.footerText = payload.footerText || "";
      this.persist();
    },
    setDocumentTitle(pageTitle: string) {
      document.title = this.titleFormat
        .replace("%page%", pageTitle)
        .replace("%site%", this.siteTitle);
    },
  },
});
