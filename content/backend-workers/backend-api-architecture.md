---
type: pattern
title: Backend API Architecture (Express, Middlewares & REST)
description: Best practices for structuring Express and REST API services, modular routing, middleware pipelines, and consistent error handling.
tags:
  - backend
  - express
  - rest
  - api
  - microservices
timestamp: 2026-09-12T05:00:00.000Z
category: backend-workers
status: active
---

# Backend API Architecture (Express, Middlewares & REST)

Backend HTTP services follow a clean, layered REST architectural pattern.

## 🧭 Core Directives

### 1. Modular Route Namespaces
- Organize routes into cohesive domain routers (e.g. `/api/v1/auth`, `/api/v1/projects`, `/api/v1/records`).
- Route handlers must remain thin controllers: parse input, invoke the appropriate domain service or repository, and format the HTTP response.
- Business validation belongs in domain entities or validators, never inlined across controller files.

### 2. Standard Middleware Pipeline
Maintain a predictable middleware pipeline order:
1. **Security & Headers:** Helmet, CORS, and request ID injection.
2. **Body Parsing:** JSON / URL-encoded parsers with size limits.
3. **Authentication & Identity:** Token extraction and session validation.
4. **Tenant Context:** Injecting tenant/organization scope into `req.context`.
5. **Business Routers:** Mounting domain routes.
6. **Centralized Error Handler:** Global error middleware catching uncaught exceptions and formatting consistent JSON error envelopes.

### 3. Error Envelope Convention
HTTP error responses must always return a consistent JSON payload:
```json
{
  "error": {
    "code": "ENTITY_NOT_FOUND",
    "message": "Project with id 'prj-102' does not exist.",
    "statusCode": 404
  }
}
```

## 🔗 Related Units
- [Strict Typing & Interfaces](../architecture/strict-typing-and-interfaces.md)
- [PostgreSQL DDL & Naming Standards](postgresql-ddl-and-naming.md)
- [Background Workers & Triggers](background-workers-and-triggers.md)
