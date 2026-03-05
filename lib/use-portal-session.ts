"use client";

import { useSyncExternalStore } from "react";
import { getPortalSession, subscribePortalSession, type PortalSession } from "@/lib/portal-session";

export function usePortalSession(): PortalSession | null {
  return useSyncExternalStore(subscribePortalSession, getPortalSession, () => null);
}
