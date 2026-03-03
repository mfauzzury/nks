import Link from "next/link";

export function CTASection() {
  return (
    <section className="rounded-3xl border border-[#c5d4ff] bg-gradient-to-r from-[#e9f0ff] to-[#f7fbff] p-8 text-center md:p-10">
      <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">Sedia untuk mula?</h2>
      <p className="mx-auto mt-3 max-w-xl text-slate-600">
        Gunakan portal untuk mengurus bayaran dan rekod anda secara teratur, atau teruskan pembayaran tetamu sekarang.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/portal/login" className="rounded-xl bg-[#1f4ed8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1a42ba]">
          Log Masuk
        </Link>
        <Link href="/payer/individual/pay" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400">
          Bayaran Terus
        </Link>
      </div>
    </section>
  );
}
