
# NKS 2.0 – Integration 3rd Party Module
## AI Architecture, Use Case Diagram, and Sequence Diagram

---

# 1. AI Architecture Diagram – Integration 3rd Party Module

```mermaid
flowchart TD

A[3rd Party Systems<br>Banks / PSP / JANM] --> B[Integration Gateway<br>FTP / API / Secure Tunnel]

B --> C[File Intake Service]

C --> D[AI File Parser<br>LLM Structure Detection]
C --> E[Data Validation Engine]

D --> F[Standardized Transaction Format]
E --> F

F --> G[AI Reconciliation Engine<br>Similarity Matching]

G --> H[Duplicate Detection Engine]
G --> I[Fraud & Anomaly Detection]

H --> J[Transaction Processing Engine]
I --> J

J --> K[NKS Core Database]

K --> L[Analytics Dashboard<br>BI / Grafana]

J --> M[Human Review Queue<br>Supervisor Approval]
```

---

# 2. Use Case Diagram – Integration 3rd Party Module

```mermaid
flowchart LR

A[Executive Processing] --> B[Upload Integration File]
A --> C[Review AI Reconciliation Result]
A --> D[Approve Transactions]
A --> E[Investigate Flagged Transactions]

F[Bank / PSP System] --> G[Send Payment File]
F --> H[Send Transaction Confirmation]

AI[AI Engine] --> I[Parse File Structure]
AI --> J[Match Transactions]
AI --> K[Detect Duplicate Payments]
AI --> L[Detect Fraud / Anomaly]

B --> AI
G --> AI
H --> AI

AI --> C
AI --> E

C --> D
```

---

# 3. Sequence Diagram – AI Reconciliation Flow

```mermaid
sequenceDiagram

participant Bank
participant IntegrationService
participant AIParser
participant ReconciliationAI
participant NKSDatabase
participant Supervisor

Bank->>IntegrationService: Send transaction file (.txt encrypted)

IntegrationService->>AIParser: Parse file structure

AIParser->>IntegrationService: Standardized transaction data

IntegrationService->>ReconciliationAI: Send transactions for matching

ReconciliationAI->>NKSDatabase: Search payer profile

NKSDatabase-->>ReconciliationAI: Return matched records

ReconciliationAI->>IntegrationService: Matching result + confidence score

IntegrationService->>NKSDatabase: Store matched transactions

ReconciliationAI->>Supervisor: Flag low-confidence matches

Supervisor->>IntegrationService: Approve / Reject flagged transactions

IntegrationService->>NKSDatabase: Finalize transaction records
```

---

# Notes

AI components used in this module:

• AI File Parser – detects file structure automatically from external systems  
• AI Reconciliation Engine – similarity matching between external transaction and NKS payer records  
• Duplicate Detection – identifies duplicate payments  
• Fraud / Anomaly Detection – identifies suspicious payment patterns  

All AI recommendations require **human approval before financial records are finalized**.

This ensures:
- PDPA compliance
- Financial auditability
- Shariah governance compliance

---

End of Document
