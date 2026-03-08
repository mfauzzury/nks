"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, AlertCircle, Building2, ShieldCheck, Sparkles, CalendarClock } from "lucide-react";
import { payZakatCorporate, createScheduledPayment, getPublicZakatTypes, type PublicZakatType } from "@/lib/payer-portal-api";
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
  const [selectedZakatType, setSelectedZakatType] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [fidyahDays, setFidyahDays] = useState("1");
  const [fidyahYears, setFidyahYears] = useState("1");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [paymentMode, setPaymentMode] = useState<"sekali" | "berjadual">("sekali");
  const [scheduleFrequency, setScheduleFrequency] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [scheduleTotalInstalments, setScheduleTotalInstalments] = useState("12");
  const [cardLast4, setCardLast4] = useState("");
  const [cardBrand, setCardBrand] = useState<"VISA" | "MASTERCARD">("VISA");
  const currentYear = new Date().getFullYear();
  const isCardSelected = selectedPaymentMethod === "CARD";

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

      const ssmNo = String(form.get("ssmNo") || "");
      const companyName = String(form.get("companyName") || "");
      const contactEmail = String(form.get("contactEmail") || "");
      const financialYear = String(form.get("financialYear") || "");

      if (paymentMode === "berjadual" && isCardSelected) {
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
          payerName: companyName,
          identityNo: ssmNo,
          email: contactEmail || undefined,
          zakatType: selectedZakatType,
          financialYear,
          amountPerInstalment: amountToSubmit,
          totalInstalments: totalInst,
          frequency: scheduleFrequency,
          cardLast4,
          cardBrand,
          source: "CORPORATE_DIRECT",
        });
        router.push(`/payer/individual/pay/success?receiptId=${response.data.firstPayment.id}&type=scheduled&scheduleRef=${response.data.scheduleRef}`);
      } else {
        const paymentMethod = isFidyah
          ? `${String(form.get("paymentMethod") || "")} | Fidyah ${fidyahDays} hari x ${fidyahYears} tahun`
          : String(form.get("paymentMethod") || "");

        const response = await payZakatCorporate({
          ssmNo,
          companyName,
          contactEmail,
          amount: amountToSubmit,
          paymentMethod,
          zakatType: selectedZakatType,
          financialYear,
        });
        router.push(`/payer/individual/pay/receipt/${response.data.id}`);
      }
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
                <div className={`space-y-2 ${isFidyah ? "md:col-span-2" : ""}`}>
                  {isFidyah ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Kadar Fidyah (RM / hari) *</Label>
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          placeholder="0.00"
                          className="text-right"
                          value={amountInput}
                          onChange={(e) => setAmountInput(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Jumlah Bayaran (RM)</Label>
                        <div className="flex h-11 w-full items-center justify-end rounded-lg border-2 border-slate-400 bg-white px-4 py-2 text-base font-semibold text-slate-900 shadow-xs">
                          {calculatedTotalAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Label htmlFor="amount">Jumlah (RM) *</Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        placeholder="0.00"
                        className="text-right"
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                      />
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Kaedah bayaran *</Label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    required
                    className="flex h-11 w-full rounded-lg border-2 border-slate-400 bg-white px-4 py-2 text-base shadow-xs"
                    value={selectedPaymentMethod}
                    onChange={(e) => {
                      setSelectedPaymentMethod(e.target.value);
                      if (e.target.value !== "CARD") setPaymentMode("sekali");
                    }}
                  >
                    <option value="" disabled>Sila pilih kaedah bayaran</option>
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.code} value={m.code}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {isCardSelected && (
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
                            <button type="button" className="h-full px-4 text-lg font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700" onClick={() => setScheduleTotalInstalments((prev) => String(Math.max(2, (Number(prev) || 2) - 1)))}>-</button>
                            <input type="number" min="2" max="120" value={scheduleTotalInstalments} onChange={(e) => setScheduleTotalInstalments(e.target.value)} className="h-full w-full border-0 text-center text-base font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                            <button type="button" className="h-full px-4 text-lg font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700" onClick={() => setScheduleTotalInstalments((prev) => String(Math.min(120, (Number(prev) || 2) + 1)))}>+</button>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Jenama Kad *</Label>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => setCardBrand("VISA")} className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition ${cardBrand === "VISA" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-300 bg-white text-slate-600"}`}>VISA</button>
                            <button type="button" onClick={() => setCardBrand("MASTERCARD")} className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition ${cardBrand === "MASTERCARD" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-300 bg-white text-slate-600"}`}>MASTERCARD</button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardLast4Corp">4 Digit Terakhir Kad *</Label>
                          <Input id="cardLast4Corp" maxLength={4} pattern="\d{4}" placeholder="1234" className="bg-white text-center tracking-widest" value={cardLast4} onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))} />
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
            )}

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
    </PortalAuthGuard>
  );
}
