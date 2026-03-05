/**
 * Generate JAN (Jabatan Akauntan Negara) sample data - 1200 records.
 * Output: PGP-encrypted .txt file for File Upload testing.
 *
 * Format: pipe-delimited | NOIC | NAMA | TARIKH | RUJUKAN | AMAUN |
 * Compatible with integration-processor parseCsvOrTxt (detects | delimiter).
 *
 * Usage: npx tsx scripts/generate-jan-sample-1200.ts
 *
 * Output:
 *   - uploads/samples/jan-sample-1200.txt.gpg (PGP encrypted)
 *   - uploads/samples/jan-sample-1200-keys.txt (password for decryption - add to JAN_PGP_PASSWORD or IntegrationConfig)
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as openpgp from "openpgp";

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

function janRef(index: number): string {
  return `JAN-SPG-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(index).padStart(6, "0")}`;
}

async function main() {
  const totalRecords = 1200;
  const delimiter = "|";

  // Header: JAN format (NOIC, NAMA, TARIKH, RUJUKAN, AMAUN)
  const header = ["NOIC", "NAMA", "TARIKH", "RUJUKAN", "AMAUN"].join(delimiter);
  const rows: string[] = [header];

  const baseDate = new Date();
  const year = baseDate.getFullYear();

  for (let i = 0; i < totalRecords; i++) {
    const amounts = [50, 75, 100, 125, 150, 200, 250, 300, 350, 400, 500, 600, 750, 1000];
    const base = randomElement(amounts);
    const amount = base + randomInt(0, 99) / 100;
    const month = String(randomInt(1, 12)).padStart(2, "0");
    const day = String(randomInt(1, 28)).padStart(2, "0");
    const txDate = `${year}-${month}-${day}`;

    rows.push(
      [generateIc(), randomElement(muslimNames), txDate, janRef(i + 1), amount.toFixed(2)].join(delimiter),
    );
  }

  const plainContent = rows.join("\n");

  // PGP encrypt with password (symmetric). Use fixed dev password for sample consistency.
  const password = process.env.JAN_PGP_PASSWORD ?? "nks-jan-dev-2025";
  const message = await openpgp.createMessage({ text: plainContent });
  const encrypted = await openpgp.encrypt({
    message,
    passwords: [password],
    format: "binary",
  });

  const outDir = path.join(process.cwd(), "uploads", "samples");
  fs.mkdirSync(outDir, { recursive: true });

  const encPath = path.join(outDir, "jan-sample-1200.txt.gpg");
  const plainPath = path.join(outDir, "jan-sample-1200-plain.txt");
  const keysPath = path.join(outDir, "jan-sample-1200-keys.txt");

  fs.writeFileSync(encPath, Buffer.from(encrypted as Uint8Array));
  fs.writeFileSync(plainPath, plainContent);
  fs.writeFileSync(
    keysPath,
    `Password for PGP decryption (add to .env or IntegrationConfig for JAN source):
JAN_PGP_PASSWORD=${password}

Or add to IntegrationConfig (source=JAN, configKey=pgp_decrypt_password, isSecret=true)
`,
  );

  const totalAmount = rows
    .slice(1)
    .reduce((sum, r) => sum + parseFloat(r.split(delimiter)[4] || "0"), 0);

  console.log(`Generated JAN sample at: ${encPath}`);
  console.log(`  - Records: ${totalRecords}`);
  console.log(`  - Total amount: RM ${totalAmount.toFixed(2)}`);
  console.log(`  - Format: NOIC|NAMA|TARIKH|RUJUKAN|AMAUN (pipe-delimited)`);
  console.log(`\nDecryption password saved to: ${keysPath}`);
  console.log(`Add to .env: JAN_PGP_PASSWORD=${password}`);
  console.log(`\nUpload the encrypted file (jan-sample-1200.txt.gpg) via File Upload with source=JAN, fileType=ENCRYPTED_TXT`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
