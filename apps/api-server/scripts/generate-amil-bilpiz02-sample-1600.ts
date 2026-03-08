/**
 * Generate AMIL_BILPIZ02 (PSP) sample data in CSV format (1600 rows).
 * - 20 rows: Matched (1-to-1 with GuestPayment)
 * - 11 rows: Variance (same IC, different amount → Variance tab)
 * - 15 rows: To be matched by AI (same IC+amount, date outside 3-day → AI suggests match)
 * - 1554 rows: Unmatched
 *
 * Prerequisites: Run `npm run db:seed` first. Add AMIL_BILPIZ02 source in Sumber Data if needed.
 * Usage: npx tsx scripts/generate-amil-bilpiz02-sample-1600.ts
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

function amilBilpiz02Ref(index: number): string {
  return `AMIL_BILPIZ02-202501-${String(index).padStart(6, "0")}`;
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

// --- 20 rows: Matched (1-to-1 with GRCPT-SEED-REG-xxx) ---
for (let i = 0; i < 20; i++) {
  const receiptNo = `GRCPT-SEED-REG-${String(i + 1).padStart(3, "0")}`;
  const identity = icNo(i + 1);
  const amount = 50 + i * 5;
  rows.push(`${identity},${escapeCsv(muslimNames[i])},${receiptNo},${amount},${BASE_DATE}`);
}

// --- 11 rows: Variance (same IC, different amount → Variance tab) ---
const varianceDeltas = [10, -5, 15, -8, 12, 7, -3, 20, -10, 5, 18];
for (let i = 0; i < 11; i++) {
  const identity = icNo(i + 1);
  const baseAmount = 50 + i * 5;
  const amount = Math.max(10, baseAmount + varianceDeltas[i]);
  rows.push(`${identity},${escapeCsv(muslimNames[i])},${amilBilpiz02Ref(100 + i)},${amount},${BASE_DATE}`);
}

// --- 15 rows: To be matched by AI (same IC+amount, date 5 days before → outside 3-day auto-match) ---
for (let i = 0; i < 15; i++) {
  const identity = icNo(i + 1);
  const amount = 50 + i * 5;
  rows.push(`${identity},${escapeCsv(muslimNames[i])},${amilBilpiz02Ref(200 + i)},${amount},${AI_MATCH_DATE}`);
}

// --- 1554 rows: Unmatched ---
for (let i = 0; i < 1554; i++) {
  const amounts = [50, 75, 100, 125, 150, 200, 250, 300, 350, 400, 500, 600, 750, 1000];
  const base = randomElement(amounts);
  const amount = base + randomInt(0, 99) / 100;
  const year = 2025;
  const month = String(randomInt(1, 12)).padStart(2, "0");
  const day = String(randomInt(1, 28)).padStart(2, "0");
  const txDate = `${year}-${month}-${day}`;
  rows.push(
    `${generateIc()},${escapeCsv(randomElement(muslimNames))},${amilBilpiz02Ref(300 + i)},${amount},${txDate}`,
  );
}

const csv = rows.join("\n");
const outDir = path.join(process.cwd(), "uploads", "samples");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "amil-bilpiz02-sample-1600.csv");
fs.writeFileSync(outPath, csv, "utf-8");

console.log(`Generated AMIL_BILPIZ02 sample at: ${outPath}`);
console.log(`  - 20 rows: Matched (1-to-1)`);
console.log(`  - 11 rows: Variance (same IC, different amount)`);
console.log(`  - 15 rows: To be matched by AI (date outside 3-day → AI suggests)`);
console.log(`  - 1554 rows: Unmatched`);
console.log(`\nUpload with Source: AMIL_BILPIZ02 (add in Sumber Data if needed), File Type: CSV`);
console.log(`Note: Run npm run db:seed first.`);
