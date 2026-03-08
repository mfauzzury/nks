LEMBAGA ZAKAT SELANGOR (LZS)
New Kutipan System 2.0 (NKS)

---

Kutipan Overview
Users NKS
• Individu
• Staff
• Company/Majikan
• Ejen
DATA MANAGEMENT DATA PROCESSING DATA ANALYTICS
• Amil
Individu Company/ Ejen Amil Source Process Integration Reporting & Dashboard
Majikan • Individu • Registration Backend Integration
• Penolong
• Kaunter • Approval • Sistem Kewangan
• Institusi Amil Fitrah
• Company/Majikan • Payment (SAP)
Pendidikan (PAF) • Amil/Ejen • Frequency • Sistem Agihan
Islam Swasta • Penolong
• Commission • Sistem Kerajaan (AG)
(IPIS) Amil Padi • Third Party (eg • Agihan Semula • Third Party
• Institusi (PAP) Banks) • Bulk Processing Frontend Integration
Pengajian • Penolong • Sistem Kerajaan (Heavy Load Data • Kutipan Micro
Tinggi (IPT) Amil (eg AG) e.g Matching Bank services
• Ejen Perunding Lapangan • Kutipan micro Transaction) • Third party
(PAL) services
DATA: Data Static & Data Dynamic
Types of Zakat
METHOD: Real time, bulk, single, batch
Method of Payment (MOP)
Frequency - one time, monthly
• IC, Isu profile menggunakan passport perlu ada alternative
untuk kemaskini kerana penggunaan passport akan berlaku
METHOD: 1 to 1, 1 to Many, Many to 1
perubahan sekiranya terdapat pembaharuan.
• Capture data duplicate antara pembayar individu & company.
• Pembayar “HAMBA ALLAH}

---

Module Overview
Backend
Self service Ejen Majikan Kaunter
Processing
• Profil • Proses Ejen • Proses Majikan • Proses • Proses data
pengurusan secara pukal
• Pembayaran • Proses Kutipan • Proses Kutipan
kaunter
• Integration
• Penyata • Agihan Semula • Proses
• Pengurusan pelbagai
Pembayaran Potongan Gaji
• Laporan
tunai channel,
• Laporan
• Integration
method dan
• Proses kutipan
• Gerbang pembayaran • Integration
format
• Laporan
pembayaran pembayaran
• Laporan
(cth : fpx, • Integration
• Pengurusan
debit/kredit pembayaran
Kupon
T&G, Grab
• Off-line
• Proses agihan
, kutipan dan
kemaskini
kupon

---

Integration
Overview

---

Infrastructure Overview
Users
• Individu
• Staff
• Company/Majikan
• Ejen
Application Accessibility • Amil
VS
>10000 co-current
Infrastructure
access
PERFORMANCE
Processing
*High volume
transaction Security
Note : peak period :
500,000 trx
*Integration

---

Infrastructure Requirements
On-premise Cloud Service
•Infrastructure Architecture Conceptual •Infrastructure Architecture Conceptual
Diagram Diagram
•Hardware Requirement including DR Site •Hardware Requirement including DR Site
•Server, Storage, Switch, Rack •Cloud provider and category (eg private
cloud) – Register MCMC
•Year of Manufacturing and EOL
•Cloud computing ( eg Saas, Iaas)
•N-Tier Architecture
•Server, Storage (info)
•Licenses(Hardware and software)
•Network connection (public & IPVPN to
•Backup Solution (ability integrate with
internal system
Veeam-including license)
•N-Tier Architecture
•Disaster Recovery (ability integrate with
Veeam) •Licenses(Hardware and software)
•Security Solution •Backup Solution
•Penetration test and Vulnerability •Disaster Recovery
Assessment (VA) •Security Solution
Include :
•Integration Solution ( eg : API Gateway) • Cyber Security Standard (eg ISO 27001,
i Development, Staging, Testing and
SOC, Network Security, Threat Hunting,
Web Application Firewall (WAF)) Production environment /landscape
ii. projections over a 3-year and 5-
•Penetration test and Vulnerability
year timeframe
Assessment (VA)
•Integration Solution (eg : API Gateway)

---

Thank you LEMBAGA ZAKAT
SELANGOR (LZS)