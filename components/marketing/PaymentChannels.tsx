import { Building2, CreditCard, HandCoins, Landmark, Users } from "lucide-react";

const channels = [
  {
    title: "eZakatPay (FPX)",
    desc: "Bayaran atas talian masa nyata melalui perbankan internet untuk individu dan syarikat.",
    href: "https://fpx.zakatselangor.com.my",
    icon: CreditCard,
  },
  {
    title: "Skim Potongan Gaji (SPG)",
    desc: "Potongan zakat pekerja secara bulanan melalui majikan dengan pengurusan rekod yang tersusun.",
    href: "https://espg.zakatselangor.com.my",
    icon: Users,
  },
  {
    title: "eMajikan",
    desc: "Pendaftaran majikan baharu untuk urusan zakat pekerja dan operasi potongan gaji.",
    href: "https://emajikan.zakatselangor.com.my",
    icon: Building2,
  },
  {
    title: "Direct Debit",
    desc: "Potongan automatik bulanan dari akaun bank untuk elak terlepas bayaran zakat.",
    href: "https://infaqpay.my",
    icon: HandCoins,
  },
  {
    title: "Crowdzakat",
    desc: "Tunaikan zakat mengikut jenis bantuan pilihan seperti pendidikan, kewangan, dan keperluan asas.",
    href: "https://crowdzakat.zakatselangor.com.my",
    icon: Landmark,
  },
];

const quickFacts = [
  "Transaksi bayaran online diproses secara masa nyata.",
  "Resit bayaran dikeluarkan dalam tempoh sekitar 14 hari bekerja.",
  "Pembayaran eZakatPay memerlukan akaun perbankan internet aktif.",
  "Untuk eZakatPay, had minimum bayaran lazimnya bermula dari RM10.",
];

export function PaymentChannels() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2d4fc7]">Saluran Bayaran</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">Pilihan pembayaran zakat</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Kandungan ini diringkaskan berdasarkan maklumat rasmi Lembaga Zakat Selangor untuk rujukan aliran bayaran.
          </p>
        </div>
        <a
          href="https://www.zakatselangor.com.my/bayar-zakat/"
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-[#1f4ed8] hover:underline"
        >
          Lihat halaman rujukan
        </a>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {channels.map((item) => (
          <a
            key={item.title}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-[#1f4ed8]/30 hover:bg-white hover:shadow-sm"
          >
            <item.icon className="h-7 w-7 text-[#1f4ed8]" />
            <h3 className="mt-3 text-base font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{item.desc}</p>
            <span className="mt-3 inline-flex text-sm font-medium text-[#1f4ed8]">Buka pautan</span>
          </a>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Fakta Ringkas</p>
        <ul className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
          {quickFacts.map((fact) => (
            <li key={fact} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              {fact}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
