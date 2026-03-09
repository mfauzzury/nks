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
  const [identityNo, setIdentityNo] = useState("900202101001");
  const [password, setPassword] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginPayer({
        identityNo: identityNo.trim(),
        password,
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
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex min-h-screen w-screen items-center overflow-hidden portal-cosmic-bg py-6 md:py-8">
      <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full portal-orb-1 blur-3xl animate-[float_9s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -left-10 -bottom-8 h-40 w-40 rounded-full portal-orb-2 blur-3xl animate-[float_11s_ease-in-out_infinite]" />

      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="grid w-full gap-8 rounded-3xl border border-white/20 bg-white/12 p-8 shadow-xl backdrop-blur-md lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-purple-200">Portal Pembayar</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Akses satu pintu untuk Individu dan Korporat</h1>
            <p className="mt-3 text-purple-100">
              Log masuk menggunakan identiti pembayar anda. Sistem akan arahkan anda ke dashboard yang betul secara automatik.
            </p>

            <div className="mt-7 space-y-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-purple-100">
              <p>• Individu: semak rekod, buat bayaran, kemas kini profil</p>
              <p>• Korporat: bayar zakat syarikat, urus SPG, kemas kini maklumat</p>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-white/20">
              <img
                src="/images/malaysian-muslim-corporate.jpg"
                alt="Bangunan korporat"
                className="h-40 w-full object-cover"
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/payer/individual/pay" className="inline-flex items-center gap-2 text-sm font-medium text-purple-200 hover:text-white hover:underline">
                Bayaran Terus <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <form onSubmit={onSubmit} className="rounded-2xl border border-white/20 portal-card p-5 shadow-md">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <LogIn className="h-5 w-5" />
              Log Masuk Portal
            </h2>

            <div className="mt-4 space-y-3">
              <label className="grid gap-1 text-sm text-slate-700">
                Akaun Demo Cepat
                <select
                  value={identityNo}
                  onChange={(e) => setIdentityNo(e.target.value)}
                  className="rounded-lg border-2 border-slate-400 bg-white px-4 py-3 text-base outline-none transition portal-focus"
                >
                  <option value="900202101001">900202101001</option>
                  <option value="201200400">201200400</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm text-slate-700">
                IC / Passport / SSM
                <input
                  name="identityNo"
                  value={identityNo}
                  onChange={(e) => setIdentityNo(e.target.value)}
                  placeholder="Contoh: 900101011234 atau 202301012345"
                  className="rounded-lg border-2 border-slate-400 px-4 py-3 text-base outline-none transition portal-focus"
                />
              </label>
              <label className="grid gap-1 text-sm text-slate-700">
                Kata Laluan
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kosongkan untuk akaun demo"
                  className="rounded-lg border-2 border-slate-400 px-4 py-3 text-base outline-none transition portal-focus"
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
              className="mt-4 h-12 w-full rounded-xl portal-btn-primary px-4 text-base font-semibold portal-text-accent shadow-lg transition  disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>

            <p className="mt-4 text-xs text-slate-500">
              Belum ada akaun? Daftar sebagai{" "}
              <Link href="/payer/individual/register" className="font-semibold portal-text-accent hover:underline">
                Individu
              </Link>
              {" "}atau{" "}
              <Link href="/payer/corporate/register" className="font-semibold portal-text-accent hover:underline">
                Korporat
              </Link>
              .
            </p>
          </form>
        </div>
      </div>

    </div>
  );
}
