import crypto from "node:crypto";
import fs from "node:fs";

import * as XLSX from "xlsx";

import { env } from "../config/env.js";
import { prisma } from "../prisma.js";
import { pgpDecrypt } from "../utils/crypto.js";

const COLUMN_ALIASES: Record<string, string> = {
  ic: "payerIc",
  payeric: "payerIc",
  noic: "payerIc",
  nric: "payerIc",
  name: "payerName",
  payername: "payerName",
  nama: "payerName",
  date: "txDate",
  txdate: "txDate",
  tarikh: "txDate",
  referenceno: "sourceTxRef",
  reference: "sourceTxRef",
  norujukan: "sourceTxRef",
  rujukan: "sourceTxRef",
  amount: "amount",
  amaun: "amount",
  jumlah: "amount",
};

type ParsedRow = { payerIc?: string; payerName?: string; txDate?: string; sourceTxRef?: string; amount?: string };

function parseCsvLine(line: string, delimiter: string = ","): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (inQuotes) {
      current += c;
    } else if (c === delimiter) {
      result.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

function detectDelimiter(firstLine: string): string {
  if (firstLine.includes("|")) return "|";
  if (firstLine.includes(",")) return ",";
  if (firstLine.includes("\t")) return "\t";
  return ",";
}

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/\s+/g, "");
}

function buildColMapFromAI(
  headerRow: string[],
  columnMapping: Record<string, string>,
): Record<string, number> {
  const colMap: Record<string, number> = {};
  const standardFields = ["payerIc", "payerName", "txDate", "sourceTxRef", "amount"] as const;
  for (const field of standardFields) {
    const fileHeader = columnMapping[field];
    if (!fileHeader) continue;
    const idx = headerRow.findIndex((h) => normalizeHeader(h) === normalizeHeader(fileHeader));
    if (idx >= 0) colMap[field] = idx;
  }
  return colMap;
}

function parseCsvOrTxt(content: string, columnMapping?: Record<string, string> | null): ParsedRow[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headerRow = parseCsvLine(lines[0], delimiter).map((h) => normalizeHeader(h));
  const colMap: Record<string, number> = columnMapping
    ? buildColMapFromAI(headerRow, columnMapping)
    : (() => {
        const m: Record<string, number> = {};
        headerRow.forEach((h, i) => {
          const key = COLUMN_ALIASES[h] ?? h;
          m[key] = i;
        });
        return m;
      })();

  const hasHeader =
    headerRow.some((h) =>
      ["ic", "payeric", "name", "nama", "date", "tarikh", "referenceno", "reference", "norujukan", "amount", "amaun"].includes(h),
    ) || headerRow.every((h) => isNaN(Number(h)) && h.length > 1);

  const dataStart = hasHeader ? 1 : 0;
  const rows: ParsedRow[] = [];

  for (let i = dataStart; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i], delimiter);
    if (cells.every((c) => !c.trim())) continue;

    const row: ParsedRow = {};
    if (hasHeader) {
      if (colMap.payerIc !== undefined) row.payerIc = cells[colMap.payerIc]?.trim() || undefined;
      if (colMap.payerName !== undefined) row.payerName = cells[colMap.payerName]?.trim() || undefined;
      if (colMap.txDate !== undefined) row.txDate = cells[colMap.txDate]?.trim() || undefined;
      if (colMap.sourceTxRef !== undefined) row.sourceTxRef = cells[colMap.sourceTxRef]?.trim() || undefined;
      if (colMap.amount !== undefined) row.amount = cells[colMap.amount]?.trim() || undefined;
    } else {
      row.payerIc = cells[0]?.trim() || undefined;
      row.payerName = cells[1]?.trim() || undefined;
      row.txDate = cells[2]?.trim() || undefined;
      row.sourceTxRef = cells[3]?.trim() || undefined;
      row.amount = cells[4]?.trim() || undefined;
    }
    if (row.payerIc || row.payerName || row.amount) rows.push(row);
  }
  return rows;
}

