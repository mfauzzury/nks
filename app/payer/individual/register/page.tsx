"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { User, CheckCircle, AlertCircle } from "lucide-react";
import { getPortalIndividualProfile, registerIndividual, submitProfileUpdateRequest } from "@/lib/payer-portal-api";
import { getPortalSession } from "@/lib/portal-session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function IndividualRegisterPage() {
  const session = getPortalSession();
  const isExistingIndividual = session?.payerType === "individu" && Boolean(session.payerId);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [mykadOrPassport, setMykadOrPassport] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");

  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("Malaysia");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function preload() {
      if (!isExistingIndividual || !session?.identityNo) return;

      setFullName(session.displayName || "");
      setMykadOrPassport(session.identityNo || "");
      setEmail(session.email || "");

      try {
        const res = await getPortalIndividualProfile(session.identityNo);
        setFullName(res.data.individual?.fullName || res.data.displayName || session.displayName || "");
        setMykadOrPassport(res.data.identityNo || session.identityNo || "");
        setEmail(res.data.email || session.email || "");
        setPhone(res.data.phone || "");
        setJobTitle(res.data.individual?.occupation || "");
        setIndustry(res.data.individual?.incomeSource || "");
        setMonthlyIncome(res.data.individual?.monthlyIncome != null ? String(res.data.individual.monthlyIncome) : "");
        setAddressLine1(res.data.address?.line1 || "");
        setAddressLine2(res.data.address?.line2 || "");
        setCity(res.data.address?.city || "");
        setState(res.data.address?.state || "");
        setPostcode(res.data.address?.postcode || "");
        setCountry(res.data.address?.country || "Malaysia");
      } catch {
        // Keep session fallback values if profile fetch fails.
      }
    }
    void preload();
  }, [isExistingIndividual, session]);

  const passwordMismatch = useMemo(
    () => confirmPassword.length > 0 && password !== confirmPassword,
    [confirmPassword, password],
  );

  const canSubmit = useMemo(() => {
    if (isExistingIndividual) {
      return fullName.trim().length > 0 && mykadOrPassport.trim().length >= 3;
    }
    return (
      fullName.trim().length > 0 &&
      mykadOrPassport.trim().length >= 3 &&
      password.length >= 6 &&
      password === confirmPassword
    );
  }, [isExistingIndividual, fullName, mykadOrPassport, password, confirmPassword]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setMessage("");

    try {
      const addresses = addressLine1.trim()
        ? [
            {
              addressType: "rumah",
              line1: addressLine1.trim(),
              line2: addressLine2.trim() || undefined,
              city: city.trim() || undefined,
              state: state.trim() || undefined,
              postcode: postcode.trim() || undefined,
              country: country.trim() || "Malaysia",
              isPrimary: true,
            },
          ]
        : [];

      if (isExistingIndividual && session?.payerId) {
        const res = await submitProfileUpdateRequest({
          payerId: session.payerId,
          displayName: fullName,
          email: email || undefined,
          phone: phone || undefined,
          occupation: jobTitle || undefined,
          incomeSource: industry || undefined,
          reason: "Kemaskini profil melalui portal individu",
          isCriticalChange: false,
        });
        setIsSuccess(true);
        setMessage(res.data.message || "Profil berjaya dikemaskini.");
      } else {
        const res = await registerIndividual({
          displayName: fullName,
          fullName,
          mykadOrPassport,
          identityNo: mykadOrPassport,
          identityType: "mykad",
          email: email || undefined,
          phone: phone || undefined,
          occupation: jobTitle || undefined,
          incomeSource: industry || undefined,
          monthlyIncome: monthlyIncome ? Number(monthlyIncome) : undefined,
          addresses,
          password,
        });

        setIsSuccess(true);
        setMessage(`Pendaftaran berjaya! ID Pembayar anda: ${res.data.payerId ?? res.data.id ?? "-"}`);
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage(error instanceof Error ? error.message : "Ralat semasa pendaftaran");
    } finally {
      setLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="mx-auto max-w-md space-y-4 py-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Pendaftaran Berjaya!</h1>
          <p className="text-sm text-muted-foreground">{message}</p>
          <p className="text-sm text-muted-foreground">Anda kini boleh log masuk ke portal pembayar.</p>
          <Button asChild className="mt-4">
            <Link href="/portal/login">Log Masuk</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <User className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Kemaskini Profil Individu</h1>
          <p className="text-sm text-muted-foreground">
            {isExistingIndividual
              ? "Lengkapkan maklumat profil anda. No. IC dikunci untuk keselamatan data."
              : "Lengkapkan profil pembayar anda dengan maklumat semasa."}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Maklumat Asas</CardTitle>
            <CardDescription>Maklumat pengenalan dan hubungan utama pembayar.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="fullName">Nama penuh *</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="cth. Ahmad bin Abdullah" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mykadOrPassport">No. MyKad / Passport *</Label>
              <Input
                id="mykadOrPassport"
                value={mykadOrPassport}
                onChange={(e) => setMykadOrPassport(e.target.value)}
                required
                placeholder="cth. 901234-56-7890"
                readOnly={isExistingIndividual}
                disabled={isExistingIndividual}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">No. telefon</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="cth. 012-3456789" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Alamat email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cth. ahmad@email.com" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Maklumat Pekerjaan</CardTitle>
            <CardDescription>Tambah butiran kerjaya untuk melengkapkan profil.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Jawatan</Label>
              <Input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="cth. Eksekutif Kewangan" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industri</Label>
              <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="cth. Teknologi" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyIncome">Pendapatan bulanan (RM)</Label>
              <Input
                id="monthlyIncome"
                type="number"
                min="0"
                step="0.01"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="cth. 4500"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alamat</CardTitle>
            <CardDescription>Isi alamat surat-menyurat utama anda.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="addressLine1">Alamat baris 1</Label>
              <Input id="addressLine1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="cth. No 10, Jalan Meranti" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="addressLine2">Alamat baris 2</Label>
              <Input id="addressLine2" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="cth. Taman Seri Murni" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Bandar</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="cth. Shah Alam" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Negeri</Label>
              <Input id="state" value={state} onChange={(e) => setState(e.target.value)} placeholder="cth. Selangor" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postcode">Poskod</Label>
              <Input id="postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="cth. 40100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Negara</Label>
              <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Malaysia" />
            </div>
          </CardContent>
        </Card>

        {!isExistingIndividual ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Keselamatan Akaun</CardTitle>
              <CardDescription>Cipta kata laluan untuk akses portal.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Kata laluan *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Minimum 6 aksara"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Sahkan kata laluan *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Taip semula kata laluan"
                />
                {passwordMismatch ? <p className="text-xs text-red-500">Kata laluan tidak sepadan</p> : null}
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={loading || !canSubmit}>
            {loading ? "Menyimpan..." : isExistingIndividual ? "Simpan Perubahan" : "Daftar Sekarang"}
          </Button>
        </div>
      </form>

      {message && !isSuccess ? (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm">{message}</p>
        </div>
      ) : null}
    </div>
  );
}
