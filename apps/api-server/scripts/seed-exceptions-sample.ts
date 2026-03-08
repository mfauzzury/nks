/**
 * Seed sample exception data for the Integration Exceptions screen.
 * Creates IntegrationFile (SUCCESS), IntegrationStagingTx, and ReconciliationResult
 * records with UNMATCHED/MISMATCH status for demo display.
 *
 * Prerequisites: Run `npm run db:seed` first (creates IntegrationSource, etc.)
 * Usage: npx tsx scripts/seed-exceptions-sample.ts
 */
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_EXCEPTIONS_FILE_HASH = crypto
  .createHash("sha256")
  .update("seed-exceptions-demo-001")
  .digest("hex");

function recordHash(
  fileId: number,
  payerIc: string,
  txDate: Date,
  amount: number,
  rowIndex: number,
): string {
  const base = `${fileId}|${payerIc}|${txDate.toISOString().slice(0, 10)}|${amount}`;
  return crypto.createHash("sha256").update(`${base}|${rowIndex}`).digest("hex");
}

const sampleExceptions = [
  {
    payerIc: "900101011234",
    payerName: "Ahmad bin Abdullah",
    amount: 150.5,
    sourceTxRef: "BILPIZ-EXC-001",
    exceptionCode: "NO_MATCH",
    exceptionDetail: "No matching internal transaction found for IC and amount",
  },
  {
    payerIc: "850505056789",
    payerName: "Siti Nurul Huda",
    amount: 320.0,
    sourceTxRef: "BILPIZ-EXC-002",
    exceptionCode: "AMOUNT_VARIANCE",
    exceptionDetail: "Amount variance: staging RM 320.00 vs internal RM 300.00",
  },
  {
    payerIc: "920202021234",
    payerName: "Mohd Syafiq Rahman",
    amount: 75.25,
    sourceTxRef: "BILPIZ-EXC-003",
    exceptionCode: "NO_MATCH",
    exceptionDetail: "IC not found in internal records",
  },
  {
    payerIc: "880808085678",
    payerName: "Nur Aisyah Binti Ismail",
    amount: 500.0,
    sourceTxRef: "BILPIZ-EXC-004",
    exceptionCode: "AMOUNT_VARIANCE",
    exceptionDetail: "Multiple possible matches; amount variance exceeds threshold",
  },
  {
    payerIc: "910101011111",
    payerName: "Abdul Rahman bin Hassan",
    amount: 200.0,
    sourceTxRef: "BILPIZ-EXC-005",
    exceptionCode: "NO_MATCH",
    exceptionDetail: "Transaction date mismatch with internal record",
  },
  {
    payerIc: "870707072345",
    payerName: "Fatimah Zahra",
    amount: 88.88,
    sourceTxRef: "BILPIZ-EXC-006",
    exceptionCode: "NO_MATCH",
    exceptionDetail: "No matching internal transaction",
  },
  {
    payerIc: "930303033456",
    payerName: "Muhammad Irfan Hakim",
    amount: 450.5,
    sourceTxRef: "BILPIZ-EXC-007",
    exceptionCode: "AMOUNT_VARIANCE",
    exceptionDetail: "Staging amount RM 450.50 vs internal RM 450.00 (rounding)",
  },
  {
    payerIc: "890909094567",
    payerName: "Noraini Binti Ahmad",
    amount: 125.0,
    sourceTxRef: "BILPIZ-EXC-008",
    exceptionCode: "NO_MATCH",
    exceptionDetail: "Duplicate reference in different file",
  },
];

async function main() {
  const bilpiz = await prisma.integrationSource.findUnique({
    where: { code: "BILPIZ", isActive: true },
  });
  if (!bilpiz) {
    console.error("IntegrationSource BILPIZ not found. Run 'npm run db:seed' first.");
    process.exit(1);
  }

  let file = await prisma.integrationFile.findUnique({
    where: { fileHashSha256: SEED_EXCEPTIONS_FILE_HASH },
  });

  if (!file) {
    file = await prisma.integrationFile.create({
      data: {
        sourceId: bilpiz.id,
        fileName: "exceptions-sample-demo.csv",
        filePath: null,
        fileHashSha256: SEED_EXCEPTIONS_FILE_HASH,
        receivedChannel: "MANUAL",
        fileType: "CSV",
        description: "Sample file for Exceptions screen demo",
        encrypted: false,
        decryptStatus: "N/A",
        validationStatus: "PASSED",
        processingStatus: "SUCCESS",
        totalRecordsParsed: sampleExceptions.length,
        totalAmountParsed: sampleExceptions.reduce((s, x) => s + x.amount, 0),
      },
    });
    console.log(`Created IntegrationFile id=${file.id} (${file.fileName})`);
  } else {
    console.log(`Using existing IntegrationFile id=${file.id}`);
  }

  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  let created = 0;
  for (let i = 0; i < sampleExceptions.length; i++) {
    const ex = sampleExceptions[i];
    const txDate = new Date(baseDate);
    txDate.setDate(txDate.getDate() - (i % 7));

    const hash = recordHash(file.id, ex.payerIc, txDate, ex.amount, i);
    const existingStaging = await prisma.integrationStagingTx.findUnique({
      where: { fileId_recordHash: { fileId: file.id, recordHash: hash } },
    });

    let stagingTx;
    if (!existingStaging) {
      stagingTx = await prisma.integrationStagingTx.create({
        data: {
          fileId: file.id,
          sourceTxRef: ex.sourceTxRef,
          payerIc: ex.payerIc,
          payerName: ex.payerName,
          txDate,
          amount: ex.amount,
          recordHash: hash,
          stagingStatus: "NEW",
        },
      });
      created++;
    } else {
      stagingTx = existingStaging;
    }

    const existingRecon = await prisma.reconciliationResult.findFirst({
      where: { stagingTxId: stagingTx.id },
    });

    if (!existingRecon) {
      const matchStatus = ex.exceptionCode === "AMOUNT_VARIANCE" ? "MISMATCH" : "UNMATCHED";
      await prisma.reconciliationResult.create({
        data: {
          stagingTxId: stagingTx.id,
          matchStatus,
          exceptionCode: ex.exceptionCode,
          exceptionDetail: ex.exceptionDetail,
        },
      });
    }
  }

  console.log(`Created ${created} staging transactions (if new)`);
  console.log(`Seeded ${sampleExceptions.length} exception records.`);
  console.log("Exceptions screen should now display sample data.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
