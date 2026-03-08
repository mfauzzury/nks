import fs from "node:fs";
import path from "node:path";

import OpenAI from "openai";
import * as XLSX from "xlsx";

import { env } from "../config/env.js";
import { prisma } from "../prisma.js";
import { pgpDecrypt } from "../utils/crypto.js";

export interface AIFileAnalysisResult {
  fileType: "TXT" | "CSV" | "EXCEL" | "ENCRYPTED_TXT";
  suggestedSource: string | null;
  confidence: number;
  delimiter: string;
  hasHeader: boolean;
  columnMapping: Record<string, string>;
  sampleRows: Array<Record<string, string>>;
  warnings: string[];
}

const KNOWN_SOURCES = ["JAN", "BILPIZ", "BANK_ISLAM", "MAYBANK"];

function readFileSample(filePath: string, fileType: string, maxBytes = 15000): string {
  const ext = path.extname(filePath).toLowerCase();
  let buffer: Buffer;
  try {
    buffer = fs.readFileSync(filePath);
  } catch (e) {
    console.warn("[ai-file-parser] readFileSample: cannot read file", filePath, e);
    return "";
  }
  if (ext === ".xlsx" || ext === ".xls") {
    try {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0] ?? ""];
      if (!sheet) return "";
      const rows = XLSX.utils.sheet_to_csv(sheet, { FS: ",", RS: "\n" });
      return rows.split("\n").slice(0, 30).join("\n");
    } catch (e) {
      console.warn("[ai-file-parser] readFileSample: XLSX parse failed", e);
      return "";
    }
  }
  const sample = buffer.length > maxBytes ? buffer.subarray(0, maxBytes) : buffer;
  const text = sample.toString("utf-8");
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(text)) {
    return "";
  }
  // Truncate at last complete line so AI never sees a partial row
  if (buffer.length > maxBytes) {
    const lastNewline = text.lastIndexOf("\n");
    if (lastNewline > 0) {
      return text.slice(0, lastNewline);
    }
  }
  return text;
}

async function runAIAnalysis(
  sample: string,
  fileName: string,
  fileType: AIFileAnalysisResult["fileType"],
): Promise<AIFileAnalysisResult> {
  const client = new OpenAI({ apiKey: env.openaiApiKey });

  const systemPrompt = `You are an expert at analyzing transaction/ banking file formats for zakat (Islamic tax) collection systems in Malaysia.

Given a file sample (CSV, TXT, or Excel export), detect:
1. **delimiter**: The character separating columns (comma, pipe |, tab, semicolon)
2. **hasHeader**: Whether the first row contains column headers
3. **columnMapping**: Map each detected header to ONE of these standard fields:
   - payerIc: IC/MyKad number (e.g. 900101011234, NOIC, NRIC, IC)
   - payerName: Payer name (e.g. NAMA, NAME, Nama)
   - txDate: Transaction date (e.g. TARIKH, DATE, Tarikh)
   - sourceTxRef: Reference number (e.g. RUJUKAN, REF, NO RUJUKAN)
   - amount: Amount in RM (e.g. AMAUN, Jumlah, Amount)

Return ONLY valid JSON, no markdown. Format:
{
  "delimiter": ",",
  "hasHeader": true,
  "columnMapping": { "payerIc": "NOIC", "payerName": "NAMA", "txDate": "TARIKH", "sourceTxRef": "RUJUKAN", "amount": "AMAUN" },
  "suggestedSource": "BANK_ISLAM" or "JAN" or "BILPIZ" or "MAYBANK" or null,
  "confidence": 0.0 to 1.0,
  "sampleRows": [{"payerIc": "...", "payerName": "...", "amount": "..."}],
  "warnings": []
}

For columnMapping: key = standard field name, value = the exact header name from the file.
Sample rows: extract first 3-5 data rows as objects using standard field names.
suggestedSource: infer from filename format, column names, or structure if possible. Known sources: JAN, BILPIZ, BANK_ISLAM, MAYBANK.`;

  const userPrompt = `Analyze this file sample. Filename: ${fileName}\n\n---\n${sample}\n---`;

  const completion = await client.chat.completions.create({
    model: env.openaiModel,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
  });

  const content = completion.choices[0]?.message?.content?.trim() ?? "";
  if (!content) {
    throw new Error("OpenAI returned empty response");
  }

  let parsed: Partial<AIFileAnalysisResult>;
  try {
    const clean = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    parsed = JSON.parse(clean) as Partial<AIFileAnalysisResult>;
  } catch {
    throw new Error("OpenAI returned invalid JSON");
  }

  const suggestedSource = parsed.suggestedSource && KNOWN_SOURCES.includes(parsed.suggestedSource)
    ? parsed.suggestedSource
    : null;

  return {
    fileType: parsed.fileType ?? fileType,
    suggestedSource,
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
    delimiter: parsed.delimiter ?? ",",
    hasHeader: parsed.hasHeader ?? true,
    columnMapping: parsed.columnMapping ?? {},
    sampleRows: Array.isArray(parsed.sampleRows) ? parsed.sampleRows : [],
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
  };
}

