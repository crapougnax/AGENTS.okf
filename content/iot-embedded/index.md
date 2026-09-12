# Category Index: IoT & Embedded Systems

This category specifies firmware development standards, LoRaWAN protocol conventions, telemetry ingestion pipelines, and deployment architectures for resource-constrained edge devices and network servers.

## Documents

* [Embedded C++ Standards for Resource-Constrained MCUs](embedded-cpp-standards.md) - Zero-heap static memory model, HAL abstraction, I2C bus recovery, power rail management, PlatformIO environment inheritance, and dynamic build injection.
* [LoRaWAN Protocol & Payload Encoding](lorawan-protocol-and-payload.md) - IEEE 754 Float32 LE binary encoding, FPort-to-sensor channel mapping, boot frame decoding, OTAA provisioning, Edge ADR, and fast commissioning burst mode.
* [Telemetry Ingestion Pipeline](telemetry-ingestion-pipeline.md) - End-to-end MQTT-to-DataPoint architecture from ChirpStack through Mosquitto, in-memory sensor conversion, agronomic context enrichment, and TimescaleDB persistence.
* [LoRaWAN Deployment Architecture](lorawan-deployment-architecture.md) - ChirpStack v4 deployment patterns for edge (Podman Quadlets) and production (Kubernetes Kustomize with Traefik TLS and cert-manager).
