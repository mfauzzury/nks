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
          <p className="text-sm text-purple-100">Resit rasmi hanya tersedia untuk batch `paid_success`.</p>
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
                  Official SPG Receipt
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2 pt-6 text-sm md:grid-cols-2">
                <p><span className="font-medium">Receipt No:</span> {receipt.receiptNo}</p>
                <p><span className="font-medium">Reference No:</span> {receipt.referenceNo}</p>
                <p><span className="font-medium">Employer:</span> {receipt.employerName}</p>
                <p><span className="font-medium">Employer Code:</span> {receipt.employerCode}</p>
                <p><span className="font-medium">Period:</span> {String(receipt.month).padStart(2, "0")}/{receipt.year}</p>
                <p><span className="font-medium">Channel:</span> {receipt.paymentChannel}</p>
                <p><span className="font-medium">Paid At:</span> {receipt.paidAt ? new Date(receipt.paidAt).toLocaleString("ms-MY") : "-"}</p>
                <p><span className="font-medium">Issued At:</span> {receipt.issuedAt ? new Date(receipt.issuedAt).toLocaleString("ms-MY") : "-"}</p>
                <p className="md:col-span-2 text-base font-semibold">Jumlah: {formatCurrency(totalAmount)}</p>
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
