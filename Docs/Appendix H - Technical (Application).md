Lembaga Zakat Selangor New Kutipan System
Technical (Application)
Appendix H
Technical (Application)
REQUEST FOR PROPOSAL (RFP)
FOR THE DESIGN, DEVELOPMENT, INSTALLATION,
CONFIGURATION, TESTING, COMMISSIONING AND
PROVISIONING OF SUPPORT AND MAINTENANCE FOR
NEW KUTIPAN SYSTEM OF
LEMBAGA ZAKAT SELANGOR (MAIS)
No. Tender : LZS/DP/100-T (2/2026)
Private & Confidential Page 1 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
Contents
CONTENTS ..................................................................................................................................................... 2
1. EXECUTIVE TECHNICAL SUMMARY .................................................................................................... 4
1.1. UNDERSTANDING THE CHALLENGE .......................................................................................................... 4
1.2. OUR TECHNICAL APPROACH ................................................................................................................... 4
1.3. KEY TECHNICAL DIFFERENTIATORS ........................................................................................................... 5
2. SYSTEM ARCHITECTURE ..................................................................................................................... 7
2.1. OVERALL SYSTEM ARCHITECTURE ............................................................................................................ 7
2.2. BACKEND ARCHITECTURE ..................................................................................................................... 10
2.3. FRONTEND WEB ARCHITECTURE ............................................................................................................ 13
3. MOBILE APPLICATION STRATEGY ...................................................................................................... 22
3.1. PLATFORM-SPECIFIC DESIGN PRINCIPLES .............................................................................................. 22
3.2. MOBILE APPLICATIONS FEATURE MATRIX ................................................................................................ 23
3.3 SHARED MOBILE INFRASTRUCTURE ........................................................................................................ 25
3.4. MOBILE DEVOPS PIPELINE ................................................................................................................... 28
4. TECHNOLOGY STACK RECOMMENDATIONS .................................................................................... 30
4.1 BACKEND TECHNOLOGY STACK ............................................................................................................. 30
4.2 FRONTEND WEB TECHNOLOGY STACK .................................................................................................... 31
4.3 MOBILE TECHNOLOGY STACK ................................................................................................................ 32
4.4 DATABASE & INFRASTRUCTURE STACK .................................................................................................... 33
4.5 INFRASTRUCTURE & DEVOPS STACK ....................................................................................................... 42
5. SECURITY & COMPLIANCE APPROACH ............................................................................................ 45
5.1 MULTI-LAYERED SECURITY ARCHITECTURE .............................................................................................. 45
5.2 NETWORK SECURITY ............................................................................................................................. 45
5.3 APPLICATION SECURITY ......................................................................................................................... 46
5.4 DATA SECURITY .................................................................................................................................... 47
5.5 API SECURITY ....................................................................................................................................... 48
5.6 MOBILE APPLICATION SECURITY ............................................................................................................. 49
5.7 COMPLIANCE FRAMEWORK .................................................................................................................... 51
6. DATA MANAGEMENT ARCHITECTURE ............................................................................................... 56
6.1 PAYER-CENTRIC UNIFIED PROFILE ......................................................................................................... 56
6.2 MYSQL DATABASE ARCHITECTURE ........................................................................................................ 57
6.3 DATA MIGRATION STRATEGY .................................................................................................................. 59
6.4 DATA QUALITY FRAMEWORK................................................................................................................... 62
7. PAYMENT PROCESSING INTEGRATION ............................................................................................. 64
7.1 BILLPLZ PAYMENT GATEWAY INTEGRATION .............................................................................................. 64
7.2 PAYMENT GATEWAY INTEGRATION DETAILS .............................................................................................. 64
7.3 PAYMENT PROCESSING WORKFLOWS ..................................................................................................... 68
7.4 PAYMENT SECURITY............................................................................................................................... 71
7.5 PAYMENT RECONCILIATION & SETTLEMENT ............................................................................................. 72
8. THE BRAIN - BUSINESS LOGIC ENGINE ............................................................................................. 74
8.1 BUSINESS RULES ENGINE ARCHITECTURE ............................................................................................... 74
8.2 CORE BUSINESS LOGIC COMPONENTS ................................................................................................... 75
8.3 DYNAMIC CONFIGURATION MANAGEMENT .............................................................................................. 82
Private & Confidential Page 2 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
8.4 INTEGRATION WITH CORE SYSTEMS ........................................................................................................ 83
9. REPORTING & ANALYTICS ARCHITECTURE ...................................................................................... 85
9.1 ANALYTICS ARCHITECTURE LAYERS ......................................................................................................... 85
9.2 REAL-TIME DASHBOARD CAPABILITIES .................................................................................................... 86
9.3 PREDICTIVE ANALYTICS CAPABILITIES...................................................................................................... 87
9.4 REPORTING CAPABILITIES ...................................................................................................................... 90
9.5 DATA WAREHOUSE ARCHITECTURE ........................................................................................................ 93
10. TESTING & QUALITY ASSURANCE APPROACH ............................................................................... 95
10.1 TESTING STRATEGY PYRAMID ................................................................................................................ 95
10.2 TESTING LEVELS .................................................................................................................................. 95
10.3 TEST AUTOMATION INFRASTRUCTURE .................................................................................................. 105
11. DEVOPS & DEPLOYMENT STRATEGY ............................................................................................. 109
11.1 KUBERNETES DEPLOYMENT ARCHITECTURE ......................................................................................... 109
11.2 CI/CD PIPELINE ARCHITECTURE ........................................................................................................ 110
11.3 INFRASTRUCTURE AS CODE (IAC) ....................................................................................................... 111
11.4 DEPLOYMENT STRATEGIES ................................................................................................................. 112
11.5 CONTAINERIZATION & ORCHESTRATION .............................................................................................. 113
11.6 MONITORING & OBSERVABILITY ......................................................................................................... 114
11.7 DISASTER RECOVERY & BUSINESS CONTINUITY ................................................................................... 116
11.8 SECURITY IN DEVOPS (DEVSECOPS) .................................................................................................. 118
11.9 MOBILE APP DEPLOYMENT (REACT NATIVE) ........................................................................................ 120
CONCLUSION ............................................................................................................................................ 124
KEY STRENGTHS ............................................................................................................................................... 124
TECHNICAL DIFFERENTIATORS ........................................................................................................................... 126
IMPLEMENTATION READINESS ............................................................................................................................ 126
Private & Confidential Page 3 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
1. Executive Technical Summary
1.1. Understanding the Challenge
The LZS New Kutipan System (NKS 2.0) represents a critical modernization initiative
to replace an outdated legacy architecture that has become a bottleneck for operational
efficiency and user experience. The scale and complexity of this transformation
includes:
1.1.1. Legacy System Constraints:
• Aging infrastructure with ~4 TB of historical data
• Over 44 million transaction records requiring migration
• Performance limitations affecting user experience
• Data integrity and reliability concerns
• Limited scalability for future growth
1.1.2. Transformation Objectives:
• Payer-Centric Digital Transformation: Shift from system-centric to payer-
centric model with unified profiles for Individuals, Companies, and Agents
• Multi-Channel Collection: Billplz payment gateway handles diverse
payment methods (FPX, Cards, E-Wallets) plus Cash with automated
processing
• Intelligent Automation: Centralized business logic engine ("The Brain") for
registration, commission calculation, and reconciliation
• Data-Driven Insights: Real-time dashboards and predictive analytics to
identify zakat potential and optimize collections
1.2. Our Technical Approach
Our proposed solution delivers a modern, scalable, and secure platform built on
proven enterprise technologies and architectural patterns:
1.2.1. Microservices-Based Architecture
Private & Confidential Page 4 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Domain-driven design aligned with the four core functional domains
• Independent service deployment and scaling
• Resilient system with fault isolation
• Technology flexibility for each domain
1.2.2. Native Mobile-First Strategy
• High-performance iOS and Android apps for all three portals (Self-Service,
Employer, Agent)
• Platform-specific UI/UX following iOS Human Interface Guidelines and
Material Design 3
• Superior security with hardware-backed biometric authentication
• Offline capability with intelligent sync
1.2.3. Event-Driven Architecture
• Real-time data processing and synchronization
• Asynchronous communication for scalability
• Event sourcing for complete audit trail
• BullMQ (Redis-based queue) for reliable message delivery
1.2.4. API-First Design
• RESTful APIs with OpenAPI documentation
• GraphQL for complex data queries
• Secure API gateway with rate limiting
• OAuth 2.0 authentication and authorization
1.3. Key Technical Differentiators
1.3.1. Cross-Platform Mobile Excellence
• Three dedicated React Native CLI applications (bare workflow)
• 90%+ code sharing between iOS and Android for faster development
• Native performance with platform-specific optimizations when needed
• Offline-first architecture with background synchronization
Private & Confidential Page 5 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
1.3.2. Intelligent Business Logic Engine ("The Brain")
• Automated commission calculation with multiple models
• Real-time reconciliation with fuzzy matching algorithms
1.3.3. Enterprise-Grade Security & Compliance
• Multi-layered security architecture (Network, Application, Data, API, Mobile)
• TLS 1.3 with AES-256-GCM encryption
• Comprehensive penetration testing program
• Complete audit traceability with immutable event logs
1.3.4. Proven Technology Stack
• Nest.js (Node.js) for backend microservices
• Vue.js 3 + Tailwind CSS + ShadCN for web applications
• MySQL 8.0+ for unified data persistence
• React Native CLI for cross-platform mobile apps
• Kubernetes + Docker for container orchestration
• Comprehensive monitoring (Prometheus, Grafana, Loki)
Private & Confidential Page 6 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
2. System Architecture
2.1. Overall System Architecture
Our architecture follows Microservices with Domain-Driven Design (DDD),
organizing services around the four core functional domains identified in the NKS 2.0
requirements.
Figure 2.1: End-to-End System Architecture Overview
This system uses a secure, layered architecture to support web and mobile
users. Client apps connect through HTTPS to a network and API gateway layer that
handles security, authentication, rate limiting, and routing. Requests are then
processed by a microservices layer built with clear domain separation (such as user
management, payments, transactions, reporting, and notifications), allowing each
service to scale independently and stay easy to maintain.
Data is stored in a centralized data and storage layer with databases, caching,
file storage, and backup mechanisms to ensure performance, reliability, and
compliance. A message queue enables asynchronous processing for bulk jobs and
notifications, while monitoring tools provide logging and system health visibility. The
platform also integrates securely with external systems such as payment gateways,
government agencies, and email/SMS providers to support financial operations and
regulatory requirements.
Private & Confidential Page 7 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
2.1.1. Payment Processing Data Flow
This diagram illustrates the complete payment processing flow from user
initiation to receipt generation:
Figure 2.2: End-to-End Payment Transaction Flow
Private & Confidential Page 8 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
This flow illustrates the end-to-end payment process starting from a user on a
mobile or web application. A payment request is sent to the API Gateway, where
security checks such as JWT validation, rate limiting, and request logging are
performed before routing the request to the Payment Service. The Payment Service
validates the request, verifies the payer’s identity via the Payer Service, and creates
an initial transaction record in the database with a PENDING status to ensure
traceability.
Once the payer is confirmed, the Payment Gateway Orchestrator selects the
appropriate external payment gateway (such as online banking, card, or wallet) and
prepares the required payment payload. The payment is then processed by the
external gateway, which returns a success or failure response. Based on this
response, the Payment Service updates the transaction status accordingly and
emits a completion event to trigger downstream processes.
After payment completion, asynchronous jobs are handled through a queue to
generate the receipt, send email or push notifications, and calculate commissions
without blocking the main transaction flow. The receipt is stored securely, and the
user ultimately receives a receipt PDF along with confirmation via email or push
notification. This design ensures secure processing, clear audit trails, and scalable
handling of post-payment activities.
2.1.2. Security Architecture
Comprehensive security layers protecting the system:
Figure 2.3: End-to-End Security Architecture Across Edge, Application, Data, and
Monitoring Layers
Private & Confidential Page 9 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
This security architecture implements a defense-in-depth approach, starting
from the edge and extending through the application, data, and client layers. At the
edge, web and mobile traffic is protected using WAF, DDoS mitigation, firewall rules,
and HTTPS-only load balancing to block common attacks such as SQL injection,
XSS, CSRF, and volumetric threats. The API Gateway enforces strong authentication
and authorization using JWT, OAuth2, role-based access control, rate limiting, and
request validation, ensuring that only authorized and well-formed requests reach
internal services.
Within the application and data layers, security controls are embedded directly
into the business logic. Application-level protections include strict input validation,
schema enforcement, output encoding, security headers, and business rule checks
such as fraud detection, duplicate prevention, and balance verification. Data
security is ensured through encryption at rest and in transit, secure key
management, encrypted backups, and strict handling of sensitive data such as
personal information, payments, and credentials.
2.2. Backend Architecture
2.2.1. Domain Microservices
2.2.1.1. Domain 1: Payer-Centric Data Management
Services:
• Payer Profile Service: Unified profile management for Individuals,
Companies, and Agents
• Identity Verification Service: Integration with government APIs for
IC/business registration validation
• Profile History Service: Track all changes to payer profiles with temporal
data
• Unified View Service: Aggregate payer data from multiple sources for
comprehensive view
2.2.1.2. Domain 2: Collection & Payment Processing
Services:
• Payment Gateway Service: Billplz integration for FPX, Cards, and E-Wallets
• Transaction Processing Service: Real-time payment processing and
validation
• Bulk Payment Service: Asynchronous processing for large batch uploads
• Scheduled Payment Service: Recurring payment management with
tokenization
Private & Confidential Page 10 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Payment Reconciliation Service: Automated matching with bank
statements
Key Features:
• Billplz API integration for all payment methods
• PCI-DSS compliant tokenization via Billplz
• Real-time payment status updates
2.2.1.3. Domain 3: Operational Processing - "The Brain"
Services:
• Registration Service: Multi-stage registration workflow with approvals
• Commission Calculation Engine: Configurable rules for agent/employer
commissions
• Receipt Generation Service: Bahasa Melayu receipts with digital
signatures
Key Features:
• Dynamic business rules without code deployment
• Shariah-compliant zakat calculation formulas
• Automated document processing with AI/ML
• Audit trail for all business logic execution
• Version control for rules with rollback capability
2.2.1.4. Domain 4: Reporting & Analytics
Services:
• Real-time Dashboard Service: WebSocket-based live dashboards
• Report Generation Service: Scheduled and on-demand report creation
• Metrics Aggregation Service: Pre-computed metrics for fast queries
Key Features:
• Sub-second query response times with pre-aggregation
• Export to multiple formats (PDF, Excel, CSV)
Private & Confidential Page 11 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Drill-down capabilities from summary to transaction level
• Custom report builder for ad-hoc analysis
2.2.2 Cross-Cutting Services
• Authentication & Authorization Service: OAuth 2.0, JWT tokens, RBAC, MFA
• Notification Service: Email, SMS, Push notifications with template
management
• Audit & Logging Service: Centralized audit trail with immutable event log
• File Management Service: Document storage, virus scanning, encryption at
rest
• Integration Service: ESB for SAP, financial institutions, government agencies
2.2.3 Backend Technology Stack
Primary Framework: Nest.js (Node.js)
Rationale:
• TypeScript-first framework with strong typing and compile-time safety
• Progressive Node.js framework built on Express.js (fast, unopinionated)
• Excellent for building scalable, maintainable microservices
• Modular architecture with dependency injection out of the box
• Native support for WebSocket, GraphQL, and microservices patterns
• Large and growing ecosystem with active community
• Excellent performance for I/O-intensive operations (payment processing, API
calls)
Core Technologies:
• @nestjs/microservices: Microservices communication (TCP, Redis, Kafka,
MQTT)
• @nestjs/passport: Authentication with Passport.js strategies (JWT, OAuth 2.0)
• @nestjs/jwt: JSON Web Token implementation
• @nestjs/typeorm: Database ORM with TypeORM for MySQL
• @nestjs/bull: Queue-based job processing with Bull
• @nestjs/schedule: Cron jobs and scheduled tasks
Private & Confidential Page 12 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• @nestjs/websockets: Real-time communication with Socket.IO
• @nestjs/graphql: GraphQL API support (optional for complex queries)
• class-validator & class-transformer: DTO validation and transformation
• @nestjs/axios: HTTP client for external API calls
• helmet: Security headers middleware
• rate-limiter-flexible: API rate limiting
2.3. Frontend Web Architecture
2.3.1 Web Application Design
Architecture Pattern: Single-Page Application (SPA) with Component-Based Design
Technology Stack:
• Framework: Vue.js 3 (Composition API) with TypeScript
• State Management:
○ Pinia (official Vue store, successor to Vuex) for global state management
○ VueQuery (TanStack Query for Vue) for server state and caching
• UI Framework: Tailwind CSS (utility-first CSS framework)
• UI Component Library:
○ ShadCN Vue (accessible and customizable component system)
○ Radix Vue primitives for headless UI components
○ Custom components built with Tailwind CSS
• Forms: VeeValidate with Yup or Zod schema validation
• Routing: Vue Router 4 with lazy loading and code splitting
• Build Tool: Vite (lightning-fast HMR and optimized builds)
• Styling: Tailwind CSS with PostCSS + ShadCN design system
• Testing: Vitest (fast unit tests) + Vue Test Utils + Playwright for E2E
• API Client: Axios with request/response interceptors
• Language: Bahasa Melayu & English (all UI text, labels, messages)
Rationale for Vue.js:
• Progressive framework with gentle learning curve
• Excellent performance with Virtual DOM and reactivity system
• Composition API provides better code organization and reusability
• Smaller bundle size compared to React
Private & Confidential Page 13 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Excellent TypeScript support
• Strong documentation and vibrant ecosystem
• Shared language with backend (TypeScript/JavaScript)
Rationale for Tailwind CSS:
• Utility-first approach for rapid UI development
• Highly customizable design system
• No CSS conflicts with scoped utilities
• Responsive design made easy
• Smaller CSS bundle with PurgeCSS
• Consistent design language across components
• Easy to maintain and scale
2.3.2 Portal-Specific Features
2.3.2.1. Self-Service Portal
• Personal profile management with identity verification
• Payment history with search and filtering
• Multiple payment methods via Billplz (FPX, cards, e-wallets)
• Receipt download and email
• Scheduled payment setup and modification
• Anonymous payment (Hamba Allah) with privacy protection
• Bahasa Melayu interface
• Accessibility (WCAG 2.1 Level AA)
2.3.2.2. Employer Portal
• Employee bulk registration via CSV/Excel upload
• Bulk payment processing with validation
• Commission management and reporting
• Employee payment tracking and history
• Approval workflows for large transactions
• Advanced reporting with export capabilities
• Dashboard with key metrics and trends
2.3.2.3. Agent Portal
Private & Confidential Page 14 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Multi-payer management and quick switching
• Payment collection interface for field operations
• Commission tracking with real-time updates
• Performance dashboard with rankings
• Reconciliation tools for cash collections
• Receipt printing and digital delivery
• Territory and payer assignment management
2.4. Mobile Application Architecture
2.4.1 React Native CLI Development Approach
Why React Native for NKS 2.0:
1. Code Sharing & Faster Development:
○ Single Codebase: Write once, run on both iOS and Android (90%+ code
sharing)
○ Faster Time-to-Market: Develop features once instead of twice
○ Shared Business Logic: Business logic layer shared across mobile and
potentially web
○ Consistent Experience: Same features and behavior on both platforms
simultaneously
2. Development Efficiency:
○ Hot Reloading: See changes instantly without rebuilding (dev productivity
boost)
○ Shared Team: JavaScript/TypeScript developers can work on mobile
○ Reusable Components: Component library shared across all three
mobile apps
○ Easier Maintenance: One codebase to maintain, update, and debug
3. Performance:
○ Native Modules: Access to platform-native performance for critical
operations
○ Hermes Engine: Optimized JavaScript engine for faster app startup
Private & Confidential Page 15 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
○ Native Navigation: React Navigation with native animations (60fps)
○ Optimized Rendering: Uses native components under the hood
4. Security:
○ Platform-Native Biometrics: React Native Biometrics for Face ID, Touch
ID, Fingerprint
○ Secure Storage: React Native Keychain for iOS Keychain and Android
Keystore
○ SSL Pinning: React Native SSL Pinning for certificate pinning
○ Jailbreak/Root Detection: Available through community libraries
○ Code Obfuscation: Hermes bytecode + ProGuard for Android
5. Offline Capability:
○ Local Database: WatermelonDB or Realm for high-performance local
storage
○ Efficient Sync: Background sync with NetInfo for connectivity detection
○ Encrypted Storage: SQLCipher support for database encryption
○ Async Storage: For simple key-value persistence
6. Native Access When Needed:
○ Native Modules: Write custom platform-specific modules when required
○ Bridging: Access any platform API through JavaScript bridge
○ Third-Party Libraries: Extensive ecosystem (react-native-firebase,
payments, etc.)
Bare React Native CLI vs Expo:
• Using Bare React Native CLI for full control and access to all native
modules
• No limitations on native dependencies
• Custom native code integration when needed
• Better for complex financial applications with custom requirements
Private & Confidential Page 16 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
2.4.2 Architecture Pattern: Clean Architecture + MVVM
Presentation Layer
• Screen (React Components)
• Custom Hooks (Business Logic)
• UI Components (Reusable)
• Navigation (React Navigation)
Domain Layer
• Use Cases (Application Business Logic)
• Entities (Business Models - TypeScript
Interfaces)
• Repository Interfaces
• Business Rules
Data Layer
• Repository Implementations
• API Clients (Axios)
• Local Storage (Watermelon DB/Realm,
AsyncStorage)
• Cache Management
• Data Mapping (DTO - Entity)
Figure 2.4: Application Layered Architecture Using Clean Architecture Principles
Benefits:
• Clear separation of concerns
• Testable code with dependency injection
• Business logic reusable across platforms
• Easy to mock dependencies for testing
• Scalable architecture for large apps
Private & Confidential Page 17 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
2.4.3 React Native Technology Stack
2.4.3.1. Core Framework:
• React Native CLI: Full control, bare workflow
• React 18+: Latest React features with Concurrent Rendering
• TypeScript: Type safety and better developer experience
• Hermes: High-performance JavaScript engine (enabled by default)
2.4.3.2. UI & Navigation:
• React Navigation 6: Stack, Tab, Drawer navigation with native animations
• React Native Paper / Native Base: UI component libraries (Material Design
/ iOS-style)
• Or Custom Components: Build custom components matching design
system
• React Native Reanimated 3: 60fps animations running on UI thread
• React Native Gesture Handler: Native gesture recognition
2.4.3.3. State Management:
• Redux Toolkit (RTK): Centralized state management with Redux DevTools
• React Query / TanStack Query: Server state management and caching
• Zustand: Lightweight alternative to Redux (if preferred)
• Context API: For simple global state
2.4.3.4. Networking:
• Axios: HTTP client with interceptors for auth, retries
• React Query: Data fetching, caching, synchronization
• Socket.IO Client: Real-time WebSocket communication
• NetInfo: Network connectivity detection
2.4.3.5. Local Storage & Offline:
• WatermelonDB: High-performance reactive database (recommended for
complex apps)
• Realm: Alternative object database with sync capabilities
• AsyncStorage: Simple key-value storage (for settings, preferences)
Private & Confidential Page 18 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• React Native MMKV: Fast key-value storage (10x faster than AsyncStorage)
• SQLite (via react-native-sqlite-storage): Traditional SQL database
2.4.3.6. Security:
• React Native Keychain: iOS Keychain and Android Keystore integration
• React Native Biometrics: Face ID, Touch ID, Fingerprint authentication
2.4.3.7. Forms & Validation:
• React Hook Form: Performant form management
• Yup / Zod: Schema validation for forms
2.4.3.8. Notifications & Background:
• React Native Firebase (FCM): Push notifications for iOS and Android
• React Native Background Actions: Background task scheduling
• React Native Background Fetch: Periodic background data fetch
2.4.3.9. Payment Integration:
• React Native In-App Payments: For payment gateway SDKs
• Billplz payment gateway integration: Billplz handles all payment methods
• Platform-specific payment modules: Custom bridges for FPX, local
gateways
2.4.3.10. Developer Tools:
• React Native Debugger: Debugging with Redux DevTools
• Flipper: Platform for debugging React Native apps (network, logs, layout)
2.4.3.11. DevOps & Build:
• Fastlane: Automated build and deployment for iOS and Android
• CodePush : Over-the-air updates for JS bundles
• Metro Bundler: JavaScript bundler for React Native
2.4.3.12. Platform-Specific Code:
• Platform Module: Conditional rendering for iOS/Android
Private & Confidential Page 19 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Platform-specific File Extensions: .ios.tsx, .android.tsx for platform-
specific code
• Native Modules: Write custom native modules for iOS and Android when
needed
2.5. Integration Architecture
2.5.1 Enterprise Service Bus (ESB) Layer
Enterprise Service Bus / Integration Layer
(MuleSoft / WSO2 / Spring Integration)
• Message Transformation
• Protocol Mediation
• Routing and Orchestration
• Error Handling and Retry
• Monitoring and Logging
Financial Government Payment
SAP ERP Institution Agencies (AG) Gateways
(FPX,
RFC/REST ISO 8583 SOAP/REST Banks)
REST APIs Mutual TLS REST APIs
Figure 2.5: Enterprise Service Bus (ESB) Integration Architecture
2.5.2 Integration Patterns
2.5.2.1. SAP Finance Integration:
• Synchronous: RFC/BAPI calls for real-time financial posting
• Asynchronous: IDoc for batch processing (end-of-day settlement)
• Use Cases: Payment recording, commission disbursement, financial
reporting
2.5.2.2. Financial Institutions:
• FPX: Direct integration with FPX network for online banking
• E-Wallets: Billplz handles e-wallet integration
Private & Confidential Page 20 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Bank Reconciliation: SFTP for bank statement files (MT940, CSV)
2.5.2.3. Government Agencies:
• SOAP/REST: Web services for identity verification
•
Mutual TLS: Two-way SSL authentication for secure communication
•
Data Exchange: Scheduled data submission for regulatory compliance
Private & Confidential Page 21 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
3. Mobile Application Strategy
3.1. Platform-Specific Design Principles
3.1.1 iOS App Design (iOS Human Interface Guidelines)
3.1.1.1. Navigation:
• Tab Bar for primary navigation (5 main sections max)
• Navigation Bar with hierarchical back navigation
• Modal sheets for focused tasks
• Contextual actions via swipe gestures
3.1.1.2. Visual Design:
• Dynamic Type for accessibility
• Light and Dark mode support
3.1.1.3. Interactions:
• Pull-to-refresh for data updates
• Swipe gestures for quick actions (delete, archive)
• Long press for contextual menus
• Drag and drop for file uploads
3.1.1.4. Platform Integration:
• Apple Pay for seamless payments
• Spotlight search for receipts and transactions
3.1.2 Android App Design (Material Design 3)
3.1.2.1. Navigation:
• Bottom navigation for 3-5 primary destinations
• Navigation drawer for secondary sections
• Floating Action Button (FAB) for primary actions
• Bottom sheets for contextual options
3.1.2.2. Visual Design:
• Material icons and symbols
Private & Confidential Page 22 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Elevation and shadows for hierarchy
• Motion and transitions for continuity
3.1.2.3. Interactions:
• Swipe-to-refresh for content updates
• Swipe-to-dismiss for list items
• Long press for selection mode
3.1.2.4. Platform Integration:
• Google Pay for payments
• Quick Settings tiles for fast access
• Android Widgets for glanceable information
• App Shortcuts for common tasks
3.2. Mobile Applications Feature Matrix
3.2.1 Self-Service Mobile App
3.2.1.1. Core Features:
• Quick Payment: One-tap payment with saved methods, biometric
confirmation
• Payment History: Searchable transaction history with filters
• Receipt Management: Digital receipts with PDF download and sharing
• Scheduled Payments: Set up recurring zakat payments with reminders
• Anonymous Payments: Hamba Allah option with privacy protection
• Bahasa Melayu interface: App is in Bahasa Melayu & English
• Biometric Authentication: Face ID/Touch ID (iOS), Fingerprint/Face
(Android)
• Push Notifications: Payment reminders, receipt available, promotional
campaigns
3.2.1.2. Advanced Features:
• Payment Calculator: Estimate zakat based on income/assets
• Zakat Types: Support multiple zakat categories (Fitrah, Pendapatan, etc.)
• Saved Payment Methods: Tokenized cards and e-wallets
• Payment Splitting: Allocate payment across multiple zakat types
Private & Confidential Page 23 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Tax Receipts: Generate annual summary for tax deductions
3.2.1.3. User Experience:
• Onboarding wizard for first-time users
• Contextual help and tooltips
• Optimistic UI updates for instant feedback
• Error handling with clear recovery actions
3.2.2 Employer Mobile App
3.2.2.1. Core Features:
• Employee Management: View employee list, add/remove employees
• Payment Status Tracking: Monitor bulk payment processing status
• Commission Management: View commission structure and approvals
• Mobile Reporting: Key metrics and trends on mobile dashboard
• Notifications: Payment pending approval, processing complete
• Offline Mode: View employee data and pending approvals offline
3.2.2.2. Advanced Features:
• Bulk Upload: CSV/Excel file upload for employee data
• Payment Scheduling: Schedule future bulk payments
• Commission Calculator: Preview commission before submission
• Audit Trail: Complete history of approvals and modifications
• Export Reports: PDF and Excel export for financial records
3.2.2.3. User Experience:
• Dashboard with actionable insights
• Quick filters for pending actions
• Batch operations for efficiency
• Confirmation dialogs for critical actions
• Progress indicators for long-running operations
3.2.3 Agent Mobile App
Private & Confidential Page 24 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
3.2.3.1. Core Features:
• Field Payment Collection: Record cash/check payments on the go
• Real-Time Commission Tracking: Live updates on earnings
• Multi-Payer Management: Quick switching between payers
• GPS-Based Transaction Logging: Location tracking for compliance
• Performance Dashboard: Metrics, rankings, goals
• Biometric Authentication: Secure access to sensitive data
3.2.3.2. Advanced Features:
• Payer Insights: Payment history and preferences for each payer
• Commission Breakdown: Detailed view of commission calculations
• Offline-First Architecture: Full functionality without internet
• Conflict Resolution: Smart merge for offline edits
• Signature Capture: Digital signature for acknowledgment
3.3 Shared Mobile Infrastructure
3.3.1 Authentication & Authorization
3.3.1.1. Authentication Flow:
• Email/phone + password (initial login)
• Biometric unlock for subsequent sessions
• Device registration with push token
• OAuth 2.0 token exchange
• Refresh token rotation
3.3.1.2. Security Features:
• Auto-logout after inactivity (configurable)
• Device fingerprinting for fraud detection
• Multi-device management (view and revoke)
• Step-up authentication for sensitive operations (e.g., large payments)
3.3.2 Offline Capability & Sync
3.3.2.1 Offline-First Architecture:
• Local SQLite database (Core Data/Room) as source of truth
Private & Confidential Page 25 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Queue-based sync with conflict resolution
• Optimistic updates with rollback on failure
• Differential sync to minimize data transfer
• Background sync when connected
3.3.2.2. Sync Strategy:
• Real-Time: Critical data (payment status, notifications)
• On-Demand: User-initiated refresh
• Periodic: Background sync every 15 minutes
• On-Connect: Full sync when network restored
3.3.3 Push Notifications
3.3.3.1. Notification Categories:
• Transactional: Payment successful, receipt ready, commission earned
• Reminder: Upcoming scheduled payment, incomplete registration
• Promotional: Ramadan campaign, zakat deadline reminder
• System: App update available, scheduled maintenance
3.3.3.2. Implementation:
• Firebase Cloud Messaging (FCM) for both iOS and Android
• Rich notifications with images and action buttons
• Deep linking to specific screens
• Notification preferences (opt-in/opt-out per category)
3.3.4 Analytics & Monitoring
3.3.4.1. User Analytics:
• Screen views and user flows
• Feature usage metrics
• Conversion funnels (registration, payment)
• Retention and churn metrics
3.3.4.2. Tools:
• Firebase Analytics: Cross-platform analytics
• Firebase Crashlytics: Crash reporting with stack traces
Private & Confidential Page 26 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Custom Analytics: Business-specific events to backend
3.3.5 Security Features
3.3.5.1. Network Security:
• SSL Certificate Pinning for API calls
• Certificate chain validation
• Protection against man-in-the-middle attacks
• API request signing for critical operations
3.3.5.2. Device Security:
• Root/Jailbreak detection
• Emulator detection
• Screen capture prevention for sensitive screens
• Clipboard protection for sensitive data
• Secure keyboard for PIN entry
3.3.5.3. Data Security:
• AES-256 encryption for local database
• Keychain/Keystore for tokens and secrets
• Biometric-protected sensitive operations
• Memory encryption for in-flight data
• Secure deletion of sensitive data
Private & Confidential Page 27 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
3.4. Mobile DevOps Pipeline
3.4.1. CI/CD Workflow:
Figure 3.1: Continuous Integration and Delivery (CI/CD) Pipeline
3.4.2. iOS Deployment:
Private & Confidential Page 28 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Fastlane: Automated build, test, and deployment
• Match: Code signing and certificate management
• Gym: Build and package IPA files
• Pilot: TestFlight distribution automation
• Deliver: App Store submission automation
• Snapshot: Automated screenshot generation for App Store
3.4.3. Android Deployment:
• Gradle: Build automation with build flavors (dev, staging, prod)
• Google Play Console API: Automated APK/AAB upload
• Internal Testing Track: Automated distribution to testers
• Staged Rollout: Gradual release (10% → 25% → 50% → 100%)
• App Bundle: Optimized APK delivery via Google Play
3.4.4. App Store Optimization (ASO):
• Keyword optimization for search visibility
• Compelling app descriptions in multiple languages
• High-quality screenshots and preview videos
• Regular updates with new features and bug fixes
• Prompt for ratings at appropriate moments
• Respond to user reviews
Private & Confidential Page 29 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
4. Technology Stack Recommendations
4.1 Backend Technology Stack
Framework: Nest.js (Node.js + TypeScript)
4.1.1. Core Dependencies:
• @nestjs/core & @nestjs/common: Core framework and decorators
• @nestjs/platform-express: Express.js platform adapter
• @nestjs/typeorm: MySQL ORM integration with TypeORM
• @nestjs/config: Configuration management with environment variables
• @nestjs/passport & @nestjs/jwt: Authentication with JWT and OAuth 2.0
• @nestjs/microservices: Microservices communication patterns
• @nestjs/bull: BullMQ integration for job queues and background processing
• @nestjs/schedule: Cron jobs and task scheduling
• @nestjs/websockets & @nestjs/platform-socket.io: Real-time
communication
• @nestjs/swagger: OpenAPI 3.0 documentation
• @nestjs/axios: HTTP client for external APIs
4.1.2. Additional Libraries:
• TypeORM: ORM for MySQL with migrations and query builder
• class-validator & class-transformer: DTO validation and transformation
• bcrypt: Password hashing
• helmet: Security headers middleware
• compression: Response compression
• rate-limiter-flexible: Advanced rate limiting
• winston / pino: High-performance structured logging
• joi: Configuration schema validation
• node-cache: In-memory caching
• axios: HTTP client for external integrations
• bull (BullMQ): Redis-based queue for background jobs
• socket.io: WebSocket library for real-time features
• jest: Testing framework with built-in support
Private & Confidential Page 30 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
4.2 Frontend Web Technology Stack
Framework: Vue.js 3 (Composition API) with TypeScript
4.2.1. Core Libraries:
• vue: Core Vue.js framework
• pinia: Official state management (successor to Vuex)
• vue-router: Official routing library
• @tanstack/vue-query (VueQuery): Server state management and caching
• axios: HTTP client with interceptors
4.2.2. UI & Styling:
• Tailwind CSS: Utility-first CSS framework
• ShadCN Vue: Accessible and customizable component system
• PostCSS: CSS processing with autoprefixer
• @headlessui/vue: Accessible, unstyled components
• @heroicons/vue: Beautiful hand-crafted SVG icons
4.2.3. Forms & Validation:
• VeeValidate: Form validation for Vue
• Yup / Zod: Schema-based validation
• @vueuse/core: Collection of essential Vue composition utilities
4.2.4. Build & Dev Tools:
• TypeScript: Type safety
• Prettier: Code formatting
• Husky: Git hooks for quality gates
4.2.5. Utilities:
• Bahasa Melayu & English: App is in Bahasa Melayu & English
• dayjs: Modern date manipulation (lighter than moment.js)
• chart.js / apexcharts: Charting library for dashboards
• jspdf / pdfmake: PDF generation
• qrcode.vue: QR code generation
Private & Confidential Page 31 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
4.2.7. Rationale:
• Progressive framework with gentle learning curve
• Composition API for better code organization
• Excellent performance with optimized reactivity system
• Smaller bundle size compared to React
• First-class TypeScript support
• Shared ecosystem with backend (JavaScript/TypeScript)
• Tailwind CSS + ShadCN for rapid, maintainable styling with accessible
components
• Vite for extremely fast development experience
4.3 Mobile Technology Stack
Framework: React Native CLI (Bare Workflow)
4.3.1. Core Framework:
• React Native: Cross-platform mobile framework
• React 18+: Latest React with Concurrent Rendering
• TypeScript: Type safety
• Hermes: High-performance JavaScript engine
4.3.2. UI & Navigation:
• React Navigation 6: Navigation library (stack, tab, drawer)
• React Native Paper / NativeBase: UI component libraries
• React Native Reanimated 3: 60fps animations on UI thread
• React Native Gesture Handler: Native gesture recognition
4.3.3. Security:
• react-native-keychain: Keychain/Keystore integration
• react-native-biometrics: Biometric authentication
• react-native-ssl-pinning: Certificate pinning
• react-native-device-info: Jailbreak/root detection
4.3.4. Forms & Utilities:
• React Hook Form: Form management
• Yup / Zod: Validation
Private & Confidential Page 32 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• React Native Firebase: Push notifications (FCM)
• Bahasa Melayu & English: App is in Bahasa Melayu & English
4.3.5. Testing:
• Jest: Unit testing
• React Native Testing Library: Component testing
• Detox / Appium: E2E testing
4.3.6. DevOps:
• Fastlane: Automated builds and deployment
• CodePush: Over-the-air JS updates
• Metro Bundler: JavaScript bundler
4.3.7. Rationale:
● Single codebase for iOS and Android (90%+ code sharing)
● Faster development and time-to-market
● Shared business logic across platforms
● Reusable components across all three mobile apps
● Large ecosystem with mature libraries
● Native performance with Hermes engine
● Hot reloading for rapid development
● Access to native modules when needed
4.4 Database & Infrastructure Stack
4.4.1 Database Technology
4.4.1.1. MySQL 8.0+ (Primary Database)
• Use Cases: ALL data storage (transactional data, payer profiles,
payments, audit logs)
• Features: ACID compliance, JSON columns for flexible schemas,
partitioning, replication
• Configuration:
○ Primary-replica setup for read scaling
○ InnoDB engine for transactional integrity
○ Automated daily backups with point-in-time recovery
○ Table partitioning for large tables (transactions by month)
• Indexes: B-tree primary keys, full-text search indexes, composite indexes
• Security: TLS connections, encrypted at rest, user privilege management
Private & Confidential Page 33 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
4.4.1.2. Rationale for MySQL-Only Architecture:
● Simplified architecture - single database technology to manage
● JSON columns provide schema flexibility (replaces need for MongoDB)
● Full-text search capabilities (reduces need for Elasticsearch)
● Easier operations and maintenance (one system to monitor, backup,
optimize)
● Lower infrastructure costs
● Strong ACID guarantees for financial data integrity
● Wide availability of MySQL expertise
4.4.1.3. Optional Supporting Technologies (if needed later):
• Redis: Can be added later for caching and session management if
performance requires
• ElasticSearch: Can be added later for advanced search if MySQL full-text
search is insufficient.
4.4.2 Core Infrastructure Components
4.4.2.1. BullMQ - Job Queue & Background Processing
4.4.2.1.1. Technology: BullMQ (Redis-based queue) integrated with
@nestjs/bull
4.4.2.1.2. Use Cases:
• Bulk Payment Processing: Process 1000+ employee payments
asynchronously
• Email/SMS Notifications: Queue and send notifications without
blocking API requests
• Report Generation: Generate large PDF/Excel reports in background
• Scheduled Tasks: Recurring jobs (daily reconciliation, monthly
commission calculation)
• ETL Jobs: Data synchronization with SAP and external systems
• Receipt Generation: Asynchronous PDF generation for payment
receipts
4.4.2.1.3. Key Features:
• Redis-based for high performance and reliability
• Job prioritization (critical, high, medium, low)
• Job retry with exponential backoff
Private & Confidential Page 34 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Job scheduling (cron-like syntax)
• Job progress tracking
• Delayed jobs (process later at specific time)
• Rate limiting (prevent overwhelming external APIs)
• Bull Board UI for monitoring and management
4.4.2.1.4. Configuration:
• Multiple queues for different job types
• Concurrency control (e.g., max 10 email jobs at once)
• Dead letter queue for failed jobs
• Job result storage for auditing
4.4.2.1.5. Rationale:
● Essential for handling high-volume asynchronous operations
● Prevents API timeout for long-running operations
● Improves user experience (instant API response, process in
background)
● Horizontal scalability (add more workers as needed)
● Built-in retry and error handling
● Redis-backed for reliability and persistence
● Perfect integration with Nest.js ecosystem
4.4.2.2. API Gateway - AWS API Gateway
4.4.2.2.1. Technology: AWS API Gateway
4.4.2.2.2. Responsibilities:
• Routing: Route requests to appropriate microservices
• Authentication: Centralized JWT validation and OAuth 2.0 flows
• Rate Limiting: Prevent API abuse (e.g., 100 req/min per user, 1000
req/min per API key)
• Request/Response Transformation: Modify headers, body, query
params
• Load Balancing: Distribute traffic across service instances
• SSL Termination: Handle HTTPS at gateway level
• CORS Handling: Cross-origin resource sharing configuration
• API Versioning: Route /api/v1/ and /api/v2/ to different services
Private & Confidential Page 35 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Caching: Cache responses for frequently accessed endpoints
• Logging: Centralized access logs for all API requests
• Monitoring: Request metrics (latency, status codes, throughput)
4.4.2.2.3. AWS API Gateway features:
• JWT plugin: Token validation
• Rate Limiting plugin: Advanced rate limiting with Redis
• CORS plugin: CORS configuration
• Request Transformer: Modify requests/responses
• Prometheus plugin: Export metrics to Prometheus
• IP Restriction: Whitelist/blacklist IPs
• Bot Detection: Identify and block malicious bots
4.4.2.2.4. Rationale:
● Centralized entry point for all client requests
● Offload cross-cutting concerns (auth, rate limiting) from
microservices
● Easier to manage API versioning and deprecation
● Built-in observability (logs, metrics, tracing)
● Simplified client configuration (one endpoint for all services)
● Enhanced security (protection against DDoS, injection attacks)
● AWS API Gateway is cloud-native, horizontally scalable, and fully
managed by AWS
Alternative: AWS API Gateway (if deploying on AWS) for fully managed solution
4.4.2.3. Authentik - Identity & Access Management (IAM) with LDAP Support
4.4.2.3.1. Technology: Authentik (open-source Identity Provider and SSO)
4.4.2.3.2. Core Capabilities:
• User Authentication: Username/password, MFA (TOTP, WebAuthn,
SMS)
• Single Sign-On (SSO): OAuth 2.0, OpenID Connect (OIDC), SAML 2.0
• LDAP Provider: Expose Authentik users via LDAP for legacy systems
Private & Confidential Page 36 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Role-Based Access Control (RBAC): Define roles (Admin, Finance
Manager, Agent, Payer)
• User Management: Self-service registration, password reset, profile
management
• Social Login: Google, Facebook, Microsoft Azure AD integration
• Audit Logs: Complete audit trail of authentication and authorization
events
• User Provisioning: Automatic user creation from external sources
(LDAP, SCIM)
4.4.2.3.3. Integration with NKS:
• Nest.js Backend: OAuth 2.0 / OIDC integration via Passport.js
• Vue.js Frontend: OIDC client for login redirect flow
• React Native Mobile: OIDC with PKCE for secure mobile
authentication
• LDAP Support: Connect to existing enterprise directory (if LZS has
one)
4.4.2.3.4. RBAC Implementation:
• Roles: Super Admin, Admin, Finance Manager, Employer, Agent,
Individual Payer, Auditor
• Permissions: Fine-grained permissions (e.g., payment.create,
report.export, user.manage)
• Groups: Organize users by department, territory, or function
• Policy Engine: Attribute-based access control (ABAC) for complex
rules
4.4.2.3.5. Rationale:
● Open-source alternative to commercial IAM (Auth0, Okta)
● Full control over user data and authentication flows
● LDAP support for enterprise integration
● Comprehensive RBAC for complex permission requirements
● Supports all modern authentication protocols (OAuth 2.0, OIDC,
SAML)
● Built-in MFA for enhanced security
● Self-hosted for data sovereignty
Private & Confidential Page 37 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
● Active development and strong community
Private & Confidential Page 38 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
4.4.2.4. Document Management System - AWS S3 + Custom DMS
4.4.2.4.1. Technology: AWS S3 + Custom metadata service
4.4.2.4.2. Architecture:
Document management API (Nest.js Service)
● Upload, Download, Delete, Search
● Metadata Management (MySQL)
● Access Control and Permissions
● Virus Scanning Integration
AWS S3 Object Storage
● Binary File Storage
● Versioning Enabled
● Bucket Policies for Access Control
● Lifecycle Policies for Archival
Figure 4.1: Service Management System
4.4.2.4.3. Document Types Managed:
• Payer Documents: IC copies, business registration, bank statements
• Payment Receipts: Generated PDF receipts
• Uploaded Files: CSV/Excel files for bulk payments
• Agent Documents: License copies, deposit slips
• System Documents: Generated reports, audit logs exports
4.4.2.4.4. Features:
• Upload: Multipart upload for large files (>5MB)
• Metadata: Store metadata in MySQL (filename, file type, uploaded by,
upload date, tags)
• Access Control: Document-level permissions (only owner or
authorized users can access)
• Encryption: Server-side encryption (AES-256)
• Search: Full-text search on metadata (filename, tags)
• Audit Trail: Track all document access (who viewed/downloaded
when)
Private & Confidential Page 39 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
4.4.2.4.5. AWS S3 Benefits:
• Native AWS S3 API
• High performance (faster than S3 for local deployment)
• Self-hosted (data sovereignty)
• Kubernetes-native (easy to deploy and scale)
• Cost-effective (no egress fees)
4.4.2.4.6. Rationale:
● Centralized document storage with metadata management
● Secure, encrypted storage for sensitive documents
● AWS S3 for scalable, durable object storage
● Scalable object storage for millions of documents
● Built-in versioning and lifecycle management
● Cost-effective self-hosted solution
● Easy integration with Nest.js via AWS SDK
4.4.3. Audit Trail & Observability - Grafana + Prometheus + Loki
Technology Stack:
• Prometheus: Metrics collection and storage
• Grafana: Visualization dashboards
• Loki: Log aggregation (like Elasticsearch, but simpler and cheaper)
4.4.3.1. Audit Trail Implementation:
4.4.3.1.1. Application Audit Logs (Database)
• Store audit events in MySQL audit_logs table
• Capture: User ID, Action, Resource Type, Resource ID, Timestamp, IP
Address, Before/After values
• Examples: User login, Payment created, Profile updated, Commission
approved
4.4.3.1.2. System Metrics (Prometheus)
• Application metrics: API request rate, response time, error rate
Private & Confidential Page 40 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Business metrics: Payments per minute, revenue, active users
• Infrastructure metrics: CPU, memory, disk, network (node exporter)
• MySQL metrics: Query rate, slow queries, connection pool (mysqld
exporter)
• Scrape interval
4.4.3.1.3. Application Logs (Loki)
• Structured JSON logs from Nest.js (Winston/Pino)
• Log levels: ERROR, WARN, INFO, DEBUG
• Indexed labels: service, environment, severity
• Full-text search on log messages
• Retention: 90 days
4.4.3.1.4. Grafana Dashboards
• Executive Dashboard: Total revenue, payments, user growth
• Operational Dashboard: API performance, error rates, job queue
status
• Audit Dashboard: User activities, security events, admin actions
• Infrastructure Dashboard: CPU, memory, disk, network per service
• Alerting: PagerDuty/Slack integration for critical alerts
4.4.3.2. Audit Trail Features:
• Immutable Logs: Append-only audit table (no updates/deletes)
• Tamper Detection: Checksum verification for audit log integrity
• Search & Filter: Query audit logs by user, action, date range, resource
• Export: Export audit logs for regulatory compliance
• Real-Time Alerts: Alert on suspicious activities (multiple failed logins, large
payments)
4.4.3.3. Compliance Support:
• Who: User ID and session tracking
• What: Action performed (create, update, delete, view)
• When: Timestamp (UTC) with millisecond precision
• Where: IP address, device info, geolocation
Private & Confidential Page 41 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Why: Business reason (if provided)
• Before/After: Data state before and after change
4.4.3.4. Rationale:
● Grafana + Prometheus is industry standard for observability
● Loki is lightweight and cost-effective (no expensive Elasticsearch cluster)
● Complete audit trail for regulatory compliance
● Real-time dashboards for operational visibility
● Proactive alerting for incidents and anomalies
● Open-source stack (no licensing costs)
● Excellent Kubernetes integration
● Grafana provides unified view (metrics + logs + traces)
4.4.3 Analytics & ML Stack
4.4.3.1. Machine Learning:
• Python 3.11+: Primary ML language
• Scikit-learn: Classical ML algorithms
• Flowise: Model versioning, experiment tracking, deployment
• Feature Store: Feast or custom solution for ML features
4.4.3.3. Business Intelligence:
• Metabase: User-friendly analytics for business users
• Grafana: Metrics visualization and monitoring dashboards
4.5 Infrastructure & DevOps Stack
4.5.1 Container & Orchestration
4.5.1.1. Containerization:
• Docker 24+: Container runtime
• Multi-stage builds: Optimize image size
• Distroless images: Minimal attack surface
4.5.1.2. Orchestration:
Private & Confidential Page 42 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Kubernetes 1.28+: Container orchestration
• Helm 3: Kubernetes package manager
• Kustomize: Kubernetes configuration management
• Istio: Service mesh for traffic management and security
4.5.2 CI/CD & Automation
4.5.2.1. Version Control:
• Git: Source code management
• Self-hosted Gitea: Code hosting with pull request workflows
4.5.2.2. CI/CD Platform:
• Gitea Actions (recommended): Integrated with Gitea, powerful pipelines
• Jenkins: Alternative with extensive plugin ecosystem
4.5.2.3. Continuous Integration:
• Automated builds on every commit
• Unit and integration tests execution
• Code quality gates (SonarQube)
• Docker image building and scanning
4.5.2.4. Continuous Deployment:
• ArgoCD: GitOps-based deployment for Kubernetes
• Automated deployment to dev/qa environments
• Manual approval for staging/production
4.5.3 Monitoring & Observability
4.5.4.1. Metrics:
• Prometheus: Metrics collection and storage
• Grafana: Metrics visualization and dashboards
• Alertmanager: Alert routing and notification
4.5.4.2. Logging:
• Loki: Log aggregation and storage (lightweight alternative to Elasticsearch)
• Promtail: Log collection and processing
• Grafana: Log visualization and analysis
Private & Confidential Page 43 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
Private & Confidential Page 44 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
5. Security & Compliance Approach
5.1 Multi-Layered Security Architecture
Our security approach follows Defense in Depth principles with multiple security
layers:
Figure 5.1: Multi-Layered Security Architecture
5.2 Network Security
5.2.1. Web Application Firewall (WAF):
• AWS WAF for protection against:
○ SQL injection
○ Cross-site scripting (XSS)
○ Cross-site request forgery (CSRF)
○ XML external entity (XXE)
○ Server-side request forgery (SSRF)
• Custom rules for Malaysia-specific threats
• Geo-blocking for suspicious regions
• Rate limiting per IP address
5.2.2. DDoS Protection:
• AWS Shield Standard (automatic)
Private & Confidential Page 45 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• AWS Shield Advanced for enhanced protection
• CloudFront for traffic distribution
• Auto-scaling to absorb traffic spikes
5.2.3. VPN Access:
• AWS Client VPN for secure remote access
• Multi-factor authentication required
• Role-based VPN access (developers, DBAs, admins)
• Audit logging of all VPN connections
5.3 Application Security
Authentication & Authorization:
5.3.1 OAuth 2.0 + OpenID Connect:
• Authorization Code flow for web applications
• Proof Key for Code Exchange (PKCE) for mobile apps
• Refresh token rotation for enhanced security
• Token expiry: Access token (15 minutes), Refresh token (7 days)
• Revocation endpoint for logout
5.3.2. JSON Web Tokens (JWT):
• Signed with RS256 (RSA signature with SHA-256)
• Claims: user ID, roles, permissions, expiry
• Token validation on every API request
• Blacklist for revoked tokens (Redis)
5.3.3. Role-Based Access Control (RBAC):
5.3.3.1. Roles
● Super Admin: Full system access
● Admin: User management, system configuration
● Finance Manager: Financial reports, reconciliation
● Employer: Enployer portal access
● Agent: Agent portal access
● Individual Payer: Self-service portal access
Private & Confidential Page 46 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
● Auditor: Read-only access to all data
5.3.3.2. Permissions:
● payer.create, payer.read, payer.update, payer.delete
● payment.create, payment.read, payment.refund
● commission.calculate, commission.approve
● report.generate, report.export
● admin.user, admin.config
5.3.4. Multi-Factor Authentication (MFA):
• Required for high-privilege accounts (Admin, Finance)
• Optional for standard users with incentive to enable
• TOTP (Time-based One-Time Password) support (Google Authenticator,
Authy)
• SMS OTP as backup method
• Biometric authentication for mobile apps
5.3.5. Input Validation & Sanitization:
• Server-side validation for all inputs (never trust client)
• Whitelist validation over blacklist
• Parameterized queries to prevent SQL injection
• HTML escaping to prevent XSS
• Content Security Policy (CSP) headers
• JSON schema validation for API requests
5.3.6. Session Management:
• Session timeout after 30 minutes of inactivity
• Concurrent session limiting (max 3 sessions per user)
• Session fixation prevention
5.4 Data Security
5.4.1. Encryption at Rest:
• Database: AES-256 encryption via Transparent Data Encryption (TDE)
• File Storage: S3 server-side encryption (SSE-S3 or SSE-KMS)
Private & Confidential Page 47 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Backups: Encrypted backups with separate encryption keys
• Mobile Local Storage: AES-256 encryption for SQLite databases
5.4.2. Encryption in Transit:
• TLS 1.3 for all HTTPS connections
• Cipher suites: AES-256-GCM, ChaCha20-Poly1305
• Perfect Forward Secrecy (PFS) enabled
• HSTS (HTTP Strict Transport Security) headers
• Certificate management with automated renewal
5.4.3. Field-Level Encryption:
• Personally Identifiable Information (PII) encrypted at application level
• Encrypted fields: IC number, phone number, email, bank account
• Encryption keys managed by AWS KMS
• Key rotation policy (annual or on-demand)
5.4.4. Key Management:
• AWS Key Management Service (KMS) for master keys
• Hardware Security Module (HSM) for highest security tier
• Key hierarchy: Master key → Data encryption keys
• Principle of least privilege for key access
• Audit logging for all key usage
5.4.5. Data Masking:
• Production data masked in non-production environments
• Anonymization for test data
• Redaction in logs (no PII, payment details, passwords)
• Masking in admin UIs for unauthorized users
5.5 API Security
5.5.1 API Gateway Security:
• Authentication: OAuth 2.0 bearer tokens
• Authorization: Fine-grained permissions per endpoint
• Throttling: Gradual backoff for excessive requests
• IP whitelisting for B2B integrations (SAP, banks)
Private & Confidential Page 48 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
5.5.2. API Request Signing:
• Timestamp validation (reject requests >5 minutes old)
• Nonce to prevent replay attacks
• Signature verification on server side
5.5.3. SSL Certificate Pinning:
• Mobile apps pin expected certificates
• Protection against man-in-the-middle attacks
• Certificate chain validation
• Backup pins for certificate rotation
5.5.4. API Versioning:
• URL-based versioning: /api/v1/, /api/v2/
• Deprecation policy: 12-month notice before removal
• Version-specific documentation
• Backward compatibility within major versions
5.6 Mobile Application Security
5.6.1 Code Protection:
• iOS: Bitcode compilation, obfuscation tools
• Android: ProGuard for code obfuscation and shrinking
• String Encryption: Encrypt API keys and secrets
• Anti-Tampering: Detect code modifications and refuse to run
5.6.2. Runtime Protection:
• Root/Jailbreak Detection: Detect compromised devices
• Emulator Detection: Prevent running on emulators
• Debugger Detection: Detect and prevent debugging
• Screen Capture Prevention: Disable screenshots on sensitive screens
• Clipboard Protection: Clear clipboard after copying sensitive data
Private & Confidential Page 49 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
Private & Confidential Page 50 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
5.7 Compliance Framework
5.7.1 WAE SSL 256-bit Encryption
5.7.1.1. Implementation:
• TLS 1.3 as default protocol
• Cipher Suites:
○ TLS_AES_256_GCM_SHA384
○ TLS_CHACHA20_POLY1305_SHA256
• Certificate Authority: DigiCert or Let's Encrypt with automated renewal
• Perfect Forward Secrecy (PFS): Enabled via ECDHE key exchange
• Certificate Validity: Annual rotation
• Monitoring: Automated alerts for certificate expiry
5.7.1.2. Verification:
• SSL Labs A+ rating
• Regular security audits
• Automated testing in CI/CD pipeline
5.7.2 Penetration Testing Strategy
5.7.2.1. Testing Frequency:
• Comprehensive Penetration Test: Annually by certified external firm
• Focused Penetration Test: Quarterly for new features/modules
• Automated Vulnerability Scanning: Weekly with OWASP ZAP / Nessus
• Red Team Exercise: Annually to test incident response
5.7.2.2. Testing Scope:
• Web applications (all three portals)
• Mobile applications (iOS and Android)
• APIs and microservices
• Infrastructure and network
• Social engineering (with user awareness)
5.7.2.3. Penetration Testing Phases:
● Reconnaissance: Information gathering
Private & Confidential Page 51 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
● Scanning: Vulnerability identification
● Exploitation: Attempt to exploit vulnerabilities
● Post-Exploitation: Assess impact and data access
● Reporting: Detailed findings with remediation recommendations
● Remediation: Fix vulnerabilities
● Re-testing: Verify fixes
5.7.2.4. Certification:
• Penetration testers certified by OSCP, CEH, or equivalent
• Compliance with OWASP Testing Guide
• Adherence to penetration testing execution standard (PTES)
5.7.3 AI Impact Assessment (AIIA) Compliance
5.7.3.1. AI/ML Transparency:
• Documentation of all ML models used in the system
• Model cards describing model purpose, training data, performance metrics
• Regular model performance monitoring
• Explainability reports for business users
5.7.3.2. Ethical AI Framework:
• Fairness: Bias detection and mitigation in predictive models
• Accountability: Clear ownership for AI-driven decisions
• Privacy: Data minimization for ML training
• Safety: Human-in-the-loop for high-stakes decisions
5.7.3.3. Bias Detection & Mitigation:
• Pre-training: Analyze training data for demographic bias
• Post-training: Evaluate model performance across demographic groups
• Ongoing: Monitor predictions for bias drift
• Mitigation: Re-sampling, re-weighting, adversarial debiasing
5.7.3.4. AIIA Documentation:
• Step-by-step checklist covering:
Private & Confidential Page 52 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
○ Purpose and intended use of AI
○ Data collection and processing
○ Model development and validation
○ Ethical considerations (fairness, transparency, accountability)
○ Risk assessment and mitigation
○ Shariah compliance verification
○ Ongoing monitoring and updates
5.7.5 Anonymity & Auditability
5.7.5.1. Anonymity Support (Hamba Allah):
5.7.5.1.1. Pseudonymization Framework:
• Generate unique anonymous identifier for each donation
• No collection of PII for anonymous payers
• Receipt generation with anonymous ID only
• Payment processing without identity verification
5.7.5.1.2. Data Segregation:
• Separate database tables for anonymous transactions
• No linking to identifiable user accounts
• Aggregated analytics only (no individual profiling)
• Strict access controls for anonymous data
5.7.5.1.3. Receipt & Tracking:
• Anonymous receipt with unique transaction ID
• QR code for verification without revealing identity
• Lookup by transaction ID for payer (no login required)
• Annual summary by transaction ID (for tax purposes)
5.7.5.2. Auditability:
5.7.5.2.1. Comprehensive Audit Trail:
• Immutable event log using event sourcing pattern
• Capture: User ID, action, timestamp, IP address, before/after values
• Storage: Append-only log in dedicated audit database
Private & Confidential Page 53 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Retention: 10 years for regulatory compliance
5.7.5.2.2. Audit Log Events:
• User authentication (login, logout, failed attempts)
• Data access (view, export, print)
• Data modification (create, update, delete)
• Administrative actions (user creation, role assignment, configuration
changes)
• System events (backup, restore, migration)
• Security events (suspicious activity, blocked requests)
5.7.5.2.3. Compliance Reporting:
• Automated generation of audit reports
• Regulatory compliance reports (quarterly, annually)
• Anomaly detection for suspicious patterns
• Dashboard for compliance officers
• Export to regulatory formats (XML, CSV, PDF)
5.7.5.2.4 Access Monitoring:
• Real-time monitoring of privileged account activity
• Alerts for unusual access patterns
• Quarterly access review for all users
• Automated deprovisioning for inactive accounts
5.7.6 Data Privacy & PDPA Compliance
Personal Data Protection Act (PDPA) - Malaysia:
5.7.6.1. Data Minimization:
• Collect only necessary data for service delivery
• Purpose specification: Clear communication of data usage
• Retention limits: Delete data after regulatory period (7 years for financial
records)
Private & Confidential Page 54 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
5.7.6.2. Consent Management:
• Explicit consent for data collection
• Granular consent for different purposes (marketing, analytics)
• Easy consent withdrawal mechanism
• Consent audit trail
5.7.6.3. Data Subject Rights:
• Right to Access: Users can view all their personal data
• Right to Rectification: Users can correct inaccurate data
• Right to Erasure: Users can request deletion (subject to legal retention)
• Right to Data Portability: Export data in machine-readable format (JSON,
CSV)
• Right to Object: Opt-out of marketing and analytics
5.7.6.4. Cross-Border Data Transfer:
• Data processing within Malaysia or Singapore only
• Standard contractual clauses for any international transfers
• Compliance with PDPA cross-border data transfer rules
5.7.6.5. Data Breach Response:
• Incident response plan with defined roles
• Breach notification to users within 72 hours
• Breach notification to regulatory authority (PDPC)
• Post-incident review and remediation
Private & Confidential Page 55 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
6. Data Management Architecture
6.1 Payer-Centric Unified Profile
The cornerstone of NKS 2.0 is the Unified Payer Profile, which consolidates all
payer information into a single, authoritative source.
Figure 6.1: Unified Payer Profile
Key Design Principles:
1. Single Source of Truth: One profile per payer across all channels
2. 360° View: Complete history of static identity and dynamic transactions
3. Type Safety: Polymorphic design for different payer types
4. Relationship Aware: Track employer-employee, agent-payer relationships
5. Temporal Data: Historical tracking of all profile changes
6. Privacy First: Separate anonymous profiles with no PII linkage
Private & Confidential Page 56 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
6.1.1. Profile Features:
6.1.1.1. Static Identity Data:
• Core identifying information (name, IC, contact)
• KYC documentation (identity verification status)
• Address and geographic data
6.1.1.2. Dynamic Transaction Data:
• Payment history with full details
• Zakat calculations over time
• Commission earnings (for agents)
• Scheduled payments and mandates
6.1.1.3. Payment Preferences:
• Saved and tokenized payment methods
• Preferred payment channel (FPX, card, e-wallet)
• Default zakat allocation
• Receipt delivery preference (email, SMS, app)
6.1.1.4. Behavioral Analytics:
• Payment frequency and patterns
• Average payment amount
• Preferred payment time (day of month, time of day)
• Channel preference (web, mobile, agent)
• Churn risk score (ML-predicted)
6.2 MySQL Database Architecture
Our architecture uses MySQL 8.0+ as the single, unified database solution for all
data storage needs. This simplified approach reduces operational complexity while
maintaining enterprise-grade performance and reliability.
Private & Confidential Page 57 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
6.2.1 MySQL Configuration & Architecture
Version: MySQL 8.0+ (latest stable, preferably 8.0.35+)
6.2.1.1. Deployment Architecture:
Figure 6.2: Deployment Architecture
6.2.1.2. High Availability Setup:
• Primary-Replica Replication: Asynchronous replication for read
scaling
• Semi-Synchronous Replication: Optional for critical writes
• Automatic Failover: Orchestrator or MHA (Master High Availability)
• Read/Write Splitting: ProxySQL to route reads to replicas
• Connection Pooling: ProxySQL with 1000 max connections
6.2.2 Performance Optimizations
6.2.2.1. Indexing Strategy
• Primary Keys: Clustered index on id (B-tree)
• Foreign Keys: Non-clustered indexes on all foreign key columns
• Frequently Queried Columns: Indexes on status, created_at, payer_id
• Full-Text Search: FULLTEXT indexes on name, description columns
• JSON Columns: Virtual columns with indexes for frequently queried JSON
fields
Private & Confidential Page 58 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
6.2.2.2. Table Partitioning
• Range Partitioning: Partition transactions table by year
• Benefits: Faster queries on recent data, easier archival of old data
• Partition Maintenance: Automatic partition creation via scheduled job
6.2.2.3. Caching Strategy (Optional Redis)
• Application-Level Cache: Cache payer profiles in Redis (5-minute TTL)
• Query Result Cache: Cache expensive aggregation queries
• Session Storage: Store user sessions in Redis
• Rate Limiting: Redis for API rate limit counters
6.2.3 Monitoring & Maintenance
6.2.3.1. Monitoring Metrics (Prometheus + Grafana):
• Connection Metrics: Active connections, connection pool usage
• Query Performance: Slow queries (>1 second), query execution time
• Replication Lag: Seconds behind primary (alert if >30 seconds)
• InnoDB Metrics: Buffer pool hit ratio, dirty pages, lock waits
• Storage Metrics: Disk usage, IOPS, table sizes
6.2.3.2. Slow Query Log:
• Enable slow query log for queries >1 second
• Analyze with pt-query-digest (Percona Toolkit)
• Regular review and optimization of slow queries
6.3 Data Migration Strategy
Migrating ~4 TB of data with 44+ million records requires a robust, phased approach.
Phase 1: Assessment & Preparation (Weeks 1-4)
Data Profiling:
• Analyze legacy database schema and data types
• Identify data quality issues (nulls, duplicates, inconsistencies)
• Document business rules and constraints
• Estimate data volume per table
Private & Confidential Page 59 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
Data Mapping:
• Map legacy schema to new NKS 2.0 schema
• Identify transformations required
• Define data cleansing rules
• Create mapping documentation
Data Quality Assessment:
• Run data quality checks on legacy database
• Identify and flag problematic records
• Define data quality thresholds (acceptable error rate)
• Create cleansing scripts for common issues
Phase 2: Incremental Migration (Weeks 5-12)
ETL Pipeline Development:
• Apache Airflow DAGs for orchestration
• Extraction: Query legacy database in batches (10K records per batch)
• Transformation: Cleanse, validate, enrich data
• Loading: Bulk insert into MySQL with transaction management
• Error Handling: Failed records logged to separate MySQL error table for manual
review
Migration Sequence:
1. Reference Data: Zakat types, payment methods, configuration
2. Payer Profiles: Individual, company, agent profiles (deduplicate)
3. Historical Transactions: Payment history (oldest to newest)
4. Relationships: Employer-employee, agent-payer mappings
5. Documents: Migrate file references and re-upload documents to S3
Validation & Reconciliation:
• Row count verification (legacy vs new)
• Checksum comparison for data integrity
• Sample record comparison (random 1000 records)
• Business logic validation (total revenue, transaction count)
Private & Confidential Page 60 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Reconciliation reports for discrepancies
Phase 3: Parallel Run (Weeks 13-16)
Dual-Write Strategy:
• New transactions written to both legacy and NKS 2.0 systems
• Compare results for consistency
• Incremental delta sync for any missed records
• User acceptance testing with real data
Performance Testing:
• Load testing with production data volumes
• Query performance benchmarking
• Index optimization based on real queries
• Identify and resolve bottlenecks
Phase 4: Cutover & Go-Live (Week 17)
Final Delta Sync:
• Schedule cutover during low-traffic window (e.g., Saturday night)
• Final sync of any records created/updated during parallel run
• Disable legacy system writes
Validation:
• Verify row counts match
• Verify critical business metrics (total revenue, payer count)
• Smoke testing of critical user journeys
Go-Live:
• Switch DNS/load balancer to NKS 2.0
• Monitor closely for 48 hours
• Keep legacy system in read-only mode for 30 days as backup
Private & Confidential Page 61 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
Rollback Plan:
• Documented rollback procedure
• Database snapshots before cutover
• Quick switch back to legacy if critical issues
• Communication plan for stakeholders
Migration Tools:
• Apache NiFi / Talend: Data integration and ETL
• Flyway / Liquibase: Database schema migration
• Custom Python Scripts: Complex transformations
• Data Validation Framework: Automated quality checks
6.4 Data Quality Framework
6.4.1 Data Governance:
• Data Steward for each domain (Payer Data, Payment Data, Analytics)
• Data Quality Council for policy decisions
• Monthly data quality review meetings
• Data catalog with metadata and lineage
6.4.2 Data Quality Dimensions:
● Accuracy: Data correctly represents real-world values
● Completeness: All required fields populated
● Consistency: Data is consistent across systems
● Timeliness: Data is up-to-date and available when needed
● Validity: Data conforms to defined formats and rules
● Uniqueness: No duplicate records
6.4.3. Data Quality Rules:
• Payer IC Number: Valid format (12 digits, valid date), no duplicates
• Email Address: Valid email format, confirmed via verification link
• Phone Number: Malaysian format (+60), verified via OTP
• Payment Amount: Positive number, within reasonable range (RM 1 - RM
1,000,000)
Private & Confidential Page 62 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Transaction Date: Not future-dated, within business hours
6.4.4. Data Quality Monitoring:
• Automated data quality checks on every batch load
• Data quality dashboards with metrics and trends
• Alerts for quality threshold breaches (e.g., >1% invalid records)
• Root cause analysis for quality issues
6.5.5. Data Cleansing:
• Automated cleansing rules for common issues
• Standardization (address formatting, name capitalization)
• Duplicate detection and merging with confidence scores
• Manual review queue for ambiguous cases
Private & Confidential Page 63 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
7. Payment Processing Integration
7.1 Billplz Payment Gateway Integration
Our payment integration uses Billplz payment gateway that handles FPX, cards, and e-
wallets, providing a unified payment experience.
Figure 7.1: Payment Orchestration Layer
7.2 Payment Gateway Integration Details
7.2.1 FPX (Financial Process Exchange) Integration
7.2.1.1. Overview:
• Malaysia's national online banking payment gateway
• Connects to all major Malaysian banks
• Real-time payment confirmation
• Both B2C and B2B payment modes
7.2.1.2. Implementation:
• Direct integration with FPX network (not via aggregator)
• FPX API v3 for enhanced security
• Bank selection UI showing online/offline status
• Automatic retry for timeout scenarios
7.2.1.3. Payment Flow:
Private & Confidential Page 64 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
1. User selects FPX as payment method
2. User selects bank from list
3. Redirect to bank's online banking portal
4. User authenticates and confirms payment
5. Redirect back to NKS with payment status
6. Callback webhook for final confirmation
7. Transaction recorded and receipt generated
7.2.1.4. FPX Features:
• Buyer and seller signature verification
• Transaction expiry (30 minutes)
• Support for large transactions (up to RM 1 million)
• Detailed transaction status (successful, failed, pending)
7.2.2 Credit/Debit Card Integration
7.2.2.1. Gateway:
• Billplz payment gateway: Handles all card processing (international and
local cards)
7.2.2.2. PCI-DSS Compliance:
• Level 1 Certified: Billplz payment gateway is PCI-DSS Level 1 compliant
• SAQ A: We use hosted payment pages (no card data touches our servers)
• Tokenization: Card details tokenized immediately, never stored in
plaintext
• Compliance Scope: Minimal scope due to no card data storage
7.2.2.3. Card Types Supported:
• Visa (credit and debit)
• Mastercard (credit and debit)
• American Express
• UnionPay (for Chinese users)
Private & Confidential Page 65 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
7.2.2.4 Payment Flow:
1. User enters card details or selects saved card
2. Frontend submits to payment gateway (not our server)
3. Gateway tokenizes card and initiates 3DS2 (if required)
4. User completes 3DS2 challenge (biometric, SMS OTP)
5. Gateway processes payment and returns result
6. Backend receives webhook with payment status
7. Transaction recorded and receipt sent
7.2.2.6. Card-on-File (Saved Cards):
• Tokenized card storage (token stored, not actual card number)
• CVV not stored (required for each transaction)
• User can view last 4 digits and expiry date
• One-click payment with biometric confirmation (mobile)
• Automatic card update for expired/renewed cards (where supported)
7.2.3 E-Wallet Integration
7.2.3.1. Supported E-Wallets via Billplz:
• All major Malaysian e-wallets supported through Billplz payment gateway
7.2.3.2. Integration Approach:
• Billplz API integration for all e-wallet providers
• Deep linking for mobile app-to-app payment via Billplz
• QR code generation for agent-assisted payments via Billplz
• Callback webhook for payment confirmation from Billplz
7.2.3.3. Payment Flow (Mobile App to App):
1. User selects e-wallet (e.g., Touch 'n Go)
2. NKS generates payment request and deep link
3. Deep link opens e-wallet app
4. User confirms payment with PIN/biometric in e-wallet
5. E-wallet app returns to NKS with payment status
Private & Confidential Page 66 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
6. NKS receives webhook confirmation
7. Receipt displayed and sent
7.2.3.4. Payment Flow (QR Code for Cash Collection):
1. Agent generates QR code for payment amount
2. Payer scans QR code with e-wallet app
3. Payer confirms payment in e-wallet
4. Agent receives real-time notification of payment
5. Receipt printed/sent to payer
7.2.3.5. E-Wallet Features:
• Promotional campaigns (cashback, discounts) integration
• Recurring payments (where supported)
• Refund support via e-wallet reversal
7.2.4 Cash Payment Reconciliation
7.2.4.1. Cash Collection Channels:
• Agent field collection
• Bank counter deposits
• CDM (Cash Deposit Machine)
Private & Confidential Page 67 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
7.3 Payment Processing Workflows
7.3.1 Standard Payment Flow
Single Payment:
Figure 7.2: Standard Payment Flow
Error Handling:
Private & Confidential Page 68 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Gateway timeout: Retry with exponential backoff (3 attempts)
• Gateway error: Failover to secondary gateway
• Insufficient funds: Clear error message, suggest alternative payment methods
• Network error: Queue transaction for retry, show pending status
7.3.2 Bulk Payment Processing
Use Case: Employer bulk zakat deduction for 1000+ employees
Workflow:
1. File Upload:
○ Employer uploads CSV/Excel file
○ Schema validation (required columns, data types)
○ Data validation (employee exists, amount valid, IC format)
○ Duplicate detection within file
○ Preview screen with validation results
2. Approval:
○ Submit for approval (if total amount > threshold)
○ Multi-level approval workflow
○ Email notification to approvers
○ Approval history audit trail
3. Processing:
○ Queue-based asynchronous processing (BullMQ)
○ Process in batches of 100 transactions
○ Individual transaction validation
○ Payment attempt for each employee
○ Error handling for failed transactions
4. Reconciliation:
○ Batch reconciliation report
○ Success count, failure count, total amount
○ Detailed error log for failures
○ Retry mechanism for failed transactions
○ Email summary report to employer
Private & Confidential Page 69 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
Bulk Processing Features:
• Pause/resume capability
• Scheduled processing (e.g., process at 2 AM to avoid peak hours)
• Progress tracking (% complete, estimated time remaining)
• Export detailed report (success/failures with reasons)
7.3.3 Scheduled/Recurring Payments
Use Case: Individual sets up monthly zakat payment
Setup Workflow:
1. User selects "Scheduled Payment"
2. User configures:
○ Payment amount
○ Frequency (weekly, monthly, yearly)
○ Start date and end date (or until cancelled)
○ Payment method (saved card token or bank account)
3. User confirms mandate with authentication
4. Tokenized payment method stored
5. Schedule created in database
Execution Workflow:
1. Scheduled job runs daily at 2 AM (checks upcoming payments)
2. For each due payment:
○ Create transaction record (status: pending)
○ Initiate payment with tokenized method
○ Handle 3DS challenge via SMS/email link (for cards)
○ Update transaction status based on result
○ Send notification (success or failure)
3. Retry logic for failures:
○ Retry next day for temporary failures (insufficient funds, network error)
○ Maximum 3 retries over 3 days
○ Notify user after final failure and pause schedule
7.3.3.1. User Management:
• View all scheduled payments
Private & Confidential Page 70 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Modify amount or frequency
• Pause/resume schedule
• Cancel schedule
• View payment history for schedule
7.3.3.2. Notifications:
• Reminder 3 days before payment (configurable)
• Confirmation after successful payment
• Alert for failed payment with action required
• Monthly summary of scheduled payments
7.4 Payment Security
7.4.1. Transaction Security:
• End-to-end encryption for payment data (TLS 1.3)
• Tokenization for all stored payment methods
• PCI-DSS compliance via hosted payment pages
• 3D Secure 2.0 for card authentication
• Biometric confirmation for mobile payments
7.4.2. Fraud Detection:
• Machine learning models for fraud scoring
• Real-time fraud checks:
○ Velocity checks (transactions per user/card/IP)
○ Geolocation verification (Malaysia IP addresses)
○ Device fingerprinting
○ Behavioral biometrics (typing patterns, mouse movements)
• Manual review queue for high-risk transactions
• Automatic blocking for known fraudulent patterns
7.4.3. Transaction Limits:
• Per-transaction limits (e.g., RM 50,000 per payment)
• Daily limits (e.g., RM 100,000 per day per user)
• Monthly limits (configurable per user type)
• Step-up authentication for large transactions (>RM 10,000)
Private & Confidential Page 71 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
7.4.4. Chargeback Prevention:
• Clear transaction descriptions
• Immediate confirmation and receipts
• Customer support for disputes
• Evidence collection for chargeback disputes
7.5 Payment Reconciliation & Settlement
7.5.1. Daily Reconciliation Process:
7.5.1.1. Data Collection (8 AM):
○ Download settlement files from all gateways
○ Parse bank statements (MT940, CSV)
○ Extract agent deposit slips from MySQL database
7.5.1.2. Automated Matching (8:30 AM):
○ Match by transaction ID (exact match)
○ Match by amount + date + payer (fuzzy match with 95% confidence)
○ Flag unmatched transactions for review
7.5.1.3. Manual Review (9 AM - 12 PM):
○ Review flagged transactions
○ Manual matching with search tools
○ Investigate discrepancies
○ Approve or reject matches
7.5.1.4. Reporting (12 PM):
○ Generate reconciliation report
○ Email to finance team
○ Dashboard update with metrics
7.5.1.5. SAP Integration (1 PM):
○ Post reconciled transactions to SAP
○ Generate accounting entries (debit/credit)
○ Update general ledger
7.5.2. Reconciliation Dashboard:
• Total transactions vs total settlements
• Matched count, unmatched count, discrepancy count
• Amount reconciled vs amount outstanding
Private & Confidential Page 72 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Gateway-wise breakdown
Private & Confidential Page 73 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
8. The Brain - Business Logic Engine
"The Brain" is the centralized business logic engine that automates complex workflows,
calculations, and decision-making processes.
8.1 Business Rules Engine Architecture
Main: Easy Rules (lightweight Java rules engine)
Architecture:
Figure 8.1: Business Rules Engine Architecture
Benefits:
• Centralized Logic: Business rules in one place, not scattered across code
• Business User Friendly: Non-developers can modify rules with guidance
• Version Control: Track changes, rollback if needed
• Testing: Test rules with sample data before deployment
• Performance: Optimized rule evaluation with Rete algorithm
Private & Confidential Page 74 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
8.2 Core Business Logic Components
8.2.1 Registration Processing Engine
Multi-Stage Registration Workflow:
Stage 1: Identity Verification
• IC number format validation (Malaysian IC: YYMMDD-PB-###G)
• IC number uniqueness check (prevent duplicates)
• Integration with JPN (Jabatan Pendaftaran Negara) API for IC verification
• Business registration verification for companies (SSM API)
• Agent license verification
Stage 2: Document Upload
• IC copy (front and back)
• Proof of address (utility bill, bank statement)
• Company registration certificate (for companies)
• Agent license (for agents)
• OCR for document data extraction
• Document quality check (resolution, blur detection)
Stage 3: KYC Verification
• Manual review by admin (if flagged by automated checks)
• Cross-reference with sanctions lists (OFAC, UN, Malaysia)
• Risk scoring based on profile data
• Approval or rejection with reason
Stage 4: Profile Activation
• Generate unique payer ID
• Create unified profile in database
• Send welcome email/SMS with login credentials
• Enable payment capabilities
8.2.2 Commission Calculation Engine
8.2.2.1. Commission Models:
Private & Confidential Page 75 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
Model 1: Percentage-Based
• Fixed percentage of payment amount
• Example: 5% commission on all payments
• Formula: commission = payment_amount * 0.05
Model 2: Tiered Commission Slabs
• Different percentages for different payment ranges
• Example:
○ RM 0 - 1,000: 3%
○ RM 1,001 - 5,000: 4%
○ RM 5,001+: 5%
• Formula: Progressive calculation based on slabs
Model 3: Performance-Based Multipliers
• Base commission multiplied by performance factor
• Performance factor based on:
○ Total collection amount (monthly target achievement)
○ Number of new payers acquired
○ Payment retention rate
• Example: Base 3% * 1.2 multiplier = 3.6% effective commission
Model 4: Hybrid Model
• Combination of percentage + flat bonus
• Example: 4% + RM 10 per transaction
8.2.2.2. Commission Configuration:
• Admin UI to configure commission structures
• Effective date for new commission rates
• Agent-specific commission overrides
• Special campaigns (double commission for Ramadan)
Private & Confidential Page 76 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
8.2.2.3. Real-Time Commission Preview:
• Agent sees commission amount before confirming payment
• Mobile app shows running total of daily/monthly commission
• Projection of commission if target achieved
8.2.2.4. Commission Calculation Workflow:
1. Payment completed event published
2. Commission service receives event
3. Retrieve agent's commission structure
4. Calculate commission based on rules
5. Record commission transaction
6. Update agent's commission balance
7. Notify agent of commission earned
8.2.2.5. Commission Disbursement:
• Monthly payout schedule (e.g., 5th of every month)
• Minimum payout threshold (e.g., RM 100)
• Payment method: Bank transfer
• Commission statement PDF generated and emailed
• Tax withholding (if applicable)
8.2.3 Zakat Calculation Engine
Shariah-Compliant Zakat Formulas:
8.2.3.1. Zakat Fitrah (Zakat al-Fitr):
• Fixed amount per person
• Based on price of staple food (rice)
• Formula: zakat_fitrah = current_rice_price_per_kg * 2.7kg
• Example: RM 2.50/kg * 2.7kg = RM 6.75 per person
• Multiplied by number of dependents
8.2.3.2. Zakat Pendapatan (Income Zakat):
• 2.5% of savings after nisab threshold
• Nisab threshold: 85g of gold value
Private & Confidential Page 77 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Formula: zakat_pendapatan = (annual_income - basic_expenses - debts)
* 0.025 (if above nisab)
• Uruf method (deduct average monthly expenses)
8.2.3.3. Zakat Perniagaan (Business Zakat):
• 2.5% of net business assets
• Formula: zakat_perniagaan = (current_assets + inventory - liabilities) *
0.025 (if above nisab)
• Haul: One lunar year of ownership
8.2.3.4. Zakat Simpanan (Savings Zakat):
• 2.5% of savings above nisab threshold
• Formula: zakat_simpanan = (total_savings - nisab_threshold) * 0.025
• Includes: Cash, bank deposits, fixed deposits, ASB
8.2.3.5. Zakat Saham (Shares/Stock Zakat):
• 2.5% of share value
• Formula: zakat_saham = current_share_value * 0.025
• Calculated annually
8.2.3.6. Zakat KWSP (EPF Zakat):
• 2.5% of EPF savings above nisab
• Formula: zakat_kwsp = (epf_balance - nisab_threshold) * 0.025
8.2.3.7. Zakat Emas/Perak (Gold/Silver Zakat):
• 2.5% of gold/silver value
• Nisab: 85g for gold, 595g for silver
• Formula: zakat_emas = (gold_weight_grams - 85) *
current_gold_price_per_gram * 0.025
8.2.3.8. Nisab Threshold Management:
• Daily update of nisab value based on current gold price
• Gold price API integration (reliable source)
• Historical nisab values for accurate calculation
Private & Confidential Page 78 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
8.2.3.9. Haul (One Lunar Year) Tracking:
• Hijri calendar support for haul calculation
• Reminder when haul completed (asset held for one year)
• Automatic calculation trigger
8.2.3.10 Zakat Calculator UI:
• Step-by-step wizard for different zakat types
• Input fields for income, assets, debts, dependents
• Real-time calculation as user enters data
• Breakdown of calculation (transparent formula)
• Shariah references for each zakat type
• Option to pay calculated amount or enter custom amount
8.2.3.11 Manual Override:
• Admin can override calculated zakat (with approval)
• Reason required for override
• Audit trail of all overrides
• Shariah board review for disputed cases
8.2.4 Automated Reconciliation Engine
8.2.4.1. Bank Statement Parsing:
Supported Formats:
• MT940 (SWIFT standard)
• CSV (custom formats per bank)
• PDF (with OCR)
• Excel
Parsing Workflow:
1. Upload statement file
2. Detect format and bank
3. Parse transactions (date, amount, reference, description)
4. Extract reference numbers and payment details
Private & Confidential Page 79 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
5. Store parsed transactions in MySQL database
8.2.4.2. Fuzzy Matching Algorithm:
Exact Match (Priority 1):
• Transaction ID match
• Reference number match
• Confidence: 100%
Amount + Date Match (Priority 2):
• Same amount (exact to cent)
• Same date or ±1 day
• Confidence: 90-95%
Fuzzy Match (Priority 3):
• Similar amount (within 1% difference)
• Similar date (±3 days)
• Payer name similarity (Levenshtein distance)
• Confidence: 70-89%
Machine Learning Enhancement:
• Train ML model on historical matched data
• Features: Amount, date difference, payer name similarity, description
keywords
• Predict match probability
• Improve accuracy over time
Manual Reconciliation Interface:
• Side-by-side view: NKS transaction vs bank transaction
• Search and filter tools
• Bulk matching (select multiple and confirm match)
• Split transaction (one bank transaction = multiple NKS payments)
• Merge transactions (multiple bank transactions = one NKS payment)
• Notes and comments for each match
Private & Confidential Page 80 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
8.2.5 Receipt Generation Engine
Receipt Components:
8.2.5.1. Header:
• LZS logo
• Receipt title ("Resit Pembayaran Zakat")
• Receipt number (unique, sequential)
• Date and time of payment
• QR code (for verification)
8.2.5.2. Payer Information:
• Name (or "Hamba Allah" for anonymous)
• IC number (masked for privacy: 123456--*)
• Address
• Phone/email
8.2.5.3. Payment Details:
• Zakat type (Fitrah, Pendapatan, etc.)
• Payment amount (RM)
• Payment method (FPX, Card, E-Wallet, Cash)
• Transaction reference number
8.2.5.4. Footer:
• Thank you message
• Contact information
• Tax deduction disclaimer
• Digital signature (for authenticity)
• Shariah compliance statement
8.2.5.5. Language Support:
• Bahasa Melayu & English
8.2.5.6. Receipt Formats:
• PDF (high-quality, printable)
• Image (PNG for mobile sharing)
Private & Confidential Page 81 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• HTML (for email viewing)
8.2.5.7 QR Code:
• Encode receipt verification URL
• URL format: https://nks.lzs.my/verify?receipt=ABC123
• Scan to verify authenticity and view online copy
• Public verification (no login required)
8.2.5.8. Digital Signature:
• Cryptographic signature for tamper detection
• Verifiable via QR code scan
• Certificate-based signing
8.2.5.8. Receipt Delivery:
• Email (PDF attachment)
• SMS (download link)
• Mobile app (view and download)
• WhatsApp (for agents, if preferred)
8.2.5.9. Receipt Repository:
• All receipts stored in S3 with lifecycle policy
• Searchable by receipt number, payer, date, amount
• Bulk download for annual tax summary
• Reprint capability (with watermark "DUPLICATE")
8.3 Dynamic Configuration Management
8.3.1. Configuration UI (Admin Portal):
8.3.1.1. Commission Rate Configuration:
• Add/edit commission structures
• Assign to specific agents or agent groups
• Set effective dates (future-dated changes)
• Preview impact on historical data
Private & Confidential Page 82 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
8.3.1.2. Zakat Parameter Management:
• Update nisab thresholds (gold price changes)
• Configure zakat calculation formulas
• Set payment minimums and maximums
• Manage zakat categories
8.3.1.3. Payment Gateway Settings:
• Enable/disable gateways
• Configure gateway priority (primary, fallback)
• Set transaction routing rules
• Update API credentials securely
8.3.1.4. Fee Structure Configuration:
• Transaction fees (percentage or flat)
• Monthly maintenance fees
• Convenience fees for certain payment methods
• Promotional fee waivers
8.3.1.5. Holiday Calendar Management:
• Malaysian public holidays
• State-specific holidays
• Custom holidays (Ramadan period, etc.)
• Impact on payment processing and SLAs
8.3.1.6. Notification Templates:
• Email templates (HTML with placeholders)
• SMS templates (160 characters, dynamic content)
• Push notification templates
• Bahasa Melayu interface
8.4 Integration with Core Systems
8.4.1. The Brain Integration Points:
8.4.1.1. Payer Profile Service:
• Query: Get payer details for eligibility checks
Private & Confidential Page 83 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Command: Update payer status after registration approval
8.4.1.2. Payment Service:
• Query: Get payment details for commission calculation
• Event: Subscribe to payment completed events
8.4.1.3. Notification Service:
• Command: Send email, SMS, push notifications
• Template rendering with dynamic data
8.5.1.4. Reporting Service:
• Query: Aggregate data for business metrics
• Event: Publish business events for analytics
8.5.2. Integration Patterns:
• Synchronous: REST API calls for real-time queries
• Asynchronous: Kafka events for fire-and-forget commands
• Saga Pattern: Distributed transactions across services (e.g., payment +
commission + SAP posting)
Private & Confidential Page 84 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
9. Reporting & Analytics Architecture
9.1 Analytics Architecture Layers
Our analytics architecture is designed for real-time insights and predictive capabilities:
Figure 9.1: Analytic Architecture Layer
Private & Confidential Page 85 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
9.2 Real-Time Dashboard Capabilities
9.2.1 Executive Dashboard
9.2.1.1. Key Metrics:
• Total Collection: Daily, MTD, YTD with comparison to previous periods
• Payer Growth: New payers today, this month, trend chart
• Collection vs Target: Progress bar showing % achievement
• Payment Method Distribution: Pie chart (FPX, Cards, E-Wallet, Cash)
• Top Zakat Types: Bar chart of collection by zakat category
• Geographic Distribution: Heat map of collection by state
• Real-Time Transaction Feed: Last 10 transactions (live update)
9.2.1.2. Interactivity:
• Click on metric to drill down to details
• Date range picker for custom periods
• Export to PDF/Excel
• Scheduled email delivery (daily summary)
9.2.1.3. Technology:
• React + Recharts for charts
• WebSocket for real-time updates
• Server-sent events (SSE) for transaction feed
• Responsive design for mobile viewing
9.2.2 Operational Dashboard
9.2.2.1. Metrics:
• Payment Success Rate: % successful payments (trend over time)
• Pending Reconciliation: Count of unreconciled transactions
• Agent Performance: Top 10 agents by collection, commission earned
• Commission Summary: Total commission pending, paid, by agent
• System Health: API response time, error rate, uptime
• Gateway Performance: Success rate by payment gateway
• Error Tracking: Top errors, failed transactions by reason
Private & Confidential Page 86 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
9.2.4 Agent Performance Dashboard
9.2.4.1. Individual Agent View:
• Today's Collection: Real-time running total
• Commission Earned: Today, this month, all-time
• Payer Acquisition: New payers acquired this month
• Collection Efficiency: % of planned visits completed
• Ranking: Current position in leaderboard (gamification)
• Goals: Progress towards monthly target (progress bar)
• Performance Trends: Chart of daily collection over past 30 days
9.2.4.2. Agent Manager View:
• Overview of all agents in territory
• Comparative performance (table and charts)
• Underperforming agents flagged
• Training recommendations
• Commission liability (total pending payouts)
9.3 Predictive Analytics Capabilities
9.3.1 Machine Learning Models
9.3.1.1. Model 1: Payer Behavior Prediction
Objective: Predict likelihood of payment in next 30 days
Features:
• Historical payment frequency
• Average payment amount
• Last payment date (days since)
• Payment method preference
• Seasonal patterns (Ramadan, year-end)
• Demographic data (age, income bracket, location)
• Engagement metrics (app opens, email clicks)
Private & Confidential Page 87 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
Algorithm: Gradient Boosting (XGBoost)
Output: Probability score (0-1) for each payer
Use Cases:
• Prioritize outreach campaigns to high-likelihood payers
• Send reminders to at-risk payers (low likelihood)
• Optimize agent routes (visit high-likelihood payers)
9.3.1.2. Model 2: Payment Amount Forecasting
Objective: Predict next payment amount for personalized recommendations
Features:
• Historical payment amounts (mean, median, std dev)
• Income indicators (occupation, company size)
• Zakat type frequency
• Time of year (higher during Ramadan)
• Asset indicators (savings zakat, KWSP zakat amounts)
Algorithm: Linear Regression with Regularization (Lasso)
Output: Predicted payment amount (RM)
Use Cases:
• Pre-fill payment amount in UI
• Suggest optimal scheduled payment amount
• Personalized zakat recommendations
9.3.1.3. Model 3: Churn Prediction
Objective: Identify payers at risk of stopping payments
Features:
• Payment frequency decline
• Increasing payment interval
• Missed scheduled payments
• App usage decline
• Email open rate decline
• Support ticket sentiment
Private & Confidential Page 88 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
Algorithm: Random Forest Classifier
Output: Churn risk score (low, medium, high)
Use Cases:
• Proactive retention campaigns
• Personalized engagement (phone call from agent)
• Incentives (e.g., waive transaction fee)
9.3.1.4. Model 4: Zakat Potential Estimation
Objective: Estimate uncollected zakat potential
Features:
• Income indicators (occupation, company, job title)
• Payment history (consistency, amounts)
• Demographic data (age, family size, location)
• External data (median income by occupation, location)
• Declared assets (for calculation types filled)
Algorithm: Ensemble of Regression Models
Output: Estimated annual zakat potential (RM)
Use Cases:
• Identify high-potential payers for agent targeting
• Personalized zakat education (you may owe more)
• Strategic campaign planning
9.3.1.5. Model 5: Agent Performance Optimization
Objective: Recommend optimal commission structure to maximize collection
Features:
• Agent historical performance
• Commission structure experimentation data (A/B tests)
• Agent territory characteristics
• Agent demographics and experience
Private & Confidential Page 89 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
Algorithm: Reinforcement Learning (Multi-Armed Bandit)
Output: Recommended commission rate per agent
Use Cases:
• Dynamic commission optimization
• Identify underperforming agents needing training
• Territory reassignment recommendations
9.3.2 ML Technology Stack
9.3.2.1. Development:
• Python 3.11+: Primary language for ML
• Jupyter Notebooks: Exploratory data analysis and model development
• Scikit-learn: Classical ML algorithms
• XGBoost / LightGBM: Gradient boosting models
• Pandas: Data manipulation
• NumPy: Numerical computations
9.3.2.2. Model Management:
• MLflow: Experiment tracking, model versioning, model registry
• Feature Store (Feast): Centralized feature management and serving
• Model Monitoring: Data drift detection, model performance monitoring
9.4 Reporting Capabilities
9.4.1 Standard Reports
9.4.1.1. Daily Collection Summary:
• Total collection by payment method
• New payer count
• Transaction count by zakat type
• Top 10 agents by collection
• Payment success rate
• Pending reconciliation count
• Automated email at 5 PM to finance team
Private & Confidential Page 90 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
9.4.1.2. Monthly Financial Statement:
• Executive summary (total collection, growth %, highlights)
• Detailed breakdown by zakat type
• Channel performance (web, mobile, agent)
• Commission summary
• Reconciliation status
• SAP posting confirmation
• Generated on 1st of every month
9.4.1.3. Agent Commission Report:
• Agent details (name, ID, territory)
• Collection summary (transaction count, total amount)
• Commission earned (breakdown by calculation)
• Deductions (if any)
• Net payout amount
• Payment method (bank transfer details)
• Generated monthly for each agent
9.4.1.4. Payer Transaction History:
• Payer profile information
• All transactions (date, amount, zakat type, method, receipt#)
• Total amount paid (lifetime, this year)
• Scheduled payments (upcoming)
• Export to PDF for annual tax filing
9.4.1.5. Reconciliation Report:
• Matched transactions (count, total amount)
• Unmatched transactions (flagged for review)
• Discrepancies (amount differences, missing transactions)
• Gateway-wise breakdown
• Approvals and manual matches
• Generated daily post-reconciliation
Private & Confidential Page 91 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
9.4.1.6. Audit Compliance Report:
• User access logs (who accessed what, when)
• Data modifications (before/after values)
• Administrative actions (config changes, user management)
• Security events (failed logins, suspicious activity)
• Generated quarterly for compliance review
Private & Confidential Page 92 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
9.5 Data Warehouse Architecture
9.5.1 ETL Pipeline (Apache Airflow)
9.5.1.1. DAG Structure:
Daily ETL DAG (Runs at 1 AM):
├── Extract: Query MySQL for new/updated transactions
├── Extract: Query MySQL for audit logs
├── Transform: Data cleansing and validation
├── Transform: Dimension lookup and enrichment
├── Transform: Fact table aggregation
├── Load: Bulk insert into Druid/ClickHouse
├── Validation: Row count and checksum verification
└── Notification: Email on success/failure
9.5.1.2. Incremental Loading:
• Extract only new data since last run (based on updated_at timestamp)
• Upsert strategy for updates (update if exists, insert if new)
• Full refresh weekly for dimension tables
9.5.1.3. Data Transformation:
• Standardize date formats (UTC to Malaysia time)
• Normalize text (uppercase names, trim whitespace)
• Enrich with derived fields (payment month, day of week, hour)
• Calculate aggregates (daily total, monthly total)
• Lookup dimension keys (payer_key, agent_key, time_key)
9.5.1.4. Data Quality Validation:
• Schema validation (correct data types, required fields)
• Range validation (positive amounts, valid dates)
• Referential integrity (payer exists, zakat type exists)
• Duplicate detection
• Outlier detection (amounts >3 std deviations flagged)
• Failed records logged for review
Private & Confidential Page 93 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
9.5.1.5. Error Handling:
• Retry failed tasks (max 3 attempts with exponential backoff)
• Alert on failure (email to data team)
• Continue on error for non-critical transformations
• Rollback on critical errors
9.5.2 Data Lake (Optional for Advanced Analytics)
Use Cases:
• Store raw, unstructured data (logs, documents, images)
• Historical data archive (older than 3 years)
• Exploratory data analysis
• Machine learning feature engineering
Technology:
• AWS S3 object storage
• Parquet/ORC format for structured data (columnar, compressed)
• JSON for semi-structured data
• Data catalog: AWS Glue or Apache Hive
Data Organization:
• Folder structure: /raw/source/date/, /processed/domain/date/
• Metadata in catalog for discoverability
• Access control via IAM policies
Private & Confidential Page 94 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
10. Testing & Quality Assurance Approach
10.1 Testing Strategy Pyramid
Our testing strategy follows the test pyramid principle: more unit tests, fewer
integration tests, and even fewer E2E tests.
Figure 10.1: Testing Strategy Pyramid
Coverage Targets:
• Unit Tests: >80% code coverage
• Integration Tests: All API endpoints, database operations
• E2E Tests: All critical user journeys (10-15 scenarios)
• Performance Tests: Simulate peak load scenarios
• Security Tests: OWASP Top 10 coverage
10.2 Testing Levels
Private & Confidential Page 95 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
10.2.1 Unit Testing
10.2.1.1. Backend (Nest.js + TypeScript):
• Framework: Jest (built-in with Nest.js)
• Mocking: Jest mocks and @nestjs/testing utilities
• Coverage: Istanbul (integrated with Jest)
• Assertions: Jest expect() with matchers
Test Structure:
describe('CommissionService', () => {
let service: CommissionService;
beforeEach(async () => {
const module = await Test.createTestingModule({
providers: [CommissionService],
}).compile();
service = module.get<CommissionService>(CommissionService);
});
it('should calculate commission correctly', () => {
// Given
const payment = {
amount: 1000.00,
payerId: 'PAYER123',
};
const commissionRate = 0.05; // 5%
// When
const commission = service.calculateCommission(payment, commissionRate);
// Then
expect(commission).toBe(50.00);
});
it('should handle zero amount', () => {
const payment = { amount: 0, payerId: 'PAYER123' };
const commission = service.calculateCommission(payment, 0.05);
expect(commission).toBe(0);
});
});
1.2.1.2. Frontend Web (Vue.js + TypeScript):
• Framework: Vitest (Vite-powered, faster than Jest)
• Testing Library: @vue/test-utils + @testing-library/vue
• Mocking: MSW (Mock Service Worker) for API mocking
• Coverage: c8 or Istanbul
Test Example:
import { mount } from '@vue/test-utils';
Private & Confidential Page 96 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
import { describe, it, expect } from 'vitest';
import PaymentForm from '@/components/PaymentForm.vue';
describe('PaymentForm', () => {
it('submits payment successfully', async () => {
const wrapper = mount(PaymentForm);
// User interactions
await wrapper.find('[data-testid="amount-input"]').setValue('100');
await wrapper.find('[data-testid="zakat-type"]').setValue('Fitrah');
await wrapper.find('[data-testid="submit-button"]').trigger('click');
// Wait for async operations
await wrapper.vm.$nextTick();
// Assertions
expect(wrapper.find('[data-testid="success-message"]').text())
.toBe('Payment successful');
});
});
1.2.1.3. Mobile (React Native):
• Framework: Jest (React Native comes with Jest pre-configured)
• Testing Library: React Native Testing Library
• Mocking: Jest mocks for native modules
• Coverage: Istanbul
Test Example:
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PaymentScreen from '@/screens/PaymentScreen';
describe('PaymentScreen', () => {
it('processes payment successfully', async () => {
const { getByTestID, getByText } = render(<PaymentScreen />);
// User interactions
fireEvent.changeText(getByTestID('amount-input'), '100');
fireEvent.changeText(getByTestID('zakat-type-input'), 'Fitrah');
fireEvent.press(getByTestID('submit-button'));
// Wait for async operations
await waitFor(() => {
expect(getByText('Payment successful')).toBeTruthy();
});
});
});
1.2.1.4. Test Driven Development (TDD):
• Write test first (red)
Private & Confidential Page 97 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Implement code to pass test (green)
• Refactor code while keeping tests green
• Benefits: Better design, higher coverage, fewer bugs
1.2.1.5. Test Coverage Targets:
• Nest.js Services: >85% coverage (critical business logic)
• Vue.js Components: >80% coverage
• React Native Components: >80% coverage
• Utility Functions: 100% coverage
10.2.2 Integration Testing
10.2.2.1. API Integration Testing (Nest.js):
• Framework: Jest + Supertest for HTTP API testing
• Test Scope: Controller → Service → Database end-to-end
• Test Database: MySQL test database (separate from dev)
Example:
describe('PaymentController (e2e)', () => {
let app: INestApplication;
let paymentService: PaymentService;
beforeAll(async () => {
const moduleFixture = await Test.createTestingModule({
imports: [AppModule],
}).compile();
app = moduleFixture.createNestApplication();
await app.init();
paymentService = moduleFixture.get<PaymentService>(PaymentService);
});
it('/POST payments - should create payment and return receipt', () => {
const paymentDto = {
payerId: 'PAYER123',
amount: 500.00,
zakatType: 'Pendapatan',
};
return request(app.getHttpServer())
.post('/api/v1/payments')
.send(paymentDto)
.expect(201)
.expect((res) => {
expect(res.body.receiptNumber).toBeDefined();
Private & Confidential Page 98 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
expect(res.body.amount).toBe(500.00);
expect(res.body.status).toBe('SUCCESSFUL');
});
});
afterAll(async () => {
await app.close();
});
});
10.2.2.3. Message Queue Integration Testing:
• BullMQ Testing: Use test Redis instance for queue testing
• Job Processing: Test job enqueue, processing, and completion
• Verify: Job result and side effects
Example:
describe('Email Queue', () => {
it('should process email job successfully', async () => {
await emailQueue.add('send-receipt', {
to: 'user@example.com',
receiptId: 'RCP123',
});
// Wait for job to complete
await new Promise(resolve => setTimeout(resolve, 1000));
const completedJobs = await emailQueue.getCompleted();
expect(completedJobs).toHaveLength(1);
expect(completedJobs[0].data.to).toBe('user@example.com');
});
});
10.2.2.4. External API Mocking:
• MSW (Mock Service Worker): Mock external HTTP APIs (payment
gateways, SAP)
• Stubbing: Define request/response stubs
• Nock: Alternative HTTP mocking library
Example with MSW:
const server = setupServer(
rest.post('https://fpx-gateway.com/api/payment', (req, res, ctx) => {
return res(
ctx.json({
Private & Confidential Page 99 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
transactionId: 'FPX123456',
status: 'SUCCESS',
})
);
})
);
beforeAll(() => server.listen());
afterAll(() => server.close());
10.2.3 End-to-End (E2E) Testing
Web Application E2E (Vue.js):
• Framework: Playwright (faster, more reliable than Selenium)
• Alternative: Cypress (Vue.js has excellent Cypress support)
• Component Testing: Cypress Component Testing for isolated component
tests
10.2.3.1. Critical User Journeys:
1. Individual Payer Payment Flow:
○ User registers account
○ User logs in
○ User navigates to payment page
○ User enters payment amount and zakat type
○ User selects payment method (FPX)
○ User completes payment at bank portal (mocked)
○ User redirected to success page
○ User receives receipt via email
○ Verify transaction in database
2. Employer Bulk Payment:
○ Employer logs in
○ Employer uploads employee CSV file
○ System validates file
○ Employer reviews preview
○ Employer submits for processing
○ Employer monitors processing status
○ Employer downloads completion report
○ Verify all transactions in database
Private & Confidential Page 100 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
3. Agent Cash Collection:
○ Agent logs into mobile app
○ Agent records cash payment offline
○ Agent submits bank deposit slip
○ System reconciles deposit
○ Payer receives receipt
○ Agent sees commission credited
○ Verify transaction and commission in database
10.2.3.2. E2E Test Execution:
• Run on schedule (nightly after deployments)
• Run on-demand before releases
• Run on multiple browsers (Chrome, Firefox, Safari)
• Run on multiple devices (desktop, tablet, mobile)
• Record video on failure for debugging
• Screenshot on assertion failure
10.2.3.3. Mobile App E2E (React Native):
• Primary Framework: Detox (Gray box E2E testing for React Native)
○ Synchronization with React Native automatically (no manual waits)
○ Runs on iOS Simulator and Android Emulator
○ Can run on real devices
• Alternative: Appium (Black box testing, more flexible but slower)
○ Cross-platform testing
○ Real device support via BrowserStack/Sauce Labs
• Maestro: Modern mobile E2E testing framework (newer option)
10.2.3.4. Device Matrix:
• iOS Simulators: iPhone 13, 14, 15 (iOS 15, 16, 17)
• Android Emulators: Pixel 5, 6, 7 (API 29, 30, 31, 33)
• Real Devices (via Cloud): BrowserStack or Firebase Test Lab for final
validation
Private & Confidential Page 101 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
10.2.4 Performance Testing
10.2.4.1. Load Testing:
• Tool: Apache JMeter or Gatling
• Scenario: Simulate 10,000 concurrent users
• Duration: 30 minutes sustained load
• Metrics: Response time (p50, p95, p99), throughput, error rate
10.2.4.2. Test Scenarios:
1. Normal Load: 5,000 concurrent users
2. Peak Load: 10,000 concurrent users (Friday prayer time)
3. Spike Test: Sudden surge to 15,000 users
4. Soak Test: 5,000 users for 24 hours (detect memory leaks)
10.2.4.3. Performance Benchmarks:
• API response time: <500ms (p95), <1000ms (p99)
• Payment processing: <3 seconds end-to-end
• Dashboard load time: <2 seconds
• Mobile app launch: <2 seconds
• Database queries: <100ms (p95)
10.2.4.4. Performance Bottleneck Identification:
• APM tools (New Relic, Datadog) for profiling
• Database slow query log (MySQL slow query log)
• Node.js heap snapshot analysis for memory leaks (Chrome DevTools)
• Event loop monitoring (detect blocking operations)
• Clinic.js for Node.js performance profiling
10.2.4.5. Optimization Actions:
• Add database indexes for slow queries
• Implement caching (Redis) for frequently accessed data
• Optimize N+1 queries with eager loading
• Increase connection pool size
Private & Confidential Page 102 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Scale horizontally (add more pods)
10.2.5 Security Testing
10.2.5.1. Static Application Security Testing (SAST):
• Tool: SonarQube
• Analysis: Source code scanning for vulnerabilities
• Checks: SQL injection, XSS, hardcoded secrets, insecure crypto
• Integration: CI pipeline (fail build on critical issues)
• Coverage: All backend and frontend code
10.2.5.2. Dynamic Application Security Testing (DAST):
• Tool: OWASP ZAP (Zed Attack Proxy)
• Analysis: Running application penetration testing
• Checks: Common web vulnerabilities (OWASP Top 10)
• Frequency: Weekly automated scans
• Environment: Staging environment (not production)
10.2.5.3. Dependency Vulnerability Scanning:
• Tool: OWASP Dependency-Check, Snyk
• Analysis: Third-party library vulnerabilities
• Integration: CI pipeline (warn on medium, fail on high/critical)
• Auto-Update: Dependabot for automated dependency updates
10.2.5.4. Container Security Scanning:
• Tool: Trivy, Clair
• Analysis: Docker image vulnerabilities
• Integration: CI pipeline before pushing images
• Base Images: Use official, minimal images (Alpine, Distroless)
10.2.5.5. Penetration Testing:
• Frequency: Annually (comprehensive), quarterly (targeted)
• Scope: Web apps, mobile apps, APIs, infrastructure
Private & Confidential Page 103 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Provider: External certified penetration testers (OSCP, CEH)
• Deliverables: Detailed report with findings and remediation steps
• Follow-up: Re-test after fixes implemented
10.2.5.6. Mobile App Security Testing:
• Tool: MobSF (Mobile Security Framework)
• Analysis: Static and dynamic analysis of APK/IPA
• Checks: Insecure data storage, SSL pinning, code obfuscation,
permissions
• Manual Testing: Frida for runtime manipulation, Charles Proxy for traffic
analysis
Private & Confidential Page 104 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
10.3 Test Automation Infrastructure
CI/CD Integration:
Figure 10.2: CI/CD Pipeline
Private & Confidential Page 105 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
10.3.1. Parallel Test Execution:
• Split tests across multiple runners for faster feedback
• Unit tests: 8 parallel runners (complete in 5 minutes)
• Integration tests: 4 parallel runners (complete in 10 minutes)
• E2E tests: 3 parallel runners (complete in 20 minutes)
10.3.2. Test Environment Strategy:
Environment Purpose Data Deployment
Development Developer testing Synthetic data Continuous (on
commit)
QA QA team testing Anonymized prod Daily (stable build)
data
Staging UAT, Pre-production Anonymized prod On-demand (release
validation data candidate)
Performance Load testing Synthetic data (large On-demand
volume)
Production Live system Real data Manual approval
10.3.3. Test Data Management:
• Synthetic Data: Faker library for generating realistic test data
• Anonymized Production Data: Automated anonymization scripts
• Test Data Builder Pattern: Fluent API for creating test objects
• Database Seeding: Scripts to populate test databases
• Data Refresh: Nightly refresh of test environments
10.4 Quality Assurance Processes
10.4.1. Code Quality Gates:
• Pre-Commit Hooks: Linting, formatting checks before commit
• Pull Request Checks: Automated tests must pass, code coverage >80%
• Code Review: Minimum 2 approvals from team members
• Security Scan: No high/critical vulnerabilities
10.4.2. Definition of Done (DoD):
Private & Confidential Page 106 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Code complete and follows coding standards
• Unit tests written with >80% coverage
• Integration tests written for new APIs
• Code reviewed and approved by 2 peers
• Security scan passed (no high/critical issues)
• Documentation updated (API docs, README)
• Acceptance criteria met
• Product owner signed off
10.4.3. Bug Tracking & Management:
10.4.3.1. Bug Severity Classification:
• P0 - Critical: System down, data loss, security breach (fix immediately)
• P1 - High: Major functionality broken, workaround exists (fix within 24
hours)
• P2 - Medium: Minor functionality broken, workaround exists (fix within 1
week)
• P3 - Low: Cosmetic issues, nice-to-have (fix in next sprint)
10.4.3.2. Bug Workflow:
1. Report: QA or user reports bug in Jira
2. Triage: Team reviews and assigns severity
3. Assign: Developer assigned based on expertise
4. Fix: Developer fixes and creates pull request
5. Review: Code review by peer
6. Test: QA verifies fix in test environment
7. Deploy: Fix deployed to production
8. Verify: QA verifies fix in production
9. Close: Bug marked as resolved
10.4.4. Root Cause Analysis (RCA):
• For P0/P1 bugs in production
• Document: What happened, why it happened, how to prevent
• Action items: Code changes, process improvements, training
• Review: Team reviews RCA and action items
Private & Confidential Page 107 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
10.4.5. Bug Metrics:
• Defect Density: Bugs per 1000 lines of code
• Defect Leakage: % bugs found in production vs testing
• Mean Time to Resolve (MTTR): Average time to fix bugs
• Escaped Defects: Bugs found by users (target: <5%)
Private & Confidential Page 108 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
11. DevOps & Deployment Strategy
11.1 Kubernetes Deployment Architecture
Our production deployment runs on Kubernetes for scalability, high availability, and
automated operations:
Figure 11.1: Kubernetes Deployment Architecture
Private & Confidential Page 109 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
11.2 CI/CD Pipeline Architecture
Our CI/CD pipeline automates the entire software delivery process from code
commit to production deployment.
Figure 11.2: CI/CD Detailed Pipeline
11.2.1. Pipeline Execution Time:
Private & Confidential Page 110 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Unit Tests: 5 minutes
• Integration Tests: 10 minutes
• E2E Tests: 20 minutes
• Total: ~35 minutes from commit to QA deployment
11.2.2. Pipeline Optimizations:
• Parallel test execution
• Docker layer caching
• Dependency caching
• Incremental builds
11.3 Infrastructure as Code (IaC)
11.3.1Framework for Cloud Infrastructure:
11.3.1.1. Directory Structure:
infrastructure/
├──Framework/
│ ├── modules/
│ │ ├── vpc/
│ │ ├── eks/
│ │ ├── rds/
│ │ ├── elasticache/
│ │ └── s3/
│ ├── environments/
│ │ ├── dev/
│ │ ├── staging/
│ │ └── production/
│ └── global/
│ └── route53/
11.2.1.2. Framework Workflow:
1. WriteFramework configuration
2.Framework init - Initialize providers
3.Framework plan - Preview changes
4.Framework apply - Apply changes
5.Framework state - Manage state file (S3 backend)
Private & Confidential Page 111 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
11.3.2. State Management:
• Remote backend: S3 + DynamoDB for state locking
• State file versioning
• Separate state files per environment
• Access control via IAM policies
11.3.3. Kubernetes Configuration with Helm:
11.3.3.1. Helm Chart Structure:
helm/nks-backend/
├── Chart.yaml
├── values.yaml
├── values-dev.yaml
├── values-staging.yaml
├── values-prod.yaml
└── templates/
├── deployment.yaml
├── service.yaml
├── ingress.yaml
├── configmap.yaml
├── secret.yaml
├── hpa.yaml
└── servicemonitor.yaml
11.3.4. GitOps with ArgoCD:
• Git repository as source of truth for Kubernetes config
• ArgoCD monitors Git repo for changes
• Automatic sync to Kubernetes cluster
• Drift detection (if manual changes made, alert and auto-revert)
• Rollback capability (revert to previous Git commit)
• Multi-environment support (dev, staging, production)
11.4 Deployment Strategies
11.4.1 Blue-Green Deployment
Use Case: Major releases with significant changes
Process:
1. Blue (Current Production): Running version 1.0
2. Green (New Version): Deploy version 2.0 to parallel environment
3. Testing: Smoke tests on green environment
4. Switch: Update load balancer to route traffic to green
Private & Confidential Page 112 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
5. Monitor: Watch metrics for errors, performance issues
6. Rollback (if needed): Switch back to blue instantly
7. Decommission: After 24 hours, decommission blue
Benefits:
• Zero downtime deployment
• Instant rollback capability
• Full production environment testing
Drawbacks:
• Double infrastructure cost during deployment
• Database migrations require careful planning
11.5 Containerization & Orchestration
11.5.1. Docker Best Practices:
11.5.1.1. Multi-Stage Build:
# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests
# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
Benefits:
• Smaller final image (only runtime dependencies)
• Faster build with layer caching
• Security (no build tools in runtime image)
Private & Confidential Page 113 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
Security Hardening:
• Non-root user execution
• Minimal base image (Alpine, Distroless)
• No unnecessary packages
• Read-only filesystem where possible
• Image scanning for vulnerabilities
11.5.2. Kubernetes Configuration:
11.5.2.1. Namespace Isolation:
• nks-dev, nks-staging, nks-prod
• Resource quotas per namespace
• Network policies for isolation
11.5.4. Cluster Autoscaler:
• Automatically add nodes when pods pending due to insufficient resources
• Automatically remove nodes when underutilized
• Respects PodDisruptionBudgets
11.5.5. Service Mesh (Istio):
• Mutual TLS between services
• Traffic management (retries, timeouts, circuit breaker)
• Observability (distributed tracing, metrics)
• Security policies (allow/deny rules)
11.6 Monitoring & Observability
11.6.1 Metrics (Prometheus + Grafana)
Prometheus Metrics Collection:
• Application metrics: /metrics endpoint (Nest.js with prom-client)
• Node.js metrics: Event loop lag, memory usage, active handles
• Business metrics: Payments/second, revenue, commission
• Infrastructure metrics: CPU, memory, disk, network
Private & Confidential Page 114 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
Grafana Dashboards:
• Service Dashboard: Request rate, error rate, latency (RED metrics)
• JVM Dashboard: Heap usage, GC pauses, thread count
• Business Dashboard: Payments/hour, revenue, active users
• Infrastructure Dashboard: Node CPU/memory, pod status
11.6.2 Logging (ELK Stack)
11.6.2.1. Log Collection:
• Application logs: Structured JSON logging (Logback with JSON encoder)
• Kubernetes logs: Fluentd/Fluent Bit daemonset
• System logs: Node logs, audit log
11.6.2.2. Loki Log Storage:
• Log streams organized by service, environment, and date
• Retention policy: 7 days (hot), 30 days (warm), 90 days (cold), then delete
• Searchable fields: trace_id, user_id, payment_id, error_message via LogQL
11.6.2.3. Grafana Visualizations:
• Log stream with real-time tail
• Error logs dashboard
• Audit logs (who did what, when)
• Saved queries and filters
11.6.4 Application Performance Monitoring (APM)
11.6.4.1. New Relic / Datadog / Dynatrace:
• Real-user monitoring (RUM) for web and mobile
• Transaction tracing (code-level visibility)
• Database query performance
• External API call performance
• Error tracking with stack traces
• Automated anomaly detection
Private & Confidential Page 115 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
11.6.4.2. Mobile App Monitoring:
• App launch time
• Screen load time
• Network request performance
• Crash-free rate (target: 99.9%)
• User sessions and flows
11.6.4.3. Alerting:
• Apdex score < 0.9 (user satisfaction metric)
• Error rate > 1%
• Response time p95 > 1000ms
• Database query time > 500ms
11.7 Disaster Recovery & Business Continuity
11.7.1 High Availability Architecture:
• Multi-zone Kubernetes deployment (3 availability zones)
• Database replication (primary + 2 replicas)
• Auto-scaling for resilience
• Load balancing across zones
• Stateless application design (no local state)
11.7.2. Backup Strategy:
Data Type Backup Frequency Retention Location
Database Daily (automated) 90 days S3 + Malaysia DR
Transaction Logs Hourly (WAL) 7 days S3
Application Config On change (Git) Forever Git repository
Kubernetes State Daily (etcd backup) 30 days S3
Documents Real-time (S3 365 days S3 + Malaysia DR
versioning)
11.7.3. Disaster Recovery Plan:
Private & Confidential Page 116 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
RTO (Recovery Time Objective): 4 hours
• Time to restore full service after disaster
RPO (Recovery Point Objective): 15 minutes
• Maximum data loss in case of disaster
DR Scenarios:
1. Availability Zone Failure:
○ Automatic: Kubernetes reschedules pods to healthy zones
○ Database: Automatic failover to replica in different zone
○ Impact: <5 minutes downtime
2. Region Failure (Singapore):
○ Manual: Activate DR site in Malaysia
○ Restore latest database backup
○ Update DNS to point to DR site
○ Impact: 4 hours RTO
3. Database Corruption:
○ Restore from latest backup
○ Replay transaction logs from last backup
○ Impact: 2 hours RTO, 15 minutes RPO
4. Ransomware Attack:
○ Isolate affected systems
○ Restore from immutable backups
○ Forensic analysis
○ Impact: 4 hours RTO
DR Drills:
• Quarterly simulated disaster recovery
• Document lessons learned
• Update runbooks
• Improve automation
11.7.4. Incident Management:
Severity Levels:
• P0 - Critical: Complete outage, data breach (MTTR: <1 hour)
Private & Confidential Page 117 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• P1 - High: Major feature down, degraded performance (MTTR: <4 hours)
• P2 - Medium: Minor feature issue, workaround available (MTTR: <24 hours)
• P3 - Low: Cosmetic issue, low impact (MTTR: <1 week)
Incident Response Process:
1. Detection: Automated alert or user report
2. Acknowledge: On-call engineer acknowledges incident
3. Triage: Assess severity and impact
4. Incident Commander: Assign IC for P0/P1 incidents
5. Communication: Create status page, notify stakeholders
6. Mitigation: Apply temporary fix to restore service
7. Resolution: Apply permanent fix
8. Post-Incident Review: Document timeline, root cause, action items
Communication:
• Status page: status.nks.lzs.my (public incident updates)
• Slack channel: #incidents (internal coordination)
• Email: stakeholders@lzs.my (executive notifications)
• Social media: Twitter/Facebook (if public impact)
11.8 Security in DevOps (DevSecOps)
11.8.1. Shift-Left Security:
• Security earlier in development lifecycle
• Developer security training
• Secure coding guidelines
• IDE security plugins (SonarLint)
• Pre-commit hooks for secret scanning
11.8.2. Security in CI/CD Pipeline:
Stage 1: Code Commit
• Git pre-commit hooks: Detect secrets, API keys
• Branch protection: Prevent direct commits to main
Stage 2: Build
• SAST (SonarQube): Scan source code for vulnerabilities
Private & Confidential Page 118 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Dependency check: Identify vulnerable libraries
• License compliance: Verify open-source licenses
Stage 3: Docker Build
• Image scanning (Trivy): Scan for OS vulnerabilities
• Dockerfile linting: Best practices check
• Non-root user enforcement
Stage 4: Deploy
• Infrastructure scanning:Framework security checks
• Kubernetes security: Pod security policies
• Secrets management: Inject secrets at runtime (not baked in images)
Stage 5: Runtime
• Runtime application self-protection (RASP)
• Container runtime security (Falco)
• Network policies: Restrict pod-to-pod communication
• WAF (Web Application Firewall): Protect against OWASP Top 10
11.8.3. Secret Management:
• Vault (HashiCorp) / AWS Secrets Manager: Centralized secret storage
• Dynamic Secrets: Generate credentials on-demand
• Secret Rotation: Automatic rotation (e.g., database passwords every 90
days)
• Least Privilege: Apps access only necessary secrets
• Audit Logging: Track all secret access
Private & Confidential Page 119 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
11.9 Mobile App Deployment (React Native)
React Native applications require building for both iOS and Android platforms.
Our CI/CD pipeline automates this process for both platforms from a single codebase.
11.9.1 CI/CD Pipeline for React Native
Unified Build Workflow:
Figure 11.3: Mobile CI/CD Pipeline
11.9.2 iOS Deployment (React Native)
Fastlane Configuration (ios/fastlane/Fastfile):
Certificate Management:
• Use Fastlane Match for certificate management
• Certificates stored in private Git repository (encrypted)
• Automatic certificate syncing across team
• Support for development, adhoc, and app-store profiles
TestFlight Distribution:
• Internal Testing: LZS team (up to 100 users, immediate availability)
• External Testing: Beta users (up to 10,000 users, requires Apple review)
• Beta App Description: Explain new features and what to test
Private & Confidential Page 120 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
• Feedback Collection: TestFlight feedback + in-app feedback form
App Store Submission:
1. Prepare app metadata in App Store Connect
2. Upload screenshots (6.5", 6.7", 5.5" iPhone sizes)
3. Create promotional text and description (Malay + English)
4. Upload preview video (optional but recommended)
5. Set pricing and availability
6. Submit for App Review (typically 1-3 days)
7. Choose manual or automatic release
8. Enable phased release (recommended, 7-day rollout)
11.9.3 Android Deployment (React Native)
Gradle Configuration (android/app/build.gradle):
igning Key Management:
• Generate upload key: keytool -genkeypair -v -storetype PKCS12 -keystore
upload-key.keystore
• Store keystore file securely (NOT in Git)
• Use Google Play App Signing (Google manages app signing key)
• Store credentials in CI/CD secrets
Google Play Distribution:
1. Internal Testing: Upload AAB, immediate availability to testers
2. Closed Testing: Select specific testers, no review required
3. Open Testing: Public opt-in, no review required
4. Production: Full review, staged rollout available
Monitoring During Rollout:
• Crash-free rate (target: >99.5%)
• ANR (Application Not Responding) rate
• User ratings and reviews
• Rollback capability if issues detected
Private & Confidential Page 121 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
11.9.4 Over-the-Air (OTA) Updates
CodePush (Microsoft AppCenter):
For JavaScript-only changes (no native code changes), use CodePush for instant
updates:
Benefits:
• Fix bugs without waiting for app store approval
• Update content, UI, business logic instantly
• Rollback bad updates immediately
• A/B test new features
Limitations:
• Cannot modify native modules or platform-specific code
• Cannot change app permissions
• Subject to App Store guidelines (Apple may reject if overused)
11.9.5 App Store Optimization (ASO)
11.8.5.1. Keywords (both stores):
• Primary: zakat, selangor, lzs, kutipan
• Secondary: donation, charity, islamic, muslim, sedekah, infaq
11.9.5.2. Descriptions:
• Short Description (80 chars): "Bayar zakat dengan mudah, cepat dan
selamat melalui LZS"
• Long Description: Detail features, benefits, payment methods
• Write in both Malay (primary) and English
11.9.5.3. Screenshots:
• Show key features: Login, payment form, receipt, dashboard
• Include captions explaining each feature
• Use real app screenshots with sample data
• Show both Android and iOS specific designs
Private & Confidential Page 122 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
11.9.5.4. Preview Video (30 seconds):
• Demonstrate complete payment flow
• Highlight key features (biometric login, multiple payment methods)
• Voiceover in Malay
• Subtitles for accessibility
11.9.5.5. Ratings & Reviews:
• Prompt users after successful payment (not on first launch)
• Use in-app review API (native prompts, better conversion)
• Respond to all reviews (positive and negative)
• Address issues mentioned in negative reviews
Private & Confidential Page 123 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
Conclusion
This technical proposal presents a comprehensive, production-ready solution for
the LZS New Kutipan System (NKS 2.0) modernization initiative. Our approach delivers:
Key Strengths
1. Scalable Microservices Architecture
• Domain-driven design aligned with four core functional domains
• Independent service scaling and deployment
• Resilient system with fault isolation
• Event-driven architecture for real-time processing
2. Cross-Platform Mobile Development with React Native
• Single codebase for iOS and Android with 90%+ code sharing
• Faster development and time-to-market with native performance
• Three mobile apps (Self-Service, Employer, Agent) from shared components
• Platform-specific UI/UX for optimal user experience
• Superior security with hardware-backed biometric authentication
• Offline-first architecture with intelligent synchronization
• All three portals as dedicated mobile apps (Self-Service, Employer, Agent)
3. Intelligent Business Logic Engine ("The Brain")
• Automated commission calculation with multiple models
• Workflow orchestration (Camunda BPMN) for multi-step processes
• Real-time reconciliation with AI-powered fuzzy matching
4. Advanced Analytics & Predictive Capabilities
• Real-time dashboards with WebSocket updates
• Machine learning models for payer behavior prediction and zakat potential
estimation
• Predictive analytics for collection optimization
• Data warehouse (Apache Druid) for high-performance queries
• Explainable AI (XAI) for AIIA compliance
Private & Confidential Page 124 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
5. Enterprise-Grade Security & Compliance
• Multi-layered security architecture (Network, Application, Data, API, Mobile)
• TLS 1.3 with AES-256 encryption at rest and in transit
• Comprehensive penetration testing program (quarterly)
• AIIA compliance framework with bias detection and mitigation
• Shariah compliance with board consultation and audit trail
• Anonymity support (Hamba Allah) with pseudonymization
• Complete auditability with immutable event logs
6. Robust Data Management
• Payer-centric unified profile (single source of truth)
• Unified data persistence with MySQL 8.0+ (simplified operations, lower costs)
• Proven data migration strategy for ~4TB of legacy data
• Comprehensive backup and disaster recovery (RTO: 4 hours, RPO: 15 minutes)
7. Seamless Payment Integration
• Billplz payment gateway integration (FPX, Cards, E-Wallets)
• PCI-DSS compliant tokenization via Billplz
• Automated reconciliation with bank statements
• Support for bulk payments (1000+ transactions)
• Scheduled/recurring payment capabilities
8. Production-Ready DevOps
• Automated CI/CD pipeline with comprehensive testing
• Infrastructure as Code (Terraform, Helm, ArgoCD)
• Multiple deployment strategies (blue-green, canary, rolling)
• Comprehensive observability (Prometheus, Grafana, Loki)
• Disaster recovery with quarterly drills
Private & Confidential Page 125 of 126

---

Lembaga Zakat Selangor New Kutipan System
Technical (Application)
Technical Differentiators
Native mobile apps for all three portals (not hybrid or PWA)
Microservices architecture with domain-driven design
Event-driven real-time processing with Kafka
AI/ML capabilities with explainability and bias detection
Bahasa Melayu & English
WCAG 2.1 Level AA accessibility compliance
PDPA compliance with data minimization and consent management
Zero-downtime deployments with automated rollback
Comprehensive security from development to runtime
Implementation Readiness
Our team brings:
• Proven Technology Stack: Nest.js, Vue.js 3, React Native CLI, MySQL 8.0+,
Kubernetes
• Experienced Team: Enterprise architects, senior developers, DevOps
engineers, security specialists
• Quality Focus: >80% test coverage, automated quality gates
• Documentation: Comprehensive API documentation, runbooks, architecture
decision records
Private & Confidential Page 126 of 126