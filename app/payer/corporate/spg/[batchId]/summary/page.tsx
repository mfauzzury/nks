"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, Download, Printer } from "lucide-react";
import { callbackSpgOnlinePayment, getSpgBatchDetail } from "@/lib/payer-portal-api";
import { usePortalSession } from "@/lib/use-portal-session";
import { downloadSpgReferencePdf } from "@/lib/spg-receipt-pdf";
import { PortalAuthGuard } from "@/components/portal/PortalAuthGuard";
import { PortalSubnav } from "@/components/portal/PortalSubnav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(value);
}

const STATUS_LABELS: Record<string, string> = {
  draft_preview: "Draf",
  awaiting_online_payment: "Menunggu Bayaran Online",
  pending_payment: "Pembayaran Sedang Disahkan",
  paid_success: "Bayaran Berjaya",
  paid_failed: "Bayaran Gagal",
};

const CHANNEL_LABELS: Record<string, string> = {
  FPX_B2B: "FPX Online",
  CARD: "Debit/Credit Card",
  CHEQUE: "Cek",
  COUNTER_CASH: "Tunai / Kaunter",
};

export default function SpgBatchSummaryPage() {
  const params = useParams<{ batchId: string }>();
  const router = useRouter();
  const session = usePortalSession();
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
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[calc(100vh-6rem)] w-screen overflow-hidden portal-cosmic-bg py-6 md:py-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full portal-orb-1 blur-3xl animate-[float_9s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -left-10 -bottom-8 h-40 w-40 rounded-full portal-orb-2 blur-3xl animate-[float_11s_ease-in-out_infinite]" />

        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 md:px-6">
        {session && session.payerType !== "individu" ? <PortalSubnav role="corporate" session={session} variant="onDark" /> : null}
        <div>
          <Link
            href="/payer/corporate/spg"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 transition portal-hover-text-secondary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Dashboard SPG
          </Link>
          <h1 className="text-xl font-semibold text-white">Ringkasan Batch SPG</h1>
          <p className="text-sm text-purple-100">Rujukan batch, status bayaran, dan senarai pekerja.</p>
        </div>

        {message ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</div> : null}
        {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

        {loading || !batch ? (
          <Card className="border-white/20 portal-card shadow-md">
            <CardContent className="py-6 text-sm text-slate-500">Memuatkan batch...</CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-white/20 portal-card shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Maklumat Batch</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                <p><span className="font-medium">No. Rujukan:</span> {batch.referenceNo}</p>
                <p><span className="font-medium">Status:</span> {STATUS_LABELS[batch.status] || batch.status}</p>
                <p><span className="font-medium">Tempoh:</span> {String(batch.month).padStart(2, "0")}/{batch.year}</p>
                <p><span className="font-medium">Kaedah Bayaran:</span> {CHANNEL_LABELS[batch.paymentChannel] || batch.paymentChannel}</p>
                <p><span className="font-medium">Bil. Pekerja:</span> {batch.rowCount}</p>
                <p><span className="font-medium">Jumlah:</span> {formatCurrency(totalAmount)}</p>
                {batch.officialReceiptNo ? <p><span className="font-medium">No. Resit:</span> {batch.officialReceiptNo}</p> : null}
              </CardContent>
            </Card>

            {batch.status === "pending_payment" ? (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="space-y-3 p-5">
                  <p className="text-sm text-amber-900">
                    Status batch ini adalah <span className="font-semibold">Pembayaran Sedang Disahkan</span>. Pihak pentadbir akan mengesahkan bayaran anda.
                    Dokumen ini hanya rujukan sementara, bukan resit rasmi.
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
                          lines: batch.lines.map((l) => ({
                            employeeName: l.employeeName,
                            employeeIdentityNo: l.employeeIdentityNo,
                            amount: Number(l.amount),
                          })),
                        })
                      }
                    >
                      <Download className="h-4 w-4" />
                      Muat Turun Slip Rujukan
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
                    Menunggu pengesahan bayaran online. Sila selesaikan bayaran melalui gateway pembayaran.
                  </p>
                  <p className="text-xs text-blue-700">Simulasi pembayaran (pembangunan sahaja):</p>
                  <div className="flex flex-wrap gap-2">
                    <Button className="gap-2" onClick={() => onSimulate("success")}>
                      <CheckCircle2 className="h-4 w-4" />
                      Bayaran Berjaya
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => onSimulate("failed")}>
                      <AlertCircle className="h-4 w-4" />
                      Bayaran Gagal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {batch.status === "paid_success" ? (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="space-y-3 p-5">
                  <p className="text-sm text-emerald-900">
                    Bayaran berjaya disahkan. Resit rasmi telah dijana.
                  </p>
                  <Link href={`/payer/corporate/spg/${batchId}/receipt`}>
                    <Button className="gap-2">
                      <Download className="h-4 w-4" />
                      Lihat Resit Rasmi
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : null}

            {batch.status === "paid_failed" ? (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-5">
                  <p className="text-sm text-red-900">
                    Bayaran gagal atau ditolak. Sila hubungi pentadbir untuk maklumat lanjut.
                  </p>
                </CardContent>
              </Card>
            ) : null}

            <Card className="border-white/20 portal-card shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Senarai Pekerja</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left">
                        <th className="px-3 py-2 text-xs uppercase text-slate-500">#</th>
                        <th className="px-3 py-2 text-xs uppercase text-slate-500">Nama</th>
                        <th className="px-3 py-2 text-xs uppercase text-slate-500">No. IC</th>
                        <th className="px-3 py-2 text-right text-xs uppercase text-slate-500">Amaun (RM)</th>
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
      </div>
    </PortalAuthGuard>
  );
}
