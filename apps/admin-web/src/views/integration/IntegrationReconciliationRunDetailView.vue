<script setup lang="ts">
import { ref, computed, onMounted, watch, unref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Search,
  Link2,
  Shield,
  Loader2,
  Eye,
  RefreshCw,
} from "lucide-vue-next";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { useDraggableModal } from "@/composables/useDraggableModal";
import {
  getReconciliationRun,
  getReconciliationResults,
  runReconciliation,
  getAIAssistSuggestions,
  applyReconciliationMatch,
  applyReconciliationMatchBatch,
  applyReconciliationMatchOneToMany,
  applyReconciliationMatchOneToManyBatch,
  applyReconciliationMatchManyToMany,
  applyReconciliationMatchManyToManyBatch,
  searchInternalForMatch,
  listInternalForMatch,
  listGuestPaymentsForMatch,
  listBankStatementForMatch,
  getInternalTxDetail,
  getStagingTxDetail,
  type ReconciliationRun,
  type ReconciliationResultRow,
  type AISuggestedMatch,
  type SearchInternalResult,
  type GuestPaymentForMatch,
  type InternalSourceType,
  type InternalTxDetail,
  type ManyToManyLink,
} from "@/api/integration";

const route = useRoute();
const router = useRouter();
const fileId = computed(() => Number(route.params.fileId));

const run = ref<ReconciliationRun | null>(null);
const results = ref<ReconciliationResultRow[]>([]);
const loading = ref(true);
const error = ref("");
const runningRecon = ref(false);
const activeTab = ref<"matched" | "unmatched" | "variance" | "duplicate" | "actions">("matched");

const matchedResults = computed(() => results.value.filter((r) => r.matchStatus === "MATCHED"));
const unmatchedResults = computed(() => results.value.filter((r) => r.matchStatus === "UNMATCHED"));
const unmatchedSearchQuery = ref("");
const filteredUnmatchedResults = computed(() => {
  const q = unmatchedSearchQuery.value.trim().toLowerCase();
  if (!q) return unmatchedResults.value;
  return unmatchedResults.value.filter((r) => {
    const ic = (r.stagingTx?.payerIc ?? "").toLowerCase();
    const name = (r.stagingTx?.payerName ?? "").toLowerCase();
    const ref = (r.stagingTx?.sourceTxRef ?? "").toLowerCase();
    const amount = String(r.stagingTx?.amount ?? "").toLowerCase();
    const date = (r.stagingTx?.txDate ?? "").toLowerCase();
    return ic.includes(q) || name.includes(q) || ref.includes(q) || amount.includes(q) || date.includes(q);
  });
});
const varianceResults = computed(() => results.value.filter((r) => r.matchStatus === "MISMATCH"));
const duplicateResults = computed(() => results.value.filter((r) => r.matchStatus === "DUPLICATE"));
const allActions = computed(() =>
  results.value.flatMap((r) =>
    (r.actions ?? []).map((a) => ({ ...a, reconId: r.id, stagingTx: r.stagingTx })),
  ).sort((a, b) => new Date(b.actedAt).getTime() - new Date(a.actedAt).getTime()),
);

const manualMatchModal = ref<{ open: boolean; row: ReconciliationResultRow | null }>({ open: false, row: null });
const forceMatchModal = ref<{ open: boolean; row: ReconciliationResultRow | null }>({ open: false, row: null });
const siasatModal = ref<{ open: boolean; row: ReconciliationResultRow | null }>({ open: false, row: null });
const siasatInternalDetail = ref<InternalTxDetail | null>(null);
const siasatLoading = ref(false);

const dragManualMatch = useDraggableModal();
const dragOneToMany = useDraggableModal();
const dragBatchManyToOne = useDraggableModal();
const dragBatchOneToMany = useDraggableModal();
const dragManyToMany = useDraggableModal();
const dragForceMatch = useDraggableModal();
const dragSiasat = useDraggableModal();

const manualMatchSearchQuery = ref("");
const manualMatchTableData = ref<GuestPaymentForMatch[]>([]);
const manualMatchTableLoading = ref(false);
const manualMatchTableTotal = ref(0);
const manualMatchPage = ref(0);
const manualMatchPageSize = 50;
const manualMatchSelectedIds = ref<Set<string>>(new Set());
const manualMatchApplyLoading = ref(false);

const selectedUnmatchedIds = ref<Set<number>>(new Set());
const batchManyToOneModal = ref(false);
const batchTableQuery = ref("");
const batchTableData = ref<GuestPaymentForMatch[]>([]);
const batchTableLoading = ref(false);
const batchTableTotal = ref(0);
const batchPage = ref(0);
const batchPageSize = 50;
const batchSelected = ref<GuestPaymentForMatch | null>(null);
const batchManyToOneApplyLoading = ref(false);
const internalSourceType = ref<InternalSourceType>("GuestPayment");

const oneToManyModal = ref<{ open: boolean; row: ReconciliationResultRow | null }>({ open: false, row: null });
const oneToManySearchQuery = ref("");
const oneToManySearchResults = ref<SearchInternalResult[]>([]);
const oneToManySearchLoading = ref(false);
const oneToManySelectedIds = ref<Set<string>>(new Set());
const oneToManyApplyLoading = ref(false);

function openBatchOneToManyModal() {
  if (selectedUnmatchedCount.value === 0) return;
  batchOneToManyModal.value = true;
  batchOneToManyActiveIndex.value = 0;
  batchOneToManyTableQuery.value = "";
  batchOneToManyPage.value = 0;
  batchOneToManySelectedIds.value = new Set();
  batchOneToManyItems.value = unmatchedResults.value
    .filter((r) => selectedUnmatchedIds.value.has(r.id))
    .map((row) => ({ row, selected: [] as SearchInternalResult[] }));
  fetchBatchOneToManyTable();
}

function closeBatchOneToManyModal() {
  batchOneToManyModal.value = false;
  batchOneToManyItems.value = [];
  selectedUnmatchedIds.value = new Set();
  dragBatchOneToMany.resetPosition();
}

const batchOneToManyActiveIndex = ref(0);
const batchOneToManyTableQuery = ref("");
const batchOneToManyTableData = ref<GuestPaymentForMatch[]>([]);
const batchOneToManyTableLoading = ref(false);
const batchOneToManyTableTotal = ref(0);
const batchOneToManyPage = ref(0);
const batchOneToManyPageSize = 50;
const batchOneToManySelectedIds = ref<Set<string>>(new Set());

async function fetchBatchOneToManyTable() {
  if (!fileId.value || !Number.isInteger(fileId.value)) return;
  batchOneToManyTableLoading.value = true;
  try {
    const src = (run.value?.source ?? "").toUpperCase();
    const refHint = results.value[0]?.stagingTx?.sourceTxRef ?? "";
    const isPspSource = ["BILPIZ", "AMIL_BILPIZ02"].includes(src) || (!src && /^BILPIZ-/i.test(refHint));
    const isBankSource = ["JAN", "BANK_ISLAM", "MAYBANK"].includes(src) || (!src && /^JAN-/i.test(refHint));
    const params = { limit: batchOneToManyPageSize, offset: batchOneToManyPage.value * batchOneToManyPageSize, search: batchOneToManyTableQuery.value.trim() || undefined };
    let res: Awaited<ReturnType<typeof listInternalForMatch>>;
    if (isBankSource) {
      res = await listBankStatementForMatch(params);
      internalSourceType.value = "BankStatement";
    } else if (isPspSource) {
      res = await listInternalForMatch(fileId.value, params);
      if (!res.data || res.data.length === 0) res = await listGuestPaymentsForMatch(params);
      internalSourceType.value = "GuestPayment";
    } else {
      res = await listInternalForMatch(fileId.value, params);
      if (!res.data || res.data.length === 0) res = await listBankStatementForMatch(params);
      internalSourceType.value = (res.meta?.internalSourceType as InternalSourceType) ?? "GuestPayment";
    }
    batchOneToManyTableData.value = res.data ?? [];
    batchOneToManyTableTotal.value = res.meta?.total ?? 0;
  } catch {
    batchOneToManyTableData.value = [];
    batchOneToManyTableTotal.value = 0;
  } finally {
    batchOneToManyTableLoading.value = false;
  }
}

function toggleBatchOneToManySelect(internalTxId: string) {
  const next = new Set(batchOneToManySelectedIds.value);
  if (next.has(internalTxId)) next.delete(internalTxId);
  else next.add(internalTxId);
  batchOneToManySelectedIds.value = next;
}

function toggleBatchOneToManySelectAll() {
  const ids = batchOneToManyTableData.value.map((r) => r.internalTxId);
  const allSelected = ids.every((id) => batchOneToManySelectedIds.value.has(id));
  if (allSelected) {
    const next = new Set(batchOneToManySelectedIds.value);
    ids.forEach((id) => next.delete(id));
    batchOneToManySelectedIds.value = next;
  } else {
    const next = new Set(batchOneToManySelectedIds.value);
    ids.forEach((id) => next.add(id));
    batchOneToManySelectedIds.value = next;
  }
}

function addSelectedToBatchOneToManyRow() {
  const idx = batchOneToManyActiveIndex.value;
  const ids = batchOneToManySelectedIds.value;
  const items = [...batchOneToManyItems.value];
  const sel = items[idx]?.selected ?? [];
  const toAdd = batchOneToManyTableData.value.filter((r) => ids.has(r.internalTxId) && !sel.some((s) => s.internalTxId === r.internalTxId));
  if (toAdd.length === 0) return;
  items[idx] = { ...items[idx], selected: [...sel, ...toAdd] };
  batchOneToManyItems.value = items;
  batchOneToManySelectedIds.value = new Set();
}

const batchOneToManyTotalPages = computed(() => Math.max(1, Math.ceil(batchOneToManyTableTotal.value / batchOneToManyPageSize)));

const batchOneToManyModal = ref(false);
const batchOneToManyItems = ref<Array<{ row: ReconciliationResultRow; selected: SearchInternalResult[] }>>([]);
const batchOneToManyApplyLoading = ref(false);

function addToBatchOneToManyItem(index: number, r: SearchInternalResult) {
  const items = [...batchOneToManyItems.value];
  const sel = items[index].selected;
  if (sel.some((s) => s.internalTxId === r.internalTxId)) return;
  items[index] = { ...items[index], selected: [...sel, r] };
  batchOneToManyItems.value = items;
}

function removeFromBatchOneToManyItem(index: number, internalTxId: string) {
  const items = [...batchOneToManyItems.value];
  items[index] = {
    ...items[index],
    selected: items[index].selected.filter((s) => s.internalTxId !== internalTxId),
  };
  batchOneToManyItems.value = items;
}

function getBatchOneToManyItemTotal(index: number): number {
  return batchOneToManyItems.value[index]?.selected.reduce((s, r) => s + r.amount, 0) ?? 0;
}

const batchOneToManyAllValid = computed(() =>
  batchOneToManyItems.value.every((item, i) => {
    const total = getBatchOneToManyItemTotal(i);
    const stagingAmount = Number(item.row.stagingTx.amount);
    const tol = 0.01;
    return item.selected.length >= 2 && total >= stagingAmount * (1 - tol) && total <= stagingAmount * (1 + tol);
  }),
);

async function handleBatchOneToManyApply() {
  const items = batchOneToManyItems.value;
  if (!batchOneToManyAllValid.value || items.length === 0) return;
  const payload = items.map((item) => ({
    reconResultId: item.row.id,
    internalTxIds: item.selected.map((s) => s.internalTxId),
  }));
  batchOneToManyApplyLoading.value = true;
  try {
    const res = await applyReconciliationMatchOneToManyBatch(payload);
    const failed = res.results?.filter((r) => !r.success) ?? [];
    if (failed.length > 0) {
      alert(`Sebahagian gagal: ${failed.map((f) => f.error).join("; ")}`);
    }
    closeBatchOneToManyModal();
    await load();
  } catch (e) {
    alert(e instanceof Error ? e.message : "Gagal apply batch one-to-many");
  } finally {
    batchOneToManyApplyLoading.value = false;
  }
}

// Phase 3: Many-to-many (N:M)
const manyToManyModal = ref(false);
const manyToManyTableQuery = ref("");
const manyToManyTableData = ref<GuestPaymentForMatch[]>([]);
const manyToManyTableLoading = ref(false);
const manyToManyTableTotal = ref(0);
const manyToManyPage = ref(0);
const manyToManyPageSize = 50;
const manyToManySelectedIds = ref<Set<string>>(new Set());
const manyToManyApplyLoading = ref(false);
const manyToManyBatchApplyLoading = ref(false);
const activeManyToManyGroupIndex = ref(0);

const manyToManyGroups = ref<
  Array<{
    stagingRows: ReconciliationResultRow[];
    internalSelected: SearchInternalResult[];
    allocations: Record<string, number>;
  }>
>([]);

function openManyToManyModal() {
  if (selectedUnmatchedCount.value === 0) return;
  manyToManyModal.value = true;
  manyToManyTableQuery.value = "";
  manyToManyPage.value = 0;
  manyToManySelectedIds.value = new Set();
  fetchManyToManyTable();
  activeManyToManyGroupIndex.value = 0;
  manyToManyGroups.value = [
    {
      stagingRows: unmatchedResults.value.filter((r) => selectedUnmatchedIds.value.has(r.id)),
      internalSelected: [],
      allocations: {},
    },
  ];
}

