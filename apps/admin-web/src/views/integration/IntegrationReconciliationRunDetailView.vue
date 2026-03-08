<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
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
  type ReconciliationRun,
  type ReconciliationResultRow,
  type AISuggestedMatch,
  type SearchInternalResult,
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
const activeTab = ref<"matched" | "unmatched" | "variance" | "actions">("matched");

const matchedResults = computed(() => results.value.filter((r) => r.matchStatus === "MATCHED"));
const unmatchedResults = computed(() => results.value.filter((r) => r.matchStatus === "UNMATCHED"));
const varianceResults = computed(() => results.value.filter((r) => r.matchStatus === "MISMATCH"));
const duplicateResults = computed(() => results.value.filter((r) => r.matchStatus === "DUPLICATE"));
const allActions = computed(() =>
  results.value.flatMap((r) =>
    (r.actions ?? []).map((a) => ({ ...a, reconId: r.id, stagingTx: r.stagingTx })),
  ).sort((a, b) => new Date(b.actedAt).getTime() - new Date(a.actedAt).getTime()),
);

const manualMatchModal = ref<{ open: boolean; row: ReconciliationResultRow | null }>({ open: false, row: null });
const forceMatchModal = ref<{ open: boolean; row: ReconciliationResultRow | null }>({ open: false, row: null });

const manualMatchSearchQuery = ref("");
const manualMatchSearchResults = ref<SearchInternalResult[]>([]);
const manualMatchSearchLoading = ref(false);
const manualMatchSelected = ref<SearchInternalResult | null>(null);
const manualMatchApplyLoading = ref(false);

const selectedUnmatchedIds = ref<Set<number>>(new Set());
const batchManyToOneModal = ref(false);
const batchSearchQuery = ref("");
const batchSearchResults = ref<SearchInternalResult[]>([]);
const batchSearchLoading = ref(false);
const batchSelected = ref<SearchInternalResult | null>(null);
const batchManyToOneApplyLoading = ref(false);

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
  batchOneToManySearchQuery.value = "";
  batchOneToManySearchResults.value = [];
  batchOneToManyItems.value = unmatchedResults.value
    .filter((r) => selectedUnmatchedIds.value.has(r.id))
    .map((row) => ({ row, selected: [] as SearchInternalResult[] }));
}

function closeBatchOneToManyModal() {
  batchOneToManyModal.value = false;
  batchOneToManyItems.value = [];
  selectedUnmatchedIds.value = new Set();
}

const batchOneToManyActiveIndex = ref(0);
const batchOneToManySearchQuery = ref("");
const batchOneToManySearchResults = ref<SearchInternalResult[]>([]);
const batchOneToManySearchLoading = ref(false);

async function handleBatchOneToManySearch() {
  if (!fileId.value) return;
  const q = batchOneToManySearchQuery.value.trim();
  if (q.length < 2) {
    batchOneToManySearchResults.value = [];
    return;
  }
  batchOneToManySearchLoading.value = true;
  batchOneToManySearchResults.value = [];
  try {
    const res = await searchInternalForMatch(fileId.value, q);
    batchOneToManySearchResults.value = res.data ?? [];
  } catch {
    batchOneToManySearchResults.value = [];
  } finally {
    batchOneToManySearchLoading.value = false;
  }
}

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
    const tol = 0.02;
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
const manyToManySearchQuery = ref("");
const manyToManySearchResults = ref<SearchInternalResult[]>([]);
const manyToManySearchLoading = ref(false);
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
  manyToManySearchQuery.value = "";
  manyToManySearchResults.value = [];
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
}

async function handleManyToManySearch() {
  if (!fileId.value) return;
  const q = manyToManySearchQuery.value.trim();
  if (q.length < 2) {
    manyToManySearchResults.value = [];
    return;
  }
  manyToManySearchLoading.value = true;
  manyToManySearchResults.value = [];
  try {
    const res = await searchInternalForMatch(fileId.value, q);
    manyToManySearchResults.value = res.data ?? [];
  } catch {
    manyToManySearchResults.value = [];
  } finally {
    manyToManySearchLoading.value = false;
  }
}

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
  const tol = 0.02;
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

function openManualMatch(row: ReconciliationResultRow) {
  manualMatchModal.value = { open: true, row };
}

function openForceMatch(row: ReconciliationResultRow) {
  forceMatchModal.value = { open: true, row };
}

