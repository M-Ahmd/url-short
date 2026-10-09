import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

const topics = [
  {
    category: "PostgreSQL & Database Optimization",
    urls: [
      "https://postgresql.org/docs/current/textsearch.html",
      "https://aws.amazon.com/blogs/database/postgresql-indexing-best-practices",
      "https://neon.tech/blog/postgres-full-text-search-vs-elasticsearch",
      "https://supabase.com/docs/guides/database/full-text-search"
    ],
    paragraphs: [
      "Deep dive into PostgreSQL indexing and performance tuning for high-throughput enterprise systems. Understanding the structural differences between B-Tree, GIN, and GiST indexes is fundamental when designing schemas that require high-speed querying over millions of rows. Generalized Inverted Indexes (GIN) excel in full-text search and array containment operations by mapping individual lexemes to document tuples, vastly accelerating tsvector matching.",
      "Comprehensive architectural guide on connection pooling, query plan analysis, and vacuum maintenance. As PostgreSQL databases experience heavy concurrent write traffic, the autovacuum daemon prevents transaction ID wraparound and table bloat. Utilizing pg_stat_statements allows database administrators to identify slow sequential scans and missing composite indexes across transactional workloads.",
      "Partitioning strategies for time-series and multi-tenant architectures in PostgreSQL. By implementing declarative range and hash partitioning, query engines prune irrelevant partitions dynamically during execution. This drastically reduces I/O throughput and buffer pool cache eviction, ensuring consistent sub-millisecond latency for modern distributed backends."
    ]
  },
  {
    category: "Redis & In-Memory Distributed Caching",
    urls: [
      "https://redis.io/docs/latest/develop/data-types/strings/",
      "https://upstash.com/blog/redis-cache-invalidation-patterns",
      "https://redis.com/blog/understanding-cache-stampede-and-mitigation"
    ],
    paragraphs: [
      "An exhaustive exploration of distributed caching topologies, eviction policies, and cache invalidation strategies using Redis. Addressing the cache avalanche and cache stampede problems through probabilistic early expiration (XFetch algorithm) and distributed mutex locks ensures that backend databases remain protected during sudden traffic spikes.",
      "Mastering Redis data structures including Hashes, Sorted Sets, HyperLogLogs, and Streams for real-time analytics. Redis Sorted Sets allow engineering teams to build scalable leaderboard and rate limiting algorithms using sliding window logs, providing microsecond responses under sustained workloads with millions of active concurrent users.",
      "Architecture blueprint for memory optimization in Redis deployments. Leveraging jemalloc memory fragmentation metrics, memory compaction, and Redis Cluster replication models guarantees high availability and seamless automatic failover without service degradation."
    ]
  },
  {
    category: "Distributed Systems & Asynchronous Queues",
    urls: [
      "https://docs.bullmq.io/guide/architecture",
      "https://kafka.apache.org/documentation/#design",
      "https://martinfowler.com/articles/patterns-of-distributed-systems/"
    ],
    paragraphs: [
      "Design patterns for resilient event-driven architectures leveraging BullMQ and Redis as a message broker. Implementing exponential backoff retries, dead-letter queues, and atomic task deduplication prevents transient failures from cascading into system-wide outages when processing background transactional jobs like emails and report generation.",
      "High-scale distributed messaging pipelines using Apache Kafka and RabbitMQ. Understanding partitions, consumer groups, exactly-once processing semantics, and tombstone compaction provides the bedrock for decoupling microservices in large-scale fintech and e-commerce ecosystems.",
      "The mechanics of distributed consensus algorithms including Paxos and Raft. Examining leader election, log replication, and split-brain resolution mechanisms provides critical intuition into how modern distributed datastores maintain linearizability and fault tolerance."
    ]
  },
  {
    category: "AI, Machine Learning & Vector Search",
    urls: [
      "https://arxiv.org/abs/1706.03762",
      "https://platform.openai.com/docs/guides/embeddings",
      "https://huggingface.co/blog/large-language-models-guide"
    ],
    paragraphs: [
      "A comprehensive technical analysis of the Transformer architecture, multi-head self-attention mechanisms, and positional encodings that power modern Large Language Models (LLMs). Exploring how tokenization, feedforward sublayers, and residual connections enable models to capture long-range contextual relationships across natural language corpora.",
      "Retrieval-Augmented Generation (RAG) architecture patterns using vector databases and dense retrieval models. By converting unstructured documents into high-dimensional semantic embeddings with pgvector or Pinecone, systems can ground generative AI responses in proprietary domain knowledge with citation verification.",
      "Fine-tuning strategies, Low-Rank Adaptation (LoRA), and quantization techniques (QLoRA, AWQ) for deploying open-weight foundational models on resource-constrained consumer GPUs, dramatically reducing inference latency and memory footprints."
    ]
  },
  {
    category: "Application Security & Cryptography",
    urls: [
      "https://owasp.org/www-project-top-ten/",
      "https://auth0.com/docs/secure/tokens/json-web-tokens",
      "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html"
    ],
    paragraphs: [
      "In-depth security analysis of modern web authentication frameworks, OAuth 2.1, and OpenID Connect specifications. Implementing short-lived asymmetric JSON Web Tokens (RS256) coupled with secure HTTP-only refresh tokens and token rotation mitigates cross-site scripting (XSS) and token theft vectors.",
      "Cryptographic standards for password storage and key derivation functions comparing Argon2id, scrypt, and bcrypt. Understanding work factors, memory cost parameters, and resistant salting architectures protects user credentials against modern GPU and ASIC rainbow table attacks.",
      "Mitigating OWASP Top 10 vulnerabilities in modern Node.js and TypeScript backends. Deep defensive practices against Server-Side Request Forgery (SSRF), SQL and NoSQL injection, timing attacks on token verification, and Prototype Pollution."
    ]
  },
  {
    category: "Cloud Native, Docker & Kubernetes",
    urls: [
      "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/",
      "https://12factor.net/",
      "https://cloud.google.com/architecture/devops"
    ],
    paragraphs: [
      "Production-grade container orchestration using Kubernetes: configuring rolling updates, horizontal pod autoscalers (HPA), liveness and readiness probes, and ingress controllers. Establishing robust service mesh architectures with Istio enables mTLS zero-trust communication and granular canary traffic routing.",
      "Twelve-Factor App methodology for modern cloud applications: treating logs as event streams, externalizing configuration strictly via environment variables, and ensuring process statelessness for rapid horizontal elasticity on containerized runtimes.",
      "Infrastructure as Code (IaC) pipelines with Terraform and GitHub Actions. Automated linting, plan inspection, drift detection, and state locking in S3 backends create reproducible multi-region deployments with rollback capabilities."
    ]
  }
];

