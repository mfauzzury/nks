"use client";

import { FormEvent, useState } from "react";
import { Building2, CheckCircle, AlertCircle } from "lucide-react";
import { registerCorporate, submitProfileUpdateRequest } from "@/lib/payer-portal-api";
import { usePortalSession } from "@/lib/use-portal-session";
import { PortalSubnav } from "@/components/portal/PortalSubnav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CorporateRegisterPage() {
  const session = usePortalSession();
  const isLoggedIn = Boolean(session && session.payerType !== "individu");

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(e.currentTarget);

    try {
      if (isLoggedIn) {
        await submitProfileUpdateRequest({
          payerId: session!.payerId,
          payerType: "korporat",
          companyName: String(form.get("companyName") || ""),
          companyType: String(form.get("companyType") || ""),
          taxNo: String(form.get("taxNo") || ""),
          taxBranch: String(form.get("taxBranch") || ""),
          contactPerson: {
            name: String(form.get("repName") || ""),
            icNo: String(form.get("repIcNo") || ""),
            position: String(form.get("repPosition") || ""),
            email: String(form.get("repEmail") || ""),
            phone: String(form.get("repPhone") || ""),
          },
        });
        setIsSuccess(true);
        setMessage("Permohonan kemaskini telah dihantar untuk semakan pentadbir.");
      } else {
        const res = await registerCorporate({
          displayName: String(form.get("displayName") || form.get("companyName") || ""),
          companyName: String(form.get("companyName") || ""),
          ssmNo: String(form.get("ssmNo") || ""),
          identityNo: String(form.get("ssmNo") || ""),
          identityType: "ssm",
          password: String(form.get("password") || ""),
          companyType: String(form.get("companyType") || ""),
          taxNo: String(form.get("taxNo") || ""),
          taxBranch: String(form.get("taxBranch") || ""),
          contactPersons: [
            {
              name: String(form.get("repName") || ""),
              icNo: String(form.get("repIcNo") || ""),
              position: String(form.get("repPosition") || ""),
              email: String(form.get("repEmail") || ""),
              phone: String(form.get("repPhone") || ""),
              isAuthorized: true,
            },
          ],
        });
        setIsSuccess(true);
        setMessage(`Pendaftaran korporat berjaya. ID Pembayar: ${res.data.id ?? "-"}`);
        e.currentTarget.reset();
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage(error instanceof Error ? error.message : "Ralat semasa memproses");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[calc(100vh-6rem)] w-screen overflow-hidden portal-cosmic-bg py-6 md:py-8">
      <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full portal-orb-1 blur-3xl animate-[float_9s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -left-10 -bottom-8 h-40 w-40 rounded-full portal-orb-2 blur-3xl animate-[float_11s_ease-in-out_infinite]" />

      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 md:px-6">
        {isLoggedIn ? <PortalSubnav role="corporate" session={session} variant="onDark" /> : null}

        <div className="relative rounded-2xl border border-white/20 bg-white/12 p-5 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">
                {isLoggedIn ? "Kemaskini Maklumat Syarikat" : "Pendaftaran Korporat"}
              </h1>
              <p className="text-sm text-purple-100">
                {isLoggedIn
                  ? `Kemaskini profil ${session?.companyName || session?.displayName || "syarikat"}`
                  : "Daftar syarikat atau organisasi sebagai pembayar"}
              </p>
            </div>
          </div>
        </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card className="border-white/20 portal-card shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Maklumat Syarikat</CardTitle>
            <CardDescription>
              {isLoggedIn ? "Kemaskini maklumat syarikat anda." : "Maklumat pendaftaran syarikat / organisasi."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nama syarikat *</Label>
              <Input
                id="companyName"
                name="companyName"
                required
                defaultValue={isLoggedIn ? (session?.companyName || session?.displayName || "") : ""}
                placeholder="cth. Syarikat ABC Sdn Bhd"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ssmNo">No. SSM {isLoggedIn ? "" : "*"}</Label>
              <Input
                id="ssmNo"
                name="ssmNo"
                required={!isLoggedIn}
                defaultValue={isLoggedIn ? (session?.identityNo || "") : ""}
                readOnly={isLoggedIn}
                className={isLoggedIn ? "bg-slate-50" : ""}
                placeholder="cth. 202301012345"
              />
            </div>
            {!isLoggedIn && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Nama paparan</Label>
                <Input id="displayName" name="displayName" placeholder="cth. ABC Sdn Bhd" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="companyType">Jenis syarikat</Label>
              <Input id="companyType" name="companyType" placeholder="cth. Sdn Bhd / Berhad / Enterprise" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxNo">No. cukai</Label>
              <Input id="taxNo" name="taxNo" placeholder="cth. C-1234567890" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxBranch">Cawangan cukai</Label>
              <Input id="taxBranch" name="taxBranch" placeholder="cth. Kuala Lumpur" />
            </div>
          </CardContent>
        </Card>

        {!isLoggedIn && (
          <Card className="border-white/20 portal-card shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Kata Laluan</CardTitle>
              <CardDescription>Cipta kata laluan untuk log masuk portal.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Kata Laluan *</Label>
                <Input id="password" name="password" type="password" required placeholder="Minimum 6 aksara" />
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-white/20 portal-card shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Wakil yang Diberi Kuasa</CardTitle>
            <CardDescription>Maklumat wakil syarikat untuk urusan portal.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="repName">Nama wakil *</Label>
              <Input id="repName" name="repName" required placeholder="cth. Siti binti Hassan" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repIcNo">No. IC wakil</Label>
              <Input id="repIcNo" name="repIcNo" placeholder="cth. 880101-01-1234" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repPosition">Jawatan</Label>
              <Input id="repPosition" name="repPosition" placeholder="cth. Pengurus Kewangan" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repEmail">Email wakil</Label>
              <Input id="repEmail" name="repEmail" type="email" placeholder="cth. siti@abc.com.my" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="repPhone">No. telefon wakil</Label>
              <Input id="repPhone" name="repPhone" placeholder="cth. 012-345 6789" />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="submit" disabled={loading} className="h-12 rounded-xl bg-gradient-to-r from-[#E26EE5] to-[#7E30E1] px-8 text-base font-semibold shadow-lg hover:from-[#d45ed5] hover:to-[#6b28c0]">
            {loading ? "Menyimpan..." : isLoggedIn ? "Hantar Kemaskini" : "Hantar Pendaftaran"}
          </Button>
        </div>
      </form>

      {message && (
        <div className={`flex items-start gap-3 rounded-lg border p-4 ${isSuccess ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>
          {isSuccess ? <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}
          <p className="text-sm">{message}</p>
        </div>
      )}

      </div>
    </div>
  );
}
