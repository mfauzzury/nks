const fs = require("fs");
const path = require("path");

const muslimNames = [
  "Muhammad Amir Hakim", "Ahmad Firdaus", "Mohd Syafiq", "Nur Aisyah", "Siti Nurul Huda",
  "Noraini Binti Ismail", "Abdul Rahman", "Khairul Anuar", "Norshuhada", "Hafizah Binti Hamzah",
  "Muhammad Danish", "Nur Izzati", "Aiman Hakimi", "Ainul Mardhiah", "Wan Muhammad Faiz",
  "Ummu Hani", "Fatin Nabila", "Faris Imran", "Sofea Natasha", "Zulkifli Ahmad",
  "Nurul Iman", "Muhammad Hafiz", "Siti Sarah", "Ahmad Zaki", "Nurul Huda",
  "Mohd Firdaus", "Nur Amira", "Wan Nurul", "Muhammad Irfan", "Siti Fatimah",
  "Ahmad Syukri", "Nurul Ain", "Mohd Razif", "Nurul Syuhada", "Abdul Halim",
  "Nurul Izzah", "Muhammad Faiz", "Siti Mariam", "Ahmad Farhan", "Nurul Jannah",
];

function icNo(seed) {
  const d = (seed % 28) + 1;
  const m = (seed % 12) + 1;
  const y = 90 + (seed % 35);
  const seq = 1000 + (seed % 9000);
  return `9${y}${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}${String(seq).padStart(4, "0")}`;
}

function randomAmount() {
  const amounts = [50, 75, 100, 120, 150, 200, 250, 300, 350, 400, 500];
  return amounts[Math.floor(Math.random() * amounts.length)];
}

function randomDate() {
  const day = Math.floor(Math.random() * 28) + 1;
  const month = Math.floor(Math.random() * 12) + 1;
  const year = 2025;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const lines = ["ic,name,date,reference,amount"];

for (let i = 1; i <= 1000; i++) {
  const ic = icNo(i);
  const name = muslimNames[(i - 1) % muslimNames.length];
  const date = randomDate();
  const ref = `TXN-${String(i).padStart(6, "0")}`;
  const amount = randomAmount();
  lines.push(`${ic},${name},${date},${ref},${amount}`);
}

const outputPath = path.join("C:\\LZS - Lembaga Zakat Selangor", "zakat-sample-1000.txt");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, lines.join("\n"), "utf8");
console.log(`Created ${outputPath} with ${lines.length} rows (1 header + 1000 data)`);
