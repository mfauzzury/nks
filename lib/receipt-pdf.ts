export type ReceiptPdfInput = {
  receiptNo: string;
  guestName: string;
  identityNo: string;
  amount: string;
  paymentMethod: string;
  paidAt: string;
};

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function createSimplePdfBytes(lines: string[]) {
  const content = lines
    .map((line, index) => {
      const y = 800 - index * 22;
      return `BT /F1 12 Tf 50 ${y} Td (${escapePdfText(line)}) Tj ET`;
    })
    .join("\n");

  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${objects[i]}\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

export function downloadReceiptPdf(input: ReceiptPdfInput) {
  const lines = [
    "NKS - Guest Payment Receipt",
    `Receipt No: ${input.receiptNo}`,
    `Name: ${input.guestName}`,
    `IC / Passport: ${input.identityNo}`,
    `Amount: RM ${input.amount}`,
    `Payment Method: ${input.paymentMethod}`,
    `Paid At: ${new Date(input.paidAt).toLocaleString()}`,
    "",
    "Thank you for your payment.",
  ];

  const bytes = createSimplePdfBytes(lines);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${input.receiptNo}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
