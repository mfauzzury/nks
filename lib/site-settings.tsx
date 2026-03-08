"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export type SiteSettings = {
  siteTitle: string;
  tagline: string;
  portalLogoUrl: string;
  siteIconUrl: string;
  footerText: string;
};

const defaultSettings: SiteSettings = {
  siteTitle: "",
  tagline: "",
  portalLogoUrl: "",
  siteIconUrl: "",
  footerText: "",
};

const SiteSettingsContext = createContext<SiteSettings>(defaultSettings);

export function resolveAssetUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/settings`)
      .then((res) => res.json())
      .then((json) => {
        const d = json.data || json;
        setSettings({
          siteTitle: d.siteTitle || "",
          tagline: d.tagline || "",
          portalLogoUrl: d.portalLogoUrl || "",
          siteIconUrl: d.siteIconUrl || "",
          footerText: d.footerText || "",
        });
      })
      .catch(() => {});
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
