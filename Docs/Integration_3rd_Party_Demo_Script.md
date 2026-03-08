# Integration 3rd Party Module — Demo Script for Tender Committee

**Project:** New Kutipan System (NKS 2.0)  
**Client:** Lembaga Zakat Selangor (LZS)  
**Module:** Integration 3rd Party  
**Duration:** 15–20 minutes  
**Audience:** Tender Committee / Jawatankuasa Tender  

---

## Pre-Demo Checklist

- [ ] Ensure API server is running (`npm run dev` in api-server)
- [ ] Ensure admin-web is running (`npm run dev` in admin-web)
- [ ] Have sample files ready: PSP CSV, JAN encrypted .txt, or Excel
- [ ] Log in as user with `integration.*` permissions
- [ ] Clear browser cache / use incognito for clean session
- [ ] Test screen sharing / projector resolution

---

## Part 1: Opening (2 min)

### Script

> *"Assalamualaikum w.b.t. dan selamat petang.*
>
> *Terima kasih kepada Jawatankuasa Tender kerana memberi peluang kami untuk mempamerkan modul **Integration 3rd Party** bagi sistem New Kutipan System (NKS 2.0) Lembaga Zakat Selangor.*
>
> *Modul ini direka untuk mengintegrasikan kutipan zakat daripada sistem luaran seperti JAN, PSP, Bank Islam, dan Maybank — dengan sokongan pemprosesan fail terenkripsi, pengesahan automatik, rekonsiliasi pintar, dan pelaporan audit yang lengkap.*
>
> *Saya akan tunjukkan aliran kerja penuh bermula daripada muat naik fail sehingga rekonsiliasi dan laporan."*

### Key Points to Emphasise

- **Enterprise-grade:** Supports high-volume files (min 1000 transactions per file)
- **Secure:** FTP/SFTP + encrypted file handling (GPG/AES)
- **Compliant:** Audit trail, PDPA, Shariah governance
- **AI-assisted:** Intelligent file parsing and reconciliation matching

---

## Part 2: Module Overview (2 min)

### Navigation

1. Go to **Integration 3rd Party** → **Overview**
2. Show the module hub with 5 sub-modules

### Script

> *"Ini ialah pusat modul Integration 3rd Party. Terdapat lima komponen utama:*
>
> 1. **File Upload** — Muat naik fail daripada sistem luaran, sama ada manual atau melalui FTP
> 2. **Batch Processing** — Pemprosesan berkelompok dengan pengesahan dan pengesanan duplikat
> 3. **Reconciliation** — Rekonsiliasi transaksi luaran dengan rekod dalaman NKS
> 4. **Exceptions** — Semakan dan kelulusan transaksi yang berpengecualian
> 5. **Reports** — Laporan pemprosesan, rekonsiliasi, dan analitik
>
> *Sumber data yang disokong termasuk JAN, BILPIZ (PSP), Bank Islam, dan Maybank — dengan kategori SPG, PSP, dan BANK."*

---

## Part 3: File Upload — Intelligent & Manual (4 min)

### Demo Steps

1. Navigate to **Integration 3rd Party** → **File Upload**
2. Show the **Intelligent Mode** toggle (AI-assisted)
3. Drag and drop a sample file (e.g. `psp-sample-100.csv` or Excel)
4. Point out:
   - AI auto-detects file structure and suggests source
   - File type inferred (CSV, Excel, Encrypted .txt)
   - Preview of parsed columns
5. Select **Source** (e.g. BILPIZ / PSP) and **File Type**
6. Click **Upload**
7. Show success message and file received

### Script

> *"Di skrin File Upload, kami menyokong dua mod:*
>
> - **Intelligent Mode** — Sistem AI menganalisis struktur fail dan mencadangkan sumber serta format secara automatik. Ini mengurangkan ralat manusia dan mempercepatkan pemprosesan.
> - **Manual Mode** — Pengguna memilih sumber dan jenis fail secara manual.
>
> *Fail yang disokong termasuk Encrypted .txt (GPG), plain .txt, CSV, dan Excel. Selepas muat naik, fail disimpan dengan hash SHA-256 untuk mengelakkan pemprosesan semula fail yang sama."*

### Highlight

- **AI File Parser** — LLM-based structure detection
- **Idempotency** — File hash prevents duplicate processing
- **Multi-format** — ENCRYPTED_TXT, TXT, CSV, EXCEL

---

## Part 4: Batch Processing (3 min)

### Demo Steps

1. Navigate to **Integration 3rd Party** → **Batch Processing**
2. Show list of uploaded files with status (PENDING, COMPLETED, FAILED)
3. Click **Process** on a PENDING file
4. Show:
   - Processing status (decrypt → validate → parse → duplicate check)
   - Records parsed count
   - Duplicates detected (if any)
5. Optionally open **View** modal to show staging rows (IC, amount, date, status)

### Script

> *"Di Batch Processing, fail yang telah dimuat naik diproses secara berkelompok. Sistem akan:*
>
> - **Decrypt** fail terenkripsi jika perlu
> - **Validate** struktur fail dan jumlah kawalan (header/trailer)
> - **Parse** setiap transaksi ke staging
> - **Detect duplicates** — sama ada dalam fail yang sama, merentas fail, atau dengan rekod dalaman
>
> *Semua langkah direkodkan dalam event log untuk audit. Transaksi yang sah disimpan di staging untuk rekonsiliasi."*

