/**
 * Generate PSP sample data (100 rows) for reconciliation testing.
 * - 10 rows: Variance - same IC as GuestPayment but different amount (Variance tab)
 * - 5 rows: 1-to-1 match with seed GuestPayment
 * - 10 rows: Match by IC+name+amount, different reference
 * - 75 rows: Unmatched
 *
 * Prerequisites: Run `npm run db:seed` first to create GuestPayment records.
 * Usage: npx tsx scripts/generate-psp-sample-100.ts
 */
import * as XLSX from "xlsx";
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

const BASE_DATE = new Date().toISOString().slice(0, 10);

type Row = [string, string, string, number, string];
const header: Row = ["payerIc", "payerName", "sourceTxRef", "amount", "date"];
const data: Row[] = [header];

// --- 10 rows: Variance (same IC as GuestPayment, different amount → Variance tab) ---
const varianceDeltas = [10, -5, 15, -8, 12, 7, -3, 20, -10, 5];
for (let i = 0; i < 10; i++) {
  const identity = icNo(i + 1);
  const baseAmount = 50 + i * 5;
  const amount = Math.max(10, baseAmount + varianceDeltas[i]);
  data.push([identity, muslimNames[i], pspRef(100 + i), amount, BASE_DATE]);
}

// --- 5 rows: 1-to-1 match (receiptNo = GRCPT-SEED-REG-xxx) ---
for (let i = 0; i < 5; i++) {
  const receiptNo = `GRCPT-SEED-REG-${String(i + 1).padStart(3, "0")}`;
  const identity = icNo(i + 1);
  const amount = 50 + i * 5;
  data.push([identity, muslimNames[i], receiptNo, amount, BASE_DATE]);
}

// --- 10 rows: Match by IC+name+amount, different reference ---
for (let i = 0; i < 10; i++) {
  const identity = icNo(i + 1);
  const amount = 50 + i * 5;
  data.push([identity, muslimNames[i], pspRef(200 + i), amount, BASE_DATE]);
}

// --- 75 rows: Unmatched ---
for (let i = 0; i < 75; i++) {
  const amounts = [50, 75, 100, 125, 150, 200, 250, 300, 350, 400, 500];
  const base = randomElement(amounts);
  const amount = base + randomInt(0, 99) / 100;
  const year = 2025;
  const month = String(randomInt(1, 12)).padStart(2, "0");
  const day = String(randomInt(1, 28)).padStart(2, "0");
  const txDate = `${year}-${month}-${day}`;
  data.push([
    generateIc(),
    randomElement(muslimNames),
    pspRef(300 + i),
    amount,
    txDate,
  ]);
}

const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Transactions");

const outDir = path.join(process.cwd(), "uploads", "samples");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "psp-sample-100.xlsx");
XLSX.writeFile(wb, outPath);

console.log(`Generated PSP sample at: ${outPath}`);
console.log(`  - 10 rows: Variance (same IC, different amount → Variance tab)`);
console.log(`  - 5 rows: 1-to-1 match`);
console.log(`  - 10 rows: Match by IC+name+amount, different ref`);
console.log(`  - 75 rows: Unmatched`);
console.log(`\nNote: Run npm run db:seed first.`);
