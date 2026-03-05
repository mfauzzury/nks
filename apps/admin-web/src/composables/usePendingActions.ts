import { onMounted, ref } from "vue";
import { listDuplicateCases } from "@/api/cms";
import { listPendingSpgPayrollBatches } from "@/api/cms";
import { listIntegrationFiles } from "@/api/integration";

/**
 * Menu item IDs that can have pending actions requiring user attention.
 */
export const pendingByItemId = ref<Record<string, boolean>>({});

/**
 * Routes that have pending actions (for child menu items).
 */
export const pendingByRoute = ref<Record<string, boolean>>({});

async function fetchPendingCounts() {
  const byId: Record<string, boolean> = {};
  const byRoute: Record<string, boolean> = {};

  try {
    const spgRes = await listPendingSpgPayrollBatches();
    const spgPending = (spgRes.data?.length ?? 0) > 0;
    byId["pembayar-spg"] = spgPending;
    byRoute["/spg/payments/pending"] = spgPending;
  } catch {
    byId["pembayar-spg"] = false;
    byRoute["/spg/payments/pending"] = false;
  }

  try {
    const dupRes = await listDuplicateCases("open");
    const openTotal = (dupRes.meta?.total as number) ?? dupRes.data?.length ?? 0;
    byId["duplicates"] = openTotal > 0;
    byRoute["/duplicates"] = openTotal > 0;
  } catch {
    byId["duplicates"] = false;
    byRoute["/duplicates"] = false;
  }

  try {
    const batchRes = await listIntegrationFiles({ limit: 50 });
    const batchFiles = batchRes.data ?? [];
    const batchPending = batchFiles.some((f) => f.processingStatus === "PENDING" && !!f.filePath);
    byId["integration-batch-processing"] = batchPending;
    byRoute["/integration/3rd-party/batch-processing"] = batchPending;
  } catch {
    byId["integration-batch-processing"] = false;
    byRoute["/integration/3rd-party/batch-processing"] = false;
  }

  byId["integration-exceptions"] = false;
  byRoute["/integration/3rd-party/exceptions"] = false;

  pendingByItemId.value = byId;
  pendingByRoute.value = byRoute;
}

export function usePendingActions() {
  onMounted(() => {
    fetchPendingCounts();
  });

  return {
    pendingByItemId,
    pendingByRoute,
    refresh: fetchPendingCounts,
  };
}
