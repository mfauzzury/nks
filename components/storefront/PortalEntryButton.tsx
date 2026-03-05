"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { usePortalSession } from "@/lib/use-portal-session";

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
  const hasSession = Boolean(usePortalSession());

  return (
    <Link href={hasSession ? "/portal" : "/portal/login"} onClick={onClick} className={className}>
      {children}
      {hasSession ? loggedInLabel : loggedOutLabel}
    </Link>
  );
}
