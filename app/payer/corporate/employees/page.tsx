"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Plus,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  listEmployees,
  createEmployee,
  updateEmployee,
  type SpgEmployeeRecord,
} from "@/lib/payer-portal-api";
import { usePortalSession } from "@/lib/use-portal-session";
import { PortalAuthGuard } from "@/components/portal/PortalAuthGuard";
import { PortalSubnav } from "@/components/portal/PortalSubnav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function moneyFormat(value: number) {
  return new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(value);
}

type EditingRow = {
  employeeName: string;
  employeeIdentityNo: string;
  deductionAmount: string;
};

export default function EmployeesPage() {
  const session = usePortalSession();
  const payerId = session?.payerId || 0;

  const [employees, setEmployees] = useState<SpgEmployeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<EditingRow>({ employeeName: "", employeeIdentityNo: "", deductionAmount: "" });

  const [addingNew, setAddingNew] = useState(false);
  const [newRow, setNewRow] = useState<EditingRow>({ employeeName: "", employeeIdentityNo: "", deductionAmount: "" });

  const [saving, setSaving] = useState(false);

  async function fetchEmployees() {
    if (!payerId) return;
    setLoading(true);
    setError("");
    try {
      const res = await listEmployees(payerId);
      setEmployees(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuatkan senarai kakitangan");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (payerId) fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payerId]);

  function startEdit(emp: SpgEmployeeRecord) {
    setEditingId(emp.id);
    setEditingData({
      employeeName: emp.employeeName,
      employeeIdentityNo: emp.employeeIdentityNo,
      deductionAmount: emp.deductionAmount != null ? String(emp.deductionAmount) : "",
    });
    setAddingNew(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingData({ employeeName: "", employeeIdentityNo: "", deductionAmount: "" });
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await updateEmployee(editingId, {
        employeeName: editingData.employeeName.trim(),
        employeeIdentityNo: editingData.employeeIdentityNo.replace(/[^A-Za-z0-9]/g, "").toUpperCase(),
        deductionAmount: editingData.deductionAmount ? Number(editingData.deductionAmount) : null,
      });
      setMessage("Kakitangan berjaya dikemaskini.");
      setEditingId(null);
      await fetchEmployees();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengemaskini kakitangan");
    } finally {
      setSaving(false);
    }
  }

  async function saveNewRow() {
    if (!newRow.employeeName.trim() || !newRow.employeeIdentityNo.trim()) {
      setError("Nama dan No. IC wajib diisi.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await createEmployee(payerId, {
        employeeName: newRow.employeeName.trim(),
        employeeIdentityNo: newRow.employeeIdentityNo.replace(/[^A-Za-z0-9]/g, "").toUpperCase(),
        deductionAmount: newRow.deductionAmount ? Number(newRow.deductionAmount) : null,
      });
      setMessage("Kakitangan berjaya ditambah.");
      setAddingNew(false);
      setNewRow({ employeeName: "", employeeIdentityNo: "", deductionAmount: "" });
      await fetchEmployees();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menambah kakitangan");
    } finally {
      setSaving(false);
    }
  }

  const activeCount = employees.filter((e) => e.employmentStatus === "active" || !e.employmentStatus).length;
  const totalDeduction = employees.reduce((sum, e) => sum + (Number(e.deductionAmount) || 0), 0);

  return (
    <PortalAuthGuard expected="corporate">
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[calc(100vh-6rem)] w-screen overflow-hidden portal-cosmic-bg py-6 md:py-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full portal-orb-1 blur-3xl animate-[float_9s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -left-10 -bottom-8 h-40 w-40 rounded-full portal-orb-2 blur-3xl animate-[float_11s_ease-in-out_infinite]" />

        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 md:px-6">
          {session && session.payerType !== "individu" ? <PortalSubnav role="corporate" session={session} variant="onDark" /> : null}

          {/* Header */}
          <div>
            <h1 className="text-xl font-semibold text-white">Kemaskini Kakitangan</h1>
            <p className="text-sm text-purple-100">
              Urus senarai kakitangan syarikat untuk kegunaan potongan gaji (SPG).
            </p>
          </div>

          {/* Alerts */}
          {message && (
            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              {message}
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/20 shadow-md">
            <div className="portal-card px-4 py-4 text-center">
              <p className="text-xs text-slate-400">Jumlah Kakitangan</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{employees.length}</p>
            </div>
            <div className="portal-card px-4 py-4 text-center">
              <p className="text-xs text-slate-400">Aktif</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">{activeCount}</p>
            </div>
            <div className="portal-card px-4 py-4 text-center">
              <p className="text-xs text-slate-400">Jumlah Potongan Bulanan</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{moneyFormat(totalDeduction)}</p>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-white/20 portal-card shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-slate-400" />
                <h2 className="text-base font-semibold text-slate-900">Senarai Kakitangan</h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  setAddingNew(true);
                  setEditingId(null);
                  setNewRow({ employeeName: "", employeeIdentityNo: "", deductionAmount: "" });
                }}
                disabled={addingNew}
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Pekerja
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center px-6 py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
              </div>
            ) : (
              <div className="overflow-x-auto px-4 py-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="w-8 px-2 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">#</th>
                      <th className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Nama Pekerja</th>
                      <th className="w-40 px-2 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">No. IC</th>
                      <th className="w-36 px-2 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Amaun Potongan (RM)</th>
                      <th className="w-24 px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                      <th className="w-24 px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {addingNew && (
                      <tr className="bg-blue-50/50">
                        <td className="px-2 py-2 text-xs text-slate-400">-</td>
                        <td className="px-2 py-2">
                          <Input
                            className="h-8 text-sm"
                            value={newRow.employeeName}
                            onChange={(e) => setNewRow({ ...newRow, employeeName: e.target.value })}
                            placeholder="Nama pekerja"
                            autoFocus
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            className="h-8 w-40 text-sm"
                            value={newRow.employeeIdentityNo}
                            onChange={(e) => setNewRow({ ...newRow, employeeIdentityNo: e.target.value })}
                            placeholder="No. IC"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            className="h-8 w-36 text-sm text-right"
                            type="number"
                            step="0.01"
                            min="0"
                            value={newRow.deductionAmount}
                            onChange={(e) => setNewRow({ ...newRow, deductionAmount: e.target.value })}
                            placeholder="0.00"
                          />
                        </td>
                        <td className="px-2 py-2 text-center">
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Aktif</span>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={saveNewRow}
                              disabled={saving}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-emerald-600 transition hover:bg-emerald-50"
                              title="Simpan"
                            >
                              <Save className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setAddingNew(false)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                              title="Batal"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                    {employees.map((emp, idx) => {
                      const isEditing = editingId === emp.id;
                      const isActive = emp.employmentStatus === "active" || !emp.employmentStatus;
                      return (
                        <tr key={emp.id} className="group">
                          <td className="px-2 py-2 text-xs text-slate-400">{idx + 1}</td>
                          <td className="px-2 py-2">
                            {isEditing ? (
                              <Input
                                className="h-8 text-sm"
                                value={editingData.employeeName}
                                onChange={(e) => setEditingData({ ...editingData, employeeName: e.target.value })}
                              />
                            ) : (
                              <span className="text-sm font-medium text-slate-800">{emp.employeeName}</span>
                            )}
                          </td>
                          <td className="px-2 py-2">
                            {isEditing ? (
                              <Input
                                className="h-8 w-40 text-sm"
                                value={editingData.employeeIdentityNo}
                                onChange={(e) => setEditingData({ ...editingData, employeeIdentityNo: e.target.value })}
                              />
                            ) : (
                              <span className="text-sm text-slate-600">{emp.employeeIdentityNo}</span>
                            )}
                          </td>
                          <td className="px-2 py-2">
                            {isEditing ? (
                              <Input
                                className="h-8 w-36 text-sm text-right"
                                type="number"
                                step="0.01"
                                min="0"
                                value={editingData.deductionAmount}
                                onChange={(e) => setEditingData({ ...editingData, deductionAmount: e.target.value })}
                              />
                            ) : (
                              <span className="text-sm text-slate-600">
                                {emp.deductionAmount != null ? moneyFormat(Number(emp.deductionAmount)) : "-"}
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-2 text-center">
                            {isActive ? (
                              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Aktif</span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">Tidak Aktif</span>
                            )}
                          </td>
                          <td className="px-2 py-2 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={saveEdit}
                                  disabled={saving}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-emerald-600 transition hover:bg-emerald-50"
                                  title="Simpan"
                                >
                                  <Save className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                  title="Batal"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => startEdit(emp)}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 opacity-0 transition hover:bg-blue-50 hover:text-blue-600 group-hover:opacity-100"
                                  title="Edit"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {employees.length === 0 && !addingNew && (
                      <tr>
                        <td colSpan={6} className="px-2 py-12 text-center text-sm text-slate-400">
                          Tiada kakitangan didaftarkan lagi. Klik &quot;Tambah Pekerja&quot; untuk mula.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </PortalAuthGuard>
  );
}
