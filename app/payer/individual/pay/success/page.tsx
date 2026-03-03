"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ReceiptText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function IndividualPaySuccessPage() {
  const params = useSearchParams();
  const receiptId = params.get("receiptId");

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Pembayaran Berjaya</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Bayaran anda telah direkodkan dengan jayanya.
            </p>
          </div>
          {receiptId ? (
            <Link href={`/payer/individual/pay/receipt/${receiptId}`}>
              <Button className="gap-2">
                <ReceiptText className="h-4 w-4" />
                Lihat Resit
              </Button>
            </Link>
          ) : (
            <p className="text-sm text-red-600">Receipt ID tidak ditemui.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