### Highlight

- **Async queue** — Scalable batch processing
- **Duplicate detection** — SAME_FILE, CROSS_FILE, INTERNAL
- **Validation** — Control totals, record-level validation

---

## Part 5: Reconciliation (4 min)

### Demo Steps

1. Navigate to **Integration 3rd Party** → **Reconciliation**
2. Show list of **Reconciliation Runs** (file-based)
3. Click **Run Reconciliation** for a file with staging data
4. Show results:
   - Matched count
   - Unmatched count
   - Variance
   - Duplicate count
5. Click **View** to open **Reconciliation Run Detail**
6. Show:
   - Matched transactions (IC, amount, date, confidence)
   - Unmatched / exception items
   - Option to approve or flag for review

### Script

> *"Rekonsiliasi memadankan transaksi luaran dengan rekod dalaman NKS. Enjin AI menggunakan:*
>
> - **Exact match** — IC + amount + date
> - **Similarity matching** — Confidence score 0–100 untuk padanan hampir
> - **Exception routing** — Transaksi yang tidak sepadan dihantar ke Human Review Queue untuk semakan penyelia
>
> *Semua keputusan AI memerlukan kelulusan manusia sebelum rekod kewangan dimuktamadkan — selaras dengan pematuhan PDPA dan Shariah governance."*

### Highlight

- **AI Reconciliation Engine** — Similarity matching
- **Confidence score** — Transparent decision support
- **Human-in-the-loop** — No auto-posting without approval

---

## Part 6: Exceptions & Reports (2 min)

### Exceptions (if time permits)

1. Navigate to **Exceptions**
2. Show list of flagged transactions
3. Demonstrate **Approve** / **Reject** / **Reprocess**

### Reports

1. Navigate to **Integration 3rd Party** → **Reports**
2. Show report types:
   - **Payer Report** — Ringkasan pembayar dan sumbangan
   - **Processing Report** — File intake, validation, batch summary
   - **Reconciliation Report** — Match status, unmatched, exceptions
   - **Trends & Analytics** — Volume trends, source breakdown
3. Generate one report (e.g. Processing Report) with date range
4. Show summary cards and tables

### Script

> *"Modul Exceptions membolehkan penyelia menyemak dan meluluskan transaksi yang berpengecualian. Modul Reports menyediakan empat jenis laporan dengan julat tarikh yang boleh disesuaikan — untuk audit, pemantauan operasi, dan analitik."*

---

## Part 7: Technical & Compliance Highlights (2 min)

### Script

> *"Dari segi teknikal:*
>
> - **Database:** Schema enterprise dengan INTEGRATION_FILE, INTEGRATION_STAGING_TX, RECONCILIATION_RESULT, dan RECONCILIATION_ACTION
> - **Audit:** Setiap langkah — RECEIVED, DECRYPTED, VALIDATED, IMPORTED, RECONCILED — direkodkan dalam INTEGRATION_FILE_EVENT
> - **Retention:** Fail dan event disimpan minimum 7 tahun mengikut keperluan audit
> - **Security:** Fail terenkripsi, hash idempotency, tiada auto-posting tanpa kelulusan
>
> *Modul ini memenuhi keperluan SRS FR-01 hingga FR-09 dan menyokong integrasi dengan JAN, PSP, Bank Islam, dan Maybank."*

---

## Part 8: Closing & Q&A (2 min)

### Script

> *"Itulah ringkasan modul Integration 3rd Party. Ringkasnya:*
>
> - Muat naik fail manual atau FTP, termasuk fail terenkripsi
> - AI membantu pengesanan struktur dan rekonsiliasi
> - Pengesanan duplikat dan pengesahan automatik
> - Rekonsiliasi dengan kelulusan manusia untuk pematuhan
> - Laporan lengkap untuk audit dan pemantauan
>
> *Saya bersedia menjawab sebarang soalan daripada Jawatankuasa Tender. Terima kasih."*

---

## Anticipated Q&A

| Soalan | Jawapan Ringkas |
|--------|-----------------|
| Adakah sokongan FTP auto-polling sudah siap? | Sokongan manual upload siap. FTP auto-polling boleh dikonfigurasi melalui INTEGRATION_CONFIG; integrasi penuh bergantung kepada spesifikasi pelayan FTP pihak bank/PSP. |
| Bagaimana fail terenkripsi didekripsi? | Menggunakan GPG atau AES-256-GCM; kunci disimpan secara selamat dalam config. |
| Adakah AI menggantikan manusia? | Tidak. AI mencadangkan padanan; semua keputusan kewangan memerlukan kelulusan penyelia. |
| Berapa lama pemprosesan 1000 transaksi? | Bergantung pada saiz fail dan beban pelayan; biasanya beberapa saat hingga beberapa minit. |
| Sokongan fail Excel? | Ya — .xlsx disokong melalui parser Excel. |

---

## Backup / Fallback

- Jika demo gagal: Sediakan tangkapan skrin atau rakaman video aliran kerja
- Jika API lambat: Gunakan data sedia ada (jangan muat naik fail baru)
- Jika soalan teknikal: Rujuk SRS (`NKS_Integration_3rd_Party_SRS.md`) dan AI Architecture (`NKS_AI_Integration_Module_Diagrams.md`)

---

*Document version: 1.0 | Last updated: March 2025*
