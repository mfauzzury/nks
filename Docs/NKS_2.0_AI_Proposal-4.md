# LZS New Kutipan System (NKS 2.0)

## Artificial Intelligence (AI) Proposal

### Aligned with AI Impact Assessment (AIIA) Framework


Project Name: New Kutipan System (NKS 2.0)

Project Owner: Datascience Sdn Bhd

Document Version: 2.0























## 1. Overview

The NKS 2.0 system incorporates targeted Artificial Intelligence (AI) and Machine Learning (ML) capabilities to enhance operational efficiency, reduce manual effort, and improve decision-making across zakat collection processes. This proposal outlines the proposed AI features, their scope, and the corresponding AI Impact Assessment (AIIA) in accordance with LAMPIRAN F guidelines.

AI is applied selectively — only where it provides clear, justified value. All AI-assisted decisions remain subject to human review and override.

AI Workflow Orchestration: All AI processing pipelines are built on Flowise — an open-source, self-hosted AI workflow automation platform. Flowise orchestrates the interactions between the LLM (Ollama with Qwen model), business logic, and NKS 2.0 microservices via visual workflow design. This ensures all AI flows are auditable, modifiable, and maintainable without deep ML expertise.


## 2. Proposed AI Use Cases

### 2.0 AI Architecture Overview


Rajah 1: Gambaran Keseluruhan Seni Bina AI (AI Architecture Overview)


### 2.1 Intelligent Reconciliation via Billplz Agent Billing ID

What it does: Automates the matching of payment collections to agent records using Billplz’s dedicated Agent Billing ID feature — giving each agent a unique, trackable collection identifier.

Why this matters: Billplz supports dedicated billing IDs per collection agent. Every payment made through an agent’s billing ID carries that agent’s unique identifier, eliminating ambiguity in collection attribution and making reconciliation near-automatic.

How it works: - Primary match: Billplz Agent Billing ID directly maps the payment to the correct agent’s collection record - Fallback match: Fuzzy matching using transaction date, amount, and reference number for edge cases (offline payments, manual entries) - Confidence scoring: Each match assigned a confidence score; low-confidence matches flagged for Finance Supervisor review - Flowise workflow: Reconciliation pipeline built as a Flowise flow, triggered by Billplz webhook events


















Implementation Flow:


Rajah 2: Aliran Pelarasan Melalui Billplz Agent Billing ID

AI Type: Rule-based matching + statistical similarity scoring via Flowise workflow Reference: Section 8.2.4 — Automated Reconciliation Engine


### 2.2 Bulk Employer Contribution Processing

What it does: Processes bulk salary deduction lists submitted by employers who pay zakat contributions on behalf of their employees. Each employee’s contribution is individually mapped to their own zakat account — not aggregated under the employer.

Business context: Companies deduct zakat from employee salaries and submit a consolidated list (Excel/CSV) containing each employee’s name, IC number, and contribution amount. The system must: 1. Split the bulk payment into individual contributions per employee 2. Reflect each contribution in the employee’s personal zakat account 3. Issue individual receipts per employee 4. Post the consolidated amount to SAP under the employer’s reference

How it works (Flowise Workflow): 1. Employer uploads bulk Excel/CSV file via Employer Portal 2. Flowise workflow triggered — Qwen LLM parses and normalises the file content 3. Each row matched to a NKS payer profile by IC number (name as secondary match) 4. Unmatched employees flagged for employer to resolve (wrong IC, name mismatch) 5. Finance Supervisor reviews and approves the validated batch 6. Upon approval: each employee’s account credited individually; receipts generated; SAP posted













Implementation Flow:


Rajah 3: Aliran Pemprosesan Caruman Majikan Secara Pukal (Bulk Employer Contribution)


AI Type: LLM-based document parsing and entity matching (Flowise + Qwen via Ollama) Human oversight: Finance Supervisor must approve every batch before any account is credited Reference: Section 5.3 — Bulk Payment Processing


### 2.3 Anomaly & Fraud Detection

What it does: Detects suspicious payment patterns in real-time to prevent fraud and duplicate transactions.

How it works: - Rule-based velocity checks (e.g., same payer multiple transactions within minutes) - Statistical outlier detection for unusual payment amounts (Z-score analysis) - Duplicate transaction detection using idempotency key + transaction hash - Alerts routed to Grafana dashboard for operations team review

AI Type: Rule-based anomaly detection + statistical outlier detection Human oversight: All flagged transactions reviewed by supervisor before any action — no automatic blocking Reference: Section 7.4 — Payment Security



### 2.4 Predictive Analytics for Collection Insights

What it does: Provides LZS management with insights to support strategic planning — outputs are advisory only and do not drive automated decisions.

