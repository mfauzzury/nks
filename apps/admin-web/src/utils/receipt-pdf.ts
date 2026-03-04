/**
 * Official receipt PDF generator for counter zakat payments.
 * Produces a proper A4 receipt with letterhead, structured layout,
 * and official receipt formatting using raw PDF 1.4 primitives.
 */

export interface ReceiptData {
  receiptNo: string;
  paidAt: string;
  amount: number;
  status: string;
  payerName: string;
  payerIc: string;
  zakatType: string;
  financialYear?: string;
  paymentChannel: string;
  collectionPoint: string;
}

function esc(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildReceiptStream(data: ReceiptData): string {
  const W = 595; // A4 width in points
  const LM = 50; // left margin
  const RM = W - 50; // right margin
  const CX = W / 2; // center x

  const cmds: string[] = [];

  // Helper: centered text
  function textCenter(text: string, y: number, font: string, size: number) {
    const approxWidth = text.length * size * 0.5;
    const x = CX - approxWidth / 2;
    cmds.push(`BT /${font} ${size} Tf ${x.toFixed(1)} ${y} Td (${esc(text)}) Tj ET`);
  }

  // Helper: left-aligned text
  function textLeft(text: string, x: number, y: number, font: string, size: number) {
    cmds.push(`BT /${font} ${size} Tf ${x} ${y} Td (${esc(text)}) Tj ET`);
  }

  // Helper: right-aligned text
  function textRight(text: string, y: number, font: string, size: number) {
    const approxWidth = text.length * size * 0.52;
    const x = RM - approxWidth;
    cmds.push(`BT /${font} ${size} Tf ${x.toFixed(1)} ${y} Td (${esc(text)}) Tj ET`);
  }

  // Helper: horizontal line
  function hline(y: number, thickness = 0.5) {
    cmds.push(`${thickness} w ${LM} ${y} m ${RM} ${y} l S`);
  }

  // Helper: filled rectangle
  function fillRect(x: number, y: number, w: number, h: number, r: number, g: number, b: number) {
    cmds.push(`${r} ${g} ${b} rg ${x} ${y} ${w} ${h} re f`);
    cmds.push("0 0 0 rg"); // reset to black
  }

  let y = 780;

  // ── LETTERHEAD ──────────────────────────────────────────

  // Blue header band
  fillRect(0, y - 5, W, 50, 0.15, 0.35, 0.7);

  // Organization name (white on blue)
  cmds.push(`1 1 1 rg`);
  textCenter("LEMBAGA ZAKAT NEGERI", y + 25, "F2", 14);
  textCenter("(Pejabat Kutipan Zakat)", y + 8, "F1", 9);
  cmds.push(`0 0 0 rg`);

  y -= 25;

  // Address line
  textCenter("Alamat Pejabat | Tel: 09-XXX XXXX | Faks: 09-XXX XXXX", y, "F1", 7);

  y -= 25;

  // Thick separator
  hline(y, 1.5);

  y -= 30;

  // ── RECEIPT TITLE ───────────────────────────────────────

  textCenter("RESIT RASMI BAYARAN ZAKAT", y, "F2", 16);
  y -= 16;
  textCenter("OFFICIAL ZAKAT PAYMENT RECEIPT", y, "F1", 9);

  y -= 30;

  // Receipt number and date row
  textLeft(`No. Resit: ${data.receiptNo}`, LM, y, "F2", 10);
  const dateStr = new Date(data.paidAt).toLocaleString("ms-MY", {
    dateStyle: "long",
    timeStyle: "short",
  });
  textRight(`Tarikh: ${dateStr}`, y, "F1", 10);

  y -= 8;
  hline(y, 0.5);

  y -= 25;

  // ── PAYER INFORMATION ───────────────────────────────────

  // Section header
  fillRect(LM, y - 3, RM - LM, 18, 0.94, 0.95, 0.97);
  textLeft("MAKLUMAT PEMBAYAR", LM + 8, y, "F2", 9);
  y -= 25;

  // Payer rows
  const labelX = LM + 10;
  const valueX = 200;
  const payerRows: [string, string][] = [
    ["Nama", data.payerName],
    ["No. IC / Passport", data.payerIc],
  ];
  for (const [label, value] of payerRows) {
    textLeft(`${label}`, labelX, y, "F1", 10);
    textLeft(`:  ${value}`, valueX, y, "F2", 10);
    y -= 18;
  }

  y -= 10;

  // ── PAYMENT DETAILS ─────────────────────────────────────

  fillRect(LM, y - 3, RM - LM, 18, 0.94, 0.95, 0.97);
  textLeft("BUTIRAN BAYARAN", LM + 8, y, "F2", 9);
  y -= 25;

  const paymentRows: [string, string][] = [
    ["Jenis Zakat", data.zakatType],
    ["Tahun Zakat", data.financialYear || "-"],
    ["Kaedah Bayaran", data.paymentChannel],
    ["Pusat Kutipan", data.collectionPoint],
    ["Status", data.status === "success" ? "Berjaya" : data.status],
  ];
  for (const [label, value] of paymentRows) {
    textLeft(`${label}`, labelX, y, "F1", 10);
    textLeft(`:  ${value}`, valueX, y, "F1", 10);
    y -= 18;
  }

  y -= 10;

  // ── AMOUNT BOX ──────────────────────────────────────────

  hline(y, 0.5);
  y -= 8;

  // Amount background
  fillRect(LM, y - 12, RM - LM, 35, 0.95, 0.98, 0.95);

  textLeft("JUMLAH BAYARAN (RM)", labelX, y, "F2", 11);
  const amountStr = `RM ${Number(data.amount).toFixed(2)}`;
  textRight(amountStr, y, "F2", 20);

  y -= 20;
  hline(y, 0.5);

  y -= 35;

  // ── FOOTER ──────────────────────────────────────────────

  textCenter("Terima kasih atas sumbangan zakat anda.", y, "F1", 10);
  y -= 14;
  textCenter("Semoga Allah memberkati harta dan kehidupan anda.", y, "F1", 9);

  y -= 30;

  // Signature area
  hline(y, 0.3);
  y -= 14;
  textCenter("Resit ini dijana secara elektronik dan sah tanpa tandatangan.", y, "F1", 7);

  y -= 25;

  // Bottom line
  cmds.push(`0.6 0.6 0.6 RG`);
  hline(y, 0.3);
  cmds.push(`0 0 0 RG`);
  y -= 12;
  cmds.push(`0.5 0.5 0.5 rg`);
  textCenter(`Dicetak pada ${new Date().toLocaleString("ms-MY")}`, y, "F1", 7);
  cmds.push(`0 0 0 rg`);

  return cmds.join("\n");
}

export function generateReceiptPdf(data: ReceiptData): Blob {
  const stream = buildReceiptStream(data);

  const objects = [
    // 1: Catalog
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    // 2: Pages
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    // 3: Page
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >> endobj",
    // 4: Font - Helvetica (regular)
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    // 5: Font - Helvetica-Bold
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj",
    // 6: Content stream
    `6 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(pdf.length);
    pdf += `${objects[i]}\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([new TextEncoder().encode(pdf)], { type: "application/pdf" });
}

export function downloadReceiptPdf(data: ReceiptData) {
  const blob = generateReceiptPdf(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${data.receiptNo}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
