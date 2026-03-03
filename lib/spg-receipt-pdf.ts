export function downloadSpgReferencePdf(input: {
  referenceNo: string;
  employerName: string;
  month: number;
  year: number;
  paymentChannel: string;
  totalAmount: number;
  rowCount: number;
  status: string;
}) {
  const lines = [
    "NKS Digital Zakat",
    "SPG Reference Slip (Bukan Resit Rasmi)",
    "",
    `Reference No: ${input.referenceNo}`,
    `Employer: ${input.employerName}`,
    `Period: ${String(input.month).padStart(2, "0")}/${input.year}`,
    `Payment Channel: ${input.paymentChannel}`,
    `Status: ${input.status}`,
    `Row Count: ${input.rowCount}`,
    `Total Amount: RM ${input.totalAmount.toFixed(2)}`,
    "",
    "Pending verification by admin.",
  ];
  downloadSimplePdf(`${input.referenceNo}-reference.pdf`, lines);
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
}) {
  const lines = [
    "NKS Digital Zakat",
    "Official SPG Receipt",
    "",
    `Receipt No: ${input.receiptNo}`,
    `Reference No: ${input.referenceNo}`,
    `Employer: ${input.employerName} (${input.employerCode})`,
    `Period: ${String(input.month).padStart(2, "0")}/${input.year}`,
    `Row Count: ${input.rowCount}`,
    `Total Amount: RM ${input.totalAmount.toFixed(2)}`,
    `Issued At: ${input.issuedAt ? new Date(input.issuedAt).toLocaleString("ms-MY") : "-"}`,
  ];
  downloadSimplePdf(`${input.receiptNo}.pdf`, lines);
}

function escapePdfText(input: string) {
  return input.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function downloadSimplePdf(filename: string, lines: string[]) {
  let content = "BT\n/F1 12 Tf\n";
  let y = 790;
  for (const line of lines) {
    content += `72 ${y} Td (${escapePdfText(line)}) Tj\n`;
    y -= 20;
  }
  content += "ET\n";

  const stream = `<< /Length ${content.length} >>\nstream\n${content}endstream`;
  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
${stream}
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000120 00000 n 
0000000260 00000 n 
0000000000 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
420
%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
