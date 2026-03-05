"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, AlertCircle, Building2, ShieldCheck, Sparkles } from "lucide-react";
import { payZakatCorporate, getPublicZakatTypes, type PublicZakatType } from "@/lib/payer-portal-api";
import { usePortalSession } from "@/lib/use-portal-session";
import { PortalAuthGuard } from "@/components/portal/PortalAuthGuard";
import { PortalSubnav } from "@/components/portal/PortalSubnav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const PAYMENT_METHODS = [
  { code: "FPX", label: "FPX Online Banking" },
  { code: "CARD", label: "Kad Kredit / Debit" },
  { code: "JOMPAY", label: "JomPAY" },
];

const FALLBACK_TYPES: PublicZakatType[] = [
  { code: "ZPERNIAGAAN", name: "ZAKAT PERNIAGAAN", isActive: true },
  { code: "ZSIMPANAN", name: "ZAKAT SIMPANAN", isActive: true },
  { code: "ZSAHAM", name: "ZAKAT SAHAM", isActive: true },
  { code: "ZHARTA", name: "ZAKAT HARTA", isActive: true },
  { code: "ZPENDAPATAN", name: "ZAKAT PENDAPATAN", isActive: true },
];

export default function CorporateZakatPage() {
  const router = useRouter();
  const session = usePortalSession();
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
    getPublicZakatTypes()
      .then((res) => setZakatTypes(res.data.types || []))
      .catch(() => setZakatTypes(FALLBACK_TYPES))
      .finally(() => setLoadingTypes(false));
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);

    try {
      const response = await payZakatCorporate({
        ssmNo: String(form.get("ssmNo") || ""),
        companyName: String(form.get("companyName") || ""),
        contactEmail: String(form.get("contactEmail") || ""),
        amount: Number(form.get("amount")),
        paymentMethod: String(form.get("paymentMethod") || ""),
        zakatType: String(form.get("zakatType") || ""),
        financialYear: String(form.get("financialYear") || ""),
      });
      router.push(`/payer/individual/pay/receipt/${response.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ralat semasa membuat bayaran");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PortalAuthGuard expected="corporate">
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[calc(100vh-6rem)] w-screen overflow-hidden portal-cosmic-bg py-6 md:py-8">
        <div className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 rounded-full portal-orb-1 blur-3xl animate-[float_10s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full portal-orb-2 blur-3xl animate-[float_12s_ease-in-out_infinite]" />

        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 md:px-6">
          {session && session.payerType !== "individu" ? <PortalSubnav role="corporate" session={session} variant="onDark" /> : null}

          <div className="relative rounded-2xl border border-white/20 bg-white/12 p-5 shadow-sm backdrop-blur-md">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl portal-bg-accent-soft portal-text-secondary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">Bayar Zakat Syarikat</h1>
                  <p className="text-sm text-purple-100">Pengurusan bayaran zakat korporat dengan jejak tahun kewangan yang jelas.</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-white"><ShieldCheck className="h-3.5 w-3.5" /> Audit-Ready</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-300/25 px-2.5 py-1 text-white"><Sparkles className="h-3.5 w-3.5" /> Resit Digital</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-300/25 px-2.5 py-1 text-white"><CreditCard className="h-3.5 w-3.5" /> Multi Channel</span>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <Card className="border-white/20 portal-card shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Maklumat Syarikat</CardTitle>
                <CardDescription>Sahkan maklumat syarikat sebelum membuat bayaran.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ssmNo">No. SSM *</Label>
                  <Input
                    id="ssmNo"
                    name="ssmNo"
                    required
                    defaultValue={session?.identityNo || ""}
                    readOnly={Boolean(session?.identityNo)}
                    className={session?.identityNo ? "bg-slate-50" : ""}
                    placeholder="cth. 202301012345"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nama syarikat *</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    required
                    defaultValue={session?.companyName || session?.displayName || ""}
                    readOnly={Boolean(session?.companyName || session?.displayName)}
                    className={session?.companyName || session?.displayName ? "bg-slate-50" : ""}
                    placeholder="cth. Syarikat ABC Sdn Bhd"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="contactEmail">Email hubungan</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    defaultValue={session?.email || ""}
                    placeholder="cth. kewangan@abc.com.my"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/20 portal-card shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Maklumat Bayaran Zakat</CardTitle>
                <CardDescription>Butiran bayaran zakat syarikat.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
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
                  <Label htmlFor="financialYear">Tahun kewangan *</Label>
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
                  <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required placeholder="0.00" className="text-right" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Kaedah bayaran *</Label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    required
                    className="flex h-11 w-full rounded-lg border-2 border-slate-400 bg-white px-4 py-2 text-base shadow-xs"
                    defaultValue=""
                  >
                    <option value="" disabled>Sila pilih kaedah bayaran</option>
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.code} value={m.code}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-3">
              <Button type="submit" disabled={loading} className="h-12 rounded-xl portal-btn-primary px-8 text-base font-semibold shadow-lg ">
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
    </PortalAuthGuard>
  );
}
