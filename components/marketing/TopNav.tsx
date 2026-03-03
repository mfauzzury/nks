import Link from "next/link";

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1f4ed8] text-sm font-bold text-white">NKS</div>
          <div>
            <p className="text-sm font-semibold text-slate-900">NKS Digital Zakat</p>
            <p className="text-xs text-slate-500">Portal Pembayar</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/zakat-types" className="hover:text-slate-900">Jenis Zakat</Link>
          <Link href="/about" className="hover:text-slate-900">Tentang</Link>
          <Link href="/contact" className="hover:text-slate-900">Hubungi</Link>
          <Link href="/portal/login" className="rounded-lg bg-[#1f4ed8] px-4 py-2 text-white transition hover:bg-[#1a42ba]">Log Masuk</Link>
        </nav>
      </div>
    </header>
  );
}
