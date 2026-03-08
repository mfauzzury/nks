import Link from "next/link";
import { ArrowRight, CreditCard, LogIn } from "lucide-react";
import { PortalEntryButton } from "@/components/storefront/PortalEntryButton";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#d9c7ff] bg-linear-to-br from-[#f8f5ff] via-white to-[#f3eeff] p-8 md:p-12">
      <div className="pointer-events-none absolute -right-24 -top-20 h-64 w-64 rounded-full bg-[#E26EE5]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[#7E30E1]/10 blur-3xl" />
      <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7E30E1]">NKS Digital Zakat</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-[#0f172a] md:text-5xl">
            Platform zakat korporat dan individu yang telus, cepat, dan dipercayai.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-slate-600 md:text-lg">
            Urus bayaran zakat, rekod sumbangan, dan skim potongan gaji (SPG) dalam satu platform moden yang
            mesra pengguna.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <PortalEntryButton className="inline-flex items-center gap-2 rounded-xl bg-[#7E30E1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6b28c0]">
              <LogIn className="h-4 w-4" />
            </PortalEntryButton>
            <Link
              href="/payer/individual/pay"
              className="inline-flex items-center gap-2 rounded-xl border border-[#7E30E1]/30 bg-white px-5 py-3 text-sm font-semibold text-[#7E30E1] transition hover:border-[#7E30E1]"
            >
              <CreditCard className="h-4 w-4" />
              Bayar Sekarang
            </Link>
          </div>
          <Link href="/about" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#7E30E1] hover:underline">
            Ketahui lebih lanjut
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          <img
            src="/images/malaysian-muslim-hero.jpg"
            alt="Keluarga Muslim bersama sebagai gambaran komuniti pembayar zakat"
            className="h-[320px] w-full object-cover md:h-[420px]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                ["1 Platform", "Individu, Korporat, SPG"],
                ["Resit Digital", "Cetak dan muat turun PDF"],
                ["Jejak Audit", "Rekod status teratur"],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-lg border border-white/20 bg-white/90 px-3 py-2">
                  <p className="text-xs font-semibold text-slate-900">{title}</p>
                  <p className="text-xs text-slate-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
