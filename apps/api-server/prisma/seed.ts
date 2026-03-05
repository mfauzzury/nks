import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

const SEED_BATCH_FILE_HASH = crypto.createHash("sha256").update("seed-batch-processing-demo-001").digest("hex");

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin12345";
  const adminName = process.env.ADMIN_NAME ?? "Administrator";
  const counterEmail = process.env.COUNTER_EMAIL ?? "counter@example.com";
  const counterPassword = process.env.COUNTER_PASSWORD ?? "counter12345";
  const counterName = process.env.COUNTER_NAME ?? "Counter Staff";

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const counterPasswordHash = await bcrypt.hash(counterPassword, 12);

  // Seed one user per role for testing
  const usersPerRole = [
    { email: adminEmail, name: adminName, role: "admin", password: adminPassword },
    { email: "eksekutif@example.com", name: "Eksekutif Pemprosesan", role: "eksekutif pemprosesan", password: adminPassword },
    { email: "penyelia@example.com", name: "Penyelia", role: "penyelia", password: adminPassword },
  ];

  for (const u of usersPerRole) {
    const hash = await bcrypt.hash(u.password, 12);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, passwordHash: hash, role: u.role },
      create: { email: u.email, name: u.name, passwordHash: hash, role: u.role },
    });
  }

  await prisma.user.upsert({
    where: { email: counterEmail },
    update: { name: counterName, passwordHash: counterPasswordHash, role: "counter" },
    create: { email: counterEmail, name: counterName, passwordHash: counterPasswordHash, role: "counter" },
  });

  const defaultSettings: Array<{ key: string; value: string }> = [
    { key: "siteTitle", value: "CORRAD Xpress" },
    { key: "tagline", value: "Design system and admin standards." },
    { key: "titleFormat", value: "%page% | %site%" },
    { key: "metaDescription", value: "Internal UI standard and admin toolkit." },
    { key: "siteIconUrl", value: "" },
    { key: "sidebarLogoUrl", value: "" },
    { key: "faviconUrl", value: "" },
    { key: "language", value: "en" },
    { key: "timezone", value: "UTC" },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  const samplePosts = [
    {
      title: "The Rise of Agentic AI: How Autonomous Systems Are Reshaping Enterprise",
      slug: "rise-of-agentic-ai",
      excerpt: "Agentic AI is moving beyond chatbots into autonomous decision-making systems that can plan, execute, and iterate — transforming how businesses operate at scale.",
      content: `<p>The AI landscape is undergoing a fundamental shift. While large language models captured the world's attention in 2024, the real revolution happening in 2025-2026 is the emergence of <strong>agentic AI</strong> — systems that don't just respond to prompts but autonomously plan, execute, and adapt to achieve complex goals.</p>

<h2>What Makes AI "Agentic"?</h2>
<p>Unlike traditional AI assistants that wait for instructions, agentic AI systems can break down complex objectives into sub-tasks, use tools and APIs, make decisions based on intermediate results, and course-correct when things go wrong. Think of it as the difference between a calculator and a project manager.</p>

<h2>Enterprise Adoption</h2>
<p>Companies like Salesforce, Microsoft, and Google are embedding agentic capabilities into their platforms. Salesforce's Agentforce, Microsoft's Copilot Studio, and Google's Vertex AI agents are enabling businesses to deploy autonomous workflows for customer service, data analysis, and software development.</p>

<h2>Key Use Cases</h2>
<ul>
<li><strong>Software Engineering:</strong> AI agents that can read codebases, plan implementations, write code, run tests, and iterate on failures</li>
<li><strong>Data Pipeline Automation:</strong> Agents that monitor data quality, detect anomalies, and self-heal broken pipelines</li>
<li><strong>Customer Operations:</strong> Multi-step resolution workflows that handle complex cases without human intervention</li>
</ul>

<h2>The Challenge Ahead</h2>
<p>The biggest hurdle isn't technical — it's trust. Organizations need robust guardrails, audit trails, and human-in-the-loop checkpoints before deploying autonomous systems in production. The companies that solve this trust equation first will have a massive competitive advantage.</p>`,
      status: "published" as const,
    },
    {
      title: "Real-Time Data Pipelines: Why Batch Processing Is No Longer Enough",
      slug: "real-time-data-pipelines",
      excerpt: "As businesses demand instant insights, real-time streaming architectures powered by Apache Kafka, Flink, and modern lakehouse platforms are replacing traditional batch ETL workflows.",
      content: `<p>For decades, batch processing was the backbone of enterprise data. Run ETL jobs overnight, generate reports in the morning, make decisions by afternoon. But in a world of instant payments, real-time fraud detection, and personalized experiences, waiting hours for data is a competitive liability.</p>

<h2>The Streaming Revolution</h2>
<p>Technologies like <strong>Apache Kafka</strong>, <strong>Apache Flink</strong>, and <strong>Apache Spark Structured Streaming</strong> have matured to the point where real-time data processing is no longer a luxury — it's table stakes. Confluent's cloud-native Kafka platform now processes trillions of events daily across thousands of organizations.</p>

<h2>The Lakehouse Architecture</h2>
<p>The convergence of data lakes and data warehouses into "lakehouse" architectures (Databricks, Apache Iceberg, Delta Lake) is enabling organizations to have a single source of truth that supports both batch analytics and real-time streaming. This eliminates the traditional trade-off between data freshness and query performance.</p>

<h2>Key Patterns</h2>
<ul>
<li><strong>Event-Driven Architecture:</strong> Every state change becomes an event that downstream systems can react to immediately</li>
<li><strong>Change Data Capture (CDC):</strong> Database changes streamed in real-time using Debezium, eliminating expensive full-table scans</li>
<li><strong>Materialized Views:</strong> Pre-computed query results that update incrementally as new data arrives</li>
</ul>

<h2>Cost Considerations</h2>
<p>Real-time isn't always worth the infrastructure cost. The key is identifying which data truly needs sub-second latency versus which can tolerate minutes or hours of delay. A hybrid approach — streaming for critical paths, micro-batch for everything else — often delivers the best ROI.</p>`,
      status: "published" as const,
    },
    {
      title: "RAG vs Fine-Tuning: Choosing the Right Approach for Your LLM Application",
      slug: "rag-vs-fine-tuning-llm",
      excerpt: "Retrieval-Augmented Generation and fine-tuning offer different trade-offs for customizing large language models. Understanding when to use each is critical for production AI systems.",
      content: `<p>Every team building with LLMs faces the same question: how do we make the model know about our specific data, domain, or use case? The two dominant approaches — <strong>Retrieval-Augmented Generation (RAG)</strong> and <strong>fine-tuning</strong> — each have distinct strengths, and choosing wrong can cost months of development time.</p>

<h2>RAG: Dynamic Knowledge Retrieval</h2>
<p>RAG works by retrieving relevant documents from a knowledge base at query time and including them in the LLM's context window. The model itself doesn't change — it simply has access to better information when generating responses.</p>
<p><strong>Best for:</strong> factual Q&A, documentation search, customer support, any use case where the knowledge base changes frequently.</p>
<p><strong>Advantages:</strong> No training required, knowledge stays up-to-date, easy to audit sources, lower cost.</p>

<h2>Fine-Tuning: Baked-In Knowledge</h2>
<p>Fine-tuning modifies the model's weights using your domain-specific data, teaching it new patterns, terminology, and reasoning styles. The knowledge becomes part of the model itself.</p>
<p><strong>Best for:</strong> specialized writing styles, domain-specific reasoning (legal, medical), structured output generation, workflow-specific tasks.</p>
<p><strong>Advantages:</strong> Lower latency (no retrieval step), better at style/tone, works with shorter prompts.</p>

<h2>The Hybrid Approach</h2>
<p>In practice, many production systems combine both: a fine-tuned model that understands the domain's language and reasoning patterns, augmented with RAG for access to current, factual information. This gives you the best of both worlds — domain expertise with up-to-date knowledge.</p>

<h2>Decision Framework</h2>
<ul>
<li>Data changes frequently → <strong>RAG</strong></li>
<li>Need specific output format/style → <strong>Fine-tune</strong></li>
<li>Must cite sources → <strong>RAG</strong></li>
<li>Latency-critical → <strong>Fine-tune</strong></li>
<li>Complex domain reasoning + current data → <strong>Both</strong></li>
</ul>`,
      status: "published" as const,
    },
    {
      title: "Edge Computing Meets AI: Processing Intelligence Where Data Lives",
      slug: "edge-computing-meets-ai",
      excerpt: "With IoT devices generating exabytes of data daily, edge AI is enabling real-time inference at the source — reducing latency, bandwidth costs, and cloud dependency.",
      content: `<p>The traditional model of sending all data to the cloud for processing is breaking down. With billions of IoT devices, autonomous vehicles, and smart infrastructure generating massive data streams, the economics and physics of centralized computing no longer make sense for many use cases.</p>

<h2>Why Edge AI Matters</h2>
<p><strong>Latency:</strong> An autonomous vehicle can't wait 100ms for a cloud round-trip to decide whether to brake. Edge inference happens in single-digit milliseconds.</p>
<p><strong>Bandwidth:</strong> A single factory floor with 1,000 sensors can generate terabytes of data daily. Sending it all to the cloud is prohibitively expensive.</p>
<p><strong>Privacy:</strong> Healthcare devices and security cameras can process sensitive data locally without it ever leaving the premises.</p>

<h2>The Technology Stack</h2>
<p>The edge AI ecosystem has matured rapidly. NVIDIA's Jetson platform, Google's Coral TPU, and Apple's Neural Engine bring serious compute power to devices. On the software side, frameworks like TensorFlow Lite, ONNX Runtime, and PyTorch Mobile enable model optimization for resource-constrained environments.</p>

<h2>Model Compression Techniques</h2>
<ul>
<li><strong>Quantization:</strong> Reducing model precision from 32-bit to 8-bit or even 4-bit, cutting model size by 4-8x with minimal accuracy loss</li>
<li><strong>Knowledge Distillation:</strong> Training a smaller "student" model to mimic a larger "teacher" model</li>
<li><strong>Pruning:</strong> Removing redundant neural network connections to reduce computation</li>
</ul>

<h2>Real-World Deployments</h2>
<p>Retail chains are using edge AI for real-time inventory tracking and checkout-free stores. Manufacturing plants deploy computer vision models on edge devices for quality inspection at line speed. Smart cities process traffic camera feeds locally for congestion management without streaming video to the cloud.</p>`,
      status: "published" as const,
    },
    {
      title: "The Data Mesh Revolution: Decentralizing Data Ownership at Scale",
      slug: "data-mesh-revolution",
      excerpt: "Data mesh shifts data architecture from centralized platforms to domain-oriented ownership, treating data as a product — and it's changing how large organizations think about analytics.",
      content: `<p>For years, organizations have tried to solve their data challenges with bigger, more centralized platforms — data warehouses, data lakes, and now lakehouses. Yet many still struggle with data quality, discoverability, and time-to-insight. <strong>Data mesh</strong>, a paradigm introduced by Zhamak Dehghani, offers a fundamentally different approach.</p>

<h2>Core Principles</h2>
<p>Data mesh is built on four pillars:</p>
<ul>
<li><strong>Domain-Oriented Ownership:</strong> The teams that produce data own it as a product, not a centralized data team</li>
<li><strong>Data as a Product:</strong> Each domain publishes discoverable, trustworthy, self-describing data products with SLAs</li>
<li><strong>Self-Serve Data Platform:</strong> A shared infrastructure layer that makes it easy for domains to build, deploy, and maintain data products</li>
<li><strong>Federated Computational Governance:</strong> Global standards enforced automatically, not through manual review processes</li>
</ul>

<h2>Why Now?</h2>
<p>Three converging trends make data mesh practical today. First, cloud-native platforms (Snowflake, Databricks, BigQuery) have reduced the infrastructure burden. Second, data contracts and schema registries enable interoperability between domains. Third, the rise of platform engineering as a discipline provides the organizational model for self-serve infrastructure.</p>

<h2>Implementation Challenges</h2>
<p>Data mesh is not a technology — it's an organizational and architectural paradigm. The hardest part isn't the tooling; it's convincing domain teams to take ownership of data quality and invest in publishing well-documented data products. This requires executive sponsorship, clear incentives, and a cultural shift toward treating data consumers as customers.</p>

<h2>Who Should Consider Data Mesh?</h2>
<p>Data mesh works best for large organizations (500+ engineers) with multiple distinct business domains. Smaller teams or single-product companies are usually better served by a centralized approach. The overhead of domain boundaries isn't worth it if you only have one domain.</p>`,
      status: "published" as const,
    },
  ];

  for (const post of samplePosts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: { title: post.title, excerpt: post.excerpt, content: post.content, status: post.status },
      create: { ...post, publishedAt: new Date() },
    });
  }

  const sampleCategories = [
    { name: "Artificial Intelligence", slug: "artificial-intelligence", description: "AI, machine learning, and deep learning topics" },
    { name: "Big Data", slug: "big-data", description: "Data engineering, analytics, and large-scale processing" },
    { name: "Cloud Computing", slug: "cloud-computing", description: "Cloud platforms, infrastructure, and services" },
    { name: "Software Engineering", slug: "software-engineering", description: "Development practices, architecture, and tooling" },
  ];

  for (const cat of sampleCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
  }

  // Assign categories to posts
  const ai = await prisma.category.findUnique({ where: { slug: "artificial-intelligence" } });
  const bigData = await prisma.category.findUnique({ where: { slug: "big-data" } });
  const cloud = await prisma.category.findUnique({ where: { slug: "cloud-computing" } });
  const swEng = await prisma.category.findUnique({ where: { slug: "software-engineering" } });

  if (ai && bigData && cloud && swEng) {
    await prisma.post.update({ where: { slug: "rise-of-agentic-ai" }, data: { categories: { set: [{ id: ai.id }, { id: swEng.id }] } } });
    await prisma.post.update({ where: { slug: "real-time-data-pipelines" }, data: { categories: { set: [{ id: bigData.id }, { id: cloud.id }] } } });
    await prisma.post.update({ where: { slug: "rag-vs-fine-tuning-llm" }, data: { categories: { set: [{ id: ai.id }] } } });
    await prisma.post.update({ where: { slug: "edge-computing-meets-ai" }, data: { categories: { set: [{ id: ai.id }, { id: cloud.id }] } } });
    await prisma.post.update({ where: { slug: "data-mesh-revolution" }, data: { categories: { set: [{ id: bigData.id }, { id: swEng.id }] } } });
  }

  // Seed default roles
  const rolesToSeed = [
    {
      name: "admin",
      description: "Full system access",
      permissions: [
        "posts.view", "posts.create", "posts.edit", "posts.delete",
        "pages.view", "pages.create", "pages.edit", "pages.delete",
        "media.view", "media.upload", "media.delete",
        "users.view", "users.create", "users.edit", "users.delete",
        "roles.view", "roles.create", "roles.edit", "roles.delete",
        "settings.view", "settings.edit",
        "menus.view", "menus.edit",
        "integration.view", "integration.upload", "integration.process",
        "integration.reconcile", "integration.exceptions", "integration.reports",
      ],
    },
    {
      name: "eksekutif pemprosesan",
      description: "Executive Processing - process uploads, reconcile, view reports (Integration 3rd Party)",
      permissions: [
        "integration.view", "integration.upload", "integration.process",
        "integration.reconcile", "integration.reports",
      ],
    },
    {
      name: "penyelia",
      description: "Supervisor - review exceptions, approve/reprocess transactions (Integration 3rd Party)",
      permissions: [
        "integration.view", "integration.upload", "integration.process",
        "integration.reconcile", "integration.exceptions", "integration.reports",
      ],
    },
  ];

  for (const r of rolesToSeed) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description, permissions: JSON.stringify(r.permissions) },
      create: {
        name: r.name,
        description: r.description,
        permissions: JSON.stringify(r.permissions),
      },
    });
  }

  // Seed Integration 3rd Party: Kategori Sumber & Sumber Data (matches File Upload screen)
  const sourceCategories = [
    { code: "SPG", name: "Skim Potongan Gaji (SPG)", isActive: true, notes: "" },
    { code: "PSP", name: "Platform Saluran Pembayaran (PSP)", isActive: true, notes: "" },
    { code: "BANK", name: "BANK", isActive: true, notes: "" },
  ];
  for (const cat of sourceCategories) {
    await prisma.integrationSourceCategory.upsert({
      where: { code: cat.code },
      update: { name: cat.name, isActive: cat.isActive, notes: cat.notes },
      create: cat,
    });
  }
  const spgCat = await prisma.integrationSourceCategory.findUnique({ where: { code: "SPG" } });
  const pspCat = await prisma.integrationSourceCategory.findUnique({ where: { code: "PSP" } });
  const bankCat = await prisma.integrationSourceCategory.findUnique({ where: { code: "BANK" } });
  const sourceData = [
    { code: "JAN", name: "Jabatan Akauntan Negara", categoryCode: "SPG" },
    { code: "BILPIZ", name: "BilPiz", categoryCode: "PSP" },
    { code: "BANK_ISLAM", name: "Bank Islam", categoryCode: "BANK" },
    { code: "MAYBANK", name: "Maybank", categoryCode: "BANK" },
  ];
  for (const src of sourceData) {
    const categoryId =
      src.categoryCode === "SPG" ? spgCat?.id : src.categoryCode === "PSP" ? pspCat?.id : bankCat?.id;
    if (!categoryId) continue;
    await prisma.integrationSource.upsert({
      where: { code: src.code },
      update: { name: src.name, categoryId },
      create: { code: src.code, name: src.name, categoryId, transportType: "MANUAL" },
    });
  }

  // Seed IntegrationConfig: PGP decryption password for JAN (dev sample uses "nks-jan-dev-2025")
  const janSourceForConfig = await prisma.integrationSource.findUnique({ where: { code: "JAN" } });
  if (janSourceForConfig) {
    const pgpPassword = process.env.JAN_PGP_PASSWORD ?? "nks-jan-dev-2025";
    const existing = await prisma.integrationConfig.findFirst({
      where: { sourceId: janSourceForConfig.id, configKey: "pgp_decrypt_password" },
    });
    if (existing) {
      await prisma.integrationConfig.update({
        where: { id: existing.id },
        data: { configValue: pgpPassword },
      });
    } else {
      await prisma.integrationConfig.create({
        data: {
          sourceId: janSourceForConfig.id,
          configKey: "pgp_decrypt_password",
          configValue: pgpPassword,
          isSecret: true,
        },
      });
    }
  }

  // Seed one IntegrationFile for Batch Processing screen (idempotent - no duplicates)
  const janSource = await prisma.integrationSource.findUnique({ where: { code: "JAN" } });
  if (janSource) {
    await prisma.integrationFile.upsert({
      where: { fileHashSha256: SEED_BATCH_FILE_HASH },
      update: {},
      create: {
        sourceId: janSource.id,
        fileName: "zakat-jan-2025-sample.txt",
        filePath: null,
        fileHashSha256: SEED_BATCH_FILE_HASH,
        receivedChannel: "MANUAL",
        fileType: "ENCRYPTED_TXT",
        description: "Sample batch file for demo",
        encrypted: true,
        decryptStatus: "PENDING",
        validationStatus: "PENDING",
        processingStatus: "PENDING",
        totalRecordsDeclared: 42,
      },
    });
  }

  await prisma.role.upsert({
    where: { name: "counter" },
    update: {},
    create: {
      name: "counter",
      description: "Counter collection role for physical payment and deposit batching",
      permissions: JSON.stringify([
        "counter.payments.create",
        "counter.payments.view_own",
        "counter.deposits.create",
        "counter.deposits.view_own",
      ]),
    },
  });

  const muslimNames = [
    "Muhammad Amir Hakim",
    "Ahmad Firdaus",
    "Mohd Syafiq",
    "Nur Aisyah",
    "Siti Nurul Huda",
    "Noraini Binti Ismail",
    "Abdul Rahman",
    "Khairul Anuar",
    "Norshuhada",
    "Hafizah Binti Hamzah",
    "Muhammad Danish",
    "Nur Izzati",
    "Aiman Hakimi",
    "Ainul Mardhiah",
    "Wan Muhammad Faiz",
    "Ummu Hani",
    "Fatin Nabila",
    "Faris Imran",
    "Sofea Natasha",
    "Zulkifli Ahmad",
  ];

  const malaysianStates = [
    "Selangor",
    "Kuala Lumpur",
    "Johor",
    "Pulau Pinang",
    "Perak",
    "Kedah",
    "Negeri Sembilan",
    "Melaka",
    "Terengganu",
    "Kelantan",
  ];

  const corporateCompanies = [
    "Amanah Teknologi Sdn Bhd",
    "Barakah Logistics Sdn Bhd",
    "Hijrah Global Services Sdn Bhd",
    "Nur Solutions Sdn Bhd",
    "Rizq Manufacturing Sdn Bhd",
    "Ukhwah Digital Sdn Bhd",
    "Ilham Retail Sdn Bhd",
    "Maju Muslim Food Industries Sdn Bhd",
    "Cahaya Harmoni Holdings Sdn Bhd",
    "Wawasan Integriti Sdn Bhd",
  ];

  const payerSpgCompanies = [
    "Arif Dinamik Sdn Bhd",
    "Budi Jaya Resources Sdn Bhd",
    "Cekap Niaga Holdings Sdn Bhd",
    "Damai Murni Ventures Sdn Bhd",
    "Ehsan Prima Network Sdn Bhd",
    "Falah Karya Solution Sdn Bhd",
    "Gemilang Usaha Integrasi Sdn Bhd",
    "Harmoni Bestari Services Sdn Bhd",
    "Ikhlas Maju Retail Sdn Bhd",
    "Jernih Global Logistic Sdn Bhd",
  ];

  const payerOnlyCompanies = [
    "Karya Aman Maju Sdn Bhd",
    "Lestari Barakah Trading Sdn Bhd",
    "Mutiara Ihsan Services Sdn Bhd",
    "Nadi Integriti Tech Sdn Bhd",
    "Optima Hikmah Holdings Sdn Bhd",
  ];

  const spgOnlyCompanies = [
    "Pintar Ukhwah Resources Sdn Bhd",
    "Qudwah Dinamik Logistics Sdn Bhd",
    "Rahmah Sinergi Venture Sdn Bhd",
    "Sinar Falah Services Sdn Bhd",
    "Teras Ehsan Global Sdn Bhd",
  ];

  function icNo(seed: number) {
    return `90010${(seed % 9) + 1}${String((seed % 28) + 1).padStart(2, "0")}10${String(1000 + seed)}`;
  }

  function ssmNo(seed: number) {
    return `20${String(1200000 + seed)}`;
  }

  // Seed 20 Malaysian Muslim individual payers (registered)
  for (let i = 0; i < 20; i += 1) {
    const fullName = muslimNames[i];
    const identity = icNo(i + 1);
    const email = `individu${i + 1}@contoh.my`;
    const phone = `012300${String(100 + i)}`;

    const existingIndividual = await prisma.payerIndividual.findUnique({
      where: { mykadOrPassport: identity },
      include: { payer: true },
    });

    if (!existingIndividual) {
      await prisma.payerProfile.create({
        data: {
          payerCode: `PYR-IND-${String(i + 1).padStart(3, "0")}`,
          payerType: "individu",
          displayName: fullName,
          identityNo: identity,
          identityType: "mykad",
          email,
          phone,
          status: "active",
          individual: {
            create: {
              fullName,
              mykadOrPassport: identity,
              occupation: "Pekerja Swasta",
              incomeSource: "Gaji",
              monthlyIncome: 3500 + i * 120,
            },
          },
          addresses: {
            create: {
              addressType: "rumah",
              line1: `No ${i + 10}, Jalan Sejahtera`,
              city: "Shah Alam",
              state: malaysianStates[i % malaysianStates.length],
              postcode: `40${String(100 + i).slice(-3)}`,
              country: "Malaysia",
              isPrimary: true,
            },
          },
        },
      });
    }
  }

  // Seed guest contributions for existing registered individuals
  const seedZakatTypes = ["ZAKAT PENDAPATAN", "ZAKAT SIMPANAN", "ZAKAT PERNIAGAAN", "ZAKAT EMAS", "ZAKAT FITRAH", "ZAKAT SAHAM", "ZAKAT KWSP", "ZAKAT KRIPTO"];
  const seedPayMethods = ["FPX", "CARD", "JOMPAY"];

  for (let i = 0; i < 20; i += 1) {
    const identity = icNo(i + 1);
    const receiptNo = `GRCPT-SEED-REG-${String(i + 1).padStart(3, "0")}`;
    const zakatType = seedZakatTypes[i % seedZakatTypes.length];
    const payMethod = seedPayMethods[i % seedPayMethods.length];

    await prisma.guestPayment.upsert({
      where: { receiptNo },
      update: {},
      create: {
        receiptNo,
        guestName: muslimNames[i],
        identityNo: identity,
        email: `individu${i + 1}@contoh.my`,
        amount: 50 + i * 5,
        paymentMethod: `${payMethod} | ${zakatType}`,
        status: "success",
      },
    });
  }

  // Seed 20 direct-pay contributors without registered account
  for (let i = 0; i < 20; i += 1) {
    const identity = icNo(900 + i);
    const receiptNo = `GRCPT-SEED-GUEST-${String(i + 1).padStart(3, "0")}`;
    const zakatType = seedZakatTypes[(i + 3) % seedZakatTypes.length];
    const payMethod = seedPayMethods[(i + 1) % seedPayMethods.length];

    await prisma.guestPayment.upsert({
      where: { receiptNo },
      update: {},
      create: {
        receiptNo,
        guestName: `${muslimNames[i]} Bin Abdullah`,
        identityNo: identity,
        email: `tetamu${i + 1}@contoh.my`,
        amount: 30 + i * 3,
        paymentMethod: `${payMethod} | ${zakatType}`,
        status: "success",
      },
    });
  }

  // Seed 10 corporate payers and 10 staff each (100 staff total)
  for (let i = 0; i < 10; i += 1) {
    const companyName = corporateCompanies[i];
    const regNo = ssmNo(i + 1);
    const companyEmail = `korporat${i + 1}@contoh.my`;
    const companyPhone = `03${String(22000000 + i * 37)}`;

    let payerId: number;
    const existingCorporate = await prisma.payerCorporate.findUnique({
      where: { ssmNo: regNo },
      include: { payer: true },
    });

    if (existingCorporate) {
      payerId = existingCorporate.payerId;
    } else {
      const created = await prisma.payerProfile.create({
        data: {
          payerCode: `PYR-CORP-${String(i + 1).padStart(3, "0")}`,
          payerType: "korporat",
          displayName: companyName,
          identityNo: regNo,
          identityType: "ssm",
          email: companyEmail,
          phone: companyPhone,
          status: "active",
          corporate: {
            create: {
              companyName,
              ssmNo: regNo,
              companyType: "Sdn Bhd",
              taxNo: `C${10000000 + i}`,
              taxBranch: "LHDN Shah Alam",
            },
          },
          addresses: {
            create: {
              addressType: "pejabat",
              line1: `Lot ${20 + i}, Persiaran Niaga`,
              city: "Petaling Jaya",
              state: malaysianStates[i % malaysianStates.length],
              postcode: `47${String(100 + i).slice(-3)}`,
              country: "Malaysia",
              isPrimary: true,
            },
          },
          contactPersons: {
            create: {
              name: muslimNames[(i + 10) % muslimNames.length],
              icNo: icNo(200 + i),
              position: "Pengurus HR",
              email: `wakil${i + 1}@contoh.my`,
              phone: `013700${String(100 + i)}`,
              isAuthorized: true,
            },
          },
        },
      });
      payerId = created.id;
    }

    for (let j = 0; j < 10; j += 1) {
      const staffIdentity = icNo(500 + i * 10 + j);
      const existingStaff = await prisma.spgEmployee.findFirst({
        where: {
          employerPayerId: payerId,
          employeeIdentityNo: staffIdentity,
        },
      });
      if (existingStaff) continue;

      await prisma.spgEmployee.create({
        data: {
          employerPayerId: payerId,
          employeeIdentityNo: staffIdentity,
          employeeName: muslimNames[(i + j) % muslimNames.length],
          employeeEmail: `staff${i + 1}${j + 1}@contoh.my`,
          employeePhone: `014800${String(100 + i * 10 + j)}`,
          deductionAmount: 120 + j * 5,
          employmentStatus: "AKTIF",
        },
      });
    }
  }

  // Seed 10 companies categorized as Payer & SPG
  for (let i = 0; i < 10; i += 1) {
    const companyName = payerSpgCompanies[i];
    const regNo = ssmNo(100 + i);
    const companyEmail = `payer-spg-${i + 1}@contoh.my`;

    let corporatePayerId: number;
    const existingCorporate = await prisma.payerCorporate.findUnique({
      where: { ssmNo: regNo },
      include: { payer: true },
    });

    if (existingCorporate) {
      corporatePayerId = existingCorporate.payerId;
    } else {
      const createdCorporate = await prisma.payerProfile.create({
        data: {
          payerCode: `PYR-CORP-BOTH-${String(i + 1).padStart(3, "0")}`,
          payerType: "korporat",
          displayName: companyName,
          identityNo: regNo,
          identityType: "ssm",
          email: companyEmail,
          phone: `03${String(33000000 + i * 41)}`,
          status: "active",
          corporate: {
            create: {
              companyName,
              ssmNo: regNo,
              companyType: "Sdn Bhd",
              taxNo: `CB${2000000 + i}`,
              taxBranch: "LHDN Kuala Lumpur",
            },
          },
        },
      });
      corporatePayerId = createdCorporate.id;
    }

    const existingSpg = await prisma.payerProfile.findFirst({
      where: {
        payerType: "majikan_spg",
        identityNo: regNo,
      },
      include: {
        spgEmployer: true,
      },
    });

    let spgPayerId: number;
    if (existingSpg) {
      spgPayerId = existingSpg.id;
      if (!existingSpg.spgEmployer) {
        await prisma.spgEmployer.create({
          data: {
            payerId: spgPayerId,
            agreementNo: `SPG-BOTH-${String(i + 1).padStart(3, "0")}`,
            agreementEffectiveDate: new Date("2025-01-01"),
            deductionMode: "fixed",
            deductionValue: 120 + i * 10,
            deductionCap: 500,
          },
        });
      }
    } else {
      const createdSpg = await prisma.payerProfile.create({
        data: {
          payerCode: `PYR-SPG-BOTH-${String(i + 1).padStart(3, "0")}`,
          payerType: "majikan_spg",
          displayName: companyName,
          identityNo: regNo,
          identityType: "other",
          email: companyEmail,
          phone: `03${String(43000000 + i * 29)}`,
          status: "active",
          spgEmployer: {
            create: {
              agreementNo: `SPG-BOTH-${String(i + 1).padStart(3, "0")}`,
              agreementEffectiveDate: new Date("2025-01-01"),
              deductionMode: "fixed",
              deductionValue: 120 + i * 10,
              deductionCap: 500,
            },
          },
        },
      });
      spgPayerId = createdSpg.id;
    }

    for (let j = 0; j < 3; j += 1) {
      const staffIdentity = icNo(1200 + i * 10 + j);
      const existingStaff = await prisma.spgEmployee.findFirst({
        where: {
          employerPayerId: spgPayerId,
          employeeIdentityNo: staffIdentity,
        },
      });
      if (existingStaff) continue;

      await prisma.spgEmployee.create({
        data: {
          employerPayerId: spgPayerId,
          employeeIdentityNo: staffIdentity,
          employeeName: muslimNames[(i + j + 3) % muslimNames.length],
          employeeEmail: `bothstaff${i + 1}${j + 1}@contoh.my`,
          employeePhone: `015900${String(100 + i * 10 + j)}`,
          deductionAmount: 100 + j * 10,
          employmentStatus: "AKTIF",
        },
      });
    }

    // Link one employee to registered individual occasionally to enrich mixed dataset.
    if (i % 3 === 0) {
      const linkedIdentity = icNo(i + 1);
      const linkedIndividual = await prisma.payerIndividual.findUnique({
        where: { mykadOrPassport: linkedIdentity },
      });
      const firstStaff = await prisma.spgEmployee.findFirst({
        where: { employerPayerId: spgPayerId },
        orderBy: { id: "asc" },
      });
      if (linkedIndividual && firstStaff && !firstStaff.linkedIndividualPayerId) {
        await prisma.spgEmployee.update({
          where: { id: firstStaff.id },
          data: { linkedIndividualPayerId: linkedIndividual.payerId },
        });
      }
    }
  }

  // Seed 5 companies as Payer only
  for (let i = 0; i < 5; i += 1) {
    const companyName = payerOnlyCompanies[i];
    const regNo = ssmNo(200 + i);
    const existingCorporate = await prisma.payerCorporate.findUnique({
      where: { ssmNo: regNo },
      include: { payer: true },
    });
    if (existingCorporate) continue;

    await prisma.payerProfile.create({
      data: {
        payerCode: `PYR-CORP-ONLY-${String(i + 1).padStart(3, "0")}`,
        payerType: "korporat",
        displayName: companyName,
        identityNo: regNo,
        identityType: "ssm",
        email: `payer-only-${i + 1}@contoh.my`,
        phone: `03${String(53000000 + i * 17)}`,
        status: "active",
        corporate: {
          create: {
            companyName,
            ssmNo: regNo,
            companyType: "Sdn Bhd",
            taxNo: `PO${3000000 + i}`,
            taxBranch: "LHDN Putrajaya",
          },
        },
      },
    });
  }

  // Seed 5 companies as SPG only
  for (let i = 0; i < 5; i += 1) {
    const companyName = spgOnlyCompanies[i];
    const regNo = ssmNo(300 + i);

    const existingSpg = await prisma.payerProfile.findFirst({
      where: {
        payerType: "majikan_spg",
        identityNo: regNo,
      },
    });

    let spgPayerId: number;
    if (existingSpg) {
      spgPayerId = existingSpg.id;
    } else {
      const createdSpg = await prisma.payerProfile.create({
        data: {
          payerCode: `PYR-SPG-ONLY-${String(i + 1).padStart(3, "0")}`,
          payerType: "majikan_spg",
          displayName: companyName,
          identityNo: regNo,
          identityType: "other",
          email: `spg-only-${i + 1}@contoh.my`,
          phone: `03${String(63000000 + i * 11)}`,
          status: "active",
          spgEmployer: {
            create: {
              agreementNo: `SPG-ONLY-${String(i + 1).padStart(3, "0")}`,
              agreementEffectiveDate: new Date("2025-01-01"),
              deductionMode: "fixed",
              deductionValue: 100 + i * 5,
              deductionCap: 400,
            },
          },
        },
      });
      spgPayerId = createdSpg.id;
    }

    for (let j = 0; j < 3; j += 1) {
      const staffIdentity = icNo(1500 + i * 10 + j);
      const existingStaff = await prisma.spgEmployee.findFirst({
        where: {
          employerPayerId: spgPayerId,
          employeeIdentityNo: staffIdentity,
        },
      });
      if (existingStaff) continue;

      await prisma.spgEmployee.create({
        data: {
          employerPayerId: spgPayerId,
          employeeIdentityNo: staffIdentity,
          employeeName: muslimNames[(i + j + 7) % muslimNames.length],
          employeeEmail: `spgonlystaff${i + 1}${j + 1}@contoh.my`,
          employeePhone: `016700${String(100 + i * 10 + j)}`,
          deductionAmount: 90 + j * 10,
          employmentStatus: "AKTIF",
        },
      });
    }
  }

  console.log("Seeded users per role: admin@example.com (admin), eksekutif@example.com (eksekutif pemprosesan), penyelia@example.com (penyelia)");
  console.log(`Seeded admin user: ${adminEmail}`);
  console.log(`Seeded counter user: ${counterEmail}`);
  console.log(`Seeded ${samplePosts.length} sample posts`);
  console.log(`Seeded ${sampleCategories.length} categories`);
  console.log("Seeded roles: admin, eksekutif pemprosesan, penyelia");
  // Seed sample Bank Statement for JAN/BANK reconciliation
  const existingBankFile = await prisma.bankStatementFile.findFirst();
  if (!existingBankFile) {
    const bankFile = await prisma.bankStatementFile.create({
      data: {
        bankCode: "BIMB",
        bankName: "Bank Islam",
        accountNo: "1234567890",
        statementDate: new Date("2025-03-01"),
        importedBy: "SEED",
      },
    });
    for (let i = 0; i < 20; i += 1) {
      const identity = icNo(i + 1);
      const amt = 50 + i * 5;
      const d = new Date(2025, 2, (i % 28) + 1);
      await prisma.bankStatementTransaction.create({
        data: {
          fileId: bankFile.id,
          paymentReference: `ZAKAT-${identity}-${d.toISOString().slice(0, 10)}`,
          valueDate: d,
          amount: amt,
          description: `Zakat ${muslimNames[i]}`,
          counterparty: muslimNames[i],
        },
      });
    }
    console.log("Seeded Bank Statement: 1 file, 20 transactions (for JAN/BANK reconciliation)");
  }

  console.log("Seeded Integration 3rd Party: 3 Kategori Sumber (SPG, PSP, BANK), 4 Sumber Data (JAN, BILPIZ, BANK_ISLAM, MAYBANK), 1 Batch Processing sample file");
  console.log("Seeded Module 1 sample data: 20 individu berdaftar, 20 tetamu direct pay, 10 korporat, 100 staff, 10 syarikat Payer & SPG, 5 Payer sahaja, 5 SPG sahaja");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
