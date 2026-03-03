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

export function getPortalSession(): PortalSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PortalSession;
    if (!parsed?.payerId || !parsed?.payerType) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePortalSession(session: PortalSession) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearPortalSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_KEY);
}

export function resolvePortalDashboard(payerType: string) {
  return payerType === "individu"
    ? "/portal/individual/dashboard"
    : "/portal/corporate/dashboard";
}