Capabilities: - Zakat collection trend forecasting (time-series by month, zakat type, region) - Agent performance benchmarking - Payer contribution pattern estimation based on historical data - Dashboard visualisation via Grafana

AI Type: Time-series forecasting, regression models (scikit-learn / statsmodels) Human oversight: Outputs labelled as estimates; not used for financial commitments Reference: Section 9.3 — Predictive Analytics Capabilities



### 2.5 Document Processing Support

Uploaded documents (bank slips, IC copies, SPG files, employer documents) are automatically classified to the correct category using file type detection and keyword extraction, reducing manual sorting by operations staff.

For complex or low-quality scanned documents where structured data extraction is needed, the system may optionally invoke a self-hosted Vision Language Model (Qwen-VL via Ollama) — applied selectively and with human verification of all extracted output before storage.

AI Type: Rule-based classification + optional VLM extraction (supporting role only) Reference: Section 2.2.2 — Cross-Cutting Services (File Management Service)



## 3. AI Impact Assessment (AIIA)

Following LAMPIRAN F — Artificial Intelligence (AI) Impact Assessment Checklist


### STEP 1: System and Data Overview


### STEP 2: Risk and Impact Identification

#### Ethical Risks


#### Legal & Regulatory Risks

#### Societal & Human Risks


### STEP 3: Mitigation & Governance

#### Risk Mitigation Plan


#### Technical Safeguards


#### Accountability & Oversight


### STEP 4: Final Assessment & Approval


## 4. AI Technology Stack


## 5. Summary

The NKS 2.0 AI proposal introduces practical, low-risk AI capabilities that directly address the operational challenges of LZS zakat collection:


All AI features are orchestrated through Flowise with Ollama + Qwen as the self-hosted LLM, ensuring all data remains within the infrastructure perimeter. All features are designed with human-in-the-loop as a non-negotiable principle, ensuring LZS staff retain full control over all consequential decisions. The system is fully compliant with PDPA, AIGE, and Shariah requirements.


| Item | Detail |
| --- | --- |
| System Purpose | Enhance zakat collection operations through automated reconciliation, bulk contribution processing, fraud detection, and collection analytics. AI supports — not replaces — human decisions. |
| AI Technology | Flowise workflow orchestration, Ollama + Qwen LLM (self-hosted), rule-based matching, statistical anomaly detection, time-series forecasting |
| Data Used | Transaction records (MySQL), employer payroll lists (Excel/CSV), payer profiles, Billplz agent billing data. No sensitive biometric data used in AI models. |
| Data Volume | Transactional: millions of records. Bulk uploads: hundreds to thousands of employee rows per employer submission. |
| Actors & Stakeholders | Developers (Datascience Sdn Bhd), LZS Operations Staff, Finance Team, Supervisors, Employers, Employees (payers, indirectly), Auditors |
| Decision-Making Autonomy | Low autonomy — AI flags anomalies, suggests matches, and parses bulk lists; humans confirm all consequential actions. No AI system autonomously approves payments, credits accounts, or posts to SAP. |


| Risk | Assessment | Mitigation |
| --- | --- | --- |
| Bias & Discrimination | Low. AI matches employees by IC number (objective identifier). Name matching as secondary only. | IC-first matching eliminates demographic bias. No profiling features used. |
| Fairness | Low. All employees processed equally regardless of contribution amount. Hamba Allah payers protected via pseudonymization. | PDPA-compliant handling; anonymous payer unique ID never linked to identity in AI processing. |
| Human Autonomy & Control | Maintained. Every batch approval, reconciliation confirmation, and fraud alert resolution requires human action. | Human-in-the-loop enforced at: bulk batch approval, reconciliation sign-off, anomaly alert review, SAP posting. |
| Transparency & Explainability | All AI outputs display the matching basis and confidence level in Bahasa Melayu. | Audit log records every AI recommendation and subsequent human decision. |


| Risk | Assessment | Mitigation |
| --- | --- | --- |
| Data Protection (PDPA) | Medium. Bulk employer lists contain employee IC numbers and salary deduction data. | Data minimization: only IC, name, and amount processed. Files deleted after processing. DPIA conducted. |
| Legal Consequences | Low. No AI decision has legal effect without Finance Supervisor approval. | Full audit trail. Full reversal capability for any AI-assisted action. |
| Shariah Compliance | Low. AI does not calculate or modify zakat amounts — amounts are submitted by employer and verified by staff. | Zakat formulas fixed by LZS Shariah advisors. AI only processes, never recalculates. |
| AIGE Compliance | Compliant. AI use is limited, targeted, and governed with human oversight. | AIIA documented and maintained. Regular review aligned with AIGE guidelines. |


