"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, AlertCircle, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { createGuestPayment, getPublicZakatTypes, type PublicZakatType } from "@/lib/payer-portal-api";
import { usePortalSession } from "@/lib/use-portal-session";
import { PortalSubnav } from "@/components/portal/PortalSubnav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const FALLBACK_TYPES: PublicZakatType[] = [
  { code: "ZFITRAH", name: "ZAKAT FITRAH", isActive: true },
  { code: "ZPENDAPATAN", name: "ZAKAT PENDAPATAN", isActive: true },
  { code: "ZPERNIAGAAN", name: "ZAKAT PERNIAGAAN", isActive: true },
  { code: "ZSIMPANAN", name: "ZAKAT SIMPANAN", isActive: true },
  { code: "ZSAHAM", name: "ZAKAT SAHAM", isActive: true },
  { code: "ZKWSP", name: "ZAKAT KWSP", isActive: true },
  { code: "ZEMAS", name: "ZAKAT EMAS", isActive: true },
  { code: "ZKRIPTO", name: "ZAKAT KRIPTO", isActive: true },
  { code: "ZHARTA", name: "ZAKAT HARTA", isActive: true },
  { code: "ZTANAMAN", name: "ZAKAT TANAMAN", isActive: true },
  { code: "ZPADI", name: "ZAKAT PADI", isActive: true },
  { code: "ZTERNAKAN", name: "ZAKAT TERNAKAN", isActive: true },
  { code: "FIDYAH", name: "FIDYAH PUASA", isActive: true },
  { code: "ZPERAK", name: "ZAKAT PERAK", isActive: true },
  { code: "QADHA", name: "QADHA ZAKAT", isActive: true },
];

export default function IndividualPayPage() {
  const router = useRouter();
  const session = usePortalSession();
  const isLoggedInIndividual = session?.payerType === "individu" && Boolean(session.identityNo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [zakatTypes, setZakatTypes] = useState<PublicZakatType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const currentYear = new Date().getFullYear();

  const activeTypes = useMemo(
    () => zakatTypes.filter((item) => item.isActive !== false),
    [zakatTypes],
  );
  const yearOptions = useMemo(
    () => Array.from({ length: 11 }, (_, idx) => String(currentYear - idx)),
    [currentYear],
  );

  useEffect(() => {
    async function loadTypes() {
      try {
        const response = await getPublicZakatTypes();
        setZakatTypes(response.data.types || []);
      } catch {
        // Fallback to static list so dropdown remains usable if config API is unavailable.
        setZakatTypes(FALLBACK_TYPES);
      } finally {
        setLoadingTypes(false);
      }
    }
    void loadTypes();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);

    try {
      const identityNo = isLoggedInIndividual ? String(session?.identityNo || "") : String(form.get("identityNo") || "");
      const guestName = isLoggedInIndividual ? String(session?.displayName || "") : String(form.get("guestName") || "");
      const email = isLoggedInIndividual ? String(session?.email || "") : String(form.get("email") || "");

      const response = await createGuestPayment({
        guestName,
        identityNo,
        email,
        amount: Number(form.get("amount")),
        paymentMethod: `${String(form.get("paymentMethod") || "")} | ${String(form.get("zakatType") || "")}`,
        financialYear: String(form.get("financialYear") || currentYear),
      });
      router.push(`/payer/individual/pay/success?receiptId=${response.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ralat semasa membuat bayaran");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[calc(100vh-6rem)] w-screen overflow-hidden portal-cosmic-bg py-6 md:py-8">
      <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full portal-orb-1 blur-3xl animate-[float_9s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -left-10 -bottom-8 h-40 w-40 rounded-full portal-orb-2 blur-3xl animate-[float_11s_ease-in-out_infinite]" />

      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 md:px-6">
        {session?.payerType === "individu" ? <PortalSubnav role="individu" session={session} variant="onDark" /> : null}

        <div className="relative rounded-2xl border border-white/20 bg-white/12 p-5 shadow-sm backdrop-blur-md">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7E30E1]/10 text-[#7E30E1]">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Bayar Zakat Individu</h1>
                <p className="text-sm text-purple-100">Aliran pantas, resit digital, dan rekod tersusun mengikut tahun bayaran.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-white"><ShieldCheck className="h-3.5 w-3.5" /> Selamat</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-300/25 px-2.5 py-1 text-white"><Sparkles className="h-3.5 w-3.5" /> Resit Segera</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-300/25 px-2.5 py-1 text-white"><Wallet className="h-3.5 w-3.5" /> Rekod Tahun</span>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {!isLoggedInIndividual ? (
            <Card className="border-white/20 portal-card shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Pengenalan Pembayar</CardTitle>
                <CardDescription>Masukkan maklumat IC anda supaya bayaran dapat direkodkan ke akaun anda.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="identityNo">No. IC / Passport *</Label>
                  <Input id="identityNo" name="identityNo" required placeholder="cth. 901234567890" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestName">Nama pembayar *</Label>
                  <Input id="guestName" name="guestName" required placeholder="cth. Ahmad bin Ali" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email (untuk resit)</Label>
                  <Input id="email" name="email" type="email" placeholder="cth. ahmad@email.com" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-xl border border-emerald-300/50 bg-emerald-300/20 px-4 py-3 text-sm text-emerald-50">
              Bayaran akan direkodkan menggunakan akaun log masuk anda: <span className="font-semibold">{session?.displayName}</span> ({session?.identityNo}).
            </div>
          )}

          <Card className="border-white/20 portal-card shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Maklumat Bayaran</CardTitle>
              <CardDescription>Pilih jenis zakat, jumlah dan kaedah bayaran.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="zakatType">Jenis Zakat *</Label>
                <select
                  id="zakatType"
                  name="zakatType"
                  required
                  className="flex h-11 w-full rounded-lg border-2 border-slate-400 bg-white px-4 py-2 text-base shadow-xs"
                  disabled={loadingTypes}
                  defaultValue=""
                >
                  <option value="" disabled>
                    {loadingTypes ? "Memuatkan jenis zakat..." : "Sila pilih jenis zakat"}
                  </option>
                  {(activeTypes.length > 0 ? activeTypes : FALLBACK_TYPES).map((type) => (
                    <option key={type.code} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="financialYear">Tahun Bayaran Zakat *</Label>
                <select
                  id="financialYear"
                  name="financialYear"
                  required
                  className="flex h-11 w-full rounded-lg border-2 border-slate-400 bg-white px-4 py-2 text-base shadow-xs"
                  defaultValue={String(currentYear)}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Jumlah (RM) *</Label>
                <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required placeholder="0.00" className="bg-white text-right" />
              </div>
              <div className="space-y-2">
                <Label>Kaedah bayaran</Label>
                <div className="flex h-11 items-center gap-2 rounded-lg border-2 border-slate-400 bg-white px-4 text-base text-slate-700">
                  <CreditCard className="h-4 w-4 text-[#7E30E1]" />
                  Online Payment
                </div>
                <input type="hidden" name="paymentMethod" value="Online Payment" />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button type="submit" disabled={loading} className="h-12 rounded-xl bg-gradient-to-r from-[#E26EE5] to-[#7E30E1] px-8 text-base font-semibold shadow-lg hover:from-[#d45ed5] hover:to-[#6b28c0]">
              {loading ? "Memproses..." : "Buat Bayaran"}
            </Button>
          </div>
        </form>

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
