import Link from "next/link";

const types = [
  "ZAKAT FITRAH",
  "ZAKAT PENDAPATAN",
  "ZAKAT PERNIAGAAN",
  "ZAKAT SIMPANAN",
  "ZAKAT SAHAM",
  "ZAKAT KWSP",
  "ZAKAT EMAS",
  "ZAKAT KRIPTO",
  "ZAKAT HARTA",
  "ZAKAT TANAMAN",
  "ZAKAT PADI",
  "ZAKAT TERNAKAN",
  "FIDYAH PUASA",
  "ZAKAT PERAK",
  "QADHA ZAKAT",
];

export default function ZakatTypesPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2d4fc7]">Jenis Zakat</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Pilihan jenis bayaran yang disokong</h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          Kadar dan konfigurasi dikemaskini mengikut tetapan semasa. Untuk membuat bayaran, gunakan aliran pembayaran individu atau portal korporat.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {types.map((name) => (
          <div key={name} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
            {name}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
        Ingin teruskan? Pergi ke{" "}
        <Link href="/payer/individual/pay" className="font-semibold text-[#1f4ed8] hover:underline">bayaran individu</Link>
        {" "}atau{" "}
        <Link href="/portal/login" className="font-semibold text-[#1f4ed8] hover:underline">masuk portal</Link>.
      </div>
    </section>
  );
}