function closeManyToManyModal() {
  manyToManyModal.value = false;
  manyToManyGroups.value = [];
  selectedUnmatchedIds.value = new Set();
  dragManyToMany.resetPosition();
}

async function fetchManyToManyTable() {
  if (!fileId.value || !Number.isInteger(fileId.value)) return;
  manyToManyTableLoading.value = true;
  try {
    const src = (run.value?.source ?? "").toUpperCase();
    const refHint = results.value[0]?.stagingTx?.sourceTxRef ?? "";
    const isPspSource = ["BILPIZ", "AMIL_BILPIZ02"].includes(src) || (!src && /^BILPIZ-/i.test(refHint));
    const isBankSource = ["JAN", "BANK_ISLAM", "MAYBANK"].includes(src) || (!src && /^JAN-/i.test(refHint));
    const params = { limit: manyToManyPageSize, offset: manyToManyPage.value * manyToManyPageSize, search: manyToManyTableQuery.value.trim() || undefined };
    let res: Awaited<ReturnType<typeof listInternalForMatch>>;
    if (isBankSource) {
      res = await listBankStatementForMatch(params);
      internalSourceType.value = "BankStatement";
    } else if (isPspSource) {
      res = await listInternalForMatch(fileId.value, params);
      if (!res.data || res.data.length === 0) res = await listGuestPaymentsForMatch(params);
      internalSourceType.value = "GuestPayment";
    } else {
      res = await listInternalForMatch(fileId.value, params);
      if (!res.data || res.data.length === 0) res = await listBankStatementForMatch(params);
      internalSourceType.value = (res.meta?.internalSourceType as InternalSourceType) ?? "GuestPayment";
    }
    manyToManyTableData.value = res.data ?? [];
    manyToManyTableTotal.value = res.meta?.total ?? 0;
  } catch {
    manyToManyTableData.value = [];
    manyToManyTableTotal.value = 0;
  } finally {
    manyToManyTableLoading.value = false;
  }
}

function toggleManyToManySelect(internalTxId: string) {
  const next = new Set(manyToManySelectedIds.value);
  if (next.has(internalTxId)) next.delete(internalTxId);
  else next.add(internalTxId);
  manyToManySelectedIds.value = next;
}

function toggleManyToManySelectAll() {
  const ids = manyToManyTableData.value.map((r) => r.internalTxId);
  const allSelected = ids.every((id) => manyToManySelectedIds.value.has(id));
  if (allSelected) {
    const next = new Set(manyToManySelectedIds.value);
    ids.forEach((id) => next.delete(id));
    manyToManySelectedIds.value = next;
  } else {
    const next = new Set(manyToManySelectedIds.value);
    ids.forEach((id) => next.add(id));
    manyToManySelectedIds.value = next;
  }
}

function addSelectedToManyToManyGroup() {
  const gi = activeManyToManyGroupIndex.value;
  const g = manyToManyGroups.value[gi];
  if (!g) return;
  const ids = manyToManySelectedIds.value;
  const toAdd = manyToManyTableData.value.filter((r) => ids.has(r.internalTxId) && !g.internalSelected.some((s) => s.internalTxId === r.internalTxId));
  if (toAdd.length === 0) return;
  const groups = [...manyToManyGroups.value];
  groups[gi] = { ...g, internalSelected: [...g.internalSelected, ...toAdd] };
  manyToManyGroups.value = groups;
  manyToManySelectedIds.value = new Set();
}

const manyToManyTotalPages = computed(() => Math.max(1, Math.ceil(manyToManyTableTotal.value / manyToManyPageSize)));

function addManyToManyInternal(r: SearchInternalResult, groupIndex?: number) {
  const idx = groupIndex ?? activeManyToManyGroupIndex.value;
  const groups = [...manyToManyGroups.value];
  const g = groups[idx];
  if (!g || g.internalSelected.some((s) => s.internalTxId === r.internalTxId)) return;
  groups[idx] = { ...g, internalSelected: [...g.internalSelected, r] };
  manyToManyGroups.value = groups;
}

function removeManyToManyInternal(internalTxId: string, groupIndex?: number) {
  const idx = groupIndex ?? activeManyToManyGroupIndex.value;
  const groups = [...manyToManyGroups.value];
  const g = groups[idx];
  if (!g) return;
  groups[idx] = {
    ...g,
    internalSelected: g.internalSelected.filter((s) => s.internalTxId !== internalTxId),
    allocations: Object.fromEntries(
      Object.entries(g.allocations).filter(([k]) => !k.endsWith(`-${internalTxId}`)),
    ),
  };
  manyToManyGroups.value = groups;
}

function getManyToManyAlloc(reconId: number, internalTxId: string, groupIndex?: number): number {
  const idx = groupIndex ?? activeManyToManyGroupIndex.value;
  const g = manyToManyGroups.value[idx];
  return g?.allocations[`${reconId}-${internalTxId}`] ?? 0;
}

function setManyToManyAlloc(reconId: number, internalTxId: string, val: number, groupIndex?: number) {
  const idx = groupIndex ?? activeManyToManyGroupIndex.value;
  const groups = [...manyToManyGroups.value];
  const g = groups[idx];
  if (!g) return;
  const key = `${reconId}-${internalTxId}`;
  groups[idx] = { ...g, allocations: { ...g.allocations, [key]: Number(val) || 0 } };
  manyToManyGroups.value = groups;
}

function getStagingRowsForGroup(groupIndex: number): ReconciliationResultRow[] {
  const g = manyToManyGroups.value[groupIndex];
  return g?.stagingRows ?? [];
}

function getInternalForGroup(groupIndex: number): SearchInternalResult[] {
  const g = manyToManyGroups.value[groupIndex];
  return g?.internalSelected ?? [];
}

const manyToManyValid = computed(() => manyToManyGroupValid(0));

function buildManyToManyLinks(
  staging: ReconciliationResultRow[],
  internal: SearchInternalResult[],
  allocations: Record<string, number>,
): ManyToManyLink[] {
  const links: ManyToManyLink[] = [];
  for (const row of staging) {
    for (const i of internal) {
      const amt = allocations[`${row.id}-${i.internalTxId}`] ?? 0;
      if (amt > 0) links.push({ reconResultId: row.id, internalTxId: i.internalTxId, amountAllocated: amt });
    }
  }
  return links;
}

const manyToManyGroupValid = (groupIndex: number) => {
  const staging = getStagingRowsForGroup(groupIndex);
  const internal = getInternalForGroup(groupIndex);
  const g = manyToManyGroups.value[groupIndex];
  const allocations = g?.allocations ?? {};
  if (staging.length < 2 && internal.length < 2) return false;
  const tol = 0.01;
  for (const row of staging) {
    const sum = internal.reduce((s, i) => s + (allocations[`${row.id}-${i.internalTxId}`] ?? 0), 0);
    const amt = Number(row.stagingTx.amount);
    if (sum < amt * (1 - tol) || sum > amt * (1 + tol)) return false;
  }
  for (const i of internal) {
    const sum = staging.reduce((s, r) => s + (allocations[`${r.id}-${i.internalTxId}`] ?? 0), 0);
    if (sum > i.linkedInfo.remainingAmount * (1 + tol)) return false;
  }
  return true;
};

const manyToManyAllGroupsValid = computed(() =>
  manyToManyGroups.value.every((_, i) => manyToManyGroupValid(i)),
);

const manyToManySingleMode = computed(() => manyToManyGroups.value.length === 1);

async function handleManyToManyApply() {
  const g = manyToManyGroups.value[0];
  if (!g || !manyToManyValid.value || g.stagingRows.length === 0 || g.internalSelected.length === 0) return;
  const links = buildManyToManyLinks(g.stagingRows, g.internalSelected, g.allocations);
  if (links.length === 0) {
    alert("Sila masukkan peruntukan amaun.");
    return;
  }
  manyToManyApplyLoading.value = true;
  try {
    await applyReconciliationMatchManyToMany(links);
    closeManyToManyModal();
    await load();
  } catch (e) {
    alert(e instanceof Error ? e.message : "Gagal apply N:M");
  } finally {
    manyToManyApplyLoading.value = false;
  }
}

async function handleManyToManyBatchApply() {
  const groups = manyToManyGroups.value
    .map((g) => buildManyToManyLinks(g.stagingRows, g.internalSelected, g.allocations))
    .filter((links) => links.length > 0);
  if (groups.length === 0) {
    alert("Tiada kumpulan yang sah.");
    return;
  }
  manyToManyBatchApplyLoading.value = true;
  try {
    const res = await applyReconciliationMatchManyToManyBatch(groups.map((links) => ({ links })));
    const failed = res.results?.filter((r) => !r.success) ?? [];
    if (failed.length > 0) {
      alert(`Sebahagian gagal: ${failed.map((f) => f.error).join("; ")}`);
    }
    closeManyToManyModal();
    await load();
  } catch (e) {
    alert(e instanceof Error ? e.message : "Gagal apply batch N:M");
  } finally {
    manyToManyBatchApplyLoading.value = false;
  }
}

function addManyToManyGroup() {
  const first = manyToManyGroups.value[0];
  if (!first || first.stagingRows.length < 2) {
    alert("Perlu sekurang-kurangnya 2 staging dalam kumpulan pertama untuk dibahagikan.");
    return;
  }
  const mid = Math.ceil(first.stagingRows.length / 2);
  const group1Rows = first.stagingRows.slice(0, mid);
  const group2Rows = first.stagingRows.slice(mid);
  manyToManyGroups.value = [
    { ...first, stagingRows: group1Rows, internalSelected: [], allocations: {} },
    { stagingRows: group2Rows, internalSelected: [], allocations: {} },
  ];
  activeManyToManyGroupIndex.value = 1;
}

function setManyToManyGroupStaging(groupIndex: number, rows: ReconciliationResultRow[]) {
  const groups = [...manyToManyGroups.value];
  groups[groupIndex] = { ...groups[groupIndex], stagingRows: rows };
  manyToManyGroups.value = groups;
}

function removeManyToManyGroup(index: number) {
  manyToManyGroups.value = manyToManyGroups.value.filter((_, i) => i !== index);
}

const aiSuggestions = ref<AISuggestedMatch[]>([]);
const aiAssistLoading = ref(false);
const aiAssistError = ref("");
const selectedAISuggestionIds = ref<Set<number>>(new Set());
const batchApplyLoading = ref(false);

async function fetchRun() {
  if (!fileId.value || !Number.isInteger(fileId.value)) return;
  loading.value = true;
  error.value = "";
  try {
    const res = await getReconciliationRun(fileId.value);
    run.value = res.data ?? null;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Gagal memuatkan";
    run.value = null;
  } finally {
    loading.value = false;
  }
}

async function fetchResults() {
  if (!fileId.value || !Number.isInteger(fileId.value)) return;
  try {
    const res = await getReconciliationResults(fileId.value);
    results.value = res.data ?? [];
  } catch {
    results.value = [];
  }
}

async function load() {
  await Promise.all([fetchRun(), fetchResults()]);
}

