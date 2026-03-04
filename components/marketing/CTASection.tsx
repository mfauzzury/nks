import Link from "next/link";
import { PortalEntryButton } from "@/components/storefront/PortalEntryButton";

export function CTASection() {
  return (
    <section className="rounded-3xl border border-[#d9c7ff] bg-linear-to-r from-[#f3eeff] to-[#f8f5ff] p-8 text-center md:p-10">
      <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">Sedia untuk mula?</h2>
      <p className="mx-auto mt-3 max-w-xl text-slate-600">
        Gunakan portal untuk mengurus bayaran dan rekod anda secara teratur, atau teruskan pembayaran tetamu sekarang.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <PortalEntryButton className="rounded-xl bg-[#7E30E1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6b28c0]" />
        <Link href="/payer/individual/pay" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400">
          Bayaran Terus
        </Link>
      </div>
    </section>
  );
}
