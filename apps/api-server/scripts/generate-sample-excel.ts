/**
 * Generate sample transaction data in Excel format.
 * Columns: payerIc, payerName, sourceTxRef, amount, date
 * Usage: npx tsx scripts/generate-sample-excel.ts
 */
import * as XLSX from "xlsx";
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

function generateSourceTxRef(index: number): string {
  const prefix = randomElement(["JAN", "BILPIZ", "BANK", "PSP"]);
  const year = 2025;
  const month = String(randomInt(1, 12)).padStart(2, "0");
  return `${prefix}-${year}${month}-${String(index).padStart(6, "0")}`;
}

function generateAmount(): number {
  const amounts = [50, 75, 100, 125, 150, 200, 250, 300, 350, 400, 500, 600, 750, 1000];
  const base = randomElement(amounts);
  const cents = randomInt(0, 99);
  return base + cents / 100;
}

function generateDate(): string {
  const year = 2025;
  const month = String(randomInt(1, 12)).padStart(2, "0");
  const day = String(randomInt(1, 28)).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const ROWS = 1500;
const data: Array<[string, string, string, number, string]> = [
  ["payerIc", "payerName", "sourceTxRef", "amount", "date"],
];

for (let i = 0; i < ROWS; i++) {
  data.push([
    generateIc(),
    randomElement(muslimNames),
    generateSourceTxRef(i + 1),
    generateAmount(),
    generateDate(),
  ]);
}

const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Transactions");

const outDir = path.join(process.cwd(), "uploads", "samples");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "zakat-sample-1500.xlsx");
XLSX.writeFile(wb, outPath);

console.log(`Generated ${ROWS} rows at: ${outPath}`);
