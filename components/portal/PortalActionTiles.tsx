import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

export function PortalActionTiles({
  actions,
  variant = "default",
}: {
  actions: Array<{ title: string; desc: string; href: string; icon: LucideIcon }>;
  variant?: "default" | "onDark";
}) {
  const isDark = variant === "onDark";

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {actions.map((action) => (
        <Link
          key={action.title}
          href={action.href}
          className={
            isDark
              ? "group rounded-2xl border border-white/20 bg-white/12 p-5 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/18"
              : "group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 portal-hover-border-secondary hover:shadow-lg"
          }
        >
          <action.icon className={isDark ? "h-7 w-7 text-yellow-200" : "h-7 w-7 portal-text-accent"} />
          <h3 className={isDark ? "mt-3 text-lg font-semibold text-white" : "mt-3 text-lg font-semibold text-slate-900"}>{action.title}</h3>
          <p className={isDark ? "mt-1 text-sm text-yellow-100/85" : "mt-1 text-sm text-slate-600"}>{action.desc}</p>
          <span className={isDark ? "mt-4 inline-flex items-center gap-2 text-sm font-medium text-yellow-200" : "mt-4 inline-flex items-center gap-2 text-sm font-medium portal-text-accent"}>
            Teruskan <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      ))}
    </div>
  );
}
