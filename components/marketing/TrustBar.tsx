export function TrustBar() {
  const items = [
    "Kepatuhan Syariah",
    "Perlindungan Data",
    "Jejak Audit Penuh",
    "Sokongan Institusi",
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Mengapa organisasi memilih NKS</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
