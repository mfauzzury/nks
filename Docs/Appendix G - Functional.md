Lembaga Zakat Selangor New Kutipan System
Functional
Appendix G
Technical (Functional)
REQUEST FOR PROPOSAL (RFP)
FOR THE DESIGN, DEVELOPMENT, INSTALLATION,
CONFIGURATION, TESTING, COMMISSIONING AND
PROVISIONING OF SUPPORT AND MAINTENANCE FOR
NEW KUTIPAN SYSTEM OF
LEMBAGA ZAKAT SELANGOR (MAIS)
No. Tender : LZS/DP/100-T (2/2026)
Private & Confidential Page 1 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Content
CONTENT ........................................................................................................................................................... 2
1. INTRODUCTION ........................................................................................................................................ 4
1.1. EXECUTIVE SUMMARY ............................................................................................................................. 4
1.2. OVERALL SOLUTION ............................................................................................................................... 5
2. FUNCTION FOR SELF SERVICES ............................................................................................................... 8
2.1. OVERVIEW .................................................................................................................................................. 8
2.2. SOLUTION COMPONENT ................................................................................................................................ 9
2.3. FUNCTION OF THE SYSTEM ........................................................................................................................... 15
2.4. MODULE .................................................................................................................................................. 20
2.5. RISK ........................................................................................................................................................ 33
2.6. SECURITY ................................................................................................................................................. 39
2.7. SUMMARY ................................................................................................................................................ 44
3. FUNCTION FOR AGENT ........................................................................................................................... 45
3.1. OVERVIEW ................................................................................................................................................ 45
3.2. SOLUTION COMPONENT .............................................................................................................................. 46
3.3. FUNCTIONS OF THE SYSTEM .......................................................................................................................... 53
3.5. RISK ........................................................................................................................................................ 70
3.6. SECURITY ................................................................................................................................................. 70
3.7. CONCLUSION ........................................................................................................................................... 71
4. FUNCTION FOR EMPLOYEE , SPG........................................................................................................... 73
4.1. OVERVIEW ................................................................................................................................................ 73
4.2. SOLUTION COMPONENT .............................................................................................................................. 74
4.3. FUNCTION OF THE SYSTEM ........................................................................................................................... 76
4.4. CONTRIBUTION & DEDUCTION MANAGEMENT .................................................................................................. 79
4.5. EMPLOYER VERIFICATION & APPROVAL ........................................................................................................... 80
4.6. PAYMENT & RECEIPT ................................................................................................................................... 81
4.7. WAKALAH INTEGRATION .............................................................................................................................. 83
4.8. REPORTING & ANALYTICS (EMPLOYEE SPG) .................................................................................................... 83
4.9. MODULE .................................................................................................................................................. 85
7.2. RISK ........................................................................................................................................................ 91
7.3. SECURITY ................................................................................................................................................. 91
7.4. CONCLUSION ........................................................................................................................................... 93
8. FUNCTION FOR COUNTER...................................................................................................................... 94
8.1. OVERVIEW ................................................................................................................................................ 94
8.2. SOLUTION COMPONENT .............................................................................................................................. 95
8.3. CORE ENGINES ......................................................................................................................................... 97
8.4. INTEGRATION LAYER ................................................................................................................................... 99
8.5. FUNCTION OF THE SYSTEM ......................................................................................................................... 101
8.6. MODULE ................................................................................................................................................ 119
8.7. RISK ...................................................................................................................................................... 127
8.8. SECURITY ............................................................................................................................................... 129
8.9. CONCLUSION ......................................................................................................................................... 132
9. FUNCTION FOR BACK-END PROCESSING ........................................................................................... 133
9.1. OVERVIEW .............................................................................................................................................. 133
9.2. SOLUTION COMPONENT ............................................................................................................................ 134
9.3. FUNCTION OF THE SYSTEM ......................................................................................................................... 141
9.4. MODULE ................................................................................................................................................ 151
9.5. RISK ...................................................................................................................................................... 155
9.6. SECURITY ............................................................................................................................................... 159
Private & Confidential Page 2 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
9.7. CONCLUSION ......................................................................................................................................... 162
10. FUNCTION FOR SAP RE-CONCILIATION .......................................................................................... 164
10.1. OVERVIEW ............................................................................................................................................ 164
10.2. SOLUTION COMPONENT .......................................................................................................................... 165
10.3. FUNCTION OF THE SYSTEM ....................................................................................................................... 170
10.4. MODULE .............................................................................................................................................. 177
10.5. RISK .................................................................................................................................................... 185
10.6. SECURITY ............................................................................................................................................. 189
10.7. SUMMARY ............................................................................................................................................. 193
11. COUPON ........................................................................................................................................... 195
11.1. OVERVIEW ............................................................................................................................................ 195
11.2. SOLUTION COMPONENT .......................................................................................................................... 195
11.3. FUNCTION ............................................................................................................................................ 196
11.4. MODULE .............................................................................................................................................. 197
11.5. SUMMARY ............................................................................................................................................. 198
12. CONCLUSION ................................................................................................................................... 199
Private & Confidential Page 3 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
1. Introduction
1.1. Executive Summary
The proposed New Kutipan System for Lembaga Zakat Selangor (LZS) is a fully
integrated, enterprise-grade zakat collection and financial reconciliation platform
designed to ensure:
• End-to-end financial integrity
• Real-time operational visibility
• Automated reconciliation with
SAP FI
• Zero duplication risk
• Controlled adjustment
governance
• Audit-grade traceability
The system consolidates all collection
channels Counter, SPG (Salary Potongan Gaji), Agent, PSP, Employer, and Backend
Processing into a unified architecture that ensures seamless integration with:
• SAP Finance (GL & Clearing)
• Bank Settlement Files
• FPX / Payment Gateway
• Wakalah System
• Payroll & Employer Systems
The design emphasizes strict RBAC control, ACID-compliant transaction processing,
automated bank reconciliation, duplicate prevention (Z1 control), and structured
reversal workflows to safeguard financial accuracy and compliance.
This solution transforms the zakat collection ecosystem into a centralized, controlled,
scalable, and audit-ready platform aligned with enterprise financial standards.
Private & Confidential Page 4 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
1.2. Overall Solution
The proposed solution is structured into four integrated layers:
1.2.1. Front-End Operational Layer
Covers all transaction origination channels:
• Counter System (cash & non-cash collection)
• SPG (Salary Deduction) Portal
• Employer (e-Majikan) Portal
• Agent Portal
• Admin & Finance Console
Each channel feeds standardized transaction data into the centralized backend
processing engine.
1.2.2. Core Processing & Financial Control Layer
This layer ensures transaction integrity before impacting SAP:
• Data ingestion & IDD validation
• Header-detail tally enforcement
• Duplicate prevention (hash validation + document tracking)
• ACID-compliant batch processing
• Pending settlement lifecycle control
• Assignment reference validation
Private & Confidential Page 5 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Clearing verification engine
• Variance detection & exception isolation
• Controlled reversal & adjustment workflow
This ensures:
• No partial transaction commit
• No duplicate GL posting
• No incorrect mapping to SAP
1.2.3. SAP Reconciliation & Finance Integration Layer
The SAP Reconciliation module ensures:
• GL Posting validation (Company Code, GL Account, Posting Key)
• Assignment reference enforcement for clearing
• Multi-parameter bank reconciliation
• Lump sum vs detail GL aggregation control
• Z1 duplicate prevention
• Clearing success monitoring
• Variance classification (Matched / Pending / Failed)
• Multi-level approval for reversal
• Audit-grade logging
Integration supports:
• SAP FI (GL & Clearing)
Private & Confidential Page 6 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Bank Statement Interface
• Payment Gateway / FPX
• Counter & SPG backend
This ensures that operational collection is translated into accurate, compliant
SAP accounting records.
1.2.4. Governance, Security & Monitoring Layer
The system is built with enterprise governance principles:
• Strict RBAC segregation (Processor / Supervisor / Finance / Admin)
• Segregation of posting and approval roles
• Mandatory reason code for adjustment
• Multi-level approval enforcement
• Encrypted integration (TLS / SFTP)
• Secure SAP authentication (Token / Certificate)
• Full audit trail for all reconciliation and adjustment
• Real-time variance alerts
• Clearing aging dashboard
• PDPA-compliant data masking
This ensures financial security, compliance, and audit transparency.
Private & Confidential Page 7 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
2. Function For Self Services
2.1. Overview
This proposal outlines the design, architecture, and implementation approach for the
Self-Service and Self-Service Payment (Without Login) modules of the New Kutipan
System for Lembaga Zakat Selangor (LZS).
The proposed solution delivers:
• A secure and scalable zakat payment platform
• Full compliance with official LZS zakat calculation formulas
• Secure onboarding (Quick + Full registration) with Multi-Factor
Authentication (MFA)
• Official LZS-compliant Zakat Calculation Engine with admin-
configurable rules
• Automatic Gold/Silver Price & Nisab updates using market APIs
• Omnichannel payment support with strong transaction security controls
• User dashboard and notification modules that are admin-configurable
and manageable
• Salary deduction integrated with SAP Financial and open APIs for other
systems
• Microservices-ready integration architecture
Private & Confidential Page 8 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
2.2. Solution component
The Self-Service function enables individual contributors (payers), employers, and
administrators to interact directly with the zakat ecosystem through a secure,
automated, and integrated platform.
It ensures calculation accuracy, payment convenience, salary deduction
management, real-time updates, and full audit visibility.
2.2.1. Application Layer
This layer represents all user-facing interfaces and experience components.
A. Self-Service Portal (Web & Mobile Responsive)
A centralized, responsive portal accessible via desktop and mobile devices.
Core Capabilities:
• User registration (new & returning users)
• Secure login with MFA
• Profile management (IC, employer, contact details)
• Zakat calculator simulation (real-time computation)
• Payment initiation (omnichannel)
• Salary deduction (SPG) enrollment
• Wakalah viewing (if applicable)
• Transaction history & statement download
• Contribution tracking dashboard
• Notification inbox & reminders
Design Principles:
• Mobile-first responsive UI
• Simple, guided workflow
• PDPA-compliant data handling
• High usability and accessibility compliance
B. Admin Monitoring Dashboard
Administrative interface for LZS operations team.
Private & Confidential Page 9 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Core Capabilities:
• Real-time KPI monitoring
• Collection breakdown by channel
• SPG enrollment tracking
• Pending payment monitoring
• Payment success/failure statistics
• Notification campaign tracking
• User activity analytics
Provides operational transparency and management oversight.
2.2.2. Core Engine Layer
This layer handles business logic, rule enforcement, and transaction
orchestration.
A. Zakat Calculation Engine (Configurable Rule Engine)
The intelligent computation engine responsible for zakat amount
determination.
Private & Confidential Page 10 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Functional Capabilities:
• Supports multiple zakat types (Pendapatan, Emas, Perniagaan, etc.)
• Configurable nisab threshold logic
• Configurable deduction percentage
• Supports annual recalibration
• Handles exemption rules
• Simulation vs actual calculation mode
• Audit log of calculation parameters
Ensures calculation accuracy aligned with Shariah guidelines.
B. Gold Price & Nisab Service
Automated reference rate management.
Functional Capabilities:
• API integration with approved gold price source
• Scheduled auto-update mechanism
• Historical gold rate archive
• Nisab threshold recalculation
• Failover rate logic (fallback source if API unavailable)
Ensures calculation remains accurate and up to date.
C. Payment Orchestration Service (Omnichannel)
Centralized controller for all payment activities.
Supported Channels:
• FPX
• Debit/Credit Card
• E-Wallet
• QR Payment
• Salary Deduction
• Direct Debit (if enabled)
Functional Capabilities:
• Payment lifecycle tracking (Pending / Success / Failed / Cancelled)
• Callback verification from gateway
• Retry & timeout handling
• Duplicate payment prevention
Private & Confidential Page 11 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Settlement status synchronization
• Transaction reference generation
D. Salary Deduction Service (SPG Engine)
Handles enrollment and lifecycle of salary-based contributions.
Functional Capabilities:
• Enrollment validation
• Employer linking
• Deduction percentage enforcement
• Amendment & termination control
• Status lifecycle tracking
• Deduction reconciliation monitoring
• External payroll API compatibility
Ensures structured and compliant SPG contribution management.
E. Notification Management Engine
Automated communication controller.
Channels:
• Email
• SMS
• WhatsApp
• In-App Notification
Functional Capabilities:
• Template-based message configuration
• Rule-based trigger setup
• Scheduled reminders (e.g., deduction deadline)
• Delivery status tracking
• Escalation notification logic
Ensures timely and consistent communication.
2.2.3. Core System Layer
This layer provides governance, security enforcement, monitoring, and audit
control.
A. Identity & Access Management (IAM) + MFA
Private & Confidential Page 12 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Security backbone of the Self-Service platform.
Functional Capabilities:
• Role-Based Access Control (User / Employer / Admin)
• Multi-Factor Authentication (OTP / Authenticator App)
• Password complexity enforcement
• Account lockout after failed attempts
• Session timeout management
• Login activity logging
Ensures secure and controlled access.
B. Dashboard & Metrics Service
Dynamic reporting layer.
Functional Capabilities:
• Admin-configurable widgets
• KPI configuration
• Trend visualization
• Drill-down analytics
• Contribution penetration monitoring
• Potential vs actual comparison
Supports management-level insight and decision making.
C. Audit, Monitoring & Reporting Service
Enterprise-grade audit framework.
Functional Capabilities:
• Full user activity logging
• Payment audit log
• Calculation audit trail
• Salary deduction audit
• Exportable statements (PDF / CSV)
• SLA monitoring
• System health monitoring
Ensures compliance and traceability.
Private & Confidential Page 13 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
2.2.4. Integration Layer
This layer connects Self-Service to external and enterprise systems.
A. SAP Integration
• Salary deduction posting
• Financial transaction synchronization
• Status feedback loop
• Clearing alignment
Ensures enterprise accounting compliance.
B. Payment Gateway / FPX Integration
• Real-time payment processing
• Callback verification
• Fraud prevention support
• Settlement reconciliation
Ensures secure transaction processing.
C. Gold Price API Integration
• Scheduled rate retrieval
• Validation mechanism
• Failover handling
Ensures nisab calculation accuracy.
D. Payroll System Integration
• API-based deduction instruction
• Employer payroll synchronization
• Status confirmation loop
Private & Confidential Page 14 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Supports corporate SPG contributions.
Risk Mitigation
Fraud attempts CAPTCHA + rate limiting
Fake emails Email validation + OTP optional
Payment spoofing Webhook signature validation
Multiple gateway failover
Gateway downtime
(optional)
High traffic during peak season Auto-scaling infrastructure
E. Notification Gateway Integration
• SMTP Email Server
• SMS Gateway
• WhatsApp Business API
Ensures reliable outbound communication.
2.2.5. Summary
The Self-Service function is structured to ensure:
• Secure and convenient contributor access
• Accurate and configurable zakat calculation
• Seamless omnichannel payment execution
• Structured salary deduction lifecycle management
• Real-time monitoring and KPI visibility
• Strong governance with audit-grade traceability
• Enterprise integration with SAP and payment systems
This layered architecture provides scalability, compliance, operational
efficiency, and digital convenience for Lembaga Zakat Selangor’s zakat
contributors.
2.3. Function of the system
Self-Service & Guest Payment System
Private & Confidential Page 15 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
The Self-Service & Guest Payment System is designed as a secure, compliant, and
scalable digital zakat platform that enables both individual and corporate payers to
calculate, manage, and perform zakat payments through online channels either with
login (registered users) or without login (guest mode) while preserving governance,
financial integrity, and Shariah compliance.
The system is built to support LZS operational, financial, and compliance
requirements in a controlled digital environment.
2.3.1. Compliance with Official LZS Zakat Computation Methodology
The system embeds the official LZS zakat calculation formulas within a
configurable rules engine.
This ensures:
• Accurate zakat computation according to approved LZS formulas
• Support for multiple zakat categories (Income, Business, Gold, Savings,
etc.)
• Nisab threshold validation before payable confirmation
• Version-controlled formula management (e.g., Formula 2026 vs 2027)
• Transparent breakdown display for payer verification
• Audit logging of calculation logic used
This guarantees that all calculations remain aligned with Shariah requirements
and institutional policies without manual intervention.
2.3.2. Secure Identity Verification and Access Control
The system supports tiered identity assurance levels:
For Registered Users:
• Quick registration (minimal onboarding)
• Full registration (complete compliance profile)
• Multi-Factor Authentication (MFA)
• Risk-based authentication (new device/IP anomaly detection)
For Guest Users:
• Minimum identity capture
• CAPTCHA enforcement
• Rate limiting and fraud screening
Private & Confidential Page 16 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Security mechanisms include:
• Strong password policy
• Encrypted sensitive data (AES-256)
• Password hashing (Argon2/bcrypt)
• OTP verification (SMS/Email)
• Login lockout policy
This ensures identity integrity, reduces impersonation risk, and supports
PDPA compliance.
2.3.3. Omni channel Digital Payment Processing
The system provides seamless digital payment orchestration across multiple
channels:
• Debit/Credit Card
• FPX (Online Banking)
• DuitNow QR
• Apple Pay
• Samsung Pay
• Touch ‘n Go
• GrabPay
Key payment controls include:
• PCI-DSS compliant hosted payment pages
• Tokenized transactions
• Webhook-based payment confirmation
• 3D Secure authentication
• Anti-replay protection
• Fraud rule screening
This allows payers to choose their preferred channel while ensuring secure and
verified transaction processing.
2.3.4. Automated Gold Price & Nisab Updates
The system integrates with trusted precious metals APIs to automatically
update:
• Gold price (XAU)
• Silver price (XAG)
Private & Confidential Page 17 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Nisab thresholds
Features include:
• Scheduled rate synchronization (daily/hourly)
• Historical rate storage
• Admin override capability (with audit trail)
• Configurable nisab computation logic (spot vs average)
This ensures that zakat eligibility calculations remain accurate and policy-
compliant at all times.
2.3.5. Salary Deduction Integration with SAP & External Payroll Systems
The system supports structured zakat payment via salary deduction, integrated
with financial systems.
Capabilities include:
• Recurring deduction plan setup
• Frequency & duration configuration
• Pause/resume/cancel control
• SAP GL posting integration
• Reference mapping between Kutipan System and SAP document
numbers
• Reconciliation status monitoring
Additionally, APIs are available for integration with:
• External payroll providers
• Employer systems
• Direct debit services
This ensures structured recurring payment management while maintaining
financial traceability.
2.3.6. Real-Time Notification & Statement Generation
The system includes a centralized Notification Management Service supporting:
• In-app notifications
• Email
• SMS
• WhatsApp Business API
Private & Confidential Page 18 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Trigger-based notifications include:
• Payment success/failure
• Statement generation
• Nisab alerts
• Salary deduction confirmation
• Profile change alerts
Statement features include:
• Monthly statements
• Annual tax-compliant statements
• PDF generation
• Auto-email delivery
• QR verification support
This ensures transparent communication and compliance with LZS/LHDN
documentation standards.
2.3.7. Full Audit Traceability and Financial Governance
Every transaction, calculation, update, and configuration change is recorded
with:
• Timestamp
• User ID
• IP/device metadata
• Action log
• Before/after values (where applicable)
Audit logs support:
• Internal finance review
• Compliance audit
• Dispute resolution
• Fraud investigation
This provides complete financial governance across both registered and guest
payment flows.
Private & Confidential Page 19 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
2.3.8. Fraud Prevention & Duplicate Transaction Control
The system incorporates layered fraud protection mechanisms:
• Transaction ID uniqueness enforcement
• IP rate limiting
• CAPTCHA & bot detection
• Device fingerprinting (optional enhancement)
• Duplicate detection logic
• Suspicious pattern monitoring
• Fraud rule engine screening
These controls prevent:
• Duplicate payment attempts
• Automated bot attacks
• Transaction replay
• Anomalous amount behavior
This ensures payment integrity and protects institutional financial exposure.
System Balance & Governance Philosophy
The Self-Service & Guest Payment System is designed around four core pillars:
1. Convenience – Simple digital access with minimal friction
2. Compliance – Alignment with LZS and Shariah rules
3. Security – Strong identity, transaction, and fraud protection
4. Financial Governance – Full traceability and integration with SAP
It creates a controlled digital ecosystem where zakat payers can transact
confidently, and LZS can maintain operational transparency, audit readiness,
and financial integrity.
2.4. Module
2.4.1. MODULE 1: Registration & Identity Management
A. Objective
To securely onboard users (individual or corporate) with configurable
identity verification levels while maintaining compliance with PDPA and
cybersecurity standards.
B. Submodule 1.1 – Quick Registration
Private & Confidential Page 20 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Objective:
Enable fast onboarding for immediate zakat payment.
Functions:
•Capture minimum identity data
• reCAPTCHA verification
• OTP verification (SMS/Email)
• Consent confirmation (PDPA & Terms)
• Rate limiting & login lockout
• Temporary profile creation
C. Submodule 1.2 – Full Registration (With MFA)
Objective:
Create verified payer profiles for compliance-ready official statements.
Functions:
• Capture full identity details (NRIC/Passport/SSM)
• Address & contact verification
• Employment/business data capture
• Preferred tax receipt mapping
• Mandatory MFA enforcement
• Risk-based MFA trigger (new device/IP anomaly)
• Version-controlled compliance settings
D. Submodule 1.3 – Identity & Access Security
Objective:
Ensure account security and compliance.
Functions:
• Password policy enforcement
• Argon2/bcrypt password hashing
• AES-256 sensitive data encryption
• OTP verification & expiry control
• Account lockout after failed attempts
• PDPA compliance enforcement
Private & Confidential Page 21 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
2.4.2. MODULE 2: Zakat Calculation Engine
A. Objective
Provide accurate, configurable, version-controlled zakat calculations
aligned with official LZS methodology.
B. Submodule 2.1 – Rules-Based Calculation Engine
Functions:
• Income, Business, Savings, Gold/Silver, EPF support
• Configurable formula parameters
• Year-based formula versioning
• Admin-managed threshold settings
• Calculation trace audit logging
C. Submodule 2.2 – Rules Repository & Interpreter
Functions:
• Store calculation rules & historical versions
• Execute rule logic dynamically (no redeployment)
• Validation layer for mandatory inputs
• Simulator/testing environment for admin
D. Submodule 2.3 – Gold Price & Nisab Auto Update
Functions:
• API integration (Metals API, GoldAPI, etc.)
• Scheduler (daily/hourly rate pull)
• Historical rate storage
• Admin override with audit trail
• Nisab calculation (spot / average / policy-based)
2.4.3. MODULE 3: Guest Payment (Self-Service Without Login)
A. Objective
Enable secure zakat payment without requiring account registration.
B. Submodule 3.1 – Guest Payment Flow Engine
Functions:
• Zakat category selection
• Built-in calculator option
• Manual amount entry
Private & Confidential Page 22 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Minimum payer data capture
• Duplicate detection logic
• CAPTCHA enforcement
C. Submodule 3.2 – Secure Payment Processing
Functions:
• PCI-DSS hosted payment page
• Tokenized transaction session
• Webhook signature validation
• HMAC verification
• 3D Secure enforcement
• Transaction ID uniqueness check
• Anti-replay protection
• Timeout control
D. Submodule 3.3 – Receipt & Confirmation
Functions:
• PDF receipt auto-generation
• Email receipt dispatch
• SMS confirmation (optional)
• QR verification code embedding
• Audit trail logging
• Guest transaction linking to future registered profile
2.4.4. MODULE 4: Omni channel Payment Orchestration
A. Objective
Provide seamless multi-channel digital payment support.
B. Submodule 4.1 – Payment Gateway Integration
Supported Channels:
• Credit/Debit Card
• FPX
• DuitNow QR
• Apple Pay
• Samsung Pay
• Touch ‘n Go
• GrabPay
• Future extensibility
Private & Confidential Page 23 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Functions:
• Hosted secure checkout
• Webhook-based confirmation
• Automatic reconciliation tagging
• Fraud detection rule engine
C. Submodule 4.2 – Transaction Integrity Layer
Functions:
• TLS 1.3 encryption
• PCI-compliant gateway integration
• Fraud rule screening
• Tamper-proof audit logging
• Real-time transaction validation
2.4.5. MODULE 5: Dashboard & Profile Management
A. Objective
Provide real-time monitoring and self-service control to users and
administrators.
B. Submodule 5.1 – User Dashboard
Functions:
• Total zakat paid (monthly/yearly)
• Category breakdown
• Nisab alerts
• Salary deduction status
• Statement access
• Transaction tracking
C. Submodule 5.2 – Admin Configurable Dashboard
Functions:
• Widget show/hide configuration
• KPI formula configuration
• Layout versioning
• Announcement banners
• Dashboard version control
2.4.6. MODULE 6: Notification Management
A. Objective
Private & Confidential Page 24 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Provide omnichannel communication with centralized management
control.
B. Submodule 6.1 – Notification Engine
Channels:
• In-app
• Email
• SMS
• WhatsApp Business API
Functions:
• Template management
• Multi-language support
• Trigger rule configuration
• Retry & fallback logic
• Throttling control
• Delivery logs & dashboard
2.4.7. MODULE 7: Salary Deduction & SAP Integration
A. Objective
To enable structured, recurring zakat payments through salary deduction while
ensuring:
• Seamless financial posting into SAP
• Accurate reconciliation between deduction records and finance ledger
• Employer-level governance & approval control
• Full audit traceability and compliance
• Prevention of duplicate posting and financial leakage
This module connects payer commitment (salary deduction plan) directly with
LZS financial accounting infrastructure.
B. Submodule 7.1 – Deduction Plan Management
Functions:
1. Deduction Plan Setup
Allows payer to configure:
• Deduction amount (fixed or percentage-based,
configurable)
• Frequency (Monthly / Quarterly / Custom policy-based)
• Start date
• End date (optional)
Private & Confidential Page 25 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Zakat category allocation (Income / Business / Others)
• Employer selection (mandatory where required)
• Consent & declaration confirmation
System Validations:
• Minimum eligible deduction amount
• Alignment with zakat calculation recommendation
• Duplicate plan prevention
• Overlapping plan detection
• Eligibility check (employment status if integrated)
Output:
• Unique Deduction Plan ID
• Linked payer reference
• Pending approval status (if workflow enabled)
2. Pause / Resume / Cancel Plan
Users may:
• Pause temporarily
• Resume paused plan
• Request cancellation
• Modify amount (treated as new version under audit log)
Control Logic:
• Changes require MFA verification
• Employer approval required (if configured)
• Finance notification triggered
• Change effective next payroll cycle
• Locked once payroll file submitted
Audit Controls:
• Timestamp of modification
• Actor (User / Admin / Employer)
• Previous vs New configuration
• Mandatory reason for cancellation
3. Employer Workflow Approval
For payroll-integrated deductions:
Workflow Flow:
Private & Confidential Page 26 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
1. Employee submits deduction request
2. Employer receives notification
3. Employer reviews deduction request
4. Approve / Reject
5. System updates status
Governance Features:
• Multi-level employer approval (optional)
• Approval SLA tracking
• Automated reminder to employer
• Rejection reason capture
• Escalation rule (if employer inactive)
Status Lifecycle:
Draft → Pending Employer → Approved → Active → Paused →
Terminated
4. Deduction Execution Monitoring
System monitors:
• Scheduled payroll cycles
• Deduction submission file
• API response from payroll provider
• Deduction success/failure
Failure Handling:
• Mark deduction as failed
• Notify payer
• Allow retry or fallback payment option
• Escalate to employer/finance if repeated failures
5. Full Deduction Audit Trail
Every event logged:
• Plan creation
• Approval
• Modification
• Payroll submission
• Deduction confirmation
• Failure / retry
• Cancellation
Private & Confidential Page 27 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Audit attributes include:
• Actor ID
• Timestamp
• IP/device
• Action type
• Before/after state
• Linked SAP document reference (if posted)
This ensures full compliance and traceability.
C. Submodule 7.2 – SAP Financial Integration
Functions:
1. GL Posting Integration
When deduction confirmed:
System automatically:
• Generate financial posting payload
• Validate Company Code (e.g., KTPN)
• Validate G/L mapping (e.g., 2210442 or category-based
GL)
• Apply Posting Key:
• 40 (Debit – Bank / Clearing)
• 50 (Credit – Zakat Revenue)
• Attach Profit Center & Segment
• Attach Assignment Reference = Deduction Reference ID
Posting Methods Supported:
• Real-time API integration
• Secure file-based integration (SFTP batch)
• Middleware integration
ACID compliance enforced before marking deduction as
“Posted”.
2. Reconciliation Status Mapping
Each deduction transaction tracks:
Private & Confidential Page 28 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• SAP Posting Status:
• Pending
• Posted
• Failed
• Reversed
• Clearing Status:
• Cleared
• Uncleared
• Partial
System maintains:
• SAP Document Number reference
• Posting date
• Batch reference
• Clearing date
Automatic reconciliation ensures:
Deduction Record = SAP Ledger Record
3. SAP Document Reference Linking
For every posted deduction:
System stores:
• SAP Document Number
• Fiscal Year
• Company Code
• Clearing Document (if applicable)
Prevents:
• Z1 Double posting
• Duplicate batch submission
• Cross-year posting inconsistency
Allows full drill-down from portal → SAP document trace.
4. Failure Detection & Retry Logic
If SAP posting fails:
Private & Confidential Page 29 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
System will:
• Log error code
• Classify failure (Configuration / Network / Data / SAP
reject)
• Prevent duplicate re-post
• Trigger retry queue (configurable attempts)
• Notify finance dashboard
Retry Rules:
• Max retry attempts configurable
• Manual override allowed (Supervisor / Finance only)
• Retry after root cause correction
5. Duplicate Prevention Logic
System enforces:
• Transaction hash validation
• Deduction Plan ID uniqueness
• SAP Document existence check
• Posting flag mechanism
Prevents:
• Double posting
• Partial posting
• Cross-cycle duplication
6. Cross-Year & Fiscal Handling
Supports:
• Fiscal year validation
• Cross-year deduction handling
• Backdated correction (Supervisor approval required)
• Proper journal entry type assignment (Z1 / ZR)
Ensures compliance with SAP accounting policies.
2.4.8. MODULE 8: Statement & Reporting
A. Objective
Provide compliant financial reporting.
B. Submodule 8.1 – Statement Generation
Functions:
1. Monthly Statement Generation
Generates a structured summary of all zakat transactions within a
selected month.
Private & Confidential Page 30 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Content includes:
• Payer Name / Company Name
• Identification number (NRIC masked / SSM)
• Statement period
• Breakdown by zakat category (Income, Business, etc.)
• Transaction reference number
• Payment channel
• Amount paid
• Transaction status
• Refund adjustment (if applicable)
System Capabilities:
• Dynamic filtering by month/year
• Category breakdown aggregation
• Inclusion/exclusion of refunded or failed transactions
• Download in PDF format
• Viewable in dashboard
• Auto archival in system
Use Case:
Allows users to track short-term payment performance and
supports financial monitoring.
2. Annual Tax-Compliant Statement
Generates official annual zakat statement compliant with LZS and LHDN
reporting standards.
Content includes:
• Full payer details
• Official LZS header and formatting
• Statement year
• Total zakat paid for the year
• Category-level breakdown
• Receipt references
• Digital verification QR
• Unique statement reference ID
• System-generated timestamp
Compliance Features:
• Tax receipt mapping logic
• Configurable tax label (if required by LHDN updates)
Private & Confidential Page 31 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Version-controlled template (e.g., 2026 format vs 2027 format)
• Locked historical statement (non-editable once generated)
Use Case:
Used for income tax rebate claims and formal financial
documentation.
3. PDF Export Engine
Automated PDF generation using secured document rendering service.
Features:
• Tamper-resistant PDF generation
• Embedded QR verification code
• Watermark (Official / Certified Copy)
• Timestamp stamping
• Unique document ID
• Secure hash generation for integrity verification
• Download protection (optional setting)
Security Controls:
• Document checksum validation
• Digital signature capability (optional enhancement)
• Access control based on user role
• Expiry-based download links (optional)
This ensures document authenticity and legal reliability.
4. Auto-Email Dispatch
System automatically sends statements upon:
• Monthly auto-generation
• Annual generation cycle
• On-demand user request
• Admin-triggered reissue
Features:
• Secure email template management
• Multi-language template support (if required)
• Attachment encryption (optional)
• Delivery tracking status
• Retry logic if failed
• Bounce detection
Audit Logging:
Private & Confidential Page 32 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Email dispatch timestamp
• Delivery success/failure
• Recipient address
• Trigger source (system/user/admin)
This ensures transparent and traceable communication.
2.5. Risk
The Self-Service & Guest Payment System introduces digital convenience and
automation across zakat calculation, payment, reporting, and SAP financial
integration. However, the system must manage multiple operational, financial,
compliance, and cybersecurity risks.
Below is the structured risk analysis:
1. Guest Payment Fraud or Bot Attack
Risk Description
Unauthorized automated bots or malicious actors may attempt:
• High-volume fake payment attempts
• Brute-force attacks
• System abuse via guest payment mode
• Fraudulent payment testing using stolen cards
Potential Impact
• Payment gateway chargeback risk
• System performance degradation
• Financial and reputational damage
• Increased fraud investigation overhead
Mitigation Controls
• reCAPTCHA v3 integration
• Rate limiting per IP/device
• Bot detection & anomaly scoring
• Device fingerprinting (optional)
• Payment gateway fraud engine (3D Secure, velocity rules)
• Maximum attempt threshold enforcement
• Blacklist & risk profiling engine
2. Duplicate Payment Attempt
Risk Description
Private & Confidential Page 33 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
A payer may:
• Click multiple times during slow response
• Retry payment while webhook pending
• Submit identical payment via multiple channels
Potential Impact
• Double payment
• Duplicate receipt issuance
• Reconciliation mismatch
• Refund processing complexity
Mitigation Controls
• Unique transaction reference enforcement
• Idempotency key per payment session
• Transaction hash validation
• Webhook verification before marking success
• Duplicate detection logic before receipt issuance
• Auto-flag duplicate for review
3. Incorrect Zakat Formula Configuration
Risk Description
Misconfiguration in:
• Zakat rate
• Nisab threshold
• Deduction rules
• Formula versioning
Potential Impact
• Underpayment or overpayment
• Shariah compliance breach
• Legal & reputational risk
• Incorrect financial reporting
Mitigation Controls
• Version-controlled formula repository
• Admin test sandbox (simulation mode)
• Dual approval for formula publishing
• Effective date enforcement
Private & Confidential Page 34 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Full calculation audit log
• Read-only archive of historical formula versions
4. Gold Price API Failure
Risk Description
External gold/silver price API may:
• Fail to respond
• Return incorrect data
• Experience service outage
• Provide delayed updates
Potential Impact
• Incorrect Nisab calculation
• Inaccurate zakat recommendation
• User confusion
Mitigation Controls
• Scheduled fallback to last valid rate
• Multi-provider API redundancy (optional)
• Manual admin override with audit trail
• Price anomaly detection rule
• Rate validation threshold check
5. SAP Integration Failure
Risk Description
Failure during:
• GL posting
• Document creation
• Clearing process
• API connectivity
Potential Impact
• Missing financial entries
• Reconciliation mismatch
• Reporting inaccuracy
• Audit exposure
Mitigation Controls
Private & Confidential Page 35 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• ACID-compliant transaction control
• Retry queue with failure classification
• Posting flag mechanism
• SAP document reference validation
• Failure alert dashboard
• Daily reconciliation report
6. Payment Webhook Manipulation
Risk Description
Attackers may:
• Spoof webhook responses
• Replay old webhook payloads
• Attempt unauthorized payment confirmation
Potential Impact
• Fake transaction success
• Fraudulent receipt issuance
• Financial misstatement
Mitigation Controls
• Webhook signature validation (HMAC)
• Timestamp validation
• Anti-replay token mechanism
• IP whitelisting
• Payload integrity verification
• Server-to-server verification with gateway
7. Salary Deduction Mismatch
Risk Description
Mismatch may occur between:
• Payroll deduction amount
• SAP posted amount
• Deduction plan configuration
• Employer file submission
Potential Impact
• Financial imbalance
• Employee dispute
• Reconciliation delay
• Audit exposure
Private & Confidential Page 36 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Mitigation Controls
• Deduction plan validation
• Payroll confirmation reconciliation
• SAP posting status tracking
• Employer approval workflow
• Automated discrepancy detection
• Monthly deduction reconciliation report
8. Data Privacy Breach
Risk Description
Sensitive data exposure:
• NRIC / Passport
• Salary deduction details
• Financial transaction history
• Corporate SSM records
Potential Impact
• PDPA violation
• Legal liability
• Reputational damage
• Regulatory penalties
Mitigation Controls
• AES-256 encryption at rest
• TLS 1.3 encryption in transit
• Data masking in UI
• Role-based access control
• Limited guest data retention policy
• Access log monitoring
• Security audit review
9. Fraudulent Tax Statement Misuse
Risk Description
Manipulation or misuse of:
• PDF tax statement
• Receipt duplication
• Forged receipt submission
Potential Impact
Private & Confidential Page 37 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Tax fraud
• LHDN compliance risk
• Reputation risk
Mitigation Controls
• QR-coded receipt verification
• Unique receipt reference ID
• Statement digital signature
• Backend receipt validation endpoint
• Controlled statement generation access
• Full statement issuance log
10. Dashboard KPI Misconfiguration
Risk Description
Incorrect KPI calculation such as:
• Total paid excluding refunds
• Misclassified zakat type
• Wrong period filter
• Misaligned formula logic
Potential Impact
• Incorrect executive reporting
• Poor strategic decision-making
• Governance risk
Mitigation Controls
• Admin-configurable KPI rules with versioning
• Preview/test before publish
• Version rollback capability
• Approval workflow for KPI changes
• Audit logging of configuration changes
• Data reconciliation validation against finance ledger
Risk Classification Summary
Risk Type Category
Fraud Guest payment, webhook manipulation
Financial Duplicate payment, SAP failure, deduction mismatch
Private & Confidential Page 38 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Compliance Zakat formula misconfiguration, tax statement misuse
Operational API failure, reconciliation delay
Governance Dashboard misconfiguration
Cybersecurity Data breach, bot attack
Overall Risk Posture
The system is designed with:
• Preventive controls (RBAC, validation, duplicate detection)
• Detective controls (monitoring dashboard, anomaly detection, alerts)
• Corrective controls (retry logic, reversal workflow, reconciliation engine)
• Governance controls (approval hierarchy, audit trail, versioning)
This layered risk model ensures:
• Operational resilience
• Financial integrity
• Shariah compliance
• Audit readiness
• Cybersecurity alignment
2.6. Security
The Self-Service & Guest Payment System is designed with layered security controls to
ensure data protection, transaction integrity, regulatory compliance, and financial
governance. The security framework aligns with cybersecurity best practices, PDPA
requirements, and enterprise financial standards.
2.6.1. Identity & Access Management (IAM) with MFA Enforcement
The system enforces structured identity governance through:
• Role-Based Access Control (RBAC)
• Multi-Factor Authentication (OTP / Authenticator App)
• Mandatory MFA for high-risk actions (profile change, statement export,
deduction setup)
Private & Confidential Page 39 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Risk-based authentication triggers (new device, abnormal IP, failed
attempts)
• Session timeout and login monitoring
This ensures controlled system access and prevents unauthorized account
usage.
2.6.2. reCAPTCHA & Bot Protection
To prevent automated abuse and fraudulent activity:
• reCAPTCHA v3 integration for registration and guest payment
• Bot detection and anomaly scoring
• Rate limiting per IP/device
• Account lockout after repeated failed attempts
This protects the system from bot attacks and credential stuffing attempts.
2.6.3. TLS 1.3 Encrypted Communication
All communication between client, application server, and external services is
encrypted using:
• TLS 1.3 secure protocol
• Secure HTTPS endpoints
• Certificate validation and renewal management
This ensures confidentiality and data integrity in transit.
2.6.4. PCI-DSS Compliant Payment Gateway
Payment processing adheres to PCI-DSS standards via:
• Hosted secure payment pages
• Tokenized transaction handling
• 3D Secure authentication
• No sensitive card data stored in application servers
This ensures safe and compliant digital payment processing.
2.6.5. Argon2 / bcrypt Password Hashing
User credentials are protected through:
Private & Confidential Page 40 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Strong password complexity policy
• Argon2 or bcrypt hashing algorithm
• Salted hash storage
• No plain-text password storage
This prevents credential compromise in case of database exposure.
2.6.6. AES-256 Encryption at Rest
Sensitive data stored in the database is encrypted using:
• AES-256 encryption standard
• Key management policy
• Field-level encryption for NRIC, Passport, and sensitive identifiers
This protects confidential information from unauthorized database access.
2.6.7. Webhook HMAC Validation
Payment confirmation callbacks are protected through:
• HMAC signature verification
• Timestamp validation
• Anti-replay protection
• IP whitelisting (if supported by gateway)
This prevents spoofed or manipulated payment confirmations.
2.6.8. Transaction ID Uniqueness Enforcement
Every payment and deduction transaction is assigned a unique reference ID.
Controls include:
• Idempotency key validation
• Duplicate transaction blocking
• Transaction hash comparison
• SAP document cross-verification
This prevents duplicate posting and financial inconsistencies.
2.6.9. Duplicate Detection Logic
System enforces multi-layer duplicate prevention:
• Session-level duplicate protection
• Payment-level idempotency control
Private & Confidential Page 41 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• SAP posting flag validation
• Deduction plan uniqueness check
Ensures zero double financial impact.
2.6.10. Rate Limiting & IP Throttling
To mitigate brute force and abuse attempts:
• Request throttling per IP
• Maximum login attempt threshold
• Maximum payment attempt threshold
• Blacklist/temporary block capability
Reduces exposure to automated attacks.
2.6.11. Full Audit Trail Logging
All critical actions are recorded with:
• User ID
• Timestamp
• IP address
• Action type
• Before/after values
• Linked transaction reference
Audit logs are immutable and support:
• Internal review
• Finance reconciliation
• Compliance audit
• Fraud investigation
2.6.12. Data Masking for NRIC / Passport
Sensitive personal data displayed in UI is masked:
• Partial NRIC masking (e.g., ****--1234)
• Controlled access for full view (role-restricted)
• Limited retention policy for guest mode
Supports PDPA compliance and privacy protection.
Private & Confidential Page 42 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
2.6.13. Admin-Configurable Risk-Based MFA
The system allows configuration of MFA enforcement rules such as:
• Mandatory MFA for full-profile access
• MFA trigger for unusual login behavior
• MFA required for statement export
• MFA required for salary deduction modification
Provides dynamic risk-based security control.
2.6.14. Segregation of Admin Configuration vs Finance Control
The system enforces separation of duties:
• Admin configures system rules & templates
• Finance approves financial adjustments
• No self-approval allowed
• Posting and approval roles are separated
This prevents internal misuse and strengthens governance.
2.6.15. Compliance Alignment
The security framework aligns with:
• PDPA (Personal Data Protection Act)
• PCI-DSS payment standards
• Cybersecurity best practices
• Financial audit requirements
• Shariah governance integrity
2.6.16. Security Posture Summary
The Self-Service & Guest Payment System implements:
Preventive Controls (MFA, encryption, bot protection)
Detective Controls (audit logs, anomaly detection)
Corrective Controls (retry logic, transaction validation)
Governance Controls (RBAC, segregation of duties)
This layered architecture ensures the system is secure, compliant, fraud-
resistant, and audit-ready at enterprise scale.
Private & Confidential Page 43 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
2.7. Summary
The Self-Service & Guest Payment System provides a comprehensive, secure, and
configurable digital zakat platform that combines:
• Secure identity management
• Official LZS-compliant zakat calculation
• Automated nisab & gold price integration
• Omni channel payment orchestration
• Guest payment convenience with governance control
• SAP-integrated salary deduction workflow
• Real-time dashboard visibility
• Multi-channel notification management
• Audit-ready reporting & statement generation
The architecture ensures convenience for payers, control for LZS, financial integrity for
SAP integration, and compliance with Shariah, PDPA, and cybersecurity standards.
It is designed for scalability, configurability, and long-term governance readiness.
Private & Confidential Page 44 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
3. Function For Agent
3.1.Overview
The New Kutipan System (NKS) is designed to modernize, integrate, and automate the
full lifecycle of zakat collection operations for Lembaga Zakat Selangor (LZS).
The system covers:
• Agent onboarding and lifecycle management
• Security vetting and compliance
• Payment processing and virtual account management
• Receipt automation
• Refund and replacement governance
• Wakalah and agihan monitoring
• Commission management
• Reconciliation and reporting
• Employer tagging and exclusive rights logic
• Daily closing and operational controls
The proposed solution aims to provide:
Private & Confidential Page 45 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• A secure and scalable enterprise-grade platform
• End-to-end automation of collection governance
• Financial accuracy and reconciliation integrity
• Real-time operational visibility
• Strong compliance control
• Seamless integration with external systems
3.2. Solution Component
3.2.1. Application Layer
A. Web-Based Centralized System
A centralized web application accessible via secure internet connection,
enabling all stakeholders (agents, administrators, finance officers, and
management) to operate within a single integrated platform. The system
ensures real-time data synchronization, centralized monitoring, and
unified governance across all kutipan processes.
B. Agent Portal
A dedicated portal for registered agents to manage their operational
activities, including registration updates, transaction submissions,
refund requests, wakalah reporting, appointment bookings, daily closing,
and commission tracking. The portal provides real-time status visibility
and automated notifications.
C. Admin Portal
A management interface for LZS officers to perform verification, approval
workflows, monitoring, configuration, and governance control. This portal
supports screening review, tagging approvals, refund approvals,
commission configuration, and reporting oversight.
D. Finance Portal
A specialized interface for finance personnel to manage virtual accounts,
reconciliation processes, refund processing, commission validation, and
financial reporting. The portal supports transaction matching, exception
handling, and financial audit tracking.
E. Role-Based Access Control (RBAC)
A structured access control mechanism that ensures users can only
access functions and data according to their assigned roles. This
Private & Confidential Page 46 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
enhances system security, protects sensitive financial information, and
enforces operational governance.
3.2.2. Workflow Engine
The Workflow Engine is a configurable approval management component that
controls and automates all multi-tier approval processes within the New Kutipan
System (NKS). It ensures proper governance, accountability, and compliance in
all critical operations.
Key Capabilities
A. Configurable Multi-Tier Approval Workflow
The system supports flexible approval routing based on predefined roles
and authority levels. Approval layers can be configured according to LZS
organizational structure and policy requirements.
B. Support for Critical Approval Processes
The Workflow Engine manages approval processes for:
• Registration approval
• Refund approval
• Receipt replacement approval
• Wakalah approval
• Employer tagging approval
Each process follows a defined sequence of review, recommendation,
and final approval.
C. Audit Trail Logging
• User ID
• Timestamp
• Decision status
• Remarks/comments
• Escalation history
This ensures full transparency, traceability, and compliance with
financial governance requirements.
Private & Confidential Page 47 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
3.2.3. Dynamic Form Engine
The Dynamic Form Engine enables intelligent and flexible form management
within the New Kutipan System (NKS). It ensures that data collection is
structured, compliant, and aligned with LZS operational requirements.
Key Capabilities
A. Category-Based Registration Forms
The system dynamically generates registration forms based on the
selected agent category (e.g., PA IPIS, PA IPT, Consulting Agent). Each
category displays only the relevant fields and document requirements.
B. Conditional Field Logic
Form fields can appear, hide, or become mandatory based on user
input. This ensures accurate data capture while reducing unnecessary
form complexity.
C. Mandatory Document Control
The system enforces document submission requirements according to
agent type or process stage. Users cannot proceed without completing
all required uploads, ensuring compliance and completeness.
D. Partial Renewal Update Capability
During renewal processes, agents are only required to update fields that
have changed. This improves user experience while maintaining
accurate and updated records.
3.2.4. Payment & Financial Integration Layer
The Payment & Financial Integration Layer ensures secure, automated, and
real-time financial processing within the New Kutipan System (NKS). This
component connects the system with external financial platforms and
manages transaction synchronization, validation, and receipt issuance.
Key Capabilities
A. BillPlz Payment Gateway Integration
The system integrates directly with the BillPlz payment gateway to
process online zakat payments securely. Payment transactions are
automatically recorded and linked to the corresponding agent or payer.
Private & Confidential Page 48 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
B. Virtual Account (VA) Integration
The system supports Virtual Account integration to facilitate bank
transfers and structured payment identification. Each agent or
transaction can be mapped to a designated virtual account for accurate
reconciliation.
C. Auto-Synchronization of Payment Status
Payment statuses are automatically updated within the system without
manual intervention. This reduces reconciliation errors and ensures
real-time transaction visibility.
D. Webhook Listener for Real-Time Updates
A secure webhook listener mechanism captures payment notifications
directly from the payment gateway or banking system. This enables
immediate transaction confirmation and status updates.
E. Automatic Receipt Issuance
Upon successful payment confirmation, the system automatically
generates and issues an official receipt via email and/or WhatsApp,
ensuring timely acknowledgment to the payer.
3.2.5. Screening & Compliance Integration
The Screening & Compliance Integration component ensures that all agents
and related entities comply with regulatory and internal governance
requirements before approval or activation.
Key Capabilities
A. eSTK Screening
Integration with the eSTK system to perform security background checks
on applicants to ensure compliance with safety and governance
requirements.
B. CTOS Integration
Credit screening integration to assess financial credibility and risk
exposure of individuals or entities during the registration or vetting
process.
C. Insolvency (MDI) Integration
Private & Confidential Page 49 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Integration with the Insolvency system to verify bankruptcy status and
prevent ineligible individuals from being appointed.
D. PERISAI Integration (If Applicable)
Optional integration with PERISAI for additional verification or
centralized compliance validation, subject to LZS requirements.
This component ensures transparency, reduces compliance risk, and
strengthens governance integrity.
3.2.6. Document & Certificate Engine
The Document & Certificate Engine automates the generation and management
of official documents required throughout the agent lifecycle.
Key Capabilities
A. Offer Letter Generation
Automatic generation of official appointment offer letters with
configurable templates and reference numbering.
B. Digital Appointment Certificate
Generation of downloadable digital appointment certificates accessible
through the agent portal.
C. Digital Tauliah Card
Issuance of digital Tauliah Cards (e-Card format) for authorized agents,
ensuring portability and ease of verification.
D. Replacement Receipt Generation
Automated generation of replacement receipts following approved
requests, ensuring consistency with official LZS receipt formats.
Private & Confidential Page 50 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
3.2.7. Commission & Wakalah Engine
The Commission & Wakalah Engine manages commission calculation and
wakalah distribution logic in accordance with LZS policies.
Key Capabilities
A. Dynamic Commission Rate Configuration
Allows administrators to configure different commission rates based on
agent category, transaction type, or special conditions.
B. Tier-Based Wakalah Logic
Supports structured wakalah distribution rules aligned with LZS policies,
including category-based allocation mechanisms.
C. 70% Expenditure Rule Logic
Automatically calculates and enforces the rule requiring a minimum 70%
expenditure before further claims or reimbursements are allowed.
D. 30% Balance Visualization
Displays remaining balance percentage (e.g., 30%) through visual
indicators to assist monitoring and compliance.
E. Commission Eligibility Logic
Ensures commission is calculated only for transactions that meet
defined criteria (e.g., completed, bank-in verified, and closed).
Private & Confidential Page 51 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
3.2.8. Reporting & Dashboard Layer
The Reporting & Dashboard Layer provides real-time operational visibility and
financial monitoring tools for agents and administrators.
Key Capabilities
A. Real-Time Dashboard
Displays up-to-date operational metrics including transaction
performance, collection summaries, and approval statuses.
B. Transaction Summary
Provides consolidated views of transaction volume, success rate,
pending status, and failures.
C. Claim & Agihan Reporting
Supports detailed reporting of claims and distribution (agihan), including
monthly breakdowns and drill-down capabilities.
D. Commission Reporting
Provides commission tracking reports with filtering, status indicators,
and downloadable statements.
E. Reconciliation Reporting
Supports transaction reconciliation status reporting and exception
tracking for finance oversight.
3.2.9. Notification Engine
The Notification Engine ensures timely communication and operational alerts
across all user roles within the system.
Key Capabilities
A. Email Automation
Automatic email notifications for approvals, payment confirmations,
reminders, and status updates.
B. WhatsApp Notification
Optional WhatsApp alerts for receipt issuance, payment confirmation,
and important system notifications.
C. Expiry Reminder Scheduler
Private & Confidential Page 52 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Automated reminder scheduling for renewal deadlines, certificate expiry,
and pending actions.
D. Pop-Up Alerts and Warnings
System-generated pop-up notifications to alert users of critical
conditions, such as incomplete submissions, one-time restrictions, or
compliance issues.
3.3. Functions of the system
3.3.1. Agent Life Cycle
The Agent Life Cycle module manages the complete journey of an agent, from
initial application to termination. It ensures structured onboarding, compliance
verification, controlled approval processes, and continuous monitoring
throughout the agent’s tenure.
Functional Scope
A. Pre-Registration
Provides initial onboarding information including guidelines, checklist,
and eligibility requirements before formal registration.
B. Category Selection
Allows applicants to select their agent category (e.g., PA IPIS, PA IPT,
Consulting Agent), which determines applicable requirements and
workflow.
C. Dynamic Form Registration
Automatically generates registration forms based on selected category,
ensuring relevant and accurate data capture.
D. Mandatory Declaration
Requires applicants to confirm agreement with terms and conditions
before submission.
E. Document Upload
Enforces mandatory supporting document submission according to
agent type and regulatory requirements.
F. Screening Integration
Private & Confidential Page 53 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Performs compliance checks via integrated screening systems (eSTK,
CTOS, Insolvency, etc.) prior to approval.
G. Multi-Tier Approval
Routes applications through configurable approval layers in accordance
with LZS governance structure.
H. Offer Letter Generation
Automatically generates official appointment offer letters upon approval.
I. Appointment Confirmation
Allows formal confirmation of appointment and activation process.
J. Portal Activation
Activates agent portal access upon successful appointment
confirmation.
K. Renewal Automation
Sends automated reminders and manages renewal processes before
expiry.
L. Termination Automation
Handles structured termination processes including status updates and
access restriction.
M. Auto Block Access
Automatically restricts system access for inactive, suspended, or non-
compliant agents.
N. Status Management
Provides real-time monitoring and management of agent status (Active,
Suspended, Terminated).
3.3.2. Collection and transaction
The Collection and Transaction module manages the full zakat payment
lifecycle, from transaction creation to receipt issuance and reconciliation. It
ensures accurate recording, secure payment processing, and automated
financial synchronization.
Functional Scope
A. Create Transaction
Private & Confidential Page 54 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Allows agents to create new zakat collection transactions by entering
payer details, zakat type, and payment information.
B. Channel Selection
Supports multiple payment channels (e.g., cash, online payment, bank
transfer, virtual account), based on predefined system configuration.
C. Disable Cash for Specific Categories
Automatically restricts the cash payment option for designated agent
categories to enforce compliance with LZS policies.
D. CSV Bulk Upload
Enables agents to upload payer data in bulk using CSV files to streamline
large-volume transaction entry.
E. Corporate Feedfile Processing
Supports automated processing of corporate payment feed files to
update contributor records without manual data entry.
F. Mandatory Payment Proof Upload
Requires upload of payment proof (e.g., bank slip, transfer confirmation)
for non-cash transactions before submission.
G. BillPlz Auto-Sync
Automatically synchronizes online payment status with the system
through payment gateway integration.
H. Virtual Account Auto-Match
Matches incoming bank transfers to the correct transaction using Virtual
Account reference numbers, ensuring accurate reconciliation.
I. Automatic Receipt Issuance (Email & WhatsApp)
Generates and sends official receipts automatically once payment is
successfully confirmed.
J. Print / Download Receipt
Allows users to print or download official receipts for record-keeping and
compliance purposes.
K. Anonymous “Hamba Allah” Handling
Supports recording of anonymous contributions while maintaining
minimum contact information for system tracking and reconciliation.
Private & Confidential Page 55 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
3.3.3. Refund & Replacement
The Refund & Replacement module manages refund requests and receipt
replacement processes in a controlled and compliant manner. It ensures proper
verification, approval governance, and financial accountability in accordance
with LZS policies.
Functional Scope
1. Refund Request (Normal & TBI)
Allows submission of refund requests for both standard transactions and TBI
(Unidentified Transaction) cases, with different validation rules applied
accordingly.
2. Reason Dropdown Logic
Provides a predefined list of refund reasons to standardize classification and
improve reporting accuracy.
3. Conditional Receipt Requirement
Applies logic to determine whether a receipt number is mandatory (e.g.,
required for normal refunds but optional for TBI cases).
4. Mandatory Supporting Document Upload
Requires submission of necessary supporting documents such as
identification, bank statement, and payment proof before the request can
proceed.
5. Multi-Tier Refund Approval
Routes refund requests through structured approval layers (e.g., executive
review, managerial review, final approval) to ensure proper governance.
6. Automatic Finance Notification
Notifies the Finance Department automatically once a refund is approved for
processing.
7. Receipt Replacement Request
Allows agents to submit formal requests for receipt replacement through a
controlled workflow.
8. One-Time-Only Restriction
Enforces a rule that receipt replacement can only be requested once to prevent
misuse.
Private & Confidential Page 56 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
9. Replacement Receipt Generation
Generates a new official replacement receipt upon approval, aligned with the
latest LZS receipt format standards.
3.3.4. Employer tagging
The Employer Tagging module manages the assignment and control of
employer accounts to specific agents. It ensures clear ownership, prevents
operational conflict, and protects commission entitlement rights.
Functional Scope
A. Tag Employer by SSM
Allows agents to tag an employer using the company’s SSM registration
number. This establishes an official linkage between the agent and the
employer within the system.
B. Unlock Request
Provides a controlled process for agents to request the release (unlock) of a
previously tagged employer. Unlock requests are subject to approval to
maintain governance and prevent disputes.
C. Exclusive Employer Logic
Enforces exclusive management rights for tagged employers. Once tagged and
approved, only the assigned agent may manage transactions or activities
related to that employer, unless formally unlocked.
D. Commission Entitlement Control
Ensures that commission is correctly attributed to the designated agent for
transactions processed under a tagged employer. The system prevents
commission misallocation and maintains financial accuracy.
3.3.5. Appointment and Verification
The Appointment and Verification module manages scheduling and
confirmation of zakat-related appointments for both individuals and corporate
entities. It ensures structured booking, availability control, and transparent
status monitoring.
Functional Scope
Private & Confidential Page 57 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
A. Individual Appointment Request
Allows agents to submit appointment requests on behalf of individual payers by
providing required details such as identification, contact information, zakat
type, and preferred appointment schedule.
B. Corporate Appointment Request
Supports appointment booking for corporate employers, including company
details, representative contact information, and zakat-related information.
C. Real-Time Status Tracking
Displays up-to-date status of appointment requests (e.g., New, In Process,
Approved, Rejected), enabling agents and officers to monitor progress
transparently.
D. Officer Availability Checking
Checks officer availability based on selected branch, date, and time to prevent
scheduling conflicts and ensure efficient resource allocation.
E. Search & Filtering
Provides search and filtering functionality to allow users to locate appointment
records based on date, applicant name, employer name, or status.
3.3.6. Daily closing
The Daily Closing module ensures operational discipline and financial
reconciliation at the end of each working cycle. It enforces compliance with LZS
policies by controlling transaction finalization and bank matching processes.
Functional Scope
A. Mandatory Closing Within 2 Working Days
Requires agents to complete daily closing within two (2) working days. This
ensures timely reconciliation and prevents prolonged outstanding
transactions.
B. Automatic Reminder
Sends automated notifications to agents who have not completed their closing
within the required timeframe.
Private & Confidential Page 58 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
C. Automatic Transaction Block for Non-Compliance
Restricts new transaction creation if daily closing is not completed within the
specified period, ensuring operational compliance.
D. Auto-Match TT/Cheque
Automatically matches Telegraphic Transfer (TT) and cheque payments against
recorded transactions for accurate bank reconciliation.
E. 30-Day Auto Cancellation Logic
Automatically cancels transactions if payment is not received or matched
within 30 days, reducing long-standing pending records.
6. KIV (Keep In View) Receipt Management
Places unclear or unmatched receipts under KIV status for further
investigation, preventing incorrect commission calculation or financial
reporting.
3.3.7. Wakallah and Agihan
The Wakalah and Agihan module manages the eligibility, application,
distribution, and reporting of wakalah funds in accordance with LZS policies. It
ensures structured fund utilization, spending compliance, and transparent
reporting.
Functional Scope
A. Wakalah Eligibility Detection
Automatically identifies contributors or employers who qualify for wakalah
based on predefined criteria (e.g., contribution threshold).
B. Wakalah Application
Allows eligible agents to submit wakalah applications for approval through a
structured workflow process.
C. Wakalah Distribution Logic
Implements rule-based distribution logic aligned with LZS wakalah structure,
ensuring correct allocation and tracking of funds.
D. Agihan Report Upload
Enables agents to upload distribution (agihan) reports for verification and
compliance monitoring by LZS.
Private & Confidential Page 59 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
E. Excel Recipient Upload
Supports bulk upload of recipient details via Excel format to simplify data
submission for large distributions.
F. 70% Spending Enforcement
Automatically enforces the policy requiring a minimum 70% utilization before
additional claims or reimbursements are permitted.
G. Year-End Locking
Restricts submission of new claims or reports until year-end balances and
confirmations are completed, ensuring financial closure integrity.
8. 30% Balance Visualization
Displays remaining wakalah balance (e.g., 30%) through visual indicators to
support monitoring and compliance awareness.
9. Claim Dashboard
Provides a dashboard view summarizing claim status, balance, reimbursement
amounts, and expenditure tracking.
10. Drill-Down Reporting
Allows detailed breakdown analysis of wakalah transactions, claims, and
distribution records for audit and reporting purposes.
3.3.8. Commission
The Commission module manages the calculation, tracking, and monitoring of
agent commissions in a transparent and controlled manner. It ensures that
commissions are accurately computed based on validated transactions and
aligned with LZS policies.
Functional Scope
A. Commission Calculation (Completed Transactions Only)
Calculates commission only for transactions that meet defined completion
criteria (e.g., payment confirmed, bank-in verified, and daily closing
completed).
B. Dynamic Rate Configuration
Allows administrators to configure commission rates based on agent category,
transaction type, or specific policy rules without system redevelopment.
Private & Confidential Page 60 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
C. Commission Statement Download
Enables agents to download detailed commission statements for a selected
period, supporting transparency and record-keeping.
D. Payment Status Display
Displays the status of commission payments (e.g., Pending, Approved, Paid) to
provide clear visibility to agents.
E. Self-Reconciliation
Allows agents to review and verify their transaction records and calculated
commission amounts before final settlement.
F. Exception Management
Identifies discrepancies or irregularities in commission calculation and flags
them for review and correction.
G. Follow-Up Tracking
Provides tracking of outstanding commission issues, disputes, or adjustments
until resolution is completed.
3.3.9. Reconciliation
The Reconciliation module ensures financial accuracy and integrity by
validating transactions against payment records and identifying discrepancies
for corrective action. It supports both agent-level and finance-level monitoring.
Functional Scope
A. Self-Reconciliation
Allows agents to review and reconcile their recorded transactions against
payment confirmations and bank-in records to ensure accuracy before final
settlement.
B. Exception Management
Automatically identifies mismatched, incomplete, or irregular transactions and
categorizes them as exceptions for further investigation.
C. Follow-Up Tracking
Tracks the status of reconciliation issues until resolution, ensuring
Private & Confidential Page 61 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
accountability and preventing unresolved discrepancies from affecting
reporting or commission calculation.
3.4. Module
3.4.1. Module 1: Agent Management
The Agent Management module governs the complete lifecycle of agents, from
initial registration to termination. It ensures structured onboarding, compliance
verification, approval governance, and continuous monitoring in accordance
with LZS policies.
Scope of the Module
1. Registration
Manages the onboarding process including pre-registration, category selection,
dynamic form submission, mandatory declaration, and supporting document
upload. The system ensures all required information is completed before
submission.
2. Screening
Integrates with external compliance systems (e.g., eSTK, CTOS, Insolvency,
PERISAI where applicable) to conduct background and eligibility checks prior to
approval.
3. Approval
Implements a configurable multi-tier approval workflow aligned with LZS
governance structure. All actions are recorded with a full audit trail for
transparency and accountability.
4. Renewal
Automates renewal reminders and manages document updates prior to expiry.
The system supports partial updates to simplify the renewal process while
maintaining data accuracy.
5. Termination
Handles formal termination procedures including status updates, portal
access restriction, and related financial notifications (e.g., Virtual Account
deactivation).
Private & Confidential Page 62 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
This module ensures that only eligible, verified, and compliant agents are
authorized to operate within the New Kutipan System.
3.4.2.Module 2: Payment & Collection
The Payment & Collection module manages the full lifecycle of zakat
transactions, from transaction creation to payment confirmation and receipt
issuance. It ensures secure processing, accurate financial recording, and real-
time synchronization with external payment systems.
Scope of the Module
1. Transaction Creation
Allows agents to create zakat collection transactions by capturing payer
details, zakat type, payment channel, and supporting information. The system
enforces validation rules, including category-based restrictions (e.g., disabling
cash for specific agent types).
2. BillPlz Integration
Integrates directly with the BillPlz payment gateway to process online payments
securely. Payment status is automatically synchronized with the system
through real-time updates, reducing manual intervention and reconciliation
errors.
3. Receipt Automation
Automatically generates official receipts once payment is confirmed. Receipts
can be delivered via email and WhatsApp and are available for download or
printing. This ensures timely acknowledgment to payers and maintains
accurate financial documentation.
This module ensures efficient, transparent, and automated management of
zakat collections in compliance with LZS financial governance standards.
3.4.3.Module 3: Refund & Replacement
The Refund & Replacement module governs the processing of refund requests
and receipt replacement in a controlled and compliant manner. It ensures
proper validation, approval governance, and financial accountability in
accordance with LZS policies.
Scope of the Module
Private & Confidential Page 63 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
1. Refund Request
Allows agents or authorized users to submit refund applications for eligible
transactions. The system captures refund reasons, supporting documents, and
related transaction details before routing for approval.
2. TBI Logic (Unidentified Transactions)
Implements specific rules for TBI cases where transaction identification may be
incomplete. The system applies conditional validation (e.g., receipt number
optional for TBI but mandatory for normal refunds) to ensure appropriate
handling.
3. Replacement Control
Manages receipt replacement requests with strict controls, including one-time-
only restrictions and mandatory supporting documents, to prevent misuse or
duplication.
4. Approval Workflow
Routes refund and replacement requests through a structured multi-tier
approval process. All actions are logged with timestamps and remarks to
ensure transparency, traceability, and governance compliance.
This module safeguards financial integrity while providing a structured
mechanism for handling exceptional transaction cases.
3.4.4.Module 4: Wakalah & Agihan
The Wakalah & Agihan module manages the eligibility, allocation, utilization,
and reporting of wakalah funds in accordance with LZS policies. It ensures
structured fund distribution, spending compliance, and transparent
monitoring.
Scope of the Module
1. Wakalah Logic
Implements rule-based logic to determine wakalah eligibility and allocation
based on predefined criteria such as contribution thresholds and agent
Private & Confidential Page 64 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
category. The system ensures that wakalah calculations are aligned with
approved policy structures.
2. Distribution Monitoring
Tracks wakalah fund utilization through structured reporting and claim
submissions. Agents are required to submit agihan reports and supporting
documents, while administrators can monitor balance status, claim progress,
and reimbursement history.
3. 70% Rule Enforcement
Automatically enforces the minimum 70% utilization rule before additional
claims or reimbursements are allowed. The system calculates spending
percentages and provides visual indicators (e.g., remaining 30% balance) to
ensure compliance.
This module strengthens governance over wakalah distribution while ensuring
transparency, policy adherence, and financial accountability.
3.4.5. Module 5: Commission Engine
The Commission Engine module manages the calculation, validation, and
reporting of agent commissions in a structured and transparent manner. It
ensures commissions are computed accurately based on validated
transactions and aligned with LZS policies.
Scope of the Module
1. Dynamic Commission Calculation
Automatically calculates commission based on configurable rules, including
agent category, transaction type, and policy-defined rates. Commission is
calculated only for completed and verified transactions to ensure financial
accuracy.
2. Configurable Commission Rules
Allows administrators to configure and update commission rates without
system redevelopment, providing flexibility to adapt to policy changes.
3. Commission Reporting
Generates detailed commission reports with filtering capabilities by period,
Private & Confidential Page 65 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
agent, or transaction type. Agents can view and download commission
statements for transparency and record-keeping.
4. Commission Status Monitoring
Displays commission payment status (e.g., Pending, Approved, Paid) to provide
visibility and reduce disputes.
This module ensures fair, accurate, and policy-compliant commission
management while strengthening financial governance and transparency.
3.4.6. Module 6: Employer Tagging
The Employer Tagging module manages the assignment of employers to
specific agents, ensuring exclusive management rights and accurate
commission attribution. This module prevents operational conflicts and
protects agent ownership over employer accounts.
Scope of the Module
1. Exclusive Employer Management
Allows agents to tag employers using verified identifiers (e.g., SSM number),
establishing formal linkage within the system. Once approved, only the
assigned agent may manage transactions and activities related to the tagged
employer.
2. Tag Approval & Unlock Control
Tagging requests are subject to administrative approval to ensure governance
compliance. The system also provides a structured unlock request process to
release employer assignment when necessary.
3. Commission Implication Control
Ensures that commission generated from transactions under a tagged
employer is attributed to the correct agent. The system prevents commission
duplication or misallocation.
4. Conflict Prevention Mechanism
Prevents multiple agents from simultaneously claiming ownership of the same
employer, maintaining operational clarity and accountability.
This module strengthens governance, protects agent rights, and ensures
accurate financial and commission management within the New Kutipan
System.
Private & Confidential Page 66 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
3.4.7. Module 7: Appointment & Verification
The Appointment & Verification module manages the scheduling, coordination,
and tracking of zakat-related appointments for both individual and corporate
payers. It ensures structured booking, officer availability control, and
transparent status monitoring.
Scope of the Module
1. Booking System
Allows agents to submit appointment requests by providing relevant details
such as payer information, zakat type, preferred branch, date, and time. The
system supports both individual and corporate appointment requests.
2. Availability Check
Automatically checks officer and branch availability before confirming booking
slots. This prevents scheduling conflicts and ensures efficient allocation of LZS
resources.
3. Appointment Verification
Routes appointment requests through review and confirmation processes
where necessary, ensuring proper coordination between agents and LZS
officers.
4. Status Tracking
Provides real-time tracking of appointment status (e.g., New, In Process,
Approved, Rejected, Completed), enabling transparent monitoring by both
agents and administrators.
5. Search & Monitoring Tools
Offers filtering and search functionality to retrieve appointment records based
on date, agent, employer, branch, or status.
This module enhances operational efficiency, reduces scheduling errors, and
improves service coordination between agents and LZS officers.
3.4.8. Module 8: Closing & Reconciliation
The Closing & Reconciliation module ensures financial accuracy, operational
discipline, and timely settlement of transactions. It enforces daily closing
Private & Confidential Page 67 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
requirements and validates payment records against system transactions to
maintain data integrity.
Scope of the Module
1. Daily Closing Enforcement
Requires agents to complete daily closing within the prescribed timeframe
(e.g., within two working days). The system sends automated reminders and
may restrict further transactions if closing is not completed.
2. Auto-Match Mechanism
Automatically matches recorded transactions against bank-in records,
including Virtual Account payments, telegraphic transfers (TT), and
cheques. This reduces manual reconciliation effort and minimizes errors.
3. Reconciliation Management
Provides tools for reviewing and verifying matched and unmatched
transactions. Exceptions are flagged for investigation and resolution before
final settlement or commission calculation.
4. Exception Tracking & Follow-Up
Tracks unresolved discrepancies and ensures they are properly monitored
until corrective action is completed.
This module strengthens financial governance, ensures timely reconciliation,
and minimizes discrepancies within the New Kutipan System.
3.4.9. Module 9: Reporting & Dashboard
The Reporting & Dashboard module provides real-time operational visibility and
comprehensive financial reporting to support informed decision-making. It
enables monitoring of performance, compliance, and financial status across all
system activities.
Scope of the Module
Private & Confidential Page 68 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
1. Operational Dashboard
Displays real-time key performance indicators (KPIs) such as total
collections, transaction volume, approval status, commission summary,
wakalah balance, and pending actions. The dashboard provides role-based
views tailored for agents, administrators, and finance officers.
2. Financial Reporting
Generates structured financial reports covering transaction summaries,
commission reports, refund records, wakalah utilization, and reconciliation
status. Reports can be filtered by date, agent, branch, employer, or
transaction type.
3. Drill-Down Analytics
Allows users to drill down from summary-level data into detailed
transaction records for analysis and audit purposes. This supports
transparency, traceability, and effective exception investigation.
4. Export & Download Capability
Supports report export in standard formats (e.g., Excel, PDF) for
submission, audit, and record-keeping.
This module enhances transparency, strengthens financial governance, and
provides LZS management with actionable insights to monitor and optimize
kutipan operations.
Private & Confidential Page 69 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
3.5. Risk
Risk Impact Mitigation
Webhook validation + reconciliation
Payment sync failure Financial discrepancy
module
VA mismatch Reconciliation error Auto-match engine + manual override
Validation engine + mandatory
Data entry errors Reporting inaccuracy
upload
Refund abuse Financial loss Multi-tier approval + audit trail
Commission miscalculation Financial dispute Rule-based commission engine
System downtime Operational disruption High-availability infrastructure
Integration API failure Screening delay Retry logic + fallback mechanism
3.6. Security
3.6.1. Data Security
• Encryption in transit (HTTPS/TLS)
• Encryption at rest (database encryption)
• Secure document storage
• Role-based access control (RBAC)
3.6.2. Financial Security
• Webhook signature validation
• Transaction integrity validation
• Audit trail on every financial action
• Commission calculation logging
3.6.3. Compliance Security
• Mandatory screening integration
• Full approval logging
• Timestamped decision tracking
• Non-repudiation via digital declaration
3.6.4. Operational Security
• Auto session timeout
Private & Confidential Page 70 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Account lock after multiple failed login
• IP logging
• Activity monitoring
3.6.5. Fraud Prevention
• One-time receipt replacement restriction
• Refund workflow with 4-tier approval
• Exclusive employer tag control
• 30-day receipt auto-cancel logic
3.7. Conclusion
The proposed New Kutipan System (NKS) delivers a comprehensive, enterprise-grade,
secure, and scalable solution that supports the complete zakat collection ecosystem
of LZS.
The solution:
• Automates end-to-end agent lifecycle
• Integrates payment and virtual account systems
• Enforces financial governance and compliance
• Strengthens monitoring and transparency
• Minimizes operational and fraud risks
• Supports wakalah and agihan management
• Ensures accurate commission and reconciliation
Private & Confidential Page 71 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
This system positions LZS with a future-ready digital infrastructure capable of
supporting operational growth, regulatory compliance, and financial integrity.
Private & Confidential Page 72 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
4. Function For Employee , SPG
4.1. Overview
The Employee (SPG) module manages zakat salary deduction (Skim Potongan Gaji –
SPG) for individual employees under employer registration. It provides a structured
workflow covering registration, salary deduction setup, employer approval, payment
monitoring, exception handling, and reporting.
This module supports seamless integration between Employee, Employer (e-Majikan),
and LZS administrative systems to ensure compliance with zakat calculation rules,
payment governance, and operational transparency.
Private & Confidential Page 73 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
4.2. Solution component
4.2.1. Web-based Centralized SPG System
A unified, cloud-ready platform that centralizes all SPG (Salary Deduction Scheme)
operations under one secure environment. It ensures real-time synchronization,
accessibility, and operational consistency across LZS, employers, and employees.
A. Employee (Individual) Portal
A self-service portal enabling employees to register, calculate zakat, manage
salary deductions, monitor payment status, and download receipts or
statements with full transparency.
B. Employer (e-Majikan) Portal
A dedicated portal for employers to verify employee applications, manage
contributor lists, process bulk uploads, monitor payments, and access
compliance reports.
C. Admin (LZS) Portal
An administrative control center for LZS officers to manage approvals, monitor
performance, enforce business rules, review exceptions, and generate
centralized reports.
D. Role-Based Access Control (RBAC)
A structured permission framework ensuring each user (Employee, Employer,
Admin, Finance) can only access authorized functions and data, maintaining
segregation of duties and data security.
Private & Confidential Page 74 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
4.2.2. Core Engines
A. Role-Based Access Control (RBAC)
Supports configurable, category-based digital forms with conditional logic,
mandatory controls, and validation to ensure complete and accurate data
capture.
B. Workflow & Approval Engine
A configurable multi-tier approval mechanism that automates verification,
employer validation, and LZS authorization with full audit trail logging.
C. Payment & Receipt Engine
Manages payment processing, proof upload validation, clearance monitoring,
and automated generation of temporary and official receipts
D. Validation & Business Rules Engine
Enforces LZS policies including deadline logic (10th of month), reminder cycles,
percentage alignment (Zakat + PCB = 100%), duplicate detection, and tally
verification.
Private & Confidential Page 75 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
E. Notification Engine
Automates email and system alerts for approvals, reminders, payment status,
rejection notices, and compliance triggers.
F. Reporting & Analytics Engine
Provides real-time dashboards, operational KPIs, contribution trends,
penetration analysis, compliance tracking, and exportable audit reports.
4.2.3. Integration Layer
A. EZO Integration
Enables seamless linkage between SPG registration and EZO account creation
for centralized user identity management.
B. FPX (eZakatPay) Integration
Secure integration with FPX gateway for real-time payment processing, bank
redirection, and automatic callback status updates.
C. Payroll System Integration
Allows connectivity with employer payroll systems for automated salary
deduction data synchronization and contribution management.
D. Wakalah System Integration
Integrates wakalah eligibility detection and application processes to ensure
alignment between SPG contributions and wakalah governance rules.
4.3. Function of the system
4.3.1. Employee Life Cycle (SPG)
The Employee Life Cycle (SPG) module governs the end-to-end journey of an individual
contributor under the Salary Deduction Scheme (SPG), from initial registration to
renewal or termination. It ensures compliance with LZS policies, employer validation,
and automated operational control.
Functional Scope
Private & Confidential Page 76 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
A. New Registration (Quick / Full Registration)
The system provides two registration modes:
• Quick Registration for minimal data entry (prospect-level submission).
• Full Registration for complete contributor onboarding with mandatory
information required for activation.
B. Existing Record Detection (IC/Passport Check)
Upon entering IC or Passport number, the system automatically checks for
existing records.
• If record exists → user may update or continue existing profile.
• If no record → new registration process continues.
C. Employer Selection & Mandatory Employer Email
Employees must select their employer from the system database. Employer
email is mandatory to enable notification and approval workflow.
D. Salary Deduction Setup
Users configure monthly zakat deduction amount or percentage. The system
ensures compliance with business rules such as percentage alignment with PCB
(where applicable).
E. AZB Calculator Integration
Integrated Kalkulator Zakat Bersepadu (AZB) ensures zakat calculation follows
official LZS formula. Suggested contribution values are automatically generated.
F. Mandatory Declaration
Employees must digitally declare agreement before submission. Submission is
blocked without acknowledgment.
G. Screening & Validation
The system performs automated validation including:
• Data completeness checks
• Format validation
Private & Confidential Page 77 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Duplicate record detection
• Business rule enforcement
H. Employer Approval Workflow
Registration is routed to employer (e-Majikan portal) for approval:
• ACCEPT → Employee activated in SPG list
• REJECT → Notification sent to employee
I. EZO Account Linkage
After successful registration, the system provides linkage or integration to EZO
account for centralized access and identity management.
J. Renewal & Update
Employees may update salary details, deduction amount, or employer
information when required. Annual review and adjustment are supported.
K. Termination / Stop Deduction
Employees may request to stop deduction. The system enforces reason
selection (dropdown) and triggers employer/admin review where required.
L. Alternative Suggestion (Direct Debit Option)
If employee selects “Stop Deduction”, the system may suggest alternative
payment channels such as Direct Debit to ensure continuity of zakat
contribution.
M. Status Management
Each employee record maintains clear lifecycle status:
• Pending Employer Approval
• Active
• Inactive
• Terminated
• Suspended
All status changes are logged with audit trail for governance and traceability.
Private & Confidential Page 78 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
4.4. Contribution & Deduction Management
The Contribution & Deduction Management module ensures accurate zakat
calculation, structured salary deduction control, and compliance with LZS payment
policies. It governs contribution logic, payment monitoring, and enforcement
mechanisms to maintain financial discipline.
Functional Scope :
4.4.1. Zakat & PCB Percentage Alignment (Total = 100%)
The system ensures that zakat deduction percentage and PCB (Potongan Cukai
Berjadual) collectively total 100% of the allocated deduction framework. Real-
time validation prevents submission if misalignment occurs.
4.4.2. Automatic Salary Increment Option
Employees may enable automatic adjustment of zakat deduction based on
annual salary increment. The system recalculates contribution proportionally
using the official calculation logic.
4.4.3. Annual Zakat Adjustment
Supports annual review and recalibration of zakat amount to reflect updated
income, ensuring continued compliance with zakat calculation standards.
4.4.4. Gap Payment Handling
Allows contributors to settle missed months (“Lompong” payments) by
combining previous unpaid months into a single current transaction.
4.4.5. Unsettled Bill Monitoring
Displays unpaid or pending deductions in a structured list, enabling employees
and employers to track outstanding contributions.
4.4.6. Payment Frequency Categorization
Supports structured payment modes:
• One-off (Lump Sum)
Private & Confidential Page 79 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Monthly Recurring (Salary Deduction / Direct Debit)
The system enforces logic according to the selected category.
4.4.7. Payment Reminder Automation
Automated reminders are triggered according to a fixed compliance schedule:
• 15th – First Reminder
• 20th – Second Reminder
• 28th – Third Reminder
• 11th (Following Month) – Final Notification
Notifications are delivered via email/system alerts.
4.4.8. Deadline Enforcement (10th of Every Month)
The system enforces the 10th of each month as the official contribution
deadline. Payments made after this date are categorized as arrears and flagged
accordingly.
4.4.9. Offline Mode Support (If Required)
Provides temporary offline capability for registration or data entry during
connectivity issues. Data is synchronized automatically once the connection is
restored.
4.5. Employer Verification & Approval
The Employer Verification & Approval module ensures that all SPG registrations are
validated by the respective employer before activation. It strengthens governance,
prevents unauthorized deductions, and maintains data accuracy.
Functional Scope
4.5.1. Pending Approval Notification to Employer
Upon employee submission, the system automatically sends a notification to
the selected employer for verification and action.
Private & Confidential Page 80 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
4.5.2. ACCEPT – Auto Update to Active Contributor List
If the employer approves the application, the employee record is automatically
updated to “Active Contributor” status and included in the payroll deduction list.
4.5.3. REJECT – Auto Notification to Employee
If rejected, the system sends an automated notification to the employee with
status update. The record will not be activated for deduction.
4.5.4. Manual Contributor Entry by Employer
Employers may manually add contributors by entering required employee
details. The system validates IC/Passport and prevents duplication.
4.5.5. Bulk Upload (IDD Compliant Format)
Supports bulk contributor upload using LZS-approved Integrated Data Dictionary
(IDD) template (Excel/CSV). Backend validation ensures format compliance
before processing.
4.5.6. Exception Report Generation
If errors are detected in bulk upload or data validation, the system generates an
exception report for employer correction.
4.5.7. Duplicate Cross-System Validation
Performs automated cross-check against existing records in related systems (e-
Majikan, SPG database, internal LZS systems) to prevent duplicate contributor
registration.
4.6. Payment & Receipt
The Payment & Receipt module manages contribution processing, payment validation,
and official receipt issuance in compliance with LZS financial governance.
Functional Scope
Private & Confidential Page 81 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
4.6.1. FPX Payment Integration
Integrates with FPX (eZakatPay) gateway, supporting bank redirection and
automated callback status (Success/Failed).
4.6.2. Manual Payment (Cheque/EFT/TT) Proof Upload
Allows employers to upload payment proof for non-FPX payments in supported
formats.
4.6.3. Mandatory Proof Validation (PDF/JPG Only)
System enforces file type validation and blocks submission if incorrect format is
uploaded.
4.6.4. Temporary Receipt Generation
A provisional receipt is generated immediately upon manual proof submission
as acknowledgment.
4.6.5. Official e-Receipt Issuance After Clearance
Official e-Receipt is generated and emailed only after payment clearance
confirmation by finance team.
4.6.6. e-Statement Generation
Employers may download official contribution statements for audit and internal
reporting.
4.6.7. SLA Monitoring (14 Working Days for Manual Clearance)
System monitors receipt issuance SLA to ensure manual payments are cleared
within 14 working days.
4.6.8. File Format Converter
Supports automated conversion of various payment file formats (TXT, CSV,
Excel) into standardized LZS format.
Private & Confidential Page 82 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
4.6.9. Payment History Search
Advanced search functionality based on IC, Passport, Employer, Year, or
Payment Status.
4.7. Wakalah Integration
The Wakalah Integration module ensures alignment between SPG contributions and
Wakalah eligibility rules under LZS governance.
Functional Scope
4.7.1. Wakalah Eligibility Detection (Annual Threshold Logic)
Automatically evaluates annual contribution thresholds to determine Wakalah
eligibility based on LZS criteria.
4.7.2. Employer Wakalah Integration
Allows employers to view eligibility status and initiate Wakalah application
where applicable.
4.7.3. Individual Wakalah Conflict Handling
Prevents overlapping Wakalah applications between individual and employer
records, ensuring governance consistency.
4.7.4. Wakalah Status Visibility
Displays real-time Wakalah application status (Eligible / Pending / Approved /
Rejected).
4.8. Reporting & Analytics (Employee SPG)
The Reporting & Analytics module provides real-time performance insights, compliance
tracking, and management-level visibility of SPG operations.
Functional Scope :
Private & Confidential Page 83 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
4.8.1. Dashboard KPIs
Displays key indicators including:
• Total Contributors
• Total Collection
• Monthly Contribution Trend
4.8.2. Movement Analysis
Tracks contributor movement:
• New Contributors
• Stopped Contributors
• Increased Contributions
• Reduced Contributions
4.8.3. Penetration Analysis
Calculates contribution penetration rate:
(% Muslim Employees vs Active SPG Contributors)
4.8.4. Potential Analysis
Compares actual SPG collection against estimated potential contribution.
4.8.5. Ageing Report (3+ Months Non-Payment)
Identifies employers or contributors with prolonged non-payment for
compliance action.
4.8.6. Exception & Compliance Reporting
Highlights validation failures, upload errors, deadline breaches, and
mismatched records.
4.8.7. Historical & Real-Time Data Views
Supports multiple data perspectives:
• Real-time current transactions
• Snapshot view (specific date)
Private & Confidential Page 84 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Historical trend analysis
4.8.8. CSV Export for Audit
Allows export of reports in CSV format for audit, regulatory review, or advanced
Excel analysis.
4.9. Module
4.9.1. Module 1: Employee Registration & Deduction Setup
The Employee Registration & Deduction Setup module manages the
onboarding and activation of individual contributors under the Salary
Deduction Scheme (SPG). It ensures proper data capture, employer validation,
zakat calculation compliance, and structured approval governance.
Scope of the Module :
1. Registration Management
Provides Quick and Full Registration options for employees to submit
personal details, employer information, and contribution preferences.
The system performs IC/Passport detection to prevent duplicate
records.
2. Employer Linking
Requires employees to select their employer from the system
database. The employer email is mandatory to trigger the approval
workflow. The system ensures that only verified employers can process
SPG applications.
3. Zakat Calculation (AZB Integration)
Integrates the official AZB (Kalkulator Zakat Bersepadu) to
automatically calculate zakat contribution based on declared income.
Suggested deduction amounts are generated according to LZS-
approved formulas.
4. Salary Deduction Setup
Allows employees to configure deduction amount or percentage.
Business rules ensure proper alignment (e.g., Zakat + PCB compliance
where applicable).
Private & Confidential Page 85 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
5. Mandatory Declaration
Requires digital declaration confirmation before submission.
Applications cannot proceed without acknowledgment of terms and
conditions.
6. Employer Approval Workflow
Routes submitted applications to the employer (e-Majikan portal) for
review:
• Approved → Status updated to Active Contributor
• Rejected → Automated notification sent to employee
7. Status Management
Maintains lifecycle status (Pending, Active, Rejected, Terminated) with
full audit trail logging.
This module ensures accurate onboarding, compliance with zakat calculation
standards, and structured employer validation before deduction activation.
7.1.1. Module 2: Employer Verification
The Employer Verification module ensures that all SPG contributor registrations
are validated and authorized by the respective employer before activation. It
strengthens governance, prevents unauthorized deductions, and ensures data
integrity across the SPG ecosystem.
Scope of the Module
1. Employer Approval
Routes employee SPG applications to the employer for review and decision.
• Approve → Employee is activated as an official SPG contributor.
• Reject → Employee is notified automatically and the application is not
activated.
2. Contributor Validation
Allows employers to review employee details including IC/Passport, deduction
amount, and employment status before approval. Validation ensures the
employee is officially attached to the organization.
Private & Confidential Page 86 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
3. Manual Contributor Entry
Employers may manually register contributors directly into the system when
required. The system performs IC/Passport duplication checks and validation
before activation.
4. Bulk Upload (IDD Compliant Format)
Supports bulk contributor upload using standardized LZS IDD template
(Excel/CSV format). This enables efficient onboarding of large employee
groups.
5. Exception Handling & Error Reporting
If validation errors occur during manual entry or bulk upload, the system
generates structured exception reports highlighting incorrect records for
correction.
6. Duplicate Cross-System Validation
Performs automated cross-check against existing SPG and internal LZS
databases to prevent duplicate contributor registration or conflicting records.
This module ensures structured employer governance, data accuracy, and
controlled contributor activation within the SPG system.
7.1.2. Module 3: Payment & Receipt
The Payment & Receipt module manages contribution processing, payment
validation, and official receipt issuance for SPG contributors. It ensures secure
transaction handling, structured verification for manual payments, and
compliance with LZS financial governance standards.
Scope of the Module
1. FPX Integration (eZakatPay)
Integrates with FPX payment gateway to enable secure online payment
processing. The system captures real-time transaction status (Success / Failed
/ Pending) through automated callback mechanisms.
2. Manual Proof Upload (Cheque / EFT / TT)
Allows employers to upload proof of payment for manual transactions. The
system enforces file validation (PDF/JPG formats only) before submission.
Private & Confidential Page 87 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
3. Payment Validation & Clearance Monitoring
Manual payments undergo verification by the finance team before official
receipt issuance. The system tracks payment status and enforces SLA
monitoring (e.g., 14 working days clearance target).
4. Temporary Receipt Generation
A provisional receipt is generated immediately after payment submission as
acknowledgment of contribution.
5. Official e-Receipt Issuance
Upon successful verification or FPX confirmation, the system generates and
issues an official e-Receipt to the employer or contributor.
6. e-Statement Management
Provides downloadable contribution statements for selected periods,
supporting audit, payroll reconciliation, and internal reporting.
7. Payment History Search
Enables advanced search and filtering of past payments by IC, employer, date,
or payment status.
This module ensures accurate payment processing, structured receipt
issuance, and financial transparency within the SPG system.
7.1.3. Module 4: Business Rules & Validation
The Business Rules & Validation module enforces operational policies,
compliance deadlines, and data integrity controls within the SPG system. It
ensures all transactions, deductions, and records adhere strictly to LZS rules
and governance standards.
Scope of the Module
1. Deadline Logic Enforcement
Implements structured deadline control (e.g., payment due by the 10th of each
month). Contributions made after the deadline are flagged as arrears and
categorized accordingly for monitoring and reporting.
2. Automated Reminder Cycle
Triggers systematic reminder notifications based on predefined schedule (e.g.,
15th, 20th, 28th, and 11th of the following month). Ensures employers and
contributors are consistently informed of pending obligations.
Private & Confidential Page 88 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
3. Tally Validation
Validates uploaded payment amounts against declared contribution totals to
ensure reconciliation accuracy. The system prevents submission if mismatch is
detected.
4. Duplicate Detection Mechanism
Performs automated cross-system checks to prevent duplicate contributor
registration using IC/Passport validation and employer cross-verification.
5. Unique Passport Handling
Supports special validation logic for passport-based contributors to prevent
multiple records under different employers or identification inconsistencies.
6. Data Integrity Enforcement
Ensures required fields are completed, formats are valid, and business rules
are satisfied before processing approval or payment confirmation.
This module strengthens operational discipline, reduces human error, and
ensures compliance consistency across the SPG ecosystem.
7.1.4. Module 5: Wakalah Integration
The Wakalah Integration module ensures that SPG contributions are properly
aligned with LZS wakalah policies. It manages eligibility determination,
application processing, and conflict prevention to maintain governance
integrity.
Scope of the Module
1. Eligibility Detection
Automatically evaluates annual contribution thresholds to determine wakalah
eligibility based on predefined LZS rules. The system performs calculation
checks using cumulative contribution data to ensure accuracy.
2. Wakalah Application Handling
Allows eligible employers or contributors to initiate wakalah application
through a structured workflow process. Applications are routed for review and
approval according to governance requirements.
Private & Confidential Page 89 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
3. Conflict Prevention Mechanism
Prevents overlapping wakalah claims between individual contributors and
employers. The system validates contribution ownership and ensures that
wakalah entitlement is applied only once per eligible record.
4. Wakalah Status Visibility
Displays real-time wakalah status (Eligible, Pending, Approved, Rejected) for
transparency and monitoring.
This module ensures compliance with wakalah governance standards while
protecting against duplicate claims and entitlement conflicts.
7.1.5. Module 6: Reporting & Dashboard
The Reporting & Dashboard module provides centralized visibility of SPG
operations through real-time dashboards, analytical insights, and structured
compliance reporting. It supports data-driven decision-making for LZS
management and operational teams.
Scope of the Module
1. Operational Dashboard
Displays real-time key performance indicators (KPIs) including:
• Total Active Contributors
• Total Collection Amount
• Monthly Contribution Trend
• Pending Employer Approvals
• Overdue Contributions
Dashboard views are role-based (Employee, Employer, Admin).
2. Performance Analytics
Provides analytical insights such as:
• Movement analysis (New, Stopped, Increased, Reduced contributors)
• Contribution growth trends
• Employer participation performance
• Comparative monthly and yearly analysis
3. Compliance Reporting
Generates structured reports for:
• Late payments (post-10th deadline)
• 3+ months non-payment ageing
• Exception records from bulk upload
Private & Confidential Page 90 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Duplicate detection cases
• SLA monitoring (receipt clearance status)
4. Drill-Down Capability
Allows users to navigate from summary-level data into detailed transaction-
level records for audit and verification purposes.
5. Export Capability
Supports export of reports in CSV/Excel format for audit, regulatory
submission, payroll reconciliation, or further data analysis.
This module enhances transparency, strengthens governance monitoring, and
provides LZS with actionable intelligence to manage SPG performance
effectively.
7.2. Risk
Risk Description Mitigation
Incorrect zakat Misalignment with official AZB Strict formula validation &
calculation formula configurable rate control
Duplicate contributor Same individual registered across Cross-system duplicate check
records systems engine
Tally validation & reconciliation
Payment mismatch Manual upload discrepancy
engine
Employer non-
Pending approval delays Automated reminder escalation
response
Late payment Automated reminder cycle & status
Missed 10th deadline
compliance tagging
Backend validation & exception
Bulk upload errors Incorrect IDD format
report
7.3. Security
The SPG system is designed with layered security architecture to ensure data
confidentiality, financial integrity, and regulatory compliance. The following controls
are implemented to safeguard system operations and personal data.
Private & Confidential Page 91 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Security Controls
7.3.1. Role-Based Access Control (RBAC)
Implements strict role segregation between Employee, Employer, Admin, and
Finance users. Each role is granted access only to authorized functions and data
to prevent unauthorized operations.
7.3.2. CAPTCHA & 3-Time Login Lockout
Protects against brute-force and automated login attacks by implementing
CAPTCHA validation and automatic account lockout after three consecutive
failed login attempts.
7.3.3. Encrypted Data Transmission (HTTPS/TLS)
All system communications are encrypted using secure HTTPS/TLS protocols to
prevent interception and data leakage during transmission.
7.3.4. Audit Trail Logging
All critical actions, including registration updates, employer approvals, payment
submissions, and status changes, are recorded with user ID, timestamp, and
activity details to ensure traceability and accountability.
7.3.5. Secure File Upload Validation
Uploaded documents (e.g., payment proof) are validated for permitted file types
(PDF/JPG) and file size limits. Malicious file types are automatically rejected.
7.3.6. Duplicate Detection (Cross-System Validation)
Performs automated cross-system checks using IC/Passport validation to
prevent duplicate contributor records and conflicting entries.
7.3.7. Data Integrity Validation (Tally Check Enforcement)
Implements automated reconciliation checks to ensure uploaded payment
totals match declared contribution amounts before confirmation.
Private & Confidential Page 92 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
7.3.8. SLA Monitoring for Receipt Issuance
Tracks manual payment clearance timelines (e.g., 14 working days SLA) to
ensure compliance and operational accountability.
7.3.9. Personal Data Protection (IC/Passport Masking)
Sensitive personal data such as IC or Passport numbers are masked in display
screens and reports where full visibility is not required, ensuring privacy
protection in compliance with data protection standards.
7.4. Conclusion
The Employee (SPG) module provides a comprehensive, compliant, and automated
solution for salary deduction zakat management. It ensures:
• Seamless employer-employee coordination
• Accurate zakat calculation based on official LZS formula
• Strong governance through approval workflows
• Automated reminder & compliance enforcement
• Integrated payment & receipt management
• Real-time analytics & reporting
• Secure and auditable operations
This module strengthens zakat collection efficiency while ensuring transparency,
compliance, and operational control aligned with LZS governance standards.
Private & Confidential Page 93 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
8. Function For Counter
8.1. Overview
The Counter function manages all physical branch collection activities including payer
registration, omnichannel payment processing (cash & non-cash), receipt issuance,
cancellation, cash handover, reconciliation, and daily closing.
It ensures:
• Centralized master data integrity
• Real-time transaction recording
• Controlled cash handling & threshold enforcement
• Automated reconciliation & closing validation
• Full audit trail & compliance readiness
The Counter system acts as the operational front line for collection, ensuring accuracy,
transparency, and financial control across all branches.
Private & Confidential Page 94 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
8.2. Solution component
The Application Layer forms the operational interface for all counter activities. It
ensures centralized control, real-time synchronization, and structured governance
across all branches.
8.2.1. Web-Based Centralized Counter System
A fully centralized, browser-based platform accessible by all branches in real-
time.
Key Value:
• Single source of truth (Master Data)
• Eliminates branch-level data inconsistency
• Real-time transaction visibility across HQ
• No local installation dependency
• Supports multi-branch scalability
All counter transactions, cancellations, deposits, and closing activities are
stored centrally to ensure operational transparency and audit readiness.
8.2.2. Counter Officer Portal
Operational interface used by front-line officers.
Capabilities:
• Payer search & registration
• Omnichannel payment processing (Cash / Card / QR / FPX / Cheque)
• Zakat calculator integration
• Receipt issuance (Temporary & Official)
• Cancellation request initiation
• Cash drawer monitoring
• Offline mode (if required)
Objective:
Provide fast, intuitive, and controlled transaction handling while minimizing
human error.
8.2.3. Supervisor (PKP) Monitoring Portal
A supervisory control dashboard for branch-level governance.
Capabilities:
Private & Confidential Page 95 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Real-time counter monitoring
• Transaction approval (cash cancellation / late cancellation)
• Cash handover verification
• Closing validation (Tally Check enforcement)
• Exception alerts
• Multi-counter visibility in one dashboard
Objective:
Ensure operational discipline, prevent irregularities, and maintain financial
integrity at branch level.
8.2.4. HQ Finance Portal
Centralized oversight for financial governance and reconciliation.
Capabilities:
• Cross-branch monitoring
• Refund approval & processing
• Reconciliation tracking
• Exception management
• SLA compliance monitoring
• Audit & compliance reporting
Objective:
Enable HQ-level financial transparency and regulatory compliance control.
8.2.5. Role-Based Access Control (RBAC)
Structured access segregation across roles:
• Counter Officer
• Supervisor (PKP)
• Branch Manager
• HQ Finance
• System Admin
Security Enforcement:
• Feature-based permission control
• Approval-based workflow restriction
• Audit trail per role action
• Segregation of duty enforcement
Private & Confidential Page 96 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
This prevents unauthorized cancellation, refund, or manipulation of transaction
records.
8.3. Core Engines
The Core Engines power the intelligence and control logic of the Counter system.
8.3.1. Transaction Processing Engine
Handles all transaction flows:
• Cash transactions
• Card auto-sync transactions
• QR / FPX payments
• Cheque processing
• Wakaf & SPG transactions
Key Strength:
• Real-time processing
• Atomic transaction integrity
• Offline-to-online synchronization capability
• Auto-generation of transaction reference IDs
8.3.2. Payment & Receipt Engine
Controls full receipt lifecycle:
• Temporary receipt (Cheque)
• Official receipt (After clearance)
• Digital receipt (WhatsApp / Email)
• Bulk statement printing
• QR-secured receipt validation
Control Logic:
• One-time receipt replacement restriction
• Receipt auto-lock after replacement
• SLA monitoring for cheque clearance
8.3.3. Business Rules & Validation Engine
Enforces compliance rules automatically:
• Tally validation before closing
Private & Confidential Page 97 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Deadline logic enforcement
• Duplicate payer detection
• Duplicate transaction detection
• Late cancellation workflow enforcement
• Passport unique profile mapping
This engine prevents non-compliant transactions from being completed.
8.3.4. Cash Threshold & Control Engine
Protects physical cash handling risk.
Capabilities:
• Real-time cash drawer tracking
• Cash threshold warning alert
• Auto-lock screen if limit exceeded
• Mandatory handover trigger
• Cash variance detection
This minimizes fraud and overexposure risk.
8.3.5. Workflow & Approval Engine
Manages structured approvals:
• Cash cancellation approval
• Late cancellation approval
• Refund routing to HQ
• Closing validation workflow
• Supervisor substitution logic (if on leave)
Ensures no financial adjustment occurs without authorized approval.
8.3.6. Reconciliation Engine
Automates daily and periodic reconciliation:
• Cash vs system tally check
• Card terminal auto-matching
• eSave deposit confirmation matching
• SPG acceptance reconciliation
• Exception case logging
Blocks closing if mismatch detected.
8.3.7. Reporting & Audit Engine
Provides real-time and historical reporting:
Private & Confidential Page 98 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Daily collection reports
• Cash vs non-cash breakdown
• Cancellation & replacement report
• Reconciliation exception report
• Counter performance report
• Full audit trail export (CSV)
Designed for internal audit, compliance review, and external regulatory
inspection.
8.3.8. Notification Engine
Automates communication flow:
• Payment confirmation
• Cheque clearance update
• Cancellation status
• Supervisor approval alerts
• Cash threshold alerts
• Closing reminder
Supports Email / WhatsApp / System Notification.
8.4. Integration Layer
The Integration Layer ensures seamless ecosystem connectivity.
8.4.1. Terminal Card Auto-Sync Integration
• Real-time integration with card terminals
• Auto capture of amount & card type
• Eliminates manual entry error
• Prevents amount mismatch manipulation
Improves speed and reconciliation accuracy.
8.4.2. eSave (Deposit) Integration
Structured deposit workflow:
• Deposit at machine
• Slip generation
• Slip number capture
• Supervisor validation
• Matching with system total
Private & Confidential Page 99 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Creates traceable cash-to-bank audit chain.
8.4.3. MyKad (MyCard Reader) Integration
• Direct IC data capture
• Auto-fill personal details
• Reduces manual data entry error
• Ensures identity accuracy
Mandatory for all counters to improve data integrity.
8.4.4. NKS Core System Integration
• Real-time transaction sync
• SPG transaction linkage
• Central accounting reflection
• Master data update synchronization
Ensures no duplicate or orphan transaction.
8.4.5. FPX / Omnichannel Payment Integration
Supports:
• FPX
• QR Pay
• E-Wallet
• Apple Pay
• Samsung Pay
• Debit/Credit Card
Includes:
• Real-time callback status
• Failed transaction auto reversal logic
• Secure redirection mechanism
8.4.6. Gold Price & Nisab Auto-Update Integration
• Automatic daily/periodic gold price update
• Nisab threshold recalculation
• AI-assisted zakat estimation support
Ensures Shariah compliance and calculation accuracy without manual
intervention.
Private & Confidential Page 100 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
8.4.7. Strategic Strength of the Counter Solution
This architecture delivers:
• End-to-end transaction control
• Centralized data governance
• Fraud prevention enforcement
• Structured approval governance
• Automated reconciliation
• Audit-ready compliance reporting
• Real-time HQ visibility
• Branch operational discipline
It transforms the Counter operation from a manual transaction desk into a
controlled, monitored, and intelligence-driven financial collection platform.
8.5. Function of the system
8.5.1. Opening & Registration
The Opening & Registration function ensures that every payer transaction
begins with verified identity, centralized master data control, and PDPA-
compliant onboarding. It eliminates duplicate records, reduces manual error,
and enforces data governance across all branches.
This module acts as the foundation of counter operations by ensuring that all
registrations, searches, and declarations are validated before transaction
processing begins.
A. Opening Declaration (PKP → Accept)
Before counter operations begin, the Supervisor (PKP) must perform an official
Opening Declaration in the system.
• PKP initiates opening session.
• System records timestamp and responsible officer.
• Acceptance (Accept) is mandatory before transactions can be
processed.
• Creates accountability and audit trace for daily operation start.
This ensures controlled activation of counter sessions and prevents
unauthorized transaction entry.
B. Centralized Single Source Master Data
Private & Confidential Page 101 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
All payer registrations are stored in a centralized master database.
• One unified payer profile across all branches.
• Prevents duplicate record creation.
• Real-time synchronization between branch and HQ.
• Ensures consistent and accurate data usage.
This establishes a Single Source of Truth (SSOT) for all counter transactions.
C. Self-Registration QR (EZO Link)
The system provides a QR code at the counter to allow payers to perform self-
registration.
• QR links directly to EZO registration page.
• Reduces counter waiting time.
• Minimizes manual data entry.
• Ensures cleaner and verified data input.
Improves operational efficiency while empowering payer self-service.
D. MyKad Reader Integration
Mandatory integration with MyKad (MyCard Reader).
• Auto-read IC data (Name, IC Number, Address).
• Auto-populate registration fields.
• Reduces human typing errors.
• Ensures identity authenticity.
Enhances data accuracy and speeds up registration process.
E. PDPA Declaration Confirmation
Every payer must acknowledge PDPA consent.
• Digital confirmation before transaction proceeds.
• Mandatory checkbox enforcement.
• Logged in audit trail.
• Prevents transaction if not agreed.
Ensures compliance with Personal Data Protection Act requirements.
F. Foreign Passport Registration Support
System supports registration for foreign payers.
• Passport number as unique identifier.
• Profile merge capability if later upgraded to MyKad.
• Separate validation logic for non-citizen data.
Private & Confidential Page 102 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Supports future data reconciliation.
Ensures inclusivity without compromising data integrity.
G. Multi-Parameter Payer Search
(IC / Passport / SSM / Name / GCIF)
Advanced search functionality allows officers to retrieve payer records using:
• IC (Old/New)
• Passport
• SSM number
• Full Name
• GCIF (if available)
This reduces duplicate entries and ensures fast profile retrieval during busy
counter operations.
H. “Hamba Allah” Anonymous Handling
System supports anonymous payment recording under “Hamba Allah (HA)”
profile.
• Minimal required contact (Phone or Email).
• Unique identifier assigned.
• Platform source tagging (e.g., Counter / QR / FPX).
• Traceable for audit but maintains payer anonymity.
Ensures flexibility in handling anonymous donations while preserving
compliance and reporting traceability.
I. Summary
The Opening & Registration function ensures:
• Controlled counter activation
• Centralized master data governance
• Accurate identity verification
• PDPA compliance enforcement
• Support for citizens and foreigners
• Fast multi-parameter record retrieval
• Secure anonymous transaction handling
This module establishes a strong compliance-first foundation before any
financial transaction is processed.
Private & Confidential Page 103 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
8.5.2. Transaction Processing (Cash & Non-Cash)
The Transaction Processing function is the operational core of the Counter
System. It enables secure, fast, and controlled processing of both cash and
non-cash payments while ensuring real-time validation, synchronization, and
compliance enforcement.
This module supports full omnichannel capability and ensures that every
transaction is traceable, validated, and reconciled automatically.
A. Omnichannel Payment Support
(Cash, Cheque, Card, E-Wallet, QR, FPX)
The system supports multiple modern payment channels in a unified
transaction engine:
• Cash
• Cheque
• Debit / Credit Card
• E-Wallet
• QR Pay
• FPX (Online Banking)
All payment channels are recorded under a standardized transaction
framework, ensuring:
• Centralized reporting
• Channel-based reconciliation
• Accurate breakdown (Cash vs Non-Cash)
• Real-time monitoring
This ensures flexibility for payers while maintaining operational control.
B. Cheque Detail Recording & Temporary Receipt
For cheque payments:
• Mandatory recording of Cheque Number
• Bank Name
• Cheque Date
• Amount
The system generates a Temporary Receipt immediately upon recording.
• Official receipt is issued only after cheque clearance.
• Status remains “Pending Clearance” until confirmed.
Private & Confidential Page 104 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
This protects financial accuracy and prevents premature revenue recognition.
C. Terminal Card Auto-Sync (Amount & Card Type)
Integrated card terminal synchronization ensures:
• Automatic retrieval of transaction amount
• Card type detection (Debit / Credit)
• No manual re-entry required
• Prevention of amount mismatch
This eliminates human error and ensures system amount = terminal amount
(Auto-Tally).
D. Offline Counter Mode with Auto Push-Sync
In the event of network disruption:
• Counter continues operating in Offline Mode.
• Transactions stored locally (secured).
• Auto push-sync occurs once connection is restored.
• Duplicate detection logic prevents double posting.
Ensures operational continuity without compromising data integrity.
E. Kiosk FPX Support
Self-service kiosk integration allows:
• FPX-based payment at branch kiosk
• QR-based transaction reference
• Automated posting to main system
• Real-time receipt generation
Reduces queue congestion and enhances digital payment adoption.
F. Auto Counter Lot Calculation (Wakaf)
For Wakaf transactions:
• System automatically calculates Wakaf lot quantity based on payment
amount.
• Auto-counter updates lot allocation in real time.
• Prevents under/over allocation.
• Displays lot value transparently to officer and payer.
Ensures accuracy and Shariah compliance in Wakaf processing.
G. AI-Assisted Zakat Calculation (If Applicable)
Private & Confidential Page 105 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Optional AI-assisted calculation engine:
• Auto-detects zakat type (Emas, Pendapatan, Harta).
• Suggests recommended zakat amount.
• Reduces manual calculation error.
• Supports historical reference comparison.
AI acts as decision-support — final confirmation remains with officer/payer.
H. Summary
The Transaction Processing function ensures:
• Full omnichannel payment capability
• Secure cheque handling workflow
• Real-time card terminal synchronization
• Offline operational resilience
• Integrated kiosk payment support
• Automated Wakaf lot calculation
• Intelligent zakat calculation assistance
This module guarantees secure, accurate, and compliant transaction handling
across all payment channels while maintaining operational efficiency and audit
readiness.
8.5.3. Zakat Calculator & Nisab
The Zakat Calculator & Nisab function ensures accurate zakat assessment at
the counter by integrating real-time calculation logic, automated nisab
updates, and intelligent validation support. It reduces human error, ensures
Shariah compliance, and enhances transparency during payer consultation.
This module serves as a decision-support tool for counter officers while
maintaining standardized LZS calculation methodology.
A. Cash Balance Calculator (Change Calculator)
The system includes an integrated cash balance calculator to:
• Automatically compute change for cash transactions.
• Display total paid vs amount due.
• Prevent manual miscalculation.
• Record exact tendered amount for audit reference.
This reduces cashier error and ensures financial precision at the transaction
point.
Private & Confidential Page 106 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
B. Built-In Zakat Calculator
(Emas, Pendapatan, Harta)
A structured zakat calculator is embedded within the system to support:
• Zakat Emas (Gold)
• Zakat Pendapatan (Income)
• Zakat Harta (Assets)
Features include:
• Guided data input fields.
• Automatic rate application.
• Calculation transparency (display breakdown).
• Compliance with official LZS formula.
This ensures consistent zakat computation across all branches.
C. Gold & Nisab Automatic Rate Update
The system automatically retrieves and updates:
• Current gold price reference.
• Applicable Nisab threshold.
• Rate adjustments (if applicable).
Benefits:
• Eliminates manual rate update dependency.
• Ensures real-time Shariah compliance.
• Prevents outdated calculation use.
All rate updates are logged for audit traceability.
D. Historical Weight Reference Storage
For recurring zakat payers:
• Previous gold weight or asset declaration is stored.
• Officers may reference past declarations.
• System highlights significant changes.
• Supports advisory consultation.
This enhances calculation consistency and reduces repetitive data entry.
E. AI-Assisted Calculation Validation
Optional AI validation layer provides:
• Cross-check of calculated amount.
• Detection of abnormal input patterns.
• Suggestion prompts for officer confirmation.
• Risk alert for extreme or inconsistent declarations.
Private & Confidential Page 107 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
AI functions as a validation assistant — final confirmation remains under officer
control.
F. Summary
The Zakat Calculator & Nisab module ensures:
• Accurate and transparent zakat calculation
• Real-time nisab compliance
• Automated gold price synchronization
• Reduced manual computation error
• Intelligent validation support
• Audit-ready calculation traceability
This module strengthens calculation integrity while enhancing payer
confidence and Shariah compliance at the counter level.
8.5.4.Receipt & Notification
The Receipt & Notification function manages the full lifecycle of receipt
issuance and customer communication. It ensures secure receipt generation,
controlled cheque clearance workflow, and multi-channel notification delivery,
while maintaining audit traceability and fraud prevention controls.
This module strengthens transparency, enhances payer experience, and
ensures financial compliance.
A. Built-In Zakat Calculator
Digital Receipt (WhatsApp / Email)
Upon successful transaction confirmation:
• Official receipt is automatically generated.
• Receipt is delivered via:
◦ WhatsApp
◦ Email
• Includes transaction reference number.
• Timestamped with branch identification.
• Secure receipt ID for verification.
This reduces paper usage and ensures instant acknowledgment to the payer.
B. Temporary Receipt for Cheque Payment
For cheque transactions:
Private & Confidential Page 108 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• System generates a Temporary Receipt immediately after
recording.
• Clearly marked as “Pending Clearance”.
• Official receipt is not issued until bank clearance is confirmed.
This prevents premature recognition of revenue and ensures financial
governance.
C. Official Receipt After Cheque Clearance
Once cheque is cleared:
• Status automatically updated to “Cleared”.
• Official receipt generated.
• Notification sent to payer.
• Temporary receipt status updated in system.
This ensures receipt lifecycle integrity and compliance control.
D. Bulk Statement Printing (5-Year Summary A4)
System supports consolidated statement printing:
• Up to 5 years transaction history.
• A4 format standardized layout.
• Suitable for tax filing and audit submission.
• Printable at branch or downloadable.
Enhances customer service efficiency and compliance support.
E. Built-In Zakat Calculator
QR Security Code on Receipt
Each receipt contains:
• Unique QR security code.
• Encoded transaction reference.
• Verification via official validation endpoint.
Prevents receipt forgery and strengthens anti-fraud control.
F. Payment History Summary Print
Counter officers can:
• Generate payer payment history summary.
• Filter by date range.
• Print consolidated contribution summary.
• Support audit and tax inquiry cases.
Private & Confidential Page 109 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Ensures transparency and improves service quality at the counter.
G. Summary
The Receipt & Notification module ensures:
• Secure digital receipt issuance
• Controlled cheque clearance workflow
• Multi-channel notification delivery
• Fraud-resistant QR validation
• Long-term statement generation capability
• Transparent payment history access
This module enhances payer trust, strengthens financial governance, and
ensures receipt integrity across all branches.
8.5.5.Cancellation & Replacement
The Cancellation & Replacement function provides a controlled and auditable
mechanism for reversing transactions and managing receipt replacements. It
ensures that all adjustments are governed by strict approval rules, segregation
of duties, and full traceability to protect financial integrity.
This module minimizes fraud exposure while maintaining operational flexibility
for legitimate correction cases.
A. Auto-Cancel for Non-Cash Transaction
For non-cash transactions (Card, QR, FPX, E-Wallet):
• System allows cancellation only if payment is not finalized or
settled.
• Real-time validation ensures no duplicate reversal occurs.
• Gateway-based auto-reversal is triggered where supported.
• Transaction status updated to “Cancelled” with full audit log.
This ensures immediate correction capability while maintaining system integrity.
B. Supervisor Approval for Cash Cancellation
Cash transaction cancellations require structured approval:
• Mandatory reason selection.
• Supervisor (PKP) review and approval.
• Dual-control enforcement (Officer cannot self-approve).
• Cancellation recorded in exception monitoring report.
Private & Confidential Page 110 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
This prevents unauthorized cash manipulation and strengthens branch
governance.
C. Auto-Lock Receipt Replacement (1-Time Only)
Receipt replacement is strictly controlled to prevent abuse:
• Only one replacement allowed per transaction.
• System automatically locks further attempts.
• Mandatory justification required before approval.
• Replacement receipt clearly labeled and traceable.
This protects against duplicate claim misuse and receipt fraud.
D. Late Cancellation Approval Workflow
For cancellation requests beyond allowed timeframe:
• System routes request to structured approval workflow.
• Higher-level authorization may be required.
• Categorized as “Late Cancellation” for reporting visibility.
• Justification and approval history permanently logged.
Ensures stricter control over delayed financial adjustments.
E. Bulk Statement Printing (5-Year Summary A4)
• Refund Request Routing to HQ Finance
If cancellation results in refund requirement:
• System routes request directly to HQ Finance Portal.
• Branch-level officers cannot process monetary refunds independently.
• Multi-tier approval enforced.
• Refund status tracked until completion.
Ensures centralized financial governance and policy compliance.
F. Audit Trail for Cancellation & Replacement
Every action is recorded including:
• User ID and role
• Timestamp
• Reason provided
• Approval authority
• Before-and-after transaction state
Provides full transparency and audit readiness for internal and external review
Private & Confidential Page 111 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
G. Status Notification to Customer & Supervisor
Automated notifications include:
• Cancellation confirmation to payer (where applicable)
• Replacement receipt notification
• Approval request alerts to supervisor
• Refund status updates
Enhances transparency and improves communication across stakeholders.
H. Summary
The Cancellation & Replacement function ensures:
• Controlled and policy-compliant transaction reversal
• Segregation of duties enforcement
• One-time receipt replacement safeguard
• Structured late cancellation governance
• Centralized refund approval
• Complete audit traceability
• Real-time notification transparency
This module significantly strengthens financial control, minimizes fraud risk, and
maintains compliance integrity across all counter operations.
8.5.6. Cash Handover (Serahan Tunai)
The Cash Handover (Serahan Tunai) function governs the secure transfer of
physical cash from Counter Officer to Supervisor (PKP). It ensures real-time
monitoring, threshold enforcement, and full traceability of cash movement
within the branch.
This module is designed to minimize cash handling risk, enforce segregation of
duties, and maintain strict financial control at branch level.
A. Real-Time Cash Drawer Balance Recording
The system continuously tracks:
• Total cash received
• Total cash cancelled
• Current drawer balance
• Cash variance (if any)
Balance is automatically updated after every transaction and displayed clearly
on the officer dashboard.
Private & Confidential Page 112 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
This ensures transparency and prevents manual tracking errors.
B. Cash Threshold Warning & Auto-Lock Screen
A configurable cash threshold limit is enforced:
• When balance reaches predefined limit, warning alert is triggered.
• If limit is exceeded, system automatically locks further cash
transactions.
• Mandatory handover required before continuation.
This prevents excessive cash exposure and reduces risk of theft or loss.
C. Paperless Handover (Officer → PKP)
The handover process is fully digitized:
• Officer initiates handover request in system.
• PKP reviews declared amount.
• System verifies current drawer total.
• PKP accepts or rejects handover digitally.
No manual forms required. All records stored centrally.
D. Amount Validation Before Acceptance
Before PKP acceptance:
• Physical cash must be counted.
• System total must match declared amount.
• If mismatch occurs, variance must be recorded.
• Handover cannot proceed without validation.
This ensures reconciliation accuracy at every transfer.
E. Handover Log Recording
Each handover captures:
• Officer ID
• Supervisor ID
• Timestamp
• Amount transferred
• Variance (if any)
• Branch identification
Log is available in audit report and cannot be edited or deleted.
F. Summary
Private & Confidential Page 113 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
The Cash Handover (Serahan Tunai) module ensures:
• Real-time cash visibility
• Automated threshold risk control
• Digitized and paperless transfer process
• Strict amount validation before acceptance
• Full audit trail logging
This function strengthens branch-level cash governance, reduces fraud
exposure, and ensures accountability throughout the cash lifecycle.
8.5.7. Closing Counter
The Closing Counter function ensures that all daily transactions are properly
reconciled, validated, and formally closed under structured governance control.
It enforces strict tally validation, deposit confirmation, and supervisory
verification before a counter session can be finalized.
This module protects financial integrity, prevents discrepancies, and ensures
every counter operation ends with a controlled reconciliation process.
A. Centralized Closing Workflow
The system provides a structured, centralized closing process:
• Counter Officer initiates closing session.
• System compiles total transactions (Cash & Non-Cash).
• Summary displayed for verification.
• Supervisor (PKP) validation required before final confirmation.
All closing actions are recorded centrally, ensuring HQ visibility.
B. Physical Count → System Verification → Closing Report
Closing follows a mandatory 3-step sequence:
1. Physical Cash Count – Officer counts actual physical cash.
2. System Verification – System compares physical count with recorded
transactions.
3. Closing Report Generation – Final report generated upon match
confirmation.
This structured sequence enforces disciplined reconciliation.
C. Tally Validation (Block if Mismatch)
Private & Confidential Page 114 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
System performs automatic tally validation:
• If physical count ≠ system total → Closing is blocked.
• Variance must be resolved or formally recorded.
• Supervisor intervention required for approval in case of discrepancy.
Prevents incomplete or inaccurate closing
D. eSave Deposit Integration
For cash deposits:
• Deposit amount entered in system.
• eSave transaction reference captured.
• System matches deposit slip with recorded total.
• Deposit linked to daily closing report.
Ensures traceable cash-to-bank reconciliation chain.
E. Slip Upload & Verification
Deposit slip upload is mandatory:
• File validation enforced (PDF/JPG).
• Supervisor verifies slip against declared amount.
• Status updated to “Verified” or “Rejected”.
Provides documented evidence for audit compliance.
F. Supervisor Monitoring Dashboard
Supervisor (PKP) has real-time dashboard to monitor:
• Closing status of each counter.
• Pending verifications.
• Variance alerts.
• Deposit confirmation status.
Enables branch-level governance and proactive control.
G. Daily Closing Report Generation
Upon successful validation:
• System generates official Daily Closing Report.
• Includes:
◦ Total collection (Cash / Non-Cash)
◦ Cancellation summary
◦ Deposit amount
◦ Variance (if any)
◦ Responsible officers
Private & Confidential Page 115 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Exportable in PDF/CSV format.
Report is permanently stored for audit and compliance reference.
H. Summary
The Closing Counter module ensures:
• Structured and centralized closing workflow
• Mandatory physical-to-system verification
• Automatic blocking for mismatch cases
• Integrated deposit validation
• Supervisor oversight control
• Audit-ready daily closing documentation
This function enforces operational discipline, strengthens financial governance,
and ensures accurate reconciliation at the end of every counter session.
8.5.8. Reporting & Analytics (Counter)
The Reporting & Analytics (Counter) function provides real-time operational
visibility, financial monitoring, and compliance reporting across all branch
counter activities. It supports management oversight, audit readiness, and
performance evaluation through structured dashboards and exportable reports.
This module transforms raw transaction data into actionable intelligence for
both branch supervisors and HQ management.
A. Daily Collection Report
Generates structured daily summary including:
• Total transactions
• Total collection amount
• Cash vs Non-Cash breakdown
• Cancellation summary
• Deposit confirmation status
Provides immediate end-of-day operational overview.
B. Collection Breakdown (Cash / Non-Cash)
Separates collection performance by payment channel:
• Cash
Private & Confidential Page 116 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Cheque
• Card
• FPX
• QR / E-Wallet
Enables financial tracking and channel performance analysis.
C. Counter Performance Report
Tracks individual counter metrics such as:
• Total transactions processed
• Average transaction value
• Processing volume per officer
• Cancellation frequency
• Compliance score (closing punctuality)
Supports performance monitoring and operational benchmarking.
D. Cancellation & Replacement Report
Provides visibility into:
• Total cancellation count
• Late cancellation cases
• Replacement receipt issuance
• Supervisor approval logs
Helps detect irregular patterns and potential abuse.
E. Cash Balance & Handover Report
Summarizes:
• Real-time drawer balance
• Handover amount
• Variance recorded (if any)
• Supervisor validation record
Ensures traceable cash movement tracking.
F. Closing Compliance Report
Monitors:
• Counters closed on time
• Pending closing cases
• Variance incidents
• Supervisor intervention records
Ensures operational discipline enforcement.
Private & Confidential Page 117 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
G. Reconciliation Report (Tally / Exception)
Displays reconciliation status including:
• Matched transactions
• Tally-confirmed closing
• Unmatched deposits
• Exception cases requiring investigation
Strengthens financial accuracy and transparency.
H. SPG Acceptance Report
Tracks SPG-related transactions processed at counter:
• New SPG registration at counter
• SPG acceptance rate
• SPG contribution volume
• Referral tracking (if applicable)
Supports cross-module monitoring.
I. Audit Activity Report
Logs system activities including:
• Login history
• Cancellation approval logs
• Replacement actions
• Closing approvals
• Refund routing
Provides full traceability for audit inspection.
J. CSV Export for Audit
All reports support export in CSV format:
• Suitable for audit review
• External reporting submission
• Advanced Excel analysis
• Regulatory compliance filing
Ensures data portability and transparency.
K. Summary
The Reporting & Analytics (Counter) module ensures:
Private & Confidential Page 118 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Real-time branch-level visibility
• Channel-based financial tracking
• Performance benchmarking
• Cancellation and fraud monitoring
• Cash governance tracking
• Reconciliation transparency
• Audit-ready documentation
• Data export capability for compliance
This module provides LZS with comprehensive operational intelligence and
strengthens financial governance across all counter branches.
8.6. Module
8.6.1. Module 1: Counter Registration & Transaction
The Counter Registration & Transaction module manages the full front-line
counter operation, from opening declaration to payment processing and receipt
issuance. It ensures accurate payer identification, structured transaction
handling, and real-time recording under centralized governance control.
Scope of the Module
Private & Confidential Page 119 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
1. Opening Control
Implements mandatory opening declaration by Supervisor (PKP) before
any transaction can be processed. All opening activities are logged with
timestamp and responsible officer for audit traceability.
2. Payer Search & Registration
Provides centralized master data access with multi-parameter search
(IC, Passport, SSM, Name, GCIF).
Supports:
• MyKad reader integration
• Self-registration via QR (EZO link)
• PDPA consent enforcement
• Foreign passport registration
• “Hamba Allah” anonymous handling
Prevents duplicate records and ensures accurate identity capture.
3. Omnichannel Payment Processing
Supports full payment channel coverage:
• Cash
• Cheque
• Card (auto terminal sync)
• QR / E-Wallet
• FPX
Includes cheque detail recording and temporary receipt generation. All
transactions are processed in real time and stored centrally.
4. Zakat Calculation Integration
Includes built-in zakat calculator (Emas, Pendapatan, Harta),
automatic Nisab update, and AI-assisted validation support. Ensures
Shariah-compliant calculation accuracy.
5. Receipt Issuance
Manages full receipt lifecycle:
• Temporary receipt for cheque
• Official receipt after clearance
• Digital delivery (WhatsApp / Email)
Private & Confidential Page 120 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• QR-secured receipt verification
• Historical statement printing
This module ensures operational efficiency, data integrity, and controlled
transaction processing at branch level.
8.6.2. Module 2: Cancellation & Refund Control
The Cancellation & Refund Control module governs transaction reversal and
refund processes through structured approval workflows and strict governance
enforcement. It prevents misuse while allowing legitimate corrections under
controlled supervision.
Scope of the Module
1. Auto-Cancel Logic (Non-Cash Transactions)
Allows automatic cancellation of non-cash transactions where
payment is not yet finalized. Prevents duplicate reversals and ensures
proper status update.
2. Cash Cancellation Approval Workflow
Requires Supervisor (PKP) approval for all cash cancellation requests.
Enforces segregation of duties and mandatory reason selection.
3. Receipt Replacement Control
Implements one-time-only receipt replacement policy. System auto-
locks further replacement attempts and clearly marks replacement
receipts for traceability.
4. Late Cancellation Governance
Routes delayed cancellation requests through structured approval
hierarchy with enhanced validation and justification logging.
Private & Confidential Page 121 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
5. Refund Routing to HQ Finance
All refund requests are routed to HQ Finance Portal. Branch-level
officers cannot directly process monetary refunds. Multi-tier approval
is enforced before payment release.
6. Audit & Traceability
Captures full audit trail including user ID, timestamp, role, reason, and
approval authority for every cancellation or refund action.
This module ensures strict financial governance, protects against fraud
exposure, and maintains compliance integrity across all counter operations.
8.6.3. Module 3: Cash Management & Handover
The Cash Management & Handover module governs the secure handling,
monitoring, and transfer of physical cash at the counter. It ensures real-time
visibility of cash balances, enforces threshold controls, and provides a
structured, paperless handover process with full audit traceability.
Scope of the Module
1. Real-Time Cash Monitoring
Continuously tracks:
• Total cash received
• Total cash cancelled
• Current cash drawer balance
Balance updates automatically after every transaction, providing immediate
visibility to both Counter Officer and Supervisor (PKP).
2. Cash Threshold Control
Implements configurable cash limit enforcement:
• Warning alert when threshold is nearing limit
• Automatic system lock if threshold exceeded
• Mandatory handover required before further cash transactions
This reduces overexposure risk and strengthens internal control.
Private & Confidential Page 122 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
3. Paperless Cash Handover (Officer → PKP)
Digitized handover workflow:
• Officer initiates handover request
• System displays recorded drawer total
• PKP verifies physical cash count
• PKP accepts or rejects handover digitally
Eliminates manual paperwork and ensures centralized logging.
4. Amount Validation Before Acceptance
Enforces strict verification:
• Physical count must match system balance
• Variance must be recorded and justified
• Handover cannot proceed without supervisor confirmation
Prevents inaccurate transfer and strengthens accountability.
5. Handover Logging & Audit Trail
Every handover captures:
• Officer ID
• Supervisor ID
• Timestamp
• Declared amount
• Variance (if any)
• Branch location
Logs are permanent and exportable for audit and compliance review.
Summary
The Cash Management & Handover module ensures:
• Real-time cash visibility
• Automatic threshold risk control
• Secure and paperless transfer workflow
• Strict validation before acceptance
• Complete audit traceability
This module significantly strengthens branch-level financial discipline and
reduces operational risk in physical cash handling.
Private & Confidential Page 123 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
8.6.4. Module 4: Closing & Reconciliation
The Closing & Reconciliation module ensures that every counter session ends
with verified, balanced, and fully documented reconciliation. It enforces strict
tally validation, structured deposit workflow, and supervisory oversight to
prevent financial discrepancies.
Scope of the Module
1. Tally Validation Enforcement
• Physical cash count must match system-recorded total.
• Closing is automatically blocked if mismatch occurs.
• Variance must be recorded with justification.
• Supervisor (PKP) approval required for discrepancy resolution.
This prevents incomplete or inaccurate closing.
2. Deposit Workflow (eSave Integration)
• Deposit amount entered into system.
• eSave transaction reference captured.
• Deposit slip upload mandatory.
• System matches deposit amount with recorded closing total.
• Status updated to Verified / Pending / Exception.
Ensures traceable cash-to-bank audit chain.
3. Supervisor Verification
• PKP reviews closing summary before approval.
• Confirms tally status, deposit reference, and transaction summary.
• Approves or rejects closing digitally.
• Closing log permanently recorded.
Enforces segregation of duties and governance control.
4. Exception Handling
• Unmatched deposits flagged automatically.
• Variance cases categorized as Exception.
• Structured follow-up tracking until resolution.
• Exception reports available for HQ monitoring.
Strengthens reconciliation transparency and compliance.
Private & Confidential Page 124 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
8.6.5. Module 5: Business Rules & Validation
The Business Rules & Validation module governs operational discipline by
enforcing predefined system policies, approval hierarchy, and transaction
integrity controls.
Scope of the Module
1. Deadline Logic Enforcement
• Enforces mandatory daily closing timeline.
• Flags delayed closing.
• Generates compliance alerts.
Ensures operational punctuality.
2. Auto-Lock Mechanism
• System auto-locks transaction processing if:
◦ Cash threshold exceeded
◦ Closing incomplete
◦ Supervisor approval pending
Prevents unauthorized continuation of operations.
3. Duplicate Detection
• Cross-checks payer records by IC/Passport/SSM.
• Detects duplicate transaction attempts.
• Prevents multiple receipt generation for same reference.
Protects data integrity and reduces fraud risk.
4. Tally Enforcement
• Automatic system comparison of physical vs recorded totals.
• Blocks workflow until reconciliation completed.
• Ensures financial accuracy.
5. Approval Hierarchy Control
• Defines authority level for:
◦ Cash cancellation
◦ Late cancellation
◦ Refund routing
◦ Closing validation
Maintains segregation of duties and structured governance.
Private & Confidential Page 125 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
8.6.6. Module 6: Reporting & Audit
The Reporting & Audit module provides centralized visibility, performance
intelligence, and compliance monitoring across all counter operations.
Scope of the Module
1. Operational Reporting
• Daily collection report
• Cash vs Non-Cash breakdown
• Cancellation & replacement report
• Deposit and closing status
Supports daily branch monitoring.
2. Performance Dashboard
• Counter-level transaction volume
• Officer performance metrics
• Closing compliance rate
• Exception trend analysis
Enables performance benchmarking.
3. Reconciliation Monitoring
• Matched vs unmatched transactions
• Deposit confirmation tracking
• Variance summary
• Exception follow-up status
• Strengthens financial oversight.
4. Audit Trail Export
• Full system activity log export (CSV/PDF)
• User activity tracking
• Approval logs
• Transaction change history
Provides complete audit readiness for internal and external inspection.
Private & Confidential Page 126 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
8.7. Risk
The Counter system operates in a high-control financial environment involving physical
cash handling, real-time transaction processing, and daily reconciliation. The following
risks have been identified along with mitigation mechanisms embedded within the
proposed solution.
8.7.1. Cash Handling Discrepancy Risk
Risk:
Mismatch between physical cash and system-recorded balance due to counting
error or misappropriation.
Mitigation:
• Real-time cash drawer monitoring
• Cash threshold alert & auto-lock mechanism
• Mandatory physical count before closing
• Supervisor verification before acceptance
• Full handover audit logging
8.7.2. Human Error During Manual Input
Risk:
Incorrect payer details, wrong amount entry, or manual data errors.
Mitigation:
• MyKad reader integration (auto data capture)
• Terminal auto-sync for card transactions
• Built-in zakat calculator
• Mandatory field validation
• Duplicate detection engine
8.7.3. Late Closing or Incomplete Reconciliation
Risk:
Counter not closed on time or reconciliation incomplete, leading to reporting
inconsistency.
Mitigation:
• Deadline logic enforcement
• Auto-lock system if closing not completed
• Supervisor dashboard monitoring
Private & Confidential Page 127 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Exception tracking and reporting
8.7.4. Duplicate Transaction Recording
Risk:
Multiple entries for the same transaction resulting in inaccurate reporting.
Mitigation:
• Multi-parameter payer search
• Duplicate transaction detection logic
• Receipt ID uniqueness enforcement
• Cross-system validation checks
8.7.5. Unauthorized Cancellation or Refund
Risk:
Improper cancellation or refund leading to financial loss.
Mitigation:
• Supervisor approval workflow for cash cancellation
• One-time-only receipt replacement control
• Structured late cancellation governance
• Refund routing to HQ Finance only
• Full audit trail logging
8.7.6. System Downtime Affecting Counter Operation
Risk:
Network or server interruption impacting transaction processing.
Mitigation:
• Offline counter mode with auto push-sync
• Real-time transaction queueing
• High-availability centralized infrastructure
• Data integrity validation upon re-synchronization
8.7.7. Data Mismatch Between Terminal & System
Risk:
Amount recorded in card terminal differs from system entry.
Mitigation:
• Terminal card auto-sync integration
• Auto amount validation
Private & Confidential Page 128 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Tally enforcement before closing
• Exception logging
8.7.8. Deposit Validation Delay
Risk:
Delay in verifying eSave deposit, causing reconciliation gap.
Mitigation:
• Mandatory slip upload
• eSave reference capture
• Supervisor verification before closing
• Exception report monitoring
8.7.9. Risk Management Summary
The proposed Counter system incorporates layered control mechanisms
including automation, validation logic, approval workflows, and audit tracking to
significantly minimize operational and financial risk.
This ensures:
• Controlled cash governance
• Reduced human error exposure
• Timely reconciliation enforcement
• Fraud prevention safeguards
• Centralized oversight by HQ
If you would like, I can now prepare the Security & Compliance section for
Counter in the same structured format.
8.8. Security
The Counter system operates in a high-risk financial environment involving cash
handling and real-time transactions. The proposed solution incorporates layered
security controls to ensure data protection, fraud prevention, operational discipline,
and regulatory compliance.
8.8.1. RBAC with Strict Role Segregation (Officer / PKP / HQ)
Implements structured Role-Based Access Control to enforce segregation of
duties:
• Counter Officer – Transaction processing only
Private & Confidential Page 129 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• PKP (Supervisor) – Approval & monitoring
• HQ Finance – Refund & reconciliation oversight
• System Admin – Configuration control
Prevents unauthorized cancellation, refund, or manipulation of records.
8.8.2. CAPTCHA & 3-Time Login Lockout
Protects against brute-force and automated login attacks:
• CAPTCHA validation at login
• Automatic account lockout after 3 failed attempts
• Admin unlock process with audit logging
Enhances authentication security.
8.8.3. HTTPS/TLS Encrypted Transmission
All system communication is secured using HTTPS/TLS encryption to prevent:
• Data interception
• Session hijacking
• Man-in-the-middle attacks
Ensures secure data transmission between branch and central server.
8.8.4.Full Audit Trail for All Transactions & Approvals
Every critical action records:
• User ID
• Role
• Timestamp
• Before/after state
• Approval authority
• IP address (if required)
Provides complete traceability for audit and compliance review.
8.8.5. Tally Validation Enforcement (Block Closing if Mismatch)
Closing process cannot proceed if:
• Physical count ≠ system total
• Deposit mismatch detected
System automatically blocks closing until resolution and approval.
Prevents inaccurate reconciliation and financial misstatement.
Private & Confidential Page 130 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
8.8.6. Cash Threshold Auto-Lock Mechanism
When cash drawer exceeds configured limit:
• Warning alert triggered
• System auto-locks further cash transactions
• Mandatory handover required
Reduces cash exposure risk and strengthens internal control.
8.8.7. Secure Receipt QR Validation
Each receipt contains:
• Unique QR code
• Encrypted transaction reference
• Verification endpoint
Prevents receipt forgery and supports authenticity validation.
8.8.8. Controlled Refund Approval Workflow
Refund requests:
• Cannot be processed at branch level
• Routed to HQ Finance Portal
• Multi-tier approval enforced
• Status tracked until completion
Ensures centralized financial governance.
8.8.9. Duplicate Cross-System Validation
System performs automatic validation across:
• Payer master data
• Transaction records
• SPG/NKS systems
Prevents duplicate registration and multiple receipt issuance.
8.8.10. Secure File Upload Validation (Deposit Slip / Proof)
All uploaded files are:
• Restricted to approved formats (PDF/JPG)
• Size-limited
• Virus/malware scanned (if integrated)
• Logged with timestamp & uploader ID
Private & Confidential Page 131 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Prevents malicious file injection.
8.8.11. Personal Data Masking (IC/Passport Where Applicable)
Sensitive personal data is masked:
• IC displayed as partial (e.g., ****--1234)
• Passport masked except last characters
• Full data accessible only to authorized roles
Ensures PDPA compliance and privacy protection.
8.8.12. Security Summary
The Counter solution incorporates:
• Layered authentication & access control
• Encryption-based data protection
• Strict segregation of duties
• Automated financial control enforcement
• Fraud-resistant receipt validation
• Centralized refund governance
• Full audit readiness
• PDPA-compliant personal data handling
This ensures a secure, compliant, and resilient counter operation environment
across all branches.
8.9. Conclusion
The Counter system provides a fully controlled, centralized, and audit-ready collection
environment that supports omnichannel payments, strict cash governance, structured
cancellation workflow, and automated reconciliation.
It ensures:
• Operational efficiency
• Financial accuracy
• Compliance enforcement
• Transparent audit tracking
• Real-time monitoring across branches
The Counter function strengthens branch-level control while maintaining HQ visibility
and governance, ensuring collection integrity at every transaction point.
Private & Confidential Page 132 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
9. Function For Back-end Processing
9.1. Overview
The Back-End Processing Function serves as the operational core of the entire
Kutipan, SPG, PSP, Counter, and Omnichannel ecosystem.
It is responsible for:
• Receiving and ingesting transaction data from multiple sources
• Validating and processing financial records
• Managing settlement, reconciliation, and exception handling
• Executing workflow approvals
• Ensuring ACID-compliant financial integrity
• Synchronizing data with finance (SAP), NKS Core, and other micro systems
This function operates behind the portal layer and ensures that all transactions
whether from Counter, Ejen, Portal eMajikan, FPX, PSP, SFTP, API, or Email ingestion
are processed, reconciled, validated, and finalized correctly.
It is the control tower of financial truth and data integrity.
Private & Confidential Page 133 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
9.2. Solution Component
9.2.1. APPLICATION LAYER
(Operational Control & Processing Interface)
This layer provides operational visibility, control, and governance over all
backend financial and transactional processes.
A. Back-End Processing Console (Admin Processing Portal)
Centralized operational portal for backend processors and administrators to:
• View incoming transaction batches
• Monitor processing status (Pending / Processing / Completed /
Failed)
• Execute batch approval or re-processing
• Trigger reconciliation manually (if required)
• Perform controlled backdated adjustments (Supervisor role)
• View data ingestion logs and processing health
This console acts as the control center of transaction integrity.
B. Supervisor & Finance Review Dashboard
Dedicated dashboard for supervisory and finance-level monitoring:
• Batch approval queue
• Refund approval queue
• Settlement verification status
• Reconciliation variance monitoring
• SLA compliance tracking
• Daily financial performance overview
Provides governance oversight without exposing operational-level controls.
C. Exception Queue Management Screen
Structured exception handling interface:
• Segregated failed records (Format Error / Business Rule Violation /
Duplicate / Missing ID)
• Cheque bounce (Cek Tendang) cases
• Majikan Null detection
• PSP settlement mismatch
• Retry processing trigger
Ensures non-blocking processing — failed records are isolated without halting
entire batch.
Private & Confidential Page 134 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
D. Reconciliation Monitoring Screen
Financial reconciliation dashboard:
• Auto-reconciliation status (Bank / SPG / Counter / eMajikan / PSP)
• Variance detection (Amount mismatch)
• Pending settlement tracking
• Manual reconciliation override (Supervisor only)
• Reconciliation history logs
Provides full financial traceability.
E. Workflow Management Console
Process orchestration interface:
• Task allocation (Manual / Round Robin)
• Escalation rule configuration
• SLA timer tracking
• Processor workload monitoring
• Approval hierarchy configuration
Ensures governed and measurable processing flow.
F. Data Ingestion Monitoring Panel
Technical monitoring layer for:
• Real-time API intake status
• SFTP file upload logs
• Email extraction logs
• Cronjob execution status
• Processing latency metrics
Provides early warning for ingestion failure or delay.
9.2.2. CORE ENGINES
(Processing Intelligence & Financial Integrity)
A. Data Ingestion Engine (Real-Time & Batch)
Handles structured intake from multiple sources:
• Real-time ingestion (PSP / FPX gateway)
• Batch ingestion (SPG files, bank settlement files)
• SFTP intake
• Email attachment auto-extraction
Private & Confidential Page 135 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• API submission
Key capabilities:
IDD compliance validation
Header vs Detail tally verification
Duplicate transaction prevention
Corrupted file rejection
B. Core Processing & Settlement Engine (ACID Compliant)
The financial transaction engine that ensures:
• Atomic transaction processing
• Consistency validation
• Isolation between batches
• Durable record storage
Capabilities:
• Pending settlement creation
• Transaction lifecycle management
• Unique transaction reference generation
• Double-posting prevention
• Rollback on failure
Guarantees financial integrity at database level.
C. Validation & Integrity Engine
Enforces business rules:
• Mandatory field validation
• Amount consistency check
• Deadline logic validation
• Wakalah eligibility rule enforcement
• Duplicate IC / Passport detection
• Payroll mapping validation
Acts as rule enforcement layer before posting.
D. Reconciliation Engine (Auto & Manual)
Performs structured matching across systems:
• Bank settlement file vs System records
• SPG Portal vs Backend
• Counter vs PSP
• Portal eMajikan vs Payroll
• Commission payout vs Collection
Capabilities:
Private & Confidential Page 136 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Variance detection
Auto-matching algorithm
Manual override (with reason code)
Reconciliation history logging
E. Exception Management Engine
Advanced error isolation system:
• Exception queue creation
• Retry logic mechanism
• Escalation trigger
• Root cause classification
• Partial batch continuation
Ensures continuous processing despite isolated failure.
F. Workflow & Escalation Engine
Process governance engine:
• Multi-level approval routing
• Refund approval workflow
• Backdated adjustment approval
• Commission approval
• Escalation timer configuration
• Round robin task distribution
Prevents bottleneck and enforces accountability.
G. Refund & Adjustment Engine
Controlled financial correction engine:
• Refund request creation
• Refund validation
• Multi-level approval
• Integration to SAP Accounts Payable
• Status lifecycle (Pending / Approved / Paid / Rejected)
• Backdated adjustment control
Includes mandatory audit reason code enforcement.
H. Commission Processing Engine
Commission automation engine:
• Commission rule configuration
• Percentage / tier-based calculation
• Commission reversal logic
Private & Confidential Page 137 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Commission reconciliation
• Approval workflow
• Commission audit logging
Prevents commission overpayment and miscalculation.
I. Reporting & Audit Engine
Enterprise-grade reporting layer:
• Backend process performance report
• Reconciliation report
• Refund report
• Commission report
• Exception analytics
• Audit log export (CSV/PDF)
Supports audit, compliance, and KPI monitoring.
J. Cronjob & Monitoring Engine
Automated backend orchestration:
• Scheduled settlement processing
• Auto-reconciliation trigger
• Retry failed jobs
• Monitoring & alerting
• Auto-detection of stuck records
• System health tracking
Ensures 24/7 backend reliability.
9.2.3. INTEGRATION LAYER
(Enterprise Interoperability & Financial Synchronization)
A. SAP Finance Integration (Min 10 Touchpoints)
Deep financial integration including:
• Collection posting
• Refund posting
• Commission posting
• Adjustment posting
• GL account mapping
• Bank reconciliation posting
• Accounts receivable update
• Accounts payable trigger
• Financial callback confirmation
Private & Confidential Page 138 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Integration log monitoring
Ensures finance alignment and compliance.
B. NKS Core Integration
Synchronizes:
• Transaction header creation
• SPG acceptance status
• Payment reference mapping
• Refund status
• Reconciliation status
Maintains unified core financial truth.
C. SPG & PSP Portal Integration
Real-time and batch data flow between:
• Employer Portal (eMajikan)
• Employee SPG Portal
• PSP / Gateway systems
Ensures synchronized transaction lifecycle.
D. Bank / FPX / Payment Gateway Integration
Supports:
• Real-time transaction ingestion
• Settlement file intake
• Pending settlement logic
• Callback verification
• Status confirmation (Success / Failed)
Ensures payment integrity.
E. SFTP / API / Email Data Ingestion
Multi-channel integration flexibility:
• Secure SFTP intake
• RESTful APIs
• Email attachment extraction
• ETL transformation
Supports diverse legacy and modern systems.
F. Payroll System Integration
Private & Confidential Page 139 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Allows:
• Salary deduction validation
• Payroll file reconciliation
• Employer mapping
• Monthly deduction confirmation
Supports SPG ecosystem.
G. Wakalah System Integration
• Wakalah eligibility detection
• Conflict prevention (Individual vs Employer Wakalah)
• Wakalah status synchronization
Ensures Syariah compliance.
H. Gold Price & Nisab Rate Integration
• Automatic gold rate update
• Nisab threshold auto recalculation
• Zakat calculation reference update
Maintains calculation accuracy without manual input.
9.2.4. CONCLUSION
The Back-End Processing architecture is designed as:
Financially compliant
ACID-safe
Reconciliation-driven
Workflow-governed
Audit-ready
Scalable for high transaction volume
Fully integrated with finance, banking, payroll, and portals
It acts as the intelligent processing brain behind the entire ecosystem,
ensuring every transaction is:
Validated → Processed → Reconciled → Approved → Integrated → Audited.
Private & Confidential Page 140 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
9.3. Function of the system
9.3.1. Data Ingestion & Validation
The Data Ingestion & Validation layer acts as the gateway control mechanism
ensuring that only clean, validated, and structurally compliant data enters the
financial processing engine.
A. Multi-Source File Intake
The system supports structured intake from multiple channels:
• Portal uploads (eMajikan / SPG / Admin LZS)
• Admin manual upload
• Secure SFTP file transfer
• API-based real-time submission
• Email attachment auto-extraction
Each intake channel is monitored with timestamp, source identification,
and processing status logging.
This ensures flexibility without compromising traceability.
B. IDD (Integrated Data Dictionary) Compliance Validation
Every incoming file is validated against predefined IDD schema:
• Field structure validation
• Mandatory column enforcement
• Data type validation
• Format verification (Date, IC, Amount, etc.)
• Length & character validation
Files not compliant are rejected immediately and moved to the
Exception Queue.
This ensures data integrity before financial posting.
C. Header vs Detail Amount Matching Validation
Before processing:
• System compares Header Total Amount
• With aggregated Detail Records
If mismatch detected:
• File rejected
• Error flagged
• Notification triggered
Prevents financial imbalance and partial posting.
Private & Confidential Page 141 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
D. Auto-Reject Corrupted or Invalid Files
The system automatically:
• Detects corrupted files
• Identifies incomplete uploads
• Rejects tampered files
• Blocks malformed file structure
No partial ingestion is allowed.
E. Real-Time Ingestion for PSP (Pending Settlement Creation)
For FPX / Card / E-Wallet transactions:
• System ingests transaction instantly
• Creates “Pending Settlement” record
• Does NOT wait for bank settlement file
This enables real-time visibility of collections.
F. Duplicate Transaction Detection
Prevents:
• Same reference number ingestion
• Duplicate IC + Amount + Timestamp
• Repeated batch upload
Uses:
• Transaction fingerprinting
• Hash validation
• Unique transaction reference enforcement
Ensures double posting prevention at ingestion level.
9.3.2. Core Financial Processing
This is the financial brain of the system ensuring transactional accuracy and
ACID compliance.
A. Batch Processing with Rollback (ACID Compliance)
System processes validated batches with:
• Atomicity – All or nothing execution
• Consistency – Financial balance enforced
• Isolation – Independent batch execution
• Durability – Permanent storage guarantee
If record 99 of 100 fails → entire batch rolls back.
Private & Confidential Page 142 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Guarantees financial accuracy.
B. Pending Settlement Creation
For gateway-based transactions:
• Initial status: Pending
• Updated to Confirmed after settlement file
• Failed if bank rejection
Ensures lifecycle transparency.
C. Transaction Status Lifecycle
Each transaction follows defined states:
Pending → Confirmed → Failed → Reversed → Refunded
No manual direct status override allowed without audit trail.
D. Backdated Adjustment (Supervisor Controlled)
Allows authorized Supervisor to:
• Perform controlled historical adjustment
• Must input Reason Code
• Time-bound control
• Full audit logging
Prevents unauthorized financial manipulation.
E. Unique Transaction Reference Generation
Each transaction generates:
• Globally unique reference ID
• Non-sequential logic (anti-manipulation)
• Cross-system traceability
Used across SAP, Portal, Counter, and PSP.
F. Prevention of Double Posting
System prevents:
• Same transaction processed twice
• Duplicate settlement posting
• Duplicate commission posting
Uses locking mechanism and reference verification.
Private & Confidential Page 143 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
9.3.3. Exception & Error Handling
Designed to ensure processing continuity without total system failure.
A. Exception Queue Isolation
Failed records:
• Moved to Exception Queue
• Do NOT block entire batch
• Tagged with error category
Supports high-volume processing resilience.
B. Backend Error Detection
Error types include:
• Format error
• Business rule violation
• Missing ID (IC / Majikan ID)
• Invalid Wakalah eligibility
• Deadline breach
Errors categorized automatically.
C. Cheque Bounce Handling (Cek Tendang)
If cheque rejected:
• Transaction status updated
• Temporary receipt invalidated
• Exception raised
• Reconciliation triggered
Protects financial exposure.
D. Majikan Null Detection
If SPG file contains unknown Employer ID:
• Triggers “New Employer Registration Workflow”
• Record placed in Pending queue
Prevents orphan records.
E. Retry Mechanism
System allows:
Private & Confidential Page 144 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Controlled re-processing
• Automatic retry via Cronjob
• Manual retry by Processor
Ensures recoverability.
F. Cronjob Auto-Detection
Scheduled jobs:
• Detect unprocessed records
• Detect stuck transactions
• Trigger alert notifications
Prevents silent failure.
9.3.4. Reconciliation
Ensures cross-system financial alignment.
A. Auto-Reconciliation With:
• Bank settlement files
• SPG Portal
• eMajikan Portal
• Counter transactions
• Ejen portal
Matching parameters:
• Reference ID
• Amount
• Timestamp
• Channel
B. Reconciliation Status
Each transaction tagged as:
Pending / Success / Failed / Variance
C. Variance Detection
Detects:
• Amount mismatch
• Missing transaction
• Duplicate settlement
Triggers investigation workflow.
Private & Confidential Page 145 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
D. Manual Reconciliation Override
Supervisor may:
• Force-match
• Add reason code
• Log justification
Fully audited.
E. Full Reconciliation Log History
All reconciliation actions logged with:
• User ID
• Timestamp
• Before/After state
Supports audit and forensic review.
9.3.5. Workflow & Escalation
Operational governance engine.
A. Round Robin Task Assignment
Distributes workload evenly to:
• Processors
• Finance reviewers
Prevents bottlenecks.
B. Processor Workload Monitoring
Dashboard shows:
• Tasks assigned
• Tasks completed
• Backlog count
Supports KPI management.
C. Batch Distribution Automation
Automatically splits large batches for parallel processing.
D. Escalation Rule Configuration
Triggers when:
• SLA breached
• Task idle too long
• Refund pending beyond limit
Private & Confidential Page 146 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Escalates to Supervisor.
E. Status Tracking Per Case
Each case displays:
• Current stage
• Assigned user
• Processing timeline
Provides full transparency.
F. Supervisor Approval Workflow
Multi-level approval for:
• Refund
• Adjustment
• Commission
• Late reconciliation
Role-based enforcement.
9.3.6. Refund & Adjustment
Financial correction module with strong control.
A. Refund Request Workflow
Flow:
Request → Upload Proof → Validation → Supervisor Approval → Finance → Bank
Payment
B. Routing to Finance (Accounts Payable)
Approved refund:
• Sent to SAP/AP
• Await payment confirmation
Ensures financial segregation of duties.
C. Refund Processing via Bank / FPX
Supports:
Private & Confidential Page 147 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Bank transfer
• FPX reversal
Status updated automatically.
D. Backdated Correction with Reason Code
Mandatory:
• Reason Code
• Supervisor Approval
• Audit log
No silent changes allowed.
E. Full Refund Audit Trail
Logs:
• Who requested
• Who approved
• Amount
• Date
• Bank reference
Audit ready.
9.3.7. Commission Processing
Automated agent commission management.
A. Commission Rule Configuration
Supports:
• Percentage-based
• Tier-based
• Category-based
Dynamic rule configuration.
B. Commission Calculation Engine
Calculates based on:
• Confirmed transactions only
• Eligible channel
• Time period
C. Commission Reversal Logic
Private & Confidential Page 148 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
If transaction canceled:
• Commission reversed automatically
• Adjustment recorded
D. Commission Reconciliation
Matches:
• Commission vs Collection
• Commission vs Reversal
Commission Audit Log
Tracks:
• Calculation date
• Rule version
• Approval user
Prevents dispute.
9.3.8. Logging & Monitoring
Ensures full backend observability.
A. Full Backend Process Logging
Logs:
• Ingestion
• Processing
• Reconciliation
• Refund
• Commission
Structured and searchable.
B. Cronjob Scheduling & Configuration
Configurable frequency:
• Settlement processing
• Auto-reconciliation
• Retry job
C. Retry Mechanism for Failed Jobs
Supports:
Private & Confidential Page 149 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Auto retry
• Manual retry
• Alert escalation
D. Processing Failure Notification
Alerts via:
• Email
• System notification
• SMS (if configured)
E. Prevention of Duplicate Backend Execution
Uses:
• Job locking mechanism
• Unique job ID
• Concurrency control
F. Backend Health Monitoring Dashboard
Displays:
• System uptime
• Queue backlog
• Failure rate
• SLA compliance
• Integration health
Supports proactive governance.
9.3.9. Summary
The Back-End Processing function is:
ACID compliant
Fully auditable
Financially controlled
Exception resilient
Workflow governed
Reconciliation driven
Integration ready
Enterprise scalable
It ensures every transaction across Counter, SPG, Portal, PSP, Bank, and SAP
is:
Validated → Processed → Matched → Approved → Integrated → Audited.
Private & Confidential Page 150 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
9.4. Module
9.4.1. Module 1: Data Ingestion & Validation
This module acts as the controlled entry gate of the system, ensuring only
clean, compliant, and validated data proceeds to financial processing.
Scope Includes:
• Multi-source intake (Portal, Admin Upload, SFTP, API, Email extraction)
• IDD (Integrated Data Dictionary) validation
• Header vs Detail tally check
• File format & structure verification
• Duplicate transaction detection
Key Capabilities:
• Ensures structured file compliance before processing
• Rejects corrupted, tampered, or invalid files automatically
• Validates financial integrity (Header amount = Sum of Detail records)
• Detects duplicate reference numbers, duplicate batches, and
replayed transactions
• Supports real-time ingestion for PSP with instant “Pending
Settlement” creation
Outcome:
Prevents garbage-in processing, ensures financial integrity from the point of
entry.
9.4.2. Module 2: Core Financial Processing
This module represents the financial engine of the system, operating under
strict ACID compliance principles.
Scope Includes:
• Batch processing
• ACID rollback mechanism
• Transaction lifecycle management
• Pending settlement handling
Key Capabilities:
• All-or-nothing batch execution (rollback if partial failure)
• Full transaction lifecycle: Pending → Confirmed → Failed → Reversed →
Refunded
Private & Confidential Page 151 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Automatic generation of unique transaction references
• Prevention of double posting and duplicate ledger entries
• Controlled backdated adjustments (Supervisor-level access only)
Outcome:
Guarantees accounting accuracy, data durability, and financial reliability.
9.4.3. Module 3: Exception & Queue Management
Designed to ensure processing resilience without full system interruption.
Scope Includes:
• Exception queue isolation
• Backend error detection
• Cheque bounce (Cek Tendang) logic
• Retry mechanism
Key Capabilities:
• Isolates problematic records without blocking entire batch
• Detects format errors, business rule violations, missing IDs
• Handles cheque rejection lifecycle with automated status update
• Provides controlled retry processing
• Cronjob auto-detection for stuck or unprocessed records
Outcome:
Ensures continuity, operational stability, and minimal downtime impact.
9.4.4. Module 4: Reconciliation Engine
The Reconciliation Engine ensures cross-system financial alignment and
accuracy.
Scope Includes:
• Auto reconciliation (Bank / SPG / eMajikan / Counter / Ejen)
• Variance detection
• Manual override control
• Full reconciliation logs
Key Capabilities:
• Automated matching based on reference, amount, timestamp
• Variance detection for amount mismatch or missing entries
• Controlled manual reconciliation override (Supervisor-level with
reason code)
• Full reconciliation history for audit and forensic analysis
Private & Confidential Page 152 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Outcome:
Eliminates financial mismatch risk and strengthens financial governance.
9.4.5.Module 5: Workflow & Escalation
This module governs task distribution, monitoring, and approval hierarchy.
Scope Includes:
• Round Robin distribution
• Processor monitoring dashboard
• Approval workflow
• SLA tracking
Key Capabilities:
• Automatic workload distribution to prevent bottlenecks
• Processor performance monitoring
• Multi-level approval workflows (Refund, Adjustment, Commission)
• SLA breach detection and escalation rules
• Case status tracking with full audit trail
Outcome:
Improves operational efficiency, accountability, and governance control.
9.4.6. Module 6: Refund & Adjustment
A controlled financial correction framework ensuring segregation of duties
and audit compliance.
Scope Includes:
• Refund routing to HQ Finance
• Multi-level approval
• Refund processing (Bank / FPX)
• Backdated adjustment control
Key Capabilities:
• Structured workflow: Request → Approval → Finance → Payment
• Integration with Accounts Payable (SAP)
• Mandatory reason code for adjustments
• Refund status lifecycle tracking
• Full audit trail logging
Outcome:
Prevents unauthorized refund activity and ensures financial compliance.
Private & Confidential Page 153 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
9.4.7.Module 7: Commission Engine
Automates and governs commission lifecycle with complete transparency.
Scope Includes:
• Commission rule configuration
• Commission calculation engine
• Reversal logic
• Approval workflow
• Audit logging
Key Capabilities:
• Dynamic rule-based commission configuration
• Calculation based on confirmed transactions only
• Automatic commission reversal upon cancellation
• Commission reconciliation against collection
• Detailed audit logging for dispute resolution
Outcome:
Ensures fair, accurate, and controlled commission management.
9.4.8. Module 8: Monitoring & Cronjob
Provides system observability and automated backend control mechanisms.
Scope Includes:
• Scheduled processing
• Auto-detection of unprocessed records
• Retry logic
• Backend alert notification
Key Capabilities:
• Configurable cronjob scheduling
• Automatic detection of processing failures
• Controlled retry mechanism
• Duplicate job execution prevention
• Real-time backend health monitoring dashboard
• Notification alerts (Email/System) for failures
Outcome:
Ensures system stability, high availability, and proactive issue resolution.
Private & Confidential Page 154 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
9.4.9. Summary
The Back-End Processing architecture is:
• ACID compliant
• Fully auditable
• Exception resilient
• Financially controlled
• SLA governed
• Integration-ready
• Scalable for high-volume processing
It acts as the central governance engine that ensures every transaction across
Counter, SPG, Portal, Bank, PSP, and SAP is validated, processed, reconciled,
approved, and audited in a controlled and secure manner.
9.5. Risk
Back-End Processing carries high financial and operational impact. The following risks
are identified together with mitigation approach embedded within the system
architecture.
9.5.1. Large-Scale Batch Processing Failure
Risk:
Failure during high-volume batch processing may delay settlement,
reconciliation, or commission calculation.
Impact:
• Transaction backlog
• Financial reporting delay
• Operational KPI breach
Mitigation Built-In:
• ACID-compliant batch engine with rollback capability
• Exception queue isolation (non-blocking processing)
• Cronjob retry mechanism
• Backend health monitoring dashboard
• Auto-alert notification for failed jobs
Private & Confidential Page 155 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
9.5.2. Partial Transaction Commit (Data Corruption Risk)
Risk:
System crash or interruption during batch execution may result in partial data
commit.
Impact:
• Ledger inconsistency
• Financial misstatement
• Reconciliation failure
Mitigation Built-In:
• Full ACID transaction control
• Rollback on incomplete processing
• Atomic batch commit policy
• Double-posting prevention mechanism
9.5.3. Duplicate Ingestion from Multiple Channels
Risk:
Same transaction received via Portal, API, SFTP, or email ingestion.
Impact:
• Double posting
• Incorrect commission calculation
• Reconciliation mismatch
Mitigation Built-In:
• Unique transaction reference validation
• Cross-channel duplicate detection engine
• Hash-based file fingerprint validation
• Idempotent API design
9.5.4. Settlement Mismatch with Bank Files
Risk:
Difference between internal system records and bank settlement files.
Impact:
• Financial variance
• Audit findings
• Trust & compliance issues
Mitigation Built-In:
• Automated reconciliation engine
Private & Confidential Page 156 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Variance detection logic
• Pending settlement lifecycle control
• Controlled manual override with reason code
• Full reconciliation log history
9.5.5. Unauthorized Refund or Adjustment
Risk:
Improper or fraudulent refund processing.
Impact:
• Financial loss
• Compliance breach
• Audit exposure
Mitigation Built-In:
• Multi-level approval workflow
• Segregation of duties (Processor / Supervisor / Finance)
• Mandatory reason code
• Full refund audit trail
• SAP integration verification
9.5.6. Processing Bottleneck (High Volume)
Risk:
Heavy transaction load causing delayed processing.
Impact:
• SLA breach
• Backlog accumulation
• Operational slowdown
Mitigation Built-In:
• Round Robin batch distribution
• Processor workload dashboard
• Queue-based architecture
• Horizontal scalability readiness
• Event-driven ingestion capability
9.5.7. Cronjob Failure Undetected
Risk:
Scheduled processing fails silently.
Private & Confidential Page 157 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Impact:
• Missed settlement
• Incomplete reconciliation
• Undetected processing gap
Mitigation Built-In:
• Cronjob monitoring engine
• Failure notification alerts
• Auto-retry logic
• Health check dashboard
• Duplicate job execution prevention
9.5.8. Manual Reconciliation Override Misuse
Risk:
Improper manual reconciliation adjustment.
Impact:
• Hidden financial discrepancy
• Governance breach
Mitigation Built-In:
• Supervisor-level access only
• Mandatory reason code
• Dual-approval (if required)
• Complete override audit logging
• Exception review dashboard
9.5.9. Commission Miscalculation
Risk:
Incorrect commission due to rule misconfiguration or transaction status error.
Impact:
• Financial dispute
• Overpayment / underpayment
• Agent dissatisfaction
Mitigation Built-In:
• Rule-based commission configuration
• Completed-transaction-only calculation policy
• Commission reversal automation (if cancellation occurs)
• Commission reconciliation report
• Commission audit log
Private & Confidential Page 158 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
9.5.10. Overall Risk Posture
The Back-End Processing environment is designed with:
• Preventive controls (validation, ACID, duplicate detection)
• Detective controls (reconciliation, variance detection, monitoring
dashboard)
• Corrective controls (rollback, retry, exception queue, approval
workflow)
• Governance controls (segregation of duties, audit trail, reason code
enforcement)
This layered risk mitigation approach ensures high financial integrity,
operational stability, and audit compliance across large-scale transaction
environments.
9.6. Security
The Back-End Processing environment manages high-volume financial transactions
and sensitive personal data. The architecture is designed with layered security
controls to ensure confidentiality, integrity, availability, and strict financial
governance.
9.6.1. Strict RBAC (Processor / Supervisor / Finance / Admin Segregation)
Implements structured Role-Based Access Control with clear segregation of
duties:
• Processor – Data processing & exception handling only
• Supervisor – Approval authority & override control
• Finance – Refund & accounting integration oversight
• Admin – System configuration (no financial posting authority)
Access is granted based on least-privilege principle. No single role can process
and approve the same financial adjustment.
9.6.2. ACID-Compliant Transaction Control
All financial transactions follow ACID principles:
• Atomicity – No partial commits
• Consistency – Ledger balance enforcement
• Isolation – Concurrent batch protection
Private & Confidential Page 159 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Durability – Permanent transaction persistence
Prevents data corruption and financial misstatement.
9.6.3. Full Audit Trail for All Backend Operations
Every backend action is logged including:
• User ID
• Role
• Timestamp
• IP (if required)
• Before/After state
• Reason code (if applicable)
Covers:
• Processing
• Refund
• Adjustment
• Reconciliation override
• Commission approval
Ensures audit readiness and forensic traceability.
9.6.4. Mandatory Reason Code for Adjustments
Any financial adjustment requires:
• Structured reason code selection
• Supervisor-level approval
• Logged justification
No silent changes permitted. All adjustments are fully traceable.
9.6.5. Duplicate Prevention Logic
(Transaction Hash / Reference Validation)
Implements multiple layers of duplicate detection:
• Unique transaction reference enforcement
• Hash fingerprint comparison
• Idempotent API logic
• Cross-channel duplicate detection
Prevents double posting and duplicate settlement.
Private & Confidential Page 160 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
9.6.6. Encrypted File Transfer (SFTP / HTTPS / TLS)
All data transmissions are secured through:
• Secure SFTP for file transfers
• HTTPS/TLS encryption for web-based transactions
• API encryption with TLS
Prevents interception and unauthorized data exposure.
9.6.7. Secure API Authentication (Token / OAuth)
All system integrations are protected via:
• Token-based authentication
• OAuth protocol (if applicable)
• API key validation
• IP whitelisting (optional)
Ensures only authorized systems can submit or retrieve data.
9.6.8. Multi-Level Approval for Refund & Adjustment
Refund and adjustment processes require:
• Structured workflow routing
• Multi-level approval hierarchy
• Finance validation before disbursement
• Integration confirmation with SAP/AP
Enforces segregation of duties and prevents unauthorized payout.
9.6.9. Reconciliation Variance Control Enforcement
System blocks reconciliation completion if:
• Variance detected
• Missing settlement
• Mismatch in amount
Manual override requires supervisor authorization and reason logging.
9.6.10. Data Masking for Sensitive Fields (IC / Passport)
Sensitive personal data is masked:
• IC displayed partially (e.g., ****--1234)
• Passport partially hidden
• Full data accessible only to authorized roles
Ensures PDPA compliance and privacy protection.
Private & Confidential Page 161 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
9.6.11. Cronjob Execution Logging & Monitoring
All automated backend jobs are:
• Logged with execution timestamp
• Monitored for success/failure
• Alert-triggered upon failure
• Protected from duplicate execution
Prevents silent failure in scheduled processing.
9.6.12. Segregation Between Processing & Approval Roles
Enforces structural separation:
• Processor cannot approve own adjustment
• Finance cannot modify ingestion data
• Admin cannot alter financial records
• Approval and execution roles are separated
Ensures governance integrity and reduces fraud exposure.
9.6.13. Security Posture Summary
The Back-End Processing security framework provides:
• Layered access control
• Financial integrity enforcement
• End-to-end encryption
• Duplicate prevention mechanisms
• Multi-level approval governance
• Full audit traceability
• PDPA-compliant data protection
• Automated monitoring & alerting
This ensures a secure, compliant, and enterprise-grade processing environment
capable of handling high-volume financial operations with confidence and audit
readiness.
9.7. Conclusion
The Back-End Processing Function is the financial backbone of the entire ecosystem.
It ensures:
• Data integrity
• Financial accuracy
Private & Confidential Page 162 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Reconciliation transparency
• Controlled exception handling
• Structured workflow governance
• Secure refund & commission management
• Real-time + batch operational resilience
By combining automation, strict validation rules, reconciliation intelligence, workflow
governance, and audit compliance, this module guarantees that every Ringgit collected
is:
✓ Validated
✓ Processed correctly
✓ Reconciled
✓ Approved under governance
✓ Logged for audit
✓ Integrated with Finance
This ensures operational excellence, financial integrity, and regulatory compliance at
enterprise scale.
Private & Confidential Page 163 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
10. Function For SAP Re-conciliation
10.1.Overview
SAP Reconciliation ensures full financial alignment between the Zakat Collection
System and SAP Finance.
Its primary objective is to guarantee that:
• Every posted transaction in the collection system is accurately reflected in SAP.
• No duplication (Z1 issue) occurs.
• No unmatched or uncleared entry remains without traceability.
• All GL postings comply with SAP structure and financial governance.
This function acts as the final financial control layer between operational transactions
and the official accounting ledger. It ensures:
• Accuracy.
• Integrity.
• Audit readiness.
• Compliance with SAP financial standards.
Private & Confidential Page 164 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
10.2. Solution Component
10.2.1. Application Layer
The Application Layer provides visibility, control, and governance for all SAP
reconciliation activities. It ensures Finance and Supervisory teams can monitor,
validate, and intervene where necessary without compromising accounting
integrity.
A. SAP Reconciliation Monitoring Console
This is the centralized command center for SAP reconciliation activities.
Functions include:
• Real-time posting status visibility (Posted / Pending / Failed /
Variance).
• Batch-level reconciliation monitoring.
• Drill-down from summary to transaction level.
• Identification of unmatched or partially cleared transactions.
• Cross-year reconciliation tracking.
This console ensures Finance does not rely solely on SAP logs but has an
operational control layer
B. GL Posting Status Dashboard
Provides real-time GL posting analytics.
Displays:
• Total transactions sent to SAP.
• Successful vs failed postings.
• Duplicate prevention flags (Z1 control).
• Posting delay alerts.
• Document type distribution (Z1, ZR, 21, etc.).
It acts as an early warning system for financial posting anomalies.
C. Clearing & Assignment Reference Monitoring Screen
Dedicated screen to monitor clearing performance.
Key capabilities:
• Validate Assignment Reference = No. Rujukan Bayaran.
• Monitor uncleared entries.
• Detect auto-clearing failure.
• Highlight mismatched references.
• Track aging of uncleared GL items.
Private & Confidential Page 165 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
If clearing fails due to mismatch, the system flags the record immediately.
D. Variance & Exception Analysis Panel
This screen isolates reconciliation discrepancies.
Includes:
• Amount mismatch detection.
• Partial posting identification.
• Bank vs System variance comparison.
• Over-posting / Under-posting detection.
• Tolerance control monitoring.
Finance can analyze root causes without stopping batch processing.
E. Finance Approval & Adjustment Screen
Controlled interface for correction actions.
Capabilities:
• Approve reversal (ZR posting).
• Approve adjustment entries.
• Mandatory reason code entry.
• Multi-level approval workflow.
• Track adjustment lifecycle.
Ensures no financial correction occurs without governance.
F. Reconciliation History & Audit Viewer
Complete historical traceability of reconciliation activities.
Provides:
• Posting history.
• Clearing attempts log.
• Adjustment records.
• User activity log.
• Timestamp & system-generated trace ID.
Designed for audit, compliance, and forensic investigation.
10.2.2. Core Engines
The Core Engines ensure reconciliation integrity at system level. These engines
enforce accounting correctness, prevent duplication, and guarantee ACID-level
financial control.
Private & Confidential Page 166 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
A. SAP Integration Engine (API/File-based)
Handles structured data exchange with SAP FI.
Supports:
• API-based posting (real-time).
• File-based batch integration (IDoc/Flat File).
• Retry mechanism.
• Posting acknowledgment validation.
• Callback confirmation processing.
Ensures data delivery reliability and traceability.
B. GL Posting Validation Engine
Validates financial configuration before posting.
Checks:
• Company Code (e.g., KTPN).
• G/L Account mapping.
• Posting Key validation (40/50).
• Profit Center & Segment compliance.
• Journal Entry Type enforcement.
Blocks posting if configuration mismatch detected.
C. Assignment Reference Matching Engine
Ensures clearing success in SAP.
Functions:
• Validate Assignment Reference consistency.
• Prevent mismatch between SAP and Collection System.
• Detect formatting inconsistency.
• Trigger correction workflow if mismatch detected.
Critical to ensure automated clearing works.
D. Clearing Control Engine
Monitors and validates clearing activities.
Capabilities:
• Detect uncleared entries.
• Auto-clearing validation.
• Clearing aging tracking.
• Block final reconciliation if clearing incomplete.
Guarantees accurate ledger balance.
Private & Confidential Page 167 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
E. Duplicate Prevention Engine (Z1 Control)
Prevents duplicate SAP posting.
Mechanism includes:
• Transaction hash validation.
• Reference number uniqueness control.
• SAP document number tracking.
• Posting flag enforcement.
Prevents "Z1 Double" financial risk.
F. Variance Detection Engine
Automatically detects financial inconsistencies.
Detects:
• Amount mismatch.
• Bank settlement mismatch.
• Partial posting.
• Cross-year imbalance.
• Currency rounding variance.
Triggers exception isolation without blocking other transactions.
G. Adjustment & Reversal Engine
Handles controlled correction.
Supports:
• Reversal via ZR document type.
• Adjustment posting with audit reference.
• Backdated correction control.
• Approval workflow enforcement.
Ensures correction without data manipulation.
H. Reconciliation Audit Engine
Maintains full backend audit trace.
Logs:
• Posting attempts.
• Retry actions.
• Approval decisions.
• Manual overrides.
• Variance resolution.
Supports regulatory and internal audit requirements.
Private & Confidential Page 168 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
10.2.3. Integration Layer
The Integration Layer ensures structured communication between operational
systems, financial systems, and banking channels.
A. SAP FI (Finance) – GL & Clearing
Core financial system integration.
Touchpoints include:
• GL Posting (Debit/Credit).
• Clearing validation.
• Reversal posting.
• Profit Center mapping.
• Journal document tracking.
Supports minimum 10 integration points as per financial governance
requirement.
B. Bank Statement Interface
Ingests bank settlement files.
Supports:
• Multi-bank format.
• IDD-compliant structure.
• Transaction description extraction.
• Date tolerance validation.
• Approval code matching.
Ensures accurate bank reconciliation.
C. Payment Gateway / FPX Integration
Real-time gateway reconciliation.
Features:
• Pending settlement creation.
• Approval code matching.
• Gateway callback validation.
• Real-time status synchronization.
Reduces settlement uncertainty.
D. Counter & SPG Backend System
Synchronizes operational transaction data.
Private & Confidential Page 169 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Ensures:
• Transaction reference consistency.
• Cross-channel reconciliation.
• Status lifecycle alignment.
• Aggregation control (Lump Sum vs Detail).
Prevents misalignment between front-end and finance.
E. SFTP / API / Middleware (if required)
Flexible integration architecture.
Supports:
• Secure file transfer (SFTP).
• REST API integration.
• Middleware orchestration (ESB).
• ETL transformation layer.
• Event-driven messaging (if implemented).
Ensures scalability and resilience.
F. Conclusion
The SAP Reconciliation architecture is not merely a posting interface — it
is a full financial control framework.
It ensures:
• Clean GL posting.
• Accurate clearing.
• Zero duplication risk.
• Controlled reversal process.
• Real-time variance detection.
• Full audit traceability.
This structure guarantees financial integrity, audit compliance, and
accounting accuracy across all integrated systems.
10.3. Function of the system
10.3.1. GL Posting Validation
GL Posting Validation acts as the first financial control checkpoint before any
transaction is transmitted to SAP FI.
Key Controls
Private & Confidential Page 170 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
A. Company Code Consistency (e.g., KTPN)
Every posting must match the configured Company Code.
The system automatically verifies that the Company Code used in the
integration file aligns with the predefined finance configuration.
If mismatch detected → posting is blocked immediately.
B. G/L Account Mapping Validation (e.g., 2210442)
Each transaction type (Zakat Harta, Pendapatan, Perniagaan, etc.) must
map to the correct G/L Account.
The engine validates:
• Account existence
• Account activation status
• Zakat category alignment
Prevents incorrect ledger classification.
C. Posting Key Validation (40 Debit / 50 Credit)
The system enforces SAP standard posting key structure:
• 40 → Debit (Bank / Receipt)
• 50 → Credit (Revenue / Agihan / Adjustment)
Incorrect posting key → automatic rejection before transmission.
D. Profit Center & Segment Tagging
All financial entries must contain valid Profit Center and Segment values
to support management reporting and internal cost allocation.
Missing or invalid tagging → posting blocked.
• Journal Entry Type Validation (Z1, ZR, 21)
The system validates document type usage:
• Z1 → Standard Zakat transaction
• ZR → Reversal
• 21 → Standard financial transaction
Improper document type → prevents submission.
Control Outcome
If any configuration mismatch is detected, the system blocks posting
before SAP integration.
This ensures:
Private & Confidential Page 171 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• No invalid journal entry reaches SAP
• No post-facto correction required
• Financial integrity maintained at source
10.3.2. Assignment Reference & Clearing Control
Assignment Reference is the core element for SAP auto-clearing.
Core Logic
A. Assignment Reference = No. Rujukan Bayaran
The system enforces strict equality between:
• Assignment Reference (SAP field)
• No. Rujukan Bayaran (Collection system)
This enables automatic clearing during reconciliation.
B. Prevent Mismatch That Blocks Clearing
Even minor formatting inconsistencies (spacing, truncation, case
mismatch) are detected and corrected before posting.
C. Auto-Clearing Support
If reference is correct, SAP clearing executes automatically without
manual intervention.
D. Monitor Uncleared Entries
The system continuously tracks:
• Uncleared GL entries
• Clearing aging
• Partial clearing events
•
E. Alert if Clearing Fails
If clearing fails:
• System flags entry
• Moves record to exception queue
• Notifies finance dashboard
Control Outcome
Private & Confidential Page 172 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Clearing failure due to reference mismatch is detected early and isolated
without affecting other transactions.
10.3.3. Duplicate Prevention (Z1 Double Control)
Duplicate SAP posting can cause severe financial misstatement.
This module ensures zero duplication.
Prevention Mechanisms
A. Transaction Hash Validation
System generates unique hash based on:
• Reference number
• Amount
• Date
• Transaction source
Duplicate hash → posting blocked.
B. SAP Document Number Tracking
Every successful posting stores SAP Document Number locally.
Re-post attempt using same reference triggers automatic rejection.
C. Posting Flag Mechanism
Transaction marked as:
• Not Posted
• Posted
• Reversed
Only transactions marked "Not Posted" are eligible for posting.
D. Block Re-Posting of Identical Transaction
Even if user retries manually, system enforces duplication barrier.
Control Outcome
Prevents:
• Z1 Double issue
• Duplicate financial impact
• Incorrect revenue inflation
Private & Confidential Page 173 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
10.3.4. Reconciliation with Bank Statement
This module aligns internal transaction records with bank settlement data.
Matching Hierarchy
Primary matching methods:
1. No. Rujukan Bayaran
2. Approval Code (Card Transaction)
3. Cheque Number (6-digit reference)
4. Date + Amount (Fallback)
A. Date Tolerance Control
Allows difference between:
• Posting Date (System)
• Bank Value Date
Within configurable tolerance window.
B. Auto Classification
Transactions automatically categorized as:
• Matched
• Unmatched
• Variance
Unmatched items routed to exception queue.
Control Outcome
Ensures bank settlement reconciliation is:
• Automated
• Structured
• Audit traceable
10.3.5. Bulk Handling & GL Aggregation
Supports both operational detail and financial aggregation requirements.
Accounting Model
A. Lump Sum Posting (Total vs Detail)
• Debit GL Bank → Total batch amount
• Credit GL Hasil → Detailed by zakat type
Example:
Bank Debit: RM100,000 (Batch total)
Credit:
Private & Confidential Page 174 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Zakat Pendapatan RM60,000
• Zakat Perniagaan RM40,000
•
B. Ensure Tally Equals Bank Statement
Before posting:
Total Debit = Total Credit
Total Batch = Bank Statement Amount
Mismatch → posting blocked.
Control Outcome
Supports:
• Detailed reporting
• Simplified bank reconciliation
• Accurate GL structure
10.3.6. Variance & Exception Detection
Automated anomaly detection layer.
Detects:
• Amount mismatch
• Missing SAP document
• Partial posting
• Unmatched settlement
• Abnormal GL behavior (unusual spike)
Status Classification
• Pending
• Matched
• Variance
• Failed
Variance items isolated without blocking full batch.
Control Outcome
Prevents unnoticed financial imbalance.
10.3.7. Reversal & Adjustment Control
Handles financial correction with governance.
Controls
Private & Confidential Page 175 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
A. Controlled Reversal Using ZR Document Type
Reversal always performed via standard SAP mechanism.
B. Mandatory Reason Code
User must input valid reason code before adjustment.
C. Supervisor / Finance Approval Required
No self-approval allowed.
D. Full Audit Trail
Logs:
• Who reversed
• Why
• When
• Original reference
Control Outcome
Ensures correction without compromising audit integrity.
10.3.8. Reporting & Monitoring
Provides real-time financial visibility.
Key Dashboards
• SAP Posting Status Dashboard
• Matched vs Unmatched Summary
• Clearing Success Rate
• Variance Aging Report
• Duplicate Attempt Log
• Exception Resolution KPI
Export Capability
Supports:
• PDF
• Excel
• Audit-ready format
Operational Benefit
Finance team gains:
• Immediate reconciliation insight
• Performance visibility
Private & Confidential Page 176 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Compliance assurance
10.3.9. Summary
The SAP Reconciliation function is a financial governance control framework, not
merely a posting interface.
It ensures:
• Accurate GL posting
• Guaranteed clearing integrity
• Zero duplicate posting
• Controlled adjustment process
• Structured bank reconciliation
• Full audit transparency
This architecture protects financial data integrity, supports audit compliance,
and ensures seamless integration between operational systems and SAP FI.
10.4. Module
10.4.1. Module 1: GL Posting & Validation
A. Objective
To ensure that every transaction posted into SAP is structurally correct,
financially accurate, and compliant with configured finance rules before
it impacts the General Ledger.
B. Company Code & Structural Validation
This sub-module validates all core SAP structural elements before
posting.
Functions include:
• Validate Company Code (e.g., KTPN) against configured SAP
environment.
• Validate Profit Center to ensure proper internal cost allocation.
• Validate Segment for management reporting consistency.
• Validate Business Area (if applicable).
• Prevent posting if any structural element is missing or invalid.
Private & Confidential Page 177 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Control Outcome:
Prevents financial misclassification and incorrect ledger impact.
C. G/L Mapping & Posting Key Control
This sub-module governs the accounting structure of debit and credit
entries.
Functions include:
• Map zakat type (Pendapatan, Perniagaan, Harta, etc.) to correct G/L
Account (e.g., 2210442).
• Validate that G/L Account exists and is active in SAP.
• Enforce Posting Key logic (40 for Debit / 50 for Credit).
• Validate journal document type (Z1 for normal posting, ZR for
reversal, 21 for other financial entry).
• Block transaction if debit-credit pairing is unbalanced.
Control Outcome:
Ensures accounting correctness before data reaches SAP.
D. Assignment Reference Control
Assignment Reference is critical for SAP clearing success.
Functions include:
• Ensure Assignment Reference equals No. Rujukan Bayaran.
• Validate format consistency to prevent clearing mismatch.
• Prevent posting if reference format deviates from defined
standard.
• Normalize reference structure where necessary.
Control Outcome:
Guarantees clearing readiness and prevents reconciliation failure.
10.4.2. Module 2: Clearing & Matching Engine
A. Objective
To ensure that posted entries are successfully cleared in SAP and that
uncleared items are monitored proactively.
B. Auto-Clearing Validation
After posting, this sub-module verifies clearing status.
Functions include:
Private & Confidential Page 178 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Confirm clearing document creation.
• Validate clearing status update in SAP.
• Detect partial clearing scenarios.
• Trigger alert if auto-clearing fails.
Control Outcome:
Reduces manual intervention and improves financial closing efficiency.
C. Clearing Monitoring & Aging
Monitors uncleared GL entries over time.
Functions include:
• Identify uncleared items.
• Categorize aging (0–7 days, 8–30 days, 30+ days).
• Escalate long-standing uncleared entries.
• Provide dashboard visibility for finance.
Control Outcome:
Prevents accumulation of unresolved financial items.
D. Tolerance Logic Control
Allows configurable flexibility without compromising accuracy.
Functions include:
• Configure acceptable date difference (Posting Date vs Bank Date).
• Allow minor rounding tolerance (if approved by finance policy).
• Prevent false variance classification.
Control Outcome:
Balances accuracy with operational practicality.
10.4.3. Module 3: Bank Reconciliation Engine
A. Objective
To automate reconciliation between internal system transactions and
bank statement data.
B. Multi-Parameter Matching
Implements structured matching hierarchy.
Matching logic includes:
• No. Rujukan Bayaran
• Approval Code (Card transaction)
Private & Confidential Page 179 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Cheque Number (6-digit reference)
• Date + Amount fallback method
Control Outcome:
Maximizes matching success while minimizing manual reconciliation.
C. Variance Detection
Automatically detects financial inconsistencies.
Functions include:
• Detect amount mismatch.
• Detect partial settlement.
• Detect missing SAP document.
• Identify over-posting or under-posting.
• Classify transaction as Pending / Matched / Variance / Failed.
Control Outcome:
Prevents unnoticed financial discrepancies.
D. Unmatched Isolation
Ensures unmatched records do not disrupt batch integrity.
Functions include:
• Move unmatched items into structured exception queue.
• Prevent unmatched entries from blocking successful matches.
• Provide investigation workflow routing.
Control Outcome:
Ensures operational continuity with controlled exception handling.
10.4.4. Module 4: Duplicate & Z1 Prevention
A. Objective
To eliminate risk of duplicate posting into SAP (Z1 double issue).
B. Transaction Hash Engine
Generates unique fingerprint for each transaction.
Functions include:
• Hash creation based on reference, amount, date, and source.
• Detect identical transaction repost attempts.
• Automatically block duplicate submission.
Private & Confidential Page 180 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Control Outcome:
Prevents financial duplication at system level.
C. SAP Document Tracking
Maintains traceability of posted documents.
Functions include:
• Store SAP Document Number after successful posting.
• Verify posting status before retry attempt.
• Prevent reposting of already posted transaction.
Control Outcome:
Ensures one-to-one transaction-to-SAP-document relationship.
D. Posting Flag Controller
Controls posting lifecycle.
Statuses include:
• Not Posted
• Posted
• Reversed
Only transactions with “Not Posted” status can proceed.
Control Outcome:
Prevents accidental double execution.
10.4.5. Module 5: Adjustment & Reversal Control
A. Objective
To provide structured and auditable financial correction mechanism.
B. Reversal Workflow
Handles correction using SAP-compliant method.
Functions include:
• Reverse using ZR document type.
• Link reversal to original posting.
• Maintain reversal reference trace.
Control Outcome:
Ensures correction without deleting financial history.
C. Reason Code Enforcement
Private & Confidential Page 181 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Mandatory justification mechanism.
Functions include:
• Require predefined reason code.
• Prevent reversal without reason input.
• Log reason permanently in audit record.
Control Outcome:
Prevents arbitrary financial modification.
D. Multi-Level Approval
Enforces segregation of duties.
Workflow:
Supervisor Initiates → Finance Approves → System Executes
No self-approval permitted.
Control Outcome:
Ensures governance and fraud prevention.
E. Audit Logging
Maintains full transparency.
Logs include:
• Initiator ID
• Approver ID
• Timestamp
• Original reference
• Reason code
Control Outcome:
Supports internal and external audit compliance.
10.4.6. Module 6: Monitoring & Reporting
A. Objective
To provide real-time visibility of reconciliation health and financial
performance.
B. Posting Status Dashboard
Displays:
• Posted
• Failed
Private & Confidential Page 182 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Pending
• Reversed
Includes batch-level summary and trend visualization.
C. Reconciliation KPI Monitoring
Tracks:
• Clearing success rate
• Variance percentage
• Unmatched ratio
• Average reconciliation resolution time
D. Variance Aging Report
Categorizes unresolved variance by aging.
Supports financial month-end closing and audit review.
E. Duplicate Attempt Log
Records all blocked duplicate posting attempts.
Provides forensic investigation support.
F. Export & Audit Viewer
Allows export of:
• Posting report
• Variance report
• Clearing summary
• Adjustment history
Formats: PDF / Excel (Audit-ready)
G. Summary
The SAP Reconciliation Modules together form a comprehensive
financial governance control framework that ensures:
• Valid and compliant GL posting
• Reliable clearing
• Accurate bank reconciliation
• Zero duplicate posting risk
• Controlled financial correction
• Complete audit traceability
Private & Confidential Page 183 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
This structured module design ensures enterprise-grade financial
integrity aligned with SAP FI standards and internal audit requirements.
Private & Confidential Page 184 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
10.5. Risk
The SAP Reconciliation function directly impacts official financial records. Any failure
may result in accounting misstatement, audit findings, or financial exposure. The
following risks are identified together with built-in mitigation controls.
10.5.1. Duplicate GL Posting (Z1 Double Issue)
Risk Description:
The same transaction is posted more than once into SAP, resulting in duplicate
revenue recognition.
Impact:
• Financial overstatement
• Reconciliation imbalance
• Audit finding
• Revenue distortion
Mitigation Controls:
• Transaction hash validation engine
• SAP Document Number tracking
• Posting flag mechanism (Not Posted / Posted / Reversed)
• Duplicate Prevention Engine (Z1 Control)
• Automatic blocking of repost attempt
10.5.2. Clearing Failure Due to Assignment Mismatch
Risk Description:
Assignment Reference in SAP does not match No. Rujukan Bayaran, causing
auto-clearing failure.
Impact:
• Uncleared GL entries
• Increased manual reconciliation effort
• Month-end closing delay
Mitigation Controls:
• Pre-post assignment validation
• Format normalization
• Clearing monitoring dashboard
• Aging alert mechanism
Private & Confidential Page 185 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
10.5.3. Bank Reconciliation Mismatch
Risk Description:
Mismatch between system transactions and bank statement records.
Impact:
• Financial variance
• Settlement discrepancy
• Audit exposure
Mitigation Controls:
• Multi-parameter matching logic
• Date tolerance configuration
• Variance detection engine
• Unmatched isolation queue
• Structured reconciliation classification (Matched / Variance / Failed)
10.5.4. Incorrect GL Mapping
Risk Description:
Zakat category mapped to incorrect G/L account.
Impact:
• Misclassification of revenue
• Incorrect financial reporting
• Internal control breach
Mitigation Controls:
• GL Posting Validation Engine
• Finance-admin configuration control
• Structural validation before posting
• Blocking mechanism for invalid mapping
10.5.5. Unauthorized Reversal
Risk Description:
Improper financial correction without governance control.
Impact:
• Fraud risk
• Financial manipulation
• Compliance violation
Private & Confidential Page 186 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Mitigation Controls:
• Multi-level approval workflow
• Mandatory reason code enforcement
• Supervisor initiation + Finance approval
• Full audit trail logging
• Segregation of duties (No self-approval)
10.5.6. Delayed Reconciliation Detection
Risk Description:
Unmatched or variance transactions not identified promptly.
Impact:
• Month-end delay
• Financial exposure
• Audit adjustment requirement
Mitigation Controls:
• Real-time reconciliation dashboard
• Variance aging report
• Clearing success KPI monitoring
• Escalation rules for unresolved cases
10.5.7. Cross-Year Posting Inconsistency
Risk Description:
Transaction posted in incorrect fiscal year or period.
Impact:
• Year-end financial misstatement
• Adjustment complexity
• Audit remark
Mitigation Controls:
• Posting period validation
• Date tolerance enforcement
• Cross-year posting check before integration
• Supervisor review requirement for period override
10.5.8. Settlement File Incomplete or Corrupted
Risk Description:
Bank settlement file missing records or structurally invalid.
Private & Confidential Page 187 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Impact:
• Incomplete reconciliation
• False unmatched classification
• Processing failure
Mitigation Controls:
• File structure validation
• Header vs Detail tally check
• IDD compliance verification
• Auto-reject corrupted files
• Exception queue isolation
10.5.9. Manual Override Misuse
Risk Description:
Improper use of reconciliation override feature.
Impact:
• Hidden variance
• Financial manipulation
• Audit integrity risk
Mitigation Controls:
• Restricted override access (Finance only)
• Mandatory reason code
• Approval workflow
• Override audit log with trace ID
10.5.10. Batch Imbalance During Aggregation
Risk Description:
Mismatch between lump sum bank debit and detailed zakat credit breakdown.
Impact:
• GL imbalance
• Reconciliation discrepancy
• Financial reporting inconsistency
Mitigation Controls:
• Debit vs Credit auto-tally validation
• Pre-post aggregation verification
• Block posting if imbalance detected
• Automated batch integrity check
Private & Confidential Page 188 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
10.5.11. Risk Posture Summary
The SAP Reconciliation framework implements:
• Preventive controls (validation, duplicate blocking, mapping enforcement)
• Detective controls (variance engine, clearing monitoring, aging report)
• Corrective controls (reversal workflow, exception isolation, retry mechanism)
• Governance controls (RBAC segregation, audit logging, multi-level approval)
This layered control architecture ensures financial integrity, audit compliance,
and operational reliability across SAP FI integration.
10.6. Security
The SAP Reconciliation function directly impacts official financial records and SAP FI.
Therefore, it is protected by layered security controls covering access governance,
transaction integrity, data protection, and audit enforcement.
10.6.1. Strict RBAC (Finance / Supervisor / Processor Segregation)
The system enforces Role-Based Access Control based on segregation of
duties:
• Processor → No access to SAP reconciliation or posting
• Supervisor → View reconciliation status, initiate adjustment (no
approval rights)
• Finance → Approve reversal, manage reconciliation, monitor variance
• Finance Admin → Configure GL mapping and tolerance settings
Access is granted based on least-privilege principle.
Security Outcome:
Prevents unauthorized financial manipulation and enforces accountability.
10.6.2. Posting Flag Mechanism (Prevent Double Posting)
Every transaction carries a controlled posting status:
• Not Posted
• Posted
• Reversed
Only transactions marked “Not Posted” are eligible for SAP integration.
The system blocks repost attempts automatically.
Security Outcome:
Prevents duplicate GL posting (Z1 double issue).
Private & Confidential Page 189 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
10.6.3. ACID-Compliant Posting Control
All SAP posting transactions follow ACID principles:
• Atomicity – No partial posting
• Consistency – Debit equals Credit
• Isolation – Concurrent processing protected
• Durability – Posted records permanently stored
Rollback occurs if failure detected.
Security Outcome:
Prevents data corruption and financial imbalance.
10.6.4. Mandatory Reason Code for Reversal
Any financial correction requires:
• Predefined reason code selection
• Structured justification
• Logged audit reference
No reversal allowed without valid reason.
Security Outcome:
Prevents arbitrary financial adjustment.
10.6.5. Multi-Level Approval for Adjustment
Reversal or adjustment requires:
Supervisor → Finance Approval → System Execution
No single user can both initiate and approve.
Security Outcome:
Enforces segregation of duties and fraud prevention.
10.6.6. Secure SAP API Authentication (Token / Certificate)
All SAP integrations are secured through:
• Token-based authentication
• OAuth (if applicable)
• Certificate-based trust validation
• IP whitelisting (if configured)
Prevents unauthorized system integration attempts.
Private & Confidential Page 190 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Security Outcome:
Ensures secure and authenticated SAP communication.
10.6.7. Encrypted File Transfer (SFTP / TLS)
All integration data (bank files, batch files, API calls) use:
• SFTP (Secure File Transfer Protocol)
• HTTPS with TLS encryption
Prevents interception or tampering during transmission.
Security Outcome:
Maintains confidentiality and integrity of financial data.
10.6.8. Full Reconciliation Audit Trail
Every action is logged, including:
• Posting attempts
• Clearing verification
• Variance detection
• Reversal initiation
• Approval decisions
• Manual override
Audit logs include user ID, timestamp, role, and transaction reference.
Security Outcome:
Provides audit-grade traceability and forensic capability.
10.6.9. Clearing Validation Enforcement
System enforces validation before marking reconciliation complete:
• Assignment reference match
• Clearing confirmation
• No unresolved variance
Prevents premature financial closure.
Security Outcome:
Ensures accurate ledger reconciliation.
10.6.10. Data Masking (IC / Sensitive Data)
Sensitive personal data displayed in reconciliation screens is masked:
• IC partially hidden (e.g., ****--1234)
Private & Confidential Page 191 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Passport partially masked
• Full data accessible only to authorized roles
Supports PDPA compliance and privacy protection.
Security Outcome:
Protects sensitive data from unauthorized exposure.
10.6.11. Segregation Between Posting & Approval Roles
The system enforces structural separation:
• Posting engine operates automatically
• Supervisor can initiate but not approve
• Finance can approve but not modify ingestion data
• No self-approval allowed
Security Outcome:
Strengthens internal control and reduces fraud risk.
10.6.12. Real-Time Alert for Abnormal Variance
Automated alerts are triggered for:
• High variance threshold breach
• Sudden spike in unmatched transactions
• Repeated duplicate posting attempts
• Clearing failure beyond SLA
Notifications sent to Finance dashboard (and optionally email).
Security Outcome:
Provides proactive risk detection and immediate corrective action.
10.6.13. Security Posture Summary
The SAP Reconciliation security framework ensures:
• Controlled access via RBAC
• Strong segregation of duties
• Zero duplicate posting risk
• Encrypted and authenticated integration
• Mandatory governance for financial correction
• Full audit traceability
• Real-time anomaly detection
• PDPA-compliant data protection
Private & Confidential Page 192 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
This layered security architecture guarantees that SAP financial integration
remains secure, controlled, and audit-ready at enterprise scale.
10.7. Summary
SAP Reconciliation is the final financial integrity layer of the system. It ensures:
• Every collection is accurately recorded.
• Every GL entry is properly mapped.
• Every clearing is validated.
• Every variance is traceable.
• Every adjustment is controlled.
Without this function, financial reporting cannot be trusted.
With this function, the system achieves:
• Financial Accuracy.
• Audit Readiness.
• Regulatory Compliance.
• Zero Duplication Risk.
• Full Traceability.
It transforms operational transaction data into clean, validated, audit-proof SAP
financial records.
Private & Confidential Page 193 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
Private & Confidential Page 194 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
11. Coupon
11.1. Overview
The Coupon Management Module is designed to provide end-to-end governance,
traceability, and financial integrity over physical and digital coupon instruments issued
by the organization.
Coupons are treated as controlled financial instruments with lifecycle tracking from
inventory registration, distribution, redemption, cancellation, and final audit archival.
The system ensures:
• Full traceability of each coupon serial number
• Prevention of duplication or misuse
• Controlled stock allocation across branches and agents
• Real-time inventory visibility
• Financial synchronization upon redemption
• Compliance-ready audit logs
This module supports operational control, financial accuracy, and fraud prevention.
11.2. Solution component
The solution consists of the following key components:
A. Centralized Coupon Master Registry
• Stores all coupon serial numbers and batch information
• Maintains coupon status (Active, Distributed, Redeemed, Cancelled,
Expired)
• Prevents duplicate serial creation
B. Inventory Allocation Engine
• Assigns coupon batches to branches or agents
• Tracks stock movement between locations
• Maintains real-time balance per branch
C. Redemption Validation Engine
• Validates serial number authenticity
• Prevents double redemption
• Updates financial ledger automatically
D. Cancellation & Control Workflow
• Enforces approval hierarchy
Private & Confidential Page 195 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Requires mandatory reason code
• Permanently invalidates cancelled coupons
E. Audit & Compliance Engine
• Logs every coupon lifecycle event
• Records responsible user and timestamp
• Supports export for audit verification
11.3. Function
11.3.1. Coupon Inventory Management
• Batch registration with serial range input
• Unique serial number tracking
• Branch-level allocation
• Real-time inventory monitoring
• Low-stock threshold alerts
Each coupon is uniquely identifiable and traceable from issuance to final
disposition.
11.3.2. Coupon Distribution Control
• Allocation to specific branch or agent
• Assignment to authorized officer
• Digital acknowledgment of receipt
• Role-based distribution control
• Time-stamped logging of stock movement
All distribution events are recorded to prevent misuse or unauthorized transfer.
11.3.3. Coupon Redemption Processing
• Serial number validation against master inventory
• Status verification (Active / Redeemed / Cancelled / Expired)
• Duplicate redemption prevention
• Automatic ledger posting upon successful redemption
• Real-time update of inventory and financial records
Redemption triggers synchronized updates in both inventory and accounting
modules.
11.3.4. Coupon Cancellation Workflow
Applicable for:
• Lost coupons
• Damaged coupons
Private & Confidential Page 196 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
• Administrative voiding
Controls include:
• Authorized role approval
• Mandatory reason code entry
• Permanent status change to "Inactive"
• Prevention of future redemption attempts
11.3.5. Audit Trail & Lifecycle Tracking
The system records:
• Coupon Serial Number
• Batch Number
• Responsible Officer
• Branch Location
• Timestamp
• Status Transition
All logs are exportable for compliance audits and stock reconciliation exercises.
11.4. Module
The Coupon Management Module is structured into the following sub-modules:
1. Coupon Master Registry Module
2. Inventory Allocation Module
3. Redemption Processing Module
4. Cancellation & Approval Workflow Module
5. Audit & Reporting Module
Each module operates within a centralized database environment to ensure
consistency and single source of truth across all branches.
Integration points include:
• Financial Ledger Module
• Counter Transaction Module
• Agent Portal
• Backend Reconciliation Engine
Private & Confidential Page 197 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
11.5. Summary
The Coupon Management Module provides a secure, auditable, and fully controlled
lifecycle management system for physical and digital coupons.
Key strengths include:
• Full serial-level traceability
• Real-time inventory visibility
• Controlled distribution workflow
• Duplicate redemption prevention
• Integrated financial posting
• Comprehensive audit logging
• Fraud risk mitigation
This solution ensures operational efficiency while maintaining strong governance,
compliance, and financial control standards suitable for enterprise-level
implementation.
Private & Confidential Page 198 of 199

---

Lembaga Zakat Selangor New Kutipan System
Functional
12. Conclusion
The New Kutipan
System is not merely a
transaction
processing system — it
is a comprehensive
financial governance
framework designed
for Lembaga Zakat
Selangor.
It delivers:
• Centralized, multi-channel zakat collection
• Structured backend processing with ACID control
• Automated SAP GL posting with validation enforcement
• Intelligent clearing & reconciliation engine
• Zero duplicate posting risk (Z1 control)Controlled and auditable reversal
workflow
• Real-time financial monitoring dashboard
• Enterprise-grade security & segregation of duties
The architecture ensures that:
• No invalid transaction reaches SAP.
• No duplicate financial impact occurs.
• No reconciliation discrepancy goes undetected.
• No financial correction happens without governance.
This solution positions LZS with a scalable, secure, compliant, and audit-ready zakat
collection ecosystem aligned with enterprise financial standards and long-term digital
transformation objectives.
Private & Confidential Page 199 of 199