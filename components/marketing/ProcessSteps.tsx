const steps = [
  {
    title: "Pilih jenis zakat",
    desc: "Pilih jenis zakat dan semak konfigurasi kadar terkini sebelum pembayaran.",
  },
  {
    title: "Bayar secara digital",
    desc: "Lengkapkan pembayaran melalui gerbang yang disediakan dengan pengesahan segera.",
  },
  {
    title: "Terima resit & urus rekod",
    desc: "Cetak/muat turun resit dan daftar akaun untuk pengurusan rekod jangka panjang.",
  },
];

export function ProcessSteps() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-[#0f172a] p-7 text-white md:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9fb6ff]">Aliran Pembayaran</p>
      <h2 className="mt-2 text-2xl font-semibold md:text-3xl">3 langkah mudah untuk urusan zakat</h2>
      <div className="mt-7 grid gap-4 md:grid-cols-3">
        {steps.map((step, idx) => (
          <div key={step.title} className="rounded-2xl border border-white/15 bg-white/5 p-4">
            <p className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1f4ed8] text-xs font-semibold">
              {idx + 1}
            </p>
            <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-200">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
