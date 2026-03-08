/**
 * Generate JAN (Jabatan Akauntan Negara) sample data - 1018 records in encrypted .gpg format,
 * plus 1 bank statement row that matches the total of all 1018 JAN records.
 *
 * Format: pipe-delimited | NOIC | NAMA | TARIKH | RUJUKAN | AMAUN |
 *
 * Usage: npx tsx scripts/generate-jan-sample-1018.ts [--seed-db]
 *
 * Output:
 *   - uploads/samples/jan-sample-1018.txt.gpg (PGP encrypted)
 *   - uploads/samples/jan-sample-1018-keys.txt (password for decryption)
 *   - uploads/samples/bank-statement-jan-1018.csv (1 row, amount = sum of 1018 JAN records)
 *
 * With --seed-db: also inserts BankStatementFile + 1 BankStatementTransaction into DB for reconciliation.
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

function deterministicAmount(i: number): number {
  return 50 + (i % 100) * 5;
}

function generateIc(seed: number): string {
  const yy = 90 + (seed % 10);
  const mm = String((seed % 12) + 1).padStart(2, "0");
  const dd = String((seed % 28) + 1).padStart(2, "0");
  const state = (seed % 59) + 1;
  const gender = seed % 10;
  const seq = (seed % 999) + 1;
  return `${yy}${mm}${dd}${String(state).padStart(2, "0")}${gender}${String(seq).padStart(3, "0")}`;
}

function janRef(index: number): string {
  return `JAN-SPG-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(index).padStart(6, "0")}`;
}

async function main() {
  const totalRecords = 1018;
  const seedDb = process.argv.includes("--seed-db");
  const delimiter = "|";

  const baseDate = new Date();
  const year = baseDate.getFullYear();
  const month = String(baseDate.getMonth() + 1).padStart(2, "0");
  const valueDate = `${year}-${month}-01`;

  // Header: JAN format (NOIC, NAMA, TARIKH, RUJUKAN, AMAUN)
  const header = ["NOIC", "NAMA", "TARIKH", "RUJUKAN", "AMAUN"].join(delimiter);
  const rows: string[] = [header];

  let totalAmount = 0;

  for (let i = 0; i < totalRecords; i++) {
    const amount = deterministicAmount(i);
    totalAmount += amount;
    const day = String((i % 28) + 1).padStart(2, "0");
    const txDate = `${year}-${month}-${day}`;
    const ref = janRef(i + 1);
    const name = muslimNames[i % muslimNames.length];
    const ic = generateIc(i + 2000);

    rows.push([ic, name, txDate, ref, amount.toFixed(2)].join(delimiter));
  }

  const plainContent = rows.join("\n");

  // PGP encrypt with password (symmetric)
  const password = process.env.JAN_PGP_PASSWORD ?? "nks-jan-dev-2025";
  const message = await openpgp.createMessage({ text: plainContent });
  const encrypted = await openpgp.encrypt({
    message,
    passwords: [password],
    format: "binary",
  });

  const outDir = path.join(process.cwd(), "uploads", "samples");
  fs.mkdirSync(outDir, { recursive: true });

  const encPath = path.join(outDir, "jan-sample-1018.txt.gpg");
  const keysPath = path.join(outDir, "jan-sample-1018-keys.txt");
  const bankCsvPath = path.join(outDir, "bank-statement-jan-1018.csv");

  fs.writeFileSync(encPath, Buffer.from(encrypted as Uint8Array));
  fs.writeFileSync(
    keysPath,
    `Password for PGP decryption (add to .env or IntegrationConfig for JAN source):
JAN_PGP_PASSWORD=${password}

Or add to IntegrationConfig (source=JAN, configKey=pgp_decrypt_password, isSecret=true)
`,
  );

  // Bank statement CSV: 1 row matching total of 1018 JAN records
  const bankHeader = "paymentReference,approvalCode,chequeNo,valueDate,amount,description,counterparty";
  const bankRef = `JAN-BATCH-${year}${month}-1018`;
  const bankRow = [
    bankRef,
    "",
    "",
    valueDate,
    totalAmount.toFixed(2),
    `Zakat JAN batch 1018 records`,
    "LZS Zakat Collection",
  ].join(",");
  fs.writeFileSync(bankCsvPath, [bankHeader, bankRow].join("\n"));

  console.log(`Generated JAN sample at: ${encPath}`);
  console.log(`  - Records: ${totalRecords}`);
  console.log(`  - Total amount: RM ${totalAmount.toFixed(2)}`);
  console.log(`  - Format: NOIC|NAMA|TARIKH|RUJUKAN|AMAUN (pipe-delimited)`);
  console.log(`\nGenerated bank statement at: ${bankCsvPath}`);
  console.log(`  - 1 row, amount RM ${totalAmount.toFixed(2)} (matches sum of 1018 JAN records)`);
  console.log(`\nDecryption password saved to: ${keysPath}`);
  console.log(`Add to .env: JAN_PGP_PASSWORD=${password}`);

  if (seedDb) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    try {
      const bankFile = await prisma.bankStatementFile.create({
        data: {
          bankCode: "BIMB",
          bankName: "Bank Islam",
          accountNo: "1234567890",
          statementDate: new Date(valueDate),
          importedBy: "SEED-JAN-1018",
        },
      });
      await prisma.bankStatementTransaction.create({
        data: {
          fileId: bankFile.id,
          paymentReference: bankRef,
          valueDate: new Date(valueDate),
          amount: totalAmount,
          description: "Zakat JAN batch 1018 records",
          counterparty: "LZS Zakat Collection",
        },
      });
      console.log(`\nSeeded BankStatementFile + 1 BankStatementTransaction (amount RM ${totalAmount.toFixed(2)})`);
    } finally {
      await prisma.$disconnect();
    }
  } else {
    console.log(`\nTo seed bank statement into DB for reconciliation, run with --seed-db`);
  }

  console.log(`\nUpload jan-sample-1018.txt.gpg via File Upload (source=JAN, fileType=ENCRYPTED_TXT)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
