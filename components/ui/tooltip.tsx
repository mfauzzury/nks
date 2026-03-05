import { ReactNode } from 'react';

export function Tooltip({ children, label, position = "top" }: { children: ReactNode; label: string; position?: "top" | "bottom" }) {
  return (
    <div className="relative group/tip">
      {children}
      <span className={`absolute left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium bg-white text-gray-700 border border-gray-200 rounded shadow-sm opacity-0 group-hover/tip:opacity-100 transition-opacity duration-75 pointer-events-none whitespace-nowrap z-50 ${position === "bottom" ? "top-full mt-1.5" : "bottom-full mb-1.5"}`}>
        {label}
      </span>
    </div>
  );
}
