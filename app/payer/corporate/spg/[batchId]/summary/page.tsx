"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, Download, Printer } from "lucide-react";
import { callbackSpgOnlinePayment, getSpgBatchDetail } from "@/lib/payer-portal-api";
import { downloadSpgReferencePdf } from "@/lib/spg-receipt-pdf";
import { PortalAuthGuard } from "@/components/portal/PortalAuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(value);
}

export default function SpgBatchSummaryPage() {
  const params = useParams<{ batchId: string }>();
  const router = useRouter();
  const batchId = Number(params.batchId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [batch, setBatch] = useState<Awaited<ReturnType<typeof getSpgBatchDetail>>["data"] | null>(null);

  const load = useCallback(async () => {
    if (!Number.isFinite(batchId)) return;
    setLoading(true);
    setError("");
    try {
      const res = await getSpgBatchDetail(batchId);
      setBatch(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuatkan batch");
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalAmount = useMemo(() => Number(batch?.totalAmount || 0), [batch]);

  async function onSimulate(result: "success" | "failed") {
    setError("");
    setMessage("");
    try {
      await callbackSpgOnlinePayment(batchId, result, "Simulation from portal");
      setMessage(result === "success" ? "Bayaran online disahkan berjaya." : "Bayaran online ditanda gagal.");
      await load();
      if (result === "success") router.push(`/payer/corporate/spg/${batchId}/receipt`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal proses callback");
    }
  }

  return (
    <PortalAuthGuard expected="corporate">
      <div className="space-y-6">
        <div>
          <Link
            href="/payer/corporate/spg"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-[#1f4ed8]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Dashboard SPG
          </Link>
          <h1 className="text-xl font-semibold text-slate-900">Ringkasan Batch SPG</h1>
          <p className="text-sm text-slate-600">Rujukan batch, status bayaran, dan senarai pekerja.</p>
        </div>

        {message ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</div> : null}
        {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

        {loading || !batch ? (
          <Card>
            <CardContent className="py-6 text-sm text-slate-500">Memuatkan batch...</CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Maklumat Batch</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                <p><span className="font-medium">Reference No:</span> {batch.referenceNo}</p>
                <p><span className="font-medium">Status:</span> {batch.status}</p>
                <p><span className="font-medium">Period:</span> {String(batch.month).padStart(2, "0")}/{batch.year}</p>
                <p><span className="font-medium">Channel:</span> {batch.paymentChannel}</p>
                <p><span className="font-medium">Rows:</span> {batch.rowCount}</p>
                <p><span className="font-medium">Total:</span> {formatCurrency(totalAmount)}</p>
                {batch.officialReceiptNo ? <p><span className="font-medium">Receipt:</span> {batch.officialReceiptNo}</p> : null}
              </CardContent>
            </Card>

            {batch.status === "pending_payment" ? (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="space-y-3 p-5">
                  <p className="text-sm text-amber-900">
                    Status batch ini adalah <span className="font-semibold">Pending Payment</span>. Ini hanya reference slip,
                    bukan resit rasmi.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() =>
                        downloadSpgReferencePdf({
                          referenceNo: batch.referenceNo,
                          employerName: batch.employer.displayName,
                          month: batch.month,
                          year: batch.year,
                          paymentChannel: batch.paymentChannel,
                          totalAmount,
                          rowCount: batch.rowCount,
                          status: batch.status,
                        })
                      }
                    >
                      <Download className="h-4 w-4" />
                      Muat Turun Reference PDF
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                      <Printer className="h-4 w-4" />
                      Print
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {batch.status === "awaiting_online_payment" ? (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="space-y-3 p-5">
                  <p className="text-sm text-blue-900">
                    Menunggu bayaran online. Untuk fasa ini, gunakan simulasi callback.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button className="gap-2" onClick={() => onSimulate("success")}>
                      <CheckCircle2 className="h-4 w-4" />
                      Simulate Success
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => onSimulate("failed")}>
                      <AlertCircle className="h-4 w-4" />
                      Simulate Failed
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {batch.status === "paid_success" ? (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="space-y-3 p-5">
                  <p className="text-sm text-emerald-900">
                    Bayaran berjaya. Resit rasmi telah dijana.
                  </p>
                  <Link href={`/payer/corporate/spg/${batchId}/receipt`}>
                    <Button>Lihat Resit Rasmi</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Senarai Pekerja</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left">
                        <th className="px-3 py-2 text-xs uppercase text-slate-500">#</th>
                        <th className="px-3 py-2 text-xs uppercase text-slate-500">Name</th>
                        <th className="px-3 py-2 text-xs uppercase text-slate-500">IC</th>
                        <th className="px-3 py-2 text-right text-xs uppercase text-slate-500">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batch.lines.map((line, index) => (
                        <tr key={line.id} className="border-b border-slate-100">
                          <td className="px-3 py-2">{index + 1}</td>
                          <td className="px-3 py-2">{line.employeeName}</td>
                          <td className="px-3 py-2">{line.employeeIdentityNo}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(Number(line.amount))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PortalAuthGuard>
  );
}
