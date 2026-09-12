---
type: standard
title: LoRaWAN Deployment Architecture
description: ChirpStack v4 deployment patterns for edge environments (Podman Quadlets with systemd) and production Kubernetes clusters (Kustomize with Traefik TLS and cert-manager).
tags:
  - lorawan
  - chirpstack
  - deployment
  - kubernetes
  - podman
  - infrastructure
timestamp: 2026-09-12T06:44:00.000Z
category: iot-embedded
status: active
---

# LoRaWAN Deployment Architecture

ChirpStack v4 network server infrastructure follows two deployment models depending on the operational context: lightweight edge deployments using Podman Quadlets, and production-grade Kubernetes clusters with Kustomize, Traefik, and automated TLS.

## 🏠 Edge / On-Premise Deployment (Podman Quadlets)

For single-site installations, labs, or development environments, ChirpStack runs as a set of Podman containers orchestrated via systemd Quadlet files.

### Stack Components

| Container | Image | Port | Purpose |
|-----------|-------|------|---------|
| `chirpstack` | `chirpstack/chirpstack:4.x` | 8080 (gRPC+Web) | Network + Application Server |
| `chirpstack-gateway-bridge` | `chirpstack/chirpstack-gateway-bridge:4.x` | 3001 (WSS) | LoRa Basics Station bridge |
| `mosquitto` | `eclipse-mosquitto:2.x` | 1883 (MQTT) | Message broker |
| `postgres` | `postgres:16-alpine` | 5432 | Persistent storage |
| `redis` | `redis:7-alpine` | 6379 | Device session cache |

### Quadlet File Structure
```
iac/quadlets/
├── chirpstack.container
├── chirpstack-gateway-bridge.container
├── mosquitto.container
├── postgres.container
├── redis.container
├── lorawan.network
└── postgres-data.volume
```

Each `.container` file defines:
- Container image and tag
- Network attachment (`lorawan.network`)
- Volume mounts for configuration and persistent data
- Systemd dependency ordering (`After=`, `Requires=`)

### Configuration Template
ChirpStack configuration is provided via a TOML template:

```toml
[logging]
level = "info"

[postgresql]
dsn = "postgres://chirpstack:chirpstack@postgres:5432/chirpstack?sslmode=disable"
max_open_connections = 10

[redis]
servers = ["redis://redis:6379/0"]

[network]
net_id = "000000"
enabled_regions = ["eu868"]

[api]
bind = "0.0.0.0:8080"
secret = "replace-with-jwt-secret-in-production"

[integration]
enabled = ["mqtt"]

[integration.mqtt]
server = "tcp://mosquitto:1883"
json = true
```

## ☸️ Production Kubernetes Deployment (Kustomize)

Production LoRaWAN infrastructure runs in a dedicated `lorawan` namespace using Kustomize-based manifests.

### Kustomization Resources

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: lorawan
resources:
  - postgres-pvc.yml          # 20Gi SBS block storage
  - postgres-init-sql.yml     # Database initialization ConfigMap
  - postgres-deployment.yml   # PostgreSQL 16
  - redis-deployment.yml      # Redis 7
  - mosquitto-deployment.yml  # Eclipse Mosquitto 2.x
  - gateway-bridge-configmap.yml
  - gateway-bridge-deployment.yml  # Basics Station WSS bridge
  - chirpstack-configmap.yml
  - chirpstack-deployment.yml      # ChirpStack + REST API sidecar
  - ingressroutes.yml              # Traefik IngressRoute + TLS
