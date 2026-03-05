

# Persediaan POC

# Tender New Kutipan Sistem

# Lembaga Zakat Selangor

Versi 1.0 - 2 March 2026


ISIKANDUNGAN



ISIKANDUNGAN	2

Ringkasan	5

Struktur Besar Sistem NKS Yang Perlu Anda Sediakan Dalam POC	5

POC Tips	5

Modul-Modul Yang WAJIB	6

MODUL 1 — PROFIL & DATA MANAGEMENT	6

MODUL 2 — PAYMENT PROCESSING ENGINE	7

MODUL 3 — SKIM POTONGAN GAJI (SPG)	8

MODUL 4 — 3RD PARTY INTEGRATION MODULE	9

MODUL 5 — DATA ANALYTICS & REPORTING	10

MODUL 6 — SYSTEM ADMINISTRATION	11

MODUL 7 — AUDIT TRAIL	12

MODUL 8 — SECURITY LAYER (Application Level)	13

MODUL 9 — HIGH VOLUME & PERFORMANCE STRATEGY	14

FLOW DEMO YANG PATUT ANDA TUNJUK DALAM POC	15

Architecture Yang Perlu Anda Lukis	16

Strategi Untuk Nampak Kuat Masa POC	17

Summary	18

Checklist Untuk Anda	18

Checklist preparation slide & Present	18

Checklist development module	18

Checklist demo	19

Module detail	20

Module 1 – Pengurusan Profil Pembayar	20

MODUL 2: PENGURUSAN JENIS & KATEGORI ZAKAT	73

MODUL 3 – PENGURUSAN TRANSAKSI BAYARAN	120

MODUL 4 – PAYMENT PROCESSING ENGINE	176

MODUL 5 – Batch & Bulk Processing	215

MODUL 6 – SKIM POTONGAN GAJI	256

MODUL 7 – Integrasi 3rd Party	302

MODUL 8 – Reconciliation Engine	303

MODUL 9 – Reporting & Analytics	304

MODUL 10 – Pengurusan Pengguna & Akses	305

MODUL 11 - Authentication & Security	306

MODUL 12 - Audit Trail & Logging	307

MODUL 13 – System administration	308



Ringkasan


## Struktur Besar Sistem NKS Yang Perlu Anda Sediakan Dalam POC


### Core Architecture (Wajib Tunjuk Dalam Slide + Demo)


Berdasarkan Application Requirement (page 3) , anda perlu sediakan:

Application Architecture Conceptual Diagram

UI / Front-end Solution

Processing Engine

Reporting & BI

Database Architecture

System Administration

User Access Matrix

Audit Trail

Dalam POC, jangan sekadar cerita — kena demo flow sebenar.


## POC Tips


1st item

if POC tk require offline first demo

Pls include in your POC an offline first feature.

BROWSER at local can work without backend DB.

my suggestion db is postgress, browser db is pglite.

Boke explore n compare DS other options

It will b a winning poc


2nd item

Is mobile app, useable over mobile network when lzs comm lines failed.

Can use mobile android pad concurrent with offline browsers or separately.

In the worst case scenarion of comm line failed during peak period of ramadan or december, there are 2 other alternatives to continue service online: browser using browser based db on client; mobile app


3rd item

Backend, api dh ready,

Mobile app siap dlm half or one day. using AI. android only, using React Native.

Modul-Modul Yang WAJIB

Berpandukan 3 senario utama dalam dokumen (page 7–9) :


## MODUL 1 — PROFIL & DATA MANAGEMENT


### Modul Profil Pembayar

Individu

Korporat

Majikan (SPG)

Agent / Amil

Fungsi wajib:

Create / Update profile

IC / SSM validation logic

Duplicate checking

Merge profile

Status (Active / Inactive / BlacklistSeperti dinyatakan dalam Scenario Pembayaran (page 7) :

Jenis pembayaran:

Cash

FPX

Cheque

Online payment

Scheduled payment

SPG (Skim Potongan Gaji)

Fungsi perlu ada:

Payment registration

Receipt generation

Payment status lifecycle

Pending

Verified

Failed

Reversed

Payment reconciliation






## MODUL 2 — PAYMENT PROCESSING ENGINE

Ini bahagian paling penting untuk tender.

Berdasarkan senario (page 7–9):

Fungsi utama:


### Registration & Payment Flow

Pembayar daftar

Pilih jenis zakat

Bayar

System generate resit


### Duplicate Checking Engine

Disebut dalam semua senario

POC perlu tunjuk:

Check berdasarkan:

IC

Amount

Transaction date

Source data

Flag as duplicate

Auto reject / manual review


### Bulk Processing

Disebut dalam semua senario

POC perlu tunjuk:

Upload file (SPG / Bank)

Minimum 1000 trx per file

Batch validation

Error report

Success summary


### Scheduled Payment

Recurring deduction

Auto trigger

Status monitoring





## MODUL 3 — SKIM POTONGAN GAJI (SPG)


Berdasarkan page 8

Fungsi wajib:


### Portal Majikan

Register majikan

Upload senarai pekerja

Approve potongan


### Payroll Deduction Logic

Fixed amount

Percentage

Auto monthly schedule


### SPG Reconciliation

Bandingkan dengan NKS existing data

Duplicate between source data



## MODUL 4 — 3RD PARTY INTEGRATION MODULE


Berdasarkan page 9 :

Source:

JAN

PSP

Bank Islam

Maybank

Method:

FTP

.txt encrypted

Minimum 1000 trx per file

POC perlu tunjuk:


### File Processing Engine

Upload encrypted file

Decrypt

Validate format

Validate data structure

Import

Generate processing report


### Reconciliation Engine

Compare with internal payment

Match logic

Exception report



## MODUL 5 — DATA ANALYTICS & REPORTING


Disebut dalam semua senario:

Perlu ada:


Dashboard:

Jumlah Pembayaran

Senarai Pembayar

Source Data Summary

Collection by Channel

Collection by Type

Daily vs Monthly


POC terbaik:

Real-time dashboard

Filter by date

Export Excel / PDF



## MODUL 6 — SYSTEM ADMINISTRATION


Berdasarkan Application Requirement :


### User Management

Create user

Assign role

Reset password

Lock user


### Role & Access Matrix

Executive Kaunter

Executive Processing

Admin

Majikan

Individu

Korporat


POC mesti tunjuk:

Role A tak boleh akses function B


## MODUL 7 — AUDIT TRAIL


Wajib.


Setiap:

Update profile

Payment modify

Reversal

Import file

User login

Failed login


Semua kena ada:

Timestamp

User

IP

Old value

New value



## MODUL 8 — SECURITY LAYER (Application Level)


Walaupun infra tak fokus, application level kena ada:

EntraID support (as stated in requirement)

OAuth for SMTP

Role-based access

Input validation

Encryption at rest (at least conceptual)

Data masking (IC number partially hidden)



## MODUL 9 — HIGH VOLUME & PERFORMANCE STRATEGY


Page 4 mention:

1,000 concurrent access
	Peak 500,000 trx

Dalam POC anda kena explain:

Queue processing

Async processing

Background worker

Batch processing strategy

Database indexing strategy

Idempotency key for transaction




FLOW DEMO YANG PATUT ANDA TUNJUK DALAM POC


Demo 1 — Individu bayar zakat

Create profile → bayar → receipt → dashboard update


Demo 2 — Majikan upload SPG file

Upload file → system validate → batch process → report


Demo 3 — Bank file reconciliation

Upload encrypted file → process → duplicate detect → summary


Demo 4 — Role restriction

Login sebagai:

Kaunter

Processing

Admin

Tunjuk perbezaan akses.




Architecture Yang Perlu Anda Lukis


Dalam slide POC:

Frontend (Portal Individu / Portal Majikan / Staff Portal)

API Layer

Payment Processing Engine

Batch Engine

Integration Engine

Reporting Engine

Database Layer

Audit Service



Strategi Untuk Nampak Kuat Masa POC


LZS nak:


Scalability

Governance

Data Integrity

Integration readiness

High volume capable


Tunjuk :


Configurable payment rule

Modular engine

Microservice ready design

Batch engine

Event-driven processing




Summary


## Checklist Untuk Anda

Anda perlu sediakan:

✔ Application architecture diagram

✔ Database schema high-level

✔ Modul lengkap:

Profil

Payment

SPG

3rd party integration

Reporting

Admin

Audit

✔ Demo end-to-end 3 senario

✔ Duplicate detection logic

✔ Bulk processing logic

✔ Role matrix demo

✔ Dashboard analytics


## Checklist preparation slide & Present



## Checklist development module




## Checklist demo


Demo 1 — Individu bayar zakat : Developer Zar

Create profile → bayar → receipt → dashboard update


Demo 2 — Majikan upload SPG file : Developer Masri

Upload file → system validate → batch process → report


Demo 3 — Bank file reconciliation : Developer Fauzy

Upload encrypted file → process → duplicate detect → summary


Demo 4 — Role restriction : Developer Hadeera

Login sebagai:

Kaunter

Processing

Admin

Module detail


## Module 1 – Pengurusan Profil Pembayar


### PENGENALAN

Modul Pengurusan Profil Pembayar merupakan modul fundamental dalam sistem LZS yang bertanggungjawab menguruskan keseluruhan kitaran hayat data pembayar zakat. Modul ini merangkumi pendaftaran pelbagai jenis pembayar (individu, korporat, majikan SPG), kemaskini profil, pengesanan pendua, penggabungan profil, serta pengurusan status dan blacklist.

Modul ini berperanan sebagai single source of truth untuk semua data pembayar yang akan dirujuk oleh modul-modul lain seperti Pengurusan Transaksi, Pemprosesan Pembayaran, dan Pelaporan. Integriti data yang tinggi adalah kritikal untuk memastikan ketepatan transaksi dan pelaporan.


### OBJEKTIF






### SKOP



### FUNGSI KEPERLUAN (FUNCTIONAL REQUIREMENTS)

### Pendaftaran & Pengurusan Profil



### Pengesanan & Penggabungan Pendua



### Pengurusan Status & Blacklist


### Audit & Pematuhan




### USE CASE


### Spesifikasi Use Case Terperinci

### UC01: Daftar Individu




Aliran Normal:

Pengguna memilih menu "Pendaftaran Individu"

Sistem memaparkan borang pendaftaran individu

Pengguna mengisi maklumat peribadi (No MyKad, Nama, Tarikh Lahir, dll)

Pengguna mengisi maklumat hubungan (No Telefon, Emel, Alamat)

Pengguna mengisi maklumat tambahan (Pekerjaan, Sumber Pendapatan)

Pengguna menandakan pengesahan dan klik "Simpan"

Sistem melakukan validasi:

Semua medan wajib diisi

Format No MyKad/Passport sah

Umur >= 18 tahun (jika pembayar)

No MyKad/Passport unik (tiada dalam sistem)

Sistem melakukan semakan pendua (duplicate check)

Sistem menyimpan profil dan menjana ID pembayar

Sistem memaparkan mesej kejayaan dan profil yang baru didaftar

Aliran Alternatif:

A1: Data Tidak Lengkap/Sah - Sistem memaparkan mesej error dan medan bermasalah

A2: Pendua Dikesan - Sistem memaparkan amaran profil pendua dan mencadangkan semakan

Syarat Khas:

Pengguna individu hanya boleh daftar profil sendiri

Eksekutif kaunter boleh daftar untuk orang lain


### UC02: Daftar Korporat




Aliran Normal:

Pengguna memilih menu "Pendaftaran Korporat"

Sistem memaparkan borang pendaftaran korporat

Pengguna mengisi maklumat syarikat (No SSM, Nama Syarikat, Jenis)

Pengguna mengisi maklumat wakil syarikat (Nama, No IC, Jawatan)

Pengguna mengisi maklumat hubungan dan alamat

Pengguna klik "Simpan"

Sistem melakukan validasi:

No SSM unik

No IC wakil sah dan umur >= 18

Sistem menyimpan profil syarikat dan wakil

Sistem memaparkan mesej kejayaan





### UC10: Gabung Profil


Aliran Normal:

Pengguna memilih senarai pendua dan pilih "Proses Gabung"

Sistem memaparkan perbandingan dua profil (Profil A dan Profil B)

Sistem mencadangkan profil utama berdasarkan:

Profil dengan rekod transaksi lebih banyak

Profil yang lebih aktif

Profil yang didaftar lebih awal

Pengguna memilih profil utama dan mengesahkan

Sistem mengenalpasti medan yang bercanggah (jika ada)

Pengguna memilih nilai mana yang akan dikekalkan untuk setiap medan bercanggah

Sistem memaparkan ringkasan gabungan

Pengguna mengesahkan gabungan

Sistem melaksanakan gabungan:

Mengemaskini profil utama dengan data terpilih

Memindahkan semua transaksi dari profil kedua ke profil utama

Menandakan profil kedua sebagai "MERGED" dengan rujukan ke profil utama

Merekod log gabungan

Sistem memaparkan mesej kejayaan

Aliran Alternatif:

A1: Konflik Data - Sistem memaparkan senarai medan bercanggah untuk dipilih pengguna

A2: Batal Gabung - Pengguna boleh membatalkan proses pada bila-bila masa


### MODUL DAN SUB-MODUL DETAIL


### STRUKTUR MENU

### Menu Web (Desktop)

PENGURUSAN PROFIL PEMBAYAR

│

├── 📊 DASHBOARD PROFIL

│   ├── Ringkasan Profil (Total, Aktif, Tidak Aktif)

│   ├── Pendaftaran Hari Ini (mengikut jenis)

│   ├── Profil Pendua (menunggu tindakan)

│   └── Statistik Blacklist

│

├── 📝 PENDAFTARAN

│   ├── 👤 Individu Baru

│   ├── 🏢 Korporat/Syarikat Baru

│   └── 🏭 Majikan SPG Baru

│

├── 🔍 CARIAN PROFIL

│   ├── Carian Pantas (No IC/No SSM/Nama/No Telefon)

│   ├── Carian Lanjutan

│   │   ├── Mengikut Jenis Profil

│   │   ├── Mengikut Status

│   │   ├── Mengikut Tarikh Daftar

│   │   └── Mengikut Negeri/Lokasi

│   └── Carian Disimpan

│

├── 👥 SENARAI PROFIL

│   ├── Semua Profil

│   ├── Individu

│   ├── Korporat

│   └── Majikan SPG

│

├── 🔄 PENGURUSAN PENDUA

│   ├── Senarai Pendua (Menunggu Tindakan)

│   ├── Jalankan Pengesanan Manual

│   ├── Laporan Pendua

│   └── Konfigurasi Peraturan Pendua

│

├── 🔗 PENGGABUNGAN PROFIL

│   ├── Senarai Menunggu Gabungan

│   ├── Proses Gabungan

│   └── Sejarah Gabungan

│

├── ⚠️ STATUS & BLACKLIST

│   ├── Tukar Status

│   ├── Senarai Hitam

│   ├── Tambah ke Blacklist

│   └── Sejarah Blacklist

│

├── 📋 LAPORAN

│   ├── Laporan Pendaftaran

│   ├── Laporan Status Profil

│   ├── Laporan Blacklist

│   └── Eksport Data Profil

│

└── ⚙️ PENTADBIRAN (Admin sahaja)

├── Konfigurasi Peraturan Pendua

├── Konfigurasi Medan Wajib

└── Senarai Nilai (Dropdown)


### Menu Mobile (Ringkas)

LZS Mobile

│

├── 🏠 UTAMA

│   ├── Ringkasan Profil

│   └── Tindakan Segera

│

├── 🔍 CARIAN

│   ├── Scan MyKad

│   └── Carian Manual

│

├── 📝 DAFTAR

│   ├── Individu

│   ├── Syarikat

│   └── Majikan

│

├── 📋 SENARAI

│   ├── Profil Saya (Individu)

│   ├── Pekerja Saya (Majikan)

│   └── Carian Terkini

│

└── 👤 PROFIL

├── Lihat Profil

├── Kemaskini

└── Sejarah


### REKABENTUK ANTARAMUKA WEB/MOBILE

### Halaman Pendaftaran Individu (Web - Lengkap)





































lzs_pendaftaran.html https://drive.google.com/file/d/1_aoPRPmz1w16DF0S3I0f2YmkZnROymac/view?usp=sharing

### Halaman  Paparan Profile






































https://drive.google.com/file/d/1Qptwxp8Ip4-wJxijGJVzwcQK6vbSWu_V/view?usp=sharing


### Halaman Senarai Pendua


https://drive.google.com/file/d/1d-cU6lYAq9ZgZACpM6YQ6BTck9BrV2mM/view?usp=sharing


### Specifikasi Medan dan Validasi Lengkap


*Nota: No MyKad ATAU No Passport mesti diisi


### DATABASE SCHEMA DETAIL

### Entity Relationship Diagram (ERD) - PlantUML




### Spesifikasi table lengkap


Table: PAYER_MASTER


Index:

PRIMARY KEY (payer_id)

INDEX (status)

INDEX (payer_type)

INDEX (registration_date)


Table: PAYER_INDIVIDU


*Note: Either ic_number OR passport_number must be provided

Unique Constraints:

UNIQUE (ic_number) WHERE ic_number IS NOT NULL

UNIQUE (passport_number) WHERE passport_number IS NOT NULL

Foreign Key:

FOREIGN KEY (payer_id) REFERENCES PAYER_MASTER(payer_id)

FOREIGN KEY (bank_id) REFERENCES REF_BANK(bank_id)


Table: PAYER_CORPORATE


Unique Constraints:

UNIQUE (registration_no_ssm)

Foreign Key:

FOREIGN KEY (payer_id) REFERENCES PAYER_MASTER(payer_id)


Table: PAYER_MAJIKAN (SPG)


Unique Constraints:

UNIQUE (employer_code)

Foreign Key:

FOREIGN KEY (payer_id) REFERENCES PAYER_MASTER(payer_id)


Table: CORP_REPRESENTATIVE


Foreign Key:

FOREIGN KEY (payer_id) REFERENCES PAYER_CORPORATE(payer_id)


Table: PAYER_CONTACT


Index:

INDEX (payer_id)

INDEX (contact_type)

INDEX (contact_value)

Foreign Key:

FOREIGN KEY (payer_id) REFERENCES PAYER_MASTER(payer_id)


Table: PAYER_ADDRESS


Foreign Key:

FOREIGN KEY (payer_id) REFERENCES PAYER_MASTER(payer_id)




Table: EMP_EMPLOYEE (Pekerja Majikan SPG)


Foreign Key:

FOREIGN KEY (payer_id) REFERENCES PAYER_MAJIKAN(payer_id)








Table: DUPLICATE_RULE




Table: DUPLICATE_LOG


Foreign Key:

FOREIGN KEY (payer_id_1) REFERENCES PAYER_MASTER(payer_id)

FOREIGN KEY (payer_id_2) REFERENCES PAYER_MASTER(payer_id)

FOREIGN KEY (merged_to_payer_id) REFERENCES PAYER_MASTER(payer_id)


Table: MERGE_HISTORY


Foreign Key:

FOREIGN KEY (primary_payer_id) REFERENCES PAYER_MASTER(payer_id)

FOREIGN KEY (secondary_payer_id) REFERENCES PAYER_MASTER(payer_id)


Table: STATUS_HISTORY


Foreign Key:

FOREIGN KEY (payer_id) REFERENCES PAYER_MASTER(payer_id)


Table: BLACKLIST


Foreign Key:

FOREIGN KEY (payer_id) REFERENCES PAYER_MASTER(payer_id)

FOREIGN KEY (reason_id) REFERENCES BLACKLIST_REASON(reason_id)


Table: AUDIT_LOG


Index:

INDEX (payer_id)

INDEX (changed_date)

INDEX (action_type)

INDEX (changed_by)

Foreign Key:

FOREIGN KEY (payer_id) REFERENCES PAYER_MASTER(payer_id)


Table: REF_STATE (Rujukan Negeri)








### ROLE ACCESS DETAIL

### Senarai Role dan Penerangan



### Matriks Kebenaran Terperinci


Legenda:

✓ = Boleh akses

✗ = Tiada akses

Sendiri = Hanya profil sendiri

Terhad = Terhad kepada data berkaitan (cth: majikan hanya lihat pekerja sendiri)


### Kebenaran Mengikut Tindakan



### BUSINESS RULES DETAIL

### Peraturan Pendaftaran



### Peraturan Pengesanan Pendua



### Peraturan Penggabungan Profil



### Peraturan Status & Blacklist



### Peraturan Audit & Keselamatan



### SEQUENCE DIAGRAM

### Sequence Diagram: Pendaftaran Individu

### Sequence Diagram: Penggabungan Profil


### Sequence Diagram : Pengesahan Pendua Automatik (Batch)

















### TRACEABILITY

### Traceability Matrix: Objektif → Fungsi Keperluan



### Traceability Matrix: Fungsi Keperluan → Use Case





### Traceability Matrix: Use Case → Role Access




### Traceability Matrix: Modul POC → Modul 1




### DATA DICTIONARY DETAIL

### Domain Values



### Data Dictionary Lengkap



### ACCEPTANCE CRITERIA

### Kriteria Penerimaan Fungsian



### Kriteria Penerimaan Teknikal



### Kriteria Penerimaan Antaramuka


















## MODUL 2: PENGURUSAN JENIS & KATEGORI ZAKAT

### PENGENALAN

Modul Pengurusan Jenis & Kategori Zakat merupakan komponen konfigurasi pusat yang membolehkan Lembaga Zakat Selangor (LZS) mentakrif, mengkonfigurasi, dan mengurus pelbagai jenis zakat, kadar, formula pengiraan, channel pembayaran, dan pemetaan akaun perakaunan tanpa memerlukan pengubahsuaian kod teras sistem.

Modul ini berperanan sebagai enjin peraturan perniagaan (business rules engine) untuk zakat, membolehkan fleksibiliti dalam menambah jenis zakat baharu, mengubah kadar mengikut keperluan semasa, serta menyokong pelbagai channel pembayaran. Dengan modul ini, LZS dapat bertindak balas dengan pantas terhadap perubahan dasar, fatwa baharu, atau keperluan operasi tanpa melibatkan kitaran pembangunan perisian yang panjang.

Modul ini menjadi sumber rujukan utama untuk modul-modul lain seperti Pengurusan Transaksi, Payment Processing Engine, dan Reconciliation Engine dalam menentukan cara pengiraan zakat, channel yang tersedia, dan akaun yang perlu dikreditkan.


### OBJEKTIF






### SKOP



### FUNGSI KEPERLUAN (FUNCTIONAL REQUIREMENTS)

### Pengurusan Jenis & Kategori Zakat






### Pengurusan Kadar & Formula



### Pengurusan Channel Pembayaran




### Mapping Akaun Perakaunan




### Pengurusan Versi & Audit




### USE CASE

### Use Case Diagram



### Spesifikasi Use Case Terperinci

UC01: Tambah Jenis Zakat


Aliran Normal:

Pengguna memilih menu "Pengurusan Jenis Zakat" > "Tambah Baru"

Sistem memaparkan borang tambah jenis zakat

Pengguna mengisi maklumat asas:

Kod jenis zakat (unique)

Nama jenis zakat (BM)

Nama jenis zakat (BI)

Penerangan

Kategori induk (jika ada)

Pengguna menetapkan parameter asas:

Ada nisab? (Ya/Tidak)

Ada haul? (Ya/Tidak)

Boleh potongan? (Ya/Tidak)

Perlu pengiraan kompleks? (Ya/Tidak)

Pengguna menetapkan tempoh aktif (jika berkala)

Pengguna klik "Simpan"

Sistem melakukan validasi:

Kod unik

Medan wajib diisi

Sistem menyimpan rekod dengan status 'DRAFT'

Sistem memaparkan mesej kejayaan dan membawa ke halaman konfigurasi kadar


Aliran Alternatif:

A1: Data Tidak Lengkap - Sistem papar error dan medan bermasalah

A2: Kod Duplikat - Sistem papar mesej "Kod jenis zakat telah wujud"


UC04: Konfigurasi Kadar Zakat


Aliran Normal:

Pengguna memilih jenis zakat dan klik "Konfigurasi Kadar"

Sistem memaparkan pilihan jenis kadar:

Kadar Tetap (Fixed Amount)

Kadar Peratusan (Percentage)

Kadar Berperingkat (Tiered)

Formula (Formula-based)

Pengguna memilih jenis kadar

Aliran untuk Kadar Tetap:

Pengguna masukkan amaun (RM)

Sistem simpan kadar tetap

Aliran untuk Kadar Peratusan:

Pengguna masukkan peratusan (%)

Sistem simpan kadar peratusan

Aliran untuk Kadar Berperingkat:

Pengguna tambah tier:

Tier 1: Dari RM0 - RM1000, kadar 0% atau amaun tetap

Tier 2: Dari RM1001 - RM5000, kadar 2.5%

Tier 3: Melebihi RM5000, kadar 2.5% + amaun tetap

Sistem simpan semua tier

Aliran untuk Formula:

Pengguna pilih komponen formula:

Jumlah Pendapatan

Tolak: Keperluan Asas

Tolak: Hutang

Baki x 2.5%

Sistem simpan formula dalam format yang boleh diproses

Common Steps:

Pengguna tetapkan tarikh kuat kuasa

Pengguna klik "Simpan"

Sistem melakukan validasi logik

Sistem menyimpan konfigurasi

Sistem memaparkan mesej kejayaan


UC11: Kira Zakat


Aliran Normal:

Pengguna memilih jenis zakat (contoh: Zakat Pendapatan)

Sistem memaparkan soalan/medan berdasarkan keperluan jenis zakat:

Jumlah pendapatan setahun

Pendapatan lain (jika ada)

Potongan yang dibenarkan (KWSP, PERKESO, dll)

Keperluan asas (jika berkaitan)

Pengguna memasukkan nilai yang diperlukan

Sistem mengesahkan input (format, julat)

Sistem menggunakan formula dan kadar yang telah dikonfigurasi:

Dapatkan formula dari database

Parse formula

Kira berdasarkan input

Semak nisab (jika perlu)

Semak haul (jika perlu)

Sistem memaparkan:

Amaun zakat yang perlu dibayar

Butiran pengiraan

Pilihan untuk bayar sekarang

Sistem log pengiraan untuk tujuan audit (pilihan)

Aliran Alternatif:

A1: Input Tidak Mencukupi - Sistem papar medan yang perlu diisi

A2: Tidak Mencapai Nisab - Sistem maklumkan "Tidak diwajibkan zakat"

A3: Jenis Zakat Tidak Aktif - Sistem papar mesej "Jenis zakat tidak tersedia buat masa ini"


### MODUL DAN SUB-MODUL DETAIL











### STRUKTUR MENU

### Menu Web (Desktop)

PENGURUSAN JENIS & KATEGORI ZAKAT

│

├── 📊 DASHBOARD KONFIGURASI

│   ├── Ringkasan Jenis Zakat (Aktif/Tidak Aktif)

│   ├── Kadar Semasa (Nisab, Kadar Utama)

│   ├── Channel Pembayaran (Status)

│   └── Perubahan Terkini (Log Aktiviti)

│

├── 🏷️ JENIS ZAKAT

│   ├── Senarai Jenis Zakat

│   ├── Tambah Jenis Zakat Baru

│   ├── Kategori Zakat

│   └── Tempoh Aktif (Musiman)

│

├── 💰 KADAR & FORMULA

│   ├── Kadar Zakat

│   │   ├── Kadar Tetap

│   │   ├── Kadar Peratusan

│   │   └── Kadar Berperingkat

│   ├── Formula Pengiraan

│   │   ├── Pembina Formula

│   │   ├── Uji Formula

│   │   └── Senarai Formula

│   ├── Nisab & Haul

│   │   ├── Nilai Nisab Semasa

│   │   ├── Kemaskini Nisab

│   │   └── Sejarah Nisab

│   └── Sejarah Kadar

│

├── 💳 CHANNEL PEMBAYARAN

│   ├── Senarai Channel

│   ├── Tambah Channel Baru

│   ├── Konfigurasi Channel

│   ├── Pemetaan Jenis Zakat - Channel

│   └── Waktu Operasi

│

├── 🏦 MAPPING AKAUN

│   ├── Mapping Akaun GL

│   ├── Mapping Akaun Bank

│   ├── Mapping Akaun Hasil

│   └── Struktur Carta Akaun (COA)

│

├── 📋 LAPORAN

│   ├── Laporan Konfigurasi Lengkap

│   ├── Laporan Jenis Zakat

│   ├── Laporan Kadar & Formula

│   └── Eksport Konfigurasi (Excel/PDF)

│

└── ⚙️ PENTADBIRAN

├── Pengurusan Versi

├── Rollback Konfigurasi

├── Sejarah Perubahan

└── Aliran Kerja Pengesahan



### REKABENTUK ANTARAMUKA WEB/MOBILE

### Halaman Senarai Jenis Zakat (Web)

txt

https://drive.google.com/file/d/1ddXzf-epGn6pu2bp4CDdnHp5UeRZOBfe/view?usp=sharing

html

https://drive.google.com/file/d/1Ury87If6Hb5sht3gAeRERVzvypTIZ7vA/view?usp=sharing




### Halaman Konfigurasi Kadar Berperingkat (Web)

txt

https://drive.google.com/file/d/116TaPGV8GvkgYKv_0HJ644-poyqSnxKQ/view?usp=sharing


### Halaman Pembina Formula (Web)

### Halaman Mapping Akaun GL (Web)



### Spesifikasi Medan dan Validasi



### DATABASE SCHEMA DETAIL

### Entity Relationship Diagram (ERD)




### Spesifikasi table lengkap


Table: ZAKAT_TYPE


Index:

PRIMARY KEY (type_id)

UNIQUE (type_code)

INDEX (status)

INDEX (category_id)


Table: ZAKAT_CATEGORY



Table: ZAKAT_RATE


Contoh rate_tiers (JSON):

json

[

{

"tier_no": 1,

"min_value": 0,

"max_value": 3000,

"rate_type": "PERCENTAGE",

"rate_value": 0,

"additional_amount": 0

},

{

"tier_no": 2,

"min_value": 3001,

"max_value": 5000,

"rate_type": "PERCENTAGE",

"rate_value": 2.5,

"additional_amount": 0

},

{

"tier_no": 3,

"min_value": 5001,

"max_value": 10000,

"rate_type": "PERCENTAGE",

"rate_value": 2.5,

"additional_amount": 50

}

]



Table: FORMULA


Contoh formula_components (JSON):

json

{

"variables": ["total_income", "additional_income", "deduction"],

"constants": ["nisab_value"],

"operators": ["+", "-", "*", "/"],

"functions": ["max", "min", "if"]

}








Table: NISAB



Table: PAYMENT_CHANNEL


Contoh operating_hours (JSON):

json

{

"monday": {"open": "08:00", "close": "17:00"},

"tuesday": {"open": "08:00", "close": "17:00"},

"wednesday": {"open": "08:00", "close": "17:00"},

"thursday": {"open": "08:00", "close": "17:00"},

"friday": {"open": "08:00", "close": "12:00"},

"saturday": {"open": null, "close": null},

"sunday": {"open": null, "close": null},

"public_holiday": false

}


Table: ZAKAT_CHANNEL_MAPPING






Table: GL_ACCOUNT



Table: BANK_ACCOUNT








Table: ACCOUNT_MAPPING



Table: CONFIG_VERSION



Table: CONFIG_AUDIT_LOG






### ROLE ACCESS DETAIL

### Senarai Role dan Penerangan



### Matriks Kebenaran Terperinci


*Nota: Tindakan dengan tanda * memerlukan pengesahan penyelia (R05)


### BUSINESS RULES DETAIL

### Peraturan Jenis Zakat



### Peraturan Kadar & Formula




### Peraturan Nisab & Haul



### Peraturan Channel Pembayaran






### Peraturan Mapping Akaun



### Peraturan Versi & Pengesahan




### SEQUENCE DIAGRAM

### Sequence Diagram: Konfigurasi Kadar Baru


### Sequence Diagram: Pengiraan Zakat

@startuml

actor "Pembayar" as User

participant "UI Kira Zakat" as UI

participant "Zakat Calculation Controller" as Controller

participant "Zakat Type Service" as TypeService

participant "Rate Service" as RateService

participant "Nisab Service" as NisabService

participant "Formula Engine" as FormulaEngine

participant "Database" as DB


User -> UI: Pilih jenis zakat (contoh: Zakat Pendapatan)

UI -> Controller: getZakatTypes()

Controller -> TypeService: getActiveTypes()

TypeService -> DB: SELECT FROM zakat_type WHERE status='ACTIVE'

DB --> TypeService: types

TypeService --> Controller: types

Controller --> UI: displayTypeList(types)


User -> UI: Pilih jenis zakat

UI -> Controller: getCalculationForm(typeId)

Controller -> TypeService: getTypeById(typeId)

TypeService -> DB: SELECT FROM zakat_type WHERE type_id=typeId

DB --> TypeService: type


Controller -> TypeService: getRequiredFields(typeId)

TypeService --> Controller: fields (JSON)


Controller --> UI: displayForm(fields)


User -> UI: Isi maklumat (jumlah pendapatan, potongan, dll)

User -> UI: Klik "Kira Zakat"

UI -> Controller: calculateZakat(calculationRequest)


Controller -> TypeService: getTypeDetails(typeId)

TypeService --> Controller: typeDetails


Controller -> RateService: getCurrentRate(typeId)

RateService -> DB: SELECT FROM zakat_rate WHERE type_id=typeId AND is_current=true

DB --> RateService: rate

RateService --> Controller: rate


alt rate.rate_type == 'FORMULA'

Controller -> RateService: getFormula(rate.formula_id)

RateService -> DB: SELECT FROM formula WHERE formula_id=rate.formula_id

DB --> RateService: formula

RateService --> Controller: formula


Controller -> FormulaEngine: evaluate(formula.formula_expression, input)

FormulaEngine --> Controller: result

else rate.rate_type == 'TIERED'

Controller -> RateService: calculateTiered(rate.rate_tiers, input)

RateService --> Controller: result

else rate.rate_type == 'FIXED'/'PERCENTAGE'

Controller -> RateService: calculateSimple(rate, input)

RateService --> Controller: result

end


alt typeDetails.has_nisab == true

Controller -> NisabService: getCurrentNisab()

NisabService -> DB: SELECT FROM nisab WHERE is_current=true

DB --> NisabService: nisab

NisabService --> Controller: nisab


alt result.amount < nisab.nisab_value

result.amount = 0

result.message = "Tidak mencapai nisab"

end

end


Controller --> UI: calculationResult(result)


UI --> User: Papar keputusan pengiraan

@enduml

### Sequence Diagram: Rollback konfigurasi



### TRACEABILITY

### Traceability Matrix: Objektif → Fungsi Keperluan








### Traceability Matrix: Fungsi Keperluan → Use Case



### Traceability Matrix: Use Case → Role Access





### Traceability Matrix: Modul POC → Modul 2



### DATA DICTIONARY DETAIL

### Domain Values




### Data Dictionary Lengkap



### ACCEPTANCE CRITERIA

### Kriteria Penerimaan Fungsian




### Kriteria Penerimaan Teknikal









### Kriteria Penerimaan Pengguna




## MODUL 3 – PENGURUSAN TRANSAKSI BAYARAN

### PENGENALAN

Modul Pengurusan Transaksi Pembayaran merupakan komponen teras sistem yang bertanggungjawab mengurus keseluruhan kitaran hayat transaksi pembayaran zakat, daripada pendaftaran transaksi, pemprosesan pembayaran pelbagai channel, penjanaan resit, hingga pelarasan dan pembalikan (reversal). Modul ini menjadi nadi kepada semua aktiviti kutipan zakat sama ada melalui kaunter, online, potongan gaji, atau pemprosesan pukal.

Modul ini mengendalikan pelbagai kaedah pembayaran termasuk pembayaran manual di kaunter (tunai/kad/debit), pembayaran online melalui FPX/PSP, pemprosesan cek, pembayaran berjadual, serta pengurusan pembatalan dan pelarasan transaksi. Setiap transaksi melalui proses validasi yang ketat, kawalan duplikasi (idempotency), dan pengemaskinian status secara实时.

Modul ini berintegrasi rapat dengan Modul 1 (Profil Pembayar) untuk mendapatkan maklumat pembayar, Modul 2 (Jenis & Kategori Zakat) untuk pengiraan amaun, Modul 4 (Payment Processing Engine) untuk pemprosesan teras, Modul 7 (Integrasi 3rd Party) untuk sambungan ke FPX/bank, dan Modul 8 (Reconciliation Engine) untuk padanan transaksi.


### OBJEKTIF



### SKOP









### FUNGSI KEPERLUAN (FUNCTIONAL REQUIREMENTS)

### Pengurusan Transaksi Manual (Kaunter)



### Pengurusan Transaksi Online (FPX/PSP)



### Pengurusan Cek




### Pengurusan Pembayaran Berjadual






### Penjanaan Resit




### Pelarasan & Pembalikan (Reversal/Adjustment)






### Pengurusan Status & Sejarah




### Pengurusan Laporan Transaksi





### USE CASE

### Use Case Diagram





### Spesifikasi Use Case Terperinci


UC01: Bayar di Kaunter (Tunai)


Aliran Normal:

Eksekutif kaunter memilih menu "Transaksi Baru" > "Pembayaran Tunai"

Sistem memaparkan medan untuk memilih/mencari pembayar

Eksekutif mencari pembayar menggunakan No IC/No SSM/Nama

Sistem memaparkan maklumat pembayar

Eksekutif memilih jenis zakat yang hendak dibayar

Sistem memaparkan amaun zakat (berdasarkan Modul 2) atau eksekutif boleh masukkan amaun (untuk fitrah)

Eksekutif memasukkan jumlah tunai yang diterima

Sistem mengira baki (jika ada)

Eksekutif mengesahkan transaksi

Sistem merekod transaksi dengan status 'SUCCESS'

Sistem menjana nombor resit dan mencetak resit

Sistem mengemaskini stok tunai kaunter (untuk tujuan audit)

Sistem menghantar notifikasi (jika pembayar ada emel/no telefon)

Aliran Alternatif:

A1: Pembayar Tidak Berdaftar - Eksekutif daftar pembayar baru (panggil UC01 Modul 1)

A2: Jumlah Tidak Mencukupi - Jika tunai kurang, sistem minta tambah atau ubah kaedah

A3: Bayaran Lebih - Sistem kira dan papar baki yang perlu dipulangkan

A4: Batal Transaksi - Eksekutif boleh batal sebelum pengesahan

UC03: Bayar Online (FPX)


Aliran Normal:

Pembayar memilih "Bayar Zakat" di portal LZS

Pembayar memilih jenis zakat dan memasukkan maklumat yang diperlukan

Sistem mengira amaun zakat (berdasarkan Modul 2)

Pembayar memilih kaedah pembayaran "FPX" dan memilih bank

Sistem menjana transaksi dengan status 'PENDING' dan ID transaksi unik (idempotency key)

Sistem menghantar permintaan ke FPX dengan parameter yang diperlukan

Sistem redirect pembayar ke laman FPX/bank

Pembayar mengesahkan pembayaran di laman bank (log masuk bank, TAC, dll)

FPX menghantar callback ke sistem LZS (server-to-server)

Sistem menerima callback dan mengesahkan tandatangan digital

Sistem mengemaskini status transaksi berdasarkan response:

Jika '00' (Success) -> Status 'SUCCESS'

Jika '99' (Failed) -> Status 'FAILED'

Sistem menjana resit PDF dan menghantar ke emel pembayar

Sistem memaparkan halaman keputusan kepada pembayar (redirect)

Aliran Alternatif:

A1: Pembayar Tidak Log Masuk - Sistem benarkan pembayaran tanpa log masuk, gunakan emel untuk resit

A2: Callback Gagal - Sistem ada mekanisme polling untuk semak status

A3: Transaksi Tamat Masa - Jika tiada response dalam tempoh, status 'TIMEOUT'

A4: Transaksi Gagal - Sistem papar mesej kegagalan, pembayar boleh cuba semula


UC12: Pembalikan Transaksi (Reversal)


Aliran Normal:

Eksekutif mencari transaksi yang hendak dibalikkan

Sistem memaparkan butiran transaksi

Eksekutif memilih tindakan "Reversal/Pembalikan"

Sistem memaparkan borang reversal dengan maklumat transaksi asal

Eksekutif memasukkan sebab reversal

Sistem menyemak keperluan kelulusan (bergantung pada amaun/jenis)

Jika perlu kelulusan, sistem hantar untuk approval penyelia

Penyelia log masuk dan meluluskan permintaan reversal

Sistem melaksanakan reversal:

Mengemaskini status transaksi asal kepada 'REVERSED'

Merekod transaksi reversal (negatif) dengan rujukan ke transaksi asal

Menjana dokumen reversal (jurnal)

Jika melibatkan pembayaran online, hantar permintaan reversal ke bank (jika perlu)

Sistem menghantar notifikasi kepada pembayar tentang reversal

Sistem merekod dalam audit log

Aliran Alternatif:

A1: Reversal Ditolak - Penyelia tolak, status kekal, notifikasi kepada pemohon

A2: Reversal Melibatkan Refund - Jika pembayar perlu dibayar balik, panggil UC14



### MODUL DAN SUB-MODUL DETAIL




### STRUKTUR MENU

### Menu Web (Desktop)

PENGURUSAN TRANSAKSI PEMBAYARAN

│

├── 🏠 DASHBOARD TRANSAKSI

│   ├── Ringkasan Hari Ini (Bilangan, Jumlah)

│   ├── Transaksi Terkini

│   ├── Status FPX (Real-time)

│   ├── Cek Belum Clear

│   └── Senarai Tugas (Pending Approval)

│

├── 💳 TRANSAKSI BAHARU

│   ├── 💵 Bayar Tunai

│   ├── 💳 Bayar Kad

│   ├── 🌐 Bayar Online (Jana Pautan)

│   ├── 📝 Daftar Cek

│   └── 🔄 Bayar Pelbagai Jenis

│

├── 🔍 CARIAN TRANSAKSI

│   ├── Carian Pantas (No Resit/No IC/No Rujukan)

│   ├── Carian Lanjutan

│   │   ├── Mengikut Tarikh

│   │   ├── Mengikut Status

│   │   ├── Mengikut Channel

│   │   └── Mengikut Jenis Zakat

│   └── Carian Disimpan

│

├── 📋 SENARAI TRANSAKSI

│   ├── Semua Transaksi

│   ├── Transaksi Hari Ini

│   ├── Transaksi Perlu Tindakan (Pending)

│   └── Transaksi Gagal

│

├── 📄 PENGURUSAN CEK

│   ├── Daftar Cek Baru

│   ├── Senarai Cek (Mengikut Status)

│   │   ├── Belum Clear

│   │   ├── Telah Clear

│   │   ├── Bounce

│   │   └── Batal

│   ├── Pengesahan Cek Clear

│   └── Urus Cek Bounce

│

├── 📅 PEMBAYARAN BERJADUAL

│   ├── Daftar Jadual Baru

│   ├── Senarai Jadual Aktif

│   ├── Transaksi Auto Akan Datang

│   └── Sejarah Pembayaran Berjadual

│

├── 🔄 PELARASAN & PEMBALIKAN

│   ├── Permohonan Reversal

│   ├── Permohonan Refund

│   ├── Pelarasan Amaun

│   ├── Menunggu Kelulusan (Pending Approval)

│   └── Sejarah Pelarasan

│

├── 📊 LAPORAN

│   ├── Laporan Transaksi Harian

│   ├── Laporan Kutipan Bulanan

│   ├── Laporan Mengikut Channel

│   ├── Laporan Mengikut Jenis Zakat

│   ├── Laporan Juruwang

│   └── Eksport Data

│

└── ⚙️ PENTADBIRAN (Admin sahaja)

├── Konfigurasi Caj Perkhidmatan

├── Konfigurasi Had Transaksi

├── Penyelenggaraan No Siri Resit

└── Semakan Log Transaksi

7.2 Menu Mobile (Ringkas)

text

LZS Mobile - Transaksi

│

├── 🏠 UTAMA

│   ├── Ringkasan Kutipan Hari Ini

│   └── Transaksi Terkini (5)

│

├── 💳 BAYAR

│   ├── Scan QR Pembayar

│   ├── Bayar Tunai

│   └── Jana Pautan FPX

│

├── 🔍 CARIAN

│   ├── Scan Resit

│   ├── No Rujukan

│   └── No IC/Passport

│

├── 📋 SENARAI

│   ├── Transaksi Saya (Individu)

│   ├── Cek Belum Clear

│   └── Pembayaran Akan Datang

│

└── 👤 PROFIL PEMBAYAR

├── Pilih Pembayar

└── Sejarah Transaksi



### Menu Mobile (Ringkas)

LZS Mobile - Transaksi

│

├── 🏠 UTAMA

│   ├── Ringkasan Kutipan Hari Ini

│   └── Transaksi Terkini (5)

│

├── 💳 BAYAR

│   ├── Scan QR Pembayar

│   ├── Bayar Tunai

│   └── Jana Pautan FPX

│

├── 🔍 CARIAN

│   ├── Scan Resit

│   ├── No Rujukan

│   └── No IC/Passport

│

├── 📋 SENARAI

│   ├── Transaksi Saya (Individu)

│   ├── Cek Belum Clear

│   └── Pembayaran Akan Datang

│

└── 👤 PROFIL PEMBAYAR

├── Pilih Pembayar

└── Sejarah Transaksi



### REKABENTUK ANTARAMUKA WEB/MOBILE

### Halaman Transaksi Tunai (Web)

txt

https://drive.google.com/file/d/1CwzGm4WyaCovxMs7nvTWow9s280f1PTu/view?usp=sharing


html

https://drive.google.com/file/d/13bcC7c03M5-Jt9bH3syLFrS03Jrv9Pym/view?usp=sharing




### Halaman Transaksi Online (Web - Initiasi)


html

https://drive.google.com/file/d/1Pbuts96W8qm_jm0-uEc4gRhuuPWoJOP1/view?usp=sharing

txt

https://drive.google.com/file/d/1X8AzWSm7nH8ptH5t23v5o2dNeTo_xmhC/view?usp=sharing



### Halaman Pengesahan Cek Clear (Web)


html

https://drive.google.com/file/d/1u8qR75b1oQWvrjbZUSk0ldrksJT_fU0L/view?usp=sharing

txt

https://drive.google.com/file/d/1Rhks4BLXH4IA-6ptSPFO7Tf3irRcEELF/view?usp=sharing


### Halaman Reversal/Refund (Web)



































TXT

https://drive.google.com/file/d/1vgALTvn1_O07HcoT5CPjPQgZqswigm9Q/view?usp=sharing

HTML

https://drive.google.com/file/d/1C53SY-xC0BlCY0LlAcs-5_ni6v_m-fB0/view?usp=sharing

### Halaman Resit (Format Cetak Thermal - 80mm)

txt

https://drive.google.com/file/d/1j5C_lvY6UMLoko1y1OOAilBtNZWBb6qA/view?usp=sharing


### Halaman Mobile - Semak Status Transaksi



txt 
https://drive.google.com/file/d/1yXvBrgh3qW6aP2hZObaEjvjY-UZoP6Rp/view?usp=sharing


### Spesifikasi Medan dan Validasi

*Nota: Sama ada ID Pembayar ATAU (Nama + No IC) mesti diisi untuk pembayar tidak berdaftar



### DATABASE SCHEMA DETAIL

### Entity Relationship Diagram (ERD) -



### Spesifikasi Table Lengkap

Table: TRANSACTION_MASTER


Index:

PRIMARY KEY (transaction_id)

UNIQUE (transaction_no)

UNIQUE (receipt_no) WHERE receipt_no IS NOT NULL

INDEX (payer_id)

INDEX (status)

INDEX (transaction_date)

INDEX (payer_ic)


Table: TRANSACTION_DETAIL



Table: PAYMENT_CASH



Table: PAYMENT_CARD



Table: PAYMENT_CHEQUE


Index:

UNIQUE (cheque_no) (dalam bank yang sama mungkin unik)


Table: PAYMENT_ONLINE



Table: RECEIPT






Table: SCHEDULED_PAYMENT



Table: SCHEDULED_DETAIL



Table: SCHEDULED_HISTORY



Table: REVERSAL_REQUEST



Table: REVERSAL_TRANSACTION



Table: TRANSACTION_STATUS_HISTORY



### ROLE ACCESS DETAIL

### Senarai Role dan Penerangan









### Matriks Kebenaran Terperinci




Legenda:

✓ = Boleh akses

✗ = Tiada akses

Sendiri = Hanya transaksi sendiri

Terhad = Terhad kepada data berkaitan (cth: kaunter hanya lihat transaksi kaunter sendiri)

SYS = Sistem (auto)


### BUSINESS RULES DETAIL

### Peraturan Transaksi Am



### Peraturan Pembayaran Tunai



### Peraturan Pembayaran Online (FPX)




### Peraturan Cek








### Peraturan Reversal & Refund




### Peraturan Pembayaran Berjadual



### Peraturan Audit




### SEQUENCE DIAGRAM

### Sequence Diagram: Transaksi Kaunter (Tunai)




### Sequence Diagram: Pembayaran Online (FPX)






### Sequence Diagram: Reversal Transaksi



### TRACEABILITY

### Traceability Matrix: Objektif → Fungsi Keperluan





### Traceability Matrix: Fungsi Keperluan → Use Case



### Traceability Matrix: Use Case → Role Access


### Traceability Matrix: Objektif → Fungsi Keperluan

### Traceability Matrix: Modul POC → Modul 3





### DATA DICTIONARY DETAIL

### Domain Values



### Data Dictionary Lengkap



### ACCEPTANCE CRITERIA

### Kriteria Penerimaan Fungsian





























## MODUL 4 – PAYMENT PROCESSING ENGINE

### PENGENALAN

Modul Payment Processing Engine merupakan komponen teras sistem yang bertanggungjawab memproses transaksi pembayaran secara teratur, selamat, dan efisien. Enjin ini berfungsi sebagai "jantung" pemprosesan yang memastikan setiap transaksi melalui proses validasi yang ketat, kawalan duplikasi (idempotency), pengurusan status, dan mekanisme percubaan semula (retry mechanism) bagi transaksi yang gagal.

Payment Processing Engine direka untuk mengendalikan pelbagai jenis transaksi dari pelbagai sumber - sama ada dari kaunter, portal online, pemprosesan pukal, atau integrasi pihak ketiga. Enjin ini memastikan setiap transaksi diproses dengan integriti tinggi, mengelakkan sebarang kecacatan data seperti transaksi berganda, status tidak konsisten, atau kehilangan transaksi.

Enjin ini beroperasi secara asynchronous di mana sesuai, menggunakan konsep queue dan job scheduling untuk memastikan pemprosesan yang lancar walaupun ketika trafik tinggi (peak period sehingga 500,000 transaksi). Ia juga menyediakan mekanisme audit yang lengkap untuk setiap langkah pemprosesan.

Modul ini berintegrasi rapat dengan Modul 3 (Pengurusan Transaksi) untuk menerima input transaksi, Modul 2 (Jenis Zakat) untuk pengiraan, Modul 7 (Integrasi 3rd Party) untuk sambungan ke FPX/bank, dan Modul 8 (Reconciliation) untuk padanan transaksi.


### OBJEKTIF



### SKOP










### FUNGSI KEPERLUAN (FUNCTIONAL REQUIREMENTS)

### Transaction Validation




### Idempotency Control




### Duplicate Engine



### Status Processing







### Retry Mechanism



### Queue Management





### Processing Monitoring




### Audit & Tracing







### USE CASE

### Use Case Diagram


### Spesifikasi Use Case Terperinci


UC01: Terima Transaksi


Aliran Normal:

Modul sumber menghantar data transaksi ke Payment Processing Engine (API)

Enjin menerima data transaksi dan menjana correlation ID

Enjin melakukan validasi format dan mandatori (FR-01, FR-02)

Enjin melakukan semakan idempotency (FR-06, FR-07)

Enjin melakukan semakan pendua (FR-11)

Enjin melakukan validasi rujukan (FR-03) dan logik perniagaan (FR-04)

Enjin menetapkan status awal 'PENDING'

Enjin memasukkan transaksi ke dalam queue untuk pemprosesan asynchronous

Enjin mengembalikan response kepada modul sumber dengan correlation ID dan status

Aliran Alternatif:

A1: Validasi Gagal - Enjin mengembalikan error dengan butiran kesalahan

A2: Idempotency Match - Enjin mengembalikan transaksi sedia ada (jika key sama)

A3: Pendua Dikesan - Enjin flag sebagai pendua dan teruskan (atau tolak mengikut konfigurasi)


UC06: Dequeue & Proses


Aliran Normal:

Scheduler men-trigger process untuk mengambil transaksi dari queue

Enjin mengambil (dequeue) transaksi seterusnya dari queue (mengikut prioriti)

Enjin menetapkan status 'PROCESSING' dan merekod masa mula proses

Enjin menentukan jenis pemprosesan berdasarkan channel transaksi:

Jika transaksi kaunter/cek -> proses dalaman (kemaskini status SUCCESS)

Jika transaksi online -> hantar ke FPX (panggil Modul 7)

Jika transaksi SPG/bulk -> proses dalaman

Enjin menerima response dari pemprosesan

Enjin mengemaskini status transaksi:

Jika berjaya: status 'SUCCESS'

Jika gagal: status 'FAILED' dan masukkan ke mekanisme retry

Enjin merekod sejarah perubahan status

Enjin menghantar notifikasi kepada modul sumber (callback)

Enjin meneruskan ke transaksi seterusnya dalam queue

Aliran Alternatif:

A1: Pemprosesan Gagal (Boleh Cuba Semula) - Masukkan ke retry queue

A2: Pemprosesan Gagal (Kekal) - Status 'FAILED', hantar ke dead letter queue jika had retry dicapai

A3: Queue Kosong - Tamat proses



UC08: Urus Retry


Aliran Normal:

Scheduler men-trigger retry process mengikut jadual (exponential backoff)

Enjin mengambil transaksi dari retry queue yang sudah mencapai masa untuk dicuba semula

Enjin menyemak bilangan percubaan semula (retry count)

Jika retry count < max retry (3):

Enjin increment retry count

Enjin menghantar transaksi untuk diproses semula (panggil UC06)

Jika berjaya, status 'SUCCESS', rekod dalam retry log

Jika gagal, kembalikan ke retry queue dengan masa backoff seterusnya

Jika retry count >= max retry:

Enjin memindahkan transaksi ke dead letter queue

Enjin mengemaskini status 'FAILED_PERMANENT'

Enjin menghantar notifikasi kepada operator

Aliran Alternatif:

A1: Tiada Transaksi untuk Retry - Tamat proses


### MODUL DAN SUB-MODUL DETAIL



### STRUKTUR MENU

### Menu Web (Desktop) - Untuk Pentadbir & Operator

PAYMENT PROCESSING ENGINE

│

├── 📊 DASHBOARD PEMPROSESAN

│   ├── Ringkasan Masa Nyata

│   │   ├── Throughput (transaksi/saat)

│   │   ├── Queue Length (utama, retry, DLQ)

│   │   ├── Error Rate (%)

│   │   └── Status Workers (aktif/idle)

│   ├── Graf Pemprosesan (24 jam)

│   └── Alert Terkini

│

├── 📋 QUEUE MANAGEMENT

│   ├── Main Queue

│   │   ├── Panjang: 1,234

│   │   ├── Lihat Transaksi dalam Queue

│   │   └── Kosongkan Queue (emergency)

│   ├── Retry Queue

│   │   ├── Panjang: 56

│   │   ├── Lihat Transaksi Retry

│   │   └── Proses Segera (force retry)

│   └── Dead Letter Queue

│       ├── Panjang: 12

│       ├── Lihat Transaksi DLQ

│       ├── Proses Semula

│       └── Hapus (archive)

│

├── 🔍 CARIAN TRANSAKSI

│   ├── Carian Mengikut Correlation ID

│   ├── Carian Mengikut Transaction ID

│   └── Carian Mengikut Status

│

├── ⚙️ KONFIGURASI ENJIN

│   ├── Validation Rules

│   │   ├── Senarai Peraturan

│   │   ├── Tambah Peraturan Baru

│   │   └── Uji Peraturan

│   ├── Idempotency Settings

│   │   ├── Tempoh Sah Key (TTL)

│   │   └── Storage Type (Redis/DB)

│   ├── Duplicate Detection

│   │   ├── Peraturan Pendua

│   │   ├── Tempoh Semakan

│   │   └── Threshold Skor

│   ├── Retry Settings

│   │   ├── Max Retry Count

│   │   ├── Backoff Strategy

│   │   └── Retry Schedule

│   └── Queue Settings

│       ├── Worker Count

│       ├── Batch Size

│       └── Priority Weights

│

├── 📈 MONITORING & ALERT

│   ├── Metrics Grafana

│   ├── Alert Rules

│   ├── Alert History

│   └── Health Check Status

│

└── 📋 LOGS & AUDIT

├── Processing Log

├── Audit Trail

├── Distributed Tracing

└── Log Exporter



### REKABENTUK ANTARAMUKA WEB/MOBILE

### Halaman Dashboard Pemprosesan (Web)


txt

https://drive.google.com/file/d/14MCCL4JgIM7axYxa8SwDllT2yoA_tPU0/view?usp=sharing





### Halaman Dead Letter Queue Management (Web)


txt

https://drive.google.com/file/d/1_CTgLC9NzLGV97xEebVxwRwOkjkfu-tI/view?usp=sharing



### Halaman Konfigurasi Retry (Web)

txt

https://drive.google.com/file/d/1YHTWmiOKXqbNKz8Jlf-hcrajr7or0zqd/view?usp=sharing


### DATABASE SCHEMA DETAIL

### Entity relationship Diagram (ERD)

### Spesifikasi Table Lengkap


Table: PROCESSING_QUEUE


Index:

PRIMARY KEY (queue_id)

UNIQUE (correlation_id)

INDEX (status, next_retry_date)

INDEX (queue_type, priority)


Table: IDEMPOTENCY_KEY


Index:

UNIQUE (idempotency_key)

INDEX (expiry_date)









Table: DUPLICATE_LOG


Index:

INDEX (transaction_id)

INDEX (status)



Table: PROCESSING_LOG


Index:

INDEX (correlation_id)

INDEX (transaction_id)

INDEX (created_date)


Table: RETRY_HISTORY


Index:

INDEX (transaction_id, attempt_number)


Table: DEAD_LETTER_QUEUE


Index:

INDEX (status)


Table: VALIDATION_RULE



Table: DUPLICATE_RULE













### ROLE ACCESS DETAIL

### Senarai Role dan Penerangan



### Matriks Kebenaran Terperinci



### BUSINESS RULES DETAIL

### Peraturan Validasi



### Peraturan Idempotency



### Peraturan Pengesanan Pendua




### Peraturan Retry



### Peraturan Status






### SEQUENCE DIAGRAM

### Sequence Diagram: Pemprosesan Transaksi Asynchronous

### Sequence Diagram: Retry Mechanism




### TRACEABILITY

### Traceability Matrix: Objektif → Fungsi Keperluan


### Traceability Matrix: Fungsi Keperluan → Use Case


### Traceability Matrix: Use Case → Role Access



### Traceability Matrix: Modul POC → Modul 4



### SEQUENCE DIAGRAMDATA DICTIONARY DETAIL

### Domain Values



### Data Dictionary Lengkap



### ACCEPTANCE CRITERIA

### Kriteria Penerimaan Fungsian



### Kriteria Penerimaan Prestasi



### Kriteria Penerimaan Kebolehpercayaan



## MODUL 5 – Batch & Bulk Processing

### PENGENALAN

Modul Batch & Bulk Processing merupakan komponen sistem yang bertanggungjawab mengurus pemprosesan transaksi secara pukal (bulk) melibatkan jumlah yang besar, minimum 1000 transaksi setiap fail. Modul ini membolehkan LZS menerima, memproses, dan mengurus data transaksi daripada pelbagai sumber dalam format fail (CSV, Excel, TXT) sama ada melalui muat naik manual atau integrasi FTP automatik.

Modul ini direka khas untuk mengendalikan keperluan pemprosesan volum tinggi seperti potongan gaji berjadual (SPG), pembayaran pukal dari syarikat, atau data transaksi dari institusi kewangan. Ia menyediakan mekanisme validasi fail yang komprehensif, pengesanan ralat, pengendalian separa berjaya (partial success), serta penjanaan laporan ringkasan (batch summary).

Keupayaan pemprosesan pukal ini penting untuk memastikan LZS dapat mengendalikan beban transaksi puncak sehingga 500,000 transaksi dengan cekap dan teratur, sambil mengekalkan integriti data dan memudahkan proses audit.

Modul ini berintegrasi rapat dengan Modul 3 (Transaksi) untuk merekod transaksi individu, Modul 4 (Payment Processing Engine) untuk pemprosesan, Modul 6 (SPG) untuk potongan gaji, Modul 7 (Integrasi) untuk FTP, dan Modul 12 (Audit) untuk logging.



### OBJEKTIF



### SKOP








### FUNGSI KEPERLUAN (FUNCTIONAL REQUIREMENTS)

### Pengurusan Upload Fail





### Validasi Fail



### Pengurusan Batch





### Pemprosesan Batch




### Error Reporting



### Partial Success Handling










### Batch Summary



### Pengurusan Template Fail



### Audit & Logging




### USE CASE

### Use Case Diagram



### Use Case Diagram

### Spesifikasi Use Case Terperinci


UC01: Upload Fail Manual

Aliran Normal:

Pengguna memilih menu "Batch Upload" > "Upload Fail Baru"

Sistem memaparkan borang upload dengan pilihan:

Jenis Batch (SPG, Transaksi Am, Pelarasan)

Template fail

Pilihan pemprosesan (segera / berjadual)

Pengguna memilih fail dari komputer dan klik "Upload"

Sistem menerima fail dan menjana Batch ID unik

Sistem melakukan validasi asas:

Saiz fail dalam had

Format fail sah

Sistem merekod batch dengan status 'UPLOADED'

Sistem memulakan proses validasi (UC03)

Sistem memaparkan mesej "Fail berjaya dimuat naik" dengan Batch ID

Aliran Alternatif:

A1: Saiz Fail Melebihi Had - Sistem papar error, minta fail lebih kecil

A2: Format Fail Tidak Sah - Sistem papar error, minta fail yang betul

A3: Fail Pendua - Sistem mengesan fail sama (hash), beri amaran




UC03: Validasi Fail


Aliran Normal:

Sistem trigger proses validasi selepas upload

Sistem mengemaskini status batch kepada 'VALIDATING'

Sistem membaca fail dan memproses setiap rekod:

Validasi struktur fail (header, kolom)

Validasi format data setiap medan

Validasi rujukan data (ID pembayar, kod jenis zakat)

Validasi peraturan perniagaan (amaun, tarikh)

Sistem mengira statistik validasi:

Jumlah rekod dibaca

Rekod valid

Rekod tidak valid

Sistem merekod setiap rekod yang tidak valid dalam jadual ralat

Sistem menentukan tindakan berdasarkan konfigurasi:

Jika kadar ralat <= ambang (contoh: 10%): batch boleh diproses

Jika kadar ralat > ambang: batch ditolak (status 'VALIDATION_FAILED')

Sistem mengemaskini status batch:

'READY_FOR_PROCESSING' jika layak

'VALIDATION_FAILED' jika tidak layak

Sistem menjana laporan ralat (jika ada)

Aliran Alternatif:

A1: Fail Rosak/Tidak Boleh Dibaca - Status 'CORRUPTED', notifikasi operator


UC05: Proses Batch


Aliran Normal:

Pengguna memilih batch dan klik "Proses" ATAU scheduler trigger auto-process

Sistem mengemaskini status batch kepada 'PROCESSING'

Sistem mengambil rekod valid dari batch

Untuk setiap rekod valid:

Sistem menghantar data ke Modul 3 untuk penciptaan transaksi

Modul 3 mengembalikan transaction ID atau error

Jika berjaya: rekod ditanda 'SUCCESS', transaction ID direkod

Jika gagal: rekod ditanda 'FAILED', sebab direkod

Sistem mengira statistik pemprosesan:

Jumlah diproses

Berjaya

Gagal (dengan kategori)

Selepas semua rekod diproses, sistem mengemaskini status batch:

Jika semua berjaya: 'COMPLETED'

Jika separa berjaya: 'PARTIALLY_COMPLETED' (bergantung konfigurasi)

Jika semua gagal: 'FAILED'

Sistem menjana ringkasan batch (UC08)

Sistem menjana laporan ralat (jika ada) (UC06)

Sistem merekod dalam audit log

Aliran Alternatif:

A1: Henti Separuh Jalan - Jika sistem berhenti, batch boleh disambung semula

A2: Batch Dibatalkan - Jika pengguna batal, status 'CANCELLED'


### MODUL DAN SUB-MODUL DETAIL




### STRUKTUR MENU

### Menu Web (Desktop)

BATCH & BULK PROCESSING

│

├── 📊 DASHBOARD BATCH

│   ├── Ringkasan Batch Hari Ini

│   ├── Batch Dalam Proses

│   ├── Batch Menunggu (Queued)

│   ├── Batch Gagal Perlu Tindakan

│   └── Graf Pemprosesan Batch

│

├── 📤 UPLOAD BATCH

│   ├── Upload Fail Baru

│   │   ├── Pilih Jenis Batch

│   │   ├── Pilih Template

│   │   ├── Pilih Fail

│   │   └── Pilihan Pemprosesan (Segera/Berjadual)

│   ├── Status Upload (Real-time)

│   └── Sejarah Upload Terkini

│

├── 📋 SENARAI BATCH

│   ├── Semua Batch

│   ├── Batch Aktif

│   ├── Batch Siap Diproses

│   ├── Batch Gagal

│   └── Batch Dibatalkan

│

├── 🔍 CARIAN BATCH

│   ├── Carian Mengikut Batch ID

│   ├── Carian Mengikut Tarikh

│   ├── Carian Mengikut Status

│   └── Carian Mengikut Sumber (SPG/Manual/FTP)

│

├── ⚙️ PEMPROSESAN BATCH

│   ├── Proses Batch (Manual)

│   ├── Henti Proses (Pause)

│   ├── Sambung Semula (Resume)

│   └── Batal Batch

│

├── 📄 LAPORAN RALAT

│   ├── Senarai Batch dengan Ralat

│   ├── Lihat Laporan Ralat (mengikut Batch)

│   ├── Muat Turun Laporan Ralat (Excel/CSV)

│   └── Notifikasi Ralat

│

├── 📊 RINGKASAN BATCH

│   ├── Ringkasan Batch (mengikut Batch)

│   ├── Ringkasan Kewangan

│   ├── Ringkasan Mengikut Jenis

│   └── Muat Turun Ringkasan (PDF/Excel)

│

├── 📁 TEMPLATE MANAGEMENT

│   ├── Senarai Template

│   ├── Muat Turun Template

│   ├── Tambah Template Baru

│   └── Konfigurasi Template

│

└── 📋 LAPORAN & AUDIT

├── Laporan Prestasi Batch

├── Sejarah Batch

└── Log Aktiviti Batch





### REKABENTUK ANTARAMUKA WEB/MOBILE

### Halaman Upload Fail Batch (Web)

txtt

https://drive.google.com/file/d/1dyFf28FxcRqQHZpE_ZjmfP7-v2DtfZ1n/view?usp=sharing


### Halaman Status Batch & Progress (Web)

txt

https://drive.google.com/file/d/1j3QLb-eaESEyl99-yygUC2Yv4vT2_iKo/view?usp=sharing


### Halaman Laporan Ralat (Web)

txt

https://drive.google.com/file/d/1o5o2XFrU2bglyeOy4SBuyDeV9ZsT3TFm/view?usp=sharing


### Halaman Ringkasan Batch (Web)

txt

https://drive.google.com/file/d/1j3QLb-eaESEyl99-yygUC2Yv4vT2_iKo/view?usp=sharing


### Halaman Template Management

txt

https://drive.google.com/file/d/1IzNjKDcV8krUN4tlIz9-vI2R_l84zjrr/view?usp=sharing


### Spesifikasi Medan dan Validasi




### DATABASE SCHEMA DETAIL

### Entity Relationship Diagram (ERD) -





### Spesifikasi Table Lengkap

Table: BATCH_MASTER


Index:

PRIMARY KEY (batch_id)

UNIQUE (batch_no)

INDEX (status)

INDEX (created_date)

INDEX (batch_type)


Table: BATCH_DETAIL


Index:

INDEX (batch_id)

INDEX (validation_status)

INDEX (processing_status)

UNIQUE (batch_id, line_number)


Table: BATCH_ERROR


Index:

INDEX (batch_id)

INDEX (error_category)

INDEX (resolved)


Table: BATCH_SUMMARY



Table: BATCH_LOG



Table: BATCH_TEMPLATE


Index:

UNIQUE (template_code)


Table: ERROR_CODE



### ROLE ACCESS DETAIL

### Senarai Role dan Penerangan





### Matriks Kebenaran Terperinci









### BUSINESS RULES DETAIL

### Peraturan Upload Fail



### Peraturan Validasi




### Peraturan Pemprosesan





### Peraturan Masa & Penjadualan



### Peraturan Template




### SEQUENCE DIAGRAM

### Sequence Diagram: Upload & Proses Batch Manual




### Sequence Diagram: FTP Auto Upload & Process


### TRACEABILITY

### Traceability Matrix: Objektif → Fungsi Keperluan




### Traceability Matrix: Fungsi Keperluan → Use Case




### Traceability Matrix: Use Case → Role Access



### Traceability Matrix: Modul POC → Modul 5





### DATA DICTIONARY DETAIL

### Domain Values




### Data Dictionary Lengkap




### ACCEPTANCE CRITERIA

### Kriteria Penerimaan Fungsian




### Kriteria Penerimaan Prestasi



### Kriteria Penerimaan Kebolehpercayaan







## MODUL 6 – SKIM POTONGAN GAJI

### PENGENALAN

Modul Skim Potongan Gaji (SPG) merupakan komponen sistem yang bertanggungjawab mengurus kutipan zakat melalui potongan gaji majikan. Modul ini membolehkan majikan mendaftar, memuat naik fail payroll, mengurus potongan tetap atau peratusan, dan menyelaraskan pemprosesan bulanan secara automatik. SPG adalah salah satu saluran kutipan zakat terbesar LZS, melibatkan ribuan majikan dan ratusan ribu pekerja.

Modul ini menyediakan portal khusus untuk majikan, membolehkan mereka mengurus senarai pekerja, memuat naik fail potongan bulanan, melihat sejarah pembayaran, dan menjana laporan. Di bahagian pemprosesan, modul ini mengendalikan penjadualan bulanan, pengesahan data, pemprosesan transaksi, dan penyesuaian (reconciliation) dengan bank.

Kejayaan SPG bergantung kepada ketepatan data, kebolehpercayaan pemprosesan berjadual, dan keupayaan mengendalikan volum tinggi (ribuan majikan, jutaan rekod pekerja). Modul ini memastikan potongan zakit dilaksanakan dengan lancar, mematuhi perjanjian majikan, dan menyediakan rekod lengkap untuk tujuan audit dan pelaporan.

Modul ini berintegrasi rapat dengan Modul 1 (Profil Pembayar - Majikan), Modul 3 (Transaksi), Modul 4 (Payment Processing Engine), Modul 5 (Batch Processing), Modul 7 (Integrasi Bank), dan Modul 8 (Reconciliation).


### OBJEKTIF



### SKOP



### FUNGSI KEPERLUAN (FUNCTIONAL REQUIREMENTS)

### Portal Majikan



### Pengurusan Perjanjian SPG




### Pengurusan Pekerja


### Upload Fail Payroll



### Pemprosesan Bulanan (Monthly Scheduler)



### SPG Reconciliation



### SPG Reporting







### Audit & Pematuhan




### USE CASE

### Use Case Diagram





















### Spesifikasi Use Case Terperinci


UC02: Urus Pekerja


Aliran Normal - Tambah Pekerja Baru:

Pengguna memilih menu "Pekerja" > "Tambah Pekerja Baru"

Sistem memaparkan borang tambah pekerja

Pengguna mengisi maklumat pekerja:

No Pekerja (ID syarikat)

Nama Pekerja

No IC/Passport

Tarikh Mula Potongan

Jenis Potongan (Tetap/Peratus)

Nilai Potongan (RM atau %)

Jabatan/Jawatan (opsional)

Pengguna klik "Simpan"

Sistem melakukan validasi:

No IC unik dalam senarai pekerja majikan

Format data sah

Sistem menyimpan rekod pekerja dengan status 'AKTIF'

Sistem memaparkan mesej kejayaan

Aliran Normal - Kemaskini Pekerja:

Pengguna mencari pekerja dan klik "Kemaskini"

Sistem memaparkan borang dengan data sedia ada

Pengguna mengubah maklumat yang diperlukan

Pengguna klik "Simpan"

Sistem menyimpan perubahan dan merekod dalam log audit

Aliran Normal - Tukar Status Pekerja (Berhenti):

Pengguna mencari pekerja dan klik "Tukar Status"

Sistem memaparkan pilihan status baru (BERHENTI/CUTI)

Pengguna memilih "BERHENTI" dan masukkan tarikh berhenti

Pengguna klik "Simpan"

Sistem mengemaskini status pekerja kepada 'TIDAK AKTIF' dan tarikh berkesan

Sistem memastikan pekerja ini tidak diproses untuk bulan berikutnya

Aliran Alternatif:

A1: Data Tidak Lengkap/Sah - Sistem papar error


UC04: Upload Fail Payroll


Aliran Normal:

Pengguna memilih menu "Upload Payroll" > "Fail Bulanan"

Sistem memaparkan halaman upload dengan:

Info tarikh tutup bulan ini

Pilihan template fail

Sejarah upload terdahulu

Pengguna memilih template yang sesuai dan klik "Muat Turun Template"

Pengguna mengisi data dalam template dan menyimpannya

Pengguna kembali ke halaman upload, pilih fail, dan klik "Upload"

Sistem menerima fail dan menjana ID batch (rujuk Modul 5)

Sistem melakukan validasi awal:

Format fail sah

Bilangan rekod munasabah

Struktur mengikut template

Sistem memaparkan pratinjau 5 rekod pertama

Pengguna menyemak dan klik "Sahkan & Hantar"

Sistem menghantar fail untuk validasi penuh (panggil Modul 5)

Sistem merekod tarikh upload dan status 'MENUNGGU VALIDASI'

Sistem memaparkan mesej "Fail diterima, sedang divalidasi"

Aliran Alternatif:

A1: Format Fail Salah - Sistem papar error, minta fail betul

A2: Melebihi Tarikh Tutup - Sistem maklumkan "Upload lewat, hubungi LZS"

A3: Fail Mengandungi Ralat - Selepas validasi, sistem hantar laporan ralat


UC09: Proses SPG Bulanan


Aliran Normal (Auto Scheduler):

Scheduler men-trigger proses SPG bulanan pada tarikh yang ditetapkan (contoh: 7 haribulan)

Sistem mengenalpasti semua majikan aktif dengan perjanjian SPG

Untuk setiap majikan:

Semak status fail payroll untuk bulan semasa

Jika fail telah diupload dan valid, ambil data

Jika fail belum diupload, rekod sebagai 'MISSING' dan hantar notifikasi

Untuk setiap fail yang valid:

Sistem memanggil Modul 5 untuk pemprosesan batch

Setiap rekod pekerja diproses untuk menjana transaksi (Modul 3)

Transaksi direkod dengan sumber 'SPG' dan rujukan ke majikan

Sistem mengira jumlah kutipan bagi setiap majikan

Sistem merekod ringkasan pemprosesan bulanan

Sistem menghantar notifikasi kepada majikan:

Ringkasan potongan bulan ini

Senarai pekerja yang gagal diproses (jika ada)

Sistem menjana laporan untuk pasukan LZS

Aliran Manual (Eksekutif Pemprosesan):

Eksekutif memilih menu "Pemprosesan SPG" > "Proses Bulanan"

Sistem memaparkan senarai majikan dan status fail

Eksekutif memilih majikan dan klik "Proses"

Sistem melaksanakan pemprosesan seperti aliran auto

Aliran Alternatif:

A1: Tiada Fail untuk Majikan - Sistem rekod 'MISSING', notifikasi majikan

A2: Fail Gagal Validasi - Sistem rekod, majikan perlu upload semula

A3: Sebahagian Rekod Gagal - Sistem proses rekod yang berjaya, rekod yang gagal untuk tindakan susulan


UC10: Reconciliation SPG


Aliran Normal:

Eksekutif memilih menu "Reconciliation" > "SPG Bulanan"

Sistem memaparkan senarai bulan yang perlu direconciliation

Eksekutif memilih bulan (contoh: Mac 2026)

Sistem mengambil:

Semua transaksi SPG untuk bulan tersebut (jumlah amaun)

Penyata bank untuk akaun SPG (dari Modul 7)

Sistem melakukan padanan (matching):

Padanan tepat (exact match) berdasarkan jumlah dan tarikh

Fuzzy matching untuk amaun yang hampir sama

Sistem memaparkan ringkasan:

Jumlah transaksi LZS: RM 5,234,567.89

Jumlah penyata bank: RM 5,234,000.00

Perbezaan: RM 567.89 (0.01%)

Bilangan transaksi tidak sepadan: 5

Eksekutif menyemak senarai transaksi tidak sepadan

Untuk setiap percanggahan:

Sistem mencadangkan sebab (cek belum clear, duplikasi, dll)

Eksekutif menyiasat dan mengambil tindakan (hubungi bank, semak semula)

Selepas semua percanggahan diselesaikan, eksekutif menandakan reconciliation sebagai 'SELESAI'

Sistem merekod status reconciliation dan menjana laporan

Aliran Alternatif:

A1: Percanggahan Tidak Dapat Diselesaikan - Eksekutif tandakan untuk tindakan lanjut, eskalasi ke penyelia



### MODUL DAN SUB-MODUL DETAIL














### STRUKTUR MENU

### Menu Portal Majikan (Web)

PORTAL MAJIKAN - SKIM POTONGAN GAJI (SPG)

│

├── 🏠 DASHBOARD

│   ├── Ringkasan Bulan Ini

│   ├── Status Fail Payroll

│   ├── Notifikasi & Peringatan

│   └── Aktiviti Terkini

│

├── 👥 PENGURUSAN PEKERJA

│   ├── Senarai Pekerja

│   ├── Tambah Pekerja Baru

│   ├── Import Pekerja (Excel)

│   ├── Kemaskini Pukal

│   └── Senarai Pekerja Berhenti

│

├── 📤 UPLOAD PAYROLL

│   ├── Upload Fail Bulanan

│   ├── Muat Turun Template

│   ├── Sejarah Upload

│   └── Laporan Ralat

│

├── 📊 LAPORAN

│   ├── Laporan Bulanan

│   ├── Laporan Tahunan

│   ├── Penyata Potongan

│   └── Sejarah Pembayaran

│

├── ⚙️ PENGURUSAN SYARIKAT

│   ├── Profil Syarikat

│   ├── Pengurusan Pengguna

│   ├── Dokumen Perjanjian

│   └── Tetapan Notifikasi

│

└── 📋 SEJARAH & AUDIT

├── Log Aktiviti

└── Sejarah Perubahan

7.2 Menu Pentadbiran LZS (Web)

text

PENTADBIRAN SPG - LZS

│

├── 📊 DASHBOARD SPG

│   ├── Ringkasan Kutipan (Bulan/Tahun)

│   ├── Statistik Majikan (Aktif/Baru/Berhenti)

│   ├── Status Pemprosesan Bulanan

│   └── Alert Reconciliation

│

├── 👥 PENGURUSAN MAJIKAN

│   ├── Senarai Majikan

│   ├── Daftar Majikan Baru

│   ├── Pengurusan Perjanjian

│   └── Semakan Dokumen

│

├── 📅 PEMPROSESAN BULANAN

│   ├── Status Pemprosesan

│   ├── Proses Manual (Override)

│   ├── Senarai Majikan Belum Upload

│   └── Pengurusan Gagal Proses

│

├── 🔄 RECONCILIATION

│   ├── Reconciliation Bulanan

│   ├── Senarai Percanggahan

│   ├── Resolusi Percanggahan

│   └── Sejarah Reconciliation

│

├── 📊 LAPORAN SPG

│   ├── Laporan Kutipan Bulanan

│   ├── Laporan Kutipan Tahunan

│   ├── Laporan Mengikut Sektor

│   ├── Laporan Prestasi Majikan

│   └── Eksport Data

│

├── ⚙️ KONFIGURASI

│   ├── Jadual Pemprosesan

│   ├── Parameter Potongan

│   ├── Template Fail

│   └── Peraturan Reconciliation

│

└── 📋 AUDIT & LOG

├── Log Aktiviti Majikan

├── Log Pemprosesan

└── Log Reconciliation



### REKABENTUK ANTARAMUKA WEB/MOBILE

### Halaman Dashboard Majikan (Web)

txt

https://drive.google.com/file/d/18_bpG7N9vyYUYgUe2q-RkuHEejvLZ5Pk/view?usp=sharing



### Halaman Senarai Pekerja (Web)

txt

https://drive.google.com/file/d/1LcDGcv2ZpVjbxm4jVc3WgQUzK_3e1vsG/view?usp=sharing



### Halaman Upload Payroll (Web)

txt

https://drive.google.com/file/d/11MKkNiij_3V-KgOyblqyruQITUI7ZGJZ/view?usp=sharing



### Halaman Reconciliation SPG (Web)

txt

https://drive.google.com/file/d/1vgMj50os2GQw13GRx2FXKsRQ4FoLwxPE/view?usp=sharing




### Halaman Mobile - Status Pekerja (Mobile)

txt

https://drive.google.com/file/d/1ma5vxkcXgC1ZIu3L39a0ZkcuFPJgptkk/view?usp=sharing




### Spesifikasi Medan dan Validasi






### DATABASE SCHEMA DETAIL

### Entity Relationship Diagram (ERD)







### Spesifikasi Table Lengkap


Table: SPG_EMPLOYER


Index:

PRIMARY KEY (employer_id)

UNIQUE (employer_code)

INDEX (status)


Table: SPG_AGREEMENT


Index:

UNIQUE (agreement_no)

INDEX (employer_id, status)


Table: SPG_EMPLOYEE


Index:

UNIQUE (employer_id, employee_no)

UNIQUE (ic_number) WHERE ic_number IS NOT NULL (dalam majikan sama)

INDEX (employer_id, status)


Table: SPG_PAYROLL_FILE


Index:

INDEX (employer_id, payroll_month)

UNIQUE (employer_id, payroll_month, status) untuk elak duplikat





Table: SPG_PAYROLL_DETAIL


Index:

INDEX (file_id)

INDEX (employee_id)

INDEX (processing_status)









Table: SPG_PROCESSING



Table: SPG_PROCESSING_DETAIL



Table: SPG_RECONCILIATION



Table: SPG_RECONCILIATION_DETAIL



### ROLE ACCESS DETAIL

### Senarai Role dan Penerangan



### Matriks Kebenaran Terperinci



### BUSINESS RULES DETAIL

### Peraturan Perjanjian SPG



### Peraturan Pekerja



### Peraturan Fail Payroll









### Peraturan Pemprosesan Bulanan



### Peraturan Reconciliation



### Peraturan Laporan



### SEQUENCE DIAGRAM

### Sequence Diagram: Upload & Proses Fail Payroll




### Sequence Diagram: Pemprosesan Bulanan Auto

### Sequence Diagram: Reconciliation SPG




### TRACEABILITY

### Traceability Matrix: Objektif → Fungsi Keperluan



### Traceability Matrix: Fungsi Keperluan → Use Case



### Traceability Matrix: Use Case → Role Access









### Traceability Matrix: Modul POC → Modul 6



### DATA DICTIONARY DETAIL

### Domain Values



### Data Dictionary Lengkap





### ACCEPTANCE CRITERIA

### Kriteria Penerimaan Fungsian








### Kriteria Penerimaan Prestasi




### Kriteria Penerimaan Kebolehpercayaan



### Kriteria Penerimaan Antaramuka







## MODUL 7 – Integrasi 3rd Party



## MODUL 8 – Reconciliation Engine





## MODUL 9 – Reporting & Analytics



## MODUL 10 – Pengurusan Pengguna & Akses




## MODUL 11 - Authentication & Security



## MODUL 12 - Audit Trail & Logging




## MODUL 13 – System administration


| No | Nama Modul | Sub-Module | Summary | PIC |
| --- | --- | --- | --- | --- |
| 1 | Pengurusan Profil Pembayar | Pendaftaran IndividuPendaftaran KorporatProfil Majikan (SPG)Kemaskini ProfilDuplicate DetectionMerge ProfilStatus & Blacklist | Mengurus semua maklumat pembayar termasuk validasi dan pengesanan pendua untuk memastikan integriti data. | Zar |
| 2 | Pengurusan Jenis & Kategori Zakat | Konfigurasi Jenis ZakatKadar & FormulaChannel PembayaranMapping Akaun | Menyokong konfigurasi pelbagai jenis zakat dan kadar tanpa ubah kod teras sistem. | Nabil |
| 3 | Pengurusan Transaksi Pembayaran | Manual PaymentOnline Payment (FPX/PSP)Cheque ProcessingScheduled PaymentReceipt GenerationReversal & Adjustment | Mengurus keseluruhan kitaran hayat transaksi daripada pendaftaran hingga pengesahan dan pelarasan. | _K |
| 4 | Payment Processing Engine | Transaction ValidationIdempotency ControlDuplicate EngineStatus ProcessingRetry Mechanism | Enjin pemprosesan transaksi untuk kawalan duplicate, validasi dan ketepatan status pembayaran. | Atir |
| 5 | Batch & Bulk Processing | Batch UploadFile ValidationError ReportingPartial Success HandlingBatch Summary | Mengurus pemprosesan transaksi secara pukal (min 1000 trx/file) termasuk laporan ralat. | Fauzy |
| 6 | Skim Potongan Gaji (SPG) | Portal MajikanUpload Payroll FilePotongan Tetap/PeratusMonthly SchedulerSPG ReconciliationSPG Reporting | Mengurus potongan zakat melalui majikan termasuk pengesahan dan pemprosesan berkala. | Masri |
| 7 | Integrasi 3rd Party | FTP IntegrationEncrypted File Processing (.txt)DecryptionBank IntegrationPSP IntegrationJAN Integration | Mengendalikan integrasi dengan bank dan agensi luar melalui pemindahan fail dan validasi struktur data. | Fauzy |
| 8 | Reconciliation Engine | Exact MatchingFuzzy MatchingDuplicate FlaggingException HandlingReconciliation Dashboard | Enjin padanan transaksi dalaman dan pihak ketiga untuk mengenalpasti transaksi sepadan atau tidak. | Fauzy |
| 9 | Reporting & Analytics | Dashboard Harian/BulananLaporan Mengikut ChannelLaporan Mengikut JenisSPG SummaryDuplicate ReportExport Excel/PDF | Menyediakan dashboard masa nyata dan laporan analitik untuk pemantauan kutipan. | Masri / Azy |
| 10 | Pengurusan Pengguna & Akses | User RegistrationRole ManagementPermission MatrixReset PasswordAccount Locking | Mengurus akses pengguna berdasarkan peranan seperti Admin, Kaunter, Processing, Majikan dan Individu. | Hadeera |
| 11 | Authentication & Security | EntraID IntegrationOAuth SMTPToken ValidationRBACData MaskingInput Validation | Mengawal keselamatan aplikasi termasuk pengesahan identiti dan kawalan akses berasaskan peranan. | Fauzy |
| 12 | Audit Trail & Logging | Login LogPayment LogProfile Change LogBatch LogFailed Login Monitoring | Merekod semua aktiviti pengguna dan transaksi untuk tujuan audit dan pematuhan. | Hadeera |
| 13 | System Administration | Konfigurasi SistemParameter RulesChannel SetupScheduled Job ManagementSystem Health Monitoring | Mengurus konfigurasi dan parameter sistem bagi menyokong operasi dan fleksibiliti jangka panjang. | Hadeera |


| ID Objektif | Pernyataan Objektif |
| --- | --- |
| OBJ-01 | Menyediakan mekanisme pendaftaran pembayar yang sistematik, lengkap, dan mematuhi keperluan syariah serta perundangan |
| OBJ-02 | Memastikan ketepatan dan integriti data pembayar melalui proses validasi yang ketat |
| OBJ-03 | Mengesan dan mengurus profil pendua secara automatik untuk mengelakkan pertindihan data |
| OBJ-04 | Menyediakan fungsi penggabungan profil yang selamat dengan mengekalkan sejarah transaksi |
| OBJ-05 | Membolehkan pengurusan status pembayar termasuk blacklist dan sekatan dengan mekanisme notifikasi |
| OBJ-06 | Menyokong pengurusan profil majikan dan pekerja untuk Skim Potongan Gaji (SPG) |
| OBJ-07 | Mengekalkan rekod audit lengkap bagi semua perubahan profil untuk tujuan pematuhan dan pengauditan |
| OBJ-08 | Menyediakan antara muka carian yang fleksibel dan responsif untuk pelbagai jenis pengguna |


| Perkara | Skop |
| --- | --- |
| Entiti Utama | Pembayar Individu, Pembayar Korporat, Majikan (SPG) |
| Sub-Entiti | Wakil Syarikat, Pekerja (SPG), Alamat, Hubungan |
| Proses Utama | Pendaftaran, Kemaskini, Pengesanan Pendua, Penggabungan, Pengurusan Status, Blacklist |
| Integrasi | EntraID (pengesahan), UAN (semakan), Sistem Percukaian (semakan) |
| Output | Profil pembayar, Laporan profil, Log audit, Notifikasi status |
| Had Skop | Tidak meliputi pemprosesan transaksi pembayaran (Modul 3), laporan analitik (Modul 9) |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-01 | Daftar Individu | Mendaftar profil pembayar individu dengan maklumat peribadi, dokumen pengenalan, dan maklumat hubungan | Tinggi |
| FR-02 | Daftar Korporat | Mendaftar profil syarikat/organisasi dengan maklumat pendaftaran SSM, wakil syarikat, dan dokumen sokongan | Tinggi |
| FR-03 | Daftar Majikan SPG | Mendaftar majikan untuk Skim Potongan Gaji termasuk perjanjian dan senarai pekerja | Tinggi |
| FR-04 | Kemaskini Profil | Mengemaskini maklumat pembayar dengan rekod audit dan pengesahan untuk perubahan kritikal | Tinggi |
| FR-05 | Carian Profil | Mencari profil pembayar berdasarkan pelbagai kriteria dengan fungsi penapisan | Tinggi |
| FR-06 | Papar Profil | Memaparkan maklumat lengkap profil termasuk sejarah transaksi ringkas | Sederhana |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-07 | Konfigurasi Peraturan Pendua | Membolehkan pentadbir mengkonfigurasi peraturan dan skor padanan untuk pengesanan pendua | Sederhana |
| FR-08 | Pengesanan Pendua Automatik | Menjalankan proses pengesanan pendua secara berjadual (auto) | Tinggi |
| FR-09 | Pengesanan Pendua Manual | Membolehkan pengguna menjalankan pengesanan pendua secara manual untuk profil tertentu | Sederhana |
| FR-10 | Senarai Pendua | Memaparkan senarai profil berpotensi pendua dengan skor padanan | Tinggi |
| FR-11 | Gabung Profil | Menggabungkan dua atau lebih profil pendua dengan memilih data utama | Tinggi |
| FR-12 | Resolusi Konflik | Mengurus konflik data semasa penggabungan (medan bercanggah) | Tinggi |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-13 | Tukar Status | Menukar status pembayar (Aktif/Tidak Aktif/Gantung) | Tinggi |
| FR-14 | Blacklist | Menambah/mengeluarkan pembayar dari senarai hitam | Tinggi |
| FR-15 | Sekatan Profil | Menetapkan sekatan ke atas profil (cth: tidak boleh transaksi) | Sederhana |
| FR-16 | Notifikasi Status | Menghantar notifikasi kepada pembayar apabila status berubah | Sederhana |
| FR-17 | Sejarah Status | Memaparkan sejarah perubahan status dan blacklist | Rendah |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-18 | Log Audit | Merekod semua perubahan profil (siapa, bila, apa, nilai lama/baru) | Tinggi |
| FR-19 | Sejarah Profil | Memaparkan sejarah perubahan profil untuk tujuan audit | Sederhana |
| FR-20 | Laporan Profil | Menjana laporan berkaitan profil (pendaftaran baru, status, blacklist) | Sederhana |


| Item | Detail |
| --- | --- |
| ID | UC01 |
| Nama Use Case | Daftar Individu |
| Aktor Utama | Pembayar Individu, Eksekutif Kaunter |
| Aktor Sekunder | Sistem (validasi, semakan pendua) |
| Penerangan | Mendaftarkan profil pembayar individu baharu ke dalam sistem |
| Pre-condition | Pengguna telah log masuk; pembayar belum wujud dalam sistem |
| Post-condition | Profil individu baharu berjaya didaftarkan dengan status 'Aktif' |
| Trigger | Pengguna memilih menu "Pendaftaran Individu" |


| Item | Detail |
| --- | --- |
| ID | UC02 |
| Nama Use Case | Daftar Korporat |
| Aktor Utama | Wakil Korporat, Eksekutif Kaunter |
| Aktor Sekunder | Sistem |
| Penerangan | Mendaftarkan profil syarikat/organisasi baharu |
| Pre-condition | Pengguna telah log masuk; syarikat belum wujud dalam sistem |
| Post-condition | Profil korporat baharu berjaya didaftarkan |


| Item | Detail |
| --- | --- |
| ID | UC10 |
| Nama Use Case | Gabung Profil |
| Aktor Utama | Eksekutif Pemprosesan, Penyelia |
| Aktor Sekunder | Sistem |
| Penerangan | Menggabungkan dua atau lebih profil pendua menjadi satu profil utama |
| Pre-condition | Profil pendua telah dikenalpasti; pengguna mempunyai kebenaran gabung |
| Post-condition | Profil digabung; profil kedua ditandakan sebagai "merged" dan diarah ke profil utama |


| Kod Modul | Sub-Modul | Penerangan | Fungsi Utama |
| --- | --- | --- | --- |
| PM-01 | Pendaftaran Individu | Pengurusan pendaftaran pembayar individu |  |
| PM-01-01 | Daftar Individu Baru | Mendaftar profil individu baharu | Borang pendaftaran, validasi data |
| PM-01-02 | Pengesahan Identiti | Validasi dokumen pengenalan | Semakan format, semakan dengan UAN |
| PM-01-03 | Maklumat Peribadi | Pengurusan data peribadi | Nama, IC, tarikh lahir, jantina, status perkahwinan |
| PM-01-04 | Maklumat Hubungan | Pengurusan contact details | No telefon, emel, alamat |
| PM-01-05 | Maklumat Pekerjaan | Pengurusan data pekerjaan | Pekerjaan, majikan, pendapatan |
|  |  |  |  |
| PM-02 | Pendaftaran Korporat | Pengurusan pendaftaran pembayar korporat |  |
| PM-02-01 | Daftar Syarikat Baru | Mendaftar profil syarikat baharu | Borang pendaftaran syarikat |
| PM-02-02 | Dokumen Korporat | Pengurusan dokumen syarikat | SSM, surat ikatan, dokumen lain |
| PM-02-03 | Pengurusan Wakil | Pengurusan wakil syarikat | Daftar/kemaskini wakil, dokumen kebenaran |
| PM-02-04 | Profil Cawangan | Pengurusan cawangan | Daftar cawangan, alamat cawangan |
| PM-02-05 | Pemegang Saham | Maklumat pemegang saham utama | Nama, pegangan saham |
|  |  |  |  |
| PM-03 | Profil Majikan (SPG) | Pengurusan majikan untuk Skim Potongan Gaji |  |
| PM-03-01 | Daftar Majikan | Mendaftar majikan baharu | Borang pendaftaran majikan |
| PM-03-02 | Perjanjian SPG | Pengurusan dokumen perjanjian | No perjanjian, tarikh kuat kuasa, tarikh luput |
| PM-03-03 | Senarai Pekerja | Pengurusan senarai pekerja | Import payroll, daftar pekerja, kemaskini |
| PM-03-04 | Potongan Majikan | Pengurusan kadar potongan | Potongan tetap/peratus, had potongan |
| PM-03-05 | Cukai Majikan | Maklumat cukai majikan | No cukai, cawangan cukai |
|  |  |  |  |
| PM-04 | Kemaskini Profil | Pengurusan kemaskini maklumat profil |  |
| PM-04-01 | Kemaskini Maklumat Asas | Mengemaskini data asas | Nama, status perkahwinan, pekerjaan |
| PM-04-02 | Tukar Alamat | Pengurusan pertukaran alamat | Alamat baru, tempoh sah |
| PM-04-03 | Tukar No Telefon/Emel | Pertukaran contact details | No baru, emel baru, pengesahan OTP |
| PM-04-04 | Tukar Wakil Syarikat | Pertukaran wakil sah | Wakil baru, dokumen sokongan |
| PM-04-05 | Pengesahan Perubahan | Proses pengesahan untuk perubahan kritikal | Semakan penyelia, workflow approval |
|  |  |  |  |
| PM-05 | Duplicate Detection | Pengesanan dan pengurusan profil pendua |  |
| PM-05-01 | Peraturan Pendua | Konfigurasi peraturan pengesanan pendua | Tetapan medan, skor padanan, weightage |
| PM-05-02 | Enjin Pengesanan | Proses pengesanan pendua | Algoritma padanan, fuzzy matching |
| PM-05-03 | Pengesanan Berjadual | Proses auto/carian pendua berjadual | Batch process, notification |
| PM-05-04 | Pengesanan Manual | Carian pendua untuk profil tertentu | On-demand checking |
| PM-05-05 | Senarai Pendua | Paparan senarai profil berpotensi pendua | Filter, sort, skor padanan |
| PM-05-06 | Laporan Pendua | Laporan analisis pendua | Statistik, trend, resolusi |
|  |  |  |  |
| PM-06 | Merge Profil | Penggabungan profil pendua |  |
| PM-06-01 | Pemilihan Profil Utama | Memilih profil sebagai data utama | Auto suggest, manual select |
| PM-06-02 | Perbandingan Profil | Paparan perbandingan side-by-side | Medan A vs B |
| PM-06-03 | Resolusi Konflik | Pengurusan konflik data semasa gabung | Pilih nilai, gabung nilai |
| PM-06-04 | Gabungan Transaksi | Penggabungan rekod transaksi | Pindah semua transaksi ke profil utama |
| PM-06-05 | Pengesahan Gabungan | Semak sebelum gabung | Ringkasan, pengesahan penyelia |
| PM-06-06 | Sejarah Gabungan | Rekod sejarah profil sebelum/selepas gabung | Log gabungan, rollback capability |
|  |  |  |  |
| PM-07 | Status & Blacklist | Pengurusan status dan senarai hitam |  |
| PM-07-01 | Tukar Status | Menukar status pembayar | Aktif/Tidak Aktif/Gantung |
| PM-07-02 | Blacklist | Pengurusan senarai hitam | Tambah/keluar, sebab, tempoh |
| PM-07-03 | Sekatan Profil | Menetapkan sekatan ke atas profil | Sekatan transaksi, sekatan kemaskini |
| PM-07-04 | Notifikasi Status | Pemberitahuan perubahan status | Emel/SMS, template notifikasi |
| PM-07-05 | Sejarah Status | Rekod perubahan status | Log audit, paparan kronologi |
|  |  |  |  |
| PM-08 | Audit & Laporan | Pengurusan audit dan pelaporan profil |  |
| PM-08-01 | Log Audit | Rekod semua perubahan profil | Siapa, bila, apa, nilai lama/baru |
| PM-08-02 | Sejarah Profil | Paparan sejarah perubahan | Timeline view, filter |
| PM-08-03 | Laporan Pendaftaran | Laporan pendaftaran baru | Harian/bulanan, mengikut jenis |
| PM-08-04 | Laporan Blacklist | Laporan senarai hitam | Aktif, sejarah, sebab |
| PM-08-05 | Eksport Data | Eksport data profil | Excel/PDF/CSV |


| Modul | Medan | Jenis Data | Panjang | Wajib | Validasi/Rules |
| --- | --- | --- | --- | --- | --- |
| Pendaftaran Individu |  |  |  |  |  |
|  | Jenis Pengenalan | Radio | - | Ya | MyKad default, pilihan: MyKad/Passport/Lain |
|  | No MyKad | Text | 14 | Ya* | Format: 6 digit - 2 digit - 4 digit; numeric; uniqueness |
|  | No Passport | Text | 20 | Ya* | Alfanumerik; uniqueness jika ada |
|  | No IC Lama | Text | 12 | Tidak | 12 digit numeric |
|  | Nama Penuh | Text | 150 | Ya | Huruf sahaja (A-Z, a-z, space, -); min 3 aksara |
|  | Nama Arab | Text | 150 | Tidak | Tulisan Arab dibenarkan |
|  | Warganegara | Radio | - | Ya | Default "Warganegara" |
|  | Status Perkahwinan | Dropdown | - | Ya | Pilihan: Belum Berkahwin/Berkahwin/Duda/Janda |
|  | Jantina | Radio | - | Ya | Lelaki/Perempuan |
|  | Tarikh Lahir | Date | - | Ya | Format DD/MM/YYYY; Umur >= 18 tahun |
|  | Tempat Lahir | Text | 100 | Tidak | - |
|  | Bangsa | Dropdown | - | Ya | Pilihan dari master data |
|  | Agama | Dropdown | - | Ya | Pilihan dari master data |
|  | No Telefon Bimbit | Text | 15 | Ya | Format: 012-3456789; mesti nombor Malaysia |
|  | No Telefon Rumah | Text | 15 | Tidak | Format: 03-12345678 |
|  | Emel | Email | 100 | Ya | Format emel sah; uniqueness |
|  | Alamat 1 | Text | 150 | Ya | Min 10 aksara |
|  | Alamat 2 | Text | 150 | Tidak | - |
|  | Alamat 3 | Text | 150 | Tidak | - |
|  | Bandar | Text | 50 | Ya | - |
|  | Poskod | Text | 5 | Ya | 5 digit numeric |
|  | Negeri | Dropdown | - | Ya | Pilihan dari master data |
|  | Negara | Text | 50 | Ya | Default "Malaysia" |
|  | Pekerjaan | Dropdown | - | Ya | Pilihan dari master data |
|  | Nama Majikan | Text | 150 | Tidak | - |
|  | Sumber Pendapatan | Dropdown | - | Ya | Pilihan dari master data |
|  | Anggaran Pendapatan | Radio | - | Tidak | Pilihan julat pendapatan |
|  | Status Zakat | Dropdown | - | Tidak | Belum/Pernah |
|  | No Akaun Bank | Text | 20 | Tidak | Numeric |
|  | Nama Bank | Dropdown | - | Tidak | Pilihan dari master data |
|  | Pengesahan | Checkbox | - | Ya | Mesti ditanda |
|  | Kebenaran Data | Checkbox | - | Ya | Mesti ditanda |
|  |  |  |  |  |  |
| Pendaftaran Korporat |  |  |  |  |  |
|  | No Pendaftaran SSM | Text | 15 | Ya | Format: YYYYNNNNNN (tahun + 6 digit); uniqueness |
|  | Nama Syarikat | Text | 200 | Ya | - |
|  | Nama Syarikat Arab | Text | 200 | Tidak | - |
|  | Jenis Syarikat | Dropdown | - | Ya | Sdn Bhd/Bhd/Enterprise/... |
|  | Tarikh Daftar SSM | Date | - | Tidak | - |
|  | Bidang Perniagaan | Text | 100 | Tidak | - |
|  | No Cukai/GST | Text | 20 | Tidak | - |
|  | Nama Wakil | Text | 150 | Ya | Nama penuh wakil |
|  | No IC Wakil | Text | 14 | Ya | 12/14 digit; validasi umur >= 18 |
|  | Jawatan Wakil | Text | 100 | Ya | - |
|  | No Telefon Wakil | Text | 15 | Ya | Format Malaysia |
|  | Emel Wakil | Email | 100 | Ya | Format emel sah |
|  | Alamat Syarikat | Text | 150 | Ya | Min 10 aksara |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| payer_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| payer_type | VARCHAR | 20 | NO | - | INDV'/'CORP'/'MAJIKAN' |
| registration_no | VARCHAR | 50 | YES | - | No rujukan pendaftaran |
| registration_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh pendaftaran |
| status | VARCHAR | 20 | NO | ACTIVE' | ACTIVE'/'INACTIVE'/'BLACKLIST'/'SUSPENDED'/'MERGED' |
| status_reason | TEXT | - | YES | - | Sebab status terkini |
| is_blacklisted | BOOLEAN | - | NO | 0 | Status blacklist |
| blacklist_date | DATE | - | YES | - | Tarikh blacklist |
| blacklist_reason | TEXT | - | YES | - | Sebab blacklist |
| merged_to_payer_id | UUID | - | YES | - | Rujukan jika status 'MERGED' |
| merge_date | TIMESTAMP | - | YES | - | Tarikh digabung |
| risk_category | VARCHAR | 20 | YES | LOW' | Kategori risiko |
| remarks | TEXT | - | YES | - | Catatan am |
| created_by | VARCHAR | 50 | NO | - | User ID pencipta |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh masa cipta |
| modified_by | VARCHAR | 50 | YES | - | User ID pengemaskini |
| modified_date | TIMESTAMP | - | YES | - | Tarikh masa kemaskini |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| payer_id | UUID | - | NO | - | Foreign Key to PAYER_MASTER |
| ic_number | VARCHAR | 14 | YES* | - | No MyKad (unique) |
| passport_number | VARCHAR | 20 | YES* | - | No Passport (unique) |
| old_ic_number | VARCHAR | 12 | YES | - | No IC lama |
| full_name | VARCHAR | 150 | NO | - | Nama penuh |
| full_name_arabic | VARCHAR | 150 | YES | - | Nama dalam arab |
| citizenship | VARCHAR | 50 | NO | WARGANEGARA' | Warganegara |
| marital_status | VARCHAR | 20 | NO | - | Status perkahwinan |
| gender | CHAR | 1 | NO | - | L' / 'P' |
| birth_date | DATE | - | NO | - | Tarikh lahir |
| birth_place | VARCHAR | 100 | YES | - | Tempat lahir |
| age | INTEGER | - | YES | - | Umur (auto kira) |
| race | VARCHAR | 50 | YES | - | Bangsa |
| religion | VARCHAR | 50 | YES | - | Agama |
| occupation | VARCHAR | 100 | YES | - | Pekerjaan |
| employer_name | VARCHAR | 150 | YES | - | Nama majikan |
| income_source | VARCHAR | 50 | YES | - | Sumber pendapatan |
| income_range | VARCHAR | 20 | YES | - | Julat pendapatan |
| zakat_status | VARCHAR | 20 | YES | BELUM' | Status zakat |
| last_zakat_date | DATE | - | YES | - | Tarikh akhir zakat |
| bank_account_no | VARCHAR | 30 | YES | - | No akaun bank |
| bank_id | UUID | - | YES | - | Foreign Key to REF_BANK |
| death_date | DATE | - | YES | - | Tarikh mati |
| death_cert_no | VARCHAR | 30 | YES | - | No sijil mati |
| is_verified | BOOLEAN | - | NO | 0 | Status pengesahan |
| verified_date | DATE | - | YES | - | Tarikh sah |
| verified_by | VARCHAR | 50 | YES | - | Disahkan oleh |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| payer_id | UUID | - | NO | - | Foreign Key to PAYER_MASTER |
| registration_no_ssm | VARCHAR | 20 | NO | - | No pendaftaran SSM (unique) |
| registration_date_ssm | DATE | - | YES | - | Tarikh daftar SSM |
| company_name | VARCHAR | 200 | NO | - | Nama syarikat |
| company_name_arabic | VARCHAR | 200 | YES | - | Nama syarikat (arab) |
| company_type | VARCHAR | 50 | NO | - | Jenis syarikat |
| business_nature | VARCHAR | 100 | YES | - | Bidang perniagaan |
| business_category | VARCHAR | 50 | YES | - | Kategori perniagaan |
| tax_number | VARCHAR | 20 | YES | - | No cukai/GST |
| tax_branch | VARCHAR | 50 | YES | - | Cawangan cukai |
| established_year | INTEGER | 4 | YES | - | Tahun ditubuhkan |
| paid_up_capital | DECIMAL | 15,2 | YES | - | Modal berbayar |
| no_of_employees | INTEGER | - | YES | - | Bilangan pekerja |
| website | VARCHAR | 100 | YES | - | Laman web |
| is_verified | BOOLEAN | - | NO | 0 | Status pengesahan |
| verified_date | DATE | - | YES | - | Tarikh sah |
| verified_by | VARCHAR | 50 | YES | - | Disahkan oleh |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| payer_id | UUID | - | NO | - | Foreign Key to PAYER_MASTER |
| employer_code | VARCHAR | 30 | NO | - | Kod majikan (unique) |
| company_name | VARCHAR | 200 | NO | - | Nama syarikat |
| agreement_no | VARCHAR | 50 | YES | - | No perjanjian SPG |
| agreement_date | DATE | - | YES | - | Tarikh perjanjian |
| agreement_expiry | DATE | - | YES | - | Tarikh luput perjanjian |
| deduction_type | VARCHAR | 20 | YES | FIXED' | FIXED'/'PERCENTAGE' |
| deduction_value | DECIMAL | 10,2 | YES | - | Nilai potongan |
| deduction_frequency | VARCHAR | 20 | YES | MONTHLY' | MONTHLY'/'YEARLY' |
| tax_number | VARCHAR | 20 | YES | - | No cukai majikan |
| contact_person | VARCHAR | 150 | YES | - | Orang hubungan |
| contact_position | VARCHAR | 100 | YES | - | Jawatan |
| contact_phone | VARCHAR | 15 | YES | - | No telefon |
| contact_email | VARCHAR | 100 | YES | - | Emel |
| is_verified | BOOLEAN | - | NO | 0 | Status pengesahan |
| verified_date | DATE | - | YES | - | Tarikh sah |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| rep_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| payer_id | UUID | - | NO | - | Foreign Key to PAYER_CORPORATE |
| rep_name | VARCHAR | 150 | NO | - | Nama wakil |
| rep_ic_number | VARCHAR | 14 | NO | - | No IC wakil |
| rep_position | VARCHAR | 100 | NO | - | Jawatan |
| rep_contact_no | VARCHAR | 15 | YES | - | No telefon |
| rep_email | VARCHAR | 100 | YES | - | Emel |
| is_primary | BOOLEAN | - | NO | 0 | Wakil utama? |
| appointment_date | DATE | - | YES | - | Tarikh lantikan |
| expiry_date | DATE | - | YES | - | Tarikh luput |
| supporting_doc | VARCHAR | 200 | YES | - | Path dokumen sokongan |
| is_active | BOOLEAN | - | NO | 1 | Status aktif |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |
| modified_date | TIMESTAMP | - | YES | - | Tarikh ubah |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| contact_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| payer_id | UUID | - | NO | - | Foreign Key to PAYER_MASTER |
| contact_type | VARCHAR | 20 | NO | - | PHONE'/'MOBILE'/'EMAIL'/'FAX' |
| contact_value | VARCHAR | 100 | NO | - | No telefon/emel/dll |
| is_primary | BOOLEAN | - | NO | 0 | Hubungan utama? |
| is_verified | BOOLEAN | - | NO | 0 | Status pengesahan |
| verified_date | DATE | - | YES | - | Tarikh sah |
| verified_method | VARCHAR | 50 | YES | - | OTP'/'MANUAL'/'DOCUMENT' |
| verified_by | VARCHAR | 50 | YES | - | Disahkan oleh |
| notes | TEXT | - | YES | - | Catatan |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| address_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| payer_id | UUID | - | NO | - | Foreign Key to PAYER_MASTER |
| address_type | VARCHAR | 20 | NO | - | HOME'/'OFFICE'/'MAILING' |
| address_line1 | VARCHAR | 150 | NO | - | Alamat baris 1 |
| address_line2 | VARCHAR | 150 | YES | - | Alamat baris 2 |
| address_line3 | VARCHAR | 150 | YES | - | Alamat baris 3 |
| city | VARCHAR | 50 | NO | - | Bandar |
| postcode | VARCHAR | 5 | NO | - | Poskod |
| state | VARCHAR | 50 | NO | - | Negeri |
| country | VARCHAR | 50 | NO | MALAYSIA' | Negara |
| is_default | BOOLEAN | - | NO | 0 | Alamat default? |
| is_verified | BOOLEAN | - | NO | 0 | Status pengesahan |
| verified_date | DATE | - | YES | - | Tarikh sah |
| effective_from | DATE | - | YES | CURRENT_DATE | Berkuat kuasa dari |
| effective_to | DATE | - | YES | NULL | Berkuat kuasa hingga |
| latitude | DECIMAL | 10,8 | YES | - | Latitud (GIS) |
| longitude | DECIMAL | 11,8 | YES | - | Longitud (GIS) |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| emp_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| payer_id | UUID | - | NO | - | Foreign Key to PAYER_MAJIKAN |
| employee_name | VARCHAR | 150 | NO | - | Nama pekerja |
| employee_ic | VARCHAR | 14 | YES | - | No IC pekerja |
| employee_passport | VARCHAR | 20 | YES | - | No Passport |
| employee_no | VARCHAR | 30 | YES | - | No pekerja (company) |
| department | VARCHAR | 100 | YES | - | Jabatan |
| position | VARCHAR | 100 | YES | - | Jawatan |
| join_date | DATE | - | YES | - | Tarikh mula kerja |
| deduction_amount | DECIMAL | 10,2 | YES | - | Amaun potongan tetap |
| deduction_percent | DECIMAL | 5,2 | YES | - | Peratus potongan |
| is_active | BOOLEAN | - | NO | 1 | Status aktif |
| effective_date | DATE | - | YES | CURRENT_DATE | Tarikh kuat kuasa |
| expiry_date | DATE | - | YES | - | Tarikh tamat |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |
| modified_date | TIMESTAMP | - | YES | - | Tarikh ubah |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| rule_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| rule_name | VARCHAR | 100 | NO | - | Nama peraturan |
| rule_description | TEXT | - | YES | - | Penerangan |
| matching_fields | TEXT | - | NO | - | JSON: senarai medan |
| field_weights | TEXT | - | YES | - | JSON: weight setiap medan |
| threshold_score | DECIMAL | 5,2 | NO | 80.00 | Skor minimum untuk pendua |
| matching_algorithm | VARCHAR | 50 | NO | EXACT' | EXACT'/'FUZZY'/'BOTH' |
| is_active | BOOLEAN | - | NO | 1 | Status aktif |
| priority | INTEGER | - | NO | 1 | Keutamaan (1 tertinggi) |
| created_by | VARCHAR | 50 | NO | - | User ID pencipta |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| log_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| payer_id_1 | UUID | - | NO | - | Profil pertama |
| payer_id_2 | UUID | - | NO | - | Profil kedua |
| match_score | DECIMAL | 5,2 | NO | - | Skor padanan (0-100) |
| matched_fields | TEXT | - | NO | - | JSON: medan yang sepadan |
| rule_used | VARCHAR | 50 | YES | - | Peraturan digunakan |
| detected_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh kesan |
| detected_by | VARCHAR | 50 | YES | SYSTEM' | Dikesan oleh siapa |
| detection_method | VARCHAR | 20 | NO | AUTO' | AUTO'/'MANUAL' |
| status | VARCHAR | 20 | NO | NEW' | NEW'/'REVIEWED'/'MERGED'/'IGNORED' |
| reviewed_by | VARCHAR | 50 | YES | - | User ID semak |
| reviewed_date | TIMESTAMP | - | YES | - | Tarikh semak |
| action_taken | VARCHAR | 20 | YES | - | MERGE'/'IGNORE' |
| merged_to_payer_id | UUID | - | YES | - | Profil selepas gabung |
| notes | TEXT | - | YES | - | Catatan |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| merge_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| primary_payer_id | UUID | - | NO | - | Profil utama (disimpan) |
| secondary_payer_id | UUID | - | NO | - | Profil kedua (digabung) |
| merge_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh gabung |
| merged_by | VARCHAR | 50 | NO | - | User ID |
| field_conflicts | TEXT | - | YES | - | JSON: medan bercanggah |
| field_resolutions | TEXT | - | YES | - | JSON: resolusi konflik |
| transaction_count_moved | INTEGER | - | YES | 0 | Bil transaksi dipindah |
| approval_status | VARCHAR | 20 | NO | PENDING' | PENDING'/'APPROVED'/'REJECTED' |
| approved_by | VARCHAR | 50 | YES | - | Diluluskan oleh |
| approved_date | TIMESTAMP | - | YES | - | Tarikh lulus |
| notes | TEXT | - | YES | - | Catatan |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| status_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| payer_id | UUID | - | NO | - | Foreign Key |
| previous_status | VARCHAR | 20 | NO | - | Status lama |
| new_status | VARCHAR | 20 | NO | - | Status baru |
| reason | TEXT | - | YES | - | Sebab pertukaran |
| changed_by | VARCHAR | 50 | NO | - | User ID |
| changed_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh ubah |
| effective_date | DATE | - | YES | CURRENT_DATE | Tarikh kuat kuasa |
| expiry_date | DATE | - | YES | - | Tarikh tamat |
| reference_no | VARCHAR | 50 | YES | - | No rujukan |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| blacklist_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| payer_id | UUID | - | NO | - | Foreign Key |
| blacklist_date | DATE | - | NO | CURRENT_DATE | Tarikh blacklist |
| blacklist_reason | TEXT | - | NO | - | Sebab blacklist |
| reason_id | UUID | - | YES | - | FK ke BLACKLIST_REASON |
| blacklist_category | VARCHAR | 50 | YES | - | Kategori |
| blacklisted_by | VARCHAR | 50 | NO | - | User ID |
| effective_date | DATE | - | YES | CURRENT_DATE | Tarikh kuat kuasa |
| expiry_date | DATE | - | YES | - | Tarikh luput (jika ada) |
| is_active | BOOLEAN | - | NO | 1 | Status aktif |
| removed_date | DATE | - | YES | - | Tarikh dikeluarkan |
| removed_by | VARCHAR | 50 | YES | - | Dikeluarkan oleh |
| removed_reason | TEXT | - | YES | - | Sebab dikeluarkan |
| notes | TEXT | - | YES | - | Catatan |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| audit_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| payer_id | UUID | - | YES | - | Foreign Key (null jika bukan profil) |
| action_type | VARCHAR | 30 | NO | - | CREATE'/'UPDATE'/'STATUS_CHANGE'/'MERGE' |
| table_name | VARCHAR | 50 | NO | - | Nama table |
| record_id | UUID | - | YES | - | ID rekod |
| field_name | VARCHAR | 50 | YES | - | Medan diubah |
| old_value | TEXT | - | YES | - | Nilai lama |
| new_value | TEXT | - | YES | - | Nilai baru |
| changed_by | VARCHAR | 50 | NO | - | User ID |
| changed_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh masa ubah |
| ip_address | VARCHAR | 20 | YES | - | Alamat IP |
| user_agent | TEXT | - | YES | - | Maklumat browser |
| session_id | VARCHAR | 100 | YES | - | ID session |
| module | VARCHAR | 50 | YES | PROFIL' | Modul sistem |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| state_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| state_code | VARCHAR | 10 | NO | - | Kod negeri |
| state_name | VARCHAR | 100 | NO | - | Nama negeri |
| country | VARCHAR | 50 | NO | MALAYSIA' | Negara |
| is_active | BOOLEAN | - | NO | 1 | Status aktif |
| display_order | INTEGER | - | YES | 0 | Turutan paparan |


| Role ID | Role Name | Penerangan |
| --- | --- | --- |
| R01 | Pentadbir Sistem | Akses penuh ke semua fungsi termasuk konfigurasi sistem |
| R02 | Pengurus Operasi | Mengawasi operasi harian, laporan, dan pengesahan |
| R03 | Eksekutif Pemprosesan | Memproses pendaftaran, kemaskini, gabung profil, blacklist |
| R04 | Eksekutif Kaunter | Mendaftar dan kemaskini profil di kaunter |
| R05 | Penyelia Kaunter | Menyelia dan mengesahkan perubahan kritikal |
| R06 | Juruaudit | Akses view sahaja untuk tujuan audit |
| R07 | Majikan (SPG) | Akses kepada profil syarikat sendiri dan senarai pekerja |
| R08 | Wakil Korporat | Akses kepada profil syarikat sendiri |
| R09 | Pembayar Individu | Akses kepada profil sendiri sahaja |
| R10 | Pegawai Pematuhan | Mengurus blacklist dan sekatan |


| Fungsi / Sub-Modul | R01 | R02 | R03 | R04 | R05 | R06 | R07 | R08 | R09 | R10 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Dashboard Profil |  |  |  |  |  |  |  |  |  |  |
| Lihat Ringkasan | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Lihat Statistik | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
|  |  |  |  |  |  |  |  |  |  |  |
| Pendaftaran |  |  |  |  |  |  |  |  |  |  |
| Daftar Individu | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | Sendiri | ✗ |
| Daftar Korporat | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | Sendiri | ✗ | ✗ |
| Daftar Majikan SPG | ✓ | ✓ | ✓ | Terhad | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
|  |  |  |  |  |  |  |  |  |  |  |
| Carian Profil |  |  |  |  |  |  |  |  |  |  |
| Carian Asas | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Terhad | Terhad | Sendiri | ✓ |
| Carian Lanjutan | ✓ | ✓ | ✓ | Terhad | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Lihat Hasil Carian | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Terhad | Terhad | Sendiri | ✓ |
|  |  |  |  |  |  |  |  |  |  |  |
| Kemaskini Profil |  |  |  |  |  |  |  |  |  |  |
| Kemaskini Asas | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | Terhad | Terhad | Terhad | ✗ |
| Tukar Alamat | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | Terhad | Terhad | Terhad | ✗ |
| Tukar Contact | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | Terhad | Terhad | Terhad | ✗ |
| Tukar Wakil | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | Terhad | ✗ | ✗ |
| Perlu Pengesahan | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
|  |  |  |  |  |  |  |  |  |  |  |
| Pengesanan Pendua |  |  |  |  |  |  |  |  |  |  |
| Lihat Senarai Pendua | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Jalankan Pengesanan | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Konfigurasi Peraturan | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
|  |  |  |  |  |  |  |  |  |  |  |
| Penggabungan Profil |  |  |  |  |  |  |  |  |  |  |
| Proses Gabungan | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Sahkan Gabungan | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Lihat Sejarah Gabung | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
|  |  |  |  |  |  |  |  |  |  |  |
| Status & Blacklist |  |  |  |  |  |  |  |  |  |  |
| Tukar Status | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Tambah Blacklist | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Keluar Blacklist | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Lihat Senarai Hitam | ✓ | ✓ | ✓ | Terhad | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
|  |  |  |  |  |  |  |  |  |  |  |
| Audit & Laporan |  |  |  |  |  |  |  |  |  |  |
| Lihat Log Audit | ✓ | ✓ | Terhad | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Laporan Pendaftaran | ✓ | ✓ | ✓ | Terhad | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Laporan Blacklist | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Eksport Data | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
|  |  |  |  |  |  |  |  |  |  |  |
| Pentadbiran |  |  |  |  |  |  |  |  |  |  |
| Konfigurasi Sistem | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Urus Pengguna | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |


| Tindakan | Tahap | Perlu Pengesahan | Role Dibenarkan |
| --- | --- | --- | --- |
| VIEW | Read | Tidak | Semua role kecuali R09 (terhad) |
| CREATE | Write | Tidak | R01, R02, R03, R04, R05 |
| UPDATE_BASIC | Write | Tidak | R01, R02, R03, R04, R05 |
| UPDATE_CRITICAL | Write | Ya | R01, R02, R03, R05 (perlu sah) |
| DELETE | Write | Ya | Tiada (soft delete/gabung) |
| MERGE | Write | Ya | R01, R02, R03, R05 |
| BLACKLIST_ADD | Write | Ya | R01, R02, R03, R05, R10 |
| BLACKLIST_REMOVE | Write | Ya | R01, R02, R03, R05, R10 |
| STATUS_CHANGE | Write | Ya | R01, R02, R03, R05, R10 |
| CONFIG | Admin | Tidak | R01 sahaja |
| AUDIT_VIEW | Read | Tidak | R01, R02, R06 |


| Rule ID | Peraturan | Penerangan | Kesan Jika Dilanggar |
| --- | --- | --- | --- |
| BR-REG-01 | Umur Minimum | Pembayar individu mestilah berumur 18 tahun ke atas | Pendaftaran ditolak |
| BR-REG-02 | Unik No Pengenalan | No MyKad/Passport mestilah unik dalam sistem | Amaran pendua, tidak boleh simpan |
| BR-REG-03 | Format No MyKad | No MyKad mesti format 6 digit - 2 digit - 4 digit (numeric) | Error validasi |
| BR-REG-04 | Format No Telefon | No telefon mesti format Malaysia (03-xxxxxxx / 012-xxxxxxx) | Error validasi |
| BR-REG-05 | Format Emel | Emel mesti format yang sah (user@domain.com) | Error validasi |
| BR-REG-06 | Poskod Sah | Poskod mesti 5 digit numeric | Error validasi |
| BR-REG-07 | Medan Wajib | Semua medan bertanda wajib mesti diisi | Error validasi |
| BR-REG-08 | Pengesahan Terma | Pengguna mesti menandakan persetujuan terma | Error validasi |
| BR-REG-09 | No SSM Unik | No pendaftaran SSM mestilah unik untuk profil korporat | Amaran pendua |
| BR-REG-10 | Wakil Sah | Wakil syarikat mestilah berumur 18 tahun ke atas | Error validasi |


| Rule ID | Peraturan | Penerangan | Skor Padanan |
| --- | --- | --- | --- |
| BR-DUP-01 | Padanan Tepat IC | No MyKad/Passport sama 100% | 100% - Pendua Auto |
| BR-DUP-02 | Padanan Nama + DOB | Nama hampir sama + Tarikh Lahir sama | 90-99% - Tinggi |
| BR-DUP-03 | Padanan IC Hampir | No IC berbeza 1-2 digit + Nama sama | 85-95% - Tinggi |
| BR-DUP-04 | Padanan Nama + No Tel | Nama sama + No telefon sama | 85% - Sederhana |
| BR-DUP-05 | Padanan Nama + Alamat | Nama sama + Alamat hampir sama | 80% - Sederhana |
| BR-DUP-06 | Padanan Fuzzy Nama | Nama hampir sama (fuzzy match) >85% | 70-85% - Sederhana |
| BR-DUP-07 | Threshold Pendua | Skor >= 80% dianggap pendua dan perlu tindakan | Auto flag |
| BR-DUP-08 | Threshold Semakan | Skor 60-79% perlu semakan manual | Alert untuk semak |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-MRG-01 | Pemilihan Profil Utama | Profil dengan transaksi lebih banyak diutamakan sebagai profil utama |
| BR-MRG-02 | Pemilihan Profil Aktif | Profil yang lebih aktif (log masuk terkini) diutamakan |
| BR-MRG-03 | Konflik Data | Jika data bercanggah, pengguna mesti pilih nilai mana dikekalkan |
| BR-MRG-04 | Pemindahan Transaksi | Semua transaksi dari profil kedua dipindah ke profil utama |
| BR-MRG-05 | Status Profil Kedua | Profil kedua ditandakan sebagai 'MERGED' dan tidak boleh diakses |
| BR-MRG-06 | Pengesahan Gabungan | Gabungan profil perlu pengesahan penyelia untuk skor <95% |
| BR-MRG-07 | Log Gabungan | Semua gabungan direkod dalam MERGE_HISTORY dan AUDIT_LOG |
| BR-MRG-08 | Sekatan Rollback | Gabungan tidak boleh di-rollback selepas 24 jam |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-STA-01 | Status Default | Profil baru status 'ACTIVE' |
| BR-STA-02 | Tukar Status | Perlu sebab pertukaran untuk tukar status |
| BR-STA-03 | Blacklist Auto | Sistem auto blacklist jika gagal bayar 3 kali berturut-turut |
| BR-STA-04 | Sekatan Blacklist | Profil blacklist tidak boleh buat transaksi baru |
| BR-STA-05 | Tempoh Blacklist | Blacklist mempunyai tempoh (jika ditetapkan) |
| BR-STA-06 | Notifikasi Wajib | Notifikasi mesti dihantar untuk perubahan status kritikal |
| BR-STA-07 | Pengesahan Blacklist | Blacklist perlu pengesahan penyelia |
| BR-STA-08 | Sejarah Status | Semua perubahan status direkod dalam STATUS_HISTORY |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-AUD-01 | Log Semua Perubahan | Setiap CREATE/UPDATE mesti direkod dalam AUDIT_LOG |
| BR-AUD-02 | Nilai Lama/Baru | Audit log mesti rekod nilai lama dan baru untuk UPDATE |
| BR-AUD-03 | Maklumat Pengguna | Audit log mesti rekod siapa, bila, IP, dan session |
| BR-AUD-04 | Tempoh Simpan Log | Log audit disimpan minimum 7 tahun |
| BR-AUD-05 | Data Sensitif | Data sensitif (No IC) mesti di-mask untuk role tertentu |
| BR-AUD-06 | Akses View Sahaja | Juruaudit hanya akses view, tiada ubah data |
| BR-AUD-07 | Pengesahan Perubahan Kritikal | Perubahan kritikal perlu pengesahan penyelia |


| Objektif | Fungsi Keperluan Berkaitan |
| --- | --- |
| OBJ-01: Pendaftaran sistematik | FR-01, FR-02, FR-03 |
| OBJ-02: Ketepatan data | FR-01 (validasi), FR-04 (pengesahan) |
| OBJ-03: Pengesanan pendua | FR-07, FR-08, FR-09, FR-10 |
| OBJ-04: Penggabungan profil | FR-11, FR-12 |
| OBJ-05: Status & blacklist | FR-13, FR-14, FR-15, FR-16 |
| OBJ-06: Sokongan SPG | FR-03, FR-04 (untuk majikan) |
| OBJ-07: Audit | FR-18, FR-19 |
| OBJ-08: Carian fleksibel | FR-05, FR-06 |


| Fungsi Keperluan | Use Case Berkaitan |
| --- | --- |
| FR-01: Daftar Individu | UC01 |
| FR-02: Daftar Korporat | UC02 |
| FR-03: Daftar Majikan SPG | UC03 |
| FR-04: Kemaskini Profil | UC04 |
| FR-05: Carian Profil | UC05 |
| FR-06: Papar Profil | UC06 |
| FR-07: Konfigurasi Peraturan Pendua | UC14 |
| FR-08: Pengesanan Pendua Auto | UC07 |
| FR-09: Pengesanan Pendua Manual | UC08 |
| FR-10: Senarai Pendua | UC09 |
| FR-11: Gabung Profil | UC10 |
| FR-12: Resolusi Konflik | UC10 |
| FR-13: Tukar Status | UC11 |
| FR-14: Blacklist | UC12 |
| FR-15: Sekatan Profil | UC11, UC12 |
| FR-16: Notifikasi Status | UC11, UC12 |
| FR-17: Sejarah Status | UC13 |
| FR-18: Log Audit | UC13 |
| FR-19: Sejarah Profil | UC13 |
| FR-20: Laporan Profil | UC15 |


| Use Case | Role Dibenarkan |
| --- | --- |
| UC01: Daftar Individu | R01, R02, R03, R04, R05, R09 (sendiri) |
| UC02: Daftar Korporat | R01, R02, R03, R04, R05, R08 (sendiri) |
| UC03: Daftar Majikan SPG | R01, R02, R03, R05, R07 (sendiri) |
| UC04: Kemaskini Profil | R01, R02, R03, R04, R05, R07 (terhad), R08 (terhad), R09 (terhad) |
| UC05: Carian Profil | Semua role (dengan sekatan) |
| UC06: Papar Profil | Semua role (dengan sekatan) |
| UC07: Pengesanan Pendua Auto | Sistem (auto) |
| UC08: Pengesanan Pendua Manual | R01, R02, R03 |
| UC09: Semak Senarai Pendua | R01, R02, R03, R05, R06 |
| UC10: Gabung Profil | R01, R02, R03, R05 |
| UC11: Tukar Status | R01, R02, R03, R05, R10 |
| UC12: Urus Blacklist | R01, R02, R03, R05, R10 |
| UC13: Lihat Sejarah Profil | R01, R02, R03, R05, R06 |
| UC14: Konfigurasi Peraturan | R01 |
| UC15: Laporan Profil | R01, R02, R05, R06 |


| POC Document Section | Page | Modul 1 Sub-Modul |
| --- | --- | --- |
| User/Interface Solution (Individu, Korporat, Majikan) | 3 | PM-01, PM-02, PM-03 |
| Data Management | 8 | PM-01, PM-02, PM-03, PM-04 |
| User Access (Matrix) | 3 | PM-08 (role-based access) |
| Audit Trail | 3 | PM-08 (audit log) |
| Scenario: Pembayar Individu/Korporat | 7,8 | PM-01, PM-02 |
| Scenario: Executive Kaunter/Processing | 7,8 | PM-01, PM-02, PM-03, PM-04, PM-05, PM-06, PM-07 |


| Domain | Nilai | Penerangan |
| --- | --- | --- |
| payer_type | INDV' | Individu |
|  | CORP' | Korporat/Syarikat |
|  | MAJIKAN' | Majikan SPG |
|  |  |  |
| status | ACTIVE' | Aktif - boleh transaksi |
|  | INACTIVE' | Tidak aktif - tidak boleh transaksi |
|  | SUSPENDED' | Digantung sementara |
|  | BLACKLIST' | Senarai hitam - tidak boleh transaksi |
|  | MERGED' | Profil telah digabung |
|  | CLOSED' | Ditutup (kematian/pembubaran) |
|  |  |  |
| gender | L' | Lelaki |
|  | P' | Perempuan |
|  |  |  |
| marital_status | SINGLE' | Belum Berkahwin |
|  | MARRIED' | Berkahwin |
|  | WIDOWED' | Duda/Janda |
|  | DIVORCED' | Bercerai |
|  |  |  |
| contact_type | MOBILE' | Telefon Bimbit |
|  | PHONE' | Telefon Rumah/Pejabat |
|  | EMAIL' | Emel |
|  | FAX' | Fax |
|  |  |  |
| address_type | HOME' | Alamat Rumah |
|  | OFFICE' | Alamat Pejabat |
|  | MAILING' | Alamat Surat-menyurat |
|  | BRANCH' | Alamat Cawangan |
|  |  |  |
| deduction_type | FIXED' | Potongan Tetap (RM) |
|  | PERCENTAGE' | Potongan Peratus (%) |
|  |  |  |
| duplicate_status | NEW' | Baru dikesan |
|  | REVIEWED' | Telah disemak |
|  | MERGED' | Telah digabung |
|  | IGNORED' | Diabaikan (bukan pendua) |
|  |  |  |
| action_type | CREATE' | Cipta rekod baru |
|  | UPDATE' | Kemaskini rekod |
|  | DELETE' | Padam rekod |
|  | STATUS_CHANGE' | Tukar status |
|  | MERGE' | Gabung profil |
|  | BLACKLIST_ADD' | Tambah blacklist |
|  | BLACKLIST_REMOVE' | Keluar blacklist |
|  | VERIFY' | Sahkan data |


| Table | Column | Data Type | Length | Penerangan | Sumber Data |
| --- | --- | --- | --- | --- | --- |
| PAYER_MASTER | payer_id | UUID | - | ID unik pembayar | System generated |
|  | payer_type | VARCHAR | 20 | Jenis pembayar | Input form |
|  | registration_no | VARCHAR | 50 | No rujukan pendaftaran | System generated |
|  | registration_date | TIMESTAMP | - | Tarikh pendaftaran | System |
|  | status | VARCHAR | 20 | Status terkini | System/User |
|  | status_reason | TEXT | - | Sebab status | User input |
|  | is_blacklisted | BOOLEAN | - | Status blacklist | System |
|  | blacklist_date | DATE | - | Tarikh blacklist | System |
|  | blacklist_reason | TEXT | - | Sebab blacklist | User input |
|  | merged_to_payer_id | UUID | - | Rujukan jika digabung | System |
|  | merge_date | TIMESTAMP | - | Tarikh digabung | System |
|  | risk_category | VARCHAR | 20 | Kategori risiko | System |
|  | remarks | TEXT | - | Catatan am | User input |
|  | created_by | VARCHAR | 50 | ID pengguna cipta | Session |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  | modified_by | VARCHAR | 50 | ID pengguna kemaskini | Session |
|  | modified_date | TIMESTAMP | - | Tarikh kemaskini | System |
|  |  |  |  |  |  |
| PAYER_INDIVIDU | payer_id | UUID | - | ID pembayar (FK) | From PAYER_MASTER |
|  | ic_number | VARCHAR | 14 | No MyKad | Input form |
|  | passport_number | VARCHAR | 20 | No Passport | Input form |
|  | old_ic_number | VARCHAR | 12 | No IC lama | Input form |
|  | full_name | VARCHAR | 150 | Nama penuh | Input form |
|  | full_name_arabic | VARCHAR | 150 | Nama dalam arab | Input form |
|  | citizenship | VARCHAR | 50 | Warganegara | Input form |
|  | marital_status | VARCHAR | 20 | Status perkahwinan | Input form |
|  | gender | CHAR | 1 | Jantina | Input form |
|  | birth_date | DATE | - | Tarikh lahir | Input form |
|  | birth_place | VARCHAR | 100 | Tempat lahir | Input form |
|  | age | INTEGER | - | Umur | Calculated |
|  | race | VARCHAR | 50 | Bangsa | Input form |
|  | religion | VARCHAR | 50 | Agama | Input form |
|  | occupation | VARCHAR | 100 | Pekerjaan | Input form |
|  | employer_name | VARCHAR | 150 | Nama majikan | Input form |
|  | income_source | VARCHAR | 50 | Sumber pendapatan | Input form |
|  | income_range | VARCHAR | 20 | Julat pendapatan | Input form |
|  | zakat_status | VARCHAR | 20 | Status zakat | Input form |
|  | last_zakat_date | DATE | - | Tarikh akhir zakat | System |
|  | bank_account_no | VARCHAR | 30 | No akaun bank | Input form |
|  | bank_id | UUID | - | ID bank (FK) | Input form |
|  | death_date | DATE | - | Tarikh mati | Input form |
|  | death_cert_no | VARCHAR | 30 | No sijil mati | Input form |
|  | is_verified | BOOLEAN | - | Status pengesahan | System |
|  | verified_date | DATE | - | Tarikh sah | System |
|  | verified_by | VARCHAR | 50 | Disahkan oleh | Session |
|  |  |  |  |  |  |
| PAYER_CONTACT | contact_id | UUID | - | ID unik hubungan | System |
|  | payer_id | UUID | - | ID pembayar (FK) | From PAYER_MASTER |
|  | contact_type | VARCHAR | 20 | Jenis hubungan | Input form |
|  | contact_value | VARCHAR | 100 | Nilai hubungan | Input form |
|  | is_primary | BOOLEAN | - | Hubungan utama? | Input form |
|  | is_verified | BOOLEAN | - | Status pengesahan | System |
|  | verified_date | DATE | - | Tarikh sah | System |
|  | verified_method | VARCHAR | 50 | Kaedah pengesahan | System |
|  | verified_by | VARCHAR | 50 | Disahkan oleh | Session |
|  | notes | TEXT | - | Catatan | User input |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  |  |  |  |  |  |
| PAYER_ADDRESS | address_id | UUID | - | ID unik alamat | System |
|  | payer_id | UUID | - | ID pembayar (FK) | From PAYER_MASTER |
|  | address_type | VARCHAR | 20 | Jenis alamat | Input form |
|  | address_line1 | VARCHAR | 150 | Alamat baris 1 | Input form |
|  | address_line2 | VARCHAR | 150 | Alamat baris 2 | Input form |
|  | address_line3 | VARCHAR | 150 | Alamat baris 3 | Input form |
|  | city | VARCHAR | 50 | Bandar | Input form |
|  | postcode | VARCHAR | 5 | Poskod | Input form |
|  | state | VARCHAR | 50 | Negeri | Input form |
|  | country | VARCHAR | 50 | Negara | Default/Input |
|  | is_default | BOOLEAN | - | Alamat default? | Input form |
|  | is_verified | BOOLEAN | - | Status pengesahan | System |
|  | verified_date | DATE | - | Tarikh sah | System |
|  | effective_from | DATE | - | Berkuat kuasa dari | Input form |
|  | effective_to | DATE | - | Berkuat kuasa hingga | Input form |
|  | latitude | DECIMAL | 10,8 | Latitud | GIS integration |
|  | longitude | DECIMAL | 11,8 | Longitud | GIS integration |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  |  |  |  |  |  |
| DUPLICATE_LOG | log_id | UUID | - | ID unik log pendua | System |
|  | payer_id_1 | UUID | - | Profil pertama (FK) | From PAYER_MASTER |
|  | payer_id_2 | UUID | - | Profil kedua (FK) | From PAYER_MASTER |
|  | match_score | DECIMAL | 5,2 | Skor padanan | Calculated |
|  | matched_fields | TEXT | - | Medan yang sepadan (JSON) | System |
|  | rule_used | VARCHAR | 50 | Peraturan digunakan | System |
|  | detected_date | TIMESTAMP | - | Tarikh kesan | System |
|  | detected_by | VARCHAR | 50 | Dikesan oleh | System/Session |
|  | detection_method | VARCHAR | 20 | Kaedah kesan | System |
|  | status | VARCHAR | 20 | Status log | System/User |
|  | reviewed_by | VARCHAR | 50 | User ID semak | Session |
|  | reviewed_date | TIMESTAMP | - | Tarikh semak | System |
|  | action_taken | VARCHAR | 20 | Tindakan diambil | User input |
|  | merged_to_payer_id | UUID | - | Profil selepas gabung | System |
|  | notes | TEXT | - | Catatan | User input |
|  |  |  |  |  |  |
| AUDIT_LOG | audit_id | UUID | - | ID unik audit | System |
|  | payer_id | UUID | - | ID pembayar (FK) | From PAYER_MASTER |
|  | action_type | VARCHAR | 30 | Jenis tindakan | System |
|  | table_name | VARCHAR | 50 | Nama table | System |
|  | record_id | UUID | - | ID rekod | System |
|  | field_name | VARCHAR | 50 | Medan diubah | System |
|  | old_value | TEXT | - | Nilai lama | System |
|  | new_value | TEXT | - | Nilai baru | System |
|  | changed_by | VARCHAR | 50 | User ID | Session |
|  | changed_date | TIMESTAMP | - | Tarikh masa ubah | System |
|  | ip_address | VARCHAR | 20 | Alamat IP | Request |
|  | user_agent | TEXT | - | Maklumat browser | Request |
|  | session_id | VARCHAR | 100 | ID session | Session |
|  | module | VARCHAR | 50 | Modul sistem | System |


| AC ID | Kriteria | Kaedah Ujian | Keputusan Jangkaan |
| --- | --- | --- | --- |
| AC-01 | Pengguna boleh mendaftar profil individu baru dengan mengisi semua medan wajib | Ujian fungsian: Isi borang lengkap, klik simpan | Profil berjaya disimpan, papar mesej kejayaan, data dalam database |
| AC-02 | Sistem menolak pendaftaran jika medan wajib tidak diisi | Ujian negatif: Biarkan medan wajib kosong | Sistem papar error, rekod tidak disimpan |
| AC-03 | Sistem mengesan No MyKad yang telah wujud dan memberi amaran | Ujian pendua: Daftar dengan No MyKad sedia ada | Sistem papar amaran pendua, pengguna boleh pilih untuk teruskan atau batal |
| AC-04 | Sistem mengesan profil pendua berdasarkan peraturan yang ditetapkan | Ujian enjin pendua: Masukkan data hampir sama dengan profil sedia ada | Sistem kesan dan rekod dalam duplicate_log dengan skor padanan |
| AC-05 | Pengguna boleh menggabungkan dua profil pendua | Ujian gabung: Pilih dua profil pendua, pilih profil utama, sahkan gabung | Profil digabung, transaksi dipindah, profil kedua status 'MERGED' |
| AC-06 | Pengguna boleh menukar status pembayar | Ujian status: Tukar status dari 'ACTIVE' ke 'INACTIVE' dengan sebab | Status berubah, rekod dalam status_history |
| AC-07 | Pengguna boleh menambah pembayar ke blacklist | Ujian blacklist: Tambah pembayar ke blacklist dengan sebab | Status blacklist, rekod dalam blacklist table, pembayar tidak boleh transaksi |
| AC-08 | Sistem merekod semua perubahan profil dalam audit log | Ujian audit: Buat perubahan profil, semak audit log | Audit log mengandungi rekod perubahan dengan nilai lama/baru |
| AC-09 | Pengguna dengan role berbeza mempunyai akses berbeza | Ujian RBAC: Log masuk dengan role berbeza, cuba akses fungsi | Akses mengikut matriks kebenaran |
| AC-10 | Pengguna boleh mencari profil menggunakan pelbagai kriteria | Ujian carian: Cari menggunakan No IC, nama, no telefon | Hasil carian memaparkan profil yang sepadan |


| AC ID | Kriteria | Kaedah Ujian | Keputusan Jangkaan |
| --- | --- | --- | --- |
| AC-T01 | Sistem boleh memproses pendaftaran serentak 100 pengguna | Ujian beban: Simulasi 100 pengguna serentak | Masa respons < 3 saat, tiada ralat |
| AC-T02 | Enjin pengesanan pendua boleh memproses 10,000 profil dalam < 5 minit | Ujian prestasi: Jalankan batch detection dengan 10,000 profil | Proses selesai dalam masa yang ditetapkan |
| AC-T03 | Data sensitif (No IC) di-mask untuk role tertentu | Ujian keselamatan: Log masuk sebagai juruaudit, lihat profil | No IC dipaparkan sebagai 80*******1234 |
| AC-T04 | Sistem mengunci akaun selepas 5 percubaan log masuk gagal | Ujian keselamatan: Cuba log masuk dengan kata laluan salah 5 kali | Akaun dikunci, notifikasi dihantar |
| AC-T05 | Semua transaksi database adalah atomic (rollback jika gagal) | Ujian integriti: Simulasi kegagalan semasa pendaftaran | Data tidak separa tersimpan |


| AC ID | Kriteria | Kaedah Ujian | Keputusan Jangkaan |
| --- | --- | --- | --- |
| AC-UI01 | Borang pendaftaran memaparkan validasi secara实时 (real-time) | Ujian UI: Taip data tidak sah, alih keluar medan | Papar mesej error tanpa perlu klik simpan |
| AC-UI02 | Antaramuka responsif pada desktop dan mobile | Ujian responsif: Buka sistem pada desktop, tablet, telefon | Paparan sesuai dengan saiz skrin |
| AC-UI03 | Mesej error jelas dan membantu pengguna | Ujian kebolehgunaan: Buat kesilapan, baca mesej error | Mesej menerangkan kesilapan dan cara betulkan |
| AC-UI04 | Navigasi intuitif dengan breadcrumbs | Ujian navigasi: Navigasi ke halaman dalam | Breadcrumbs menunjukkan lokasi semasa |


| ID Objektif | Pernyataan Objektif |
| --- | --- |
| OBJ-01 | Menyediakan platform konfigurasi pusat untuk pelbagai jenis zakat (fitrah, pendapatan, perniagaan, emas, dll) |
| OBJ-02 | Membolehkan penetapan kadar zakat yang fleksibel (tetap, berperingkat, berdasarkan syarat) tanpa pengkodan |
| OBJ-03 | Menyokong pelbagai formula pengiraan zakat mengikut keperluan syariah dan peraturan LZS |
| OBJ-04 | Mengurus konfigurasi channel pembayaran yang pelbagai (kaunter, online, FPX, potongan gaji) |
| OBJ-05 | Menyediakan pemetaan akaun perakaunan untuk setiap jenis zakat dan channel pembayaran |
| OBJ-06 | Membolehkan penetapan tempoh aktif untuk jenis zakat (contoh: zakat fitrah hanya aktif pada bulan Ramadhan) |
| OBJ-07 | Menyediakan mekanisme versi dan sejarah perubahan untuk tujuan audit dan rollback |
| OBJ-08 | Memastikan pematuhan kepada keperluan syariah dan peraturan percukaian |


| Perkara | Skop |
| --- | --- |
| Entiti Utama | Jenis Zakat, Kategori Zakat, Kadar Zakat, Formula Pengiraan, Channel Pembayaran, Mapping Akaun |
| Proses Utama | Konfigurasi jenis zakat, penetapan kadar, pengurusan formula, pengurusan channel, pemetaan akaun, pengurusan tempoh aktif |
| Jenis Zakat | Zakat Fitrah, Zakat Pendapatan, Zakat Perniagaan, Zakat Emas/Perak, Zakat Simpanan, Zakat Saham, Zakat KWSP, Zakat Pertanian, Zakat Ternakan, Zakat Perniagaan |
| Channel Pembayaran | Kaunter (Tunai/Debit/Kad), Online (FPX), Portal Majikan (SPG), Potongan Automatik (Direct Debit), Cek, Transfer Bank |
| Integrasi | Sistem Perakaunan (GL Mapping), FPX (payment channel), Portal Pembayar |
| Had Skop | Tidak meliputi pemprosesan transaksi individu (Modul 3), pelaporan kewangan (Modul 9) |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-01 | Konfigurasi Jenis Zakat | Menambah, mengemaskini, mengaktifkan/menyahaktifkan jenis zakat | Tinggi |
| FR-02 | Konfigurasi Kategori Zakat | Mengurus kategori induk untuk pengelompokan jenis zakat | Sederhana |
| FR-03 | Penetapan Syarat Kelayakan | Menetapkan syarat-syarat kelayakan untuk sesuatu jenis zakat (contoh: nisab, haul) | Tinggi |
| FR-04 | Pengurusan Tempoh Aktif | Menetapkan tempoh sesuatu jenis zakat boleh ditransaksikan (contoh: Ramadhan untuk fitrah) | Sederhana |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-05 | Konfigurasi Kadar Tetap | Menetapkan kadar zakat dalam nilai tetap (RM) | Tinggi |
| FR-06 | Konfigurasi Kadar Peratusan | Menetapkan kadar zakat dalam peratusan (%) | Tinggi |
| FR-07 | Konfigurasi Kadar Berperingkat | Menetapkan kadar berbeza berdasarkan julat nilai (tiered rate) | Tinggi |
| FR-08 | Formula Pengiraan | Membolehkan konfigurasi formula pengiraan (contoh: (Pendapatan - Keperluan) x 2.5%) | Tinggi |
| FR-09 | Penetapan Nisab | Menetapkan nilai nisab untuk sesuatu jenis zakat | Tinggi |
| FR-10 | Penetapan Haul | Menetapkan tempoh haul (12 bulan qamariah) | Sederhana |
| FR-11 | Pengiraan Automatik | Sistem mengira amaun zakat berdasarkan formula dan kadar yang ditetapkan | Tinggi |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-12 | Konfigurasi Channel | Menambah dan mengurus channel pembayaran yang tersedia | Tinggi |
| FR-13 | Penetapan Channel mengikut Jenis Zakat | Menentukan channel mana yang boleh digunakan untuk sesuatu jenis zakat | Tinggi |
| FR-14 | Caj Perkhidmatan | Menetapkan caj perkhidmatan (jika ada) untuk channel tertentu | Sederhana |
| FR-15 | Had Minimum/Maksimum | Menetapkan had transaksi minimum dan maksimum mengikut channel | Sederhana |
| FR-16 | Waktu Operasi Channel | Menetapkan waktu operasi untuk setiap channel (contoh: FPX 24/7, kaunter waktu pejabat) | Rendah |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-17 | Pemetaan Akaun GL | Memetakan jenis zakat dan channel ke akaun GL dalam sistem perakaunan | Tinggi |
| FR-18 | Pemetaan Akaun Bank | Memetakan channel pembayaran ke akaun bank penerima | Tinggi |
| FR-19 | Pemetaan Akaun Hasil | Memetakan jenis zakat ke akaun hasil untuk pelaporan kewangan | Tinggi |
| FR-20 | Pemetaan Akaun Belum Terima | Memetakan untuk transaksi yang belum dijelaskan | Sederhana |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-21 | Versi Konfigurasi | Menyimpan versi lama konfigurasi untuk rujukan dan rollback | Tinggi |
| FR-22 | Sejarah Perubahan | Merekod semua perubahan konfigurasi | Tinggi |
| FR-23 | Pengesahan Perubahan | Memerlukan pengesahan penyelia untuk perubahan kritikal | Sederhana |
| FR-24 | Tarikh Kuat Kuasa | Menetapkan tarikh sesuatu konfigurasi mula berkuat kuasa | Tinggi |


| Item | Detail |
| --- | --- |
| ID | UC01 |
| Nama Use Case | Tambah Jenis Zakat |
| Aktor Utama | Pentadbir Sistem, Pegawai Syariah |
| Aktor Sekunder | - |
| Penerangan | Menambah jenis zakat baharu ke dalam sistem |
| Pre-condition | Pengguna mempunyai kebenaran untuk konfigurasi; jenis zakat belum wujud |
| Post-condition | Jenis zakat baharu berjaya ditambah dengan status 'DRAFT' atau 'ACTIVE' |


| Item | Detail |
| --- | --- |
| ID | UC04 |
| Nama Use Case | Konfigurasi Kadar Zakat |
| Aktor Utama | Pentadbir Sistem, Pegawai Syariah |
| Aktor Sekunder | - |
| Penerangan | Menetapkan kadar zakat untuk sesuatu jenis zakat |
| Pre-condition | Jenis zakat telah wujud dalam sistem |
| Post-condition | Kadar zakat berjaya dikonfigurasi dan sedia untuk digunakan |


| Item | Detail |
| --- | --- |
| ID | UC11 |
| Nama Use Case | Kira Zakat |
| Aktor Utama | Pembayar, Eksekutif Kaunter, Sistem (auto) |
| Aktor Sekunder | - |
| Penerangan | Mengira amaun zakat berdasarkan jenis zakat dan input pembayar |
| Pre-condition | Jenis zakat aktif; kadar/formula telah dikonfigurasi |
| Post-condition | Amaun zakat dipaparkan kepada pengguna |


| Kod Modul | Sub-Modul | Penerangan | Fungsi Utama |
| --- | --- | --- | --- |
| JZ-01 | Pengurusan Jenis Zakat | Pengurusan master data jenis zakat |  |
| JZ-01-01 | Daftar Jenis Zakat | Menambah jenis zakat baharu | Borang pendaftaran, kod unik, keterangan |
| JZ-01-02 | Kemaskini Jenis Zakat | Mengemaskini maklumat asas jenis zakat | Ubah nama, penerangan, kategori |
| JZ-01-03 | Aktif/Nyahaktif | Mengaktifkan atau menyahaktifkan jenis zakat | Tukar status, kesan ke transaksi |
| JZ-01-04 | Pengurusan Kategori | Mengurus kategori induk untuk pengelompokan | Tambah kategori, ubah, susun |
| JZ-01-05 | Tempoh Aktif | Menetapkan tempoh sesuatu jenis zakat boleh ditransaksi | Tarikh mula, tarikh akhir, notifikasi |
|  |  |  |  |
| JZ-02 | Konfigurasi Kadar | Pengurusan kadar dan nilai zakat |  |
| JZ-02-01 | Kadar Tetap | Konfigurasi kadar dalam bentuk nilai tetap (RM) | Input amaun, tarikh kuat kuasa |
| JZ-02-02 | Kadar Peratusan | Konfigurasi kadar dalam bentuk peratusan (%) | Input peratus, tarikh kuat kuasa |
| JZ-02-03 | Kadar Berperingkat | Konfigurasi kadar berbeza mengikut julat (tiered) | Tambah tier, julat minimum/maksimum, kadar |
| JZ-02-04 | Kadar Khas | Konfigurasi untuk kes-kes khas (contoh: OKU, warga emas) | Syarat, kadar, dokumen sokongan |
| JZ-02-05 | Sejarah Kadar | Rekod perubahan kadar mengikut versi | Papar sejarah, rollback |
|  |  |  |  |
| JZ-03 | Formula Pengiraan | Pengurusan formula untuk pengiraan zakat |  |
| JZ-03-01 | Pembina Formula | Membina formula menggunakan komponen tersedia | Komponen: jumlah, tolak, darab, bahagi |
| JZ-03-02 | Komponen Formula | Mengurus komponen yang boleh digunakan dalam formula | Pendapatan, potongan, nisab, haul |
| JZ-03-03 | Pengujian Formula | Menguji formula dengan data sampel | Input ujian, kira, semak hasil |
| JZ-03-04 | Formula Lalai | Menetapkan formula lalai untuk jenis zakat | Pilih formula utama |
| JZ-03-05 | Versi Formula | Pengurusan versi formula | Simpan versi, rollback |
|  |  |  |  |
| JZ-04 | Nisab & Haul | Pengurusan nisab dan haul untuk zakat |  |
| JZ-04-01 | Penetapan Nisab | Menetapkan nilai nisab semasa | Nilai nisab, sumber rujukan |
| JZ-04-02 | Kemaskini Nisab Berkala | Kemaskini nisab mengikut harga semasa (emas/perak) | Integrasi API harga, kemaskini manual |
| JZ-04-03 | Penetapan Haul | Menetapkan tempoh haul | Bilangan bulan/hari, syarat |
| JZ-04-04 | Sejarah Nisab | Rekod perubahan nisab mengikut masa | Papar carta trend, sejarah |
|  |  |  |  |
| JZ-05 | Channel Pembayaran | Pengurusan channel pembayaran zakat |  |
| JZ-05-01 | Daftar Channel | Menambah channel pembayaran baharu | Kod channel, nama, penerangan |
| JZ-05-02 | Konfigurasi Channel | Menetapkan parameter untuk setiap channel | Caj, had minima/maksima, waktu operasi |
| JZ-05-03 | Pemetaan Jenis Zakat | Menentukan channel yang tersedia untuk setiap jenis zakat | Pilih channel, tetapkan keutamaan |
| JZ-05-04 | Status Channel | Mengaktifkan/menyahaktifkan channel | Tukar status, kesan ke pembayaran |
| JZ-05-05 | Waktu Operasi | Menetapkan jadual operasi channel | Hari, masa, cuti umum |
|  |  |  |  |
| JZ-06 | Mapping Akaun | Pemetaan ke akaun perakaunan dan bank |  |
| JZ-06-01 | Mapping Akaun GL | Memetakan jenis zakat ke akaun GL | Pilih jenis zakat, pilih akaun GL |
| JZ-06-02 | Mapping Akaun Bank | Memetakan channel ke akaun bank penerima | Pilih channel, pilih akaun bank |
| JZ-06-03 | Mapping Akaun Hasil | Memetakan jenis zakat ke akaun hasil | Pilih jenis zakat, pilih akaun hasil |
| JZ-06-04 | Mapping Akaun Belum Terima | Memetakan untuk transaksi belum dijelaskan | Pilih jenis, pilih akaun |
| JZ-06-05 | Struktur COA | Paparan struktur carta akaun | Integrasi dengan sistem perakaunan |
|  |  |  |  |
| JZ-07 | Pengurusan Versi & Audit | Pengurusan versi konfigurasi dan audit |  |
| JZ-07-01 | Sejarah Perubahan | Rekod semua perubahan konfigurasi | Log audit, papar perubahan |
| JZ-07-02 | Versi Konfigurasi | Simpan snapshot konfigurasi mengikut versi | Versi, tarikh kuat kuasa, status |
| JZ-07-03 | Rollback Konfigurasi | Memulihkan konfigurasi kepada versi lama | Pilih versi, sahkan rollback |
| JZ-07-04 | Pengesahan Perubahan | Aliran kerja untuk pengesahan perubahan | Hantar untuk sah, lulus, tolak |
| JZ-07-05 | Laporan Konfigurasi | Laporan berkaitan konfigurasi | Laporan lengkap, ringkasan perubahan |


| Medan | Jenis Data | Panjang | Wajib | Validasi/Rules |
| --- | --- | --- | --- | --- |
| Jenis Zakat |  |  |  |  |
| Kod Jenis Zakat | Text | 20 | Ya | Unik, format: [A-Z]{3}-[0-9]{2} |
| Nama Jenis Zakat (BM) | Text | 100 | Ya | - |
| Nama Jenis Zakat (BI) | Text | 100 | Tidak | - |
| Penerangan | Text | 500 | Tidak | - |
| Kategori | Dropdown | - | Ya | Pilih dari kategori induk |
| Ada Nisab | Boolean | - | Ya | Ya/Tidak |
| Ada Haul | Boolean | - | Ya | Ya/Tidak |
| Boleh Potongan | Boolean | - | Ya | Ya/Tidak |
| Perlu Pengiraan Kompleks | Boolean | - | Ya | Ya/Tidak |
| Status | Dropdown | - | Ya | DRAFT'/'ACTIVE'/'INACTIVE' |
| Tarikh Mula Aktif | Date | - | Jika berkala | Format DD/MM/YYYY |
| Tarikh Akhir Aktif | Date | - | Jika berkala | Format DD/MM/YYYY |
|  |  |  |  |  |
| Kadar Zakat |  |  |  |  |
| Jenis Kadar | Dropdown | - | Ya | FIXED'/'PERCENTAGE'/'TIERED'/'FORMULA' |
| Nilai Tetap | Decimal | 10,2 | Jika jenis FIXED | > 0 |
| Nilai Peratusan | Decimal | 5,2 | Jika jenis PERCENTAGE | 0-100 |
| Tier | JSON | - | Jika jenis TIERED | Tier tidak bertindih |
| Formula | Text | 1000 | Jika jenis FORMULA | Format yang boleh diparse |
| Tarikh Kuat Kuasa | Date | - | Ya | Format DD/MM/YYYY |
| Tarikh Luput | Date | - | Tidak | Format DD/MM/YYYY, > Tarikh Kuat Kuasa |
|  |  |  |  |  |
| Nisab |  |  |  |  |
| Nilai Nisab | Decimal | 12,2 | Ya | > 0 |
| Unit | Dropdown | - | Ya | RM'/'GRAM'/'LAIN' |
| Sumber Rujukan | Text | 200 | Tidak | - |
| Tarikh Kuat Kuasa | Date | - | Ya | Format DD/MM/YYYY |
|  |  |  |  |  |
| Channel Pembayaran |  |  |  |  |
| Kod Channel | Text | 20 | Ya | Unik |
| Nama Channel | Text | 50 | Ya | - |
| Caj Perkhidmatan | Decimal | 10,2 | Tidak | 0 jika tiada |
| Had Minimum | Decimal | 12,2 | Tidak | - |
| Had Maksimum | Decimal | 12,2 | Tidak | - |
| Waktu Operasi | JSON | - | Tidak | Format jadual |
| Status | Boolean | - | Ya | Aktif/Tidak |
|  |  |  |  |  |
| Mapping Akaun |  |  |  |  |
| Jenis Zakat | Dropdown | - | Ya | Pilih dari jenis zakat aktif |
| Channel | Dropdown | - | Ya | Pilih dari channel aktif |
| Akaun Debit | Dropdown | - | Ya | Pilih dari COA (jenis Aset) |
| Akaun Kredit | Dropdown | - | Ya | Pilih dari COA (jenis Hasil/Liabiliti) |
| Tahun Kewangan | Integer | 4 | Ya | YYYY |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| type_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| type_code | VARCHAR | 20 | NO | - | Kod unik jenis zakat (contoh: PDP-01) |
| type_name_my | VARCHAR | 100 | NO | - | Nama dalam Bahasa Malaysia |
| type_name_en | VARCHAR | 100 | YES | - | Nama dalam Bahasa Inggeris |
| description | TEXT | - | YES | - | Penerangan ringkas |
| category_id | UUID | - | YES | - | Foreign Key ke ZAKAT_CATEGORY |
| has_nisab | BOOLEAN | - | NO | 0 | Ada syarat nisab? |
| has_haul | BOOLEAN | - | NO | 0 | Ada syarat haul? |
| allow_deduction | BOOLEAN | - | NO | 0 | Boleh potong (contoh: KWSP)? |
| complex_calculation | BOOLEAN | - | NO | 0 | Pengiraan kompleks? |
| status | VARCHAR | 20 | NO | DRAFT' | DRAFT'/'ACTIVE'/'INACTIVE' |
| effective_start_date | DATE | - | YES | - | Tarikh mula aktif (jika musiman) |
| effective_end_date | DATE | - | YES | - | Tarikh akhir aktif |
| version | INTEGER | - | NO | 1 | Versi semasa |
| created_by | VARCHAR | 50 | NO | - | User ID pencipta |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |
| modified_by | VARCHAR | 50 | YES | - | User ID pengemaskini |
| modified_date | TIMESTAMP | - | YES | - | Tarikh kemaskini |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| category_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| category_code | VARCHAR | 20 | NO | - | Kod kategori (FITRAH, PENDAPATAN, DLL) |
| category_name_my | VARCHAR | 100 | NO | - | Nama kategori BM |
| category_name_en | VARCHAR | 100 | YES | - | Nama kategori BI |
| parent_category_id | UUID | - | YES | - | Kategori induk (untuk hierarki) |
| display_order | INTEGER | - | NO | 0 | Turutan paparan |
| is_active | BOOLEAN | - | NO | 1 | Status aktif |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| rate_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| type_id | UUID | - | NO | - | Foreign Key ke ZAKAT_TYPE |
| rate_type | VARCHAR | 20 | NO | - | FIXED'/'PERCENTAGE'/'TIERED'/'FORMULA' |
| rate_value_fixed | DECIMAL | 12,2 | YES | - | Nilai jika kadar tetap (RM) |
| rate_value_percentage | DECIMAL | 5,2 | YES | - | Nilai jika kadar peratusan |
| rate_tiers | TEXT | - | YES | - | JSON untuk kadar berperingkat |
| formula_id | UUID | - | YES | - | Foreign Key ke FORMULA |
| effective_date | DATE | - | NO | - | Tarikh kuat kuasa |
| expiry_date | DATE | - | YES | - | Tarikh luput (jika ada) |
| is_current | BOOLEAN | - | NO | 1 | Kadar semasa? |
| version | INTEGER | - | NO | 1 | Versi kadar |
| approved_by | VARCHAR | 50 | YES | - | Diluluskan oleh |
| approved_date | TIMESTAMP | - | YES | - | Tarikh lulus |
| created_by | VARCHAR | 50 | NO | - | User ID pencipta |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| formula_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| formula_name | VARCHAR | 100 | NO | - | Nama formula |
| formula_expression | TEXT | - | NO | - | Expression (contoh: (income - deduction) * 0.025) |
| formula_components | TEXT | - | YES | - | JSON: komponen yang digunakan |
| description | TEXT | - | YES | - | Penerangan |
| is_active | BOOLEAN | - | NO | 1 | Status aktif |
| is_default | BOOLEAN | - | NO | 0 | Formula lalai? |
| version | INTEGER | - | NO | 1 | Versi formula |
| created_by | VARCHAR | 50 | NO | - | User ID pencipta |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |
| modified_by | VARCHAR | 50 | YES | - | User ID pengemaskini |
| modified_date | TIMESTAMP | - | YES | - | Tarikh kemaskini |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| nisab_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| nisab_type | VARCHAR | 20 | NO | - | EMAS'/'PERAK'/'WANG'/'LAIN' |
| nisab_value | DECIMAL | 12,2 | NO | - | Nilai nisab |
| unit | VARCHAR | 20 | NO | - | RM'/'GRAM'/'OUNS' |
| reference_source | VARCHAR | 200 | YES | - | Sumber rujukan |
| effective_date | DATE | - | NO | - | Tarikh kuat kuasa |
| expiry_date | DATE | - | YES | - | Tarikh luput |
| is_current | BOOLEAN | - | NO | 1 | Nisab semasa? |
| created_by | VARCHAR | 50 | NO | - | User ID pencipta |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| channel_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| channel_code | VARCHAR | 20 | NO | - | Kod channel (FPX, COUNTER, SPG, dll) |
| channel_name | VARCHAR | 50 | NO | - | Nama channel |
| channel_type | VARCHAR | 30 | NO | - | ONLINE'/'COUNTER'/'BULK'/'AUTO' |
| description | TEXT | - | YES | - | Penerangan |
| service_charge | DECIMAL | 10,2 | NO | 0 | Caj perkhidmatan (RM) |
| min_amount | DECIMAL | 12,2 | YES | - | Had minimum transaksi |
| max_amount | DECIMAL | 12,2 | YES | - | Had maksimum transaksi |
| operating_hours | TEXT | - | YES | - | JSON: waktu operasi |
| is_active | BOOLEAN | - | NO | 1 | Status aktif |
| display_order | INTEGER | - | NO | 0 | Turutan paparan |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |
| modified_date | TIMESTAMP | - | YES | - | Tarikh kemaskini |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| mapping_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| type_id | UUID | - | NO | - | Foreign Key ke ZAKAT_TYPE |
| channel_id | UUID | - | NO | - | Foreign Key ke PAYMENT_CHANNEL |
| priority | INTEGER | - | NO | 1 | Keutamaan channel |
| is_active | BOOLEAN | - | NO | 1 | Status aktif |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| account_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| account_code | VARCHAR | 20 | NO | - | Kod akaun (contoh: 101-001) |
| account_name | VARCHAR | 100 | NO | - | Nama akaun |
| account_type | VARCHAR | 30 | NO | - | ASSET'/'LIABILITY'/'INCOME'/'EXPENSE' |
| parent_account_id | UUID | - | YES | - | Akaun induk |
| is_active | BOOLEAN | - | NO | 1 | Status aktif |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| bank_account_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| bank_code | VARCHAR | 10 | NO | - | Kod bank |
| bank_name | VARCHAR | 100 | NO | - | Nama bank |
| account_no | VARCHAR | 30 | NO | - | No akaun bank |
| account_name | VARCHAR | 100 | NO | - | Nama pemilik akaun |
| gl_account_id | UUID | - | YES | - | Foreign Key ke GL_ACCOUNT |
| is_active | BOOLEAN | - | NO | 1 | Status aktif |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| mapping_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| type_id | UUID | - | NO | - | Foreign Key ke ZAKAT_TYPE |
| channel_id | UUID | - | YES | - | Foreign Key ke PAYMENT_CHANNEL (null untuk semua) |
| debit_account_id | UUID | - | NO | - | Foreign Key ke GL_ACCOUNT (akaun debit) |
| credit_account_id | UUID | - | NO | - | Foreign Key ke GL_ACCOUNT (akaun kredit) |
| bank_account_id | UUID | - | YES | - | Foreign Key ke BANK_ACCOUNT |
| fiscal_year | INTEGER | - | NO | - | Tahun kewangan |
| is_active | BOOLEAN | - | NO | 1 | Status aktif |
| created_by | VARCHAR | 50 | NO | - | User ID pencipta |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |
| modified_by | VARCHAR | 50 | YES | - | User ID pengemaskini |
| modified_date | TIMESTAMP | - | YES | - | Tarikh kemaskini |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| version_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| entity_type | VARCHAR | 30 | NO | - | ZAKAT_TYPE'/'RATE'/'FORMULA'/'NISAB' |
| entity_id | UUID | - | NO | - | ID entiti |
| version_number | INTEGER | - | NO | - | Nombor versi |
| snapshot_data | TEXT | - | NO | - | JSON: snapshot data |
| effective_date | DATE | - | NO | - | Tarikh kuat kuasa versi |
| expiry_date | DATE | - | YES | - | Tarikh luput versi |
| is_current | BOOLEAN | - | NO | 0 | Versi semasa? |
| created_by | VARCHAR | 50 | NO | - | User ID pencipta |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |
| approved_by | VARCHAR | 50 | YES | - | Diluluskan oleh |
| approved_date | TIMESTAMP | - | YES | - | Tarikh lulus |
| change_reason | TEXT | - | YES | - | Sebab perubahan |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| audit_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| entity_type | VARCHAR | 30 | NO | - | Jenis entiti |
| entity_id | UUID | - | YES | - | ID entiti |
| action_type | VARCHAR | 20 | NO | - | CREATE'/'UPDATE'/'DELETE'/'ACTIVATE' |
| field_name | VARCHAR | 50 | YES | - | Medan diubah |
| old_value | TEXT | - | YES | - | Nilai lama |
| new_value | TEXT | - | YES | - | Nilai baru |
| changed_by | VARCHAR | 50 | NO | - | User ID |
| changed_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh ubah |
| ip_address | VARCHAR | 20 | YES | - | Alamat IP |
| session_id | VARCHAR | 100 | YES | - | ID session |


| Role ID | Role Name | Penerangan |
| --- | --- | --- |
| R01 | Pentadbir Sistem | Akses penuh ke semua fungsi konfigurasi |
| R02 | Pengurus Operasi | Mengurus konfigurasi operasi harian |
| R03 | Pegawai Syariah | Menentukan jenis zakat, kadar, formula mengikut syariah |
| R04 | Pegawai Kewangan | Mengurus mapping akaun dan pelaporan kewangan |
| R05 | Penyelia | Menyemak dan meluluskan perubahan |
| R06 | Juruaudit | Akses view sahaja untuk tujuan audit |
| R07 | Eksekutif Kaunter | Akses view sahaja untuk rujukan kadar |
| R08 | Pembayar | Akses view untuk kiraan zakat |


| Fungsi / Sub-Modul | R01 | R02 | R03 | R04 | R05 | R06 | R07 | R08 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Jenis Zakat |  |  |  |  |  |  |  |  |
| Lihat Senarai | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tambah Jenis Zakat | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Kemaskini Jenis Zakat | ✓ | ✓ | ✓ | ✗ | ✓* | ✗ | ✗ | ✗ |
| Aktif/Nyahaktif | ✓ | ✓ | ✓ | ✗ | ✓* | ✗ | ✗ | ✗ |
|  |  |  |  |  |  |  |  |  |
| Kadar & Formula |  |  |  |  |  |  |  |  |
| Lihat Kadar | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Konfigurasi Kadar Tetap | ✓ | ✓ | ✓ | ✗ | ✓* | ✗ | ✗ | ✗ |
| Konfigurasi Kadar Peratusan | ✓ | ✓ | ✓ | ✗ | ✓* | ✗ | ✗ | ✗ |
| Konfigurasi Kadar Berperingkat | ✓ | ✓ | ✓ | ✗ | ✓* | ✗ | ✗ | ✗ |
| Konfigurasi Formula | ✓ | ✗ | ✓ | ✗ | ✓* | ✗ | ✗ | ✗ |
| Uji Formula | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
|  |  |  |  |  |  |  |  |  |
| Nisab & Haul |  |  |  |  |  |  |  |  |
| Lihat Nisab | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Kemaskini Nisab | ✓ | ✓ | ✓ | ✗ | ✓* | ✗ | ✗ | ✗ |
| Sejarah Nisab | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
|  |  |  |  |  |  |  |  |  |
| Channel Pembayaran |  |  |  |  |  |  |  |  |
| Lihat Channel | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tambah Channel | ✓ | ✓ | ✗ | ✓ | ✓* | ✗ | ✗ | ✗ |
| Konfigurasi Channel | ✓ | ✓ | ✗ | ✓ | ✓* | ✗ | ✗ | ✗ |
| Pemetaan Jenis-Channel | ✓ | ✓ | ✓ | ✗ | ✓* | ✗ | ✗ | ✗ |
|  |  |  |  |  |  |  |  |  |
| Mapping Akaun |  |  |  |  |  |  |  |  |
| Lihat Mapping Akaun | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Mapping Akaun GL | ✓ | ✓ | ✗ | ✓ | ✓* | ✗ | ✗ | ✗ |
| Mapping Akaun Bank | ✓ | ✓ | ✗ | ✓ | ✓* | ✗ | ✗ | ✗ |
|  |  |  |  |  |  |  |  |  |
| Versi & Audit |  |  |  |  |  |  |  |  |
| Lihat Sejarah Perubahan | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Rollback Konfigurasi | ✓ | ✓ | ✓ | ✓ | ✓* | ✗ | ✗ | ✗ |
| Laporan Konfigurasi | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
|  |  |  |  |  |  |  |  |  |
| Pengiraan Zakat |  |  |  |  |  |  |  |  |
| Kira Zakat (Front-end) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |


| Rule ID | Peraturan | Penerangan | Kesan Jika Dilanggar |
| --- | --- | --- | --- |
| BR-ZT-01 | Kod Unik | Kod jenis zakat mestilah unik dalam sistem | Tidak boleh simpan |
| BR-ZT-02 | Tempoh Aktif | Jika tarikh aktif ditetapkan, transaksi hanya boleh dibuat dalam tempoh tersebut | Transaksi ditolak di luar tempoh |
| BR-ZT-03 | Status DRAFT | Jenis zakat status DRAFT tidak boleh digunakan untuk transaksi | Tidak muncul dalam senarai pembayaran |
| BR-ZT-04 | Syarat Kelayakan | Jika ada nisab, sistem mesti semak sebelum kiraan | Pengiraan tidak lengkap |
| BR-ZT-05 | Kategori Induk | Kategori boleh mempunyai hierarki (parent-child) | Paparan mengikut hirarki |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-RT-01 | Kadar Aktif | Hanya satu kadar aktif untuk satu jenis zakat pada satu masa |
| BR-RT-02 | Tier Tidak Bertindih | Untuk kadar berperingkat, julat tier tidak boleh bertindih |
| BR-RT-03 | Tier Berterusan | Tier mesti meliputi semua nilai dari 0 hingga infinity (tiada gap) |
| BR-RT-04 | Tarikh Kuat Kuasa | Tarikh kuat kuasa kadar mesti pada atau selepas tarikh semasa |
| BR-RT-05 | Pengiraan Formula | Formula mesti boleh diparse dan menghasilkan nilai numerik |
| BR-RT-06 | Komponen Sah | Komponen formula mestilah daripada senarai komponen yang sah |
| BR-RT-07 | Semakan Nisab | Jika hasil pengiraan kurang dari nisab, zakat = 0 |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-NB-01 | Nisab Semasa | Hanya satu nisab semasa untuk satu jenis nisab |
| BR-NB-02 | Kemaskini Berkala | Nisab emas hendaklah dikemaskini mengikut harga semasa (minimum bulanan) |
| BR-NB-03 | Sumber Rujukan | Perubahan nisab mesti mempunyai sumber rujukan |
| BR-NB-04 | Haul Genap | Haul dikira genap 12 bulan qamariah (354 hari) |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-CH-01 | Channel Aktif | Transaksi hanya boleh menggunakan channel yang aktif |
| BR-CH-02 | Had Transaksi | Amaun transaksi mesti dalam had min/max channel |
| BR-CH-03 | Waktu Operasi | Transaksi hanya boleh dibuat dalam waktu operasi channel (jika ditetapkan) |
| BR-CH-04 | Caj Perkhidmatan | Caj perkhidmatan akan ditambah ke amaun transaksi |
| BR-CH-05 | Ketersediaan Jenis | Sesuatu jenis zakat hanya boleh dibayar melalui channel yang dipetakan |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-AC-01 | Akaun Sah | Akaun debit dan kredit mesti wujud dan aktif dalam COA |
| BR-AC-02 | Jenis Akaun | Akaun debit mestilah jenis 'ASSET', akaun kredit mestilah 'INCOME'/'LIABILITY' |
| BR-AC-03 | Mapping Lengkap | Setiap kombinasi jenis zakat + channel mesti mempunyai mapping akaun |
| BR-AC-04 | Tahun Kewangan | Mapping mengikut tahun kewangan, default tahun semasa |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-VR-01 | Versi Auto | Setiap perubahan konfigurasi akan menghasilkan versi baru |
| BR-VR-02 | Pengesahan Perubahan | Perubahan kritikal (kadar, formula) perlu pengesahan penyelia |
| BR-VR-03 | Rollback | Rollback hanya boleh dilakukan oleh pentadbir dengan sebab |
| BR-VR-04 | Audit Wajib | Semua perubahan konfigurasi direkod dalam audit log |


| Objektif | Fungsi Keperluan Berkaitan |
| --- | --- |
| OBJ-01: Platform konfigurasi pusat | FR-01, FR-02 |
| OBJ-02: Penetapan kadar fleksibel | FR-05, FR-06, FR-07 |
| OBJ-03: Formula pengiraan | FR-08, FR-11 |
| OBJ-04: Channel pembayaran | FR-12, FR-13, FR-14, FR-15, FR-16 |
| OBJ-05: Pemetaan akaun | FR-17, FR-18, FR-19, FR-20 |
| OBJ-06: Tempoh aktif | FR-04 |
| OBJ-07: Versi dan sejarah | FR-21, FR-22, FR-23 |
| OBJ-08: Pematuhan syariah | FR-03, FR-09, FR-10 |


| Fungsi Keperluan | Use Case Berkaitan |
| --- | --- |
| FR-01: Konfigurasi Jenis Zakat | UC01, UC02, UC03 |
| FR-02: Konfigurasi Kategori Zakat | UC01 |
| FR-03: Penetapan Syarat Kelayakan | UC06, UC12 |
| FR-04: Pengurusan Tempoh Aktif | UC03 |
| FR-05: Konfigurasi Kadar Tetap | UC04 |
| FR-06: Konfigurasi Kadar Peratusan | UC04 |
| FR-07: Konfigurasi Kadar Berperingkat | UC04 |
| FR-08: Formula Pengiraan | UC05 |
| FR-09: Penetapan Nisab | UC06 |
| FR-10: Penetapan Haul | UC06 |
| FR-11: Pengiraan Automatik | UC11 |
| FR-12: Konfigurasi Channel | UC07 |
| FR-13: Penetapan Channel mengikut Jenis Zakat | UC07 |
| FR-14: Caj Perkhidmatan | UC07 |
| FR-15: Had Minimum/Maksimum | UC07 |
| FR-16: Waktu Operasi Channel | UC07 |
| FR-17: Pemetaan Akaun GL | UC08 |
| FR-18: Pemetaan Akaun Bank | UC09 |
| FR-19: Pemetaan Akaun Hasil | UC08 |
| FR-20: Pemetaan Akaun Belum Terima | UC08 |
| FR-21: Versi Konfigurasi | UC13 |
| FR-22: Sejarah Perubahan | UC13, UC14 |
| FR-23: Pengesahan Perubahan | UC13 |
| FR-24: Tarikh Kuat Kuasa | UC04, UC05 |


| Use Case | Role Dibenarkan |
| --- | --- |
| UC01: Tambah Jenis Zakat | R01, R03 |
| UC02: Kemaskini Jenis Zakat | R01, R02, R03 |
| UC03: Aktif/Nyahaktif Jenis Zakat | R01, R02, R03 |
| UC04: Konfigurasi Kadar Zakat | R01, R02, R03 |
| UC05: Konfigurasi Formula | R01, R03 |
| UC06: Tetapkan Nisab/Haul | R01, R02, R03 |
| UC07: Urus Channel Pembayaran | R01, R02, R04 |
| UC08: Mapping Akaun GL | R01, R04 |
| UC09: Mapping Akaun Bank | R01, R04 |
| UC10: Lihat Senarai Jenis Zakat | Semua role |
| UC11: Kira Zakat | Semua role |
| UC12: Semak Kelayakan Zakat | Semua role |
| UC13: Rollback Konfigurasi | R01, R02, R03, R04 (dengan pengesahan) |
| UC14: Laporan Konfigurasi | R01, R02, R03, R04, R06 |


| POC Document Section | Page | Modul 2 Sub-Modul |
| --- | --- | --- |
| Application Architecture - System Administration | 3 | JZ-01, JZ-02, JZ-03, JZ-04, JZ-05, JZ-06, JZ-07 |
| Processing Solution | 3 | JZ-02, JZ-03 (Formula & kadar) |
| Report, Query and Business Intelligence | 3 | JZ-07 (Laporan konfigurasi) |
| Integration | 4 | JZ-06 (Mapping akaun untuk integrasi perakaunan) |
| Channel Setup | 13 | JZ-05 (Channel pembayaran) |
| Parameter Rules | 13 | JZ-01, JZ-02, JZ-03, JZ-04 |


| Domain | Nilai | Penerangan |
| --- | --- | --- |
| rate_type | FIXED' | Kadar tetap (RM) |
|  | PERCENTAGE' | Kadar peratusan (%) |
|  | TIERED' | Kadar berperingkat |
|  | FORMULA' | Berasaskan formula |
|  |  |  |
| status | DRAFT' | Draf - belum siap |
|  | ACTIVE' | Aktif - boleh digunakan |
|  | INACTIVE' | Tidak aktif |
|  | PENDING_APPROVAL' | Menunggu kelulusan |
|  | REJECTED' | Ditolak |
|  |  |  |
| nisab_type | EMAS' | Nisab emas |
|  | PERAK' | Nisab perak |
|  | WANG' | Nisab wang tunai |
|  | LAIN' | Lain-lain |
|  |  |  |
| channel_type | ONLINE' | Pembayaran online |
|  | COUNTER' | Kaunter fizikal |
|  | BULK' | Pemprosesan pukal |
|  | AUTO' | Potongan automatik |
|  | CHEQUE' | Pembayaran cek |
|  |  |  |
| account_type | ASSET' | Akaun Aset |
|  | LIABILITY' | Akaun Liabiliti |
|  | INCOME' | Akaun Hasil |
|  | EXPENSE' | Akaun Belanja |
|  |  |  |
| entity_type | ZAKAT_TYPE' | Jenis Zakat |
|  | RATE' | Kadar |
|  | FORMULA' | Formula |
|  | NISAB' | Nisab |
|  | CHANNEL' | Channel |
|  | ACCOUNT_MAPPING' | Mapping Akaun |


| Table | Column | Data Type | Length | Penerangan | Sumber Data |
| --- | --- | --- | --- | --- | --- |
| ZAKAT_TYPE | type_id | UUID | - | ID unik jenis zakat | System generated |
|  | type_code | VARCHAR | 20 | Kod jenis zakat | Input form |
|  | type_name_my | VARCHAR | 100 | Nama BM | Input form |
|  | type_name_en | VARCHAR | 100 | Nama BI | Input form |
|  | description | TEXT | - | Penerangan | Input form |
|  | category_id | UUID | - | Kategori induk | From ZAKAT_CATEGORY |
|  | has_nisab | BOOLEAN | - | Ada nisab? | Input form |
|  | has_haul | BOOLEAN | - | Ada haul? | Input form |
|  | allow_deduction | BOOLEAN | - | Boleh potong? | Input form |
|  | complex_calculation | BOOLEAN | - | Pengiraan kompleks? | Input form |
|  | status | VARCHAR | 20 | Status | System/User |
|  | effective_start_date | DATE | - | Tarikh mula aktif | Input form |
|  | effective_end_date | DATE | - | Tarikh akhir aktif | Input form |
|  | version | INTEGER | - | Versi | System |
|  | created_by | VARCHAR | 50 | User ID cipta | Session |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  | modified_by | VARCHAR | 50 | User ID kemaskini | Session |
|  | modified_date | TIMESTAMP | - | Tarikh kemaskini | System |
|  |  |  |  |  |  |
| ZAKAT_RATE | rate_id | UUID | - | ID unik kadar | System |
|  | type_id | UUID | - | FK ke ZAKAT_TYPE | From ZAKAT_TYPE |
|  | rate_type | VARCHAR | 20 | Jenis kadar | Input form |
|  | rate_value_fixed | DECIMAL | 12,2 | Nilai tetap | Input form |
|  | rate_value_percentage | DECIMAL | 5,2 | Nilai peratusan | Input form |
|  | rate_tiers | TEXT | - | JSON tiers | Input form |
|  | formula_id | UUID | - | FK ke FORMULA | From FORMULA |
|  | effective_date | DATE | - | Tarikh kuat kuasa | Input form |
|  | expiry_date | DATE | - | Tarikh luput | Input form |
|  | is_current | BOOLEAN | - | Kadar semasa? | System |
|  | version | INTEGER | - | Versi | System |
|  | approved_by | VARCHAR | 50 | Diluluskan oleh | Session |
|  | approved_date | TIMESTAMP | - | Tarikh lulus | System |
|  | created_by | VARCHAR | 50 | User ID cipta | Session |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  |  |  |  |  |  |
| FORMULA | formula_id | UUID | - | ID unik formula | System |
|  | formula_name | VARCHAR | 100 | Nama formula | Input form |
|  | formula_expression | TEXT | - | Expression | Input form |
|  | formula_components | TEXT | - | JSON komponen | System/Input |
|  | description | TEXT | - | Penerangan | Input form |
|  | is_active | BOOLEAN | - | Status aktif | Input form |
|  | is_default | BOOLEAN | - | Formula lalai? | Input form |
|  | version | INTEGER | - | Versi | System |
|  | created_by | VARCHAR | 50 | User ID cipta | Session |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  | modified_by | VARCHAR | 50 | User ID kemaskini | Session |
|  | modified_date | TIMESTAMP | - | Tarikh kemaskini | System |
|  |  |  |  |  |  |
| NISAB | nisab_id | UUID | - | ID unik nisab | System |
|  | nisab_type | VARCHAR | 20 | Jenis nisab | Input form |
|  | nisab_value | DECIMAL | 12,2 | Nilai nisab | Input form |
|  | unit | VARCHAR | 20 | Unit | Input form |
|  | reference_source | VARCHAR | 200 | Sumber rujukan | Input form |
|  | effective_date | DATE | - | Tarikh kuat kuasa | Input form |
|  | expiry_date | DATE | - | Tarikh luput | Input form |
|  | is_current | BOOLEAN | - | Nisab semasa? | System |
|  | created_by | VARCHAR | 50 | User ID cipta | Session |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  |  |  |  |  |  |
| PAYMENT_CHANNEL | channel_id | UUID | - | ID unik channel | System |
|  | channel_code | VARCHAR | 20 | Kod channel | Input form |
|  | channel_name | VARCHAR | 50 | Nama channel | Input form |
|  | channel_type | VARCHAR | 30 | Jenis channel | Input form |
|  | description | TEXT | - | Penerangan | Input form |
|  | service_charge | DECIMAL | 10,2 | Caj perkhidmatan | Input form |
|  | min_amount | DECIMAL | 12,2 | Had minimum | Input form |
|  | max_amount | DECIMAL | 12,2 | Had maksimum | Input form |
|  | operating_hours | TEXT | - | JSON waktu operasi | Input form |
|  | is_active | BOOLEAN | - | Status aktif | Input form |
|  | display_order | INTEGER | - | Turutan paparan | Input form |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  | modified_date | TIMESTAMP | - | Tarikh kemaskini | System |
|  |  |  |  |  |  |
| GL_ACCOUNT | account_id | UUID | - | ID unik akaun | System |
|  | account_code | VARCHAR | 20 | Kod akaun | From COA |
|  | account_name | VARCHAR | 100 | Nama akaun | From COA |
|  | account_type | VARCHAR | 30 | Jenis akaun | From COA |
|  | parent_account_id | UUID | - | Akaun induk | From COA |
|  | is_active | BOOLEAN | - | Status aktif | From COA |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  |  |  |  |  |  |
| ACCOUNT_MAPPING | mapping_id | UUID | - | ID unik mapping | System |
|  | type_id | UUID | - | FK ke ZAKAT_TYPE | From ZAKAT_TYPE |
|  | channel_id | UUID | - | FK ke PAYMENT_CHANNEL | From PAYMENT_CHANNEL |
|  | debit_account_id | UUID | - | FK ke GL_ACCOUNT | From GL_ACCOUNT |
|  | credit_account_id | UUID | - | FK ke GL_ACCOUNT | From GL_ACCOUNT |
|  | bank_account_id | UUID | - | FK ke BANK_ACCOUNT | From BANK_ACCOUNT |
|  | fiscal_year | INTEGER | - | Tahun kewangan | Input form |
|  | is_active | BOOLEAN | - | Status aktif | Input form |
|  | created_by | VARCHAR | 50 | User ID cipta | Session |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  | modified_by | VARCHAR | 50 | User ID kemaskini | Session |
|  | modified_date | TIMESTAMP | - | Tarikh kemaskini | System |
|  |  |  |  |  |  |
| CONFIG_VERSION | version_id | UUID | - | ID unik versi | System |
|  | entity_type | VARCHAR | 30 | Jenis entiti | System |
|  | entity_id | UUID | - | ID entiti | System |
|  | version_number | INTEGER | - | Nombor versi | System |
|  | snapshot_data | TEXT | - | Snapshot JSON | System |
|  | effective_date | DATE | - | Tarikh kuat kuasa | Input form |
|  | expiry_date | DATE | - | Tarikh luput | Input form |
|  | is_current | BOOLEAN | - | Versi semasa? | System |
|  | created_by | VARCHAR | 50 | User ID cipta | Session |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  | approved_by | VARCHAR | 50 | Diluluskan oleh | Session |
|  | approved_date | TIMESTAMP | - | Tarikh lulus | System |
|  | change_reason | TEXT | - | Sebab perubahan | Input form |
|  |  |  |  |  |  |
| CONFIG_AUDIT_LOG | audit_id | UUID | - | ID unik audit | System |
|  | entity_type | VARCHAR | 30 | Jenis entiti | System |
|  | entity_id | UUID | - | ID entiti | System |
|  | action_type | VARCHAR | 20 | Jenis tindakan | System |
|  | field_name | VARCHAR | 50 | Medan diubah | System |
|  | old_value | TEXT | - | Nilai lama | System |
|  | new_value | TEXT | - | Nilai baru | System |
|  | changed_by | VARCHAR | 50 | User ID | Session |
|  | changed_date | TIMESTAMP | - | Tarikh ubah | System |
|  | ip_address | VARCHAR | 20 | Alamat IP | Request |
|  | session_id | VARCHAR | 100 | ID session | Session |


| AC ID | Kriteria | Kaedah Ujian | Keputusan Jangkaan |
| --- | --- | --- | --- |
| AC-01 | Pentadbir boleh menambah jenis zakat baharu dengan semua maklumat asas | Ujian fungsian: Isi borang lengkap, klik simpan | Jenis zakat berjaya disimpan, muncul dalam senarai |
| AC-02 | Sistem menolak kod jenis zakat yang sama | Ujian negatif: Cuba simpan dengan kod yang telah wujud | Sistem papar error "Kod telah wujud" |
| AC-03 | Pegawai syariah boleh mengkonfigurasi kadar tetap (RM) untuk sesuatu jenis zakat | Ujian konfigurasi: Tetapkan kadar tetap RM10, simpan | Kadar disimpan, sistem kira RM10 untuk transaksi |
| AC-04 | Pegawai syariah boleh mengkonfigurasi kadar peratusan (%) untuk sesuatu jenis zakat | Ujian konfigurasi: Tetapkan kadar 2.5%, simpan | Kadar disimpan, sistem kira 2.5% dari jumlah |
| AC-05 | Pegawai syariah boleh mengkonfigurasi kadar berperingkat (tiered) dengan pelbagai tier | Ujian konfigurasi: Tambah 3 tier berbeza, simpan | Kadar disimpan, sistem guna tier mengikut nilai |
| AC-06 | Pegawai syariah boleh membina formula menggunakan komponen yang disediakan | Ujian formula: Bina formula (Pendapatan - Potongan) x 2.5% | Formula disimpan, boleh diuji dengan data sampel |
| AC-07 | Pegawai kewangan boleh memetakan jenis zakat ke akaun GL | Ujian mapping: Pilih jenis zakat, pilih akaun debit/kredit, simpan | Mapping disimpan, transaksi akan guna akaun ini |
| AC-08 | Sistem mengira zakat dengan betul berdasarkan kadar/formula yang ditetapkan | Ujian pengiraan: Masukkan nilai ujian, banding dengan pengiraan manual | Hasil pengiraan sistem sama dengan manual |
| AC-09 | Sistem menyemak nisab dan memaklumkan jika tidak mencapai nisab | Ujian nisab: Masukkan nilai di bawah nisab | Sistem papar mesej "Tidak mencapai nisab" |
| AC-10 | Sistem menyimpan sejarah perubahan konfigurasi | Ujian audit: Buat beberapa perubahan, semak log | Setiap perubahan direkod dengan nilai lama/baru |


| AC ID | Kriteria | Kaedah Ujian | Keputusan Jangkaan |
| --- | --- | --- | --- |
| AC-T01 | Enjin formula boleh memproses 1000 pengiraan sesaat | Ujian beban: Jalankan 1000 pengiraan serentak | Masa tindak balas < 1 saat untuk semua |
| AC-T02 | Sistem menyokong sekurang-kurangnya 50 jenis zakat aktif serentak | Ujian kapasiti: Aktifkan 50 jenis zakat | Sistem stabil, prestasi tidak terjejas |
| AC-T03 | Rollback konfigurasi memulihkan data tepat seperti versi dipilih | Ujian rollback: Rollback ke versi lama, banding data | Data sama 100% dengan versi tersebut |
| AC-T04 | Audit log menyimpan data sekurang-kurangnya 7 tahun | Ujian penyimpanan: Semak konfigurasi retention | Data audit masih lengkap |
| AC-T05 | Sistem menyokong pelbagai jenis formula (linear, bersyarat, dll) | Ujian formula: Uji pelbagai jenis expression | Formula dapat diproses dengan betul |


| AC ID | Kriteria | Kaedah Ujian | Keputusan Jangkaan |
| --- | --- | --- | --- |
| AC-U01 | Antaramuka konfigurasi mudah difahami dan digunakan | Ujian kebolehgunaan: Pengguna baru cuba konfigurasi | Pengguna berjaya tanpa latihan meluas |
| AC-U02 | Pengguna menerima mesej ralat yang jelas dan membantu | Ujian ralat: Buat kesilapan, baca mesej | Mesej menerangkan masalah dan cara betulkan |
| AC-U03 | Pengguna boleh menguji formula sebelum menyimpan | Ujian formula: Bina formula, klik "Uji" | Sistem papar hasil ujian dengan data contoh |
| AC-U04 | Pengguna boleh melihat sejarah perubahan dengan mudah | Ujian sejarah: Buka sejarah versi | Paparan kronologi, boleh banding versi |


| Id | Objektif |
| --- | --- |
| OBJ-01 | Menyediakan mekanisme penerimaan pembayaran zakat melalui pelbagai channel (kaunter, online, cek, potongan gaji) |
| OBJ-02 | Memastikan setiap transaksi melalui proses validasi yang ketat untuk mengelakkan ralat dan penipuan |
| OBJ-03 | Melaksanakan kawalan idempotency untuk mengelakkan transaksi berganda (duplicate payment) |
| OBJ-04 | Menyokong pemprosesan pembayaran secara manual, online, dan berjadual |
| OBJ-05 | Menjana resit pembayaran yang sah dan mematuhi keperluan LZS |
| OBJ-06 | Membolehkan pelarasan dan pembalikan transaksi (reversal/adjustment) mengikut prosedur yang ditetapkan |
| OBJ-07 | Menyediakan pengurusan status transaksi secara实时 (success, failed, pending, refunded) |
| OBJ-08 | Mengekalkan rekod audit lengkap bagi semua transaksi untuk tujuan pematuhan dan pengauditan |
| OBJ-09 | Menyokong pengurusan transaksi cek termasuk penangguhan, pengesahan, dan pembatalan |
| OBJ-10 | Menyediakan antara muka yang mesra pengguna untuk eksekutif kaunter memproses transaksi dengan pantas |


| Perkara | Skop |
| --- | --- |
| Entiti Utama | Transaksi Pembayaran, Butiran Transaksi, Resit, Pelarasan, Pembalikan |
| Jenis Transaksi | Pembayaran Manual (Kaunter), Pembayaran Online (FPX/PSP), Cek, Pembayaran Berjadual, Potongan Gaji (SPG) |
| Kaedah Pembayaran | Tunai, Kad Kredit/Debit, FPX, Transfer Bank, Cek, Potongan Automatik |
| Proses Utama | Initiasi Transaksi, Validasi, Pemprosesan, Pengesahan, Penjanaan Resit, Pelarasan, Pembalikan |
| Status Transaksi | PENDING, PROCESSING, SUCCESS, FAILED, REVERSED, ADJUSTED, REFUNDED, VOID |
| Integrasi | Modul 1 (Profil Pembayar), Modul 2 (Jenis Zakat), Modul 4 (Payment Engine), Modul 7 (FPX/Bank), Modul 8 (Reconciliation), Modul 12 (Audit Trail) |
| Output | Resit Pembayaran (Cetak/PDF/Emel), Slip Transaksi, Laporan Transaksi Harian, Data untuk Reconciliation |
| Had Skop | Tidak meliputi pengurusan profil pembayar (Modul 1), konfigurasi jenis zakat (Modul 2), pemprosesan pukal (Modul 5), pelaporan analitik (Modul 9) |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-01 | Initiasi Transaksi Kaunter | Memulakan transaksi pembayaran di kaunter dengan memilih pembayar dan jenis zakat | Tinggi |
| FR-02 | Pengiraan Amaun | Mengira amaun zakat berdasarkan jenis zakat dan input (auto dari Modul 2) | Tinggi |
| FR-03 | Pembayaran Tunai | Memproses pembayaran tunai, terima jumlah, kira baki | Tinggi |
| FR-04 | Pembayaran Kad Debit/Kredit | Memproses pembayaran melalui terminal kad (integrasi dengan payment terminal) | Tinggi |
| FR-05 | Pembayaran Pelbagai Jenis Zakat | Membolehkan pembayaran lebih daripada satu jenis zakat dalam satu transaksi | Sederhana |
| FR-06 | Pengesahan Transaksi | Mengesahkan transaksi selepas pembayaran berjaya | Tinggi |
| FR-07 | Penjanaan Resit Kaunter | Menjana resit untuk transaksi kaunter | Tinggi |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-08 | Initiasi Pembayaran Online | Menjana permintaan pembayaran ke FPX/PSP | Tinggi |
| FR-09 | Redirect ke Payment Gateway | Mengarahkan pengguna ke laman bank untuk pengesahan | Tinggi |
| FR-10 | Terima Response Callback | Menerima response dari FPX/PSP selepas pembayaran | Tinggi |
| FR-11 | Validasi Tandatangan Digital | Mengesahkan integriti data callback menggunakan tandatangan digital | Tinggi |
| FR-12 | Kemaskini Status Transaksi | Mengemaskini status transaksi berdasarkan response | Tinggi |
| FR-13 | Penjanaan Resit Online | Menjana dan menghantar resit melalui emel/SMS | Tinggi |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-14 | Pendaftaran Cek | Mendaftar maklumat cek (no cek, bank, tarikh, amaun) | Tinggi |
| FR-15 | Status Cek | Mengurus status cek (TERIMA, CLEAR, BOUNCE, BATAL) | Tinggi |
| FR-16 | Pengesahan Cek | Mengesahkan cek selepas jelas (clear) | Tinggi |
| FR-17 | Pengurusan Cek Bounce | Mengurus cek tak layan (bounce) termasuk notifikasi dan tindakan susulan | Tinggi |
| FR-18 | Pembatalan Cek | Membatalkan cek yang belum diproses | Sederhana |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-19 | Pendaftaran Jadual Bayaran | Mendaftar pelan pembayaran berjadual (bulanan, suku tahun, dll) | Sederhana |
| FR-20 | Jana Transaksi Auto | Menjana transaksi secara automatik mengikut jadual | Tinggi |
| FR-21 | Notifikasi Pembayaran | Menghantar notifikasi peringatan sebelum tarikh pembayaran | Sederhana |
| FR-22 | Pengurusan Gagal Bayar | Mengurus situasi pembayaran gagal (cuba semula, notifikasi) | Sederhana |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-23 | Jana Resit Format Cetak | Menjana resit dalam format untuk cetakan (thermal/printer biasa) | Tinggi |
| FR-24 | Jana Resit PDF | Menjana resit dalam format PDF untuk emel | Tinggi |
| FR-25 | Hantar Resit Emel | Menghantar resit ke emel pembayar | Sederhana |
| FR-26 | Hantar Resit SMS | Menghantar ringkasan resit melalui SMS | Rendah |
| FR-27 | Resit Rasmi LZS | Resit mempunyai no siri rasmi, cop digital, dan maklumat lengkap | Tinggi |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-28 | Pembatalan Transaksi | Membatalkan transaksi sebelum pengesahan akhir | Tinggi |
| FR-29 | Pembalikan Transaksi (Reversal) | Membalikkan transaksi yang telah berjaya (atas sebab tertentu) | Tinggi |
| FR-30 | Pelarasan Amaun | Melaraskan amaun transaksi (dengan sebab dan kelulusan) | Tinggi |
| FR-31 | Pembayaran Balik (Refund) | Memproses pembayaran balik kepada pembayar | Tinggi |
| FR-32 | Aliran Kerja Kelulusan | Pelarasan dan refund memerlukan kelulusan penyelia | Tinggi |
| FR-33 | Notifikasi Pelarasan | Menghantar notifikasi kepada pembayar untuk sebarang pelarasan | Sederhana |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-34 | Semak Status Transaksi | Membolehkan pengguna menyemak status transaksi (melalui no rujukan) | Tinggi |
| FR-35 | Sejarah Transaksi Pembayar | Memaparkan sejarah transaksi untuk sesuatu pembayar | Tinggi |
| FR-36 | Log Perubahan Status | Merekod setiap perubahan status transaksi | Tinggi |
| FR-37 | Carian Transaksi | Mencari transaksi berdasarkan pelbagai kriteria (tarikh, no resit, no IC, dll) | Tinggi |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-38 | Laporan Transaksi Harian | Laporan ringkasan transaksi harian mengikut channel | Tinggi |
| FR-39 | Laporan Kutipan | Laporan kutipan mengikut jenis zakat, channel, tempoh | Tinggi |
| FR-40 | Laporan Cek | Laporan status cek (belum clear, clear, bounce) | Sederhana |
| FR-41 | Eksport Data Transaksi | Eksport data transaksi ke Excel/CSV untuk analisis lanjut | Sederhana |


| Item | Detail |
| --- | --- |
| ID | UC01 |
| Nama Use Case | Bayar di Kaunter (Tunai) |
| Aktor Utama | Eksekutif Kaunter |
| Aktor Sekunder | Pembayar (Individu/Korporat) |
| Penerangan | Memproses pembayaran zakat secara tunai di kaunter |
| Pre-condition | Pembayar hadir di kaunter; eksekutif kaunter telah log masuk |
| Post-condition | Transaksi berjaya direkod, resit dicetak, stok tunai dikemaskini |


| Item | Detail |
| --- | --- |
| ID | UC03 |
| Nama Use Case | Bayar Online (FPX) |
| Aktor Utama | Pembayar Individu/Korporat |
| Aktor Sekunder | Payment Gateway (FPX), Sistem LZS |
| Penerangan | Memproses pembayaran zakat secara online melalui FPX |
| Pre-condition | Pembayar telah log masuk ke portal LZS atau melawat halaman pembayaran tanpa log masuk |
| Post-condition | Transaksi direkod, status dikemaskini berdasarkan response FPX, resit dihantar |


| Item | Detail |
| --- | --- |
| ID | UC12 |
| Nama Use Case | Pembalikan Transaksi (Reversal) |
| Aktor Utama | Eksekutif Pemprosesan, Penyelia |
| Aktor Sekunder | Sistem, Bank (jika melibatkan pembayaran online) |
| Penerangan | Membalikkan transaksi yang telah berjaya atas sebab-sebab tertentu (contoh: transaksi tersilap, duplikasi) |
| Pre-condition | Transaksi wujud dengan status 'SUCCESS'; pengguna mempunyai kebenaran untuk reversal |
| Post-condition | Transaksi asal status 'REVERSED', transaksi reversal direkod, notifikasi dihantar |


| Kod Modul | Sub-Modul | Penerangan | Fungsi Utama |
| --- | --- | --- | --- |
| TR-01 | Manual Payment (Kaunter) | Pengurusan pembayaran di kaunter |  |
| TR-01-01 | Transaksi Tunai | Memproses pembayaran tunai | Kiraan, terima tunai, kira baki |
| TR-01-02 | Transaksi Kad | Memproses pembayaran kad debit/kredit | Integrasi terminal, response kod |
| TR-01-03 | Transaksi Pelbagai Jenis | Membayar lebih satu jenis zakat dalam satu transaksi | Aggregasi amaun, resit gabungan |
| TR-01-04 | Pengesahan Kaunter | Mengesahkan transaksi kaunter | Kemaskini status, rekod juruwang |
| TR-01-05 | Pengurusan Duit Kecil | Pengurusan stok tunai di kaunter | Buku tunai, audit juruwang |
|  |  |  |  |
| TR-02 | Online Payment (FPX/PSP) | Pengurusan pembayaran online |  |
| TR-02-01 | Initiasi Pembayaran | Menjana permintaan ke FPX | Parameter, redirect URL |
| TR-02-02 | Pengendalian Callback | Menerima dan memproses response FPX | Validasi signature, kemaskini status |
| TR-02-03 | Idempotency Control | Mengelakkan transaksi berganda | Unique key, semak duplikasi |
| TR-02-04 | Status Polling | Menyemak status transaksi jika callback gagal | Job berjadual, kemaskini status |
| TR-02-05 | Pengurusan Transaksi Gagal | Mengurus transaksi yang gagal | Notifikasi, cuba semula |
|  |  |  |  |
| TR-03 | Cheque Processing | Pengurusan pembayaran menggunakan cek |  |
| TR-03-01 | Pendaftaran Cek | Mendaftar maklumat cek | No cek, bank, tarikh, amaun |
| TR-03-02 | Pengesahan Cek | Mengesahkan cek selepas clear | Kemaskini status, notifikasi |
| TR-03-03 | Pengurusan Cek Bounce | Mengurus cek tak layan | Status BOUNCE, notifikasi, tindakan |
| TR-03-04 | Pembatalan Cek | Membatalkan cek belum clear | Status VOID, rekod sebab |
| TR-03-05 | Laporan Cek | Laporan status cek | Belum clear, clear, bounce |
|  |  |  |  |
| TR-04 | Scheduled Payment | Pengurusan pembayaran berjadual |  |
| TR-04-01 | Pendaftaran Jadual | Mendaftar pelan pembayaran berjadual | Kekerapan, tarikh mula, amaun |
| TR-04-02 | Penjanaan Transaksi Auto | Jana transaksi mengikut jadual | Batch job, rekod transaksi |
| TR-04-03 | Peringatan Pembayaran | Menghantar notifikasi peringatan | Emel/SMS, tempoh sebelum |
| TR-04-04 | Pengurusan Gagal Bayar | Mengurus situasi pembayaran gagal | Cuba semula, notifikasi, suspend |
| TR-04-05 | Sejarah Pembayaran Jadual | Rekod pembayaran lepas untuk jadual | Paparan, analisis |
|  |  |  |  |
| TR-05 | Receipt Generation | Penjanaan resit pembayaran |  |
| TR-05-01 | Resit Cetak (Thermal) | Resit untuk printer thermal | Format 80mm/58mm, ringkas |
| TR-05-02 | Resit PDF | Resit format PDF untuk emel | Format A5/A4, cop digital |
| TR-05-03 | Resit SMS | Resit ringkas melalui SMS | Ringkasan, no rujukan |
| TR-05-04 | Resit Emel | Menghantar resit PDF melalui emel | Lampiran, body emel |
| TR-05-05 | No Siri Resit | Penjanaan no siri resit unik | Format tahun-bulan-jujukan |
| TR-05-06 | Resit Rasmi | Resit dengan cop digital LZS | Tandatangan digital, QR code |
|  |  |  |  |
| TR-06 | Reversal & Adjustment | Pengurusan pelarasan dan pembalikan |  |
| TR-06-01 | Pembatalan Transaksi | Membatalkan sebelum pengesahan | Status VOID, rekod sebab |
| TR-06-02 | Reversal Transaksi | Membalikkan transaksi berjaya | Status REVERSED, rekod reversal |
| TR-06-03 | Pelarasan Amaun | Melaraskan amaun transaksi | Adjustment transaction, sebab |
| TR-06-04 | Refund | Memproses pembayaran balik | Refund transaction, kaedah refund |
| TR-06-05 | Aliran Kerja Kelulusan | Kelulusan penyelia untuk reversal/refund | Hantar approval, lulus/tolak |
| TR-06-06 | Notifikasi Pelarasan | Notifikasi kepada pembayar | Emel/SMS, makluman perubahan |
|  |  |  |  |
| TR-07 | Status & History | Pengurusan status dan sejarah |  |
| TR-07-01 | Semak Status | Semak status transaksi | No rujukan, No IC, No Resit |
| TR-07-02 | Sejarah Transaksi Pembayar | Papar sejarah transaksi untuk pembayar | Kronologi, ringkasan |
| TR-07-03 | Log Perubahan Status | Rekod setiap perubahan status | Audit trail transaksi |
| TR-07-04 | Carian Transaksi | Cari transaksi pelbagai kriteria | Filter, sort, eksport |
|  |  |  |  |
| TR-08 | Transaction Reports | Laporan berkaitan transaksi |  |
| TR-08-01 | Laporan Harian | Ringkasan transaksi harian | Mengikut channel, jenis, status |
| TR-08-02 | Laporan Kutipan | Laporan kutipan mengikut tempoh | Bulanan, tahunan, trend |
| TR-08-03 | Laporan Juruwang | Laporan transaksi mengikut juruwang | Prestasi, jumlah, audit |
| TR-08-04 | Laporan Cek | Status cek | Senarai cek, analisis |
| TR-08-05 | Eksport Data | Eksport ke Excel/CSV | Untuk analisis lanjut |


| Medan | Jenis Data | Panjang | Wajib | Validasi/Rules |
| --- | --- | --- | --- | --- |
| Transaksi |  |  |  |  |
| ID Transaksi | System | 20 | Auto | Format: TRX + YYYYMMDD + 6 digit jujukan |
| No Resit | System | 20 | Auto | Format: R + YYYYMMDD + 6 digit jujukan |
| ID Pembayar | UUID | - | Ya* | Wajib jika pembayar berdaftar |
| Nama Pembayar | Text | 150 | Ya | - |
| No IC/Passport | Text | 20 | Ya* | Untuk pembayar tidak berdaftar |
| Jenis Zakat | Dropdown | - | Ya | Pilih dari jenis zakat aktif |
| Amaun | Decimal | 12,2 | Ya | > 0 |
| Kaedah Bayar | Dropdown | - | Ya | TUNAI/KAD/FPX/CEK/TRANSFER |
| Status | System | 20 | Auto | PENDING/SUCCESS/FAILED/dll |
| Tarikh Transaksi | Timestamp | - | Auto | System generated |
| ID Juruwang | VARCHAR | 50 | Ya* | Untuk transaksi kaunter |
|  |  |  |  |  |
| Cek |  |  |  |  |
| No Cek | Text | 20 | Ya | Unik dalam sistem |
| Bank | Dropdown | - | Ya | Pilih dari senarai bank |
| Tarikh Cek | Date | - | Ya | Tidak boleh tarikh masa hadapan |
| Amaun Cek | Decimal | 12,2 | Ya | > 0 |
| Status Cek | System | 20 | Auto | TERIMA/CLEAR/BOUNCE/VOID |
| Tarikh Clear | Date | - | Jika CLEAR | Format DD/MM/YYYY |
|  |  |  |  |  |
| Pembayaran Online |  |  |  |  |
| ID Transaksi FPX | VARCHAR | 50 | Auto | Dari FPX |
| Bank Code | VARCHAR | 10 | Auto | Dari FPX |
| Status FPX | VARCHAR | 10 | Auto | 00' success, '99' fail |
| Signature | TEXT | - | Auto | Untuk validasi callback |
|  |  |  |  |  |
| Reversal/Refund |  |  |  |  |
| ID Transaksi Asal | UUID | - | Ya | Rujuk ke transaksi asal |
| Sebab | Text | 500 | Ya | Minimum 20 aksara |
| Dokumen Sokongan | File | - | Jika perlu | PDF/Image |
| Status Kelulusan | System | 20 | Auto | PENDING/APPROVED/REJECTED |
| Diluluskan Oleh | VARCHAR | 50 | Jika APPROVED | - |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| transaction_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| transaction_no | VARCHAR | 30 | NO | - | No transaksi (format: TRX+YYYYMMDD+xxxxxx) |
| receipt_no | VARCHAR | 30 | YES | - | No resit (dijana selepas success) |
| payer_id | UUID | - | YES | - | FK ke PAYER_MASTER (jika berdaftar) |
| payer_name | VARCHAR | 150 | NO | - | Nama pembayar |
| payer_ic | VARCHAR | 20 | YES | - | No IC/Passport (untuk tidak berdaftar) |
| payer_phone | VARCHAR | 15 | YES | - | No telefon |
| payer_email | VARCHAR | 100 | YES | - | Emel (untuk resit) |
| transaction_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh masa transaksi |
| total_amount | DECIMAL | 12,2 | NO | - | Jumlah amaun |
| payment_method | VARCHAR | 20 | NO | - | CASH'/'CARD'/'FPX'/'CHEQUE'/'TRANSFER' |
| channel | VARCHAR | 20 | NO | - | COUNTER'/'ONLINE'/'SPG'/'BULK' |
| status | VARCHAR | 20 | NO | PENDING' | PENDING/SUCCESS/FAILED/REVERSED/REFUNDED/VOID |
| approval_status | VARCHAR | 20 | YES | APPROVED' | Untuk reversal/refund: PENDING/APPROVED/REJECTED |
| approved_by | VARCHAR | 50 | YES | - | Diluluskan oleh |
| approved_date | TIMESTAMP | - | YES | - | Tarikh lulus |
| remarks | TEXT | - | YES | - | Catatan |
| teller_id | VARCHAR | 50 | YES | - | ID juruwang (untuk transaksi kaunter) |
| teller_terminal | VARCHAR | 20 | YES | - | Terminal ID |
| created_by | VARCHAR | 50 | NO | - | User ID pencipta |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |
| modified_by | VARCHAR | 50 | YES | - | User ID pengemaskini |
| modified_date | TIMESTAMP | - | YES | - | Tarikh kemaskini |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| detail_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| transaction_id | UUID | - | NO | - | FK ke TRANSACTION_MASTER |
| zakat_type_id | UUID | - | NO | - | FK ke ZAKAT_TYPE |
| zakat_type_name | VARCHAR | 100 | NO | - | Nama jenis zakat (snapshot) |
| zakat_category | VARCHAR | 50 | YES | - | Kategori (snapshot) |
| calculation_input | TEXT | - | YES | - | JSON: input untuk pengiraan |
| amount | DECIMAL | 12,2 | NO | - | Amaun untuk jenis ini |
| rate_applied | DECIMAL | 10,4 | YES | - | Kadar yang digunakan |
| rate_type | VARCHAR | 20 | YES | - | Jenis kadar (FIXED/PERCENTAGE/dll) |
| is_primary | BOOLEAN | - | NO | 0 | Jenis utama? |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| cash_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| transaction_id | UUID | - | NO | - | FK ke TRANSACTION_MASTER |
| amount_tendered | DECIMAL | 12,2 | NO | - | Jumlah tunai diterima |
| change_amount | DECIMAL | 12,2 | NO | 0 | Baki dipulangkan |
| cash_denominations | TEXT | - | YES | - | JSON: pecahan wang (RM100, RM50, dll) |
| teller_id | VARCHAR | 50 | NO | - | ID juruwang |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| card_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| transaction_id | UUID | - | NO | - | FK ke TRANSACTION_MASTER |
| card_type | VARCHAR | 20 | NO | - | VISA'/'MASTERCARD'/'DEBIT' |
| card_last4 | VARCHAR | 4 | YES | - | 4 digit terakhir kad |
| approval_code | VARCHAR | 30 | YES | - | Kod approval dari terminal |
| terminal_id | VARCHAR | 30 | YES | - | ID terminal kad |
| transaction_reference | VARCHAR | 50 | YES | - | Rujukan dari bank |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| cheque_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| transaction_id | UUID | - | NO | - | FK ke TRANSACTION_MASTER |
| cheque_no | VARCHAR | 30 | NO | - | No cek |
| bank_code | VARCHAR | 10 | YES | - | Kod bank |
| bank_name | VARCHAR | 100 | NO | - | Nama bank |
| cheque_date | DATE | - | NO | - | Tarikh pada cek |
| amount | DECIMAL | 12,2 | NO | - | Amaun cek |
| status | VARCHAR | 20 | NO | RECEIVED' | RECEIVED'/'CLEAR'/'BOUNCE'/'VOID' |
| clear_date | DATE | - | YES | - | Tarikh clear |
| bounce_date | DATE | - | YES | - | Tarikh bounce |
| bounce_reason | TEXT | - | YES | - | Sebab bounce |
| remarks | TEXT | - | YES | - | Catatan |
| created_by | VARCHAR | 50 | NO | - | User ID pencipta |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |
| modified_by | VARCHAR | 50 | YES | - | User ID pengemaskini |
| modified_date | TIMESTAMP | - | YES | - | Tarikh kemaskini |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| online_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| transaction_id | UUID | - | NO | - | FK ke TRANSACTION_MASTER |
| fpx_transaction_id | VARCHAR | 50 | YES | - | ID transaksi dari FPX |
| fpx_order_no | VARCHAR | 50 | NO | - | No order (dijana sistem) |
| fpx_bank_code | VARCHAR | 10 | YES | - | Kod bank pembayar |
| fpx_bank_name | VARCHAR | 100 | YES | - | Nama bank |
| fpx_status | VARCHAR | 10 | YES | - | 00' success, '99' fail |
| fpx_status_desc | VARCHAR | 100 | YES | - | Penerangan status |
| fpx_signature | TEXT | - | YES | - | Tandatangan digital |
| fpx_response | TEXT | - | YES | - | Full response JSON |
| request_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh hantar permintaan |
| response_date | TIMESTAMP | - | YES | - | Tarikh terima response |
| callback_received | BOOLEAN | - | NO | 0 | Callback diterima? |
| callback_date | TIMESTAMP | - | YES | - | Tarikh callback |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| receipt_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| transaction_id | UUID | - | NO | - | FK ke TRANSACTION_MASTER |
| receipt_no | VARCHAR | 30 | NO | - | No resit (format: R+YYYYMMDD+xxxxxx) |
| receipt_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh resit |
| receipt_type | VARCHAR | 20 | NO | ORIGINAL' | ORIGINAL'/'COPY'/'DUPLICATE' |
| receipt_format | VARCHAR | 20 | NO | THERMAL' | THERMAL'/'PDF'/'SMS' |
| pdf_path | VARCHAR | 200 | YES | - | Path ke fail PDF (jika ada) |
| qr_code | TEXT | - | YES | - | QR code content |
| digital_signature | TEXT | - | YES | - | Tandatangan digital |
| is_printed | BOOLEAN | - | NO | 0 | Sudah dicetak? |
| print_count | INTEGER | - | NO | 0 | Bilangan cetakan |
| is_emailed | BOOLEAN | - | NO | 0 | Sudah diemel? |
| emailed_date | TIMESTAMP | - | YES | - | Tarikh emel |
| is_sms | BOOLEAN | - | NO | 0 | Sudah SMS? |
| sms_date | TIMESTAMP | - | YES | - | Tarikh SMS |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| schedule_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| payer_id | UUID | - | NO | - | FK ke PAYER_MASTER |
| schedule_name | VARCHAR | 100 | NO | - | Nama jadual |
| frequency | VARCHAR | 20 | NO | - | MONTHLY'/'QUARTERLY'/'YEARLY' |
| start_date | DATE | - | NO | - | Tarikh mula |
| end_date | DATE | - | YES | - | Tarikh tamat |
| next_payment_date | DATE | - | NO | - | Tarikh bayaran seterusnya |
| total_amount | DECIMAL | 12,2 | NO | - | Jumlah amaun setiap kali |
| status | VARCHAR | 20 | NO | ACTIVE' | ACTIVE'/'SUSPENDED'/'COMPLETED'/'CANCELLED' |
| auto_process | BOOLEAN | - | NO | 1 | Proses auto? |
| notification_sent | BOOLEAN | - | NO | 0 | Notifikasi sudah dihantar? |
| created_by | VARCHAR | 50 | NO | - | User ID pencipta |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |
| modified_by | VARCHAR | 50 | YES | - | User ID pengemaskini |
| modified_date | TIMESTAMP | - | YES | - | Tarikh kemaskini |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| schedule_detail_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| schedule_id | UUID | - | NO | - | FK ke SCHEDULED_PAYMENT |
| zakat_type_id | UUID | - | NO | - | FK ke ZAKAT_TYPE |
| amount | DECIMAL | 12,2 | NO | - | Amaun untuk jenis ini |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| history_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| schedule_id | UUID | - | NO | - | FK ke SCHEDULED_PAYMENT |
| transaction_id | UUID | - | YES | - | FK ke TRANSACTION_MASTER (jaya) |
| payment_date | DATE | - | NO | - | Tarikh bayaran |
| amount | DECIMAL | 12,2 | NO | - | Amaun |
| status | VARCHAR | 20 | NO | - | SUCCESS'/'FAILED'/'SKIPPED' |
| remarks | TEXT | - | YES | - | Catatan |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| request_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| original_transaction_id | UUID | - | NO | - | FK ke TRANSACTION_MASTER |
| reversal_transaction_id | UUID | - | YES | - | FK ke REVERSAL_TRANSACTION |
| request_type | VARCHAR | 20 | NO | - | REVERSAL'/'REFUND'/'ADJUSTMENT' |
| reason | TEXT | - | NO | - | Sebab permohonan |
| supporting_doc | VARCHAR | 200 | YES | - | Path dokumen sokongan |
| amount | DECIMAL | 12,2 | NO | - | Amaun untuk reversal |
| approval_status | VARCHAR | 20 | NO | PENDING' | PENDING'/'APPROVED'/'REJECTED' |
| requested_by | VARCHAR | 50 | NO | - | Pemohon |
| requested_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh mohon |
| approved_by | VARCHAR | 50 | YES | - | Pelulus |
| approved_date | TIMESTAMP | - | YES | - | Tarikh lulus |
| rejection_reason | TEXT | - | YES | - | Sebab tolak |
| remarks | TEXT | - | YES | - | Catatan |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| reversal_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| original_transaction_id | UUID | - | NO | - | FK ke TRANSACTION_MASTER |
| reversal_transaction_no | VARCHAR | 30 | NO | - | No transaksi reversal |
| amount | DECIMAL | 12,2 | NO | - | Amaun (negatif) |
| reversal_type | VARCHAR | 20 | NO | - | REVERSAL'/'REFUND' |
| reversal_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh reversal |
| processed_by | VARCHAR | 50 | NO | - | Diproses oleh |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| status_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| transaction_id | UUID | - | NO | - | FK ke TRANSACTION_MASTER |
| previous_status | VARCHAR | 20 | NO | - | Status lama |
| new_status | VARCHAR | 20 | NO | - | Status baru |
| reason | TEXT | - | YES | - | Sebab perubahan |
| changed_by | VARCHAR | 50 | NO | - | User ID |
| changed_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh ubah |
| ip_address | VARCHAR | 20 | YES | - | Alamat IP |


| Role ID | Role Name | Penerangan |
| --- | --- | --- |
| R01 | Pentadbir Sistem | Akses penuh ke semua fungsi transaksi |
| R02 | Pengurus Operasi | Mengawasi operasi transaksi harian, laporan, kelulusan |
| R03 | Eksekutif Pemprosesan | Memproses transaksi, mengurus cek, reversal/refund |
| R04 | Eksekutif Kaunter | Memproses transaksi kaunter (tunai/kad/cek) |
| R05 | Penyelia Kaunter | Menyelia operasi kaunter, meluluskan transaksi tertentu |
| R06 | Juruaudit | Akses view sahaja untuk tujuan audit |
| R07 | Pembayar Individu | Akses kepada transaksi sendiri (sejarah, resit) |
| R08 | Pembayar Korporat | Akses kepada transaksi syarikat sendiri |


| Fungsi / Sub-Modul | R01 | R02 | R03 | R04 | R05 | R06 | R07 | R08 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Dashboard Transaksi |  |  |  |  |  |  |  |  |
| Lihat Ringkasan | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Lihat Transaksi Terkini | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
|  |  |  |  |  |  |  |  |  |
| Transaksi Baharu |  |  |  |  |  |  |  |  |
| Bayar Tunai | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Bayar Kad | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Jana Pautan FPX | ✓ | ✓ | ✓ | Terhad | ✓ | ✗ | Sendiri | Sendiri |
| Daftar Cek | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | Sendiri | Sendiri |
| Bayar Pelbagai Jenis | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
|  |  |  |  |  |  |  |  |  |
| Carian Transaksi |  |  |  |  |  |  |  |  |
| Carian Asas | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Sendiri | Sendiri |
| Carian Lanjutan | ✓ | ✓ | ✓ | Terhad | ✓ | ✓ | ✗ | ✗ |
| Lihat Butiran Transaksi | ✓ | ✓ | ✓ | Terhad | ✓ | ✓ | Sendiri | Sendiri |
|  |  |  |  |  |  |  |  |  |
| Pengurusan Cek |  |  |  |  |  |  |  |  |
| Daftar Cek | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Pengesahan Clear | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Urus Bounce | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Lihat Senarai Cek | ✓ | ✓ | ✓ | Terhad | ✓ | ✓ | ✗ | ✗ |
|  |  |  |  |  |  |  |  |  |
| Pembayaran Berjadual |  |  |  |  |  |  |  |  |
| Daftar Jadual | ✓ | ✓ | ✓ | Terhad | ✓ | ✗ | Sendiri | Sendiri |
| Lihat Jadual | ✓ | ✓ | ✓ | Terhad | ✓ | ✓ | Sendiri | Sendiri |
| Proses Auto | SYS | SYS | SYS | ✗ | ✗ | ✗ | ✗ | ✗ |
|  |  |  |  |  |  |  |  |  |
| Reversal & Refund |  |  |  |  |  |  |  |  |
| Permohonan Reversal | ✓ | ✓ | ✓ | ✗ | Terhad | ✗ | ✗ | ✗ |
| Permohonan Refund | ✓ | ✓ | ✓ | ✗ | Terhad | ✗ | ✗ | ✗ |
| Kelulusan Reversal/Refund | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Lihat Sejarah Pelarasan | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ |
|  |  |  |  |  |  |  |  |  |
| Resit |  |  |  |  |  |  |  |  |
| Cetak Resit | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | Sendiri | Sendiri |
| Hantar Resit Emel | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | Sendiri | Sendiri |
| Cetak Semula Resit | ✓ | ✓ | ✓ | Terhad | ✓ | ✗ | Sendiri | Sendiri |
|  |  |  |  |  |  |  |  |  |
| Laporan |  |  |  |  |  |  |  |  |
| Laporan Harian | ✓ | ✓ | ✓ | Terhad | ✓ | ✓ | ✗ | ✗ |
| Laporan Kutipan | ✓ | ✓ | ✓ | Terhad | ✓ | ✓ | ✗ | ✗ |
| Laporan Juruwang | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ |
| Laporan Cek | ✓ | ✓ | ✓ | Terhad | ✓ | ✓ | ✗ | ✗ |
| Eksport Data | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ |


| Rule ID | Peraturan | Penerangan | Kesan Jika Dilanggar |
| --- | --- | --- | --- |
| BR-TRX-01 | Unik No Transaksi | Setiap transaksi mesti mempunyai no transaksi unik | Sistem jana auto, mustahil duplikat |
| BR-TRX-02 | Unik No Resit | Setiap resit mesti mempunyai no siri unik | Sistem jana auto, mustahil duplikat |
| BR-TRX-03 | Amaun Positif | Amaun transaksi mestilah > 0 | Tidak boleh simpan |
| BR-TRX-04 | Status Transaksi | Transaksi bermula dengan status 'PENDING' | Auto set oleh sistem |
| BR-TRX-05 | Transaksi Selesai | Transaksi 'SUCCESS' tidak boleh diubah (kecuali reversal) | Kunci rekod |
| BR-TRX-06 | Semakan Pendua | Sistem mesti semak transaksi pendua sebelum simpan (idempotency) | Cegah transaksi berganda |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-CSH-01 | Jumlah Tender Mencukupi | Jumlah tunai diterima >= amaun transaksi |
| BR-CSH-02 | Baki Dipulangkan | Jika bayar lebih, baki mesti dikira dan dipulangkan |
| BR-CSH-03 | Had Transaksi Tunai | Transaksi tunai > RM10,000 memerlukan pengesahan penyelia |
| BR-CSH-04 | Juruwang Bertanggungjawab | Setiap transaksi tunai direkod dengan ID juruwang |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-FPX-01 | Idempotency Key | Setiap permintaan ke FPX mesti mempunyai idempotency key unik |
| BR-FPX-02 | Validasi Signature | Callback dari FPX mesti disahkan menggunakan tandatangan digital |
| BR-FPX-03 | Masa Tamat (Timeout) | Jika tiada response dalam 30 minit, status 'TIMEOUT' |
| BR-FPX-04 | Polling Status | Sistem boleh polling status jika callback gagal |
| BR-FPX-05 | Kemaskini Auto | Status transaksi dikemaskini auto berdasarkan response FPX |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-CHQ-01 | Tarikh Cek Sah | Tarikh cek tidak boleh melebihi tarikh semasa (post-dated dibenarkan) |
| BR-CHQ-02 | Tempoh Sah Laku | Cek mesti clear dalam tempoh 30 hari dari tarikh cek |
| BR-CHQ-03 | Cek Bounce | Jika cek bounce, status 'BOUNCE' dan notifikasi dihantar |
| BR-CHQ-04 | Cek Clear | Hanya cek dengan status 'CLEAR' dikira sebagai kutipan sah |
| BR-CHQ-05 | Pembatalan Cek | Cek boleh batal jika status masih 'RECEIVED' |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-REV-01 | Tempoh Reversal | Reversal hanya dibenarkan dalam tempoh 90 hari dari transaksi asal |
| BR-REV-02 | Kelulusan | Reversal > RM500 memerlukan kelulusan penyelia |
| BR-REV-03 | Sebab Sah | Setiap reversal mesti mempunyai sebab yang sah dan dokumen sokongan |
| BR-REV-04 | Transaksi Asal | Transaksi asal mesti status 'SUCCESS' untuk reversal |
| BR-REV-05 | Reversal Unik | Transaksi asal hanya boleh reversal sekali |
| BR-REV-06 | Refund Kaedah Asal | Refund hendaklah menggunakan kaedah pembayaran asal (jika boleh) |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-SCH-01 | Proses Auto | Pembayaran berjadual diproses auto pada tarikh ditetapkan |
| BR-SCH-02 | Peringatan | Notifikasi peringatan dihantar 3 hari sebelum tarikh bayar |
| BR-SCH-03 | Gagal Bayar | Jika gagal 3 kali berturut-turut, jadual digantung (suspend) |
| BR-SCH-04 | Cuba Semula | Sistem cuba semula sehingga 3 kali untuk transaksi gagal |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-AUD-01 | Log Semua Perubahan | Setiap perubahan status transaksi direkod dalam history |
| BR-AUD-02 | Maklumat Lengkap | Audit log mesti rekod siapa, bila, IP, dan nilai lama/baru |
| BR-AUD-03 | Tempoh Simpan | Data transaksi disimpan minimum 7 tahun |


| Objektif | Fungsi Keperluan Berkaitan |
| --- | --- |
| OBJ-01: Pelbagai channel pembayaran | FR-01 hingga FR-22 |
| OBJ-02: Validasi ketat | FR-01 (validasi input), FR-11 (validasi signature) |
| OBJ-03: Kawalan idempotency | FR-08 (idempotency key) |
| OBJ-04: Pembayaran manual, online, berjadual | FR-01 hingga FR-22 |
| OBJ-05: Penjanaan resit | FR-23 hingga FR-27 |
| OBJ-06: Pelarasan & pembalikan | FR-28 hingga FR-33 |
| OBJ-07: Status transaksi | FR-34 hingga FR-37 |
| OBJ-08: Audit | FR-36 (log perubahan) |
| OBJ-09: Pengurusan cek | FR-14 hingga FR-18 |
| OBJ-10: Antara muka mesra pengguna | Semua fungsi (reka bentuk UI) |


| Fungsi Keperluan | Use Case Berkaitan |
| --- | --- |
| FR-01: Initiasi Transaksi Kaunter | UC01, UC02 |
| FR-02: Pengiraan Amaun | UC01, UC02, UC03 |
| FR-03: Pembayaran Tunai | UC01 |
| FR-04: Pembayaran Kad | UC02 |
| FR-05: Pembayaran Pelbagai Jenis | UC01, UC02 |
| FR-06: Pengesahan Transaksi | UC01, UC02, UC03 |
| FR-07: Penjanaan Resit Kaunter | UC07 |
| FR-08: Initiasi Pembayaran Online | UC03 |
| FR-09: Redirect ke Payment Gateway | UC03 |
| FR-10: Terima Response Callback | UC03 |
| FR-11: Validasi Tandatangan Digital | UC03 |
| FR-12: Kemaskini Status Transaksi | UC03 |
| FR-13: Penjanaan Resit Online | UC07, UC08 |
| FR-14: Pendaftaran Cek | UC04 |
| FR-15: Status Cek | UC05, UC06 |
| FR-16: Pengesahan Cek Clear | UC05 |
| FR-17: Pengurusan Cek Bounce | UC06 |
| FR-18: Pembatalan Cek | UC11 |
| FR-19: Pendaftaran Jadual Bayaran | UC15 |
| FR-20: Jana Transaksi Auto | UC16 |
| FR-21: Notifikasi Pembayaran | UC16 |
| FR-22: Pengurusan Gagal Bayar | UC16 |
| FR-23: Jana Resit Format Cetak | UC07 |
| FR-24: Jana Resit PDF | UC07 |
| FR-25: Hantar Resit Emel | UC08 |
| FR-26: Hantar Resit SMS | UC08 |
| FR-27: Resit Rasmi LZS | UC07 |
| FR-28: Pembatalan Transaksi | UC11 |
| FR-29: Pembalikan Transaksi | UC12 |
| FR-30: Pelarasan Amaun | UC13 |
| FR-31: Refund | UC14 |
| FR-32: Aliran Kerja Kelulusan | UC12, UC13, UC14 |
| FR-33: Notifikasi Pelarasan | UC12, UC13, UC14 |
| FR-34: Semak Status Transaksi | UC09 |
| FR-35: Sejarah Transaksi Pembayar | UC10 |
| FR-36: Log Perubahan Status | UC09, UC10 |
| FR-37: Carian Transaksi | UC18 |
| FR-38: Laporan Transaksi Harian | UC17 |
| FR-39: Laporan Kutipan | UC17 |
| FR-40: Laporan Cek | UC17 |
| FR-41: Eksport Data Transaksi | UC17 |


| Use Case | Role Dibenarkan |
| --- | --- |
| UC01: Bayar di Kaunter (Tunai) | R01, R02, R03, R04, R05 |
| UC02: Bayar di Kaunter (Kad) | R01, R02, R03, R04, R05 |
| UC03: Bayar Online (FPX) | R07, R08 (pembayar), R01-R05 (jana pautan) |
| UC04: Daftar Cek | R01, R02, R03, R04, R05, R08 (sendiri) |
| UC05: Pengesahan Cek Clear | R01, R02, R03, R05 |
| UC06: Urus Cek Bounce | R01, R02, R03, R05 |
| UC07: Jana Resit | R01-R05 (untuk orang lain), R07-R08 (sendiri) |
| UC08: Hantar Resit | R01-R05 (untuk orang lain), R07-R08 (sendiri) |
| UC09: Semak Status Transaksi | Semua role (terhad untuk sendiri) |
| UC10: Lihat Sejarah Transaksi | R07-R08 (sendiri), R01-R06 (semua) |
| UC11: Batal Transaksi | R01, R02, R03, R05 (sebelum pengesahan) |
| UC12: Pembalikan Transaksi | R01, R02, R03 (perlu kelulusan) |
| UC13: Pelarasan Amaun | R01, R02, R03 (perlu kelulusan) |
| UC14: Refund | R01, R02, R03 (perlu kelulusan) |
| UC15: Daftar Pembayaran Berjadual | R07-R08 (sendiri), R01-R05 (untuk orang lain) |
| UC16: Proses Pembayaran Auto | Sistem |
| UC17: Laporan Transaksi | R01, R02, R03, R05, R06 |
| UC18: Carian Transaksi | R01-R06 (semua), R07-R08 (sendiri) |


| POC Document Section | Page | Modul 3 Sub-Modul |
| --- | --- | --- |
| Processing Solution | 3 | TR-01, TR-02, TR-03, TR-04 |
| High volume transaction | 4 | TR-02, TR-04 (online, auto) |
| Integration | 4 | TR-02 (FPX), TR-03 (bank) |
| User/Interface Solution - Executive Kaunter | 3 | TR-01, TR-05 |
| Scenario: Process Payment | 8 | TR-01, TR-02, TR-03, TR-06 |
| Audit Trail | 3 | TR-07 (status history) |
| Reporting | 3 | TR-08 |


| Domain | Nilai | Penerangan |
| --- | --- | --- |
| status | PENDING' | Menunggu pemprosesan |
|  | PROCESSING' | Sedang diproses |
|  | SUCCESS' | Berjaya |
|  | FAILED' | Gagal |
|  | REVERSED' | Telah dibalikkan |
|  | REFUNDED' | Telah dipulangkan |
|  | VOID' | Batal |
|  | TIMEOUT' | Tamat masa |
|  |  |  |
| payment_method | CASH' | Tunai |
|  | CARD' | Kad Kredit/Debit |
|  | FPX' | FPX Online |
|  | CHEQUE' | Cek |
|  | TRANSFER' | Transfer Bank |
|  | AUTO' | Auto Debit |
|  |  |  |
| channel | COUNTER' | Kaunter |
|  | ONLINE' | Portal Online |
|  | SPG' | Skim Potongan Gaji |
|  | BULK' | Pemprosesan Pukal |
|  | MOBILE' | Aplikasi Mobile |
|  |  |  |
| cheque_status | RECEIVED' | Cek diterima |
|  | CLEAR' | Telah clear |
|  | BOUNCE' | Tak layan |
|  | VOID' | Batal |
|  |  |  |
| request_type | REVERSAL' | Pembalikan |
|  | REFUND' | Pembayaran balik |
|  | ADJUSTMENT' | Pelarasan |
|  |  |  |
| approval_status | PENDING' | Menunggu kelulusan |
|  | APPROVED' | Diluluskan |
|  | REJECTED' | Ditolak |
|  |  |  |
| frequency | ONE_TIME' | Sekali |
|  | MONTHLY' | Bulanan |
|  | QUARTERLY' | Suku tahun |
|  | YEARLY' | Tahunan |


| Table | Column | Data Type | Length | Penerangan | Sumber Data |
| --- | --- | --- | --- | --- | --- |
| TRANSACTION_MASTER | transaction_id | UUID | - | ID unik transaksi | System |
|  | transaction_no | VARCHAR | 30 | No transaksi (format: TRX+YYYYMMDD+xxxxxx) | System |
|  | receipt_no | VARCHAR | 30 | No resit (dijana selepas success) | System |
|  | payer_id | UUID | - | ID pembayar (FK) | From Modul 1 |
|  | payer_name | VARCHAR | 150 | Nama pembayar (snapshot) | Input form |
|  | payer_ic | VARCHAR | 20 | No IC/Passport | Input form |
|  | payer_phone | VARCHAR | 15 | No telefon | Input form |
|  | payer_email | VARCHAR | 100 | Emel | Input form |
|  | transaction_date | TIMESTAMP | - | Tarikh masa transaksi | System |
|  | total_amount | DECIMAL | 12,2 | Jumlah amaun | Calculated |
|  | payment_method | VARCHAR | 20 | Kaedah bayar | Input form |
|  | channel | VARCHAR | 20 | Channel pembayaran | Input form |
|  | status | VARCHAR | 20 | Status transaksi | System |
|  | approval_status | VARCHAR | 20 | Status kelulusan (untuk reversal) | System |
|  | approved_by | VARCHAR | 50 | Diluluskan oleh | Session |
|  | approved_date | TIMESTAMP | - | Tarikh lulus | System |
|  | remarks | TEXT | - | Catatan | User input |
|  | teller_id | VARCHAR | 50 | ID juruwang | Session |
|  | teller_terminal | VARCHAR | 20 | Terminal ID | System |
|  | created_by | VARCHAR | 50 | User ID pencipta | Session |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  | modified_by | VARCHAR | 50 | User ID pengemaskini | Session |
|  | modified_date | TIMESTAMP | - | Tarikh kemaskini | System |
|  |  |  |  |  |  |
| TRANSACTION_DETAIL | detail_id | UUID | - | ID unik detail | System |
|  | transaction_id | UUID | - | FK ke TRANSACTION_MASTER | From master |
|  | zakat_type_id | UUID | - | FK ke ZAKAT_TYPE | From Modul 2 |
|  | zakat_type_name | VARCHAR | 100 | Nama jenis zakat (snapshot) | From Modul 2 |
|  | zakat_category | VARCHAR | 50 | Kategori (snapshot) | From Modul 2 |
|  | calculation_input | TEXT | - | JSON input pengiraan | System |
|  | amount | DECIMAL | 12,2 | Amaun untuk jenis ini | Calculated |
|  | rate_applied | DECIMAL | 10,4 | Kadar yang digunakan | From Modul 2 |
|  | rate_type | VARCHAR | 20 | Jenis kadar | From Modul 2 |
|  | is_primary | BOOLEAN | - | Jenis utama? | Input form |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  |  |  |  |  |  |
| PAYMENT_CASH | cash_id | UUID | - | ID unik pembayaran tunai | System |
|  | transaction_id | UUID | - | FK ke TRANSACTION_MASTER | From master |
|  | amount_tendered | DECIMAL | 12,2 | Jumlah tunai diterima | Input form |
|  | change_amount | DECIMAL | 12,2 | Baki dipulangkan | Calculated |
|  | cash_denominations | TEXT | - | JSON pecahan wang | Input form |
|  | teller_id | VARCHAR | 50 | ID juruwang | Session |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  |  |  |  |  |  |
| PAYMENT_CHEQUE | cheque_id | UUID | - | ID unik cek | System |
|  | transaction_id | UUID | - | FK ke TRANSACTION_MASTER | From master |
|  | cheque_no | VARCHAR | 30 | No cek | Input form |
|  | bank_code | VARCHAR | 10 | Kod bank | Input form |
|  | bank_name | VARCHAR | 100 | Nama bank | Input form |
|  | cheque_date | DATE | - | Tarikh cek | Input form |
|  | amount | DECIMAL | 12,2 | Amaun cek | Input form |
|  | status | VARCHAR | 20 | Status cek | System |
|  | clear_date | DATE | - | Tarikh clear | Input form |
|  | bounce_date | DATE | - | Tarikh bounce | Input form |
|  | bounce_reason | TEXT | - | Sebab bounce | Input form |
|  | remarks | TEXT | - | Catatan | User input |
|  | created_by | VARCHAR | 50 | User ID pencipta | Session |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  | modified_by | VARCHAR | 50 | User ID pengemaskini | Session |
|  | modified_date | TIMESTAMP | - | Tarikh kemaskini | System |
|  |  |  |  |  |  |
| PAYMENT_ONLINE | online_id | UUID | - | ID unik pembayaran online | System |
|  | transaction_id | UUID | - | FK ke TRANSACTION_MASTER | From master |
|  | fpx_transaction_id | VARCHAR | 50 | ID transaksi dari FPX | From FPX |
|  | fpx_order_no | VARCHAR | 50 | No order | System |
|  | fpx_bank_code | VARCHAR | 10 | Kod bank pembayar | From FPX |
|  | fpx_bank_name | VARCHAR | 100 | Nama bank | From FPX |
|  | fpx_status | VARCHAR | 10 | Status dari FPX | From FPX |
|  | fpx_status_desc | VARCHAR | 100 | Penerangan status | From FPX |
|  | fpx_signature | TEXT | - | Tandatangan digital | From FPX |
|  | fpx_response | TEXT | - | Full response JSON | From FPX |
|  | request_date | TIMESTAMP | - | Tarikh hantar permintaan | System |
|  | response_date | TIMESTAMP | - | Tarikh terima response | System |
|  | callback_received | BOOLEAN | - | Callback diterima? | System |
|  | callback_date | TIMESTAMP | - | Tarikh callback | System |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  |  |  |  |  |  |
| RECEIPT | receipt_id | UUID | - | ID unik resit | System |
|  | transaction_id | UUID | - | FK ke TRANSACTION_MASTER | From master |
|  | receipt_no | VARCHAR | 30 | No resit | System |
|  | receipt_date | TIMESTAMP | - | Tarikh resit | System |
|  | receipt_type | VARCHAR | 20 | Jenis resit | System |
|  | receipt_format | VARCHAR | 20 | Format resit | System |
|  | pdf_path | VARCHAR | 200 | Path ke fail PDF | System |
|  | qr_code | TEXT | - | QR code content | System |
|  | digital_signature | TEXT | - | Tandatangan digital | System |
|  | is_printed | BOOLEAN | - | Sudah dicetak? | System |
|  | print_count | INTEGER | - | Bilangan cetakan | System |
|  | is_emailed | BOOLEAN | - | Sudah diemel? | System |
|  | emailed_date | TIMESTAMP | - | Tarikh emel | System |
|  | is_sms | BOOLEAN | - | Sudah SMS? | System |
|  | sms_date | TIMESTAMP | - | Tarikh SMS | System |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  |  |  |  |  |  |
| REVERSAL_REQUEST | request_id | UUID | - | ID unik permohonan | System |
|  | original_transaction_id | UUID | - | FK ke transaksi asal | From master |
|  | reversal_transaction_id | UUID | - | FK ke transaksi reversal | From reversal |
|  | request_type | VARCHAR | 20 | Jenis permohonan | Input form |
|  | reason | TEXT | - | Sebab | Input form |
|  | supporting_doc | VARCHAR | 200 | Path dokumen sokongan | Upload |
|  | amount | DECIMAL | 12,2 | Amaun | From original |
|  | approval_status | VARCHAR | 20 | Status kelulusan | System |
|  | requested_by | VARCHAR | 50 | Pemohon | Session |
|  | requested_date | TIMESTAMP | - | Tarikh mohon | System |
|  | approved_by | VARCHAR | 50 | Pelulus | Session |
|  | approved_date | TIMESTAMP | - | Tarikh lulus | System |
|  | rejection_reason | TEXT | - | Sebab tolak | Input form |
|  | remarks | TEXT | - | Catatan | User input |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |


| AC ID | Kriteria | Kaedah Ujian | Keputusan Jangkaan |
| --- | --- | --- | --- |
| AC-01 | Eksekutif kaunter boleh memproses pembayaran tunai dengan jayanya | Ujian fungsian: Ikut aliran normal transaksi tunai | Transaksi berjaya, resit tercetak, status 'SUCCESS' |
| AC-02 | Sistem mengira baki dengan betul jika bayar lebih | Ujian negatif: Masukkan tunai RM1000 untuk bayaran RM871.50 | Baki RM128.50 dipaparkan |
| AC-03 | Sistem menolak jika tunai kurang | Ujian negatif: Masukkan tunai RM800 untuk bayaran RM871.50 | Sistem minta tambah bayaran |
| AC-04 | Pembayar boleh membuat pembayaran online melalui FPX | Ujian integrasi: Ikut aliran pembayaran online | Transaksi berjaya, resit dihantar ke emel |
| AC-05 | Sistem menerima callback FPX dan mengemaskini status | Ujian callback: Hantar mock callback dari FPX | Status transaksi dikemaskini kepada 'SUCCESS' |
| AC-06 | Sistem mengesan transaksi pendua (idempotency) | Ujian idempotency: Hantar permintaan yang sama dua kali | Transaksi kedua ditolak/dikembalikan transaksi asal |
| AC-07 | Eksekutif boleh mendaftar cek dan mengesahkan cek clear | Ujian pengurusan cek: Daftar cek, kemudian sah clear | Status cek bertukar kepada 'CLEAR' |
| AC-08 | Sistem mengurus cek bounce dengan betul | Ujian cek bounce: Tandakan cek sebagai bounce | Status 'BOUNCE', notifikasi dihantar |
| AC-09 | Eksekutif boleh memohon reversal untuk transaksi tersilap | Ujian reversal: Mohon reversal, luluskan | Transaksi asal status 'REVERSED', transaksi reversal direkod |
| AC-10 | Reversal > RM500 memerlukan kelulusan penyelia | Ujian aliran kerja: Mohon reversal RM1000 | Status 'PENDING', penyelia lulus, bar |


| ID Objektif | Pernyataan Objektif |
| --- | --- |
| OBJ-01 | Menyediakan enjin pemprosesan transaksi yang mantap, scalable, dan可靠 (reliable) untuk mengendalikan volum transaksi tinggi |
| OBJ-02 | Melaksanakan validasi transaksi yang komprehensif pada setiap peringkat pemprosesan |
| OBJ-03 | Memastikan kawalan idempotency yang ketat untuk mengelakkan pemprosesan transaksi berganda |
| OBJ-04 | Menyediakan mekanisme pengesanan dan pengurusan transaksi pendua (duplicate engine) |
| OBJ-05 | Mengurus kitaran hidup status transaksi dengan tepat dan konsisten |
| OBJ-06 | Menyediakan mekanisme percubaan semula (retry mechanism) untuk transaksi yang gagal disebabkan isu sementara |
| OBJ-07 | Memastikan integriti data dan ketekalan (consistency) transaksi walaupun dalam situasi kegagalan sistem |
| OBJ-08 | Menyediakan mekanisme audit lengkap untuk setiap langkah pemprosesan transaksi |
| OBJ-09 | Mengoptimumkan prestasi pemprosesan untuk mengendalikan beban puncak (500,000 transaksi) |
| OBJ-10 | Menyokong pemprosesan segerak (synchronous) dan tak segerak (asynchronous) mengikut keperluan |


| Perkara | Skop |
| --- | --- |
| Entiti Utama | Transaction Queue, Processing Job, Status History, Retry Log, Duplicate Log |
| Proses Utama | Validasi Transaksi, Idempotency Check, Duplicate Detection, Status Processing, Retry Mechanism, Audit Logging |
| Jenis Pemprosesan | Synchronous Processing (real-time), Asynchronous Processing (queue-based), Batch Processing |
| Sumber Transaksi | Kaunter (Modul 3), Portal Online (Modul 3), SPG (Modul 6), Batch Upload (Modul 5), Integrasi (Modul 7) |
| Integrasi Dalaman | Modul 2 (Jenis Zakat), Modul 3 (Transaksi), Modul 7 (Integrasi), Modul 8 (Reconciliation), Modul 12 (Audit) |
| Teknologi | Message Queue (RabbitMQ/Kafka), Scheduler (Quartz), Cache (Redis), Database (PostgreSQL) |
| Had Skop | Tidak meliputi antara muka pengguna langsung (kecuali monitoring), tidak meliputi penjanaan laporan analitik (Modul 9) |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-01 | Validasi Format Data | Mengesahkan format data transaksi mematuhi spesifikasi yang ditetapkan | Tinggi |
| FR-02 | Validasi Mandatori | Mengesahkan semua medan wajib diisi dengan lengkap | Tinggi |
| FR-03 | Validasi Rujukan | Mengesahkan kewujudan dan status rujukan (contoh: ID pembayar, ID jenis zakat) | Tinggi |
| FR-04 | Validasi Logik Perniagaan | Mengesahkan pematuhan kepada peraturan perniagaan (contoh: amaun minimum, had transaksi) | Tinggi |
| FR-05 | Validasi Integriti | Mengesahkan integriti data (checksum, signature) untuk transaksi dari sumber luar | Tinggi |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-06 | Penjanaan Idempotency Key | Menjana key unik untuk setiap permintaan transaksi | Tinggi |
| FR-07 | Semakan Idempotency | Menyemak samada transaksi dengan key yang sama telah diproses | Tinggi |
| FR-08 | Cache Idempotency | Menyimpan rekod idempotency dalam cache untuk capaian pantas | Tinggi |
| FR-09 | Tamat Tempoh Key | Menetapkan tempoh sah laku untuk idempotency key | Sederhana |
| FR-10 | Pemulangan Transaksi Sedia Ada | Mengembalikan transaksi sedia ada jika key duplikat dikesan | Tinggi |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-11 | Pengesanan Pendua Transaksi | Mengesan transaksi yang berpotensi pendua berdasarkan kriteria tertentu | Tinggi |
| FR-12 | Peraturan Pendua | Konfigurasi peraturan untuk pengesanan pendua (tempoh, amaun, pembayar) | Sederhana |
| FR-13 | Semakan Sejarah Transaksi | Menyemak sejarah transaksi pembayar untuk tempoh tertentu | Tinggi |
| FR-14 | Flag Pendua | Menandakan transaksi yang dikesan sebagai pendua untuk semakan manual | Sederhana |
| FR-15 | Laporan Pendua | Menjana laporan transaksi pendua untuk tindakan susulan | Rendah |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-16 | Pengurusan Kitaran Status | Mengurus peralihan status transaksi mengikut aliran kerja yang ditetapkan | Tinggi |
| FR-17 | Kemaskini Status | Mengemaskini status transaksi secara real-time | Tinggi |
| FR-18 | Sejarah Status | Merekod setiap perubahan status untuk tujuan audit | Tinggi |
| FR-19 | Notifikasi Status | Menghantar notifikasi apabila status berubah (kepada modul berkaitan) | Sederhana |
| FR-20 | Status Timeout | Menetapkan dan mengurus status timeout untuk transaksi yang tergantung | Tinggi |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-21 | Pengesanan Transaksi Gagal | Mengesan transaksi yang gagal diproses | Tinggi |
| FR-22 | Penjadualan Semula | Menjadualkan semula transaksi yang gagal untuk diproses semula | Tinggi |
| FR-23 | Had Percubaan | Menetapkan had maksimum percubaan semula (contoh: 3 kali) | Tinggi |
| FR-24 | Exponential Backoff | Melaksanakan mekanisme exponential backoff untuk percubaan berturut-turut | Sederhana |
| FR-25 | Dead Letter Queue | Memindahkan transaksi yang gagal selepas had percubaan ke dead letter queue | Tinggi |
| FR-26 | Notifikasi Kegagalan | Menghantar notifikasi untuk transaksi yang gagal selepas semua percubaan | Sederhana |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-27 | Enqueue Transaksi | Memasukkan transaksi ke dalam queue untuk pemprosesan asynchronous | Tinggi |
| FR-28 | Dequeue Transaksi | Mengeluarkan transaksi dari queue untuk diproses | Tinggi |
| FR-29 | Prioriti Queue | Menyokong keutamaan pemprosesan (contoh: transaksi online diutamakan) | Sederhana |
| FR-30 | Monitoring Queue | Memantau panjang queue dan prestasi pemprosesan | Sederhana |
| FR-31 | Dead Letter Queue Management | Mengurus transaksi dalam dead letter queue (semak, proses semula, hapus) | Tinggi |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-32 | Dashboard Pemprosesan | Memaparkan status pemprosesan masa nyata (throughput, queue length, error rate) | Sederhana |
| FR-33 | Alerting | Menghantar alert jika berlaku isu pemprosesan (queue terlalu panjang, error rate tinggi) | Sederhana |
| FR-34 | Log Pemprosesan | Merekod setiap langkah pemprosesan untuk debugging | Tinggi |
| FR-35 | Health Check | Menyediakan endpoint health check untuk sistem pemantauan | Sederhana |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-36 | Audit Trail Pemprosesan | Merekod setiap langkah pemprosesan untuk tujuan audit | Tinggi |
| FR-37 | Distributed Tracing | Menyokong distributed tracing untuk menjejak transaksi merentas modul | Sederhana |
| FR-38 | Log Berstruktur | Menyimpan log dalam format berstruktur (JSON) untuk analisis | Sederhana |
| FR-39 | Correlation ID | Menyediakan correlation ID yang unik untuk setiap transaksi merentas sistem | Tinggi |


| Item | Detail |
| --- | --- |
| ID | UC01 |
| Nama Use Case | Terima Transaksi |
| Aktor Utama | Sistem (Modul 3, 5, 6, 7) |
| Aktor Sekunder | Payment Processing Engine |
| Penerangan | Menerima transaksi dari pelbagai sumber untuk diproses oleh enjin |
| Pre-condition | Transaksi telah dihasilkan oleh modul sumber; data transaksi lengkap |
| Post-condition | Transaksi diterima, melalui validasi, dan dimasukkan ke dalam queue |


| Item | Detail |
| --- | --- |
| ID | UC06 |
| Nama Use Case | Dequeue & Proses Transaksi |
| Aktor Utama | Scheduler (trigger berkala) |
| Aktor Sekunder | Payment Processing Engine, Modul Luar (FPX/Bank) |
| Penerangan | Mengeluarkan transaksi dari queue dan memprosesnya |
| Pre-condition | Terdapat transaksi dalam queue dengan status 'PENDING' |
| Post-condition | Transaksi diproses (berjaya/gagal) dan status dikemaskini |


| Item | Detail |
| --- | --- |
| ID | UC08 |
| Nama Use Case | Urus Retry (Percubaan Semula) |
| Aktor Utama | Scheduler |
| Aktor Sekunder | Payment Processing Engine |
| Penerangan | Mengurus percubaan semula untuk transaksi yang gagal diproses |
| Pre-condition | Terdapat transaksi dalam retry queue dengan status 'FAILED' |
| Post-condition | Transaksi diproses semula atau dipindah ke dead letter queue |


| Kod Modul | Sub-Modul | Penerangan | Fungsi Utama |
| --- | --- | --- | --- |
| PE-01 | Transaction Validation | Validasi transaksi di pelbagai peringkat |  |
| PE-01-01 | Format Validator | Mengesahkan format data (JSON/XML) | Schema validation, field presence |
| PE-01-02 | Business Rule Validator | Mengesahkan peraturan perniagaan | Amaun, had, syarat |
| PE-01-03 | Reference Validator | Mengesahkan rujukan ke entiti lain | ID pembayar, ID jenis zakat |
| PE-01-04 | Integrity Validator | Mengesahkan integriti data (signature/checksum) | Untuk data dari integrasi |
| PE-01-05 | Validation Rules Engine | Enjin peraturan untuk validasi | Konfigurasi rules |
|  |  |  |  |
| PE-02 | Idempotency Control | Kawalan untuk mengelakkan transaksi berganda |  |
| PE-02-01 | Key Generator | Menjana idempotency key unik | UUID, hash-based |
| PE-02-02 | Key Storage | Menyimpan key dalam cache (Redis) | TTL, eviction policy |
| PE-02-03 | Key Lookup | Mencari dan membanding key | Exact match |
| PE-02-04 | Response Cache | Menyimpan response untuk key yang sama | Return existing transaction |
| PE-02-05 | Key Cleanup | Membersih key yang telah tamat tempoh | Scheduled job |
|  |  |  |  |
| PE-03 | Duplicate Engine | Pengesanan transaksi pendua |  |
| PE-03-01 | Duplicate Rules | Konfigurasi peraturan pendua | Tempoh, kriteria, skor |
| PE-03-02 | History Search | Mencari sejarah transaksi pembayar | Mengikut tempoh |
| PE-03-03 | Matching Algorithm | Algoritma padanan (exact/fuzzy) | Skor padanan |
| PE-03-04 | Duplicate Flagging | Menandakan transaksi pendua | Status, reason |
| PE-03-05 | Duplicate Report | Laporan transaksi pendua | Untuk semakan manual |
|  |  |  |  |
| PE-04 | Status Processing | Pengurusan kitaran status transaksi |  |
| PE-04-01 | State Machine | Enjin state machine untuk status transaksi | Definisi state, transitions |
| PE-04-02 | Status Updater | Mengemaskini status transaksi | Update database |
| PE-04-03 | Status History | Merekod sejarah perubahan status | Log setiap perubahan |
| PE-04-04 | Status Timeout | Mengurus timeout untuk status tertentu | Scheduled check |
| PE-04-05 | Status Notification | Menghantar notifikasi perubahan status | Callback, event |
|  |  |  |  |
| PE-05 | Retry Mechanism | Mekanisme percubaan semula untuk transaksi gagal |  |
| PE-05-01 | Retry Queue | Queue khas untuk transaksi yang perlu dicuba semula | Priority queue |
| PE-05-02 | Retry Scheduler | Penjadual untuk mencuba semula | Exponential backoff |
| PE-05-03 | Retry Counter | Mengira bilangan percubaan | Max retry limit |
| PE-05-04 | Dead Letter Queue | Queue untuk transaksi yang gagal kekal | Manual intervention |
| PE-05-05 | Retry Log | Merekod setiap percubaan semula | Untuk audit |
|  |  |  |  |
| PE-06 | Queue Management | Pengurusan queue pemprosesan |  |
| PE-06-01 | Message Queue | Queue untuk transaksi pending | RabbitMQ/Kafka |
| PE-06-02 | Priority Queue | Queue dengan keutamaan | Priority based on channel |
| PE-06-03 | Queue Monitor | Pemantauan panjang queue | Metrics, alert |
| PE-06-04 | Queue Consumer | Proses yang mengambil dari queue | Worker threads |
| PE-06-05 | DLQ Management | Pengurusan dead letter queue | Semak, proses semula, hapus |
|  |  |  |  |
| PE-07 | Processing Monitoring | Pemantauan prestasi pemprosesan |  |
| PE-07-01 | Throughput Monitor | Memantau kadar pemprosesan | Transaksi sesaat |
| PE-07-02 | Error Rate Monitor | Memantau kadar ralat | Percentage |
| PE-07-03 | Queue Length Monitor | Memantau panjang queue | Current, trend |
| PE-07-04 | Alerting | Menghantar alert jika melebihi ambang | Email, dashboard |
| PE-07-05 | Dashboard | Paparan status pemprosesan | Graf, angka |
|  |  |  |  |
| PE-08 | Audit & Tracing | Audit dan penjejakan transaksi |  |
| PE-08-01 | Correlation ID | Penjanaan dan pengurusan correlation ID | Merentas sistem |
| PE-08-02 | Processing Log | Log setiap langkah pemprosesan | JSON structured |
| PE-08-03 | Distributed Tracing | Tracing merentas modul | OpenTelemetry |
| PE-08-04 | Audit Trail | Rekod lengkap untuk audit | Siapa, bila, apa |
| PE-08-05 | Log Viewer | Antara muka untuk melihat log | Filter, search |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| queue_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| correlation_id | VARCHAR | 50 | NO | - | ID untuk tracing merentas sistem |
| transaction_id | UUID | - | YES | - | FK ke TRANSACTION_MASTER (jika sudah dijana) |
| queue_type | VARCHAR | 20 | NO | MAIN' | MAIN'/'RETRY'/'PRIORITY' |
| priority | INTEGER | - | NO | 5 | 1 (tertinggi) - 10 (terendah) |
| payload | TEXT | - | NO | - | JSON data transaksi |
| status | VARCHAR | 20 | NO | QUEUED' | QUEUED'/'PROCESSING'/'COMPLETED'/'FAILED' |
| enqueued_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh masuk queue |
| dequeued_date | TIMESTAMP | - | YES | - | Tarikh dikeluarkan dari queue |
| processing_start | TIMESTAMP | - | YES | - | Mula diproses |
| processing_end | TIMESTAMP | - | YES | - | Selesai diproses |
| retry_count | INTEGER | - | NO | 0 | Bilangan percubaan semula |
| next_retry_date | TIMESTAMP | - | YES | - | Tarikh untuk cuba semula seterusnya |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| key_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| idempotency_key | VARCHAR | 100 | NO | - | Key unik dari permintaan |
| transaction_id | UUID | - | NO | - | FK ke TRANSACTION_MASTER |
| request_hash | VARCHAR | 64 | NO | - | Hash permintaan untuk pengesahan |
| response_data | TEXT | - | YES | - | Cache response |
| expiry_date | TIMESTAMP | - | NO | - | Tarikh luput key |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| duplicate_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| transaction_id | UUID | - | NO | - | FK ke TRANSACTION_MASTER (transaksi semasa) |
| original_transaction_id | UUID | - | YES | - | FK ke TRANSACTION_MASTER (transaksi asal) |
| match_score | DECIMAL | 5,2 | NO | - | Skor padanan (0-100) |
| matched_criteria | TEXT | - | NO | - | JSON: kriteria yang sepadan |
| detection_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh kesan |
| status | VARCHAR | 20 | NO | NEW' | NEW'/'REVIEWED'/'IGNORED'/'CONFIRMED' |
| resolved_by | VARCHAR | 50 | YES | - | User ID penyelesai |
| resolved_date | TIMESTAMP | - | YES | - | Tarikh selesai |
| remarks | TEXT | - | YES | - | Catatan |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| log_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| correlation_id | VARCHAR | 50 | NO | - | ID untuk tracing |
| transaction_id | UUID | - | YES | - | FK ke TRANSACTION_MASTER |
| step | VARCHAR | 50 | NO | - | Langkah pemprosesan |
| status | VARCHAR | 20 | NO | - | STARTED'/'SUCCESS'/'FAILED' |
| message | TEXT | - | YES | - | Mesej log |
| duration_ms | INTEGER | - | YES | - | Tempoh langkah (ms) |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh log |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| retry_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| transaction_id | UUID | - | NO | - | FK ke TRANSACTION_MASTER |
| attempt_number | INTEGER | - | NO | - | Nombor percubaan (1,2,3) |
| attempt_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh percubaan |
| status | VARCHAR | 20 | NO | - | SUCCESS'/'FAILED' |
| error_message | TEXT | - | YES | - | Mesej ralat (jika gagal) |
| next_attempt_date | TIMESTAMP | - | YES | - | Tarikh percubaan seterusnya |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| dlq_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| transaction_id | UUID | - | NO | - | FK ke TRANSACTION_MASTER |
| correlation_id | VARCHAR | 50 | NO | - | ID untuk tracing |
| payload | TEXT | - | NO | - | JSON data transaksi |
| error_reason | TEXT | - | NO | - | Sebab gagal kekal |
| retry_history | TEXT | - | NO | - | JSON: sejarah percubaan |
| moved_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh masuk DLQ |
| status | VARCHAR | 20 | NO | PENDING' | PENDING'/'RESOLVED'/'ARCHIVED' |
| resolved_by | VARCHAR | 50 | YES | - | User ID penyelesai |
| resolved_date | TIMESTAMP | - | YES | - | Tarikh selesai |
| resolution_action | VARCHAR | 50 | YES | - | RETRY'/'MARK_SUCCESS'/'VOID' |
| remarks | TEXT | - | YES | - | Catatan |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| rule_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| rule_code | VARCHAR | 50 | NO | - | Kod unik peraturan |
| rule_name | VARCHAR | 100 | NO | - | Nama peraturan |
| rule_type | VARCHAR | 30 | NO | - | FORMAT'/'BUSINESS'/'REFERENCE' |
| rule_expression | TEXT | - | NO | - | Expression untuk validasi |
| error_message | TEXT | - | NO | - | Mesej ralat jika gagal |
| severity | VARCHAR | 20 | NO | ERROR' | ERROR'/'WARNING'/'INFO' |
| is_active | BOOLEAN | - | NO | 1 | Status aktif |
| applies_to | VARCHAR | 50 | NO | ALL' | FPX'/'CASH'/'CHEQUE'/'ALL' |
| priority | INTEGER | - | NO | 5 | Keutamaan (1 tertinggi) |
| created_by | VARCHAR | 50 | NO | - | User ID pencipta |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |
| modified_by | VARCHAR | 50 | YES | - | User ID pengemaskini |
| modified_date | TIMESTAMP | - | YES | - | Tarikh kemaskini |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| rule_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| rule_name | VARCHAR | 100 | NO | - | Nama peraturan |
| criteria_fields | TEXT | - | NO | - | JSON: medan untuk semakan |
| time_window_hours | INTEGER | - | NO | 24 | Tempoh semakan (jam) |
| match_threshold | DECIMAL | 5,2 | NO | 90.00 | Threshold skor padanan |
| action | VARCHAR | 20 | NO | FLAG' | FLAG'/'BLOCK'/'WARN' |
| is_active | BOOLEAN | - | NO | 1 | Status aktif |
| priority | INTEGER | - | NO | 5 | Keutamaan |
| created_by | VARCHAR | 50 | NO | - | User ID pencipta |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Role ID | Role Name | Penerangan |
| --- | --- | --- |
| R01 | Pentadbir Sistem | Akses penuh ke semua fungsi enjin termasuk konfigurasi |
| R02 | Pengurus Operasi | Memantau pemprosesan, mengurus dead letter queue, lihat log |
| R03 | Operator Pemprosesan | Mengurus dead letter queue, retry manual, lihat dashboard |
| R04 | Juruaudit | Akses view sahaja untuk log dan audit trail |
| R05 | Pembangun | Akses terhad untuk debugging (log, tracing) |


| Fungsi / Sub-Modul | R01 | R02 | R03 | R04 | R05 |
| --- | --- | --- | --- | --- | --- |
| Dashboard |  |  |  |  |  |
| Lihat Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Lihat Metrics Terperinci | ✓ | ✓ | ✓ | ✗ | ✓ |
|  |  |  |  |  |  |
| Queue Management |  |  |  |  |  |
| Lihat Main Queue | ✓ | ✓ | ✓ | ✓ | ✓ |
| Lihat Retry Queue | ✓ | ✓ | ✓ | ✓ | ✓ |
| Lihat Dead Letter Queue | ✓ | ✓ | ✓ | ✓ | ✓ |
| Proses Semula DLQ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Arkib/Hapus DLQ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Pause/Resume Queue | ✓ | ✓ | ✗ | ✗ | ✗ |
|  |  |  |  |  |  |
| Carian Transaksi |  |  |  |  |  |
| Cari Mengikut Correlation ID | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cari Mengikut Transaction ID | ✓ | ✓ | ✓ | ✓ | ✓ |
| Lihat Butiran Pemprosesan | ✓ | ✓ | ✓ | ✓ | ✓ |
|  |  |  |  |  |  |
| Konfigurasi |  |  |  |  |  |
| Konfigurasi Validation Rules | ✓ | ✗ | ✗ | ✗ | ✗ |
| Konfigurasi Idempotency | ✓ | ✗ | ✗ | ✗ | ✗ |
| Konfigurasi Duplicate Rules | ✓ | ✓ | ✗ | ✗ | ✗ |
| Konfigurasi Retry Settings | ✓ | ✓ | ✗ | ✗ | ✗ |
| Konfigurasi Queue Settings | ✓ | ✗ | ✗ | ✗ | ✗ |
|  |  |  |  |  |  |
| Log & Audit |  |  |  |  |  |
| Lihat Processing Log | ✓ | ✓ | ✓ | ✓ | ✓ |
| Lihat Audit Trail | ✓ | ✓ | ✓ | ✓ | ✗ |
| Distributed Tracing | ✓ | ✓ | ✓ | ✗ | ✓ |
| Eksport Log | ✓ | ✓ | ✓ | ✓ | ✗ |
|  |  |  |  |  |  |
| Alert & Monitoring |  |  |  |  |  |
| Lihat Alert | ✓ | ✓ | ✓ | ✗ | ✗ |
| Konfigurasi Alert | ✓ | ✓ | ✗ | ✗ | ✗ |
| Acknowledge Alert | ✓ | ✓ | ✓ | ✗ | ✗ |


| Rule ID | Peraturan | Penerangan | Kesan Jika Dilanggar |
| --- | --- | --- | --- |
| BR-VAL-01 | Medan Wajib | Semua medan wajib mesti diisi | Transaksi ditolak |
| BR-VAL-02 | Format Amaun | Amaun mestilah nombor positif > 0 | Transaksi ditolak |
| BR-VAL-03 | Had Transaksi | Amaun dalam had minimum dan maksimum | Transaksi ditolak |
| BR-VAL-04 | Kewujudan Pembayar | ID pembayar mesti wujud dalam sistem | Transaksi ditolak |
| BR-VAL-05 | Status Pembayar | Pembayar mestilah berstatus 'ACTIVE' | Transaksi ditolak |
| BR-VAL-06 | Kewujudan Jenis Zakat | Jenis zakat mesti wujud dan aktif | Transaksi ditolak |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-IDP-01 | Key Unik | Setiap permintaan mesti mempunyai idempotency key yang unik |
| BR-IDP-02 | Tempoh Sah | Idempotency key sah untuk 24 jam |
| BR-IDP-03 | Hash Permintaan | Sistem menyimpan hash permintaan untuk memastikan konsistensi |
| BR-IDP-04 | Response Sama | Jika key sama, kembalikan response yang sama |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-DUP-01 | Tempoh Semakan | Semak transaksi dalam tempoh 24 jam yang lepas |
| BR-DUP-02 | Kriteria Pendua | Amaun sama, pembayar sama, dalam tempoh singkat |
| BR-DUP-03 | Threshold Pendua | Skor >= 90% dianggap pendua |
| BR-DUP-04 | Tindakan Pendua | Flag untuk semakan manual, tidak block secara auto |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-RTY-01 | Max Retry | Maksimum 3 percubaan semula |
| BR-RTY-02 | Exponential Backoff | Percubaan kedua selepas 1 min, ketiga selepas 2 min |
| BR-RTY-03 | Retry by Channel | Channel berbeza boleh ada setting berbeza |
| BR-RTY-04 | Dead Letter | Selepas max retry, pindah ke dead letter queue |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-STA-01 | Aliran Status | Status mesti mengikut aliran yang ditetapkan |
| BR-STA-02 | Log Perubahan | Setiap perubahan status direkod |
| BR-STA-03 | Timeout | Transaksi PENDING > 1 jam ditandakan TIMEOUT |


| Objektif | Fungsi Keperluan Berkaitan |
| --- | --- |
| OBJ-01: Enjin mantap dan scalable | FR-27 hingga FR-31 (Queue Management) |
| OBJ-02: Validasi komprehensif | FR-01 hingga FR-05 (Transaction Validation) |
| OBJ-03: Kawalan idempotency | FR-06 hingga FR-10 (Idempotency Control) |
| OBJ-04: Pengesanan pendua | FR-11 hingga FR-15 (Duplicate Engine) |
| OBJ-05: Kitaran status | FR-16 hingga FR-20 (Status Processing) |
| OBJ-06: Retry mechanism | FR-21 hingga FR-26 (Retry Mechanism) |
| OBJ-07: Integriti data | FR-01, FR-05, FR-18 |
| OBJ-08: Audit lengkap | FR-36 hingga FR-39 (Audit & Tracing) |
| OBJ-09: Prestasi puncak | FR-29 (Priority), FR-32 (Monitoring) |
| OBJ-10: Segerak/tak segerak | FR-27 (Enqueue), FR-28 (Dequeue) |


| Fungsi Keperluan | Use Case Berkaitan |
| --- | --- |
| FR-01 hingga FR-05: Validasi | UC02 (Validasi Transaksi) |
| FR-06 hingga FR-10: Idempotency | UC03 (Semak Idempotency) |
| FR-11 hingga FR-15: Duplicate | UC04 (Semak Pendua) |
| FR-16 hingga FR-20: Status | UC07 (Kemaskini Status) |
| FR-21 hingga FR-26: Retry | UC08 (Urus Retry) |
| FR-27 hingga FR-31: Queue | UC05 (Enqueue), UC06 (Dequeue) |
| FR-32 hingga FR-35: Monitoring | UC10 (Monitor Pemprosesan) |
| FR-36 hingga FR-39: Audit | UC12 (Lihat Log) |


| Use Case | Role Dibenarkan |
| --- | --- |
| UC01: Terima Transaksi | Sistem (API) |
| UC02: Validasi Transaksi | Sistem (auto) |
| UC03: Semak Idempotency | Sistem (auto) |
| UC04: Semak Pendua | Sistem (auto) |
| UC05: Enqueue Transaksi | Sistem (auto) |
| UC06: Dequeue & Proses | Sistem (auto) |
| UC07: Kemaskini Status | Sistem (auto) |
| UC08: Urus Retry | Sistem (auto) |
| UC09: Urus Dead Letter Queue | R01, R02, R03 |
| UC10: Monitor Pemprosesan | R01, R02, R03, R04, R05 |
| UC11: Konfigurasi Enjin | R01, R02 (terhad) |
| UC12: Lihat Log Pemprosesan | R01, R02, R03, R04, R05 |


| POC Document Section | Page | Modul 4 Sub-Modul |
| --- | --- | --- |
| Payment Processing Engine | 1 | Semua sub-modul PE-01 hingga PE-08 |
| Transaction Validation | 1 | PE-01 |
| Idempotency Control | 1 | PE-02 |
| Duplicate Engine | 1 | PE-03 |
| Status Processing | 1 | PE-04 |
| Retry Mechanism | 1 | PE-05 |
| Processing Solution | 3 | PE-06, PE-07 |
| High volume transaction | 4 | PE-06 (Queue), PE-05 (Retry) |
| Audit Trail | 3 | PE-08 |


| Domain | Nilai | Penerangan |
| --- | --- | --- |
| queue_type | MAIN' | Queue utama untuk pemprosesan |
|  | RETRY' | Queue untuk percubaan semula |
|  | PRIORITY' | Queue keutamaan tinggi |
|  | DLQ' | Dead Letter Queue |
|  |  |  |
| queue_status | QUEUED' | Dalam queue, menunggu |
|  | PROCESSING' | Sedang diproses |
|  | COMPLETED' | Selesai diproses |
|  | FAILED' | Gagal diproses |
|  |  |  |
| duplicate_status | NEW' | Baru dikesan |
|  | REVIEWED' | Telah disemak |
|  | IGNORED' | Diabaikan (bukan pendua) |
|  | CONFIRMED' | Disahkan pendua |
|  |  |  |
| rule_type | FORMAT' | Validasi format |
|  | BUSINESS' | Validasi perniagaan |
|  | REFERENCE' | Validasi rujukan |
|  |  |  |
| severity | ERROR' | Ralat - transaksi ditolak |
|  | WARNING' | Amaran - transaksi diterima |
|  | INFO' | Informasi |


| Table | Column | Data Type | Length | Penerangan | Sumber Data |
| --- | --- | --- | --- | --- | --- |
| PROCESSING_QUEUE | queue_id | UUID | - | ID unik queue entry | System |
|  | correlation_id | VARCHAR | 50 | ID untuk tracing | System |
|  | transaction_id | UUID | - | FK ke TRANSACTION_MASTER | From M3 |
|  | queue_type | VARCHAR | 20 | Jenis queue | System |
|  | priority | INTEGER | - | Keutamaan (1-10) | From config |
|  | payload | TEXT | - | JSON data transaksi | From source |
|  | status | VARCHAR | 20 | Status pemprosesan | System |
|  | enqueued_date | TIMESTAMP | - | Tarikh masuk queue | System |
|  | dequeued_date | TIMESTAMP | - | Tarikh dikeluarkan | System |
|  | processing_start | TIMESTAMP | - | Mula diproses | System |
|  | processing_end | TIMESTAMP | - | Selesai diproses | System |
|  | retry_count | INTEGER | - | Bilangan percubaan | System |
|  | next_retry_date | TIMESTAMP | - | Tarikh retry seterusnya | System |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  |  |  |  |  |  |
| IDEMPOTENCY_KEY | key_id | UUID | - | ID unik | System |
|  | idempotency_key | VARCHAR | 100 | Key dari permintaan | From request |
|  | transaction_id | UUID | - | FK ke transaksi | From M3 |
|  | request_hash | VARCHAR | 64 | Hash permintaan | System |
|  | response_data | TEXT | - | Cache response | System |
|  | expiry_date | TIMESTAMP | - | Tarikh luput | System |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  |  |  |  |  |  |
| DUPLICATE_LOG | duplicate_id | UUID | - | ID unik | System |
|  | transaction_id | UUID | - | Transaksi semasa | From M3 |
|  | original_transaction_id | UUID | - | Transaksi asal | From M3 |
|  | match_score | DECIMAL | 5,2 | Skor padanan | System |
|  | matched_criteria | TEXT | - | JSON kriteria | System |
|  | detection_date | TIMESTAMP | - | Tarikh kesan | System |
|  | status | VARCHAR | 20 | Status | System |
|  | resolved_by | VARCHAR | 50 | User ID penyelesai | Session |
|  | resolved_date | TIMESTAMP | - | Tarikh selesai | System |
|  | remarks | TEXT | - | Catatan | User input |
|  |  |  |  |  |  |
| DEAD_LETTER_QUEUE | dlq_id | UUID | - | ID unik | System |
|  | transaction_id | UUID | - | FK ke transaksi | From M3 |
|  | correlation_id | VARCHAR | 50 | ID tracing | System |
|  | payload | TEXT | - | JSON data | System |
|  | error_reason | TEXT | - | Sebab gagal | System |
|  | retry_history | TEXT | - | JSON sejarah retry | System |
|  | moved_date | TIMESTAMP | - | Tarikh masuk DLQ | System |
|  | status | VARCHAR | 20 | Status | System |
|  | resolved_by | VARCHAR | 50 | User ID penyelesai | Session |
|  | resolved_date | TIMESTAMP | - | Tarikh selesai | System |
|  | resolution_action | VARCHAR | 50 | Tindakan | User input |
|  | remarks | TEXT | - | Catatan | User input |


| AC ID | Kriteria | Kaedah Ujian | Keputusan Jangkaan |
| --- | --- | --- | --- |
| AC-01 | Enjin menerima transaksi melalui API dengan validasi lengkap | Hantar transaksi valid melalui API | Response 202 Accepted, transaksi masuk queue |
| AC-02 | Enjin menolak transaksi dengan data tidak valid | Hantar transaksi dengan medan wajib kosong | Response 400 Bad Request dengan error details |
| AC-03 | Enjin mengesan dan mengembalikan transaksi sedia ada untuk idempotency key yang sama | Hantar permintaan yang sama dua kali | Kali kedua terima response dengan transaksi asal |
| AC-04 | Enjin mengesan transaksi pendua berdasarkan peraturan | Hantar dua transaksi serupa dalam tempoh 5 minit | Transaksi kedua di-flag sebagai pendua |
| AC-05 | Enjin memproses transaksi asynchronous melalui queue | Hantar transaksi, semak status selepas beberapa saat | Transaksi diproses, status 'SUCCESS' |
| AC-06 | Enjin mengurus retry untuk transaksi yang gagal | Simulasi kegagalan sementara (FPX timeout) | Transaksi masuk retry queue, cuba semula |
| AC-07 | Enjin memindahkan transaksi ke DLQ selepas had retry | Simulasi kegagalan berterusan 3 kali | Transaksi masuk DLQ, notifikasi dihantar |
| AC-08 | Operator boleh memproses semula transaksi dari DLQ | Pilih transaksi DLQ, klik "Proses Semula" | Transaksi diproses semula, keluar dari DLQ |
| AC-09 | Enjin merekod setiap langkah pemprosesan dalam log | Semak log untuk transaksi tertentu | Setiap langkah direkod dengan masa dan status |
| AC-10 | Dashboard memaparkan metrik pemprosesan masa nyata | Lihat dashboard | Metrik dikemaskini setiap beberapa saat |


| AC ID | Kriteria | Kaedah Ujian | Keputusan Jangkaan |
| --- | --- | --- | --- |
| AC-P01 | Enjin boleh memproses 500 transaksi sesaat | Ujian beban dengan 500 TPS | Throughput stabil, tiada queue backlog |
| AC-P02 | Enjin boleh mengendalikan 500,000 transaksi dalam sehari | Simulasi beban puncak | Semua transaksi diproses dalam masa 24 jam |
| AC-P03 | Latensi pemprosesan < 500ms untuk 95% transaksi | Ukur masa pemprosesan | 95% transaksi < 500ms |
| AC-P04 | Idempotency check < 10ms | Ukur masa semakan key | Response dalam 10ms |


| AC ID | Kriteria | Kaedah Ujian | Keputusan Jangkaan |
| --- | --- | --- | --- |
| AC-R01 | Tiada kehilangan transaksi dalam queue jika sistem restart | Simulasi restart server | Transaksi kekal dalam queue, diproses selepas restart |
| AC-R02 | Sistem pulih secara automatik selepas kegagalan | Simulasi kegagalan komponen | Auto-recovery, queue mula semula |
| AC-R03 | Data konsisten selepas sebarang kegagalan | Semak data sebelum dan selepas | Tiada data loss atau corruption |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-13 | Penjanaan Batch ID | Menjana ID unik untuk setiap batch yang diterima | Tinggi |
| FR-14 | Status Batch | Mengurus kitaran status batch (UPLOADED, VALIDATING, PROCESSING, COMPLETED, FAILED) | Tinggi |
| FR-15 | Penjadualan Batch | Menjadualkan pemprosesan batch (segera atau berjadual) | Sederhana |
| FR-16 | Prioriti Batch | Menetapkan keutamaan pemprosesan batch | Sederhana |
| FR-17 | Pembatalan Batch | Membenarkan pembatalan batch yang belum diproses | Sederhana |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-18 | Pemprosesan Berjujukan | Memproses rekod dalam batch secara berjujukan | Tinggi |
| FR-19 | Pemprosesan Selari | Memproses rekod secara selari untuk batch besar | Tinggi |
| FR-20 | Transaksi Individu | Menghantar setiap rekod yang berjaya ke Modul 3 untuk penciptaan transaksi | Tinggi |
| FR-21 | Pengurusan Ralat | Mengurus rekod yang gagal diproses tanpa menjejaskan rekod lain | Tinggi |
| FR-22 | Rollback Parsial | Keupayaan untuk rollback sebahagian batch jika konfigurasi ditetapkan | Rendah |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-23 | Pengesanan Ralat per Rekod | Mengesan dan merekod ralat untuk setiap rekod yang gagal | Tinggi |
| FR-24 | Kategori Ralat | Mengkategorikan ralat (format, rujukan, perniagaan, sistem) | Tinggi |
| FR-25 | Laporan Ralat Terperinci | Menjana laporan ralat dengan butiran lengkap (baris, medan, sebab) | Tinggi |
| FR-26 | Eksport Laporan Ralat | Membolehkan muat turun laporan ralat dalam format Excel/CSV | Tinggi |
| FR-27 | Notifikasi Ralat | Menghantar notifikasi kepada pengguna/operator jika ralat kritikal | Sederhana |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-28 | Pengurusan Separa Berjaya | Merekod kedua-dua transaksi berjaya dan gagal dalam batch yang sama | Tinggi |
| FR-29 | Ambang Kegagalan | Menetapkan ambang maksimum kegagalan (contoh: >10% gagal, batch ditolak) | Tinggi |
| FR-30 | Pilihan Penerusan | Membolehkan pengguna memilih untuk meneruskan walaupun ada ralat | Sederhana |
| FR-31 | Pembetulan Separa | Membolehkan pembetulan rekod yang gagal dan penghantaran semula | Sederhana |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-32 | Ringkasan Batch | Menjana ringkasan batch selepas pemprosesan | Tinggi |
| FR-33 | Statistik Pemprosesan | Memaparkan statistik (jumlah rekod, berjaya, gagal, masa proses) | Tinggi |
| FR-34 | Ringkasan Mengikut Jenis | Ringkasan mengikut jenis transaksi/jenis zakat | Sederhana |
| FR-35 | Ringkasan Kewangan | Ringkasan jumlah kewangan (jumlah kutipan) | Tinggi |
| FR-36 | Eksport Ringkasan | Membolehkan muat turun ringkasan dalam format PDF/Excel | Sederhana |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-37 | Konfigurasi Template | Membolehkan konfigurasi template fail untuk pelbagai jenis batch | Tinggi |
| FR-38 | Muat Turun Template | Menyediakan template contoh untuk dimuat turun pengguna | Tinggi |
| FR-39 | Versi Template | Mengurus versi template untuk keserasian ke belakang | Sederhana |
| FR-40 | Validation Rules per Template | Menetapkan peraturan validasi berbeza mengikut template | Tinggi |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-41 | Log Aktiviti Batch | Merekod semua aktiviti berkaitan batch (upload, proses, dll) | Tinggi |
| FR-42 | Sejarah Batch | Menyimpan sejarah batch untuk rujukan masa hadapan | Tinggi |
| FR-43 | Kebolehkesanan Transaksi | Menjejak transaksi individu kembali ke batch asal | Tinggi |
| FR-44 | Audit Trail | Rekod lengkap untuk tujuan audit (siapa, bila, apa) | Tinggi |


| Item | Detail |
| --- | --- |
| ID | UC01 |
| Nama Use Case | Upload Fail Manual |
| Aktor Utama | Eksekutif Pemprosesan, Majikan (SPG) |
| Aktor Sekunder | Sistem Batch Processing |
| Penerangan | Memuat naik fail batch secara manual melalui antara muka web |
| Pre-condition | Pengguna telah log masuk; fail batch sedia untuk dimuat naik |
| Post-condition | Fail diterima, divalidasi, dan batch direkod dengan status 'UPLOADED' |


| Item | Detail |
| --- | --- |
| ID | UC03 |
| Nama Use Case | Validasi Fail |
| Aktor Utama | Sistem (auto) |
| Aktor Sekunder | - |
| Penerangan | Melaksanakan validasi ke atas fail batch yang dimuat naik |
| Pre-condition | Fail telah dimuat naik dan direkod dalam sistem |
| Post-condition | Fail melalui validasi; rekod yang valid dan tidak valid dikenalpasti |


| Item | Detail |
| --- | --- |
| ID | UC05 |
| Nama Use Case | Proses Batch |
| Aktor Utama | Eksekutif Pemprosesan (manual), Scheduler (auto) |
| Aktor Sekunder | Modul 3 (Transaksi), Modul 4 (Payment Engine) |
| Penerangan | Memproses batch yang telah sedia untuk diproses |
| Pre-condition | Batch berstatus 'READY_FOR_PROCESSING' |
| Post-condition | Batch diproses; transaksi direkod; ringkasan dan laporan ralat dijana |


| Kod Modul | Sub-Modul | Penerangan | Fungsi Utama |
| --- | --- | --- | --- |
| BP-01 | Batch Upload | Pengurusan muat naik fail batch |  |
| BP-01-01 | Upload Manual | Muat naik melalui antara muka web | Pilih fail, pilih jenis, upload |
| BP-01-02 | Upload FTP | Muat naik automatik melalui FTP | Monitor folder, proses fail |
| BP-01-03 | Upload API | Muat naik melalui API | Endpoint API, validasi |
| BP-01-04 | Pengesanan Fail Pendua | Mengesan fail berulang | Hash comparison, metadata |
| BP-01-05 | Status Upload | Papar status upload | Progress bar, mesej |
|  |  |  |  |
| BP-02 | File Validation | Validasi fail batch |  |
| BP-02-01 | Format Validator | Mengesah format fail (CSV/Excel/TXT) | Baca struktur, detect delimiter |
| BP-02-02 | Structure Validator | Mengesah struktur (header, kolom) | Banding dengan template |
| BP-02-03 | Data Validator | Mengesah data setiap rekod | Format, jenis data, julat |
| BP-02-04 | Reference Validator | Mengesah rujukan data | ID pembayar, kod zakat |
| BP-02-05 | Business Rule Validator | Mengesah peraturan perniagaan | Amaun, tarikh, syarat |
| BP-02-06 | Checksum Validator | Mengesah integriti fail | Hash comparison |
|  |  |  |  |
| BP-03 | Batch Management | Pengurusan kitaran hidup batch |  |
| BP-03-01 | Batch Creation | Menjana rekod batch baru | Batch ID, metadata |
| BP-03-02 | Status Management | Mengurus status batch | State machine, transitions |
| BP-03-03 | Batch Scheduling | Menjadualkan pemprosesan batch | Cron, priority |
| BP-03-04 | Batch Cancellation | Membatalkan batch | Cancel pending/processing |
| BP-03-05 | Batch Search | Mencari batch pelbagai kriteria | Filter, sort |
|  |  |  |  |
| BP-04 | Batch Processing | Pemprosesan transaksi batch |  |
| BP-04-01 | Sequential Processing | Proses berjujukan | Satu demi satu |
| BP-04-02 | Parallel Processing | Proses selari untuk prestasi | Multi-thread, partition |
| BP-04-03 | Transaction Creation | Hantar ke Modul 3 untuk cipta transaksi | API call, response |
| BP-04-04 | Error Handling | Mengurus rekod gagal | Log, continue |
| BP-04-05 | Progress Tracking | Jejak kemajuan pemprosesan | Percentage, ETA |
| BP-04-06 | Resume Capability | Sambung semula batch tergendala | Checkpoint, restart |
|  |  |  |  |
| BP-05 | Error Reporting | Laporan ralat batch |  |
| BP-05-01 | Error Detection | Mengesan dan merekod ralat | Per rekod, per medan |
| BP-05-02 | Error Categorization | Mengkategorikan ralat | Format, rujukan, sistem |
| BP-05-03 | Error Report Generation | Menjana laporan ralat | Senarai rekod gagal |
| BP-05-04 | Error Report Export | Muat turun laporan ralat | Excel, CSV, PDF |
| BP-05-05 | Error Notification | Notifikasi ralat kritikal | Email, dashboard |
|  |  |  |  |
| BP-06 | Partial Success Handling | Pengurusan kejayaan separa |  |
| BP-06-01 | Success/Failure Tracking | Merekod status setiap rekod | Berjaya/gagal |
| BP-06-02 | Threshold Management | Mengurus ambang kegagalan | Konfigurasi, tindakan |
| BP-06-03 | Continue on Error | Teruskan walaupun ada ralat | Pilihan pengguna |
| BP-06-04 | Partial Correction | Pembetulan rekod gagal | Edit, resubmit |
|  |  |  |  |
| BP-07 | Batch Summary | Ringkasan dan laporan batch |  |
| BP-07-01 | Summary Generation | Menjana ringkasan batch | Statistik, kewangan |
| BP-07-02 | Financial Summary | Ringkasan kewangan | Jumlah kutipan |
| BP-07-03 | Category Summary | Ringkasan mengikut jenis | Jenis zakat, channel |
| BP-07-04 | Summary Export | Muat turun ringkasan | PDF, Excel |
| BP-07-05 | Dashboard View | Paparan ringkasan dalam dashboard | Graf, angka |
|  |  |  |  |
| BP-08 | Template Management | Pengurusan template fail |  |
| BP-08-01 | Template Definition | Menentukan struktur template | Kolom, format, mandatory |
| BP-08-02 | Template Download | Muat turun template contoh | Excel, CSV |
| BP-08-03 | Template Versioning | Versi template | Compatibility |
| BP-08-04 | Validation Rules per Template | Peraturan validasi berbeza | Konfigurasi fleksibel |
|  |  |  |  |
| BP-09 | Audit & History | Audit dan sejarah batch |  |
| BP-09-01 | Batch Audit Log | Log aktiviti batch | Siapa, bila, apa |
| BP-09-02 | Batch History | Sejarah lengkap batch | Status changes |
| BP-09-03 | Transaction Traceability | Jejak transaksi ke batch asal | Batch ID dalam transaksi |
| BP-09-04 | Batch Reporting | Laporan prestasi batch | Bulanan, trend |


| Medan | Jenis Data | Panjang | Wajib | Validasi/Rules |
| --- | --- | --- | --- | --- |
| Batch Upload |  |  |  |  |
| Batch ID | System | 30 | Auto | Format: BATCH-YYYYMMDD-xxx |
| Jenis Batch | Dropdown | - | Ya | SPG/TRANSACTION/ADJUSTMENT |
| Template ID | UUID | - | Ya | Rujuk ke template |
| Nama Fail | Text | 255 | Auto | Nama fail asal |
| Saiz Fail | Number | - | Auto | Dalam bytes |
| Fail Hash | VARCHAR | 64 | Auto | SHA-256 hash |
| Status | System | 20 | Auto | UPLOADED/VALIDATING/READY/etc |
| Uploaded By | VARCHAR | 50 | Auto | User ID |
| Upload Date | Timestamp | - | Auto | Tarikh upload |
|  |  |  |  |  |
| Rekod Batch |  |  |  |  |
| Line Number | Integer | - | Ya | Baris dalam fail |
| Data | JSON | - | Ya | Data rekod |
| Validation Status | VARCHAR | 20 | Auto | VALID/INVALID |
| Error Codes | TEXT | - | Jika invalid | Senarai kod ralat |
| Processing Status | VARCHAR | 20 | Auto | PENDING/SUCCESS/FAILED |
| Transaction ID | UUID | - | Jika SUCCESS | Rujuk ke transaksi |
|  |  |  |  |  |
| Template |  |  |  |  |
| Template Code | VARCHAR | 20 | Ya | Unik |
| Template Name | VARCHAR | 100 | Ya | - |
| Batch Type | VARCHAR | 20 | Ya | SPG/TRANSACTION/ADJUSTMENT |
| Version | VARCHAR | 10 | Ya | Format: 1.0, 1.1 |
| File Format | VARCHAR | 20 | Ya | CSV/EXCEL/TXT |
| Header Row | Boolean | - | Ya | Ada header? |
| Delimiter | VARCHAR | 1 | Untuk CSV | , ; |
| Column Definition | TEXT | - | Ya | JSON definisi kolom |
| Validation Rules | TEXT | - | Ya | JSON peraturan validasi |
| Is Active | Boolean | - | Ya | Status aktif |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| batch_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| batch_no | VARCHAR | 30 | NO | - | No batch (format: BATCH-YYYYMMDD-xxx) |
| batch_type | VARCHAR | 20 | NO | - | SPG'/'TRANSACTION'/'ADJUSTMENT' |
| source | VARCHAR | 20 | NO | - | MANUAL'/'FTP'/'API' |
| template_id | UUID | - | YES | - | FK ke BATCH_TEMPLATE |
| file_name | VARCHAR | 255 | NO | - | Nama fail asal |
| file_size | INTEGER | - | NO | - | Saiz fail dalam bytes |
| file_hash | VARCHAR | 64 | NO | - | SHA-256 hash fail |
| file_path | VARCHAR | 500 | YES | - | Path simpanan fail |
| total_records | INTEGER | - | NO | 0 | Jumlah rekod dalam fail |
| valid_records | INTEGER | - | NO | 0 | Rekod valid selepas validasi |
| invalid_records | INTEGER | - | NO | 0 | Rekod tidak valid |
| processed_records | INTEGER | - | NO | 0 | Recod telah diproses |
| success_records | INTEGER | - | NO | 0 | Rekod berjaya |
| failed_records | INTEGER | - | NO | 0 | Rekod gagal |
| total_amount | DECIMAL | 15,2 | NO | 0 | Jumlah amaun semua rekod |
| success_amount | DECIMAL | 15,2 | NO | 0 | Jumlah amaun berjaya |
| failed_amount | DECIMAL | 15,2 | NO | 0 | Jumlah amaun gagal |
| status | VARCHAR | 20 | NO | UPLOADED' | UPLOADED/VALIDATING/READY/PROCESSING/COMPLETED/PARTIAL/FAILED/CANCELLED |
| error_threshold | DECIMAL | 5,2 | YES | 10.00 | Ambang ralat (%) |
| scheduled_date | TIMESTAMP | - | YES | - | Tarikh dijadual proses |
| processing_start | TIMESTAMP | - | YES | - | Mula proses |
| processing_end | TIMESTAMP | - | YES | - | Tamat proses |
| processing_duration | INTEGER | - | YES | - | Tempoh proses (saat) |
| created_by | VARCHAR | 50 | NO | - | User ID pencipta |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |
| modified_by | VARCHAR | 50 | YES | - | User ID pengemaskini |
| modified_date | TIMESTAMP | - | YES | - | Tarikh kemaskini |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| detail_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| batch_id | UUID | - | NO | - | FK ke BATCH_MASTER |
| line_number | INTEGER | - | NO | - | Baris dalam fail |
| record_data | TEXT | - | NO | - | JSON data rekod |
| validation_status | VARCHAR | 20 | NO | PENDING' | PENDING'/'VALID'/'INVALID' |
| validation_errors | TEXT | - | YES | - | JSON senarai error |
| processing_status | VARCHAR | 20 | NO | PENDING' | PENDING'/'SUCCESS'/'FAILED' |
| transaction_id | UUID | - | YES | - | FK ke TRANSACTION_MASTER |
| error_message | TEXT | - | YES | - | Mesej ralat pemprosesan |
| amount | DECIMAL | 12,2 | YES | - | Amaun transaksi |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |
| processed_date | TIMESTAMP | - | YES | - | Tarikh diproses |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| error_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| batch_id | UUID | - | NO | - | FK ke BATCH_MASTER |
| detail_id | UUID | - | YES | - | FK ke BATCH_DETAIL |
| line_number | INTEGER | - | NO | - | Baris dalam fail |
| error_code | VARCHAR | 30 | YES | - | Kod ralat |
| error_category | VARCHAR | 30 | NO | - | FORMAT'/'REFERENCE'/'BUSINESS'/'SYSTEM' |
| field_name | VARCHAR | 50 | YES | - | Medan yang bermasalah |
| field_value | VARCHAR | 255 | YES | - | Nilai yang bermasalah |
| error_message | TEXT | - | NO | - | Mesej ralat |
| severity | VARCHAR | 20 | NO | ERROR' | ERROR'/'WARNING'/'INFO' |
| resolved | BOOLEAN | - | NO | 0 | Telah diselesaikan? |
| resolved_by | VARCHAR | 50 | YES | - | Diselesaikan oleh |
| resolved_date | TIMESTAMP | - | YES | - | Tarikh selesai |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| summary_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| batch_id | UUID | - | NO | - | FK ke BATCH_MASTER |
| summary_type | VARCHAR | 20 | NO | - | GENERAL'/'FINANCIAL'/'BY_TYPE'/'BY_BANK' |
| summary_data | TEXT | - | NO | - | JSON data ringkasan |
| generated_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh jana |
| generated_by | VARCHAR | 50 | YES | SYSTEM' | Dijana oleh |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| log_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| batch_id | UUID | - | NO | - | FK ke BATCH_MASTER |
| action | VARCHAR | 50 | NO | - | UPLOAD'/'VALIDATE'/'PROCESS'/'COMPLETE' |
| status | VARCHAR | 20 | NO | - | STARTED'/'SUCCESS'/'FAILED' |
| message | TEXT | - | YES | - | Mesej log |
| details | TEXT | - | YES | - | JSON butiran |
| created_by | VARCHAR | 50 | NO | - | User ID |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh log |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| template_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| template_code | VARCHAR | 20 | NO | - | Kod unik template |
| template_name | VARCHAR | 100 | NO | - | Nama template |
| batch_type | VARCHAR | 20 | NO | - | SPG'/'TRANSACTION'/'ADJUSTMENT' |
| version | VARCHAR | 10 | NO | 1.0' | Versi template |
| file_format | VARCHAR | 10 | NO | - | CSV'/'EXCEL'/'TXT' |
| has_header | BOOLEAN | - | NO | 1 | Ada header row? |
| delimiter | VARCHAR | 1 | YES | ,' | Untuk CSV |
| column_definitions | TEXT | - | NO | - | JSON definisi kolom |
| validation_rules | TEXT | - | YES | - | JSON peraturan validasi |
| sample_file_path | VARCHAR | 500 | YES | - | Path ke fail contoh |
| is_active | BOOLEAN | - | NO | 1 | Status aktif |
| effective_date | DATE | - | NO | CURRENT_DATE | Tarikh kuat kuasa |
| expiry_date | DATE | - | YES | - | Tarikh luput |
| created_by | VARCHAR | 50 | NO | - | User ID pencipta |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |
| modified_by | VARCHAR | 50 | YES | - | User ID pengemaskini |
| modified_date | TIMESTAMP | - | YES | - | Tarikh kemaskini |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| error_code_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| error_code | VARCHAR | 30 | NO | - | Kod ralat |
| error_name | VARCHAR | 100 | NO | - | Nama ralat |
| error_category | VARCHAR | 30 | NO | - | FORMAT'/'REFERENCE'/'BUSINESS'/'SYSTEM' |
| description | TEXT | - | YES | - | Penerangan |
| severity | VARCHAR | 20 | NO | ERROR' | ERROR'/'WARNING'/'INFO' |
| is_active | BOOLEAN | - | NO | 1 | Status aktif |


| Role ID | Role Name | Penerangan |
| --- | --- | --- |
| R01 | Pentadbir Sistem | Akses penuh ke semua fungsi batch termasuk konfigurasi template |
| R02 | Pengurus Operasi | Memantau dan mengurus batch, laporan, kelulusan |
| R03 | Eksekutif Pemprosesan | Memproses batch, upload fail, lihat laporan ralat |
| R04 | Majikan (SPG) | Upload fail SPG, lihat status dan ringkasan batch sendiri |
| R05 | Pegawai Kewangan | Lihat ringkasan kewangan batch, laporan |
| R06 | Juruaudit | Akses view sahaja untuk sejarah dan audit batch |


| Fungsi / Sub-Modul | R01 | R02 | R03 | R04 | R05 | R06 |
| --- | --- | --- | --- | --- | --- | --- |
| Dashboard Batch |  |  |  |  |  |  |
| Lihat Ringkasan Semua | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Lihat Ringkasan Sendiri | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
|  |  |  |  |  |  |  |
| Upload Batch |  |  |  |  |  |  |
| Upload Fail Manual | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Upload FTP (konfigurasi) | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Lihat Status Upload | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
|  |  |  |  |  |  |  |
| Senarai Batch |  |  |  |  |  |  |
| Lihat Semua Batch | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Lihat Batch Sendiri | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cari Batch | ✓ | ✓ | ✓ | Terhad | ✓ | ✓ |
|  |  |  |  |  |  |  |
| Pemprosesan Batch |  |  |  |  |  |  |
| Proses Batch (Manual) | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Henti/Sambung Batch | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Batal Batch | ✓ | ✓ | Terhad | ✗ | ✗ | ✗ |
|  |  |  |  |  |  |  |
| Laporan Ralat |  |  |  |  |  |  |
| Lihat Laporan Ralat | ✓ | ✓ | ✓ | Sendiri | ✓ | ✓ |
| Muat Turun Laporan | ✓ | ✓ | ✓ | Sendiri | ✓ | ✓ |
| Betulkan & Upload Semula | ✓ | ✓ | ✓ | Terhad | ✗ | ✗ |
|  |  |  |  |  |  |  |
| Ringkasan Batch |  |  |  |  |  |  |
| Lihat Ringkasan | ✓ | ✓ | ✓ | Sendiri | ✓ | ✓ |
| Muat Turun Ringkasan | ✓ | ✓ | ✓ | Sendiri | ✓ | ✓ |
|  |  |  |  |  |  |  |
| Template Management |  |  |  |  |  |  |
| Lihat Senarai Template | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Muat Turun Template | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tambah/Kemaskini Template | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Konfigurasi Validasi | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
|  |  |  |  |  |  |  |
| Laporan & Audit |  |  |  |  |  |  |
| Laporan Prestasi Batch | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Sejarah Batch | ✓ | ✓ | ✓ | Sendiri | ✓ | ✓ |
| Log Aktiviti Batch | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |


| Rule ID | Peraturan | Penerangan | Kesan Jika Dilanggar |
| --- | --- | --- | --- |
| BR-BP-01 | Saiz Fail Maksimum | Saiz fail tidak melebihi 50 MB | Upload ditolak |
| BR-BP-02 | Bilangan Rekod Maksimum | Maksimum 100,000 rekod setiap batch | Upload ditolak |
| BR-BP-03 | Format Fail Sah | Fail mesti dalam format CSV, Excel, atau TXT | Upload ditolak |
| BR-BP-04 | Fail Unik | Fail tidak boleh sama dengan batch sedia ada (berdasarkan hash) | Amaran pendua |
| BR-BP-05 | Template Sepadan | Fail mesti mengikut template yang dipilih | Validasi gagal |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-BP-06 | Medan Wajib | Semua medan bertanda mandatory mesti diisi |
| BR-BP-07 | Format Data | Data mesti mengikut format yang ditetapkan (nombor, tarikh, dll) |
| BR-BP-08 | Rujukan Valid | ID pembayar, kod jenis zakat mesti wujud dalam sistem |
| BR-BP-09 | Amaun Positif | Amaun mestilah > 0 |
| BR-BP-10 | Had Amaun | Amaun dalam had minimum dan maksimum yang ditetapkan |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-BP-11 | Ambang Ralat | Jika kadar ralat > ambang (contoh: 10%), batch tidak boleh diproses |
| BR-BP-12 | Pemprosesan Separuh | Batch dengan ralat boleh diproses (rekod valid sahaja) jika pengguna pilih |
| BR-BP-13 | Tiada Rollback Auto | Transaksi yang berjaya tidak di-rollback jika rekod lain gagal |
| BR-BP-14 | Kebolehkesanan | Setiap transaksi individu boleh dikesan ke batch asal |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-BP-15 | Pemprosesan Auto | Batch dari FTP diproses auto setiap jam |
| BR-BP-16 | Prioriti | Batch SPG mempunyai prioriti lebih tinggi daripada batch am |
| BR-BP-17 | Timeout | Batch yang diproses > 2 jam akan ditandakan untuk semakan |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-BP-18 | Versi Template | Template yang tidak aktif tidak boleh digunakan |
| BR-BP-19 | Keserasian ke Belakang | Template baru mesti menyokong format lama untuk tempoh peralihan |
| BR-BP-20 | Perubahan Template | Perubahan template perlu kelulusan pentadbir |


| Objektif | Fungsi Keperluan Berkaitan |
| --- | --- |
| OBJ-01: Kapasiti min 1000 transaksi | FR-09 (validasi bilangan rekod) |
| OBJ-02: Pelbagai saluran upload | FR-01, FR-02, FR-03 |
| OBJ-03: Validasi komprehensif | FR-06 hingga FR-12 |
| OBJ-04: Laporan ralat | FR-23 hingga FR-27 |
| OBJ-05: Partial success | FR-28 hingga FR-31 |
| OBJ-06: Batch summary | FR-32 hingga FR-36 |
| OBJ-07: Pelbagai format fail | FR-06, FR-37 |
| OBJ-08: Pengesanan fail pendua | FR-04 |
| OBJ-09: Kebolehkesanan | FR-41 hingga FR-44 |
| OBJ-10: Prestasi | FR-19 (parallel processing) |


| Fungsi Keperluan | Use Case Berkaitan |
| --- | --- |
| FR-01 hingga FR-05: Upload | UC01, UC02 |
| FR-06 hingga FR-12: Validasi | UC03 |
| FR-13 hingga FR-17: Pengurusan Batch | UC04, UC09 |
| FR-18 hingga FR-22: Pemprosesan | UC05 |
| FR-23 hingga FR-27: Error Reporting | UC06, UC07 |
| FR-28 hingga FR-31: Partial Success | UC13 |
| FR-32 hingga FR-36: Batch Summary | UC08 |
| FR-37 hingga FR-40: Template | UC10, UC11 |
| FR-41 hingga FR-44: Audit | UC12, UC14 |


| Use Case | Role Dibenarkan |
| --- | --- |
| UC01: Upload Fail Manual | R01, R02, R03, R04 |
| UC02: Upload FTP Auto | Sistem (auto) |
| UC03: Validasi Fail | Sistem (auto) |
| UC04: Semak Status Batch | Semua role (terhad) |
| UC05: Proses Batch | R01, R02, R03 |
| UC06: Lihat Laporan Ralat | R01, R02, R03, R04 (sendiri), R05, R06 |
| UC07: Muat Turun Laporan Ralat | R01, R02, R03, R04 (sendiri), R05 |
| UC08: Lihat Ringkasan Batch | Semua role (terhad) |
| UC09: Batal Batch | R01, R02, R03 |
| UC10: Konfigurasi Template | R01 |
| UC11: Muat Turun Template | Semua role |
| UC12: Semak Sejarah Batch | R01, R02, R03, R06 |
| UC13: Pembetulan Separa | R01, R02, R03 |
| UC14: Laporan Batch | R01, R02, R05, R06 |


| POC Document Section | Page | Modul 5 Sub-Modul |
| --- | --- | --- |
| Batch & Bulk Processing | 1 | Semua sub-modul BP-01 hingga BP-09 |
| Min 1000 trx/file | 1 | BP-04 (Processing) |
| File Validation | 1 | BP-02 |
| Error Reporting | 1 | BP-05 |
| Partial Success Handling | 1 | BP-06 |
| Batch Summary | 1 | BP-07 |
| FTP Integration | 2 (Modul 7) | BP-01-02 |
| High volume transaction | 4 | BP-04 (Parallel Processing) |
| Processing Solution | 3 | BP-04 |


| Domain | Nilai | Penerangan |
| --- | --- | --- |
| batch_type | SPG' | Skim Potongan Gaji |
|  | TRANSACTION' | Transaksi Am |
|  | ADJUSTMENT' | Pelarasan |
|  | PAYER_REG' | Pendaftaran Pembayar |
|  |  |  |
| source | MANUAL' | Upload manual web |
|  | FTP' | Upload automatik FTP |
|  | API' | Upload melalui API |
|  | SYSTEM' | Dijana sistem |
|  |  |  |
| batch_status | UPLOADED' | Fail diterima |
|  | VALIDATING' | Sedang validasi |
|  | READY_FOR_PROCESSING' | Sedia diproses |
|  | PROCESSING' | Sedang diproses |
|  | COMPLETED' | Selesai (semua berjaya) |
|  | PARTIALLY_COMPLETED' | Selesai separa |
|  | FAILED' | Gagal semua |
|  | VALIDATION_FAILED' | Gagal validasi |
|  | CANCELLED' | Dibatalkan |
|  |  |  |
| validation_status | PENDING' | Belum divalidasi |
|  | VALID' | Sah |
|  | INVALID' | Tidak sah |
|  |  |  |
| processing_status | PENDING' | Belum diproses |
|  | SUCCESS' | Berjaya |
|  | FAILED' | Gagal |
|  |  |  |
| error_category | FORMAT' | Ralat format data |
|  | REFERENCE' | Ralat rujukan |
|  | BUSINESS' | Ralat perniagaan |
|  | SYSTEM' | Ralat sistem |
|  |  |  |
| file_format | CSV' | Comma Separated Values |
|  | EXCEL' | Excel (XLS/XLSX) |
|  | TXT' | Text fixed-width |


| Table | Column | Data Type | Length | Penerangan | Sumber Data |
| --- | --- | --- | --- | --- | --- |
| BATCH_MASTER | batch_id | UUID | - | ID unik batch | System |
|  | batch_no | VARCHAR | 30 | No batch (format: BATCH-YYYYMMDD-xxx) | System |
|  | batch_type | VARCHAR | 20 | Jenis batch | Input form |
|  | source | VARCHAR | 20 | Sumber upload | System |
|  | template_id | UUID | - | FK ke BATCH_TEMPLATE | Input form |
|  | file_name | VARCHAR | 255 | Nama fail asal | Upload |
|  | file_size | INTEGER | - | Saiz fail (bytes) | System |
|  | file_hash | VARCHAR | 64 | SHA-256 hash fail | System |
|  | file_path | VARCHAR | 500 | Path simpanan fail | System |
|  | total_records | INTEGER | - | Jumlah rekod | System |
|  | valid_records | INTEGER | - | Rekod valid | System |
|  | invalid_records | INTEGER | - | Rekod tidak valid | System |
|  | processed_records | INTEGER | - | Rekod diproses | System |
|  | success_records | INTEGER | - | Rekod berjaya | System |
|  | failed_records | INTEGER | - | Rekod gagal | System |
|  | total_amount | DECIMAL | 15,2 | Jumlah amaun semua rekod | System |
|  | success_amount | DECIMAL | 15,2 | Jumlah amaun berjaya | System |
|  | failed_amount | DECIMAL | 15,2 | Jumlah amaun gagal | System |
|  | status | VARCHAR | 20 | Status batch | System |
|  | error_threshold | DECIMAL | 5,2 | Ambang ralat (%) | Input form |
|  | scheduled_date | TIMESTAMP | - | Tarikh dijadual proses | Input form |
|  | processing_start | TIMESTAMP | - | Mula proses | System |
|  | processing_end | TIMESTAMP | - | Tamat proses | System |
|  | processing_duration | INTEGER | - | Tempoh proses (saat) | System |
|  | created_by | VARCHAR | 50 | User ID pencipta | Session |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  | modified_by | VARCHAR | 50 | User ID pengemaskini | Session |
|  | modified_date | TIMESTAMP | - | Tarikh kemaskini | System |
|  |  |  |  |  |  |
| BATCH_DETAIL | detail_id | UUID | - | ID unik detail | System |
|  | batch_id | UUID | - | FK ke BATCH_MASTER | From master |
|  | line_number | INTEGER | - | Baris dalam fail | System |
|  | record_data | TEXT | - | JSON data rekod | From file |
|  | validation_status | VARCHAR | 20 | Status validasi | System |
|  | validation_errors | TEXT | - | JSON senarai error | System |
|  | processing_status | VARCHAR | 20 | Status pemprosesan | System |
|  | transaction_id | UUID | - | FK ke TRANSACTION_MASTER | From Modul 3 |
|  | error_message | TEXT | - | Mesej ralat pemprosesan | System |
|  | amount | DECIMAL | 12,2 | Amaun transaksi | From file |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  | processed_date | TIMESTAMP | - | Tarikh diproses | System |
|  |  |  |  |  |  |
| BATCH_ERROR | error_id | UUID | - | ID unik ralat | System |
|  | batch_id | UUID | - | FK ke BATCH_MASTER | From master |
|  | detail_id | UUID | - | FK ke BATCH_DETAIL | From detail |
|  | line_number | INTEGER | - | Baris dalam fail | From file |
|  | error_code | VARCHAR | 30 | Kod ralat | System |
|  | error_category | VARCHAR | 30 | Kategori ralat | System |
|  | field_name | VARCHAR | 50 | Medan bermasalah | System |
|  | field_value | VARCHAR | 255 | Nilai bermasalah | System |
|  | error_message | TEXT | - | Mesej ralat | System |
|  | severity | VARCHAR | 20 | Tahap serius | System |
|  | resolved | BOOLEAN | - | Telah diselesaikan? | System |
|  | resolved_by | VARCHAR | 50 | Diselesaikan oleh | Session |
|  | resolved_date | TIMESTAMP | - | Tarikh selesai | System |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  |  |  |  |  |  |
| BATCH_TEMPLATE | template_id | UUID | - | ID unik template | System |
|  | template_code | VARCHAR | 20 | Kod template | Input form |
|  | template_name | VARCHAR | 100 | Nama template | Input form |
|  | batch_type | VARCHAR | 20 | Jenis batch | Input form |
|  | version | VARCHAR | 10 | Versi template | Input form |
|  | file_format | VARCHAR | 10 | Format fail | Input form |
|  | has_header | BOOLEAN | - | Ada header? | Input form |
|  | delimiter | VARCHAR | 1 | Pemisah (CSV) | Input form |
|  | column_definitions | TEXT | - | JSON definisi kolom | Input form |
|  | validation_rules | TEXT | - | JSON peraturan validasi | Input form |
|  | sample_file_path | VARCHAR | 500 | Path ke fail contoh | System |
|  | is_active | BOOLEAN | - | Status aktif | Input form |
|  | effective_date | DATE | - | Tarikh kuat kuasa | Input form |
|  | expiry_date | DATE | - | Tarikh luput | Input form |
|  | created_by | VARCHAR | 50 | User ID pencipta | Session |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  | modified_by | VARCHAR | 50 | User ID pengemaskini | Session |
|  | modified_date | TIMESTAMP | - | Tarikh kemaskini | System |


| AC ID | Kriteria | Kaedah Ujian | Keputusan Jangkaan |
| --- | --- | --- | --- |
| AC-01 | Pengguna boleh memuat naik fail CSV dengan 1000 rekod | Upload fail contoh 1000 rekod | Fail diterima, batch ID dijana, status 'UPLOADED' |
| AC-02 | Sistem melakukan validasi fail dan mengesan ralat format | Upload fail dengan ralat format (tarikh salah, amaun bukan nombor) | Rekod invalid dikesan, laporan ralat dijana |
| AC-03 | Sistem menolak fail jika melebihi saiz maksimum | Upload fail > 50 MB | Fail ditolak, mesej error dipaparkan |
| AC-04 | Sistem mengesan fail pendua (sama) | Upload fail yang sama dua kali | Kali kedua diberi amaran pendua |
| AC-05 | Pengguna boleh memproses batch yang telah divalidasi | Pilih batch, klik "Proses" | Batch diproses, transaksi direkod, ringkasan dijana |
| AC-06 | Sistem mengendalikan partial success (separa berjaya) | Upload fail dengan 90% data valid, 10% invalid | Batch status 'PARTIALLY_COMPLETED', ringkasan tepat |
| AC-07 | Sistem tidak memproses batch jika kadar ralat > ambang | Upload fail dengan ralat 15% (ambang 10%) | Batch status 'VALIDATION_FAILED', tidak boleh diproses |
| AC-08 | Pengguna boleh memuat turun laporan ralat | Selepas validasi, klik "Muat Turun Laporan" | Fail Excel/CSV dengan senarai ralat dimuat turun |
| AC-09 | Sistem menjana ringkasan batch yang tepat | Selepas proses, lihat ringkasan | Ringkasan menunjukkan jumlah berjaya, gagal, amaun |
| AC-10 | Pengguna boleh memuat turun template contoh | Klik "Muat Turun Template" | Fail template dimuat turun dengan struktur betul |


| AC ID | Kriteria | Kaedah Ujian | Keputusan Jangkaan |
| --- | --- | --- | --- |
| AC-P01 | Sistem boleh memproses 100,000 rekod dalam < 30 minit | Upload fail 100,000 rekod, proses | Masa pemprosesan < 30 minit |
| AC-P02 | Validasi 100,000 rekod mengambil masa < 5 minit | Upload fail 100,000 rekod, ukur masa validasi | Validasi selesai < 5 minit |
| AC-P03 | Sistem boleh mengendalikan 10 batch serentak | Jalankan 10 batch serentak | Semua batch diproses, tiada deadlock |
| AC-P04 | Masa response upload < 3 saat untuk fail 10 MB | Upload fail 10 MB, ukur masa | Response diterima < 3 saat |


| AC ID | Kriteria | Kaedah Ujian | Keputusan Jangkaan |
| --- | --- | --- | --- |
| AC-R01 | Sistem boleh menyambung semula batch yang tergendala | Simulasi server restart semasa proses | Batch boleh disambung, tiada data loss |
| AC-R02 | Data konsisten selepas pemprosesan | Semak jumlah transaksi vs batch summary | Jumlah sama, tiada rekod hilang |
| AC-R03 | Audit log merekod semua aktiviti batch | Semak log untuk batch tertentu | Setiap aktiviti (upload, validasi, proses) direkod |


| ID Objektif | Pernyataan Objektif |
| --- | --- |
| OBJ-01 | Menyediakan portal khusus untuk majikan mengurus potongan gaji pekerja secara dalam talian |
| OBJ-02 | Membolehkan majikan memuat naik fail payroll bulanan untuk pemprosesan potongan |
| OBJ-03 | Menyokong pelbagai jenis potongan (tetap, peratusan, kombinasi) mengikut persetujuan |
| OBJ-04 | Mengurus penjadualan pemprosesan bulanan secara automatik (monthly scheduler) |
| OBJ-05 | Melaksanakan pengesahan data pekerja dan potongan sebelum pemprosesan |
| OBJ-06 | Menyediakan mekanisme penyesuaian (reconciliation) antara rekod LZS dan bank |
| OBJ-07 | Menjanaan laporan SPG untuk majikan, LZS, dan tujuan audit |
| OBJ-08 | Mengendalikan perubahan data pekerja (pekerja baru, berhenti, ubah potongan) |
| OBJ-09 | Memastikan pematuhan kepada terma perjanjian SPG antara LZS dan majikan |
| OBJ-10 | Menyediakan kebolehkesanan lengkap untuk setiap transaksi potongan gaji |


| Perkara | Skop |
| --- | --- |
| Entiti Utama | Majikan (Employer), Perjanjian SPG, Pekerja (Employee), Potongan, Fail Payroll, Transaksi SPG |
| Proses Utama | Pendaftaran Majikan, Pengurusan Pekerja, Upload Fail Payroll, Pemprosesan Bulanan, Reconciliation, Pelaporan |
| Jenis Potongan | Potongan Tetap (RM), Potongan Peratusan (%), Potongan Kombinasi |
| Kekerapan | Bulanan (default), Suku Tahun, Tahunan (bergantung perjanjian) |
| Sumber Data | Upload Manual (Portal), Upload FTP, API Integration |
| Integrasi | Modul 1 (Profil Majikan), Modul 3 (Transaksi), Modul 4 (Payment Engine), Modul 5 (Batch), Modul 7 (Bank), Modul 8 (Reconciliation) |
| Output | Transaksi Potongan, Laporan Bulanan, Penyata Reconciliation, Notifikasi Majikan |
| Had Skop | Tidak meliputi pengurusan profil pembayar individu (Modul 1), pemprosesan pembayaran online (Modul 3) |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-01 | Log Masuk Majikan | Membolehkan majikan log masuk ke portal SPG dengan selamat | Tinggi |
| FR-02 | Dashboard Majikan | Memaparkan ringkasan potongan bulan ini, sejarah, dan notifikasi | Tinggi |
| FR-03 | Pengurusan Profil Majikan | Melihat dan mengemaskini maklumat syarikat | Tinggi |
| FR-04 | Pengurusan Pengguna Majikan | Mengurus pengguna tambahan (HR, kewangan) untuk akses portal | Sederhana |
| FR-05 | Notifikasi & Peringatan | Menerima notifikasi tarikh tutup upload, pengesahan, dll | Sederhana |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-06 | Pendaftaran Perjanjian | Merekod perjanjian SPG antara LZS dan majikan | Tinggi |
| FR-07 | Dokumen Perjanjian | Muat naik dan simpan dokumen perjanjian yang ditandatangani | Tinggi |
| FR-08 | Tarikh Kuat Kuasa | Menetapkan tarikh mula dan tamat perjanjian | Tinggi |
| FR-09 | Jenis Potongan | Menentukan jenis potongan (tetap/peratus/kombinasi) untuk majikan | Tinggi |
| FR-10 | Pembaharuan Perjanjian | Mengurus pembaharuan dan pindaan perjanjian | Sederhana |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-11 | Tambah Pekerja Baru | Menambah pekerja baru ke dalam senarai potongan | Tinggi |
| FR-12 | Import Pekerja | Mengimport senarai pekerja dari fail Excel/CSV | Tinggi |
| FR-13 | Kemaskini Data Pekerja | Mengemaskini maklumat pekerja (nama, IC, jawatan, dll) | Tinggi |
| FR-14 | Tukar Status Pekerja | Mengurus pekerja berhenti, cuti tanpa gaji, dll | Tinggi |
| FR-15 | Ubah Potongan Pekerja | Menukar amaun/peratus potongan pekerja individu | Tinggi |
| FR-16 | Senarai Pekerja Aktif | Melihat senarai pekerja aktif untuk potongan bulanan | Tinggi |
| FR-17 | Sejarah Pekerja | Melihat sejarah potongan pekerja | Sederhana |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-18 | Upload Fail Bulanan | Memuat naik fail payroll bulanan (format Excel/CSV/TXT) | Tinggi |
| FR-19 | Template Fail | Menyediakan template fail untuk muat turun | Tinggi |
| FR-20 | Validasi Fail | Mengesahkan format dan data fail payroll | Tinggi |
| FR-21 | Pra-tonton Data | Memaparkan pratinjau data sebelum hantar | Sederhana |
| FR-22 | Pengesahan Penghantaran | Mengesahkan penghantaran dan merekod tarikh upload | Tinggi |
| FR-23 | Sejarah Upload | Melihat sejarah fail yang telah diupload | Sederhana |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-24 | Penjadualan Auto | Sistem menjadualkan pemprosesan bulanan secara automatik | Tinggi |
| FR-25 | Tarikh Tutup | Menetapkan tarikh tutup upload untuk setiap majikan | Tinggi |
| FR-26 | Pengiraan Potongan | Mengira potongan berdasarkan data fail dan perjanjian | Tinggi |
| FR-27 | Pengesahan Data | Mengesahkan data pekerja dan potongan sebelum proses | Tinggi |
| FR-28 | Penjanaan Transaksi | Menjana transaksi individu untuk setiap pekerja | Tinggi |
| FR-29 | Pengurusan Gagal Proses | Mengurus pekerja yang gagal diproses (sebab, tindakan) | Tinggi |
| FR-30 | Notifikasi Selesai | Menghantar notifikasi kepada majikan selepas pemprosesan | Sederhana |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-31 | Padanan Transaksi | Memadankan transaksi SPG dengan penyata bank | Tinggi |
| FR-32 | Pengesanan Percanggahan | Mengesan percanggahan antara rekod LZS dan bank | Tinggi |
| FR-33 | Pelaporan Percanggahan | Menjana laporan percanggahan untuk tindakan | Tinggi |
| FR-34 | Penyesuaian Manual | Membolehkan operator menyelaraskan percanggahan secara manual | Tinggi |
| FR-35 | Status Reconciliation | Merekod status penyesuaian (matched, unmatched, in-progress) | Sederhana |
| FR-36 | Sejarah Reconciliation | Menyimpan rekod penyesuaian bulanan | Sederhana |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-37 | Laporan Bulanan Majikan | Laporan ringkasan potongan bulanan untuk majikan | Tinggi |
| FR-38 | Laporan Tahunan | Laporan kutipan SPG tahunan mengikut majikan | Tinggi |
| FR-39 | Laporan Prestasi | Laporan prestasi kutipan SPG (trend, perbandingan) | Sederhana |
| FR-40 | Laporan Percanggahan | Laporan terperinci percanggahan reconciliation | Tinggi |
| FR-41 | Eksport Laporan | Muat turun laporan dalam format PDF/Excel | Tinggi |
| FR-42 | Dashboard LZS | Paparan ringkasan SPG untuk pengurusan LZS | Tinggi |


| ID | Fungsi | Penerangan | Keutamaan |
| --- | --- | --- | --- |
| FR-43 | Log Aktiviti Majikan | Merekod semua aktiviti majikan dalam portal | Tinggi |
| FR-44 | Log Pemprosesan | Merekod setiap langkah pemprosesan bulanan | Tinggi |
| FR-45 | Kebolehkesanan Transaksi | Menjejak transaksi individu ke fail dan bulan asal | Tinggi |
| FR-46 | Pematuhan Perjanjian | Memastikan pemprosesan mematuhi terma perjanjian | Tinggi |


| Item | Detail |
| --- | --- |
| ID | UC02 |
| Nama Use Case | Urus Pekerja |
| Aktor Utama | Majikan (HR) |
| Aktor Sekunder | - |
| Penerangan | Mengurus senarai pekerja untuk potongan gaji (tambah, kemaskini, tukar status) |
| Pre-condition | Majikan telah log masuk ke portal SPG; perjanjian SPG aktif |
| Post-condition | Data pekerja dikemaskini dalam sistem |


| Item | Detail |
| --- | --- |
| ID | UC04 |
| Nama Use Case | Upload Fail Payroll |
| Aktor Utama | Majikan (HR) |
| Aktor Sekunder | Sistem Batch Processing (Modul 5) |
| Penerangan | Memuat naik fail payroll bulanan untuk pemprosesan potongan |
| Pre-condition | Majikan telah log masuk; perjanjian SPG aktif; tarikh dalam tempoh upload |
| Post-condition | Fail diterima, divalidasi, dan disimpan untuk pemprosesan |


| Item | Detail |
| --- | --- |
| ID | UC09 |
| Nama Use Case | Proses SPG Bulanan |
| Aktor Utama | Sistem (Scheduler), Eksekutif Pemprosesan LZS (manual) |
| Aktor Sekunder | Modul 3 (Transaksi), Modul 4 (Payment Engine), Modul 5 (Batch) |
| Penerangan | Memproses potongan SPG untuk semua majikan pada bulan berkenaan |
| Pre-condition | Tarikh proses bulanan tiba; fail payroll telah diupload oleh majikan |
| Post-condition | Transaksi potongan dijana untuk setiap pekerja; rekod disimpan |


| Item | Detail |
| --- | --- |
| ID | UC10 |
| Nama Use Case | Reconciliation SPG |
| Aktor Utama | Eksekutif Pemprosesan LZS |
| Aktor Sekunder | Sistem, Bank |
| Penerangan | Memadankan transaksi SPG dengan penyata bank untuk memastikan ketepatan kutipan |
| Pre-condition | Transaksi SPG untuk bulan berkenaan telah diproses; penyata bank diterima |
| Post-condition | Transaksi dipadankan; percanggahan dikenalpasti untuk tindakan |


| Kod Modul | Sub-Modul | Penerangan | Fungsi Utama |
| --- | --- | --- | --- |
| SP-01 | Portal Majikan | Antara muka untuk majikan mengurus SPG |  |
| SP-01-01 | Dashboard Majikan | Paparan ringkasan untuk majikan | Statistik, notifikasi, graf |
| SP-01-02 | Pengurusan Profil | Lihat/kemaskini profil syarikat | Maklumat syarikat, wakil |
| SP-01-03 | Pengurusan Pengguna | Urus pengguna tambahan | Tambah, ubah peranan |
| SP-01-04 | Notifikasi | Pusat notifikasi dan mesej | Peringatan, pengumuman |
|  |  |  |  |
| SP-02 | Pengurusan Perjanjian | Pengurusan perjanjian SPG |  |
| SP-02-01 | Pendaftaran Perjanjian | Merekod perjanjian baru | Maklumat asas, tarikh |
| SP-02-02 | Dokumen Perjanjian | Muat naik/lihat dokumen | PDF perjanjian |
| SP-02-03 | Terma & Syarat | Menetapkan terma potongan | Jenis potongan, kadar |
| SP-02-04 | Pembaharuan Perjanjian | Proses pembaharuan | Tarikh baru, versi |
| SP-02-05 | Sejarah Perjanjian | Lihat sejarah perubahan | Versi perjanjian |
|  |  |  |  |
| SP-03 | Pengurusan Pekerja | Pengurusan data pekerja |  |
| SP-03-01 | Senarai Pekerja | Paparan senarai pekerja | Filter, cari, sort |
| SP-03-02 | Tambah Pekerja | Daftar pekerja baru | Borang individu |
| SP-03-03 | Import Pekerja | Import pukal dari fail | Excel/CSV upload |
| SP-03-04 | Kemaskini Pekerja | Ubah data pekerja | Individu, pukal |
| SP-03-05 | Tukar Status Pekerja | Urus berhenti/aktif | Tarikh kesan |
| SP-03-06 | Ubah Potongan | Tukar nilai potongan | Individu, pukal |
| SP-03-07 | Sejarah Pekerja | Lihat sejarah potongan | Bulanan, tahunan |
|  |  |  |  |
| SP-04 | Pengurusan Fail Payroll | Pengurusan upload fail bulanan |  |
| SP-04-01 | Template Fail | Muat turun template | Format Excel/CSV |
| SP-04-02 | Upload Fail | Muat naik fail payroll | Pilih fail, hantar |
| SP-04-03 | Status Upload | Semak status fail | Dalam validasi, lulus, gagal |
| SP-04-04 | Sejarah Upload | Lihat rekod upload | Bulanan, tahunan |
| SP-04-05 | Laporan Ralat Fail | Lihat ralat validasi | Muat turun laporan |
|  |  |  |  |
| SP-05 | Pemprosesan Bulanan | Pemprosesan automatik bulanan |  |
| SP-05-01 | Penjadualan Proses | Tetapkan jadual bulanan | Tarikh, masa |
| SP-05-02 | Pengumpulan Data | Kumpul data dari semua majikan | Ambil fail valid |
| SP-05-03 | Penjanaan Transaksi | Jana transaksi individu | Panggil Modul 3 |
| SP-05-04 | Ringkasan Bulanan | Jana ringkasan bulanan | Jumlah, statistik |
| SP-05-05 | Pengurusan Gagal | Urus rekod gagal proses | Sebab, tindakan |
| SP-05-06 | Notifikasi Bulanan | Hantar laporan ke majikan | Emel, portal |
|  |  |  |  |
| SP-06 | SPG Reconciliation | Penyesuaian dengan bank |  |
| SP-06-01 | Ambil Data Bank | Dapatkan penyata bank | Dari Modul 7 |
| SP-06-02 | Padanan Transaksi | Padankan transaksi SPG | Exact, fuzzy |
| SP-06-03 | Pengesanan Percanggahan | Kenalpasti unmatched | Senarai, analisis |
| SP-06-04 | Resolusi Percanggahan | Selesaikan percanggahan | Manual, auto |
| SP-06-05 | Laporan Reconciliation | Jana laporan bulanan | Ringkasan, butiran |
| SP-06-06 | Status Reconciliation | Rekod status | Selesai, belum |
|  |  |  |  |
| SP-07 | SPG Reporting | Laporan dan analitik SPG |  |
| SP-07-01 | Laporan Bulanan Majikan | Untuk majikan | PDF/Excel |
| SP-07-02 | Laporan Tahunan LZS | Untuk pengurusan | Trend, perbandingan |
| SP-07-03 | Laporan Prestasi | Analisis kutipan | Mengikut sektor |
| SP-07-04 | Laporan Percanggahan | Butiran unmatched | Untuk audit |
| SP-07-05 | Dashboard LZS | Paparan eksekutif | Graf, KPI |
| SP-07-06 | Eksport Data | Muat turun data mentah | CSV, Excel |
|  |  |  |  |
| SP-08 | Audit & Logging | Audit trail SPG |  |
| SP-08-01 | Log Aktiviti Majikan | Rekod tindakan majikan | Siapa, bila, apa |
| SP-08-02 | Log Pemprosesan | Rekod proses bulanan | Masa, status, jumlah |
| SP-08-03 | Kebolehkesanan | Jejak transaksi ke fail | Batch ID, baris |
| SP-08-04 | Log Reconciliation | Rekod tindakan reconciliation | Siapa, bila, keputusan |


| Medan | Jenis Data | Panjang | Wajib | Validasi/Rules |
| --- | --- | --- | --- | --- |
| Pekerja |  |  |  |  |
| No Pekerja | Text | 30 | Ya | Unik dalam majikan |
| Nama Pekerja | Text | 150 | Ya | - |
| No IC | Text | 14 | Ya | Format 12/14 digit, unik |
| No Passport | Text | 20 | Jika warga asing | - |
| Tarikh Mula | Date | - | Ya | Tidak boleh masa depan |
| Jenis Potongan | Dropdown | - | Ya | TETAP/PERATUS |
| Nilai Potongan | Decimal | 10,2 | Ya | Jika tetap >0; jika peratus 0-100 |
| Bank Code | Dropdown | - | Ya | Dari senarai bank |
| No Akaun Bank | Text | 20 | Ya | Format angka |
| Status | Dropdown | - | Ya | AKTIF/BERHENTI/CUTI |
| Tarikh Berhenti | Date | - | Jika BERHENTI | - |
|  |  |  |  |  |
| Fail Payroll |  |  |  |  |
| Bulan | Month | - | Ya | Format YYYY-MM |
| No Pekerja | Text | 30 | Ya | Mesti wujud dalam senarai |
| Amaun | Decimal | 10,2 | Ya | > 0 |
| Bank Code | Text | 10 | Ya | Mesti wujud |
| No Akaun | Text | 20 | Ya | Format angka |
|  |  |  |  |  |
| Perjanjian SPG |  |  |  |  |
| No Perjanjian | Text | 30 | Ya | Unik |
| Tarikh Mula | Date | - | Ya | - |
| Tarikh Tamat | Date | - | Ya | > Tarikh Mula |
| Jenis Potongan | Dropdown | - | Ya | TETAP/PERATUS/KOMBINASI |
| Nilai (jika tetap) | Decimal | 10,2 | Jika TETAP | - |
| Kadar (jika peratus) | Decimal | 5,2 | Jika PERATUS | 0-100 |
| Dokumen | File | - | Ya | PDF perjanjian |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| employer_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| payer_id | UUID | - | NO | - | FK ke PAYER_MASTER (Modul 1) |
| employer_code | VARCHAR | 30 | NO | - | Kod majikan (unique) |
| company_name | VARCHAR | 200 | NO | - | Nama syarikat |
| registration_no | VARCHAR | 30 | YES | - | No pendaftaran SSM |
| contact_person | VARCHAR | 150 | NO | - | Orang hubungan |
| contact_email | VARCHAR | 100 | NO | - | Emel utama |
| contact_phone | VARCHAR | 15 | NO | - | No telefon |
| address | TEXT | - | YES | - | Alamat surat-menyurat |
| status | VARCHAR | 20 | NO | ACTIVE' | ACTIVE'/'INACTIVE'/'SUSPENDED' |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| agreement_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| employer_id | UUID | - | NO | - | FK ke SPG_EMPLOYER |
| agreement_no | VARCHAR | 30 | NO | - | No perjanjian (unique) |
| agreement_date | DATE | - | NO | - | Tarikh perjanjian |
| effective_date | DATE | - | NO | - | Tarikh kuat kuasa |
| expiry_date | DATE | - | NO | - | Tarikh tamat |
| deduction_type | VARCHAR | 20 | NO | - | FIXED'/'PERCENTAGE'/'COMBINATION' |
| deduction_value | DECIMAL | 10,2 | YES | - | Nilai tetap (jika FIXED) |
| deduction_percent | DECIMAL | 5,2 | YES | - | Peratus (jika PERCENTAGE) |
| document_path | VARCHAR | 500 | YES | - | Path ke PDF perjanjian |
| status | VARCHAR | 20 | NO | ACTIVE' | ACTIVE'/'EXPIRED'/'TERMINATED' |
| version | INTEGER | - | NO | 1 | Versi perjanjian |
| created_by | VARCHAR | 50 | NO | - | User ID pencipta |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |
| approved_by | VARCHAR | 50 | YES | - | Diluluskan oleh |
| approved_date | TIMESTAMP | - | YES | - | Tarikh lulus |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| employee_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| employer_id | UUID | - | NO | - | FK ke SPG_EMPLOYER |
| employee_no | VARCHAR | 30 | NO | - | No pekerja (dari majikan) |
| employee_name | VARCHAR | 150 | NO | - | Nama pekerja |
| ic_number | VARCHAR | 14 | YES | - | No IC (12/14 digit) |
| passport_number | VARCHAR | 20 | YES | - | No Passport (jika warga asing) |
| nationality | VARCHAR | 50 | NO | MALAYSIA' | Warganegara |
| gender | CHAR | 1 | YES | - | L'/'P' |
| birth_date | DATE | - | YES | - | Tarikh lahir |
| department | VARCHAR | 100 | YES | - | Jabatan |
| position | VARCHAR | 100 | YES | - | Jawatan |
| join_date | DATE | - | YES | - | Tarikh mula kerja |
| deduction_type | VARCHAR | 20 | NO | - | FIXED'/'PERCENTAGE' |
| deduction_value | DECIMAL | 10,2 | YES | - | Nilai tetap (RM) |
| deduction_percent | DECIMAL | 5,2 | YES | - | Peratus (%) |
| bank_code | VARCHAR | 10 | NO | - | Kod bank |
| bank_account_no | VARCHAR | 30 | NO | - | No akaun bank |
| bank_account_name | VARCHAR | 150 | YES | - | Nama pemilik akaun |
| status | VARCHAR | 20 | NO | ACTIVE' | ACTIVE'/'INACTIVE'/'TERMINATED' |
| termination_date | DATE | - | YES | - | Tarikh berhenti |
| remarks | TEXT | - | YES | - | Catatan |
| created_by | VARCHAR | 50 | NO | - | User ID pencipta |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |
| modified_by | VARCHAR | 50 | YES | - | User ID pengemaskini |
| modified_date | TIMESTAMP | - | YES | - | Tarikh kemaskini |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| file_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| employer_id | UUID | - | NO | - | FK ke SPG_EMPLOYER |
| batch_id | UUID | - | YES | - | FK ke BATCH_MASTER (Modul 5) |
| payroll_month | DATE | - | NO | - | Bulan payroll (YYYY-MM-01) |
| file_name | VARCHAR | 255 | NO | - | Nama fail asal |
| file_path | VARCHAR | 500 | NO | - | Path simpanan fail |
| file_hash | VARCHAR | 64 | NO | - | SHA-256 hash |
| record_count | INTEGER | - | NO | 0 | Jumlah rekod dalam fail |
| valid_count | INTEGER | - | NO | 0 | Rekod valid |
| invalid_count | INTEGER | - | NO | 0 | Rekod tidak valid |
| total_amount | DECIMAL | 15,2 | NO | 0 | Jumlah amaun |
| status | VARCHAR | 20 | NO | UPLOADED' | UPLOADED'/'VALIDATED'/'PROCESSED'/'FAILED' |
| uploaded_by | VARCHAR | 50 | NO | - | User ID upload |
| uploaded_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh upload |
| validated_date | TIMESTAMP | - | YES | - | Tarikh validasi |
| processed_date | TIMESTAMP | - | YES | - | Tarikh diproses |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| detail_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| file_id | UUID | - | NO | - | FK ke SPG_PAYROLL_FILE |
| employee_id | UUID | - | YES | - | FK ke SPG_EMPLOYEE |
| line_number | INTEGER | - | NO | - | Baris dalam fail |
| employee_no | VARCHAR | 30 | NO | - | No pekerja dari fail |
| amount | DECIMAL | 10,2 | NO | - | Amaun potongan |
| bank_code | VARCHAR | 10 | YES | - | Kod bank dari fail |
| bank_account_no | VARCHAR | 30 | YES | - | No akaun dari fail |
| validation_status | VARCHAR | 20 | NO | PENDING' | PENDING'/'VALID'/'INVALID' |
| validation_errors | TEXT | - | YES | - | JSON senarai error |
| processing_status | VARCHAR | 20 | NO | PENDING' | PENDING'/'SUCCESS'/'FAILED' |
| transaction_id | UUID | - | YES | - | FK ke TRANSACTION_MASTER |
| error_message | TEXT | - | YES | - | Mesej ralat pemprosesan |
| created_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh cipta |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| process_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| process_month | DATE | - | NO | - | Bulan diproses |
| process_date | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Tarikh proses |
| total_employers | INTEGER | - | NO | 0 | Bilangan majikan |
| total_employees | INTEGER | - | NO | 0 | Bilangan pekerja |
| total_amount | DECIMAL | 15,2 | NO | 0 | Jumlah amaun |
| success_count | INTEGER | - | NO | 0 | Bilangan berjaya |
| failed_count | INTEGER | - | NO | 0 | Bilangan gagal |
| success_amount | DECIMAL | 15,2 | NO | 0 | Amaun berjaya |
| failed_amount | DECIMAL | 15,2 | NO | 0 | Amaun gagal |
| status | VARCHAR | 20 | NO | IN_PROGRESS' | PENDING'/'IN_PROGRESS'/'COMPLETED'/'FAILED' |
| initiated_by | VARCHAR | 50 | YES | SYSTEM' | Dimulakan oleh |
| completed_date | TIMESTAMP | - | YES | - | Tarikh selesai |
| remarks | TEXT | - | YES | - | Catatan |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| process_detail_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| process_id | UUID | - | NO | - | FK ke SPG_PROCESSING |
| employer_id | UUID | - | NO | - | FK ke SPG_EMPLOYER |
| file_id | UUID | - | YES | - | FK ke SPG_PAYROLL_FILE |
| employee_count | INTEGER | - | NO | 0 | Bilangan pekerja |
| amount | DECIMAL | 15,2 | NO | 0 | Jumlah amaun |
| success_count | INTEGER | - | NO | 0 | Bilangan berjaya |
| failed_count | INTEGER | - | NO | 0 | Bilangan gagal |
| status | VARCHAR | 20 | NO | PROCESSED' | Status pemprosesan majikan |
| remarks | TEXT | - | YES | - | Catatan |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| recon_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| recon_month | DATE | - | NO | - | Bulan direconciliation |
| lzs_total_amount | DECIMAL | 15,2 | NO | 0 | Jumlah dari LZS |
| lzs_transaction_count | INTEGER | - | NO | 0 | Bilangan transaksi LZS |
| bank_total_amount | DECIMAL | 15,2 | NO | 0 | Jumlah dari bank |
| bank_transaction_count | INTEGER | - | NO | 0 | Bilangan transaksi bank |
| difference_amount | DECIMAL | 15,2 | NO | 0 | Perbezaan |
| matched_count | INTEGER | - | NO | 0 | Bilangan sepadan |
| unmatched_lzs_count | INTEGER | - | NO | 0 | LZS tidak sepadan |
| unmatched_bank_count | INTEGER | - | NO | 0 | Bank tidak sepadan |
| status | VARCHAR | 20 | NO | PENDING' | PENDING'/'IN_PROGRESS'/'COMPLETED' |
| recon_date | TIMESTAMP | - | YES | - | Tarikh reconciliation |
| recon_by | VARCHAR | 50 | YES | - | Dilakukan oleh |
| completed_date | TIMESTAMP | - | YES | - | Tarikh selesai |
| remarks | TEXT | - | YES | - | Catatan |


| Column | Data Type | Length | Null | Default | Description |
| --- | --- | --- | --- | --- | --- |
| recon_detail_id | UUID | - | NO | gen_random_uuid() | Primary Key |
| recon_id | UUID | - | NO | - | FK ke SPG_RECONCILIATION |
| transaction_id | UUID | - | YES | - | FK ke TRANSACTION_MASTER |
| bank_transaction_ref | VARCHAR | 100 | YES | - | Rujukan bank |
| amount | DECIMAL | 12,2 | NO | - | Amaun |
| match_status | VARCHAR | 20 | NO | - | MATCHED'/'UNMATCHED_LZS'/'UNMATCHED_BANK'/'MISMATCH' |
| match_score | DECIMAL | 5,2 | YES | - | Skor padanan |
| discrepancy_reason | VARCHAR | 100 | YES | - | Sebab percanggahan |
| resolved | BOOLEAN | - | NO | 0 | Telah diselesaikan? |
| resolved_by | VARCHAR | 50 | YES | - | Diselesaikan oleh |
| resolved_date | TIMESTAMP | - | YES | - | Tarikh selesai |
| remarks | TEXT | - | YES | - | Catatan |


| Role ID | Role Name | Penerangan |
| --- | --- | --- |
| R01 | Pentadbir SPG (LZS) | Akses penuh ke semua fungsi SPG, konfigurasi, laporan |
| R02 | Pengurus Operasi SPG | Mengurus pemprosesan bulanan, reconciliation, laporan |
| R03 | Eksekutif Pemprosesan SPG | Memproses SPG bulanan, urus percanggahan |
| R04 | Majikan - Admin | Akses penuh ke portal majikan (urus pekerja, upload, laporan) |
| R05 | Majikan - HR | Akses terhad (urus pekerja, upload) |
| R06 | Majikan - Finance | Akses terhad (lihat laporan, status) |
| R07 | Juruaudit | Akses view sahaja untuk audit |


| Fungsi / Sub-Modul | R01 | R02 | R03 | R04 | R05 | R06 | R07 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Portal Majikan |  |  |  |  |  |  |  |
| Log Masuk Portal | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| Dashboard Majikan | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| Urus Profil Majikan | ✓ | Terhad | ✗ | ✓ | ✗ | ✗ | ✗ |
| Urus Pengguna Majikan | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
|  |  |  |  |  |  |  |  |
| Pengurusan Pekerja |  |  |  |  |  |  |  |
| Lihat Senarai Pekerja | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tambah Pekerja | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Import Pekerja | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Kemaskini Pekerja | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Tukar Status Pekerja | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Lihat Sejarah Pekerja | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
|  |  |  |  |  |  |  |  |
| Upload Payroll |  |  |  |  |  |  |  |
| Upload Fail | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Muat Turun Template | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Lihat Status Upload | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Lihat Laporan Ralat | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Sejarah Upload | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
|  |  |  |  |  |  |  |  |
| Pemprosesan Bulanan |  |  |  |  |  |  |  |
| Lihat Status Pemprosesan | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Proses Bulanan (Manual) | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Urus Gagal Proses | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Notifikasi Majikan | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
|  |  |  |  |  |  |  |  |
| Reconciliation |  |  |  |  |  |  |  |
| Lihat Reconciliation | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Padanan Transaksi | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Urus Percanggahan | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Selesaikan Percanggahan | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
|  |  |  |  |  |  |  |  |
| Laporan SPG |  |  |  |  |  |  |  |
| Laporan Bulanan Majikan | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Laporan Tahunan | ✓ | ✓ | ✓ | Terhad | Terhad | Terhad | ✓ |
| Laporan Prestasi | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Laporan Percanggahan | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Eksport Laporan | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
|  |  |  |  |  |  |  |  |
| Konfigurasi |  |  |  |  |  |  |  |
| Urus Perjanjian SPG | ✓ | Terhad | ✗ | ✗ | ✗ | ✗ | ✗ |
| Konfigurasi Template | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Jadual Pemprosesan | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
|  |  |  |  |  |  |  |  |
| Audit |  |  |  |  |  |  |  |
| Log Aktiviti Majikan | ✓ | ✓ | ✓ | Terhad | Terhad | Terhad | ✓ |
| Log Pemprosesan | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Log Reconciliation | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |


| Rule ID | Peraturan | Penerangan | Kesan Jika Dilanggar |
| --- | --- | --- | --- |
| BR-SPG-01 | Perjanjian Aktif | Hanya majikan dengan perjanjian aktif boleh menyertai SPG | Majikan tidak dapat akses portal |
| BR-SPG-02 | Tempoh Perjanjian | Perjanjian mesti mempunyai tarikh mula dan tamat yang sah | Perjanjian ditolak |
| BR-SPG-03 | Dokumen Wajib | Perjanjian mesti disertakan dokumen PDF yang ditandatangani | Perjanjian tidak aktif |
| BR-SPG-04 | Pembaharuan Auto | Sistem boleh mengingatkan 3 bulan sebelum tarikh tamat | Notifikasi dihantar |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-SPG-05 | No Pekerja Unik | No pekerja mestilah unik dalam sesebuah majikan |
| BR-SPG-06 | No IC Unik | No IC pekerja mestilah unik dalam majikan yang sama (tiada pekerja sama) |
| BR-SPG-07 | Pekerja Aktif | Hanya pekerja berstatus 'AKTIF' boleh diproses potongan |
| BR-SPG-08 | Potongan Positif | Amaun potongan mestilah > 0 |
| BR-SPG-09 | Potongan Peratus Sah | Jika peratusan, nilai antara 0.1% hingga 100% |
| BR-SPG-10 | Tarikh Berhenti | Pekerja yang berhenti selepas tarikh tutup upload masih diproses untuk bulan tersebut |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-SPG-11 | Satu Fail Sebulan | Setiap majikan hanya boleh menghantar SATU fail setiap bulan |
| BR-SPG-12 | Tarikh Tutup | Fail mesti diupload sebelum tarikh tutup yang ditetapkan (contoh: 5 haribulan) |
| BR-SPG-13 | Rekod Wajib | Semua pekerja aktif MESTI ada dalam fail payroll (kecuali tiada potongan) |
| BR-SPG-14 | Padanan Pekerja | No pekerja dalam fail mesti wujud dalam senarai pekerja majikan |
| BR-SPG-15 | Ambang Ralat | Jika ralat > 5%, fail ditolak dan perlu upload semula |
| BR-SPG-16 | Pembetulan | Majikan boleh upload semula fail yang sama sebelum tarikh tutup |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-SPG-17 | Jadual Tetap | Pemprosesan SPG dijalankan pada hari yang ditetapkan setiap bulan |
| BR-SPG-18 | Kutipan Auto | Transaksi potongan dijana secara auto untuk semua pekerja dalam fail |
| BR-SPG-19 | Gagal Proses | Pekerja yang gagal diproses (contoh: akaun bank salah) direkod dan dimaklumkan |
| BR-SPG-20 | Tiada Rollback | Transaksi yang berjaya tidak boleh di-rollback secara pukal |
| BR-SPG-21 | Pembetulan Individu | Pekerja yang gagal boleh diproses secara manual (jika perlu) |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-SPG-22 | Reconciliation Wajib | Setiap bulan SPG mesti direconciliation dengan bank |
| BR-SPG-23 | Tempoh Reconciliation | Reconciliation mesti selesai dalam masa 7 hari bekerja selepas penyata bank diterima |
| BR-SPG-24 | Toleransi Perbezaan | Perbezaan < RM100 boleh diterima dengan justifikasi |
| BR-SPG-25 | Percanggahan Besar | Perbezaan > RM1,000 memerlukan pengesahan penyelia |
| BR-SPG-26 | Dokumentasi | Semua percanggahan dan penyelesaian mesti didokumentasikan |


| Rule ID | Peraturan | Penerangan |
| --- | --- | --- |
| BR-SPG-27 | Laporan Bulanan | Majikan menerima laporan bulanan selepas pemprosesan |
| BR-SPG-28 | Simpanan Laporan | Laporan disimpan minimum 7 tahun untuk tujuan audit |
| BR-SPG-29 | Ketepatan Data | Laporan mesti menunjukkan jumlah tepat mengikut transaksi |


| Objektif | Fungsi Keperluan Berkaitan |
| --- | --- |
| OBJ-01: Portal Majikan | FR-01 hingga FR-05 |
| OBJ-02: Upload Fail Payroll | FR-18 hingga FR-23 |
| OBJ-03: Pelbagai jenis potongan | FR-09, FR-15 |
| OBJ-04: Monthly Scheduler | FR-24 hingga FR-30 |
| OBJ-05: Pengesahan Data | FR-20, FR-27 |
| OBJ-06: Reconciliation | FR-31 hingga FR-36 |
| OBJ-07: Laporan SPG | FR-37 hingga FR-42 |
| OBJ-08: Perubahan Data Pekerja | FR-11 hingga FR-17 |
| OBJ-09: Pematuhan Perjanjian | FR-06 hingga FR-10 |
| OBJ-10: Kebolehkesanan | FR-43 hingga FR-46 |


| Fungsi Keperluan | Use Case Berkaitan |
| --- | --- |
| FR-01 hingga FR-05: Portal Majikan | UC01, UC07 |
| FR-06 hingga FR-10: Perjanjian SPG | UC08 |
| FR-11 hingga FR-17: Pengurusan Pekerja | UC02, UC03 |
| FR-18 hingga FR-23: Upload Payroll | UC04, UC05 |
| FR-24 hingga FR-30: Pemprosesan Bulanan | UC09 |
| FR-31 hingga FR-36: Reconciliation | UC10, UC12 |
| FR-37 hingga FR-42: Laporan SPG | UC06, UC13 |
| FR-43 hingga FR-46: Audit | UC11, UC14 |


| Use Case | Role Dibenarkan |
| --- | --- |
| UC01: Log Masuk Portal Majikan | R04, R05, R06 |
| UC02: Urus Pekerja | R04, R05 |
| UC03: Import Pekerja | R04, R05 |
| UC04: Upload Fail Payroll | R04, R05 |
| UC05: Lihat Sejarah Upload | R04, R05, R06 |
| UC06: Lihat Laporan SPG | R04, R05, R06 |
| UC07: Kemaskini Profil Majikan | R04, R01 |
| UC08: Urus Perjanjian SPG | R01, R02 |
| UC09: Proses SPG Bulanan | R01, R02, R03 |
| UC10: Reconciliation SPG | R01, R02, R03 |
| UC11: Lihat Dashboard SPG | R01, R02, R03, R07 |
| UC12: Urus Percanggahan | R01, R02, R03 |
| UC13: Jana Laporan SPG | R01, R02, R03, R07 |
| UC14: Konfigurasi SPG | R01 |


| POC Document Section | Page | Modul 6 Sub-Modul |
| --- | --- | --- |
| Skim Potongan Gaji (SPG) | 1 | Semua sub-modul SP-01 hingga SP-08 |
| Portal Majikan | 1 | SP-01 |
| Upload Payroll File | 1 | SP-04 |
| Potongan Tetap/Peratus | 1 | SP-03 (pekerja) |
| Monthly Scheduler | 1 | SP-05 |
| SPG Reconciliation | 1 | SP-06 |
| SPG Reporting | 1 | SP-07 |
| User/Interface - Majikan | 3 | SP-01 |
| High volume transaction | 4 | SP-05 (pemprosesan bulanan) |
| Integration | 4 | SP-06 (bank) |
| Processing Solution | 3 | SP-05 |
| Audit Trail | 3 | SP-08 |


| Domain | Nilai | Penerangan |
| --- | --- | --- |
| deduction_type | FIXED' | Potongan tetap (RM) |
|  | PERCENTAGE' | Potongan peratusan (%) |
|  | COMBINATION' | Kombinasi tetap + peratus |
|  |  |  |
| employee_status | ACTIVE' | Pekerja aktif |
|  | INACTIVE' | Tidak aktif (cuti, dll) |
|  | TERMINATED' | Berhenti |
|  |  |  |
| file_status | UPLOADED' | Fail diterima |
|  | VALIDATING' | Sedang divalidasi |
|  | VALIDATED' | Selesai validasi |
|  | PROCESSED' | Telah diproses |
|  | FAILED' | Gagal |
|  |  |  |
| processing_status | PENDING' | Belum diproses |
|  | SUCCESS' | Berjaya |
|  | FAILED' | Gagal |
|  |  |  |
| match_status | MATCHED' | Sepadan |
|  | UNMATCHED_LZS' | Hanya dalam LZS |
|  | UNMATCHED_BANK' | Hanya dalam bank |
|  | MISMATCH' | Amaun tidak sepadan |


| Table | Column | Data Type | Length | Penerangan | Sumber Data |
| --- | --- | --- | --- | --- | --- |
| SPG_EMPLOYER | employer_id | UUID | - | ID unik majikan | System |
|  | payer_id | UUID | - | FK ke PAYER_MASTER | From Modul 1 |
|  | employer_code | VARCHAR | 30 | Kod majikan | System/Input |
|  | company_name | VARCHAR | 200 | Nama syarikat | Input form |
|  | registration_no | VARCHAR | 30 | No pendaftaran | Input form |
|  | contact_person | VARCHAR | 150 | Orang hubungan | Input form |
|  | contact_email | VARCHAR | 100 | Emel | Input form |
|  | contact_phone | VARCHAR | 15 | No telefon | Input form |
|  | address | TEXT | - | Alamat | Input form |
|  | status | VARCHAR | 20 | Status | System |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  |  |  |  |  |  |
| SPG_EMPLOYEE | employee_id | UUID | - | ID unik pekerja | System |
|  | employer_id | UUID | - | FK ke SPG_EMPLOYER | From employer |
|  | employee_no | VARCHAR | 30 | No pekerja | Input form |
|  | employee_name | VARCHAR | 150 | Nama pekerja | Input form |
|  | ic_number | VARCHAR | 14 | No IC | Input form |
|  | passport_number | VARCHAR | 20 | No Passport | Input form |
|  | nationality | VARCHAR | 50 | Warganegara | Input form |
|  | gender | CHAR | 1 | Jantina | Input form |
|  | birth_date | DATE | - | Tarikh lahir | Input form |
|  | department | VARCHAR | 100 | Jabatan | Input form |
|  | position | VARCHAR | 100 | Jawatan | Input form |
|  | join_date | DATE | - | Tarikh mula | Input form |
|  | deduction_type | VARCHAR | 20 | Jenis potongan | Input form |
|  | deduction_value | DECIMAL | 10,2 | Nilai tetap | Input form |
|  | deduction_percent | DECIMAL | 5,2 | Peratus | Input form |
|  | bank_code | VARCHAR | 10 | Kod bank | Input form |
|  | bank_account_no | VARCHAR | 30 | No akaun | Input form |
|  | bank_account_name | VARCHAR | 150 | Nama akaun | Input form |
|  | status | VARCHAR | 20 | Status pekerja | System |
|  | termination_date | DATE | - | Tarikh berhenti | Input form |
|  | remarks | TEXT | - | Catatan | Input form |
|  | created_by | VARCHAR | 50 | User ID cipta | Session |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |
|  | modified_by | VARCHAR | 50 | User ID kemaskini | Session |
|  | modified_date | TIMESTAMP | - | Tarikh kemaskini | System |
|  |  |  |  |  |  |
| SPG_PAYROLL_FILE | file_id | UUID | - | ID unik fail | System |
|  | employer_id | UUID | - | FK ke SPG_EMPLOYER | From employer |
|  | batch_id | UUID | - | FK ke BATCH_MASTER | From Modul 5 |
|  | payroll_month | DATE | - | Bulan payroll | Input form |
|  | file_name | VARCHAR | 255 | Nama fail asal | Upload |
|  | file_path | VARCHAR | 500 | Path simpanan | System |
|  | file_hash | VARCHAR | 64 | Hash fail | System |
|  | record_count | INTEGER | - | Jumlah rekod | System |
|  | valid_count | INTEGER | - | Rekod valid | System |
|  | invalid_count | INTEGER | - | Rekod tidak valid | System |
|  | total_amount | DECIMAL | 15,2 | Jumlah amaun | System |
|  | status | VARCHAR | 20 | Status fail | System |
|  | uploaded_by | VARCHAR | 50 | User ID upload | Session |
|  | uploaded_date | TIMESTAMP | - | Tarikh upload | System |
|  | validated_date | TIMESTAMP | - | Tarikh validasi | System |
|  | processed_date | TIMESTAMP | - | Tarikh diproses | System |
|  |  |  |  |  |  |
| SPG_PAYROLL_DETAIL | detail_id | UUID | - | ID unik detail | System |
|  | file_id | UUID | - | FK ke SPG_PAYROLL_FILE | From file |
|  | employee_id | UUID | - | FK ke SPG_EMPLOYEE | From employee |
|  | line_number | INTEGER | - | Baris dalam fail | System |
|  | employee_no | VARCHAR | 30 | No pekerja | From file |
|  | amount | DECIMAL | 10,2 | Amaun | From file |
|  | bank_code | VARCHAR | 10 | Kod bank | From file |
|  | bank_account_no | VARCHAR | 30 | No akaun | From file |
|  | validation_status | VARCHAR | 20 | Status validasi | System |
|  | validation_errors | TEXT | - | JSON error | System |
|  | processing_status | VARCHAR | 20 | Status proses | System |
|  | transaction_id | UUID | - | FK ke TRANSACTION_MASTER | From Modul 3 |
|  | error_message | TEXT | - | Mesej ralat | System |
|  | created_date | TIMESTAMP | - | Tarikh cipta | System |


| AC ID | Kriteria | Kaedah Ujian | Keputusan Jangkaan |
| --- | --- | --- | --- |
| AC-01 | Majikan boleh log masuk ke portal SPG | Cuba log masuk dengan credentials sah | Log masuk berjaya, dashboard dipaparkan |
| AC-02 | Majikan boleh menambah pekerja baru | Isi borang tambah pekerja, klik simpan | Pekerja baru muncul dalam senarai |
| AC-03 | Majikan boleh mengimport pekerja dari Excel | Upload fail Excel dengan senarai pekerja | Semua pekerja diimport, ringkasan dipapar |
| AC-04 | Majikan boleh memuat naik fail payroll bulanan | Upload fail payroll yang lengkap dan sah | Fail diterima, status 'UPLOADED' |
| AC-05 | Sistem mengesan ralat dalam fail payroll | Upload fail dengan data salah (format, no pekerja) | Ralat dikesan, laporan ralat dijana |
| AC-06 | Majikan boleh melihat status fail payroll | Selepas upload, semak status | Status dikemaskini (UPLOADED/VALIDATED/PROCESSED) |
| AC-07 | Sistem memproses SPG bulanan secara automatik pada tarikh ditetapkan | Tunggu tarikh proses, semak transaksi | Transaksi untuk semua majikan dijana |
| AC-08 | Transaksi SPG direkod dalam sistem dengan betul | Semak transaksi yang dijana | Amaun, pembayar, dan rujukan betul |
| AC-09 | Majikan menerima laporan bulanan selepas pemprosesan | Semak emel/portal majikan | Laporan ringkasan diterima |
| AC-10 | Reconciliation SPG dapat memadankan transaksi dengan bank | Jalankan reconciliation dengan data bank sample | Padanan tepat, percanggahan dikenalpasti |
| AC-11 | Eksekutif boleh menyelesaikan percanggahan reconciliation | Pilih percanggahan, selesaikan manual | Percanggahan ditandakan selesai |


| AC ID | Kriteria | Kaedah Ujian | Keputusan Jangkaan |
| --- | --- | --- | --- |
| AC-P01 | Portal majikan boleh mengendalikan 1000 majikan serentak | Simulasi 1000 pengguna serentak | Masa respons < 3 saat |
| AC-P02 | Pemprosesan bulanan untuk 500 majikan selesai dalam < 2 jam | Jalankan proses untuk 500 majikan (500,000 pekerja) | Proses selesai dalam masa ditetapkan |
| AC-P03 | Upload fail 100,000 rekod mengambil masa < 30 saat | Upload fail besar, ukur masa | Masa upload + validasi awal < 30 saat |
| AC-P04 | Carian pekerja dalam senarai 100,000 pekerja < 2 saat | Cari pekerja menggunakan nama/no pekerja | Hasil dipaparkan < 2 saat |


| AC ID | Kriteria | Kaedah Ujian | Keputusan Jangkaan |
| --- | --- | --- | --- |
| AC-R01 | Data pekerja selamat dan hanya boleh diakses oleh majikan sendiri | Cuba akses data majikan lain | Tidak dibenarkan, redirect/error |
| AC-R02 | Fail payroll yang diupload disimpan dengan selamat | Semak storage dan backup | Fail boleh diakses semula bila perlu |
| AC-R03 | Pemprosesan bulanan boleh dijalankan semula jika gagal | Simulasi kegagalan separuh jalan | Proses boleh disambung, tiada data duplikasi |
| AC-R04 | Audit log merekod semua aktiviti penting | Semak log untuk aktiviti (upload, proses, dll) | Setiap aktiviti direkod dengan butiran |


| AC ID | Kriteria | Kaedah Ujian | Keputusan Jangkaan |
| --- | --- | --- | --- |
| AC-U01 | Antaramuka mesra pengguna dan mudah difahami | Pengguna baru cuba navigasi | Pengguna dapat melaksanakan tugas tanpa latihan |
| AC-U02 | Mesej ralat jelas dan membantu | Buat kesilapan, baca mesej | Mesej menerangkan masalah dan cara betulkan |
| AC-U03 | Dashboard memaparkan maklumat ringkas dan berguna | Lihat dashboard | Maklumat terkini dan relevan dipaparkan |
| AC-U04 | Responsif pada pelbagai saiz skrin (desktop/tablet) | Buka pada tablet | Paparan sesuai dan fungsi masih boleh digunakan |