function parseExcel(filePath: string, columnMapping?: Record<string, string> | null): ParsedRow[] {
  const buffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: "" }) as string[][];
  if (!data.length) return [];

  const headerRow = (data[0] ?? []).map((h) => normalizeHeader(String(h)));
  const colMap: Record<string, number> = columnMapping
    ? buildColMapFromAI(headerRow, columnMapping)
    : (() => {
        const m: Record<string, number> = {};
        headerRow.forEach((h, i) => {
          const key = COLUMN_ALIASES[h] ?? h;
          m[key] = i;
        });
        return m;
      })();

  const hasHeader = headerRow.some((h) =>
    ["ic", "payeric", "name", "nama", "date", "tarikh", "referenceno", "reference", "norujukan", "amount", "amaun"].includes(h),
  );
  const dataStart = hasHeader ? 1 : 0;
  const rows: ParsedRow[] = [];

  for (let i = dataStart; i < data.length; i++) {
    const cells = (data[i] ?? []).map((c) => String(c ?? "").trim());
    if (cells.every((c) => !c)) continue;

    const row: ParsedRow = {};
    if (hasHeader) {
      if (colMap.payerIc !== undefined) row.payerIc = cells[colMap.payerIc] || undefined;
      if (colMap.payerName !== undefined) row.payerName = cells[colMap.payerName] || undefined;
      if (colMap.txDate !== undefined) row.txDate = cells[colMap.txDate] || undefined;
      if (colMap.sourceTxRef !== undefined) row.sourceTxRef = cells[colMap.sourceTxRef] || undefined;
      if (colMap.amount !== undefined) row.amount = cells[colMap.amount] || undefined;
    } else {
      row.payerIc = cells[0] || undefined;
      row.payerName = cells[1] || undefined;
      row.txDate = cells[2] || undefined;
      row.sourceTxRef = cells[3] || undefined;
      row.amount = cells[4] || undefined;
    }
    if (row.payerIc || row.payerName || row.amount) rows.push(row);
  }
  return rows;
}

function parseDate(val: string): Date | null {
  if (!val) return null;
  const cleaned = val.replace(/\s/g, "");
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? null : d;
}

