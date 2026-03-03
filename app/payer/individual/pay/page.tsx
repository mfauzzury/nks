"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, AlertCircle } from "lucide-react";
import { createGuestPayment, getPublicZakatTypes, type PublicZakatType } from "@/lib/payer-portal-api";
import { getPortalSession } from "@/lib/portal-session";
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
  const session = getPortalSession();
  const isLoggedInIndividual = session?.payerType === "individu" && Boolean(session.identityNo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [zakatTypes, setZakatTypes] = useState<PublicZakatType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  const activeTypes = useMemo(
    () => zakatTypes.filter((item) => item.isActive !== false),
    [zakatTypes],
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
      });
      router.push(`/payer/individual/pay/success?receiptId=${response.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ralat semasa membuat bayaran");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CreditCard className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Bayar Zakat Individu</h1>
          <p className="text-sm text-muted-foreground">Bayar terus menggunakan nombor IC anda tanpa perlu log masuk</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {!isLoggedInIndividual ? (
          <Card>
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
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Bayaran akan direkodkan menggunakan akaun log masuk anda: <span className="font-semibold">{session?.displayName}</span> ({session?.identityNo}).
          </div>
        )}

        <Card>
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
              <Label htmlFor="amount">Jumlah (RM) *</Label>
              <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required placeholder="cth. 100.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Kaedah bayaran *</Label>
              <Input id="paymentMethod" name="paymentMethod" required placeholder="cth. FPX / Kad Kredit" />
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
  );
}
