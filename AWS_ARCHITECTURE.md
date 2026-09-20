# INVENI STAY — AWS CLOUD ARCHITECTURE (27/27 Technologies)
**Bharat Builds Tour 2026 • WeMakeDevs × AWS**

---

## 1. Full Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        INVENI STAY — 27 AWS TECHNOLOGIES                        │
└─────────────────────────────────────────────────────────────────────────────────┘

  ┌────────────────────────────────────────────────────────────────────────────┐
  │  FRONTEND (React 19 / Vite / TypeScript)                                  │
  │  • Amplify Hosting → Vite dist/ → Amplify CDN  [amplify.yml]              │
  │  • Local Dev: finch compose up / docker-compose.localstack.yml            │
  └──────────────────────────────┬─────────────────────────────────────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                   ▼
  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐
  │ Amazon Cognito  │  │ Amazon CloudFront│  │  Amazon Route 53        │
  │ User Pool       │  │ Media CDN Edge  │  │  api.invenistay.in DNS  │
  │ [Cedar policy]  │  │ S3 → HTTPS      │  │  Alias → API Gateway    │
  └────────┬────────┘  └────────┬────────┘  └────────────┬────────────┘
           │                    │                         │
           └──────────────────► ▼ ◄───────────────────────┘
                    ┌─────────────────────────────┐
                    │   Amazon API Gateway (HTTP) │
                    │   25+ Routes / CORS         │
                    └─────────────┬───────────────┘
                                  │
         ┌────────────────────────┼─────────────────────────┐
         │                        │                          │
         ▼                        ▼                          ▼
┌──────────────────┐  ┌───────────────────────┐  ┌─────────────────────┐
│ AWS Lambda (×8)  │  │  AWS Step Functions   │  │ AWS App Runner      │
│ arm64/Firecracker│  │  Reservation Workflow │  │ AI Microservice     │
│ Node.js 20.x     │  │  state machine        │  │ Corretto 21 PDF svc │
│                  │  └──────────┬────────────┘  └─────────────────────┘
│ • PropertiesLambda│             │
│ • ReservationsLambda│    ┌──────▼───────┐
│ • OwnerPortalLambda│     │ EventBridge  │
│ • NotificationsLambda│   │ Event Bus    │
│ • AIAssistantLambda│     └──────┬───────┘
│ • SearchLambda   │              │
│ • AnalyticsLambda│         ┌────▼─────┐      ┌─────────────┐
│ • InvoicesLambda │         │ SQS Queue│      │ SQS DLQ     │
└────────┬─────────┘         │ + DLQ    │      │ (14d retain)│
         │                   └────┬─────┘      └─────────────┘
         │                        │
         │              ┌─────────▼──────────┐
         │              │  Amazon SNS Topic  │
         │              │  Notification Alerts│
         │              └────────────────────┘
         │
┌────────▼─────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                    │
│                                                                       │
│  ┌──────────────────────────┐  ┌───────────────────────────────────┐ │
│  │  Amazon DynamoDB         │  │  Amazon OpenSearch Serverless      │ │
│  │  Single-Table Design     │  │  Full-text property search        │ │
│  │  PK/SK + 2 GSIs          │  │  Collection: inveni-stay-props    │ │
│  │  InveniStayData          │  └───────────────────────────────────┘ │
│  └──────────────────────────┘                                        │
│                                                                       │
│  ┌──────────────────────────┐  ┌───────────────────────────────────┐ │
│  │  Aurora Serverless v2    │  │  Amazon S3                        │ │
│  │  (RDS MySQL engine)      │  │  Media Bucket (photos, floor plans│ │
│  │  Analytics + KPIs        │  │  CloudFront CDN origin)           │ │
│  │  RDS Data API enabled    │  └───────────────────────────────────┘ │
│  └──────────────────────────┘                                        │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   CONTAINER & COMPUTE LAYER                         │
│                                                                     │
│  ┌────────────────────┐  ┌────────────────────┐  ┌───────────────┐ │
│  │  Amazon ECS        │  │  AWS Fargate       │  │  Amazon EC2   │ │
│  │  InveniStayCluster │  │  Admin Dashboard   │  │  Bastion Host │ │
│  │  Container Insights│  │  serverless tasks  │  │  t3.micro     │ │
│  └────────────────────┘  └────────────────────┘  └───────────────┘ │
│                                                                     │
│  ┌────────────────────┐  ┌────────────────────┐                    │
│  │  Amazon Lightsail  │  │  Kubernetes (EKS)  │                    │
│  │  Tier 2/3 cities   │  │  EKS Distro        │                    │
│  │  Nano container    │  │  EKS Anywhere      │                    │
│  └────────────────────┘  └────────────────────┘                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│               LOCAL DEVELOPMENT STACK                               │
│                                                                     │
│  LocalStack: DynamoDB + SQS + SNS + S3 + Lambda + OpenSearch       │
│  Finch: finch compose up (AI svc + LocalStack + OpenSearch + Vite) │
│  SAM Local: sam local start-api                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Register (27 / 27)