async function handleRunReconciliation(rerun = false) {
  if (!fileId.value) return;
  runningRecon.value = true;
  try {
    await runReconciliation(fileId.value, rerun);
    await load();
  } catch (e) {
    alert(e instanceof Error ? e.message : "Reconciliation failed");
  } finally {
    runningRecon.value = false;
  }
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

function formatDateTime(d: string) {
  try {
    return new Date(d).toLocaleString("ms-MY", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return d;
  }
}

function statusBadgeClass(status: string) {
  const map: Record<string, string> = {
    MATCHED: "bg-emerald-100 text-emerald-700",
    UNMATCHED: "bg-amber-100 text-amber-700",
    MISMATCH: "bg-red-100 text-red-700",
    DUPLICATE: "bg-slate-100 text-slate-600",
  };
  return map[status] ?? "bg-slate-100 text-slate-600";
}

async function fetchManualMatchTable() {
  if (!manualMatchModal.value.row || !fileId.value || !Number.isInteger(fileId.value)) return;
  manualMatchTableLoading.value = true;
  try {
    const src = (run.value?.source ?? "").toUpperCase();
    const refHint = results.value[0]?.stagingTx?.sourceTxRef ?? "";
    const isPspSource = ["BILPIZ", "AMIL_BILPIZ02"].includes(src) || (!src && /^BILPIZ-/i.test(refHint));
    const isBankSource = ["JAN", "BANK_ISLAM", "MAYBANK"].includes(src) || (!src && /^JAN-/i.test(refHint));
    const params = {
      limit: manualMatchPageSize,
      offset: manualMatchPage.value * manualMatchPageSize,
      search: manualMatchSearchQuery.value.trim() || undefined,
    };
    let res: Awaited<ReturnType<typeof listInternalForMatch>>;
    if (isBankSource) {
      res = await listBankStatementForMatch(params);
      internalSourceType.value = "BankStatement";
    } else if (isPspSource) {
      res = await listInternalForMatch(fileId.value, params);
      if (!res.data || res.data.length === 0) res = await listGuestPaymentsForMatch(params);
      internalSourceType.value = "GuestPayment";
    } else {
      res = await listInternalForMatch(fileId.value, params);
      if (!res.data || res.data.length === 0) res = await listBankStatementForMatch(params);
      internalSourceType.value = (res.meta?.internalSourceType as InternalSourceType) ?? "GuestPayment";
    }
    manualMatchTableData.value = res.data ?? [];
    manualMatchTableTotal.value = res.meta?.total ?? 0;
  } catch {
    manualMatchTableData.value = [];
    manualMatchTableTotal.value = 0;
  } finally {
    manualMatchTableLoading.value = false;
  }
}

function openManualMatch(row: ReconciliationResultRow) {
  manualMatchModal.value = { open: true, row };
  manualMatchSearchQuery.value = "";
  manualMatchPage.value = 0;
  manualMatchSelectedIds.value = new Set();
  fetchManualMatchTable();
}

function openForceMatch(row: ReconciliationResultRow) {
  forceMatchModal.value = { open: true, row };
}

function closeManualMatch() {
  manualMatchModal.value = { open: false, row: null };
  manualMatchSearchQuery.value = "";
  manualMatchTableData.value = [];
  manualMatchSelectedIds.value = new Set();
  dragManualMatch.resetPosition();
}

async function handleManualMatchSearch() {
  manualMatchPage.value = 0;
  await fetchManualMatchTable();
}

function toggleManualMatchSelect(internalTxId: string) {
  const next = new Set(manualMatchSelectedIds.value);
  if (next.has(internalTxId)) next.delete(internalTxId);
  else next.add(internalTxId);
  manualMatchSelectedIds.value = next;
}

function toggleManualMatchSelectAll() {
  const ids = manualMatchTableData.value.map((r) => r.internalTxId);
  const allSelected = ids.every((id) => manualMatchSelectedIds.value.has(id));
  if (allSelected) {
    const next = new Set(manualMatchSelectedIds.value);
    ids.forEach((id) => next.delete(id));
    manualMatchSelectedIds.value = next;
  } else {
    const next = new Set(manualMatchSelectedIds.value);
    ids.forEach((id) => next.add(id));
    manualMatchSelectedIds.value = next;
  }
}

const manualMatchSelected = computed(() => {
  return manualMatchTableData.value.filter((r) => manualMatchSelectedIds.value.has(r.internalTxId));
});

const manualMatchTotalPages = computed(() =>
  Math.max(1, Math.ceil(manualMatchTableTotal.value / manualMatchPageSize)),
);

function toggleUnmatchedSelect(id: number) {
  const next = new Set(selectedUnmatchedIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selectedUnmatchedIds.value = next;
}

function toggleSelectAllUnmatched() {
  const filtered = filteredUnmatchedResults.value;
  const filteredIds = new Set(filtered.map((r) => r.id));
  const selectedInFiltered = filtered.filter((r) => selectedUnmatchedIds.value.has(r.id)).length;
  if (selectedInFiltered === filtered.length) {
    const next = new Set(selectedUnmatchedIds.value);
    filteredIds.forEach((id) => next.delete(id));
    selectedUnmatchedIds.value = next;
  } else {
    const next = new Set(selectedUnmatchedIds.value);
    filteredIds.forEach((id) => next.add(id));
    selectedUnmatchedIds.value = next;
  }
}

function openOneToManyModal(row: ReconciliationResultRow) {
  oneToManyModal.value = { open: true, row };
  oneToManySearchQuery.value = "";
  oneToManySearchResults.value = [];
  oneToManySelectedIds.value = new Set();
}

function closeOneToManyModal() {
  oneToManyModal.value = { open: false, row: null };
  oneToManySearchQuery.value = "";
  oneToManySearchResults.value = [];
  oneToManySelectedIds.value = new Set();
  dragOneToMany.resetPosition();
}

async function handleOneToManySearch() {
  if (!fileId.value || !oneToManyModal.value.row) return;
  const q = oneToManySearchQuery.value.trim();
  if (q.length < 2) {
    oneToManySearchResults.value = [];
    return;
  }
  oneToManySearchLoading.value = true;
  oneToManySearchResults.value = [];
  oneToManySelectedIds.value = new Set();
  try {
    const res = await searchInternalForMatch(fileId.value, q);
    oneToManySearchResults.value = res.data ?? [];
  } catch {
    oneToManySearchResults.value = [];
  } finally {
    oneToManySearchLoading.value = false;
  }
}

function toggleOneToManySelect(internalTxId: string) {
  const next = new Set(oneToManySelectedIds.value);
  if (next.has(internalTxId)) next.delete(internalTxId);
  else next.add(internalTxId);
  oneToManySelectedIds.value = next;
}

async function handleOneToManyApply() {
  const row = oneToManyModal.value.row;
  if (!row || oneToManySelectedIds.value.size < 2) return;
  const ids = Array.from(oneToManySelectedIds.value);
  const stagingAmount = Number(row.stagingTx.amount);
  const selectedTotal = oneToManySelectedTotal.value;
  const tolerance = 0.01;
  if (selectedTotal < stagingAmount * (1 - tolerance) || selectedTotal > stagingAmount * (1 + tolerance)) {
    alert(`Jumlah dalaman RM ${selectedTotal.toFixed(2)} tidak sepadan dengan staging RM ${stagingAmount.toFixed(2)}.`);
    return;
  }
  oneToManyApplyLoading.value = true;
  try {
    await applyReconciliationMatchOneToMany(row.id, ids);
    closeOneToManyModal();
    await load();
  } catch (e) {
    alert(e instanceof Error ? e.message : "Gagal apply one-to-many");
  } finally {
    oneToManyApplyLoading.value = false;
  }
}

async function fetchBatchTable() {
  if (!fileId.value || !Number.isInteger(fileId.value)) return;
  batchTableLoading.value = true;
  try {
    const src = (run.value?.source ?? "").toUpperCase();
    const refHint = results.value[0]?.stagingTx?.sourceTxRef ?? "";
    const isPspSource = ["BILPIZ", "AMIL_BILPIZ02"].includes(src) || (!src && /^BILPIZ-/i.test(refHint));
    const isBankSource = ["JAN", "BANK_ISLAM", "MAYBANK"].includes(src) || (!src && /^JAN-/i.test(refHint));
    const params = { limit: batchPageSize, offset: batchPage.value * batchPageSize, search: batchTableQuery.value.trim() || undefined };
    let res: Awaited<ReturnType<typeof listInternalForMatch>>;
    if (isBankSource) {
      res = await listBankStatementForMatch(params);
      internalSourceType.value = "BankStatement";
    } else if (isPspSource) {
      res = await listInternalForMatch(fileId.value, params);
      if (!res.data || res.data.length === 0) res = await listGuestPaymentsForMatch(params);
      internalSourceType.value = "GuestPayment";
    } else {
      res = await listInternalForMatch(fileId.value, params);
      if (!res.data || res.data.length === 0) res = await listBankStatementForMatch(params);
      internalSourceType.value = (res.meta?.internalSourceType as InternalSourceType) ?? "GuestPayment";
    }
    batchTableData.value = res.data ?? [];
    batchTableTotal.value = res.meta?.total ?? 0;
  } catch {
    batchTableData.value = [];
    batchTableTotal.value = 0;
  } finally {
    batchTableLoading.value = false;
  }
}

function openBatchManyToOneModal() {
  if (selectedUnmatchedCount.value === 0) return;
  batchManyToOneModal.value = true;
  batchTableQuery.value = "";
  batchPage.value = 0;
  batchSelected.value = null;
  fetchBatchTable();
}

function closeBatchManyToOneModal() {
  batchManyToOneModal.value = false;
  batchTableQuery.value = "";
  batchTableData.value = [];
  batchSelected.value = null;
  selectedUnmatchedIds.value = new Set();
  dragBatchManyToOne.resetPosition();
}

const batchTotalPages = computed(() => Math.max(1, Math.ceil(batchTableTotal.value / batchPageSize)));

async function handleBatchManyToOneApply() {
  const ids = Array.from(selectedUnmatchedIds.value);
  const selected = batchSelected.value;
  if (!ids.length || !selected) return;
  if (selectedUnmatchedTotal.value > selected.linkedInfo.remainingAmount) {
    alert(
      `Jumlah terpilih RM ${selectedUnmatchedTotal.value.toFixed(2)} melebihi baki dalaman RM ${selected.linkedInfo.remainingAmount.toFixed(2)}.`,
    );
    return;
  }
  batchManyToOneApplyLoading.value = true;
  try {
    await applyReconciliationMatchBatch(ids, selected.internalTxId);
    closeBatchManyToOneModal();
    await load();
  } catch (e) {
    alert(e instanceof Error ? e.message : "Gagal apply batch match");
  } finally {
    batchManyToOneApplyLoading.value = false;
  }
}

async function handleManualMatchApply() {
  const row = manualMatchModal.value.row;
  const selected = manualMatchSelected.value;
  if (!row || selected.length === 0) return;
  const stagingAmount = Number(row.stagingTx.amount);
  manualMatchApplyLoading.value = true;
  try {
    if (selected.length === 1) {
      const s = selected[0];
      if (stagingAmount > s.linkedInfo.remainingAmount) {
        alert(
          `Amaun staging RM ${stagingAmount.toFixed(2)} melebihi baki dalaman RM ${s.linkedInfo.remainingAmount.toFixed(2)}.`,
        );
        return;
      }
      await applyReconciliationMatch(row.id, s.internalTxId);
    } else {
      const internalTxIds = selected.map((s) => s.internalTxId);
      const totalSelected = selected.reduce((sum, s) => sum + s.amount, 0);
      const tolerance = 0.01;
      if (Math.abs(totalSelected - stagingAmount) / stagingAmount > tolerance) {
        alert(
          `Jumlah rekod terpilih RM ${totalSelected.toFixed(2)} tidak sepadan dengan staging RM ${stagingAmount.toFixed(2)} (toleransi 1%).`,
        );
        return;
      }
      await applyReconciliationMatchOneToMany(row.id, internalTxIds);
    }
    closeManualMatch();
    await load();
  } catch (e) {
    alert(e instanceof Error ? e.message : "Gagal apply match");
  } finally {
    manualMatchApplyLoading.value = false;
  }
}

function closeForceMatch() {
  forceMatchModal.value = { open: false, row: null };
  dragForceMatch.resetPosition();
}

async function openSiasat(row: ReconciliationResultRow) {
  siasatModal.value = { open: true, row };
  siasatInternalDetail.value = null;
  siasatLoading.value = true;
  try {
    if (row.matchRule === "STAGING_DUPLICATE" && row.stagingTx?.duplicates?.[0]?.matchedStagingTxId) {
      const res = await getStagingTxDetail(row.stagingTx.duplicates[0].matchedStagingTxId!);
      siasatInternalDetail.value = res.data ?? null;
    } else if (row.internalTxId) {
      const res = await getInternalTxDetail(row.internalTxId);
      siasatInternalDetail.value = res.data ?? null;
    }
  } catch {
    siasatInternalDetail.value = null;
  } finally {
    siasatLoading.value = false;
  }
}

function closeSiasat() {
  siasatModal.value = { open: false, row: null };
  siasatInternalDetail.value = null;
  dragSiasat.resetPosition();
}

async function handleAIAssist() {
  if (!fileId.value || !Number.isInteger(fileId.value)) return;
  aiAssistLoading.value = true;
  aiAssistError.value = "";
  aiSuggestions.value = [];
  selectedAISuggestionIds.value = new Set();
  try {
    const res = await getAIAssistSuggestions(fileId.value, 50);
    aiSuggestions.value = res.data?.suggestions ?? [];
  } catch (e) {
    aiAssistError.value = e instanceof Error ? e.message : "AI Assist gagal";
  } finally {
    aiAssistLoading.value = false;
  }
}

const aiSuggestionsToShow = computed(() =>
  aiSuggestions.value.filter((s) => s.suggestedInternalTxId && s.confidence >= 0.6),
);

const selectedAICount = computed(() =>
  aiSuggestionsToShow.value.filter((s) => selectedAISuggestionIds.value.has(s.reconResultId)).length,
);

const selectedUnmatchedCount = computed(() => selectedUnmatchedIds.value.size);
const selectedUnmatchedTotal = computed(() =>
  unmatchedResults.value
    .filter((r) => selectedUnmatchedIds.value.has(r.id))
    .reduce((sum, r) => sum + Number(r.stagingTx.amount), 0),
);

const oneToManySelectedTotal = computed(() =>
  oneToManySearchResults.value
    .filter((r) => oneToManySelectedIds.value.has(r.internalTxId))
    .reduce((sum, r) => sum + r.amount, 0),
);

function toggleSelectAISuggestion(reconResultId: number) {
  const next = new Set(selectedAISuggestionIds.value);
  if (next.has(reconResultId)) next.delete(reconResultId);
  else next.add(reconResultId);
  selectedAISuggestionIds.value = next;
}

function toggleSelectAllAISuggestions() {
  if (selectedAICount.value === aiSuggestionsToShow.value.length) {
    selectedAISuggestionIds.value = new Set();
  } else {
    selectedAISuggestionIds.value = new Set(aiSuggestionsToShow.value.map((s) => s.reconResultId));
  }
}

async function handleApplyAISuggestion(suggestion: AISuggestedMatch) {
  if (!suggestion.suggestedInternalTxId) return;
  try {
    await applyReconciliationMatch(suggestion.reconResultId, suggestion.suggestedInternalTxId, "ai_assist");
    const next = new Set(selectedAISuggestionIds.value);
    next.delete(suggestion.reconResultId);
    selectedAISuggestionIds.value = next;
    aiSuggestions.value = aiSuggestions.value.filter((s) => s.reconResultId !== suggestion.reconResultId);
    await fetchResults();
    await fetchRun();
  } catch (e) {
    alert(e instanceof Error ? e.message : "Gagal apply match");
  }
}

async function handleBatchApplyAISuggestions() {
  const toApply = aiSuggestionsToShow.value.filter((s) =>
    selectedAISuggestionIds.value.has(s.reconResultId) && s.suggestedInternalTxId,
  );
  if (toApply.length === 0) return;
  batchApplyLoading.value = true;
  try {
    for (const s of toApply) {
      await applyReconciliationMatch(s.reconResultId, s.suggestedInternalTxId!, "ai_assist");
      aiSuggestions.value = aiSuggestions.value.filter((x) => x.reconResultId !== s.reconResultId);
    }
    selectedAISuggestionIds.value = new Set();
    await fetchResults();
    await fetchRun();
  } catch (e) {
    alert(e instanceof Error ? e.message : "Gagal apply batch match");
  } finally {
    batchApplyLoading.value = false;
  }
}

function goBack() {
  router.push("/integration/3rd-party/reconciliation");
}

onMounted(load);
watch(fileId, load);

let manualMatchSearchTimeout: ReturnType<typeof setTimeout> | null = null;
watch(manualMatchSearchQuery, () => {
  if (!manualMatchModal.value.open) return;
  if (manualMatchSearchTimeout) clearTimeout(manualMatchSearchTimeout);
  manualMatchSearchTimeout = setTimeout(() => {
    manualMatchPage.value = 0;
    fetchManualMatchTable();
    manualMatchSearchTimeout = null;
  }, 300);
});

let batchTableSearchTimeout: ReturnType<typeof setTimeout> | null = null;
watch(batchTableQuery, () => {
  if (!batchManyToOneModal.value) return;
  if (batchTableSearchTimeout) clearTimeout(batchTableSearchTimeout);
  batchTableSearchTimeout = setTimeout(() => {
    batchPage.value = 0;
    fetchBatchTable();
    batchTableSearchTimeout = null;
  }, 300);
});

let batchOneToManyTableSearchTimeout: ReturnType<typeof setTimeout> | null = null;
watch(batchOneToManyTableQuery, () => {
  if (!batchOneToManyModal.value) return;
  if (batchOneToManyTableSearchTimeout) clearTimeout(batchOneToManyTableSearchTimeout);
  batchOneToManyTableSearchTimeout = setTimeout(() => {
    batchOneToManyPage.value = 0;
    fetchBatchOneToManyTable();
    batchOneToManyTableSearchTimeout = null;
  }, 300);
});

let manyToManyTableSearchTimeout: ReturnType<typeof setTimeout> | null = null;
watch(manyToManyTableQuery, () => {
  if (!manyToManyModal.value) return;
  if (manyToManyTableSearchTimeout) clearTimeout(manyToManyTableSearchTimeout);
  manyToManyTableSearchTimeout = setTimeout(() => {
    manyToManyPage.value = 0;
    fetchManyToManyTable();
    manyToManyTableSearchTimeout = null;
  }, 300);
});
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex items-center gap-4">
        <button
          type="button"
          class="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          @click="goBack"
        >
          <ArrowLeft class="h-4 w-4" />
          Kembali ke Runs
        </button>
      </div>

      <div v-if="error" class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ error }}
      </div>

      <div v-else-if="loading" class="flex justify-center py-12">
        <Loader2 class="h-8 w-8 animate-spin text-slate-400" />
      </div>

      <template v-else-if="run">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 class="page-title">Reconciliation Run {{ run.runId }} — {{ formatDate(run.date) }}</h1>
            <p class="mt-1 text-sm text-slate-600">{{ run.fileName }}</p>
          </div>
          <div v-if="run.totalStaging > 0" class="flex gap-2">
            <button
              v-if="run.status === 'PENDING'"
              type="button"
              class="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              :disabled="runningRecon"
              @click="handleRunReconciliation(false)"
            >
              <Loader2 v-if="runningRecon" class="h-4 w-4 animate-spin" />
              <CheckCircle2 v-else class="h-4 w-4" />
              {{ runningRecon ? "Menjalankan..." : "Jalankan Rekonsiliasi" }}
            </button>
            <button
              v-if="run.status === 'COMPLETED'"
              type="button"
              class="flex items-center gap-2 rounded-lg border border-violet-600 px-4 py-2 text-sm font-semibold text-violet-600 hover:bg-violet-50 disabled:opacity-50"
              :disabled="runningRecon"
              title="Clear results and run again (e.g. after logic updates)"
              @click="handleRunReconciliation(true)"
            >
              <Loader2 v-if="runningRecon" class="h-4 w-4 animate-spin" />
              <RefreshCw v-else class="h-4 w-4" />
              {{ runningRecon ? "Menjalankan..." : "Jalankan Semula" }}
            </button>
          </div>
        </div>

        <!-- Summary bar -->
        <div class="flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <span class="flex items-center gap-1.5 text-sm">
            <CheckCircle2 class="h-4 w-4 text-emerald-600" />
            <strong>Matched:</strong> {{ run.matched }}
          </span>
          <span class="flex items-center gap-1.5 text-sm">
            <XCircle class="h-4 w-4 text-amber-600" />
            <strong>Unmatched:</strong> {{ run.unmatched }}
          </span>
          <span class="flex items-center gap-1.5 text-sm">
            <AlertTriangle class="h-4 w-4 text-red-600" />
            <strong>Variance:</strong> {{ run.mismatch }}
          </span>
          <span class="flex items-center gap-1.5 text-sm">
            <Copy class="h-4 w-4 text-slate-500" />
            <strong>Duplicate:</strong> {{ run.duplicate }}
          </span>
        </div>

        <!-- Tabs -->
        <div class="border-b border-slate-200">
          <nav class="-mb-px flex gap-4">
            <button
              type="button"
              :class="[
                'border-b-2 px-3 py-2 text-sm font-medium',
                activeTab === 'matched'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
              ]"
              @click="activeTab = 'matched'"
            >
              Matched ({{ matchedResults.length }})
            </button>
            <button
              type="button"
              :class="[
                'border-b-2 px-3 py-2 text-sm font-medium',
                activeTab === 'unmatched'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
              ]"
              @click="activeTab = 'unmatched'"
            >
              Unmatched ({{ unmatchedResults.length }})
            </button>
            <button
              type="button"
              :class="[
                'border-b-2 px-3 py-2 text-sm font-medium',
                activeTab === 'variance'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
              ]"
              @click="activeTab = 'variance'"
            >
              Variance ({{ varianceResults.length }})
            </button>
            <button
              type="button"
              :class="[
                'border-b-2 px-3 py-2 text-sm font-medium',
                activeTab === 'duplicate'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
              ]"
              @click="activeTab = 'duplicate'"
            >
              Duplicate ({{ duplicateResults.length }})
            </button>
            <button
              type="button"
              :class="[
                'border-b-2 px-3 py-2 text-sm font-medium',
                activeTab === 'actions'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
              ]"
              @click="activeTab = 'actions'"
            >
              Actions ({{ allActions.length }})
            </button>
          </nav>
        </div>

        <!-- Tab content -->
        <article class="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div
            v-if="activeTab === 'unmatched' && unmatchedResults.length > 0"
            class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-violet-50/50 px-4 py-3"
          >
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                :disabled="aiAssistLoading"
                @click="handleAIAssist"
              >
                <img v-if="!aiAssistLoading" src="/aina-mascot.png" alt="AINA" class="h-4 w-4 object-contain" />
                <Loader2 v-else class="h-4 w-4 animate-spin" />
                {{ aiAssistLoading ? "Memproses AI..." : "AI Assist" }}
              </button>
              <span class="text-xs text-slate-600">
                AI akan mencadangkan padanan untuk {{ Math.min(50, unmatchedResults.length) }} rekod pertama.
              </span>
            </div>
            <div v-if="aiAssistError" class="text-sm text-rose-600">{{ aiAssistError }}</div>
            <div v-else-if="aiSuggestions.length > 0" class="text-sm text-slate-600">
              <span class="font-medium text-violet-700">{{ aiSuggestionsToShow.length }}</span> cadangan (keyakinan ≥ 60%)
            </div>
          </div>

          <!-- AI Suggestions panel (Unmatched tab) -->
          <div
            v-if="activeTab === 'unmatched' && aiSuggestionsToShow.length > 0"
            class="border-b border-slate-200 bg-amber-50/50 px-4 py-3"
          >
            <div class="mb-2 flex flex-wrap items-center justify-between gap-3">
              <h4 class="text-sm font-semibold text-slate-700">Cadangan AI — Klik Apply untuk sahkan</h4>
              <div class="flex items-center gap-2">
                <label class="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    :checked="selectedAICount === aiSuggestionsToShow.length && aiSuggestionsToShow.length > 0"
                    :indeterminate="selectedAICount > 0 && selectedAICount < aiSuggestionsToShow.length"
                    class="rounded border-slate-300"
                    @change="toggleSelectAllAISuggestions"
                  />
                  Pilih semua
                </label>
                <button
                  type="button"
                  class="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                  :disabled="selectedAICount === 0 || batchApplyLoading"
                  @click="handleBatchApplyAISuggestions"
                >
                  {{ batchApplyLoading ? "Memproses..." : selectedAICount > 0 ? `Apply (${selectedAICount})` : "Apply" }}
                </button>
              </div>
            </div>
            <div class="max-h-48 overflow-y-auto space-y-2">
              <div
                v-for="s in aiSuggestionsToShow"
                :key="s.reconResultId"
                class="flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm"
              >
                <label class="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    :checked="selectedAISuggestionIds.has(s.reconResultId)"
                    class="shrink-0 rounded border-slate-300"
                    @change="toggleSelectAISuggestion(s.reconResultId)"
                  />
                  <div class="min-w-0 flex-1">
                    <span class="font-medium text-slate-700">
                      {{ results.find((r) => r.id === s.reconResultId)?.stagingTx?.payerName ?? "—" }}
                    </span>
                    <span class="text-slate-500"> → {{ s.suggestedReceiptNo ?? s.suggestedInternalTxId }}</span>
                    <span class="ml-2 rounded bg-violet-100 px-1.5 py-0.5 text-xs font-medium text-violet-700">
                      {{ Math.round(s.confidence * 100) }}%
                    </span>
                  </div>
                </label>
                <div
                  v-if="s.suggestedInternalSummary"
                  class="shrink-0 rounded border border-emerald-200 bg-emerald-50/80 px-2.5 py-1.5 text-xs text-slate-700"
                >
                  <div class="font-medium text-emerald-800">Internal:</div>
                  <div>Tarikh {{ s.suggestedInternalSummary.date }} · Rujukan {{ s.suggestedInternalSummary.reference }}</div>
                  <div class="font-medium">RM {{ s.suggestedInternalSummary.amount.toFixed(2) }}</div>
                </div>
                <button
                  type="button"
                  class="shrink-0 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
                  @click="handleApplyAISuggestion(s)"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          <div
            v-if="activeTab === 'unmatched' && unmatchedResults.length > 0"
            class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-2"
          >
            <div class="flex flex-wrap items-center gap-3">
              <div class="relative">
                <Search class="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  v-model="unmatchedSearchQuery"
                  type="text"
                  placeholder="Carian (IC, nama, rujukan, amaun, tarikh)..."
                  class="w-64 rounded-lg border border-slate-300 py-1.5 pl-8 pr-3 text-sm shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
              </div>
              <label class="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
                <input
                  type="checkbox"
                  :checked="filteredUnmatchedResults.length > 0 && filteredUnmatchedResults.every((r) => selectedUnmatchedIds.has(r.id))"
                  :indeterminate="filteredUnmatchedResults.some((r) => selectedUnmatchedIds.has(r.id)) && !filteredUnmatchedResults.every((r) => selectedUnmatchedIds.has(r.id))"
                  class="h-4 w-4 rounded border-slate-300 accent-violet-600"
                  @change="toggleSelectAllUnmatched"
                />
                Pilih semua
              </label>
              <span v-if="selectedUnmatchedCount > 0" class="text-xs text-slate-600">
                {{ selectedUnmatchedCount }} dipilih · Jumlah RM {{ selectedUnmatchedTotal.toFixed(2) }}
              </span>
              <span v-if="unmatchedSearchQuery.trim()" class="text-xs text-slate-500">
                {{ filteredUnmatchedResults.length }} / {{ unmatchedResults.length }} rekod
              </span>
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                class="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                :disabled="selectedUnmatchedCount === 0"
                @click="openBatchManyToOneModal"
              >
                N:1 ({{ selectedUnmatchedCount }})
              </button>
              <button
                type="button"
                class="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                :disabled="selectedUnmatchedCount === 0"
                @click="openBatchOneToManyModal"
              >
                1:N ({{ selectedUnmatchedCount }})
              </button>
              <button
                type="button"
                class="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                :disabled="selectedUnmatchedCount === 0"
                @click="openManyToManyModal"
              >
                N:M ({{ selectedUnmatchedCount }})
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <!-- Matched tab -->
            <table v-if="activeTab === 'matched'" class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-100 text-left">
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">IC</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Nama</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Tarikh</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Amaun</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Rujukan</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Internal TX</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="row in matchedResults" :key="row.id">
                  <td class="px-4 py-2 font-mono text-slate-700">{{ row.stagingTx.payerIc ?? "—" }}</td>
                  <td class="px-4 py-2 text-slate-700">{{ row.stagingTx.payerName ?? "—" }}</td>
                  <td class="px-4 py-2 text-slate-600">{{ row.stagingTx.txDate }}</td>
                  <td class="px-4 py-2 text-slate-700">RM {{ Number(row.stagingTx.amount).toFixed(2) }}</td>
                  <td class="px-4 py-2 text-slate-600">{{ row.stagingTx.sourceTxRef ?? "—" }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-emerald-600">
                    <template v-if="row.matchLinks && row.matchLinks.length > 0">
                      <span v-for="(link, i) in row.matchLinks" :key="link.id">
                        {{ link.internalTxId }}{{ link.amountAllocated != null ? ` (RM ${Number(link.amountAllocated).toFixed(2)})` : "" }}{{ i < row.matchLinks!.length - 1 ? ", " : "" }}
                      </span>
                    </template>
                    <template v-else>{{ row.internalTxId ?? "—" }}</template>
                  </td>
                </tr>
                <tr v-if="matchedResults.length === 0">
                  <td colspan="6" class="px-4 py-8 text-center text-slate-500">Tiada rekod matched.</td>
                </tr>
              </tbody>
            </table>

            <!-- Unmatched tab -->
            <table v-if="activeTab === 'unmatched'" class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-100 text-left">
                  <th class="w-12 min-w-[3rem] px-3 py-2 text-xs font-semibold uppercase text-slate-500">Pilih</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">IC</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Nama</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Tarikh</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Amaun</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Rujukan</th>
                  <th class="px-4 py-2 text-right text-xs font-semibold uppercase text-slate-500">Tindakan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="row in filteredUnmatchedResults" :key="row.id">
                  <td class="w-12 min-w-[3rem] px-3 py-2 align-middle">
                    <input
                      type="checkbox"
                      :checked="selectedUnmatchedIds.has(row.id)"
                      class="h-4 w-4 rounded border-slate-300 accent-violet-600"
                      @change="toggleUnmatchedSelect(row.id)"
                    />
                  </td>
                  <td class="px-4 py-2 font-mono text-slate-700">{{ row.stagingTx.payerIc ?? "—" }}</td>
                  <td class="px-4 py-2 text-slate-700">{{ row.stagingTx.payerName ?? "—" }}</td>
                  <td class="px-4 py-2 text-slate-600">{{ row.stagingTx.txDate }}</td>
                  <td class="px-4 py-2 text-slate-700">RM {{ Number(row.stagingTx.amount).toFixed(2) }}</td>
                  <td class="px-4 py-2 text-slate-600">{{ row.stagingTx.sourceTxRef ?? "—" }}</td>
                  <td class="px-4 py-2 text-right">
                    <div class="flex justify-end gap-1">
                      <button
                        type="button"
                        class="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                        @click="openManualMatch(row)"
                      >
                        <Link2 class="h-3.5 w-3.5" /> 1:1/1:N
                      </button>
                      <button
                        type="button"
                        class="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50"
                        @click="openForceMatch(row)"
                      >
                        <Shield class="h-3.5 w-3.5" /> Force
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredUnmatchedResults.length === 0">
                  <td colspan="7" class="px-4 py-8 text-center text-slate-500">
                    {{ unmatchedSearchQuery.trim() ? "Tiada rekod sepadan dengan carian." : "Tiada rekod unmatched." }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Variance tab -->
            <table v-if="activeTab === 'variance'" class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-100 text-left">
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">IC</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Nama</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Tarikh</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Amaun</th>
                  <th class="px-4 py-2 text-right text-xs font-semibold uppercase text-slate-500">Tindakan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="row in varianceResults" :key="row.id">
                  <td class="px-4 py-2 font-mono text-slate-700">{{ row.stagingTx.payerIc ?? "—" }}</td>
                  <td class="px-4 py-2 text-slate-700">{{ row.stagingTx.payerName ?? "—" }}</td>
                  <td class="px-4 py-2 text-slate-600">{{ row.stagingTx.txDate }}</td>
                  <td class="px-4 py-2 text-slate-700">RM {{ Number(row.stagingTx.amount).toFixed(2) }}</td>
                  <td class="px-4 py-2 text-right">
                    <button
                      type="button"
                      class="rounded px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50"
                      @click="openSiasat(row)"
                    >
                      <Eye class="inline h-3.5 w-3.5" /> Siasat
                    </button>
                  </td>
                </tr>
                <tr v-if="varianceResults.length === 0">
                  <td colspan="5" class="px-4 py-8 text-center text-slate-500">Tiada variance.</td>
                </tr>
              </tbody>
            </table>

            <!-- Duplicate tab -->
            <table v-if="activeTab === 'duplicate'" class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-100 text-left">
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">IC</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Nama</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Tarikh</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Amaun</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Rujukan</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Jenis Pendua</th>
                  <th class="px-4 py-2 text-right text-xs font-semibold uppercase text-slate-500">Tindakan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="row in duplicateResults" :key="row.id" class="bg-amber-50/50">
                  <td class="px-4 py-2 font-mono text-slate-700">{{ row.stagingTx.payerIc ?? "—" }}</td>
                  <td class="px-4 py-2 text-slate-700">{{ row.stagingTx.payerName ?? "—" }}</td>
                  <td class="px-4 py-2 text-slate-600">{{ row.stagingTx.txDate }}</td>
                  <td class="px-4 py-2 text-slate-700">RM {{ Number(row.stagingTx.amount).toFixed(2) }}</td>
                  <td class="px-4 py-2 text-slate-600">{{ row.stagingTx.sourceTxRef ?? "—" }}</td>
                  <td class="px-4 py-2">
                    <span
                      v-if="row.stagingTx.duplicates?.[0]?.duplicateType === 'CROSS_FILE'"
                      class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                    >
                      Cross File
                    </span>
                    <span
                      v-else-if="row.stagingTx.duplicates?.[0]?.duplicateType === 'SAME_FILE'"
                      class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                    >
                      Same File
                    </span>
                    <span v-else class="text-slate-500">—</span>
                  </td>
                  <td class="px-4 py-2 text-right">
                    <button
                      type="button"
                      class="rounded px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50"
                      @click="openSiasat(row)"
                    >
                      <Eye class="inline h-3.5 w-3.5" /> Siasat
                    </button>
                  </td>
                </tr>
                <tr v-if="duplicateResults.length === 0">
                  <td colspan="7" class="px-4 py-8 text-center text-slate-500">Tiada rekod pendua.</td>
                </tr>
              </tbody>
            </table>

            <!-- Actions tab -->
            <table v-if="activeTab === 'actions'" class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-100 text-left">
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Tarikh</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Jenis</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Oleh</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Catatan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="a in allActions" :key="`${a.reconId}-${a.id}`">
                  <td class="px-4 py-2 text-slate-600">{{ formatDateTime(a.actedAt) }}</td>
                  <td class="px-4 py-2 text-slate-700">{{ a.actionType }}</td>
                  <td class="px-4 py-2 text-slate-700">{{ a.actedBy }}</td>
                  <td class="px-4 py-2 text-slate-600">{{ a.actionNote ?? "—" }}</td>
                </tr>
                <tr v-if="allActions.length === 0">
                  <td colspan="4" class="px-4 py-8 text-center text-slate-500">Tiada tindakan supervisor.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </template>
    </div>

    <!-- Manual Match Modal -->
    <Teleport to="body">
      <div
        v-if="manualMatchModal.open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="closeManualMatch"
      >
        <div
          :ref="dragManualMatch.modalRef"
          :style="unref(dragManualMatch.modalStyle)"
          class="w-full max-w-5xl rounded-xl bg-white shadow-xl max-h-[90vh] flex flex-col"
        >
          <div
            class="flex cursor-move items-center justify-between border-b border-slate-200 px-4 py-3 shrink-0"
            @mousedown="dragManualMatch.onHandleMouseDown"
          >
            <h3 class="font-semibold text-slate-900">Manual Match — Staging TX #{{ manualMatchModal.row?.stagingTxId }}</h3>
            <button type="button" class="rounded p-1 text-slate-500 hover:bg-slate-100" @click="closeManualMatch">×</button>
          </div>
          <div class="flex flex-col flex-1 min-h-0">
            <div v-if="manualMatchModal.row" class="shrink-0 border-b border-slate-100 px-4 py-2 bg-slate-50">
              <p class="text-xs font-medium text-slate-600">External (staging):</p>
              <p class="text-sm text-slate-700">
                IC {{ manualMatchModal.row.stagingTx.payerIc ?? "—" }} | RM {{ Number(manualMatchModal.row.stagingTx.amount).toFixed(2) }} | {{ manualMatchModal.row.stagingTx.txDate }}
              </p>
            </div>
            <div class="shrink-0 flex items-center gap-2 px-4 py-2 border-b border-slate-100">
              <div class="relative flex-1">
                <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  v-model="manualMatchSearchQuery"
                  type="text"
                  placeholder="Cari IC / Nama / Rujukan..."
                  class="w-full rounded-lg border border-slate-300 py-1.5 pl-9 pr-3 text-sm"
                  @keydown.enter.prevent="handleManualMatchSearch"
                />
              </div>
              <button
                type="button"
                class="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
                @click="handleManualMatchSearch"
              >
                Cari
              </button>
              <span class="text-xs text-slate-500">{{ manualMatchTableTotal }} rekod</span>
            </div>
            <div class="flex-1 overflow-auto min-h-0 min-h-[280px]">
              <table class="w-full text-sm">
                <thead class="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
                  <tr class="text-left">
                    <th class="w-10 px-3 py-2">
                      <input
                        type="checkbox"
                        :checked="manualMatchTableData.length > 0 && manualMatchTableData.every((r) => manualMatchSelectedIds.has(r.internalTxId))"
                        class="h-4 w-4 rounded accent-violet-600"
                        @change="toggleManualMatchSelectAll"
                      />
                    </th>
                    <template v-if="internalSourceType === 'BankStatement'">
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">ReferenceNo</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Transaction Date</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Amount</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Description</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Baki</th>
                    </template>
                    <template v-else>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">IC</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Nama</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Rujukan</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Jumlah</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Tarikh</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Baki</th>
                    </template>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-if="manualMatchTableLoading">
                    <td :colspan="(internalSourceType === 'BankStatement' ? 5 : 6) + 1" class="px-4 py-8 text-center text-slate-500">
                      <Loader2 class="inline h-5 w-5 animate-spin" /> Memuatkan...
                    </td>
                  </tr>
                  <tr v-else-if="manualMatchTableData.length === 0">
                    <td :colspan="(internalSourceType === 'BankStatement' ? 5 : 6) + 1" class="px-4 py-8 text-center text-slate-500">Tiada rekod dalaman.</td>
                  </tr>
                  <tr
                    v-else
                    v-for="r in manualMatchTableData"
                    :key="r.internalTxId"
                    :class="[
                      'cursor-pointer hover:bg-slate-50',
                      manualMatchSelectedIds.has(r.internalTxId) ? 'bg-violet-50' : '',
                    ]"
                    @click="toggleManualMatchSelect(r.internalTxId)"
                  >
                    <td class="w-10 px-3 py-2" @click.stop>
                      <input
                        type="checkbox"
                        :checked="manualMatchSelectedIds.has(r.internalTxId)"
                        class="h-4 w-4 rounded accent-violet-600"
                        @change="toggleManualMatchSelect(r.internalTxId)"
                      />
                    </td>
                    <template v-if="internalSourceType === 'BankStatement'">
                      <td class="px-3 py-2 text-slate-600">{{ r.reference }}</td>
                      <td class="px-3 py-2 text-slate-600">{{ r.date }}</td>
                      <td class="px-3 py-2 font-medium text-slate-700">RM {{ r.amount.toFixed(2) }}</td>
                      <td class="px-3 py-2 text-slate-600 max-w-[200px] truncate" :title="r.description ?? ''">{{ r.description ?? "—" }}</td>
                      <td class="px-3 py-2 text-slate-600">
                        <span v-if="r.linkedInfo.linkedCount > 0" class="text-amber-700">
                          RM {{ r.linkedInfo.remainingAmount.toFixed(2) }}
                          <span class="text-xs">({{ r.linkedInfo.linkedCount }} dipadankan)</span>
                        </span>
                        <span v-else>RM {{ r.linkedInfo.remainingAmount.toFixed(2) }}</span>
                      </td>
                    </template>
                    <template v-else>
                      <td class="px-3 py-2 font-mono text-slate-700">{{ r.identityNo ?? "—" }}</td>
                      <td class="px-3 py-2 text-slate-700">{{ r.name }}</td>
                      <td class="px-3 py-2 text-slate-600">{{ r.reference }}</td>
                      <td class="px-3 py-2 font-medium text-slate-700">RM {{ r.amount.toFixed(2) }}</td>
                      <td class="px-3 py-2 text-slate-600">{{ r.date }}</td>
                      <td class="px-3 py-2 text-slate-600">
                        <span v-if="r.linkedInfo.linkedCount > 0" class="text-amber-700">
                          RM {{ r.linkedInfo.remainingAmount.toFixed(2) }}
                          <span class="text-xs">({{ r.linkedInfo.linkedCount }} dipadankan)</span>
                        </span>
                        <span v-else>RM {{ r.linkedInfo.remainingAmount.toFixed(2) }}</span>
                      </td>
                    </template>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="manualMatchTotalPages > 1" class="shrink-0 flex items-center justify-between gap-2 px-4 py-2 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                class="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                :disabled="manualMatchPage === 0"
                @click="manualMatchPage--; fetchManualMatchTable()"
              >
                ← Sebelum
              </button>
              <span class="text-xs text-slate-600">Halaman {{ manualMatchPage + 1 }} / {{ manualMatchTotalPages }}</span>
              <button
                type="button"
                class="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                :disabled="manualMatchPage >= manualMatchTotalPages - 1"
                @click="manualMatchPage++; fetchManualMatchTable()"
              >
                Seterusnya →
              </button>
            </div>
          </div>
          <div class="flex items-center justify-between gap-2 border-t border-slate-200 px-4 py-3 shrink-0">
            <span class="text-sm text-slate-600">{{ manualMatchSelectedIds.size }} dipilih</span>
            <div class="flex gap-2">
              <button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="closeManualMatch">
                Batal
              </button>
              <button
                type="button"
                class="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                :disabled="manualMatchSelectedIds.size === 0 || manualMatchApplyLoading"
                @click="handleManualMatchApply"
              >
                {{ manualMatchApplyLoading ? "Memproses..." : "Sahkan Match" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- One-to-Many Modal -->
    <Teleport to="body">
      <div
        v-if="oneToManyModal.open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="closeOneToManyModal"
      >
        <div
          :ref="dragOneToMany.modalRef"
          :style="unref(dragOneToMany.modalStyle)"
          class="w-full max-w-2xl rounded-xl bg-white shadow-xl max-h-[90vh] flex flex-col"
        >
          <div
            class="flex cursor-move items-center justify-between border-b border-slate-200 px-4 py-3 shrink-0"
            @mousedown="dragOneToMany.onHandleMouseDown"
          >
            <h3 class="font-semibold text-slate-900">One-to-Many — 1 staging → banyak dalaman</h3>
            <button type="button" class="rounded p-1 text-slate-500 hover:bg-slate-100" @click="closeOneToManyModal">×</button>
          </div>
          <div class="p-4 space-y-4 overflow-y-auto flex-1">
            <div v-if="oneToManyModal.row" class="rounded-lg border border-indigo-200 bg-indigo-50/80 p-3 text-sm shrink-0">
              <p class="font-medium text-indigo-800">Staging: RM {{ Number(oneToManyModal.row.stagingTx.amount).toFixed(2) }}</p>
              <p class="mt-1 text-indigo-700">Pilih ≥2 rekod dalaman yang jumlahnya sepadan.</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Cari transaksi dalaman:</label>
              <div class="mt-1 flex gap-2">
                <div class="relative flex-1">
                  <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    v-model="oneToManySearchQuery"
                    type="text"
                    placeholder="Min 2 aksara..."
                    class="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm"
                    @keydown.enter.prevent="handleOneToManySearch"
                  />
                </div>
                <button
                  type="button"
                  class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  :disabled="oneToManySearchLoading || oneToManySearchQuery.trim().length < 2"
                  @click="handleOneToManySearch"
                >
                  {{ oneToManySearchLoading ? "..." : "Cari" }}
                </button>
              </div>
            </div>
            <div v-if="oneToManySearchResults.length > 0" class="space-y-2">
              <p class="text-xs font-medium text-slate-600">Pilih ≥2 rekod (jumlah ≈ staging):</p>
              <div class="max-h-40 overflow-y-auto space-y-1.5 rounded-lg border border-slate-200 p-2">
                <label
                  v-for="r in oneToManySearchResults"
                  :key="r.internalTxId"
                  class="flex cursor-pointer items-center justify-between gap-2 rounded border px-3 py-2 text-sm hover:bg-slate-50"
                  :class="oneToManySelectedIds.has(r.internalTxId) ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'"
                >
                  <div class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      :checked="oneToManySelectedIds.has(r.internalTxId)"
                      class="h-4 w-4 rounded accent-indigo-600"
                      @change="toggleOneToManySelect(r.internalTxId)"
                    />
                    <span class="font-medium">{{ r.name }}</span>
                    <span class="text-slate-500">{{ r.reference }}</span>
                    <span class="text-xs">RM {{ r.amount.toFixed(2) }}</span>
                  </div>
                </label>
              </div>
              <p class="text-xs text-slate-600">
                Jumlah terpilih: RM {{ oneToManySelectedTotal.toFixed(2) }}
                <span v-if="oneToManyModal.row">
                  (staging RM {{ Number(oneToManyModal.row.stagingTx.amount).toFixed(2) }})
                </span>
              </p>
            </div>
          </div>
          <div class="flex justify-end gap-2 border-t border-slate-200 px-4 py-3 shrink-0">
            <button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="closeOneToManyModal">
              Batal
            </button>
            <button
              type="button"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              :disabled="oneToManySelectedIds.size < 2 || oneToManyApplyLoading"
              @click="handleOneToManyApply"
            >
              {{ oneToManyApplyLoading ? "Memproses..." : "Sahkan 1:N" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Batch Many-to-One Modal (N:1) -->
    <Teleport to="body">
      <div
        v-if="batchManyToOneModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="closeBatchManyToOneModal"
      >
        <div
          :ref="dragBatchManyToOne.modalRef"
          :style="unref(dragBatchManyToOne.modalStyle)"
          class="w-full max-w-5xl rounded-xl bg-white shadow-xl max-h-[90vh] flex flex-col"
        >
          <div
            class="flex cursor-move items-center justify-between border-b border-slate-200 px-4 py-3 shrink-0"
            @mousedown="dragBatchManyToOne.onHandleMouseDown"
          >
            <h3 class="font-semibold text-slate-900">N:1 — Padankan {{ selectedUnmatchedCount }} staging ke satu dalaman</h3>
            <button type="button" class="rounded p-1 text-slate-500 hover:bg-slate-100" @click="closeBatchManyToOneModal">×</button>
          </div>
          <div class="flex flex-col flex-1 min-h-0">
            <div class="shrink-0 border-b border-slate-100 px-4 py-2 bg-violet-50">
              <p class="text-sm font-medium text-violet-800">Jumlah staging: RM {{ selectedUnmatchedTotal.toFixed(2) }}</p>
              <p class="text-xs text-violet-700">Pilih satu rekod dalaman (baki ≥ RM {{ selectedUnmatchedTotal.toFixed(2) }})</p>
            </div>
            <div class="shrink-0 flex items-center gap-2 px-4 py-2 border-b border-slate-100">
              <div class="relative flex-1">
                <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  v-model="batchTableQuery"
                  type="text"
                  placeholder="Cari IC / Nama / Rujukan..."
                  class="w-full rounded-lg border border-slate-300 py-1.5 pl-9 pr-3 text-sm"
                  @keydown.enter.prevent="fetchBatchTable"
                />
              </div>
              <button type="button" class="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700" @click="fetchBatchTable">
                Cari
              </button>
              <span class="text-xs text-slate-500">{{ batchTableTotal }} rekod</span>
            </div>
            <div class="flex-1 overflow-auto min-h-0">
              <table class="w-full text-sm">
                <thead class="sticky top-0 bg-slate-50 border-b border-slate-200">
                  <tr class="text-left">
                    <template v-if="internalSourceType === 'BankStatement'">
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">ReferenceNo</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Transaction Date</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Amount</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Description</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Baki</th>
                    </template>
                    <template v-else>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">IC</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Nama</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Rujukan</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Jumlah</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Tarikh</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Baki</th>
                    </template>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-if="batchTableLoading">
                    <td :colspan="internalSourceType === 'BankStatement' ? 5 : 6" class="px-4 py-8 text-center text-slate-500">
                      <Loader2 class="inline h-5 w-5 animate-spin" /> Memuatkan...
                    </td>
                  </tr>
                  <tr v-else-if="batchTableData.length === 0">
                    <td :colspan="internalSourceType === 'BankStatement' ? 5 : 6" class="px-4 py-8 text-center text-slate-500">Tiada rekod dalaman.</td>
                  </tr>
                  <tr
                    v-else
                    v-for="r in batchTableData"
                    :key="r.internalTxId"
                    :class="[
                      'cursor-pointer hover:bg-slate-50',
                      batchSelected?.internalTxId === r.internalTxId ? 'bg-violet-100' : '',
                      r.linkedInfo.remainingAmount < selectedUnmatchedTotal ? 'opacity-50' : '',
                    ]"
                    :title="r.linkedInfo.remainingAmount < selectedUnmatchedTotal ? 'Baki tidak mencukupi' : ''"
                    @click="r.linkedInfo.remainingAmount >= selectedUnmatchedTotal && (batchSelected = r)"
                  >
                    <template v-if="internalSourceType === 'BankStatement'">
                      <td class="px-3 py-2 text-slate-600">{{ r.reference }}</td>
                      <td class="px-3 py-2 text-slate-600">{{ r.date }}</td>
                      <td class="px-3 py-2 font-medium text-slate-700">RM {{ r.amount.toFixed(2) }}</td>
                      <td class="px-3 py-2 text-slate-600 max-w-[200px] truncate" :title="r.description ?? ''">{{ r.description ?? '—' }}</td>
                      <td class="px-3 py-2 text-slate-600">
                        <span v-if="r.linkedInfo.linkedCount > 0" class="text-amber-700">
                          RM {{ r.linkedInfo.remainingAmount.toFixed(2) }}
                          <span class="text-xs">({{ r.linkedInfo.linkedCount }} dipadankan)</span>
                        </span>
                        <span v-else>RM {{ r.linkedInfo.remainingAmount.toFixed(2) }}</span>
                      </td>
                    </template>
                    <template v-else>
                      <td class="px-3 py-2 font-mono text-slate-700">{{ r.identityNo ?? '—' }}</td>
                      <td class="px-3 py-2 text-slate-700">{{ r.name }}</td>
                      <td class="px-3 py-2 text-slate-600">{{ r.reference }}</td>
                      <td class="px-3 py-2 font-medium text-slate-700">RM {{ r.amount.toFixed(2) }}</td>
                      <td class="px-3 py-2 text-slate-600">{{ r.date }}</td>
                      <td class="px-3 py-2 text-slate-600">
                        <span v-if="r.linkedInfo.linkedCount > 0" class="text-amber-700">
                          RM {{ r.linkedInfo.remainingAmount.toFixed(2) }}
                          <span class="text-xs">({{ r.linkedInfo.linkedCount }} dipadankan)</span>
                        </span>
                        <span v-else>RM {{ r.linkedInfo.remainingAmount.toFixed(2) }}</span>
                      </td>
                    </template>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="batchTotalPages > 1" class="shrink-0 flex items-center justify-between gap-2 px-4 py-2 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                class="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                :disabled="batchPage === 0"
                @click="batchPage--; fetchBatchTable()"
              >
                ← Sebelum
              </button>
              <span class="text-xs text-slate-600">Halaman {{ batchPage + 1 }} / {{ batchTotalPages }}</span>
              <button
                type="button"
                class="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                :disabled="batchPage >= batchTotalPages - 1"
                @click="batchPage++; fetchBatchTable()"
              >
                Seterusnya →
              </button>
            </div>
          </div>
          <div class="flex justify-end gap-2 border-t border-slate-200 px-4 py-3 shrink-0">
            <button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="closeBatchManyToOneModal">
              Batal
            </button>
            <button
              type="button"
              class="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              :disabled="!batchSelected || batchManyToOneApplyLoading"
              @click="handleBatchManyToOneApply"
            >
              {{ batchManyToOneApplyLoading ? "Memproses..." : `Padankan ${selectedUnmatchedCount} ke satu` }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Batch One-to-Many Modal (1:N) -->
    <Teleport to="body">
      <div
        v-if="batchOneToManyModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="closeBatchOneToManyModal"
      >
        <div
          :ref="dragBatchOneToMany.modalRef"
          :style="unref(dragBatchOneToMany.modalStyle)"
          class="w-full max-w-5xl rounded-xl bg-white shadow-xl max-h-[90vh] flex flex-col"
        >
          <div
            class="flex cursor-move items-center justify-between border-b border-slate-200 px-4 py-3 shrink-0"
            @mousedown="dragBatchOneToMany.onHandleMouseDown"
          >
            <h3 class="font-semibold text-slate-900">1:N — {{ batchOneToManyItems.length }} staging · Pilih ≥2 dalaman per baris</h3>
            <button type="button" class="rounded p-1 text-slate-500 hover:bg-slate-100" @click="closeBatchOneToManyModal">×</button>
          </div>
          <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div class="shrink-0 border-b border-slate-100 px-4 py-2 space-y-2 max-h-36 overflow-y-auto">
              <p class="text-xs font-medium text-slate-600">Baris staging (pilih baris, kemudian pilih dari jadual bawah):</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="(item, idx) in batchOneToManyItems"
                  :key="item.row.id"
                  type="button"
                  :class="[
                    'rounded-lg border px-3 py-1.5 text-sm',
                    batchOneToManyActiveIndex === idx ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50',
                  ]"
                  @click="batchOneToManyActiveIndex = idx"
                >
                  {{ item.row.stagingTx.payerName }} RM {{ Number(item.row.stagingTx.amount).toFixed(2) }}
                  <span class="ml-1 text-xs" :class="getBatchOneToManyItemTotal(idx) >= Number(item.row.stagingTx.amount) * 0.99 && getBatchOneToManyItemTotal(idx) <= Number(item.row.stagingTx.amount) * 1.01 ? 'text-emerald-600' : 'text-slate-500'">
                    ({{ item.selected.length }})
                  </span>
                </button>
              </div>
            </div>
            <div class="shrink-0 flex items-center gap-2 px-4 py-2 border-b border-slate-100">
              <div class="relative flex-1">
                <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  v-model="batchOneToManyTableQuery"
                  type="text"
                  placeholder="Cari IC / Nama / Rujukan..."
                  class="w-full rounded-lg border border-slate-300 py-1.5 pl-9 pr-3 text-sm"
                  @keydown.enter.prevent="fetchBatchOneToManyTable"
                />
              </div>
              <button type="button" class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700" @click="fetchBatchOneToManyTable">
                Cari
              </button>
              <button
                type="button"
                class="rounded-lg border border-indigo-600 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
                :disabled="batchOneToManySelectedIds.size === 0"
                @click="addSelectedToBatchOneToManyRow"
              >
                Tambah ke baris ({{ batchOneToManySelectedIds.size }})
              </button>
              <span class="text-xs text-slate-500">{{ batchOneToManyTableTotal }} rekod</span>
            </div>
            <div class="flex-1 overflow-auto min-h-0">
              <table class="w-full text-sm">
                <thead class="sticky top-0 bg-slate-50 border-b border-slate-200">
                  <tr class="text-left">
                    <th class="w-10 px-3 py-2">
                      <input
                        type="checkbox"
                        :checked="batchOneToManyTableData.length > 0 && batchOneToManyTableData.every((r) => batchOneToManySelectedIds.has(r.internalTxId))"
                        class="h-4 w-4 rounded accent-indigo-600"
                        @change="toggleBatchOneToManySelectAll"
                      />
                    </th>
                    <template v-if="internalSourceType === 'BankStatement'">
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">ReferenceNo</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Transaction Date</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Amount</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Description</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Baki</th>
                    </template>
                    <template v-else>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">IC</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Nama</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Rujukan</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Jumlah</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Tarikh</th>
                      <th class="px-3 py-2 text-xs font-semibold uppercase text-slate-500">Baki</th>
                    </template>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-if="batchOneToManyTableLoading">
                    <td :colspan="(internalSourceType === 'BankStatement' ? 5 : 6) + 1" class="px-4 py-8 text-center text-slate-500">
                      <Loader2 class="inline h-5 w-5 animate-spin" /> Memuatkan...
                    </td>
                  </tr>
                  <tr v-else-if="batchOneToManyTableData.length === 0">
                    <td :colspan="(internalSourceType === 'BankStatement' ? 5 : 6) + 1" class="px-4 py-8 text-center text-slate-500">Tiada rekod dalaman.</td>
                  </tr>
                  <tr
                    v-else
                    v-for="r in batchOneToManyTableData"
                    :key="r.internalTxId"
                    :class="['cursor-pointer hover:bg-slate-50', batchOneToManySelectedIds.has(r.internalTxId) ? 'bg-indigo-50' : '']"
                    @click="toggleBatchOneToManySelect(r.internalTxId)"
                  >
                    <td class="w-10 px-3 py-2" @click.stop>
                      <input
                        type="checkbox"
                        :checked="batchOneToManySelectedIds.has(r.internalTxId)"
                        class="h-4 w-4 rounded accent-indigo-600"
                        @change="toggleBatchOneToManySelect(r.internalTxId)"
                      />
                    </td>
                    <template v-if="internalSourceType === 'BankStatement'">
                      <td class="px-3 py-2 text-slate-600">{{ r.reference }}</td>
                      <td class="px-3 py-2 text-slate-600">{{ r.date }}</td>
                      <td class="px-3 py-2 font-medium text-slate-700">RM {{ r.amount.toFixed(2) }}</td>
                      <td class="px-3 py-2 text-slate-600 max-w-[200px] truncate" :title="r.description ?? ''">{{ r.description ?? '—' }}</td>
                      <td class="px-3 py-2 text-slate-600">
                        <span v-if="r.linkedInfo.linkedCount > 0" class="text-amber-700">
                          RM {{ r.linkedInfo.remainingAmount.toFixed(2) }}
                          <span class="text-xs">({{ r.linkedInfo.linkedCount }} dipadankan)</span>
                        </span>
                        <span v-else>RM {{ r.linkedInfo.remainingAmount.toFixed(2) }}</span>
                      </td>
                    </template>
                    <template v-else>
                      <td class="px-3 py-2 font-mono text-slate-700">{{ r.identityNo ?? '—' }}</td>
                      <td class="px-3 py-2 text-slate-700">{{ r.name }}</td>
                      <td class="px-3 py-2 text-slate-600">{{ r.reference }}</td>
                      <td class="px-3 py-2 font-medium text-slate-700">RM {{ r.amount.toFixed(2) }}</td>
                      <td class="px-3 py-2 text-slate-600">{{ r.date }}</td>
                      <td class="px-3 py-2 text-slate-600">
                        <span v-if="r.linkedInfo.linkedCount > 0" class="text-amber-700">
                          RM {{ r.linkedInfo.remainingAmount.toFixed(2) }}
                          <span class="text-xs">({{ r.linkedInfo.linkedCount }} dipadankan)</span>
                        </span>
                        <span v-else>RM {{ r.linkedInfo.remainingAmount.toFixed(2) }}</span>
                      </td>
                    </template>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="batchOneToManyTotalPages > 1" class="shrink-0 flex items-center justify-between gap-2 px-4 py-2 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                class="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                :disabled="batchOneToManyPage === 0"
                @click="batchOneToManyPage--; fetchBatchOneToManyTable()"
              >
                ← Sebelum
              </button>
              <span class="text-xs text-slate-600">Halaman {{ batchOneToManyPage + 1 }} / {{ batchOneToManyTotalPages }}</span>
              <button
                type="button"
                class="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                :disabled="batchOneToManyPage >= batchOneToManyTotalPages - 1"
                @click="batchOneToManyPage++; fetchBatchOneToManyTable()"
              >
                Seterusnya →
              </button>
            </div>
          </div>
          <div class="flex justify-end gap-2 border-t border-slate-200 px-4 py-3 shrink-0">
            <button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="closeBatchOneToManyModal">
              Batal
            </button>
            <button
              type="button"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              :disabled="!batchOneToManyAllValid || batchOneToManyApplyLoading"
              @click="handleBatchOneToManyApply"
            >
              {{ batchOneToManyApplyLoading ? "Memproses..." : "Sahkan semua 1:N" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- N:M Many-to-Many Modal -->
    <Teleport to="body">
      <div
        v-if="manyToManyModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="closeManyToManyModal"
      >
        <div
          :ref="dragManyToMany.modalRef"
          :style="unref(dragManyToMany.modalStyle)"
          class="w-full max-w-4xl rounded-xl bg-white shadow-xl max-h-[90vh] flex flex-col"
        >
          <div
            class="flex cursor-move items-center justify-between border-b border-slate-200 px-4 py-3 shrink-0"
            @mousedown="dragManyToMany.onHandleMouseDown"
          >
            <h3 class="font-semibold text-slate-900">
              N:M — {{ manyToManyGroups.length }} kumpulan · Peruntukan amaun per pautan
            </h3>
            <button type="button" class="rounded p-1 text-slate-500 hover:bg-slate-100" @click="closeManyToManyModal">×</button>
          </div>
          <div class="p-4 space-y-4 overflow-y-auto flex-1">
            <div class="flex gap-2 border-b border-slate-200 pb-2">
              <button
                v-for="(grp, gi) in manyToManyGroups"
                :key="gi"
                type="button"
                :class="[
                  'rounded-lg px-3 py-1.5 text-xs font-medium',
                  activeManyToManyGroupIndex === gi ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                ]"
                @click="activeManyToManyGroupIndex = gi"
              >
                Kumpulan {{ gi + 1 }}
              </button>
              <button
                type="button"
                class="rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50"
                @click="addManyToManyGroup"
              >
                + Kumpulan
              </button>
            </div>

            <div v-for="(grp, gi) in manyToManyGroups" :key="gi" v-show="activeManyToManyGroupIndex === gi" class="space-y-4">
              <div class="rounded-lg border border-teal-200 bg-teal-50/50 p-3 text-sm">
                <p class="font-medium text-teal-800">
                  {{ grp.stagingRows.length }} staging · {{ grp.internalSelected.length }} dalaman
                </p>
                <p class="mt-1 text-xs text-teal-700">
                  Masukkan amaun per pautan. Jumlah per baris = amaun staging. Jumlah per lajur ≤ baki dalaman.
                </p>
              </div>

              <div v-if="activeManyToManyGroupIndex === gi" class="space-y-2">
                <div class="flex items-center gap-2">
                  <div class="relative flex-1">
                    <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      v-model="manyToManyTableQuery"
                      type="text"
                      placeholder="Cari IC / Nama / Rujukan..."
                      class="w-full rounded-lg border border-slate-300 py-1.5 pl-9 pr-3 text-sm"
                      @keydown.enter.prevent="fetchManyToManyTable"
                    />
                  </div>
                  <button type="button" class="rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700" @click="fetchManyToManyTable">
                    Cari
                  </button>
                  <button
                    type="button"
                    class="rounded-lg border border-teal-600 px-3 py-1.5 text-sm font-medium text-teal-600 hover:bg-teal-50 disabled:opacity-50"
                    :disabled="manyToManySelectedIds.size === 0"
                    @click="addSelectedToManyToManyGroup"
                  >
                    Tambah ke kumpulan ({{ manyToManySelectedIds.size }})
                  </button>
                  <span class="text-xs text-slate-500">{{ manyToManyTableTotal }} rekod</span>
                </div>
                <div class="max-h-40 overflow-auto rounded-lg border border-slate-200">
                  <table class="w-full text-sm">
                    <thead class="sticky top-0 bg-slate-50 border-b border-slate-200">
                      <tr class="text-left">
                        <th class="w-10 px-2 py-1.5">
                          <input type="checkbox" :checked="manyToManyTableData.length > 0 && manyToManyTableData.every((r) => manyToManySelectedIds.has(r.internalTxId))" class="h-3.5 w-3.5 rounded accent-teal-600" @change="toggleManyToManySelectAll" />
                        </th>
                        <template v-if="internalSourceType === 'BankStatement'">
                          <th class="px-2 py-1.5 text-xs font-semibold text-slate-500">ReferenceNo</th>
                          <th class="px-2 py-1.5 text-xs font-semibold text-slate-500">Transaction Date</th>
                          <th class="px-2 py-1.5 text-xs font-semibold text-slate-500">Amount</th>
                          <th class="px-2 py-1.5 text-xs font-semibold text-slate-500">Description</th>
                          <th class="px-2 py-1.5 text-xs font-semibold text-slate-500">Baki</th>
                        </template>
                        <template v-else>
                          <th class="px-2 py-1.5 text-xs font-semibold text-slate-500">IC</th>
                          <th class="px-2 py-1.5 text-xs font-semibold text-slate-500">Nama</th>
                          <th class="px-2 py-1.5 text-xs font-semibold text-slate-500">Rujukan</th>
                          <th class="px-2 py-1.5 text-xs font-semibold text-slate-500">Jumlah</th>
                          <th class="px-2 py-1.5 text-xs font-semibold text-slate-500">Baki</th>
                        </template>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      <tr v-if="manyToManyTableLoading">
                        <td :colspan="(internalSourceType === 'BankStatement' ? 5 : 5) + 1" class="px-4 py-4 text-center text-slate-500"><Loader2 class="inline h-4 w-4 animate-spin" /></td>
                      </tr>
                      <tr v-else-if="manyToManyTableData.length === 0">
                        <td :colspan="(internalSourceType === 'BankStatement' ? 5 : 5) + 1" class="px-4 py-4 text-center text-slate-500">Tiada rekod.</td>
                      </tr>
                      <tr
                        v-else
                        v-for="r in manyToManyTableData"
                        :key="r.internalTxId"
                        :class="['cursor-pointer hover:bg-slate-50', manyToManySelectedIds.has(r.internalTxId) ? 'bg-teal-50' : '']"
                        @click="toggleManyToManySelect(r.internalTxId)"
                      >
                        <td class="w-10 px-2 py-1.5" @click.stop>
                          <input type="checkbox" :checked="manyToManySelectedIds.has(r.internalTxId)" class="h-3.5 w-3.5 rounded accent-teal-600" @change="toggleManyToManySelect(r.internalTxId)" />
                        </td>
                        <template v-if="internalSourceType === 'BankStatement'">
                          <td class="px-2 py-1.5 text-slate-600">{{ r.reference }}</td>
                          <td class="px-2 py-1.5 text-slate-600">{{ r.date }}</td>
                          <td class="px-2 py-1.5 font-medium">RM {{ r.amount.toFixed(2) }}</td>
                          <td class="px-2 py-1.5 text-slate-600 max-w-[150px] truncate" :title="r.description ?? ''">{{ r.description ?? '—' }}</td>
                          <td class="px-2 py-1.5 text-slate-600">RM {{ r.linkedInfo.remainingAmount.toFixed(2) }}</td>
                        </template>
                        <template v-else>
                          <td class="px-2 py-1.5 font-mono text-xs">{{ r.identityNo ?? '—' }}</td>
                          <td class="px-2 py-1.5 text-slate-700">{{ r.name }}</td>
                          <td class="px-2 py-1.5 text-slate-600">{{ r.reference }}</td>
                          <td class="px-2 py-1.5 font-medium">RM {{ r.amount.toFixed(2) }}</td>
                          <td class="px-2 py-1.5 text-slate-600">RM {{ r.linkedInfo.remainingAmount.toFixed(2) }}</td>
                        </template>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-if="manyToManyTotalPages > 1" class="flex justify-center gap-2">
                  <button type="button" class="rounded px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200 disabled:opacity-50" :disabled="manyToManyPage === 0" @click="manyToManyPage--; fetchManyToManyTable()">←</button>
                  <span class="text-xs text-slate-600">{{ manyToManyPage + 1 }} / {{ manyToManyTotalPages }}</span>
                  <button type="button" class="rounded px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200 disabled:opacity-50" :disabled="manyToManyPage >= manyToManyTotalPages - 1" @click="manyToManyPage++; fetchManyToManyTable()">→</button>
                </div>
              </div>

              <div v-if="grp.internalSelected.length > 0" class="flex flex-wrap gap-1">
                <span
                  v-for="s in grp.internalSelected"
                  :key="s.internalTxId"
                  class="inline-flex items-center gap-1 rounded bg-slate-200 px-2 py-0.5 text-xs"
                >
                  {{ s.reference }} RM {{ s.amount.toFixed(2) }}
                  <button type="button" class="hover:text-rose-600" @click="removeManyToManyInternal(s.internalTxId, gi)">×</button>
                </span>
              </div>

              <div v-if="grp.stagingRows.length > 0 && grp.internalSelected.length > 0" class="overflow-x-auto">
                <table class="w-full min-w-[400px] text-sm border border-slate-200">
                  <thead>
                    <tr class="bg-slate-50">
                      <th class="px-2 py-1.5 text-left text-xs font-semibold text-slate-600">Staging</th>
                      <th
                        v-for="i in grp.internalSelected"
                        :key="i.internalTxId"
                        class="px-2 py-1.5 text-left text-xs font-semibold text-slate-600 max-w-[100px] truncate"
                        :title="i.reference"
                      >
                        {{ i.reference }}
                      </th>
                      <th class="px-2 py-1.5 text-right text-xs font-semibold text-slate-600">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in grp.stagingRows" :key="row.id" class="border-t border-slate-100">
                      <td class="px-2 py-1.5 text-slate-700">
                        {{ row.stagingTx.payerName }} RM {{ Number(row.stagingTx.amount).toFixed(2) }}
                      </td>
                      <td v-for="i in grp.internalSelected" :key="i.internalTxId" class="px-1 py-0.5">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          :value="getManyToManyAlloc(row.id, i.internalTxId, gi) || ''"
                          class="w-full max-w-[80px] rounded border border-slate-300 px-1.5 py-0.5 text-xs"
                          placeholder="0"
                          @input="(e) => setManyToManyAlloc(row.id, i.internalTxId, (e.target as HTMLInputElement).valueAsNumber || 0, gi)"
                        />
                      </td>
                      <td class="px-2 py-1.5 text-right text-xs font-medium">
                        {{ grp.internalSelected.reduce((s, i) => s + getManyToManyAlloc(row.id, i.internalTxId, gi), 0).toFixed(2) }}
                        / {{ Number(row.stagingTx.amount).toFixed(2) }}
                      </td>
                    </tr>
                    <tr class="border-t border-slate-200 bg-slate-50">
                      <td class="px-2 py-1.5 text-xs font-semibold text-slate-600">Jumlah</td>
                      <td
                        v-for="i in grp.internalSelected"
                        :key="i.internalTxId"
                        class="px-2 py-1.5 text-right text-xs font-medium"
                      >
                        {{ grp.stagingRows.reduce((s, r) => s + getManyToManyAlloc(r.id, i.internalTxId, gi), 0).toFixed(2) }}
                        / {{ i.linkedInfo.remainingAmount.toFixed(2) }}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-if="manyToManyGroups.length > 1" class="flex justify-end">
                <button
                  type="button"
                  class="rounded px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                  @click="removeManyToManyGroup(gi)"
                >
                  Buang kumpulan
                </button>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-2 border-t border-slate-200 px-4 py-3 shrink-0">
            <button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="closeManyToManyModal">
              Batal
            </button>
            <button
              v-if="manyToManySingleMode"
              type="button"
              class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
              :disabled="!manyToManyValid || manyToManyApplyLoading"
              @click="handleManyToManyApply"
            >
              {{ manyToManyApplyLoading ? "Memproses..." : "Sahkan N:M" }}
            </button>
            <button
              v-else
              type="button"
              class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
              :disabled="!manyToManyAllGroupsValid || manyToManyBatchApplyLoading"
              @click="handleManyToManyBatchApply"
            >
              {{ manyToManyBatchApplyLoading ? "Memproses..." : `Sahkan semua (${manyToManyGroups.length})` }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Force Match Modal -->
    <Teleport to="body">
      <div
        v-if="forceMatchModal.open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="closeForceMatch"
      >
        <div
          :ref="dragForceMatch.modalRef"
          :style="unref(dragForceMatch.modalStyle)"
          class="w-full max-w-lg rounded-xl bg-white shadow-xl"
        >
          <div
            class="flex cursor-move items-center justify-between border-b border-slate-200 px-4 py-3"
            @mousedown="dragForceMatch.onHandleMouseDown"
          >
            <h3 class="font-semibold text-slate-900">Force Match — Override Penyelia</h3>
            <button type="button" class="rounded p-1 text-slate-500 hover:bg-slate-100" @click="closeForceMatch">×</button>
          </div>
          <div class="p-4 space-y-4">
            <div v-if="forceMatchModal.row" class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
              <p class="font-medium text-amber-800">Staging TX #{{ forceMatchModal.row.stagingTxId }} — Tiada auto-match</p>
              <p class="mt-1 text-amber-700">
                IC {{ forceMatchModal.row.stagingTx.payerIc ?? "—" }} | RM {{ Number(forceMatchModal.row.stagingTx.amount).toFixed(2) }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Kod sebab:</label>
              <select class="mt-1 w-full rounded-lg border border-slate-300 py-2 px-3 text-sm">
                <option value="">— Pilih —</option>
                <option value="manual_entry">Manual entry</option>
                <option value="bank_error">Bank error</option>
                <option value="other">Lain-lain</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Justifikasi (wajib):</label>
              <textarea
                rows="3"
                class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Sila nyatakan sebab override..."
              />
            </div>
          </div>
          <div class="flex justify-end gap-2 border-t border-slate-200 px-4 py-3">
            <button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="closeForceMatch">
              Batal
            </button>
            <button type="button" class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700" disabled>
              Force Match
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Siasat Modal -->
    <Teleport to="body">
      <div
        v-if="siasatModal.open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="closeSiasat"
      >
        <div
          :ref="dragSiasat.modalRef"
          :style="unref(dragSiasat.modalStyle)"
          class="w-full max-w-lg rounded-xl bg-white shadow-xl"
        >
          <div
            class="flex cursor-move items-center justify-between border-b border-slate-200 px-4 py-3"
            @mousedown="dragSiasat.onHandleMouseDown"
          >
            <h3 class="font-semibold text-slate-900">
              Siasat — {{ siasatModal.row?.matchRule === 'STAGING_DUPLICATE' ? 'Duplicate' : 'Variance' }}
            </h3>
            <button type="button" class="rounded p-1 text-slate-500 hover:bg-slate-100" @click="closeSiasat">×</button>
          </div>
          <div v-if="siasatModal.row" class="p-4 space-y-4">
            <!-- Staging (current row - duplicate or variance) -->
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <h4 class="mb-2 font-medium text-slate-700">Transaksi Staging</h4>
              <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-slate-600">
                <dt>IC:</dt><dd>{{ siasatModal.row.stagingTx?.payerIc ?? "—" }}</dd>
                <dt>Nama:</dt><dd>{{ siasatModal.row.stagingTx?.payerName ?? "—" }}</dd>
                <dt>Tarikh:</dt><dd>{{ siasatModal.row.stagingTx?.txDate ?? "—" }}</dd>
                <dt>Amaun:</dt><dd class="font-medium">RM {{ Number(siasatModal.row.stagingTx?.amount ?? 0).toFixed(2) }}</dd>
                <dt>Rujukan:</dt><dd>{{ siasatModal.row.stagingTx?.sourceTxRef ?? "—" }}</dd>
              </dl>
            </div>
            <!-- Internal / Matched row -->
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <h4 class="mb-2 font-medium text-slate-700">
                {{ siasatModal.row.matchRule === 'STAGING_DUPLICATE' ? 'Rekod yang diduplikasi' : 'Transaksi Dalaman' }}
              </h4>
              <div v-if="siasatLoading" class="py-2 text-slate-500">Memuatkan...</div>
              <template v-else-if="siasatInternalDetail">
                <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-slate-600">
                  <dt>Jenis:</dt><dd>{{ siasatInternalDetail.type }}</dd>
                  <dt>Rujukan:</dt><dd>{{ siasatInternalDetail.reference ?? "—" }}</dd>
                  <dt>Nama:</dt><dd>{{ siasatInternalDetail.name ?? "—" }}</dd>
                  <dt>IC:</dt><dd>{{ siasatInternalDetail.identityNo ?? "—" }}</dd>
                  <dt>Tarikh:</dt><dd>{{ siasatInternalDetail.date }}</dd>
                  <dt>Amaun:</dt><dd class="font-medium">RM {{ Number(siasatInternalDetail.amount).toFixed(2) }}</dd>
                  <template v-if="'fileName' in siasatInternalDetail && siasatInternalDetail.fileName">
                    <dt>Fail:</dt><dd>{{ siasatInternalDetail.fileName }}</dd>
                  </template>
                </dl>
              </template>
              <p v-else class="py-2 text-slate-500">
                {{ siasatModal.row.matchRule === 'STAGING_DUPLICATE' ? 'Tiada rekod dipaut' : 'Tiada transaksi dalaman dipaut' }}
              </p>
            </div>
            <!-- Variance / Duplicate explanation -->
            <div class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
              <h4 class="mb-2 font-medium text-amber-800">
                {{ siasatModal.row.matchRule === 'STAGING_DUPLICATE' ? 'Jenis Pendua' : 'Jenis Variance' }}
              </h4>
              <template v-if="siasatModal.row.matchRule === 'STAGING_DUPLICATE'">
                <p class="text-amber-700">
                  {{ siasatModal.row.stagingTx?.duplicates?.[0]?.duplicateType === 'CROSS_FILE'
                    ? 'Rekod sama dalam fail lain (Cross File)'
                    : 'Rekod sama dalam fail yang sama (Same File)' }}
                </p>
                <p v-if="siasatModal.row.stagingTx?.duplicates?.[0]?.reason" class="mt-2 text-amber-700 text-xs">
                  {{ siasatModal.row.stagingTx.duplicates[0].reason }}
                </p>
              </template>
              <template v-else>
                <p class="text-amber-700">
                  {{ siasatModal.row.matchRule === "AMOUNT_VARIANCE" ? "Perbezaan amaun" : siasatModal.row.matchRule ?? "—" }}
                </p>
                <p v-if="siasatModal.row.matchRule === 'AMOUNT_VARIANCE' && siasatInternalDetail" class="mt-2 text-amber-700">
                  Staging: RM {{ Number(siasatModal.row.stagingTx?.amount ?? 0).toFixed(2) }} vs
                  Dalaman: RM {{ Number(siasatInternalDetail.amount).toFixed(2) }}
                </p>
              </template>
            </div>
          </div>
          <div class="flex justify-end border-t border-slate-200 px-4 py-3">
            <button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="closeSiasat">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>
