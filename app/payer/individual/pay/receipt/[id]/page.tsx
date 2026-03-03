"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download, Printer, UserPlus2, ReceiptText } from "lucide-react";
import { getGuestReceipt, type GuestReceiptResult } from "@/lib/payer-portal-api";
import { downloadReceiptPdf } from "@/lib/receipt-pdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ReceiptData = GuestReceiptResult["data"];

export default function IndividualReceiptPage() {
  const params = useParams<{ id: string }>();
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

  if (error) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>;
  }

  if (!receipt) {
    return <div className="rounded-lg border bg-white p-4 text-sm text-muted-foreground">Memuatkan resit...</div>;
  }

  const previousText = receipt.previousTransactionCount === 1 ? "transaksi" : "transaksi";

  return (
    <div className="space-y-6">
      <Card id="receipt-print-area">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ReceiptText className="h-5 w-5" />
            Resit Bayaran Zakat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-6 text-sm">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <p><span className="font-medium">No. Resit:</span> {receipt.receiptNo}</p>
            <p><span className="font-medium">Status:</span> {receipt.status}</p>
            <p><span className="font-medium">Nama:</span> {receipt.guestName}</p>
            <p><span className="font-medium">IC / Passport:</span> {receipt.identityNo}</p>
            <p><span className="font-medium">Kaedah Bayaran:</span> {receipt.paymentMethod}</p>
            <p><span className="font-medium">Tarikh Bayaran:</span> {new Date(receipt.paidAt).toLocaleString()}</p>
            <p className="md:col-span-2 text-base font-semibold">Jumlah: RM {receipt.amount}</p>
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
            downloadReceiptPdf({
              receiptNo: receipt.receiptNo,
              guestName: receipt.guestName,
              identityNo: receipt.identityNo,
              amount: receipt.amount,
              paymentMethod: receipt.paymentMethod,
              paidAt: receipt.paidAt,
            })
          }
        >
          <Download className="h-4 w-4" />
          Muat Turun PDF
        </Button>
      </div>

      {receipt.previousTransactionCount > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="space-y-3 p-5">
            <p className="text-sm text-foreground">
              Anda mempunyai <span className="font-semibold">{receipt.previousTransactionCount}</span> {previousText} terdahulu dengan IC ini.
              Daftar akaun untuk menggabungkan rekod anda.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/payer/individual/register">
                <Button className="gap-2">
                  <UserPlus2 className="h-4 w-4" />
                  Daftar Individu
                </Button>
              </Link>
              <Link href="/payer">
                <Button variant="ghost">Kembali ke Portal</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {receipt.hasExistingIndividualAccount && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="space-y-3 p-5">
            <p className="text-sm text-amber-900">
              IC / Passport ini telah berdaftar dalam NKS sebagai{" "}
              <span className="font-semibold">{receipt.existingPayer?.displayName || "akaun sedia ada"}</span>
              {" "}({receipt.existingPayer?.payerCode || "-"}).
              Sila log masuk untuk melihat rekod sumbangan anda.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/portal/login">
                <Button className="gap-2">Log Masuk</Button>
              </Link>
              <Link href="/payer">
                <Button variant="ghost">Kembali ke Portal</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
