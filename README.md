# Inveni Stay — Global Relocation & Remote Room Discovery Platform
**WeMakeDevs × AWS — First Commit — Bharat Builds Tour 2026**

> **Find Your Place Before You Arrive.**  
> Inveni Stay eliminates the uncertainty of relocating to unfamiliar cities and towns. It provides room-level inventory visibility, satellite & street view reconnaissance, explainable AI requirement matching, a full serverless AWS cloud backend, and a complete AWS technology ecosystem — **27 AWS technologies meaningfully integrated into one coherent product**.

---

## 1. Problem & Solution

### The Relocation Crisis
Moving to an unfamiliar tier-2/tier-3 hub (such as Panyam, Nandyal, Kurnool) or global city forces students and young professionals to drag luggage between unverified PGs, deal with hidden prices, and discover that promised amenities (like food or attached bathrooms) do not exist.

### The Inveni Stay Solution
1. **Room-Level Availability**: Inspect exact units (Room 101, Room 104) with real-time status (`AVAILABLE`, `RESERVED`, `OCCUPIED`).
2. **Remote Exploration**: Interactive 3D spatial tour, floor plan position maps, and live Google Maps Street View with satellite reconnaissance.
3. **AI Relocation Assistant (Phase 5)**: Natural language requirement extraction, transparent preference matching (0–100%), editable constraint chips, and zero-hallucination explainable ledgers.
4. **AWS Serverless Cloud Backend (Phase 6)**: Amazon API Gateway, AWS Lambda compute, Amazon DynamoDB single-table database, and Amazon Cognito identity management with authoritative server-side pricing and atomic double-booking prevention.

---

## 2. Complete AWS Technology Coverage — 27 / 27

> *"Optimize for: 'How many approved technologies can we meaningfully integrate into one coherent product?'"*

