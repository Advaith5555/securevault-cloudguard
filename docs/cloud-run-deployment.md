# Deploying SecureVault CloudGuard Backend to Google Cloud Run

This guide walks through **building a container image** and **deploying it to Cloud Run** with related Google Cloud services. It is **optional / alternative documentation** for GCP.

For a **live HTTPS demo**, this project uses **Render** instead (see **[`render-deployment.md`](render-deployment.md)**). Cloud Run was **not** used for that iteration because the **GCP project available at the time needed billing enabled to turn on required APIs**—keeping this guide for a future or parallel path when that is an option.

Completing these steps is **your responsibility**; **no Cloud Run URL exists** from this document alone.

---

## Prerequisites

- A **Google Cloud account** with **billing enabled**
- **`gcloud` CLI** installed and authenticated (`gcloud auth login`)
- **Docker** installed locally (for building and pushing the image)
- A **GCP project** created (note the **project ID**)

---

## Recommended Google Cloud services (for a realistic setup)

| Service | Role |
|---------|------|
| **Cloud Run** | Runs the HTTPS API container, scales automatically |
| **Artifact Registry** | Stores the Docker image |
| **Cloud SQL for PostgreSQL** | Managed database (replace Docker Compose Postgres) |
| **Secret Manager** | Store `JWT_SECRET` and DB credentials safely |
| **Cloud Logging** | Request and platform logs for Cloud Run |
| **Cloud Monitoring** | Metrics, dashboards, alerting, uptime checks |

CI in this repo (GitHub Actions) **does not deploy** anything; it only checks code quality.

---

## Shell variables

Set these once per terminal session (use **your** project ID):

```bash
export PROJECT_ID=your-gcp-project-id
export REGION=asia-south1
export REPOSITORY=securevault
export IMAGE_NAME=securevault-api
export SERVICE_NAME=securevault-api
```

Examples (placeholders):

- `PROJECT_ID=your-gcp-project-id`
- `REGION=asia-south1`
- `REPOSITORY=securevault`
- `IMAGE_NAME=securevault-api`
- `SERVICE_NAME=securevault-api`

```bash
gcloud config set project $PROJECT_ID
```

---

## Enable APIs

```bash
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com sqladmin.googleapis.com
```

---

## Artifact Registry repository

```bash
gcloud artifacts repositories create $REPOSITORY \
  --repository-format=docker \
  --location=$REGION \
  --description="Docker images for SecureVault CloudGuard"
```

---

## Docker authentication for Artifact Registry

```bash
gcloud auth configure-docker $REGION-docker.pkg.dev
```

---

## Container image

The repo includes **`backend/Dockerfile`**: a **multi-stage** build producing the **`securevault-api`** binary (`golang:1.22-alpine` builder, **Alpine 3.20** runtime with **ca-certificates**). Defaults: `PORT=8080`, `APP_ENV=production`; override env vars when you deploy.

Use **that Dockerfile** with the **`docker build`** path below when publishing to Artifact Registry. For local runs against Postgres on your host port **5433**, see **`Running backend with Docker`** in [`backend/README.md`](../backend/README.md) (**`host.docker.internal`** notes).

---


## Build image from backend

From the **`backend/`** directory (where `go.mod` lives):

```bash
cd backend
docker build -t $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$IMAGE_NAME:latest .
```

---

## Push image

```bash
docker push $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$IMAGE_NAME:latest
```

---

## Deploy to Cloud Run

Example **minimal** deploy (⚠️ not production-hardened): **public ingress** (`--allow-unauthenticated`) and non-sensitive env vars only. **Do not** paste real `DATABASE_URL` or `JWT_SECRET` inline in shared scripts.

```bash
gcloud run deploy $SERVICE_NAME \
  --image $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$IMAGE_NAME:latest \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars APP_ENV=production,PORT=8080
```

Notes:

- Cloud Run sets **`PORT`** automatically for each revision; confirm the container listens on that value (`backend` uses `PORT` from the environment).
- For **authenticated** APIs only, **omit** `--allow-unauthenticated` and configure IAM for invokers instead.
- For **`DATABASE_URL`**: locally it points at **Docker Postgres**. On Cloud Run it must target **Cloud SQL** (Unix socket connector, Auth Proxy pattern, etc.). **`localhost` in the Cloud Run container is not your laptop's Postgres.**
- Use **Secret Manager** (for example `--set-secrets`) for production `JWT_SECRET` and database URLs after you provision secrets—details depend on your Cloud SQL setup.

---

## Health check after deployment

Replace with the HTTPS URL printed by `gcloud run deploy`:

```bash
curl https://YOUR_CLOUD_RUN_URL/health
```

**There is no fixed URL for this repo** until you deploy and copy your own service URL.

---

## Logs

- **Platform / stdout**: Cloud Run logs appear in **Google Cloud Logging** (Logs Explorer → Cloud Run revision).
- **Application audit rows**: The **`audit_logs`** table in Postgres is **application data**, not the same as GCP audit logs.

---

## Monitoring

Use **Cloud Monitoring** for request counts, latency, error rates, and **uptime checks** against `/health`.

---

## Rollback

Cloud Run keeps **revisions**. Route traffic to a **previous revision** in the console (Cloud Run → service → Revisions / traffic splitting) for a manual rollback.

---

## Cost notes

- **Cloud Run** can **scale to zero** when idle (pricing still applies to requests and CPU while handling traffic).
- **Cloud SQL** often incurs cost **even when idle**.
- **Clean up** unused services, images, and instances when experimenting.

---

## Cleanup (destructive)

```bash
gcloud run services delete $SERVICE_NAME --region $REGION --quiet
gcloud artifacts repositories delete $REPOSITORY --location $REGION --quiet
```

Cloud SQL instances are deleted separately when you are ready (`gcloud sql instances delete …`).

---

## Further reading inside this repo

- [architecture.md](architecture.md) — diagrams and scope
- [environment-variables.md](environment-variables.md) — `DATABASE_URL`, `JWT_SECRET`, and safety
