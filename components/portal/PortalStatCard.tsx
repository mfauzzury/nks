import type { LucideIcon } from "lucide-react";

export function PortalStatCard({
  label,
  value,
  help,
  icon: Icon,
}: {
  label: string;
  value: string;
  help: string;
  icon: LucideIcon;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <Icon className="h-4 w-4 text-[#1f4ed8]" />
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{help}</p>
    </article>
  );
}