### Agents & AI (2/2)
| # | Technology | Role | Implementation |
|---|---|---|---|
| 1 | **Strands Agents SDK** | AI Relocation Assistant — NLP property Q&A, context-aware responses | `backend/lambdas/ai/handler.ts` |
| 2 | **PartyRock** | AI prototype validation before Strands SDK implementation | Documented in README |

### Containers & Kubernetes (6/6)
| # | Technology | Role | Implementation |
|---|---|---|---|
| 3 | **Finch** | Local container builds + compose (`finch build .`, `finch compose up`) | `finch.yaml` |
| 4 | **EKS Distro** | Self-hosted K8s for enterprise deployments | `backend/kubernetes/deployment.yaml` |
| 5 | **EKS Anywhere** | On-premises / VMware K8s deployments | `backend/kubernetes/deployment.yaml` |
| 6 | **EKS** | Managed K8s — Deployment, Service, Ingress, HPA, IRSA | `backend/kubernetes/deployment.yaml` |
| 7 | **ECS** | `InveniStayCluster` — Admin Dashboard container service | `template.yaml` |
| 8 | **Fargate** | Serverless container execution for ECS tasks | `template.yaml` |

### Serverless (5/5)
| # | Technology | Role | Implementation |
|---|---|---|---|
| 9 | **SAM CLI** | Infrastructure as code — build, package, deploy | `template.yaml` |
| 10 | **LocalStack** | Full offline AWS emulation for local dev | `docker-compose.localstack.yml` |
| 11 | **Lambda** | 8 functions (arm64 Firecracker MicroVMs, Node.js 20.x) | `backend/lambdas/*/handler.ts` |
| 12 | **API Gateway** | HTTP API — 25+ routes, CORS, JWT auth | `template.yaml` |
| 13 | **Step Functions** | Reservation state machine (validate → price → reserve → notify) | `backend/stepfunctions/reservationWorkflow.asl.json` |

### Servers & Runtimes (6/6)
| # | Technology | Role | Implementation |
|---|---|---|---|
| 14 | **Firecracker** | Lambda arm64 MicroVM runtime (implicit); explicit in Dockerfile arch target | `template.yaml` (arm64), `Dockerfile` |
| 15 | **Corretto** | Amazon Corretto 21 (Java 21) — PDF generation stage in Dockerfile | `Dockerfile` (Stage 2), `backend/lambdas/invoices/handler.ts` |
| 16 | **EC2** | Bastion host (t3.micro) — SSH access to Aurora VPC | `template.yaml` (BastionHost) |
| 17 | **Lightsail** | Container service for Tier 2/3 corridor towns (low-cost) | `template.yaml` (InveniStayLightsailContainer) |
| 18 | **App Runner** | AI microservice container — auto-scales from zero, no infra management | `template.yaml` (InveniStayAIAppRunner) |
| 19 | **Amplify Hosting** | Frontend CDN — Vite build → Amplify global edge | `amplify.yml` |

