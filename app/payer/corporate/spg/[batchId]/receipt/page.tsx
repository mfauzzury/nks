"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Download, Printer, ReceiptText } from "lucide-react";
import { getSpgBatchReceipt } from "@/lib/payer-portal-api";
import { usePortalSession } from "@/lib/use-portal-session";
import { downloadSpgOfficialReceiptPdf } from "@/lib/spg-receipt-pdf";
import { PortalAuthGuard } from "@/components/portal/PortalAuthGuard";
import { PortalSubnav } from "@/components/portal/PortalSubnav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(value);
}

const CHANNEL_LABELS: Record<string, string> = {
  FPX_B2B: "FPX Online",
  CARD: "Debit/Credit Card",
  CHEQUE: "Cek",
  COUNTER_CASH: "Tunai / Kaunter",
};

export default function SpgOfficialReceiptPage() {
  const params = useParams<{ batchId: string }>();
  const session = usePortalSession();
  const batchId = Number(params.batchId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<Awaited<ReturnType<typeof getSpgBatchReceipt>>["data"] | null>(null);

  useEffect(() => {
    async function load() {
      if (!Number.isFinite(batchId)) return;
      setLoading(true);
      setError("");
      try {
        const res = await getSpgBatchReceipt(batchId);
        setReceipt(res.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal memuatkan resit");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [batchId]);

  const totalAmount = useMemo(() => Number(receipt?.totalAmount || 0), [receipt]);

  return (
    <PortalAuthGuard expected="corporate">
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[calc(100vh-6rem)] w-screen overflow-hidden portal-cosmic-bg py-6 md:py-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full portal-orb-1 blur-3xl animate-[float_9s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -left-10 -bottom-8 h-40 w-40 rounded-full portal-orb-2 blur-3xl animate-[float_11s_ease-in-out_infinite]" />

        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 md:px-6">
        {session && session.payerType !== "individu" ? <PortalSubnav role="corporate" session={session} variant="onDark" /> : null}
        <div>
          <h1 className="text-xl font-semibold text-white">Resit Rasmi SPG</h1>
          <p className="text-sm text-purple-100">Resit rasmi bayaran zakat melalui Skim Potongan Gaji.</p>
        </div>

        {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

        {loading || !receipt ? (
          <Card className="border-white/20 portal-card shadow-md">
            <CardContent className="py-6 text-sm text-slate-500">Memuatkan resit...</CardContent>
          </Card>
        ) : (
          <>
            <Card id="spg-official-receipt-print-area" className="border-white/20 portal-card shadow-md">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ReceiptText className="h-5 w-5" />
                  Resit Rasmi SPG
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                  <p><span className="font-medium">No. Resit:</span> {receipt.receiptNo}</p>
                  <p><span className="font-medium">No. Rujukan:</span> {receipt.referenceNo}</p>
                  <p><span className="font-medium">Majikan:</span> {receipt.employerName}</p>
                  <p><span className="font-medium">Kod Majikan:</span> {receipt.employerCode}</p>
                  <p><span className="font-medium">Tempoh:</span> {String(receipt.month).padStart(2, "0")}/{receipt.year}</p>
                  <p><span className="font-medium">Kaedah Bayaran:</span> {CHANNEL_LABELS[receipt.paymentChannel] || receipt.paymentChannel}</p>
                  <p><span className="font-medium">Tarikh Bayaran:</span> {receipt.paidAt ? new Date(receipt.paidAt).toLocaleString("ms-MY") : "-"}</p>
                  <p><span className="font-medium">Tarikh Dikeluarkan:</span> {receipt.issuedAt ? new Date(receipt.issuedAt).toLocaleString("ms-MY") : "-"}</p>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold text-slate-700">Senarai Pekerja</h3>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-left">
                          <th className="px-3 py-2 text-xs font-semibold uppercase text-slate-500">#</th>
                          <th className="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Nama</th>
                          <th className="px-3 py-2 text-xs font-semibold uppercase text-slate-500">No. IC</th>
                          <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Amaun (RM)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {receipt.lines.map((line, index) => (
                          <tr key={line.id} className="border-b border-slate-100">
                            <td className="px-3 py-2 text-slate-500">{index + 1}</td>
                            <td className="px-3 py-2">{line.employeeName}</td>
                            <td className="px-3 py-2">{line.employeeIdentityNo}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(Number(line.amount))}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold">
                          <td colSpan={3} className="px-3 py-2 text-right">Jumlah</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(totalAmount)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() =>
                  downloadSpgOfficialReceiptPdf({
                    receiptNo: receipt.receiptNo,
                    referenceNo: receipt.referenceNo,
                    employerName: receipt.employerName,
                    employerCode: receipt.employerCode,
                    month: receipt.month,
                    year: receipt.year,
                    totalAmount,
                    rowCount: receipt.rowCount,
                    issuedAt: receipt.issuedAt,
                    lines: receipt.lines,
                  })
                }
              >
                <Download className="h-4 w-4" />
                Muat Turun PDF
              </Button>
            </div>
          </>
        )}
        </div>
      </div>
    </PortalAuthGuard>
  );
}
