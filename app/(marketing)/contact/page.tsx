export default function ContactPage() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2d4fc7]">Hubungi Kami</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Kami sedia membantu urusan anda</h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            Untuk pertanyaan berkaitan pembayaran, portal, atau pendaftaran organisasi, hubungi saluran rasmi di bawah.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <img
            src="/images/malaysian-muslim-contact.jpg"
            alt="Khidmat pelanggan"
            className="h-56 w-full object-cover lg:h-full"
          />
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-lg font-semibold text-slate-900">Pusat Bantuan</h2>
          <p className="mt-3 text-sm text-slate-600">Emel: bantuan@nks.my</p>
          <p className="mt-1 text-sm text-slate-600">Telefon: +60 3-8000 1234</p>
          <p className="mt-1 text-sm text-slate-600">Waktu operasi: Isnin - Jumaat, 8:30 pagi - 5:30 petang</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-lg font-semibold text-slate-900">Pejabat Operasi</h2>
          <p className="mt-3 text-sm text-slate-600">NKS Digital Zakat</p>
          <p className="text-sm text-slate-600">Aras 10, Menara Integriti</p>
          <p className="text-sm text-slate-600">Presint 2, 62000 Putrajaya</p>
        </article>
      </div>
    </section>
  );
}
