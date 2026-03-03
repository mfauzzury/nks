"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, LogIn } from "lucide-react";
import { loginPayer } from "@/lib/payer-portal-api";
import { resolvePortalDashboard, savePortalSession } from "@/lib/portal-session";

export default function PortalLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    try {
      const res = await loginPayer({
        identityNo: String(form.get("identityNo") || ""),
        password: String(form.get("password") || ""),
      });

      savePortalSession(res.data);
      router.push(resolvePortalDashboard(res.data.payerType));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Log masuk gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative py-6">
      <div className="grid w-full gap-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2d4fc7]">Portal Pembayar</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Akses satu pintu untuk Individu dan Korporat</h1>
          <p className="mt-3 text-slate-600">
            Log masuk menggunakan identiti pembayar anda. Sistem akan arahkan anda ke dashboard yang betul secara automatik.
          </p>

          <div className="mt-7 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p>• Individu: semak rekod, buat bayaran, kemas kini profil</p>
            <p>• Korporat: bayar zakat syarikat, urus SPG, kemas kini maklumat</p>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80"
              alt="Pengguna menggunakan portal digital"
              className="h-40 w-full object-cover"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/payer/individual/pay" className="inline-flex items-center gap-2 text-sm font-medium text-[#1f4ed8] hover:underline">
              Bayaran Terus <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <LogIn className="h-5 w-5" />
            Log Masuk Portal
          </h2>

          <div className="mt-4 space-y-3">
            <label className="grid gap-1 text-sm text-slate-700">
              IC / Passport / SSM
              <input
                name="identityNo"
                required
                placeholder="Contoh: 900101011234 atau 202301012345"
                className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-[#1f4ed8]"
              />
            </label>
            <label className="grid gap-1 text-sm text-slate-700">
              Kata Laluan
              <input
                type="password"
                name="password"
                required
                placeholder="Masukkan kata laluan"
                className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-[#1f4ed8]"
              />
            </label>
          </div>

          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-[#1f4ed8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a42ba] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>

          <p className="mt-4 text-xs text-slate-500">
            Belum ada akaun? Daftar sebagai{" "}
            <Link href="/payer/individual/register" className="font-semibold text-[#1f4ed8] hover:underline">
              Individu
            </Link>
            {" "}atau{" "}
            <Link href="/payer/corporate/register" className="font-semibold text-[#1f4ed8] hover:underline">
              Korporat
            </Link>
            .
          </p>
        </form>
      </div>
    </div>
  );
}
