"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, AlertCircle, ShieldCheck, Sparkles, Wallet, CalendarClock } from "lucide-react";
import { createGuestPayment, createScheduledPayment, getPublicZakatTypes, type PublicZakatType } from "@/lib/payer-portal-api";
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
  const [selectedZakatType, setSelectedZakatType] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [fidyahDays, setFidyahDays] = useState("1");
  const [fidyahYears, setFidyahYears] = useState("1");
  const [paymentMode, setPaymentMode] = useState<"sekali" | "berjadual">("sekali");
  const [scheduleFrequency, setScheduleFrequency] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [scheduleTotalInstalments, setScheduleTotalInstalments] = useState("12");
  const [cardLast4, setCardLast4] = useState("");
  const [cardBrand, setCardBrand] = useState<"VISA" | "MASTERCARD">("VISA");
  const currentYear = new Date().getFullYear();

  const activeTypes = useMemo(
    () => zakatTypes.filter((item) => item.isActive !== false),
    [zakatTypes],
  );
  const yearOptions = useMemo(
    () => Array.from({ length: 11 }, (_, idx) => String(currentYear - idx)),
    [currentYear],
  );
  const isFidyah = useMemo(
    () => selectedZakatType.toLowerCase().includes("fidyah"),
    [selectedZakatType],
  );
  const calculatedTotalAmount = useMemo(() => {
    const base = Number(amountInput);
    if (!Number.isFinite(base) || base <= 0) return 0;
    if (!isFidyah) return base;
    const days = Number(fidyahDays);
    const years = Number(fidyahYears);
    if (!Number.isFinite(days) || !Number.isFinite(years) || days <= 0 || years <= 0) return 0;
    return base * days * years;
  }, [amountInput, fidyahDays, fidyahYears, isFidyah]);
  function adjustFidyahDays(delta: number) {
    setFidyahDays((prev) => {
      const next = (Number(prev) || 1) + delta;
      return String(Math.min(365, Math.max(1, next)));
    });
  }

  function adjustFidyahYears(delta: number) {
    setFidyahYears((prev) => {
      const next = (Number(prev) || 1) + delta;
      return String(Math.min(100, Math.max(1, next)));
    });
  }

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
    const amountToSubmit = isFidyah ? calculatedTotalAmount : Number(form.get("amount"));

    try {
      if (isFidyah) {
        const days = Number(fidyahDays);
        const years = Number(fidyahYears);
        if (!Number.isFinite(days) || days <= 0 || !Number.isFinite(years) || years <= 0 || amountToSubmit <= 0) {
          setError("Sila isi maklumat kalkulator fidyah dengan betul.");
          setLoading(false);
          return;
        }
      }

      const identityNo = isLoggedInIndividual ? String(session?.identityNo || "") : String(form.get("identityNo") || "");
      const guestName = isLoggedInIndividual ? String(session?.displayName || "") : String(form.get("guestName") || "");
      const email = isLoggedInIndividual ? String(session?.email || "") : String(form.get("email") || "");
      const financialYear = String(form.get("financialYear") || currentYear);

      if (paymentMode === "berjadual") {
        if (!cardLast4 || cardLast4.length !== 4) {
          setError("Sila masukkan 4 digit terakhir kad anda.");
          setLoading(false);
          return;
        }
        const totalInst = Number(scheduleTotalInstalments);
        if (!Number.isFinite(totalInst) || totalInst < 2) {
          setError("Bilangan ansuran mestilah sekurang-kurangnya 2.");
          setLoading(false);
          return;
        }
        const response = await createScheduledPayment({
          payerName: guestName,
          identityNo,
          email: email || undefined,
          zakatType: selectedZakatType,
          financialYear,
          amountPerInstalment: amountToSubmit,
          totalInstalments: totalInst,
          frequency: scheduleFrequency,
          cardLast4,
          cardBrand,
        });
        router.push(`/payer/individual/pay/success?receiptId=${response.data.firstPayment.id}&type=scheduled&scheduleRef=${response.data.scheduleRef}`);
      } else {
        const paymentMethod = isFidyah
          ? `${String(form.get("paymentMethod") || "")} | ${selectedZakatType} | Fidyah ${fidyahDays} hari x ${fidyahYears} tahun`
          : `${String(form.get("paymentMethod") || "")} | ${selectedZakatType}`;

        const response = await createGuestPayment({
          guestName,
          identityNo,
          email,
          amount: amountToSubmit,
          paymentMethod,
          financialYear,
        });
        router.push(`/payer/individual/pay/success?receiptId=${response.data.id}`);
      }
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
              <div className="flex h-11 w-11 items-center justify-center rounded-xl portal-bg-accent-soft portal-text-secondary">
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
                  value={selectedZakatType}
                  onChange={(e) => setSelectedZakatType(e.target.value)}
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
              {isFidyah ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fidyahDays">Bilangan Hari Tinggal Puasa *</Label>
                    <div className="flex h-11 items-center rounded-lg border-2 border-slate-400 bg-white shadow-xs">
                      <button type="button" className="h-full px-4 text-lg font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700" onClick={() => adjustFidyahDays(-1)}>-</button>
                      <input
                        id="fidyahDays"
                        name="fidyahDays"
                        type="number"
                        min="1"
                        max="365"
                        required={isFidyah}
                        value={fidyahDays}
                        onChange={(e) => setFidyahDays(e.target.value)}
                        className="h-full w-full border-0 text-center text-base font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <button type="button" className="h-full px-4 text-lg font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700" onClick={() => adjustFidyahDays(1)}>+</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fidyahYears">Tahun Gandaan *</Label>
                    <div className="flex h-11 items-center rounded-lg border-2 border-slate-400 bg-white shadow-xs">
                      <button type="button" className="h-full px-4 text-lg font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700" onClick={() => adjustFidyahYears(-1)}>-</button>
                      <input
                        id="fidyahYears"
                        name="fidyahYears"
                        type="number"
                        min="1"
                        max="100"
                        required={isFidyah}
                        value={fidyahYears}
                        onChange={(e) => setFidyahYears(e.target.value)}
                        className="h-full w-full border-0 text-center text-base font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <button type="button" className="h-full px-4 text-lg font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700" onClick={() => adjustFidyahYears(1)}>+</button>
                    </div>
                  </div>
                </>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="amount">{isFidyah ? "Kadar Fidyah (RM / hari) *" : "Jumlah (RM) *"}</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  className="bg-white text-right"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                />
                {isFidyah ? (
                  <p className="mt-1 text-sm text-slate-600">
                    Formula: hari x tahun x kadar sehari. Jumlah bayaran:
                    <span className="ml-1 text-lg font-bold text-slate-900">RM {calculatedTotalAmount.toFixed(2)}</span>
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>Kaedah bayaran</Label>
                <div className="flex h-11 items-center gap-2 rounded-lg border-2 border-slate-400 bg-white px-4 text-base text-slate-700">
                  <CreditCard className="h-4 w-4 portal-text-accent" />
                  Online Payment
                </div>
                <input type="hidden" name="paymentMethod" value="Online Payment" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/20 portal-card shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                Mod Bayaran
              </CardTitle>
              <CardDescription>Pilih bayaran sekali atau bayaran berjadual (ansuran).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode("sekali")}
                  className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition ${paymentMode === "sekali" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  Bayaran Sekali
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode("berjadual")}
                  className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition ${paymentMode === "berjadual" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  Bayaran Berjadual
                </button>
              </div>

              {paymentMode === "berjadual" && (
                <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Kekerapan *</Label>
                      <select
                        value={scheduleFrequency}
                        onChange={(e) => setScheduleFrequency(e.target.value as "monthly" | "quarterly" | "yearly")}
                        className="flex h-11 w-full rounded-lg border-2 border-slate-400 bg-white px-4 py-2 text-base shadow-xs"
                      >
                        <option value="monthly">Bulanan</option>
                        <option value="quarterly">Suku Tahunan (3 bulan)</option>
                        <option value="yearly">Tahunan</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Bilangan Ansuran *</Label>
                      <div className="flex h-11 items-center rounded-lg border-2 border-slate-400 bg-white shadow-xs">
                        <button
                          type="button"
                          className="h-full px-4 text-lg font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => setScheduleTotalInstalments((prev) => String(Math.max(2, (Number(prev) || 2) - 1)))}
                        >-</button>
                        <input
                          type="number"
                          min="2"
                          max="120"
                          value={scheduleTotalInstalments}
                          onChange={(e) => setScheduleTotalInstalments(e.target.value)}
                          className="h-full w-full border-0 text-center text-base font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          className="h-full px-4 text-lg font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => setScheduleTotalInstalments((prev) => String(Math.min(120, (Number(prev) || 2) + 1)))}
                        >+</button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Jenama Kad *</Label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCardBrand("VISA")}
                          className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition ${cardBrand === "VISA" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-300 bg-white text-slate-600"}`}
                        >VISA</button>
                        <button
                          type="button"
                          onClick={() => setCardBrand("MASTERCARD")}
                          className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition ${cardBrand === "MASTERCARD" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-300 bg-white text-slate-600"}`}
                        >MASTERCARD</button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardLast4">4 Digit Terakhir Kad *</Label>
                      <Input
                        id="cardLast4"
                        maxLength={4}
                        pattern="\d{4}"
                        placeholder="1234"
                        className="bg-white text-center tracking-widest"
                        value={cardLast4}
                        onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      />
                    </div>
                  </div>

                  {calculatedTotalAmount > 0 && Number(scheduleTotalInstalments) >= 2 && (
                    <div className="rounded-lg bg-white border border-blue-200 p-3 text-sm">
                      <p className="text-slate-700">
                        Ringkasan: <span className="font-bold text-blue-700">RM {calculatedTotalAmount.toFixed(2)}</span> x{" "}
                        <span className="font-bold">{scheduleTotalInstalments}</span> ansuran ={" "}
                        <span className="font-bold text-emerald-700">RM {(calculatedTotalAmount * Number(scheduleTotalInstalments)).toFixed(2)}</span>
                        {" "}({scheduleFrequency === "monthly" ? "bulanan" : scheduleFrequency === "quarterly" ? "suku tahunan" : "tahunan"})
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button type="submit" disabled={loading} className="h-12 rounded-xl portal-btn-primary px-8 text-base font-semibold shadow-lg ">
              {loading ? "Memproses..." : paymentMode === "berjadual" ? "Mulakan Bayaran Berjadual" : "Buat Bayaran"}
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
