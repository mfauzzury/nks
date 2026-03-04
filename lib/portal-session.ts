export type PortalSession = {
  payerId: number;
  payerCode: string;
  payerType: string;
  displayName: string;
  identityNo: string | null;
  email: string | null;
  companyName: string | null;
};

const SESSION_KEY = "payer";
const SESSION_EVENT = "portal-session-change";
let cachedRaw: string | null | undefined;
let cachedSnapshot: PortalSession | null = null;

export function getPortalSession(): PortalSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(SESSION_KEY);
  if (raw === cachedRaw) return cachedSnapshot;

  cachedRaw = raw;
  if (!raw) {
    cachedSnapshot = null;
    return cachedSnapshot;
  }

  try {
    const parsed = JSON.parse(raw) as PortalSession;
    cachedSnapshot = parsed?.payerId && parsed?.payerType ? parsed : null;
  } catch {
    cachedSnapshot = null;
  }
  return cachedSnapshot;
}

export function savePortalSession(session: PortalSession) {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(session);
  window.sessionStorage.setItem(SESSION_KEY, raw);
  cachedRaw = raw;
  cachedSnapshot = session;
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function clearPortalSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_KEY);
  cachedRaw = null;
  cachedSnapshot = null;
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function resolvePortalDashboard(payerType: string) {
  return payerType === "individu"
    ? "/portal/individual/dashboard"
    : "/portal/corporate/dashboard";
}

export function subscribePortalSession(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(SESSION_EVENT, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(SESSION_EVENT, handler);
  };
}