function closeManualMatch() {
  manualMatchModal.value = { open: false, row: null };
  manualMatchSearchQuery.value = "";
  manualMatchSearchResults.value = [];
  manualMatchSelected.value = null;
}

async function handleManualMatchSearch() {
  if (!fileId.value || !manualMatchModal.value.row) return;
  const q = manualMatchSearchQuery.value.trim();
  if (q.length < 2) {
    manualMatchSearchResults.value = [];
    return;
  }
  manualMatchSearchLoading.value = true;
  manualMatchSearchResults.value = [];
  manualMatchSelected.value = null;
  try {
    const res = await searchInternalForMatch(fileId.value, q);
    manualMatchSearchResults.value = res.data ?? [];
  } catch {
    manualMatchSearchResults.value = [];
  } finally {
    manualMatchSearchLoading.value = false;
  }
}

function toggleUnmatchedSelect(id: number) {
  const next = new Set(selectedUnmatchedIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selectedUnmatchedIds.value = next;
}

function toggleSelectAllUnmatched() {
  if (selectedUnmatchedCount.value === unmatchedResults.value.length) {
    selectedUnmatchedIds.value = new Set();
  } else {
    selectedUnmatchedIds.value = new Set(unmatchedResults.value.map((r) => r.id));
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
  const tolerance = 0.02;
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

function openBatchManyToOneModal() {
  if (selectedUnmatchedCount.value === 0) return;
  batchManyToOneModal.value = true;
  batchSearchQuery.value = "";
  batchSearchResults.value = [];
  batchSelected.value = null;
}

function closeBatchManyToOneModal() {
  batchManyToOneModal.value = false;
  batchSearchQuery.value = "";
  batchSearchResults.value = [];
  batchSelected.value = null;
  selectedUnmatchedIds.value = new Set();
}

async function handleBatchSearch() {
  if (!fileId.value) return;
  const q = batchSearchQuery.value.trim();
  if (q.length < 2) {
    batchSearchResults.value = [];
    return;
  }
  batchSearchLoading.value = true;
  batchSearchResults.value = [];
  batchSelected.value = null;
  try {
    const res = await searchInternalForMatch(fileId.value, q);
    batchSearchResults.value = res.data ?? [];
  } catch {
    batchSearchResults.value = [];
  } finally {
    batchSearchLoading.value = false;
  }
}

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
  if (!row || !selected) return;
  const currentAmount = Number(row.stagingTx.amount);
  if (currentAmount > selected.linkedInfo.remainingAmount) {
    alert(
      `Amaun staging RM ${currentAmount.toFixed(2)} melebihi baki dalaman RM ${selected.linkedInfo.remainingAmount.toFixed(2)}.`,
    );
    return;
  }
  manualMatchApplyLoading.value = true;
  try {
    await applyReconciliationMatch(row.id, selected.internalTxId);
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
            <div class="flex items-center gap-3">
              <label class="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
                <input
                  type="checkbox"
                  :checked="selectedUnmatchedCount === unmatchedResults.length && unmatchedResults.length > 0"
                  :indeterminate="selectedUnmatchedCount > 0 && selectedUnmatchedCount < unmatchedResults.length"
                  class="h-4 w-4 rounded border-slate-300 accent-violet-600"
                  @change="toggleSelectAllUnmatched"
                />
                Pilih semua
              </label>
              <span v-if="selectedUnmatchedCount > 0" class="text-xs text-slate-600">
                {{ selectedUnmatchedCount }} dipilih · Jumlah RM {{ selectedUnmatchedTotal.toFixed(2) }}
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
                <tr v-for="row in unmatchedResults" :key="row.id">
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
                        <Link2 class="h-3.5 w-3.5" /> 1:1
                      </button>
                      <button
                        type="button"
                        class="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-violet-600 hover:bg-violet-50"
                        @click="openOneToManyModal(row)"
                      >
                        <Link2 class="h-3.5 w-3.5" /> 1:N
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
                <tr v-if="unmatchedResults.length === 0">
                  <td colspan="7" class="px-4 py-8 text-center text-slate-500">Tiada rekod unmatched.</td>
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
        <div class="w-full max-w-2xl rounded-xl bg-white shadow-xl max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3 shrink-0">
            <h3 class="font-semibold text-slate-900">Manual Match — Staging TX #{{ manualMatchModal.row?.stagingTxId }}</h3>
            <button type="button" class="rounded p-1 text-slate-500 hover:bg-slate-100" @click="closeManualMatch">×</button>
          </div>
          <div class="p-4 space-y-4 overflow-y-auto flex-1">
            <div v-if="manualMatchModal.row" class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm shrink-0">
              <p class="font-medium text-slate-700">External (staging):</p>
              <p class="mt-1 text-slate-600">
                IC {{ manualMatchModal.row.stagingTx.payerIc ?? "—" }} | RM {{ Number(manualMatchModal.row.stagingTx.amount).toFixed(2) }} | {{ manualMatchModal.row.stagingTx.txDate }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Cari transaksi dalaman (IC / Nama / Rujukan):</label>
              <div class="mt-1 flex gap-2">
                <div class="relative flex-1">
                  <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    v-model="manualMatchSearchQuery"
                    type="text"
                    placeholder="Min 2 aksara..."
                    class="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm"
                    @keydown.enter.prevent="handleManualMatchSearch"
                  />
                </div>
                <button
                  type="button"
                  class="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                  :disabled="manualMatchSearchLoading || manualMatchSearchQuery.trim().length < 2"
                  @click="handleManualMatchSearch"
                >
                  {{ manualMatchSearchLoading ? "..." : "Cari" }}
                </button>
              </div>
            </div>
            <div v-if="manualMatchSearchResults.length > 0" class="space-y-2">
              <p class="text-xs font-medium text-slate-600">Pilih rekod dalaman (many-to-one dibenarkan):</p>
              <div class="max-h-48 overflow-y-auto space-y-1.5 rounded-lg border border-slate-200 p-2">
                <button
                  v-for="r in manualMatchSearchResults"
                  :key="r.internalTxId"
                  type="button"
                  :class="[
                    'w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                    manualMatchSelected?.internalTxId === r.internalTxId
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-slate-200 hover:bg-slate-50',
                    r.linkedInfo.remainingAmount < Number(manualMatchModal.row?.stagingTx.amount ?? 0)
                      ? 'opacity-60 cursor-not-allowed'
                      : '',
                  ]"
                  :disabled="r.linkedInfo.remainingAmount < Number(manualMatchModal.row?.stagingTx.amount ?? 0)"
                  @click="r.linkedInfo.remainingAmount >= Number(manualMatchModal.row?.stagingTx.amount ?? 0) && (manualMatchSelected = r)"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span class="font-medium text-slate-700">{{ r.name }}</span>
                    <span class="text-slate-500">{{ r.reference }}</span>
                  </div>
                  <div class="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span>RM {{ r.amount.toFixed(2) }}</span>
                    <span class="text-slate-400">·</span>
                    <span>{{ r.date }}</span>
                    <span v-if="r.linkedInfo.linkedCount > 0" class="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">
                      {{ r.linkedInfo.linkedCount }} staging sudah dipadankan · Baki RM {{ r.linkedInfo.remainingAmount.toFixed(2) }}
                    </span>
                  </div>
                </button>
              </div>
            </div>
            <p v-else-if="manualMatchSearchQuery.trim().length >= 2 && !manualMatchSearchLoading" class="text-xs text-slate-500">
              Tiada keputusan. Cuba kata kunci lain.
            </p>
          </div>
          <div class="flex justify-end gap-2 border-t border-slate-200 px-4 py-3 shrink-0">
            <button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="closeManualMatch">
              Batal
            </button>
            <button
              type="button"
              class="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              :disabled="!manualMatchSelected || manualMatchApplyLoading"
              @click="handleManualMatchApply"
            >
              {{ manualMatchApplyLoading ? "Memproses..." : "Sahkan Match" }}
            </button>
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
        <div class="w-full max-w-2xl rounded-xl bg-white shadow-xl max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3 shrink-0">
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

    <!-- Batch Many-to-One Modal -->
    <Teleport to="body">
      <div
        v-if="batchManyToOneModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="closeBatchManyToOneModal"
      >
        <div class="w-full max-w-2xl rounded-xl bg-white shadow-xl max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3 shrink-0">
            <h3 class="font-semibold text-slate-900">Padankan banyak ke satu — {{ selectedUnmatchedCount }} staging dipilih</h3>
            <button type="button" class="rounded p-1 text-slate-500 hover:bg-slate-100" @click="closeBatchManyToOneModal">×</button>
          </div>
          <div class="p-4 space-y-4 overflow-y-auto flex-1">
            <div class="rounded-lg border border-violet-200 bg-violet-50/80 p-3 text-sm shrink-0">
              <p class="font-medium text-violet-800">Jumlah terpilih: RM {{ selectedUnmatchedTotal.toFixed(2) }}</p>
              <p class="mt-1 text-xs text-violet-700">Pilih satu rekod dalaman untuk memadankan semua staging di atas.</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Cari transaksi dalaman:</label>
              <div class="mt-1 flex gap-2">
                <div class="relative flex-1">
                  <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    v-model="batchSearchQuery"
                    type="text"
                    placeholder="IC / Nama / Rujukan (min 2 aksara)..."
                    class="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm"
                    @keydown.enter.prevent="handleBatchSearch"
                  />
                </div>
                <button
                  type="button"
                  class="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                  :disabled="batchSearchLoading || batchSearchQuery.trim().length < 2"
                  @click="handleBatchSearch"
                >
                  {{ batchSearchLoading ? "..." : "Cari" }}
                </button>
              </div>
            </div>
            <div v-if="batchSearchResults.length > 0" class="space-y-2">
              <p class="text-xs font-medium text-slate-600">Pilih rekod dalaman (baki mesti ≥ RM {{ selectedUnmatchedTotal.toFixed(2) }}):</p>
              <div class="max-h-48 overflow-y-auto space-y-1.5 rounded-lg border border-slate-200 p-2">
                <button
                  v-for="r in batchSearchResults"
                  :key="r.internalTxId"
                  type="button"
                  :class="[
                    'w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                    batchSelected?.internalTxId === r.internalTxId ? 'border-violet-500 bg-violet-50' : 'border-slate-200 hover:bg-slate-50',
                    r.linkedInfo.remainingAmount < selectedUnmatchedTotal ? 'opacity-60 cursor-not-allowed' : '',
                  ]"
                  :disabled="r.linkedInfo.remainingAmount < selectedUnmatchedTotal"
                  @click="r.linkedInfo.remainingAmount >= selectedUnmatchedTotal && (batchSelected = r)"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span class="font-medium text-slate-700">{{ r.name }}</span>
                    <span class="text-slate-500">{{ r.reference }}</span>
                  </div>
                  <div class="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span>RM {{ r.amount.toFixed(2) }}</span>
                    <span class="text-slate-400">·</span>
                    <span>{{ r.date }}</span>
                    <span v-if="r.linkedInfo.linkedCount > 0" class="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">
                      {{ r.linkedInfo.linkedCount }} sudah dipadankan · Baki RM {{ r.linkedInfo.remainingAmount.toFixed(2) }}
                    </span>
                  </div>
                </button>
              </div>
            </div>
            <p v-else-if="batchSearchQuery.trim().length >= 2 && !batchSearchLoading" class="text-xs text-slate-500">
              Tiada keputusan. Cuba kata kunci lain.
            </p>
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

    <!-- Batch One-to-Many Modal -->
    <Teleport to="body">
      <div
        v-if="batchOneToManyModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="closeBatchOneToManyModal"
      >
        <div class="w-full max-w-3xl rounded-xl bg-white shadow-xl max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3 shrink-0">
            <h3 class="font-semibold text-slate-900">Batch 1:N — {{ batchOneToManyItems.length }} staging</h3>
            <button type="button" class="rounded p-1 text-slate-500 hover:bg-slate-100" @click="closeBatchOneToManyModal">×</button>
          </div>
          <div class="p-4 space-y-4 overflow-y-auto flex-1">
            <div>
              <label class="block text-sm font-medium text-slate-700">Cari untuk tambah ke baris aktif:</label>
              <div class="mt-1 flex gap-2">
                <div class="relative flex-1">
                  <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    v-model="batchOneToManySearchQuery"
                    type="text"
                    placeholder="Min 2 aksara..."
                    class="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm"
                    @keydown.enter.prevent="handleBatchOneToManySearch"
                  />
                </div>
                <button
                  type="button"
                  class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  :disabled="batchOneToManySearchLoading || batchOneToManySearchQuery.trim().length < 2"
                  @click="handleBatchOneToManySearch"
                >
                  {{ batchOneToManySearchLoading ? "..." : "Cari" }}
                </button>
              </div>
            </div>
            <div v-if="batchOneToManySearchResults.length > 0" class="rounded-lg border border-slate-200 p-2 max-h-32 overflow-y-auto">
              <p class="text-xs font-medium text-slate-600 mb-2">Klik untuk tambah ke baris:</p>
              <div class="flex flex-wrap gap-1">
                <button
                  v-for="r in batchOneToManySearchResults"
                  :key="r.internalTxId"
                  type="button"
                  class="rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800 hover:bg-indigo-200"
                  @click="batchOneToManyActiveIndex >= 0 && addToBatchOneToManyItem(batchOneToManyActiveIndex, r)"
                >
                  {{ r.reference }} RM {{ r.amount.toFixed(2) }}
                </button>
              </div>
            </div>
            <div class="space-y-2">
              <p class="text-xs font-medium text-slate-600">Setiap baris: pilih baris, cari, tambah ≥2 rekod (jumlah ≈ staging):</p>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div
                  v-for="(item, idx) in batchOneToManyItems"
                  :key="item.row.id"
                  :class="[
                    'rounded-lg border p-3 text-sm',
                    batchOneToManyActiveIndex === idx ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200',
                  ]"
                >
                  <div class="flex items-center justify-between gap-2">
                    <div>
                      <span class="font-medium">{{ item.row.stagingTx.payerName }}</span>
                      <span class="text-slate-500 ml-2">RM {{ Number(item.row.stagingTx.amount).toFixed(2) }}</span>
                    </div>
                    <button
                      type="button"
                      class="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100"
                      @click="batchOneToManyActiveIndex = idx"
                    >
                      Pilih baris
                    </button>
                  </div>
                  <div class="mt-2 flex flex-wrap gap-1">
                    <span
                      v-for="s in item.selected"
                      :key="s.internalTxId"
                      class="inline-flex items-center gap-1 rounded bg-slate-200 px-2 py-0.5 text-xs"
                    >
                      {{ s.reference }} RM {{ s.amount.toFixed(2) }}
                      <button type="button" class="hover:text-rose-600" @click="removeFromBatchOneToManyItem(idx, s.internalTxId)">×</button>
                    </span>
                  </div>
                  <p class="mt-1 text-xs" :class="getBatchOneToManyItemTotal(idx) >= Number(item.row.stagingTx.amount) * 0.98 && getBatchOneToManyItemTotal(idx) <= Number(item.row.stagingTx.amount) * 1.02 ? 'text-emerald-600' : 'text-slate-500'">
                    Jumlah: RM {{ getBatchOneToManyItemTotal(idx).toFixed(2) }} / RM {{ Number(item.row.stagingTx.amount).toFixed(2) }}
                  </p>
                </div>
              </div>
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
        <div class="w-full max-w-4xl rounded-xl bg-white shadow-xl max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3 shrink-0">
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

              <div>
                <label class="block text-sm font-medium text-slate-700">Cari transaksi dalaman:</label>
                <div class="mt-1 flex gap-2">
                  <div class="relative flex-1">
                    <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      v-model="manyToManySearchQuery"
                      type="text"
                      placeholder="IC / Nama / Rujukan (min 2 aksara)..."
                      class="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm"
                      @keydown.enter.prevent="handleManyToManySearch"
                    />
                  </div>
                  <button
                    type="button"
                    class="rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                    :disabled="manyToManySearchLoading || manyToManySearchQuery.trim().length < 2"
                    @click="handleManyToManySearch"
                  >
                    {{ manyToManySearchLoading ? "..." : "Cari" }}
                  </button>
                </div>
              </div>

              <div v-if="manyToManySearchResults.length > 0 && activeManyToManyGroupIndex === gi" class="rounded-lg border border-slate-200 p-2 max-h-28 overflow-y-auto">
                <p class="text-xs font-medium text-slate-600 mb-2">Klik untuk tambah ke kumpulan {{ gi + 1 }}:</p>
                <div class="flex flex-wrap gap-1">
                  <button
                    v-for="r in manyToManySearchResults"
                    :key="r.internalTxId"
                    type="button"
                    class="rounded bg-teal-100 px-2 py-1 text-xs font-medium text-teal-800 hover:bg-teal-200"
                    @click="addManyToManyInternal(r, gi)"
                  >
                    {{ r.reference }} RM {{ r.amount.toFixed(2) }}
                  </button>
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
        <div class="w-full max-w-lg rounded-xl bg-white shadow-xl">
          <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
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
  </AdminLayout>
</template>
