"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, AlertCircle } from "lucide-react";
import { payZakatCorporate, getPublicZakatTypes, type PublicZakatType } from "@/lib/payer-portal-api";
import { getPortalSession } from "@/lib/portal-session";
import { PortalAuthGuard } from "@/components/portal/PortalAuthGuard";
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
  const session = getPortalSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [zakatTypes, setZakatTypes] = useState<PublicZakatType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  const activeTypes = useMemo(
    () => zakatTypes.filter((item) => item.isActive !== false),
    [zakatTypes],
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

  const currentYear = new Date().getFullYear();

  return (
    <PortalAuthGuard expected="corporate">
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CreditCard className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Bayar Zakat Syarikat</h1>
          <p className="text-sm text-muted-foreground">Buat bayaran zakat bagi pihak syarikat anda</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
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

        <Card>
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
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
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
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                defaultValue={String(currentYear)}
              >
                {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah (RM) *</Label>
              <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required placeholder="cth. 5000.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Kaedah bayaran *</Label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                required
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
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
          <Button type="submit" disabled={loading}>
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
    </PortalAuthGuard>
  );
}