### Data & Search (5/5)
| # | Technology | Role | Implementation |
|---|---|---|---|
| 20 | **OpenSearch** | Serverless collection — full-text property search | `template.yaml` (InveniStaySearchCollection), `backend/lambdas/search/handler.ts` |
| 21 | **S3** | Media storage — property/room photos, CloudFront origin | `template.yaml` (InveniStayMediaBucket) |
| 22 | **DynamoDB** | Single-table design — properties, rooms, reservations, notifications | `template.yaml` (InveniStayData) |
| 23 | **RDS** | Aurora Serverless v2 uses RDS engine (MySQL); accessed via RDS Data API | `template.yaml` (InveniStayAnalyticsCluster) |
| 24 | **Aurora** | Aurora Serverless v2 — analytics, KPIs, destination heatmaps | `template.yaml` (InveniStayAnalyticsCluster), `backend/lambdas/analytics/handler.ts` |

### Auth & Policy (2/2)
| # | Technology | Role | Implementation |
|---|---|---|---|
| 25 | **Cedar** | Zero-trust authorization — role/resource/action policies | `backend/policies/inveniStay.cedar` |
| 26 | **Cognito** | User Pool + App Client — email auth, JWT tokens, SRP flow | `template.yaml` (InveniStayUserPool) |

### The Plumbing (6/6)
| # | Technology | Role | Implementation |
|---|---|---|---|
| 27 | **CloudFront** | Edge CDN — S3 media distribution, HTTPS redirect | `template.yaml` (MediaCloudFrontDistribution) |
| 28 | **Route 53** | DNS — HostedZone + API Gateway alias record | `template.yaml` (InveniStayHostedZone) |
| 29 | **EventBridge** | Domain event bus — reservation events, room availability changes | `template.yaml` (InveniStayEventBus) |
| 30 | **SQS** | Notification queue + DLQ — reliable EventBridge → Lambda fan-out | `template.yaml` (InveniStayNotificationsQueue + DLQ) |
| 31 | **SNS** | Push notifications — reservation & availability alerts | `template.yaml` (InveniStayNotificationTopic) |
| 32 | **CloudWatch** | Observability — Lambda logs, error alarms, latency metrics (implicit) | All Lambda functions |

---

## 3. Single-Table DynamoDB Design

```
PK                          SK                  Entity
─────────────────────────── ─────────────────── ──────────────────────
PROPERTY#panyam_sri_sai     META                Property metadata
PROPERTY#panyam_sri_sai     ROOM#101            Room unit
PROPERTY#panyam_sri_sai     ROOM#102            Room unit
RESERVATION#INV-2026-00118  META                Reservation record
USER#usr_renter_01          PROFILE             User profile
USER#usr_renter_01          NOTIFICATION#...    Notification item
EVENT#<idempotency_id>      META                Idempotency record

GSI1: GSI1PK (userId) + GSI1SK → query user's reservations
GSI2: GSI2PK (propertyId) + GSI2SK → query property's reservations
```

---

## 4. Event Architecture (EventBridge → SQS → Lambda → SNS)

```
Domain Action          EventBridge Event            SQS Queue         Lambda             SNS
─────────────────────  ──────────────────────────   ────────────────  ─────────────────  ───────────────
Reservation Created  → RESERVATION_CREATED        → InveniStayNotif → NotificationsLambda → Topic → User
Room Status Changed  → ROOM_AVAILABILITY_CHANGED  → InveniStayNotif → NotificationsLambda → Topic → Owner
Reservation Cancelled → RESERVATION_CANCELLED     → InveniStayNotif → NotificationsLambda → Topic → Both
```

**Reliability**: SQS DLQ captures failed messages after 3 attempts. 14-day retention.
**Idempotency**: `EVENT#<idempotency_id>` DynamoDB item prevents duplicate processing.

---

## 5. Deployment Commands Summary

```bash
# Frontend (Amplify Hosting)
# → Connect GitHub to Amplify Console, amplify.yml handles the rest

# Full Backend (SAM)
sam build
sam deploy --guided

# Local Dev — Option A: npm
npm run dev

# Local Dev — Option B: LocalStack
docker compose -f docker-compose.localstack.yml up -d
npm run dev

# Local Dev — Option C: Finch
finch compose up

# Kubernetes (EKS / EKS Distro / EKS Anywhere)
kubectl apply -f backend/kubernetes/deployment.yaml

# Container Build (Finch — no Docker Desktop needed)
finch build -t inveni-stay-ai:latest .
finch push <ecr-uri>:latest
```