```

### ChirpStack Deployment Pattern
The ChirpStack pod runs **two containers** (sidecar pattern):

1. **chirpstack** — Main application + network server (gRPC port 8080)
2. **chirpstack-rest-api** — REST API proxy translating gRPC to HTTP (port 8090)

```yaml
containers:
  - name: chirpstack
    image: chirpstack/chirpstack:4.11.0
    args: ["-c", "/etc/chirpstack"]
    ports:
      - containerPort: 8080
    resources:
      requests: { cpu: 100m, memory: 256Mi }
      limits:   { cpu: 1000m, memory: 1Gi }
  - name: chirpstack-rest-api
    image: chirpstack/chirpstack-rest-api:4.11.0
    args: ["--server", "127.0.0.1:8080", "--bind", "0.0.0.0:8090", "--insecure"]
    resources:
      requests: { cpu: 50m, memory: 64Mi }
      limits:   { cpu: 200m, memory: 128Mi }
```

### Gateway Bridge (Basics Station WSS)
- Accepts WebSocket Secure connections from LoRa gateways using the Semtech Basics Station protocol.
- Exposed on port 3001 behind the Traefik TLS termination.

### Traefik IngressRoute with Priority Routing

```yaml
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: basic-station-wss
  namespace: lorawan
spec:
  entryPoints: [websecure]
  routes:
    - match: Host(`<hostname>`) && (PathPrefix(`/traffic`) || PathPrefix(`/router-info`))
      kind: Rule
      priority: 100              # WSS gateway traffic takes highest priority
      services:
        - name: gateway-bridge
          port: 3001
  tls:
    secretName: lorawan-tls
---
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: chirpstack-web
spec:
  routes:
    - match: Host(`<hostname>`) && PathPrefix(`/api/`)
      priority: 80               # REST API
      services:
        - name: chirpstack
          port: 8090
    - match: Host(`<hostname>`)
      priority: 50               # Web UI (gRPC-web via h2c)
      services:
        - name: chirpstack
          port: 8080
          scheme: h2c
```

### TLS Certificate (cert-manager)
```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: lorawan-tls-cert
  namespace: lorawan
spec:
  secretName: lorawan-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
    - <lorawan-hostname>
```

### Persistent Storage
- PostgreSQL data is backed by a **20Gi PersistentVolumeClaim** using block storage (e.g. Scaleway SBS).
- `storageClassName` must match the cluster's provisioner (e.g. `sbs-5k` for Scaleway SBS 5000 IOPS).

### EU868 Extra Channels
Production ChirpStack enables 5 additional EU868 sub-band channels for increased capacity:

| Frequency | DR Range |
|-----------|----------|
| 867.1 MHz | DR0–DR5 |
| 867.3 MHz | DR0–DR5 |
| 867.5 MHz | DR0–DR5 |
| 867.7 MHz | DR0–DR5 |
| 867.9 MHz | DR0–DR5 |

### Dual Integration Pipeline
Production ChirpStack is configured with **two** simultaneous integration backends:

```toml
[integration]
enabled = ["mqtt", "postgresql"]

[integration.mqtt]
server = "tcp://mosquitto:1883"
json = true

[integration.postgresql]
dsn = "postgres://chirpstack:chirpstack@postgres:5432/chirpstack?sslmode=disable"
```

- **MQTT**: Live event stream consumed by the telemetry worker for real-time DataPoint ingestion.
- **PostgreSQL**: Native ChirpStack timeseries storage for raw uplink/downlink logs, device metrics, and diagnostic replay.

### Deployment Automation
A one-shot deployment script handles:
1. `kubectl apply -k` for all Kustomize resources
2. Sequential rollout status verification for each Deployment
3. **Secure admin credential auto-provisioning**: generates a 24-char high-entropy password, computes PBKDF2-SHA512 hash, updates the ChirpStack PostgreSQL `user` table, and persists credentials in a Kubernetes Secret.

## 🔐 Security Considerations

- ChirpStack API JWT secret must be rotated from the default placeholder before production use.
- MQTT authentication (username/password) should be enabled on Mosquitto for production deployments.
- Admin credentials are stored in a Kubernetes Secret (`chirpstack-initial-admin-secret`) — never in ConfigMaps or source control.
- PostgreSQL credentials should use Kubernetes Secrets with volume injection or environment variable references.