| Risk | Assessment | Mitigation |
| --- | --- | --- |
| Social Impact | Low. AI automates repetitive data matching tasks, freeing staff for higher-value oversight work. | Staff training on AI-assisted workflows. Clear escalation procedures. |
| Public Trust | Low. AI operates in back-office processes only. Employees whose contributions are processed have no direct AI interaction. | No AI-driven payer rejection. All employee account credits require Finance Supervisor approval. |
| Physical & Psychological Harm | None. AI is limited to financial transaction processing and analytics. | N/A |


| AI Feature | Key Risk | Mitigation |
| --- | --- | --- |
| Agent Billing ID Reconciliation | Edge cases with no Billplz ref | Fallback fuzzy matching; low-confidence flagged for human review |
| Bulk Contribution Processing | Employee IC mismatch or unmatched rows | Unmatched rows flagged and returned to employer before any account is credited |
| Anomaly Detection | False positives on legitimate transactions | Alerts only — no automatic blocking; supervisor review within defined SLA |
| Predictive Analytics | Inaccurate forecasts influencing decisions | Labelled as estimates; disclaimer on dashboard; not used for financial commitments |
| Document Classification | Misclassification of uploaded files | Human verification before document is filed; reclassification always available |


| Safeguard | Implementation |
| --- | --- |
| Robustness & Reliability | Flowise workflows are stateless and restartable. BullMQ handles retry on failure. System continues operating if any AI component fails (graceful degradation). |
| Security | All AI processing within NKS 2.0 security perimeter: TLS 1.3 in transit, AES-256 at rest, AWS WAF, Authentik RBAC. Ollama/Qwen runs on isolated GPU node — no data leaves the infrastructure. |
| Model Monitoring | Grafana + Prometheus track: reconciliation match rate, bulk processing success rate, anomaly alert volume, LLM response latency. |
| Audit Trail | Every AI recommendation logged to immutable audit table in MySQL: timestamp, AI module, input summary, recommendation, confidence score, human action taken. |


| Item | Detail |
| --- | --- |
| Designated AI Owner | LZS IT & Finance Division (operational oversight); Datascience Sdn Bhd (technical accountability) |
| Auditing | Quarterly internal audit of match rates, bulk processing accuracy, and anomaly detection false positive rates. Annual external review aligned with AIGE compliance cycle. |
| Recourse Mechanism | Employees or employers may raise disputes via self-service portal or counter. All AI-processed batches can be reversed by Finance Supervisor with audit trail. |
| Documentation | This AIIA document maintained as living record. Updated upon any material change to AI features, data sources, or model logic. |


| Item | Detail |
| --- | --- |
| Overall Risk Rating | LOW — AI is used in supporting roles (reconciliation assistance, bulk list parsing, fraud alerting, analytics). No automated decisions with legal, financial, or personal impact are made without human approval. |
| Recommendation | Proceed — The proposed AI features are proportionate, targeted, and governed by robust human oversight controls. The system complies with PDPA, AIGE guidelines, and Shariah requirements. Conditions: (1) Quarterly AI audit to be conducted; (2) Model performance dashboards monitored continuously; (3) AIIA to be reviewed upon any significant change in AI scope. |
| Stakeholder Sign-off Required | LZS IT Division Head, LZS Finance Division Head, LZS Compliance/Legal, LZS Shariah Advisory (for zakat formula confirmation), Datascience Sdn Bhd Project Director |


| Component | Technology |
| --- | --- |
| AI Workflow Orchestration | Flowise (self-hosted, open-source) — visual AI workflow builder |
| LLM Model | Qwen (via Ollama, self-hosted on GPU node) |
| LLM Serving | Ollama — self-hosted LLM inference server |
| ML Runtime | Python (scikit-learn, statsmodels) — predictive analytics microservice |
| Anomaly Detection | Rule-based + Z-score statistical outlier detection |
| Forecasting | Time-series regression (scikit-learn / statsmodels) |
| Integration | Nest.js AI Service module via REST API to Flowise |
| Document Support | Optional: Qwen-VL via Ollama for complex document extraction (supporting role) |
| Data Store | MySQL 8.0+ (transaction data, AI results), AWS S3 (uploaded files) |
| Monitoring | Grafana + Prometheus (AI metrics, LLM latency, match rates), Loki (AI service logs) |
| Queue | BullMQ (AI job processing — bulk uploads, reconciliation batches) |


| # | AI Feature | Benefit |
| --- | --- | --- |
| 1 | Agent Billing ID Reconciliation | Near-automatic reconciliation per agent using Billplz’s dedicated billing ID |
| 2 | Bulk Employer Contribution Processing | Accurately splits employer payroll lists into individual employee zakat accounts |
| 3 | Anomaly & Fraud Detection | Real-time protection against duplicate and suspicious transactions |
| 4 | Predictive Analytics | Data-driven insights for collection planning and agent performance |
| 5 | Document Processing Support | Automated document routing; optional VLM for complex extractions |
