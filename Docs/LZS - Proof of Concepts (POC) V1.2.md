SPESIFIKASI PERBENTANGAN POC
LEMBAGA ZAKAT SELANGOR (LZS)
9-10 MARCH 2026
Hak Cipta Terpelihara © Lembaga Zakat Selangor (MAIS) 2026

---

Agenda Pre-POC
Project Management
Proposal and Recent (3 years) proven Technical Question and Answer
Strategy (SME and PMO),
Demonstrations projects with similar (Infra & Application) Session
• Key Project Resource
(End to end functionality experience 2022 - 2024
engagement
including advantages/
(Fulltime/onsite/hybrid)
speciality/added value)
• End to end project
delivery implementation
strategy
• Integration strategy
method
• Key project deliverables
• Change Management
• Quality Control
• SLA and Maintenance
Support
01 02 03 04 05
35 Minutes 05 Minutes 08 Minutes 08 Minutes 20 Minutes
Hak Cipta Terpelihara © Lembaga Zakat Selangor (MAIS) 2026 2

---

Application Requirement
Application Architecture Conceptual Diagram
Font/User Interface Solution
Processing Solution
Report, Query and Business Intelligence
Database Architecture
System Administration
User access ( Matrix)
Audit Trail
Hak Cipta Terpelihara © Lembaga Zakat Selangor (MAIS) 2026 3

---

Infrastructure Overview
Users
•Individu Accessibility
Application vs
•Staff
> 1,000 co-current
•Company/Majikan Infrastructure
•Ejen access
•Amil
Performance
Measurement tools &
report
Processing
*Integration Security
*High volumetransaction
Note : peak period :500,000trx
*Integration
Hak Cipta Terpelihara © Lembaga Zakat Selangor (MAIS) 2026 4

---

Infrastructure Requirements
On-premise Cloud Service
•Infrastructure Architecture Conceptual Diagram • Infrastructure Architecture Conceptual Diagram
• Hardware Requirement including DR Site
•Server Requirement including DR Site
• Cloud provider and category (egpublic cloud)
•Serverspec, Storagecapacity, and other related
• Cloud computing ( egSaas, Iaas)
•Licenses(Hardware and software)
• Server, Storage (info)
•Backup Solution& Disaster Recovery(ability integrate with
• Network connection (info)
Veeam-including license)
• N-Tier Architecture
•Security Solution • Licenses(Hardware and software)
•Penetration test and Vulnerability Assessment (VA) • Backup Solution& Disaster Recovery
• Security Solution
•Integration Solution
• Cyber Security Standard (egISO 27001, SOC, Network Security, Threat
Hunting)
• Penetration test and Vulnerability Assessment (VA)
• Integration Solution
• Development, Staging, Testing and Production environment /landscape
• Projections over a 3-year and 5-yeartimeframe
Other specification:
Authentication – application must support entraID
Support modern authentication – Oauth for SMTP
Connectivity – tunnel,example
Hak Cipta Terpelihara © Lembaga Zakat Selangor (MAIS) 2025 5

---

Project Management
• Proposed Org Structure
• Specifically focus on SME, Fulltime/Onsite
Strategy and
Strong • Partnering Information
Capability
• Project Management Strategy
Skills
• Migration/Integration/Change Management
• Quality Control
Hak Cipta Terpelihara © Lembaga Zakat Selangor (MAIS) 2026 6

---

Scenario - Pembayaran
➢ Senario ini disediakan sebagai panduan kepada pembida untuk memberi gambaran menyeluruh berkenaan proses kerja, keperluan fungsian dan integrasi yang
terlibat dalam pelaksanaan sistem.
Data Data Data
Source Data
Management Processing Analytics
• Kaunter (NKS) • Profil Pembayar • Pendaftaran dan pembayaran • Senarai Pembayar
• JenisPembayaran (Cash, • Update Profil • JumlahPembayaran
FPX, Cheque, etc) • Semakdan bandingkan
dengan data pembayar di
dalamNKS
• Bulk Proccesing
• Duplicate checking
• Pembayaran secara berjadual
• Semakdan proses dengan 3rd
party (eg Bank)
Author : Pembayar Individu/ Korporat, Executive Kaunter, Executive Processing
Key : Data Management, Process Payment
Hak Cipta Terpelihara © Lembaga Zakat Selangor (MAIS) 2026 7

---

Scenario – Skim Potongan Gaji (SPG)
➢ Senario ini disediakan sebagai panduan kepada pembida untuk memberi gambaran menyeluruh berkenaan proses kerja, keperluan fungsian dan integrasi yang
terlibat dalam pelaksanaan sistem.
Data Analytics
• Senarai Pembayar
• Source Data
Data Processing • JumlahPembayaran
• Pendaftaran dan
pembayaran
Data Management • potongan gaji yang
dipersetuju
• Profil Majikan
• Source data
• Profil Pembayar
• Update Profil
Source Data
• Semakdan bandingkan
• Portal Kutipan (NKS)
dengan data pembayar di
• Portal Majikan (NKS) dalam NKS
• Bulk Proccesing
• Duplicate checking
between source data
• Pembayaran secara
berjadual
• Semakdan proses dengan
3rd party (eg Bank)
Author : Pembayar Individu/ Korporat, Executive Kaunter, Executive Processing
Key : Data Management, Process Payment
Hak Cipta Terpelihara © Lembaga Zakat Selangor (MAIS) 2026 8

---

Scenario – Integration 3rd Party
➢ Senario ini disediakan sebagai panduan kepada pembida untuk memberi gambaran menyeluruh berkenaan proses
kerja, keperluan fungsian dan integrasi yang terlibat dalam pelaksanaan sistem.
Source Data Method and Data Data Data Analytics
Type Data Management Processing
Transfer
• Skim • File Transfer • Profil • Semak dan • Senarai
Potongan Protocal Pembayar bandingkan Pembayar
Gaji (Jabatan (FTP) • Jumlah dengan data • Source Data
Akauntan • File format Bayaran pembayaran • Jumlah
Negara di dalam
.txt (encrypt) Pembayaran
• Platform NKS
• Transaction :
Saluran • Bulk
minimum
Pembayaran Proccesing
1000 per file
(PSP) • Duplicate
• Bank (Bank checking (eg
Islam, tarikh
Maybank) transaksi
yang sama)
Author : Executive Processing
Key : Data Management, Process Payment
Hak Cipta Terpelihara © Lembaga Zakat Selangor (MAIS) 2026 9