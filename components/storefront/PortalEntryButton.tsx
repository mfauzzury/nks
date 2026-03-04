"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { useState } from "react";
import { getPortalSession } from "@/lib/portal-session";

type PortalEntryButtonProps = {
  className: string;
  loggedInLabel?: string;
  loggedOutLabel?: string;
  onClick?: () => void;
  children?: ReactNode;
};

export function PortalEntryButton({
  className,
  loggedInLabel = "Masuk Portal",
  loggedOutLabel = "Log Masuk",
  onClick,
  children,
}: PortalEntryButtonProps) {
  const [hasSession] = useState(() => (typeof window !== "undefined" ? Boolean(getPortalSession()) : false));

  return (
    <Link href={hasSession ? "/portal" : "/portal/login"} onClick={onClick} className={className}>
      {children}
      {hasSession ? loggedInLabel : loggedOutLabel}
    </Link>
  );
}
