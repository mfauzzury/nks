/**
 * Generate PSP sample data (1007 rows) for reconciliation testing.
 *
 * Breakdown:
 * - 600 rows: Matched (1-to-1 with GuestPayment GRCPT-SEED-REG-001 to 600)
 * - 5 rows: Variance (same IC as GuestPayment, different amount → Variance tab)
 * - 6 rows: 3 same-file duplicate pairs (same payerIc, txDate, amount twice)
 * - 50 rows: Unmatched (first 50) — 4 AI-matchable (same IC+amount, date 5 days before)
 * - 346 rows: Unmatched (remaining)
 *
 * Prerequisites: Run `npm run db:seed` first (seed includes 600 GuestPayment).
 * Usage: npx tsx scripts/generate-psp-sample-1007.ts
 */
import * as fs from "node:fs";
import * as path from "node:path";

function icNo(seed: number): string {
  return `90010${(seed % 9) + 1}${String((seed % 28) + 1).padStart(2, "0")}10${String(1000 + seed)}`;
}

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
  "Hafizah Binti Hamzah",
  "Muhammad Danish",
  "Nur Izzati",
  "Aiman Hakimi",
  "Ainul Mardhiah",
  "Wan Muhammad Faiz",
  "Ummu Hani",
  "Fatin Nabila",
  "Faris Imran",
  "Sofea Natasha",
  "Zulkifli Ahmad",
  "Nurul Izzah",
  "Ahmad Zaki",
  "Siti Aminah",
  "Mohd Hafiz",
  "Nur Syahirah",
  "Abdul Aziz",
  "Fatimah Zahra",
  "Muhammad Irfan",
  "Nurul Huda",
  "Ahmad Fadzli",
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
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

function pspRef(index: number): string {
  return `BILPIZ-202501-${String(index).padStart(6, "0")}`;
}

function escapeCsv(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

const BASE_DATE = new Date().toISOString().slice(0, 10);
const AI_MATCH_DATE = (() => {
  const d = new Date(BASE_DATE);
  d.setDate(d.getDate() - 5);
  return d.toISOString().slice(0, 10);
})();

const rows: string[] = [];
rows.push("payerIc,payerName,sourceTxRef,amount,date");

// --- 600 rows: Matched (1-to-1 with GRCPT-SEED-REG-001 to 600) ---
for (let i = 0; i < 600; i++) {
  const receiptNo = `GRCPT-SEED-REG-${String(i + 1).padStart(3, "0")}`;
  const identity = icNo(i + 1);
  const amount = i < 20 ? 50 + i * 5 : 50 + (i % 100) * 5;
  rows.push(`${identity},${escapeCsv(muslimNames[i % muslimNames.length])},${receiptNo},${amount},${BASE_DATE}`);
}

// --- 5 rows: Variance (same IC as GuestPayment icNo(1)..icNo(5), different amount) ---
const varianceDeltas = [10, -5, 15, -8, 12];
for (let i = 0; i < 5; i++) {
  const identity = icNo(i + 1);
  const baseAmount = i < 20 ? 50 + i * 5 : 50 + (i % 100) * 5;
  const amount = Math.max(10, baseAmount + varianceDeltas[i]);
  rows.push(`${identity},${escapeCsv(muslimNames[i])},${pspRef(60000 + i)},${amount},${BASE_DATE}`);
}

// --- 6 rows: 3 same-file duplicate pairs (same payerIc, txDate, amount appears twice) ---
for (let i = 0; i < 3; i++) {
  const identity = icNo(700 + i);
  const amount = 100 + i * 10;
  const name = muslimNames[(i + 5) % muslimNames.length];
  rows.push(`${identity},${escapeCsv(name)},${pspRef(61000 + i * 2)},${amount},${BASE_DATE}`);
  rows.push(`${identity},${escapeCsv(name)},${pspRef(61001 + i * 2)},${amount},${BASE_DATE}`);
}

// --- 50 rows: Unmatched (first 50) — 4 AI-matchable + 46 regular ---
// 4 AI-matchable: same IC+amount as GuestPayment icNo(1)..icNo(4), date 5 days before
for (let i = 0; i < 4; i++) {
  const identity = icNo(i + 1);
  const amount = i < 20 ? 50 + i * 5 : 50 + (i % 100) * 5;
  rows.push(`${identity},${escapeCsv(muslimNames[i])},${pspRef(62000 + i)},${amount},${AI_MATCH_DATE}`);
}
// 46 regular unmatched
for (let i = 0; i < 46; i++) {
  const amounts = [75, 100, 125, 150, 200, 250, 300, 350, 400, 500];
  const base = randomElement(amounts);
  const amount = base + randomInt(0, 99) / 100;
  const year = 2025;
  const month = String(randomInt(1, 12)).padStart(2, "0");
  const day = String(randomInt(1, 28)).padStart(2, "0");
  const txDate = `${year}-${month}-${day}`;
  rows.push(
    `${generateIc()},${escapeCsv(randomElement(muslimNames))},${pspRef(62050 + i)},${amount},${txDate}`,
  );
}

// --- 346 rows: Unmatched (remaining) ---
for (let i = 0; i < 346; i++) {
  const amounts = [50, 75, 100, 125, 150, 200, 250, 300, 350, 400, 500, 600, 750, 1000];
  const base = randomElement(amounts);
  const amount = base + randomInt(0, 99) / 100;
  const year = 2025;
  const month = String(randomInt(1, 12)).padStart(2, "0");
  const day = String(randomInt(1, 28)).padStart(2, "0");
  const txDate = `${year}-${month}-${day}`;
  rows.push(
    `${generateIc()},${escapeCsv(randomElement(muslimNames))},${pspRef(63000 + i)},${amount},${txDate}`,
  );
}

const csv = rows.join("\n");
const outDir = path.join(process.cwd(), "uploads", "samples");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "psp-sample-1007.csv");
fs.writeFileSync(outPath, csv, "utf-8");

console.log(`Generated PSP sample at: ${outPath}`);
console.log(`  - 600 rows: Matched (1-to-1 with GuestPayment)`);
console.log(`  - 5 rows: Variance (same IC, different amount)`);
console.log(`  - 6 rows: 3 same-file duplicate pairs`);
console.log(`  - 50 rows: Unmatched (first 50) — 4 AI-matchable + 46 regular`);
console.log(`  - 346 rows: Unmatched (remaining)`);
console.log(`\nTotal: 1007 rows`);
console.log(`\nPrerequisites: Run npm run db:seed first (seed includes 600 GuestPayment).`);
console.log(`Upload as BILPIZ or AMIL_BILPIZ02, then Process and Run Reconciliation.`);