function generateLargeParagraph(topic) {
  // Combine 2 to 3 paragraphs with extra descriptive metadata and keywords
  const shuffled = [...topic.paragraphs].sort(() => 0.5 - Math.random());
  const header = `[Topic: ${topic.category}] Detailed technical summary: `;
  const body = shuffled.join(" ");
  const keywords = `\nKeywords: ${topic.category.toLowerCase()}, performance, scalability, architecture, optimization, indexing, distributed systems, reliability, backend engineering, cloud computing, latency reduction.`;
  return header + body + keywords;
}

async function seed() {
  console.log("🌱 Starting bulk data generation...");

  // Fetch all existing users
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log("No users found. Creating a test user...");
    const newUser = await prisma.user.create({
      data: {
        email: "benchmark_user@example.com",
        password: "hashed_dummy_password"
      }
    });
    users.push(newUser);
  }

  const userIds = users.map((u) => u.id);
  console.log(`👤 Distributing URLs across User IDs: [${userIds.join(", ")}]`);

  const TOTAL_RECORDS = 500; // 500 records with large technical paragraphs
  const records = [];

  for (let i = 0; i < TOTAL_RECORDS; i++) {
    const topic = topics[i % topics.length];
    const baseUrl = topic.urls[i % topic.urls.length];
    const uniqueShort = crypto.randomBytes(4).toString("hex") + i.toString(36);
    const assignedUser = userIds[i % userIds.length];
    const largeDescription = generateLargeParagraph(topic);

    records.push({
      orignal: `${baseUrl}?ref=benchmark_${i}&token=${crypto.randomBytes(8).toString("hex")}`,
      shorted: uniqueShort,
      discription: largeDescription,
      clicks: Math.floor(Math.random() * 5000),
      userid: assignedUser
    });
  }

  console.log(`📦 Inserting ${records.length} URL records in batches...`);

  // Insert in batches of 100 for safety and speed
  const BATCH_SIZE = 100;
  let insertedCount = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const result = await prisma.url.createMany({
      data: batch
    });
    insertedCount += result.count;
    console.log(`✅ Inserted batch: ${insertedCount}/${TOTAL_RECORDS}`);
  }

  const totalInDb = await prisma.url.count();
  console.log(`\n🎉 Done! Successfully inserted ${insertedCount} detailed URLs.`);
  console.log(`📊 Total URLs currently in Database: ${totalInDb}`);
}

seed()
  .catch((err) => {
    console.error("❌ Error during seeding:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