export async function analyzeFileWithAI(filePath: string, fileName: string): Promise<AIFileAnalysisResult> {
  const apiKey = env.openaiApiKey;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured. AI File Parser is disabled.");
  }

  const ext = path.extname(fileName).toLowerCase();
  const baseName = path.basename(fileName, ext).toLowerCase();
  let fileType: AIFileAnalysisResult["fileType"] = "CSV";
  if (ext === ".xlsx" || ext === ".xls") fileType = "EXCEL";
  else if (ext === ".gpg" || ext === ".enc") fileType = "ENCRYPTED_TXT";
  else if (ext === ".txt") fileType = "TXT";

  // Encrypted files: try to decrypt first, then pass to AI for analysis
  if (fileType === "ENCRYPTED_TXT") {
    const buffer = fs.readFileSync(filePath);
    let pgpPassword = env.janPgpPassword;
    if (!pgpPassword) {
      const janSource = await prisma.integrationSource.findFirst({
        where: { code: "JAN", isActive: true },
      });
      if (janSource) {
        const config = await prisma.integrationConfig.findFirst({
          where: { sourceId: janSource.id, configKey: "pgp_decrypt_password" },
        });
        pgpPassword = config?.configValue ?? "";
      }
    }
    if (pgpPassword) {
      try {
        const decrypted = await pgpDecrypt(buffer, { password: pgpPassword });
        const sample = decrypted.length > 15000 ? decrypted.slice(0, 15000) : decrypted;
        const lastNewline = sample.lastIndexOf("\n");
        const truncated = lastNewline > 0 ? sample.slice(0, lastNewline) : sample;
        if (truncated.trim()) {
          // Pass decrypted content to AI analysis (reuse logic below)
          const result = await runAIAnalysis(truncated, fileName, "ENCRYPTED_TXT");
          return { ...result, fileType: "ENCRYPTED_TXT" };
        }
      } catch (e) {
        console.warn("[ai-file-parser] PGP decrypt failed for AI analysis", e);
      }
    }
    // No password or decrypt failed — return friendly guidance
    const suggestedSource = baseName.includes("jan") ? "JAN" : null;
    return {
      fileType: "ENCRYPTED_TXT",
      suggestedSource,
      confidence: 0.9,
      delimiter: ",",
      hasHeader: true,
      columnMapping: {},
      sampleRows: [],
      warnings: [
        "Could not decrypt. Set JAN_PGP_PASSWORD in .env or add pgp_decrypt_password in IntegrationConfig for JAN. Use Manual mode to upload.",
      ],
    };
  }

  const sample = readFileSample(filePath, fileType);
  if (!sample.trim()) {
    const fileExists = fs.existsSync(filePath);
    const hint = !fileExists
      ? "File was not found at upload path."
      : "File may be encrypted, corrupted, or in an unsupported format.";
    return {
      fileType,
      suggestedSource: null,
      confidence: 0,
      delimiter: ",",
      hasHeader: true,
      columnMapping: {},
      sampleRows: [],
      warnings: [`File could not be read or is empty. ${hint} Try Manual mode and select Source + File Type.`],
    };
  }

  return runAIAnalysis(sample, fileName, fileType);
}
