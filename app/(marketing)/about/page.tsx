export default function AboutPage() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2d4fc7]">Tentang NKS</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Menyelaras urusan zakat secara digital dan berintegriti</h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            NKS dibangunkan untuk memudahkan pembayar individu dan organisasi mengurus pembayaran zakat dengan aliran
            yang jelas, rekod yang telus, serta pengalaman pengguna yang moden.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <img
            src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80"
            alt="Mesyuarat korporat"
            className="h-56 w-full object-cover lg:h-full"
          />
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ["Kepatuhan", "Proses dibina dengan fokus kepada tadbir urus dan pematuhan operasi."],
          ["Ketelusan", "Rekod, status, dan sejarah aktiviti disediakan untuk semakan yang konsisten."],
          ["Kebolehskalaan", "Sokong pertumbuhan transaksi individu, korporat, dan potongan gaji pukal."],
        ].map(([title, desc]) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="font-semibold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
