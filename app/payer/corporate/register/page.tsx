"use client";

import { FormEvent, useEffect, useState } from "react";
import { Building2, CheckCircle, AlertCircle } from "lucide-react";
import { getPortalCorporateProfile, registerCorporate, submitProfileUpdateRequest } from "@/lib/payer-portal-api";
import { savePortalSession } from "@/lib/portal-session";
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
  const [companyName, setCompanyName] = useState("");
  const [ssmNo, setSsmNo] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [taxNo, setTaxNo] = useState("");
  const [taxBranch, setTaxBranch] = useState("");
  const [password, setPassword] = useState("");
  const [repName, setRepName] = useState("");
  const [repIcNo, setRepIcNo] = useState("");
  const [repPosition, setRepPosition] = useState("");
  const [repEmail, setRepEmail] = useState("");
  const [repPhone, setRepPhone] = useState("");

  useEffect(() => {
    if (!session) return;
    setCompanyName(session.companyName || session.displayName || "");
    setSsmNo(session.identityNo || "");
    setDisplayName(session.displayName || "");
  }, [session]);

  useEffect(() => {
    async function preloadCorporateProfile() {
      if (!isLoggedIn || !session?.identityNo) return;
      try {
        const res = await getPortalCorporateProfile(session.identityNo);
        setCompanyName(res.data.corporate?.companyName || session.companyName || session.displayName || "");
        setSsmNo(res.data.corporate?.ssmNo || res.data.identityNo || session.identityNo || "");
        setDisplayName(res.data.displayName || session.displayName || "");
        setCompanyType(res.data.corporate?.companyType || "");
        setTaxNo(res.data.corporate?.taxNo || "");
        setTaxBranch(res.data.corporate?.taxBranch || "");
        const contact = res.data.contactPersons[0];
        if (contact) {
          setRepName(contact.name || "");
          setRepIcNo(contact.icNo || "");
          setRepPosition(contact.position || "");
          setRepEmail(contact.email || "");
          setRepPhone(contact.phone || "");
        }
      } catch {
        // Keep session fallback values if profile fetch fails.
      }
    }
    void preloadCorporateProfile();
  }, [isLoggedIn, session]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isLoggedIn) {
        await submitProfileUpdateRequest({
          payerId: session!.payerId,
          payerType: "korporat",
          displayName: displayName || companyName,
          companyName,
          companyType,
          taxNo,
          taxBranch,
          contactPerson: {
            name: repName,
            icNo: repIcNo,
            position: repPosition,
            email: repEmail || undefined,
            phone: repPhone,
          },
        });
        savePortalSession({
          ...session!,
          displayName: displayName || companyName,
          companyName,
        });
        setIsSuccess(true);
        setMessage("Maklumat syarikat berjaya dikemaskini.");
      } else {
        const res = await registerCorporate({
          displayName: displayName || companyName,
          companyName,
          ssmNo,
          identityNo: ssmNo,
          identityType: "ssm",
          password,
          companyType,
          taxNo,
          taxBranch,
          contactPersons: [
            {
              name: repName,
              icNo: repIcNo,
              position: repPosition,
              email: repEmail || undefined,
              phone: repPhone,
              isAuthorized: true,
            },
          ],
        });
        setIsSuccess(true);
        setMessage(`Pendaftaran korporat berjaya. ID Pembayar: ${res.data.id ?? "-"}`);
        setPassword("");
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
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="cth. Syarikat ABC Sdn Bhd"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ssmNo">No. SSM {isLoggedIn ? "" : "*"}</Label>
              <Input
                id="ssmNo"
                name="ssmNo"
                required={!isLoggedIn}
                value={ssmNo}
                onChange={(e) => setSsmNo(e.target.value)}
                readOnly={isLoggedIn}
                className={isLoggedIn ? "bg-slate-50" : ""}
                placeholder="cth. 202301012345"
              />
            </div>
            {!isLoggedIn && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Nama paparan</Label>
                <Input id="displayName" name="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="cth. ABC Sdn Bhd" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="companyType">Jenis syarikat</Label>
              <Input id="companyType" name="companyType" value={companyType} onChange={(e) => setCompanyType(e.target.value)} placeholder="cth. Sdn Bhd / Berhad / Enterprise" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxNo">No. cukai</Label>
              <Input id="taxNo" name="taxNo" value={taxNo} onChange={(e) => setTaxNo(e.target.value)} placeholder="cth. C-1234567890" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxBranch">Cawangan cukai</Label>
              <Input id="taxBranch" name="taxBranch" value={taxBranch} onChange={(e) => setTaxBranch(e.target.value)} placeholder="cth. Kuala Lumpur" />
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
                <Input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 aksara" />
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
              <Input id="repName" name="repName" required value={repName} onChange={(e) => setRepName(e.target.value)} placeholder="cth. Siti binti Hassan" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repIcNo">No. IC wakil</Label>
              <Input id="repIcNo" name="repIcNo" value={repIcNo} onChange={(e) => setRepIcNo(e.target.value)} placeholder="cth. 880101-01-1234" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repPosition">Jawatan</Label>
              <Input id="repPosition" name="repPosition" value={repPosition} onChange={(e) => setRepPosition(e.target.value)} placeholder="cth. Pengurus Kewangan" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repEmail">Email wakil</Label>
              <Input id="repEmail" name="repEmail" type="email" value={repEmail} onChange={(e) => setRepEmail(e.target.value)} placeholder="cth. siti@abc.com.my" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="repPhone">No. telefon wakil</Label>
              <Input id="repPhone" name="repPhone" value={repPhone} onChange={(e) => setRepPhone(e.target.value)} placeholder="cth. 012-345 6789" />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="submit" disabled={loading} className="h-12 rounded-xl portal-btn-primary px-8 text-base font-semibold shadow-lg ">
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
