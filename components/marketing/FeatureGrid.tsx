import Link from "next/link";
import { Building2, HandCoins, Users } from "lucide-react";

const features = [
  {
    title: "Individu",
    desc: "Bayar terus sebagai tetamu atau daftar akaun untuk semak rekod dan gabung transaksi lama.",
    href: "/payer/individual/pay",
    icon: HandCoins,
    image: "/images/malaysian-muslim-individual.jpg",
  },
  {
    title: "Korporat",
    desc: "Bayaran zakat syarikat dengan profil organisasi dan rekod transaksi yang konsisten.",
    href: "/payer/corporate/zakat",
    icon: Building2,
    image: "/images/malaysian-muslim-corporate.jpg",
  },
  {
    title: "Skim Potongan Gaji (SPG)",
    desc: "Urus sumbangan pekerja secara pukal, pantau status, dan selaras rekod pembayar individu.",
    href: "/payer/corporate/spg",
    icon: Users,
    image: "/images/malaysian-muslim-spg.jpg",
  },
];

export function FeatureGrid() {
  return (
    <section>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7E30E1]">Segmen Perkhidmatan</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">Direka untuk semua jenis pembayar</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {features.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#7E30E1]/40 hover:shadow-lg"
          >
            <div className="mb-4 overflow-hidden rounded-xl border border-slate-100">
              <img src={item.image} alt={item.title} className="h-32 w-full object-cover transition duration-500 group-hover:scale-105" />
            </div>
            <item.icon className="h-8 w-8 text-[#7E30E1]" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
            <span className="mt-4 inline-flex text-sm font-medium text-[#7E30E1]">Lihat aliran</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
