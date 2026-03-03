import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

export function PortalActionTiles({
  actions,
}: {
  actions: Array<{ title: string; desc: string; href: string; icon: LucideIcon }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {actions.map((action) => (
        <Link
          key={action.title}
          href={action.href}
          className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#1f4ed8]/40 hover:shadow-lg"
        >
          <action.icon className="h-7 w-7 text-[#1f4ed8]" />
          <h3 className="mt-3 text-lg font-semibold text-slate-900">{action.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{action.desc}</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#1f4ed8]">
            Teruskan <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      ))}
    </div>
  );
}
