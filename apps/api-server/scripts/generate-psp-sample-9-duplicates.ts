/**
 * Generate PSP sample data with 9 duplicate records ACROSS FILES.
 *
 * Creates 2 CSV files:
 * - psp-duplicates-file1.csv: 9 records + 5 unique
 * - psp-duplicates-file2.csv: same 9 records (different sourceTxRef) + 5 unique
 *
 * When both files are uploaded and processed via Integration 3rd Party,
 * the system will detect 9 CROSS_FILE duplicates (same payerIc, txDate, amount).
 *
 * Usage: npx tsx scripts/generate-psp-sample-9-duplicates.ts
 */
import * as fs from "node:fs";
import * as path from "node:path";

const muslimNames = [
  "Muhammad Amir Hakim",
  "Ahmad Firdaus",
  "Mohd Syafiq",
  "Nur Aisyah",
  "Siti Nurul Huda",
  "Noraini Binti Ismail",
  "Abdul Rahman",
  "Khairul Anuar",
  "Norshuhada",
];

function icNo(seed: number): string {
  return `90010${(seed % 9) + 1}${String((seed % 28) + 1).padStart(2, "0")}10${String(1000 + seed)}`;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateIc(): string {
  const yy = randomInt(60, 99);
  const mm = String(randomInt(1, 12)).padStart(2, "0");
  const dd = String(randomInt(1, 28)).padStart(2, "0");
  const state = randomInt(1, 59);
  const gender = randomInt(0, 9);
  const seq = randomInt(1, 999);
  return `${yy}${mm}${dd}${String(state).padStart(2, "0")}${gender}${String(seq).padStart(3, "0")}`;
}

function escapeCsv(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

const BASE_DATE = new Date().toISOString().slice(0, 10);

// --- 9 records that will be duplicated ACROSS files (same payerIc, txDate, amount) ---
const duplicateRecords: Array<{ payerIc: string; payerName: string; amount: number }> = [];
for (let i = 0; i < 9; i++) {
  duplicateRecords.push({
    payerIc: icNo(i + 1),
    payerName: muslimNames[i],
    amount: 50 + (i + 1) * 10, // 60, 70, 80, 90, 100, 110, 120, 130, 140
  });
}

// --- 5 unique records per file (different ICs, amounts, dates) ---
const uniqueForFile1: Array<{ payerIc: string; payerName: string; sourceTxRef: string; amount: number; date: string }> = [];
const uniqueForFile2: Array<{ payerIc: string; payerName: string; sourceTxRef: string; amount: number; date: string }> = [];
const amounts = [75, 100, 125, 150, 200];
for (let i = 0; i < 5; i++) {
  const ic = generateIc();
  const amt = amounts[i] + i;
  const d = new Date(BASE_DATE);
  d.setDate(d.getDate() - (i + 1));
  const dateStr = d.toISOString().slice(0, 10);
  uniqueForFile1.push({
    payerIc: ic,
    payerName: muslimNames[(i + 2) % muslimNames.length],
    sourceTxRef: `BILPIZ-F1-UNIQ-${String(i + 1).padStart(4, "0")}`,
    amount: amt,
    date: dateStr,
  });
  uniqueForFile2.push({
    payerIc: generateIc(),
    payerName: muslimNames[(i + 4) % muslimNames.length],
    sourceTxRef: `BILPIZ-F2-UNIQ-${String(i + 1).padStart(4, "0")}`,
    amount: amt + 5,
    date: dateStr,
  });
}

function toCsvRow(r: { payerIc: string; payerName: string; sourceTxRef: string; amount: number; date: string }): string {
  return `${r.payerIc},${escapeCsv(r.payerName)},${r.sourceTxRef},${r.amount},${r.date}`;
}

function buildFile(
  refPrefix: string,
  duplicates: typeof duplicateRecords,
  uniques: typeof uniqueForFile1,
): string[] {
  const rows: string[] = ["payerIc,payerName,sourceTxRef,amount,date"];

  // 9 duplicate records (same payerIc, txDate, amount as the other file)
  for (let i = 0; i < duplicates.length; i++) {
    const r = duplicates[i];
    rows.push(toCsvRow({
      payerIc: r.payerIc,
      payerName: r.payerName,
      sourceTxRef: `${refPrefix}-DUP-${String(i + 1).padStart(3, "0")}`,
      amount: r.amount,
      date: BASE_DATE,
    }));
  }

  // 5 unique records
  for (const u of uniques) {
    rows.push(toCsvRow(u));
  }

  return rows;
}

const file1Rows = buildFile("BILPIZ-F1", duplicateRecords, uniqueForFile1);
const file2Rows = buildFile("BILPIZ-F2", duplicateRecords, uniqueForFile2);

const outDir = path.join(process.cwd(), "uploads", "samples");
fs.mkdirSync(outDir, { recursive: true });

const file1Path = path.join(outDir, "psp-duplicates-file1.csv");
const file2Path = path.join(outDir, "psp-duplicates-file2.csv");

fs.writeFileSync(file1Path, file1Rows.join("\n"), "utf-8");
fs.writeFileSync(file2Path, file2Rows.join("\n"), "utf-8");

console.log(`Generated PSP sample with 9 cross-file duplicates:`);
console.log(`  File 1: ${file1Path}`);
console.log(`  File 2: ${file2Path}`);
console.log(`\nEach file: 9 duplicate records + 5 unique = 14 rows`);
console.log(`\nTo trigger 9 duplicates:`);
console.log(`  1. Upload file1 as BILPIZ (or AMIL_BILPIZ02) → Process (wait for completion)`);
console.log(`  2. Upload file2 as SAME source → Process`);
console.log(`  3. System will detect 9 CROSS_FILE duplicates (same payerIc, txDate, amount)`);
console.log(`\nImportant: Process files ONE AT A TIME. Wait for file1 to finish before processing file2.`);
