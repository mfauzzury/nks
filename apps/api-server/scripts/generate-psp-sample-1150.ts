/**
 * Generate PSP sample data (1150 rows) for reconciliation testing.
 * - 20 rows: 1-to-1 match with seed GuestPayment (receiptNo, IC, name, amount, date)
 * - 17 rows: Match by name, IC, amount but different reference (BILPIZ ref vs GRCPT)
 * - 15 rows: Variance - same IC as GuestPayment but different amount (appears in Variance tab)
 * - 1098 rows: Unmatched
 *
 * Prerequisites: Run `npm run db:seed` first to create GuestPayment records.
 * Usage: npx tsx scripts/generate-psp-sample-1150.ts
 */
import * as XLSX from "xlsx";
import * as fs from "node:fs";
import * as path from "node:path";

// Must match seed.ts exactly for 1-to-1 and ref-diff matches
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
  "Siti Sarah",
  "Mohd Ridzuan",
  "Nur Aina",
  "Wan Azman",
  "Nor Azlina",
  "Khairul Nizam",
  "Nurul Ain",
  "Ahmad Faiz",
  "Siti Mariam",
  "Mohd Zulfadli",
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

// Base date for matching - use today so it aligns with GuestPayment.paidAt when seed runs same day
const BASE_DATE = new Date().toISOString().slice(0, 10);

type Row = [string, string, string, number, string];
const header: Row = ["payerIc", "payerName", "sourceTxRef", "amount", "date"];
const data: Row[] = [header];

// --- 20 rows: 1-to-1 match with GRCPT-SEED-REG-001..020 ---
// receiptNo, guestName, identityNo, amount from seed
for (let i = 0; i < 20; i++) {
  const receiptNo = `GRCPT-SEED-REG-${String(i + 1).padStart(3, "0")}`;
  const identity = icNo(i + 1);
  const amount = 50 + i * 5;
  data.push([identity, muslimNames[i], receiptNo, amount, BASE_DATE]);
}

// --- 17 rows: Match by name, IC, amount but different reference ---
// Same as GuestPayment but sourceTxRef = BILPIZ-xxx (not GRCPT)
// Use indices 0-16 of REG (avoid overlap with variance which uses 0-14)
for (let i = 0; i < 17; i++) {
  const identity = icNo(i + 1);
  const amount = 50 + i * 5;
  const ref = pspRef(1000 + i);
  data.push([identity, muslimNames[i], ref, amount, BASE_DATE]);
}

// --- 15 rows: Variance - same IC as GuestPayment but different amount ---
// Uses REG 0-14, same IC+name+date but amount differs (e.g. +10 or -5)
const varianceAmountDelta = [10, -5, 15, -8, 12, 7, -3, 20, -10, 5, 18, -7, 9, -12, 11];
for (let i = 0; i < 15; i++) {
  const identity = icNo(i + 1);
  const baseAmount = 50 + i * 5;
  const amount = Math.max(10, baseAmount + varianceAmountDelta[i]);
  const ref = pspRef(2000 + i);
  data.push([identity, muslimNames[i], ref, amount, BASE_DATE]);
}

// --- 1098 rows: Unmatched (random IC, name, amount, ref) ---
const unmatchedCount = 1150 - 20 - 17 - 15;
for (let i = 0; i < unmatchedCount; i++) {
  const amounts = [50, 75, 100, 125, 150, 200, 250, 300, 350, 400, 500, 600, 750, 1000];
  const base = randomElement(amounts);
  const amount = base + randomInt(0, 99) / 100;
  const year = 2025;
  const month = String(randomInt(1, 12)).padStart(2, "0");
  const day = String(randomInt(1, 28)).padStart(2, "0");
  const txDate = `${year}-${month}-${day}`;
  data.push([
    generateIc(),
    randomElement(muslimNames),
    pspRef(3000 + i),
    amount,
    txDate,
  ]);
}

const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Transactions");

const outDir = path.join(process.cwd(), "uploads", "samples");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "psp-sample-1150.xlsx");
XLSX.writeFile(wb, outPath);

console.log(`Generated PSP sample at: ${outPath}`);
console.log(`  - 20 rows: 1-to-1 match (sourceTxRef = GRCPT-SEED-REG-xxx)`);
console.log(`  - 17 rows: Match by IC+name+amount, different ref (BILPIZ-xxx)`);
console.log(`  - 15 rows: Variance (same IC, different amount → Variance tab)`);
console.log(`  - ${unmatchedCount} rows: Unmatched`);
console.log(`\nNote: Ensure GuestPayment seed exists (npm run db:seed).`);
console.log(`For Variance tab: reconciliation must detect IC+date match but amount differs.`);
