"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Download, Printer, ReceiptText, UserPlus2, Wallet } from "lucide-react";
import { getGuestReceipt, type GuestReceiptResult } from "@/lib/payer-portal-api";
import { downloadReceiptPdf } from "@/lib/receipt-pdf";
import { usePortalSession } from "@/lib/use-portal-session";
import { PortalSubnav } from "@/components/portal/PortalSubnav";
import { Button } from "@/components/ui/button";

type ReceiptData = GuestReceiptResult["data"];

export default function IndividualReceiptPage() {
  const params = useParams<{ id: string }>();
  const session = usePortalSession();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await getGuestReceipt(Number(params.id));
        setReceipt(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ralat memuatkan resit");
      }
    }
    void load();
  }, [params.id]);

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[calc(100vh-6rem)] w-screen overflow-hidden portal-cosmic-bg py-6 md:py-8">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 md:px-6">
        {session?.payerType === "individu" && <PortalSubnav role="individu" session={session} variant="onDark" />}
        {session && session.payerType !== "individu" && <PortalSubnav role="corporate" session={session} variant="onDark" />}

        {/* Loading */}
        {!receipt && !error && (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-16 shadow-2xl">
            <div className="mb-6 h-16 w-16 animate-spin rounded-full border-4 border-purple-200 border-t-[#7E30E1]" />
            <p className="text-xl font-bold text-slate-800">Memuatkan Resit</p>
            <p className="mt-2 text-base text-slate-500">Sila tunggu...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">{error}</div>
        )}

        {/* Receipt */}
        {receipt && (
          <div className="space-y-4">
            <div id="receipt-print-area" className="rounded-2xl bg-white p-8 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <ReceiptText className="h-5 w-5 portal-text-accent" />
                  <h2 className="text-lg font-bold text-slate-900">Resit Bayaran</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Printer className="h-4 w-4" />
                    Cetak
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      downloadReceiptPdf({
                        receiptNo: receipt.receiptNo,
                        guestName: receipt.guestName,
                        identityNo: receipt.identityNo,
                        amount: receipt.amount,
                        paymentMethod: receipt.paymentMethod,
                        paidAt: receipt.paidAt,
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-black"
                  >
                    <Download className="h-4 w-4" />
                    Muat Turun PDF
                  </button>
                </div>
              </div>

              {/* Success badge */}
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                <div>
                  <p className="font-semibold text-emerald-800">Pembayaran Berjaya</p>
                  <p className="text-sm text-emerald-600">Bayaran anda telah direkodkan dengan jayanya.</p>
                </div>
              </div>

              {/* Receipt details table */}
              <table className="mt-4 w-full text-base">
                <tbody>
                  <tr>
                    <td className="w-44 py-1.5 align-top font-semibold text-slate-500">No. Resit</td>
                    <td className="w-4 py-1.5 text-slate-400">:</td>
                    <td className="py-1.5 text-slate-900">{receipt.receiptNo}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 align-top font-semibold text-slate-500">Status</td>
                    <td className="py-1.5 text-slate-400">:</td>
                    <td className="py-1.5 text-slate-900">{receipt.status}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 align-top font-semibold text-slate-500">Nama</td>
                    <td className="py-1.5 text-slate-400">:</td>
                    <td className="py-1.5 text-slate-900">{receipt.guestName}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 align-top font-semibold text-slate-500">No. Kad Pengenalan</td>
                    <td className="py-1.5 text-slate-400">:</td>
                    <td className="py-1.5 text-slate-900">{receipt.identityNo}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 align-top font-semibold text-slate-500">Kaedah</td>
                    <td className="py-1.5 text-slate-400">:</td>
                    <td className="py-1.5 text-slate-900">{receipt.paymentMethod}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 align-top font-semibold text-slate-500">Tarikh</td>
                    <td className="py-1.5 text-slate-400">:</td>
                    <td className="py-1.5 text-slate-900">{new Date(receipt.paidAt).toLocaleString("ms-MY")}</td>
                  </tr>
                </tbody>
              </table>

              {/* Amount bar */}
              <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 px-5 py-4">
                <span className="text-base font-semibold text-slate-700">Jumlah Bayaran</span>
                <span className="text-2xl font-bold text-emerald-700">RM {Number(receipt.amount).toFixed(2)}</span>
              </div>

              {/* Confirmation note */}
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                <Wallet className="h-4 w-4" />
                <span>Pembayaran telah diterima dan direkodkan. Terima kasih.</span>
              </div>
            </div>

            {/* Registration prompt */}
            {receipt.previousTransactionCount > 0 && !receipt.hasExistingIndividualAccount && (
              <div className="rounded-2xl border border-white/20 bg-white/12 p-5 backdrop-blur-md">
                <p className="text-sm text-purple-100">
                  Anda mempunyai <span className="font-semibold text-white">{receipt.previousTransactionCount}</span> transaksi terdahulu dengan IC ini.
                  Daftar akaun untuk menggabungkan rekod anda.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/payer/individual/register">
                    <Button className="gap-2 portal-btn-primary">
                      <UserPlus2 className="h-4 w-4" />
                      Daftar Individu
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {receipt.hasExistingIndividualAccount && (
              <div className="rounded-2xl border border-amber-300/30 bg-amber-50/90 p-5 backdrop-blur-md">
                <p className="text-sm text-amber-900">
                  IC / Passport ini telah berdaftar dalam NKS sebagai{" "}
                  <span className="font-semibold">{receipt.existingPayer?.displayName || "akaun sedia ada"}</span>
                  {" "}({receipt.existingPayer?.payerCode || "-"}).
                  Sila log masuk untuk melihat rekod sumbangan anda.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/portal/login">
                    <Button className="gap-2 portal-btn-primary">Log Masuk</Button>
                  </Link>
                </div>
              </div>
            )}

            <Link
              href="/payer/individual/pay"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/12 py-4 text-base font-semibold text-white backdrop-blur-md hover:bg-white/20"
            >
              Kembali
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
