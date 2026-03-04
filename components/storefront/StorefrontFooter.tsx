import Link from "next/link";

export function StorefrontFooter() {
  return (
    <footer className="border-t border-purple-100 bg-[#f8fcff]/80 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 pb-8 pt-6 md:flex-row md:justify-between">
        <div>
          <p className="text-lg font-semibold text-slate-900">NKS Digital Zakat</p>
          <p className="mt-2 max-w-sm text-sm text-slate-600">Platform pengurusan pembayar zakat untuk individu, korporat dan SPG.</p>
        </div>
        <div className="grid gap-2 text-sm text-slate-600">
          <Link href="/about" className="hover:text-slate-900">Tentang Kami</Link>
          <Link href="/contact" className="hover:text-slate-900">Hubungi Kami</Link>
          <Link href="/zakat-types" className="hover:text-slate-900">Jenis Zakat</Link>
          <Link href="/portal/login" className="hover:text-slate-900">Log Masuk</Link>
        </div>
      </div>
    </footer>
  );
}
