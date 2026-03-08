type EmployeeLine = { employeeName: string; employeeIdentityNo: string; amount: number };

const CHANNEL_LABELS: Record<string, string> = {
  FPX_B2B: "FPX Online",
  CARD: "Debit/Credit Card",
  CHEQUE: "Cek",
  COUNTER_CASH: "Tunai / Kaunter",
};

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pembayaran Sedang Disahkan",
  awaiting_online_payment: "Menunggu Bayaran Online",
  paid_success: "Bayaran Berjaya",
  paid_failed: "Bayaran Gagal",
};

export function downloadSpgReferencePdf(input: {
  referenceNo: string;
  employerName: string;
  month: number;
  year: number;
  paymentChannel: string;
  totalAmount: number;
  rowCount: number;
  status: string;
  lines: EmployeeLine[];
}) {
  const rows: string[] = [
    "NKS Digital Zakat",
    "Slip Rujukan SPG (Bukan Resit Rasmi)",
    "",
    `No. Rujukan: ${input.referenceNo}`,
    `Majikan: ${input.employerName}`,
    `Tempoh: ${String(input.month).padStart(2, "0")}/${input.year}`,
    `Kaedah Bayaran: ${CHANNEL_LABELS[input.paymentChannel] || input.paymentChannel}`,
    `Status: ${STATUS_LABELS[input.status] || input.status}`,
    `Bil. Pekerja: ${input.rowCount}`,
    `Jumlah: RM ${input.totalAmount.toFixed(2)}`,
    "",
    "Menunggu pengesahan oleh pentadbir.",
    "",
    "--- Senarai Pekerja ---",
    "",
    padColumns("#", "Nama", "No. IC", "Amaun (RM)"),
    ...input.lines.map((line, idx) =>
      padColumns(String(idx + 1), line.employeeName, line.employeeIdentityNo, `RM ${line.amount.toFixed(2)}`),
    ),
    "",
    padColumns("", "", "JUMLAH", `RM ${input.totalAmount.toFixed(2)}`),
  ];
  downloadSimplePdf(`${input.referenceNo}-reference.pdf`, rows);
}

export function downloadSpgOfficialReceiptPdf(input: {
  receiptNo: string;
  referenceNo: string;
  employerName: string;
  employerCode: string;
  month: number;
  year: number;
  totalAmount: number;
  rowCount: number;
  issuedAt: string | null;
  lines: EmployeeLine[];
}) {
  const rows: string[] = [
    "NKS Digital Zakat",
    "Resit Rasmi SPG",
    "",
    `No. Resit: ${input.receiptNo}`,
    `No. Rujukan: ${input.referenceNo}`,
    `Majikan: ${input.employerName} (${input.employerCode})`,
    `Tempoh: ${String(input.month).padStart(2, "0")}/${input.year}`,
    `Bil. Pekerja: ${input.rowCount}`,
    `Jumlah: RM ${input.totalAmount.toFixed(2)}`,
    `Tarikh Dikeluarkan: ${input.issuedAt ? new Date(input.issuedAt).toLocaleString("ms-MY") : "-"}`,
    "",
    "--- Senarai Pekerja ---",
    "",
    padColumns("#", "Nama", "No. IC", "Amaun (RM)"),
    ...input.lines.map((line, idx) =>
      padColumns(String(idx + 1), line.employeeName, line.employeeIdentityNo, `RM ${line.amount.toFixed(2)}`),
    ),
    "",
    padColumns("", "", "JUMLAH", `RM ${input.totalAmount.toFixed(2)}`),
  ];
  downloadSimplePdf(`${input.receiptNo}.pdf`, rows);
}

function padColumns(col1: string, col2: string, col3: string, col4: string) {
  return `${col1.padEnd(4)} ${col2.padEnd(28)} ${col3.padEnd(18)} ${col4}`;
}

function escapePdfText(input: string) {
  return input.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function downloadSimplePdf(filename: string, lines: string[]) {
  // Split into pages of ~35 lines (to fit A4 with margins)
  const LINES_PER_PAGE = 35;
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += LINES_PER_PAGE) {
    pages.push(lines.slice(i, i + LINES_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]);

  const pageCount = pages.length;

  // Build PDF content streams for each page
  const streams: string[] = pages.map((pageLines) => {
    let content = "BT\n/F1 10 Tf\n";
    let y = 790;
    for (const line of pageLines) {
      content += `50 ${y} Td (${escapePdfText(line)}) Tj\n`;
      y -= 18;
    }
    content += "ET\n";
    return content;
  });

  // Object numbering:
  // 1 = Catalog, 2 = Pages, 3 = Font
  // Then for each page: page obj + stream obj
  // page obj = 4 + i*2, stream obj = 5 + i*2
  const objCount = 3 + pageCount * 2;
  const kidRefs = pages.map((_, i) => `${4 + i * 2} 0 R`).join(" ");

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  // Obj 1: Catalog
  offsets.push(pdf.length);
  pdf += "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";

  // Obj 2: Pages
  offsets.push(pdf.length);
  pdf += `2 0 obj\n<< /Type /Pages /Kids [${kidRefs}] /Count ${pageCount} >>\nendobj\n`;

  // Obj 3: Font
  offsets.push(pdf.length);
  pdf += "3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n";

  // Page + Stream objects
  for (let i = 0; i < pageCount; i++) {
    const pageObjNum = 4 + i * 2;
    const streamObjNum = 5 + i * 2;
    const streamContent = streams[i];

    // Page object
    offsets.push(pdf.length);
    pdf += `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${streamObjNum} 0 R /Resources << /Font << /F1 3 0 R >> >> >>\nendobj\n`;

    // Stream object
    offsets.push(pdf.length);
    pdf += `${streamObjNum} 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}endstream\nendobj\n`;
  }

  // Cross-reference table
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objCount + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objCount + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