function parseAmount(val: string): number | null {
  if (!val) return null;
  const cleaned = val.replace(/[^\d.-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function recordHash(fileId: number, payerIc: string, txDate: Date, amount: number, rowIndex?: number): string {
  const base = `${fileId}|${payerIc}|${txDate.toISOString().slice(0, 10)}|${amount}`;
  const suffix = rowIndex !== undefined ? `|${rowIndex}` : "";
  return crypto.createHash("sha256").update(base + suffix).digest("hex");
}

/** Content key for duplicate detection (same payerIc, txDate, amount across files) */
function contentKey(payerIc: string | null, txDate: Date, amount: number): string {
  return `${payerIc ?? ""}|${txDate.toISOString().slice(0, 10)}|${amount}`;
}

export async function processIntegrationFile(
  fileId: number,
  createdBy: string,
): Promise<{ success: boolean; recordsParsed: number; duplicatesDetected?: number; error?: string }> {
  const file = await prisma.integrationFile.findUnique({
    where: { id: fileId },
    include: { source: true },
  });

  if (!file) {
    return { success: false, recordsParsed: 0, error: "File not found" };
  }

  if (file.processingStatus === "PROCESSING") {
    return { success: false, recordsParsed: 0, error: "File is already being processed" };
  }

  if (!file.filePath || !fs.existsSync(file.filePath)) {
    return { success: false, recordsParsed: 0, error: "File path missing or file not found on disk" };
  }

  await prisma.integrationFile.update({
    where: { id: fileId },
    data: { processingStatus: "PROCESSING" },
  });

  await prisma.integrationFileEvent.create({
    data: {
      fileId,
      eventType: "PROCESS_STARTED",
      eventStatus: "SUCCESS",
      eventMessage: `Processing started by ${createdBy}`,
      createdBy,
    },
  });

  const job = await prisma.integrationJob.create({
    data: {
      fileId,
      jobType: "PARSE_AND_STAGE",
      jobStatus: "RUNNING",
      attempt: 1,
    },
  });

  const columnMapping: Record<string, string> | null = file.columnMappingJson
    ? (() => {
        try {
          return JSON.parse(file.columnMappingJson) as Record<string, string>;
        } catch {
          return null;
        }
      })()
    : null;

  try {
    let rows: ParsedRow[] = [];

    switch (file.fileType) {
      case "TXT":
      case "CSV": {
        const content = fs.readFileSync(file.filePath, "utf-8");
        rows = parseCsvOrTxt(content, columnMapping);
        break;
      }
      case "ENCRYPTED_TXT": {
        const rawBuffer = fs.readFileSync(file.filePath);
        let content: string;

        // Try UTF-8 first (plain text)
        const asUtf8 = rawBuffer.toString("utf-8");
        if (!/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(asUtf8)) {
          content = asUtf8;
        } else {
          // Binary/encrypted: PGP decrypt
          const pgpPassword =
            (file.sourceId
              ? (
                  await prisma.integrationConfig.findFirst({
                    where: {
                      sourceId: file.sourceId,
                      configKey: "pgp_decrypt_password",
                    },
                  })
                )?.configValue
              : null) ?? env.janPgpPassword;

          if (!pgpPassword) {
            throw new Error(
              "PGP-encrypted files require decryption. Set JAN_PGP_PASSWORD in .env or add pgp_decrypt_password in IntegrationConfig for this source.",
            );
          }

          try {
            content = await pgpDecrypt(rawBuffer, { password: pgpPassword });
          } catch (decErr) {
            const msg = decErr instanceof Error ? decErr.message : "Decryption failed";
            throw new Error(`PGP decryption failed: ${msg}. Check password/key.`);
          }
        }

        rows = parseCsvOrTxt(content, columnMapping);
        break;
      }
      case "EXCEL": {
        rows = parseExcel(file.filePath, columnMapping);
        break;
      }
      default:
        throw new Error(`Unsupported file type: ${file.fileType}`);
    }

    const stagingTxs: Array<{
      fileId: number;
      payerIc: string | null;
      payerName: string | null;
      txDate: Date;
      sourceTxRef: string | null;
      amount: number;
      recordHash: string;
    }> = [];
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const amount = parseAmount(row.amount ?? "");
      const txDate = parseDate(row.txDate ?? "");

      if (!amount || amount <= 0) {
        errors.push(`Row ${i + 1}: Invalid amount`);
        continue;
      }
      if (!txDate) {
        errors.push(`Row ${i + 1}: Invalid date`);
        continue;
      }

      const payerIc = (row.payerIc ?? "").replace(/\D/g, "").slice(0, 14) || null;
      const payerName = (row.payerName ?? "").slice(0, 150) || null;
      const sourceTxRef = (row.sourceTxRef ?? "").slice(0, 80) || null;

      const hash = recordHash(fileId, payerIc ?? "", txDate, amount, i);
      stagingTxs.push({
        fileId,
        payerIc,
        payerName,
        txDate,
        sourceTxRef,
        amount,
        recordHash: hash,
      });
    }

    await prisma.integrationStagingTx.createMany({
      data: stagingTxs,
      skipDuplicates: true,
    });

    // Duplicate detection: same-file and cross-file (batched for performance)
    const inserted = await prisma.integrationStagingTx.findMany({
      where: { fileId },
      orderBy: { id: "asc" },
    });

    // Pre-load cross-file keys: all (payerIc, txDate, amount) from other files
    const crossFileKeys = new Set<string>();
    const crossFileByKey = new Map<string, { id: number; fileId: number; fileName: string }>();
    const otherStaging = await prisma.integrationStagingTx.findMany({
      where: { fileId: { not: fileId } },
      select: { id: true, fileId: true, payerIc: true, txDate: true, amount: true, file: { select: { fileName: true } } },
    });
    for (const row of otherStaging) {
      const key = contentKey(row.payerIc, row.txDate, Number(row.amount));
      crossFileKeys.add(key);
      if (!crossFileByKey.has(key)) {
        crossFileByKey.set(key, {
          id: row.id,
          fileId: row.fileId,
          fileName: row.file?.fileName ?? "unknown",
        });
      }
    }

    const sameFileDupes: Array<{ stagingTxId: number; duplicateType: "SAME_FILE"; matchedStagingTxId: number; reason: string }> = [];
    const crossFileDupes: Array<{ stagingTxId: number; duplicateType: "CROSS_FILE"; matchedStagingTxId: number; reason: string }> = [];
    const idsToMarkDuplicate: number[] = [];

    // Same-file: group by (payerIc, txDate, amount), collect duplicates
    const keyToRows = new Map<string, typeof inserted>();
    for (const row of inserted) {
      const key = contentKey(row.payerIc, row.txDate, Number(row.amount));
      const arr = keyToRows.get(key) ?? [];
      arr.push(row);
      keyToRows.set(key, arr);
    }

    for (const [, rows] of keyToRows) {
      if (rows.length <= 1) continue;
      const [first, ...dupes] = rows;
      for (const dup of dupes) {
        idsToMarkDuplicate.push(dup.id);
        sameFileDupes.push({
          stagingTxId: dup.id,
          duplicateType: "SAME_FILE",
          matchedStagingTxId: first.id,
          reason: `Duplicate within file: same payerIc, txDate, amount as row ${first.id}`,
        });
      }
    }

    // Cross-file: check against pre-loaded set
    for (const row of inserted) {
      if (idsToMarkDuplicate.includes(row.id)) continue;
      const key = contentKey(row.payerIc, row.txDate, Number(row.amount));
      const existing = crossFileByKey.get(key);
      if (existing) {
        idsToMarkDuplicate.push(row.id);
        crossFileDupes.push({
          stagingTxId: row.id,
          duplicateType: "CROSS_FILE",
          matchedStagingTxId: existing.id,
          reason: `Duplicate across files: matches row ${existing.id} in file ${existing.fileId} (${existing.fileName})`,
        });
      }
    }

    // Batch update staging status
    if (idsToMarkDuplicate.length > 0) {
      await prisma.integrationStagingTx.updateMany({
        where: { id: { in: idsToMarkDuplicate } },
        data: { stagingStatus: "DUPLICATE" },
      });
      await prisma.integrationStagingDuplicate.createMany({
        data: [...sameFileDupes, ...crossFileDupes],
      });
    }

    const totalAmount = stagingTxs.reduce((s, t) => s + t.amount, 0);
    const duplicateCount = await prisma.integrationStagingDuplicate.count({
      where: { stagingTx: { fileId } },
    });

    await prisma.integrationFile.update({
      where: { id: fileId },
      data: {
        processingStatus: "SUCCESS",
        validationStatus: errors.length > 0 ? "PARTIAL" : "SUCCESS",
        decryptStatus: file.fileType === "ENCRYPTED_TXT" ? "SUCCESS" : "SKIPPED",
        ...(file.fileType === "ENCRYPTED_TXT" && { encryptionMethod: "PGP" }),
        totalRecordsParsed: stagingTxs.length,
        totalAmountParsed: totalAmount,
        errorSummary: errors.length > 0 ? errors.slice(0, 5).join("; ") : null,
      },
    });

    await prisma.integrationJob.update({
      where: { id: job.id },
      data: { jobStatus: "SUCCESS" },
    });

    await prisma.integrationFileEvent.create({
      data: {
        fileId,
        eventType: "PROCESS_COMPLETED",
        eventStatus: "SUCCESS",
        eventMessage:
          duplicateCount > 0
            ? `Parsed ${stagingTxs.length} records, total RM ${totalAmount.toFixed(2)}, ${duplicateCount} duplicate(s) detected`
            : `Parsed ${stagingTxs.length} records, total RM ${totalAmount.toFixed(2)}`,
        createdBy,
      },
    });

    return { success: true, recordsParsed: stagingTxs.length, duplicatesDetected: duplicateCount };
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : "Processing failed";
    await prisma.integrationFile.update({
      where: { id: fileId },
      data: {
        processingStatus: "FAILED",
        errorSummary: errMsg,
      },
    });

    await prisma.integrationJob.update({
      where: { id: job.id },
      data: { jobStatus: "FAILED", lastError: errMsg },
    });

    await prisma.integrationFileEvent.create({
      data: {
        fileId,
        eventType: "PROCESS_FAILED",
        eventStatus: "FAILED",
        eventMessage: errMsg,
        createdBy,
      },
    });

    return { success: false, recordsParsed: 0, error: errMsg };
  }
}