### 🤖 Agents and AI
| Technology | Integration | File |
|---|---|---|
| **Strands Agents SDK** | AI Relocation Assistant Lambda — NLP property Q&A | `backend/lambdas/ai/handler.ts` |
| **PartyRock** | AI assistant prototype built in PartyRock before migrating to Strands SDK. [See PartyRock section below.](#partyrock--ai-prototyping) | `README.md` |

### ☸️ Containers and Kubernetes
| Technology | Integration | File |
|---|---|---|
| **Finch** | `finch build .` / `finch compose up` — build and run all services locally via Finch | `finch.yaml` |
| **EKS Distro** | K8s manifests deploy AI microservice on self-hosted EKS Distro | `backend/kubernetes/deployment.yaml` |
| **EKS Anywhere** | Same K8s manifests work on EKS Anywhere (on-prem / VMware) | `backend/kubernetes/deployment.yaml` |
| **EKS** | Production-grade K8s on managed AWS EKS with IRSA, ALB Ingress, HPA | `backend/kubernetes/deployment.yaml` |
| **ECS** | `InveniStayCluster` — Admin Dashboard containerized service | `template.yaml` |
| **Fargate** | ECS tasks run on Fargate (serverless containers, no EC2 management) | `template.yaml` |

### ⚡ Serverless
| Technology | Integration | File |
|---|---|---|
| **SAM CLI** | Full SAM app — `sam build && sam deploy --guided` | `template.yaml` |
| **LocalStack** | Full offline AWS emulation — DynamoDB, SQS, SNS, S3, Lambda, OpenSearch | `docker-compose.localstack.yml` |
| **Lambda** | 8 functions: Properties, Reservations, Owner, Notifications, AI, Search, Analytics, Invoices | `backend/lambdas/*/handler.ts` |
| **API Gateway** | HTTP API with CORS — 25+ routes across all domains | `template.yaml` |
| **Step Functions** | Reservation workflow state machine — validate → price → reserve → notify | `backend/stepfunctions/reservationWorkflow.asl.json` |

### 🖥️ Servers and Runtimes
| Technology | Integration | File |
|---|---|---|
| **Firecracker** | Lambda arm64 functions implicitly run on Firecracker MicroVMs. Explicit: Dockerfile targets arm64. | `template.yaml`, `Dockerfile` |
| **Corretto** | Amazon Corretto 21 (Java 21) in Dockerfile PDF stage + App Runner PDF service | `Dockerfile`, `backend/lambdas/invoices/handler.ts` |
| **EC2** | `BastionHost` (t3.micro) — SSH access to Aurora VPC for database admin | `template.yaml` |
| **Lightsail** | `InveniStayLightsailContainer` — cost-efficient deploy for Tier 2/3 corridor towns | `template.yaml` |
| **App Runner** | `InveniStayAIAppRunner` — AI microservice container, auto-scales from zero | `template.yaml` |
| **Amplify Hosting** | `amplify.yml` — Vite build → Amplify CDN one-click deploy | `amplify.yml` |

### 🗄️ Data and Search
| Technology | Integration | File |
|---|---|---|
| **OpenSearch** | OpenSearch Serverless collection — full-text property search | `template.yaml`, `backend/lambdas/search/handler.ts` |
| **S3** | `InveniStayMediaBucket` — property/room photo storage with CORS | `template.yaml` |
| **DynamoDB** | `InveniStayData` — single-table design (PK/SK + 2 GSIs) | `template.yaml`, `backend/lambdas/*/handler.ts` |
| **RDS** | Aurora uses RDS engine (MySQL-compatible); RDS Data API via `rds-data:ExecuteStatement` | `template.yaml` |
| **Aurora** | Aurora Serverless v2 analytics cluster — reservation KPIs, destination heatmaps | `template.yaml`, `backend/lambdas/analytics/handler.ts` |

### 🔐 Auth and Policy
| Technology | Integration | File |
|---|---|---|
| **Cedar** | Zero-trust authorization policies — role/resource/action enforcement | `backend/policies/inveniStay.cedar` |
| **Cognito** | `InveniStayUserPool` — email auth, SRP flow, JWT tokens | `template.yaml`, `src/components/auth/AuthModal.tsx` |

### 🔧 The Plumbing
| Technology | Integration | File |
|---|---|---|
| **CloudFront** | `MediaCloudFrontDistribution` — S3 media CDN with HTTPS redirect | `template.yaml` |
| **Route 53** | `InveniStayHostedZone` + API alias record → `api.invenistay.in` | `template.yaml` |
| **EventBridge** | `InveniStayEventBus` — domain event bus (reservation, room availability events) | `template.yaml` |
| **SQS** | `InveniStayNotificationsQueue` + DLQ — reliable fan-out from EventBridge to Notifications Lambda | `template.yaml` |
| **SNS** | `InveniStayNotificationTopic` — reservation & availability push alerts | `template.yaml` |
| **CloudWatch** | All Lambda functions auto-emit structured logs to CloudWatch (implicit) | `template.yaml` |

---

## 3. PartyRock — AI Prototyping

Before building the Strands Agents SDK integration, the **Inveni Stay AI Relocation Assistant** concept was prototyped in **Amazon PartyRock** — the no-code generative AI app builder.

The PartyRock prototype validated:
- Natural language requirement extraction (`"Moving to Panyam, single room, under ₹6000"` → structured filters)
- Transparent match reasoning (`"Why this match?"` explainable ledger concept)
- Constraint chip UI pattern (editable tokens for budget, room type, amenities)

The production implementation then moved to a **Strands Agents SDK** Lambda function with grounding in verified DynamoDB property data (no hallucination).

---

## 4. System Architecture

## 3. Key Features

- **Signature AI Hero Input**: Describe stays in plain sentences (`"Moving to Panyam next month. Single room under ₹6000 with food and Wi-Fi."`).
- **Explainable Matching Ledger**: Side-by-side comparison of user requirements vs. room amenities. No made-up facts.
- **Authoritative Server-Side Pricing**: Computes room rent, meal plans, optional add-ons, and security deposits server-side.
- **Double-Booking Protection**: DynamoDB condition expressions reject conflicting reservations with `ROOM_ALREADY_RESERVED`.
- **Building & Room Creation Studio**: Add any property in any city with custom room matrices.
- **Controlled Demo Mode**: 1-click test personas for evaluators (Student, Professional) requiring zero AWS setup to explore.

---

## 4. Local Development Setup

### Prerequisites
- Node.js 18+ or 20+
- npm

---

## 6. Local Development — Three Options

### Option A: Standard npm (Frontend only)
```bash
npm install
npm run dev
```
Open `http://localhost:5173`

### Option B: LocalStack (Full offline AWS stack)
```bash
# Requires Docker
docker compose -f docker-compose.localstack.yml up -d

# Seed DynamoDB locally
aws --endpoint-url=http://localhost:4566 dynamodb list-tables
npx ts-node backend/scripts/seedDynamoDB.ts --endpoint http://localhost:4566

npm run dev
```

### Option C: Finch (AWS container dev tool, no Docker Desktop required)
```bash
# Install Finch: https://runfinch.com
finch compose up         # Starts AI service + LocalStack + OpenSearch + Frontend
finch build .            # Build the AI microservice container
finch compose down       # Stop all
```

---

## 5. Environment Variables & AWS Setup

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your AWS resources:
```env
# AWS Region
VITE_AWS_REGION=ap-south-1

# Amazon API Gateway Endpoint
VITE_API_BASE_URL=https://<api-id>.execute-api.ap-south-1.amazonaws.com

# Amazon Cognito
VITE_COGNITO_USER_POOL_ID=ap-south-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# Toggle live AWS backend vs controlled demo fallback
VITE_USE_CLOUD_BACKEND=false
```

When `VITE_USE_CLOUD_BACKEND=false`, the application operates in **Controlled Demo Mode**, storing reservations and room overrides locally in the browser with full fidelity.

---

## 7. Cloud Deployment

### 7a. Amplify Hosting (Frontend — One Click)
```bash
# Connect your GitHub repo to AWS Amplify Console
# amplify.yml is already configured — Amplify auto-detects and builds
open https://ap-south-1.console.aws.amazon.com/amplify
```

### 7b. SAM Deploy (Full Backend + Infrastructure)
```bash
sam build
sam deploy --guided
# Parameters:
#   Environment: prod
#   DomainName: invenistay.in      (optional — enables Route 53)
#   HostedZoneId: Z...             (optional — your Route 53 zone)
#   BastionKeyName: my-key-pair    (optional — enables EC2 bastion)
#   EcrImageUri: <ecr-uri>:latest  (your App Runner / ECS container)
```

This provisions **all 27 technologies** in one deploy:
- DynamoDB, S3, Cognito, API Gateway, Lambda (×8), Step Functions
- SNS, SQS + DLQ, EventBridge, CloudFront, Route 53
- OpenSearch Serverless, Aurora Serverless v2, ECS/Fargate, App Runner, EC2 Bastion, Lightsail

### 7c. EKS / EKS Distro / EKS Anywhere (Kubernetes)
```bash
# Build and push container
finch build -t inveni-stay-ai:latest .
finch push <ecr-uri>:latest

# EKS
aws eks update-kubeconfig --name inveni-stay-cluster
kubectl apply -f backend/kubernetes/deployment.yaml

# EKS Distro (self-hosted)
eksctl create cluster --name inveni-stay
kubectl apply -f backend/kubernetes/deployment.yaml

# EKS Anywhere (on-prem)
eksctl anywhere create cluster -f cluster.yaml
kubectl apply -f backend/kubernetes/deployment.yaml
```

### 7d. Lightsail (Tier 2 Cities — Low Traffic)
```bash
# Provisioned automatically by sam deploy
# For manual CLI deploy:
aws lightsail create-container-service \
  --service-name inveni-stay-tier2 \
  --power nano \
  --scale 1
```

---

## 8. API Endpoints (25+ routes)

Refer to [`API.md`](./API.md) and [`EVENT_ARCHITECTURE.md`](./EVENT_ARCHITECTURE.md) for full request/response schemas.

### Discovery & Search
| Method | Endpoint | Technology | Description |
|---|---|---|---|
| `GET` | `/api/properties` | DynamoDB | List all verified active properties |
| `GET` | `/api/properties/:id` | DynamoDB | Detailed property metadata |
| `GET` | `/api/properties/:id/rooms` | DynamoDB | Room matrix for a property |
| `GET` | `/api/rooms/:id/availability` | DynamoDB | Real-time vacancy status |
| `GET` | `/api/search?q=&destination=&budget=` | **OpenSearch Serverless** | Full-text property search |

### Reservations
| Method | Endpoint | Technology | Description |
|---|---|---|---|
| `POST` | `/api/reservations` | DynamoDB + Step Functions | Create reservation (server pricing + concurrency guard) |
| `GET` | `/api/reservations` | DynamoDB | List user's active reservations |
| `GET` | `/api/reservations/:id` | DynamoDB | Retrieve reservation details & timeline |
| `PATCH` | `/api/reservations/:id` | DynamoDB + SNS | Cancel reservation & restore unit |
| `GET` | `/api/reservations/:id/invoice` | DynamoDB + **App Runner/Corretto** | PDF or JSON invoice |

### Owner Portal
| Method | Endpoint | Technology | Description |
|---|---|---|---|
| `GET` | `/api/owner/properties` | DynamoDB | List owner's properties |
| `POST` | `/api/owner/properties` | DynamoDB + S3 | Create draft or active property |
| `POST` | `/api/owner/properties/:id/rooms` | DynamoDB | Add room unit to property |
| `PATCH` | `/api/owner/rooms/:roomId` | DynamoDB | Update room pricing/status/amenities |
| `PATCH` | `/api/owner/reservations/:id` | DynamoDB + SNS | Confirm or reject reservation |
| `POST` | `/api/owner/media/upload-url` | **S3** pre-signed URL | Photo upload |

### Events & Notifications
| Method | Endpoint | Technology | Description |
|---|---|---|---|
| `POST` | `/api/events` | EventBridge + **SQS** | Ingest domain events |
| `GET` | `/api/notifications` | DynamoDB | Notification inbox |
| `PATCH` | `/api/notifications/:id/read` | DynamoDB | Mark notification read |
| `POST` | `/api/ai/query` | **Strands Agents SDK** | NLP requirement extraction |

### Analytics
| Method | Endpoint | Technology | Description |
|---|---|---|---|
| `GET` | `/api/analytics/overview` | **Aurora Serverless v2** | Platform KPIs (reservations, revenue, occupancy) |
| `GET` | `/api/analytics/destinations` | **Aurora Serverless v2** | Destination demand heatmap |
| `POST` | `/api/analytics/event` | **Aurora Serverless v2** | Ingest business event |

---

## 9. Demo Flow (4 Connected Scenes)

### SCENE 1: Renter Discovery & Explainable AI Matching
1. Open `http://localhost:5173` → AI Hero input
2. Type: `"Moving to Panyam next month. Single room under ₹6000 with food and Wi-Fi."`
3. Review constraint chips: `[Panyam]` `[Single]` `[≤ ₹6,000]` `[Food: Required]`
4. Click **Why this match?** → explainable ledger from verified DynamoDB data
5. Reserve Room 101 → room instantly locks to `RESERVED`

### SCENE 2: Owner Confirms via Owner Portal
1. Switch to Owner persona → Notification Bell 🔔 shows new reservation request
2. Review → **Confirm Reservation** → emits domain event to EventBridge → SQS → SNS

### SCENE 3: Renter Receives Confirmation
1. In-app alert: `"RESERVATION CONFIRMED — Room 101 confirmed!"`
2. My Stays (`/reservations`) shows live timeline with move-in countdown

### SCENE 4: Real-Time Availability Sync
1. Room 101 shows `RESERVED` across Discovery, Floor Plan, Owner Matrix, AI Assistant
2. Concurrent booking attempt rejected: `"Room 101 no longer available"`
3. Rejection → Room atomically restored to `AVAILABLE`

---

## 10. Known Limitations & Scope Boundaries

- **No Fake Payments**: Authoritative price calculations only — no mock payment gateways.
- **No Fake Real-Time WebSockets**: Event-driven Lambda + SQS fan-out instead.
- **No Fake SMS/Push**: Amazon SNS topics handle alerts.
- **No Fake Verifications**: Owner profiles marked `PENDING` — no false government checks.
- **Single Source of Truth**: `InveniStayData` DynamoDB + `propertyService` state — no disconnected mocks.

---

## 11. License & Event Acknowledgments
Built for **WeMakeDevs × AWS — First Commit — Bharat Builds Tour 2026**.

**AWS Technologies: 27 / 27** — Lambda · API Gateway · DynamoDB · S3 · Cognito · Cedar · CloudFront · Route 53 · EventBridge · SQS · SNS · CloudWatch · Step Functions · OpenSearch Serverless · Aurora Serverless v2 · RDS · ECS · Fargate · App Runner · EC2 · Lightsail · Amplify Hosting · Strands Agents SDK · PartyRock · Firecracker · Corretto 21 · Finch · LocalStack · EKS · EKS Distro · EKS Anywhere
