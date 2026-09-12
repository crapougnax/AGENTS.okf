---
type: standard
title: Telemetry Ingestion Pipeline
description: End-to-end MQTT-to-DataPoint ingestion architecture from ChirpStack through Mosquitto, in-memory LoRaWAN sensor conversion, agronomic context enrichment via Backoffice API, and TimescaleDB persistence.
tags:
  - telemetry
  - mqtt
  - pipeline
  - datapoints
  - ingestion
  - iot
timestamp: 2026-09-12T06:44:00.000Z
category: iot-embedded
status: active
---

# Telemetry Ingestion Pipeline

This fiche documents the production architecture for ingesting LoRaWAN telemetry from ChirpStack through Mosquitto MQTT into a typed DataPoint timeseries database.

## 🧭 Architecture Overview

```mermaid
flowchart TD
    CS["ChirpStack v4<br>(Network Server)"] -->|Publishes JSON on MQTT| MQ["Mosquitto<br>(MQTT Broker)"]
    MQ -->|topic: application/+/device/+/event/up| TW["Telemetry Worker<br>(@quatrain/queue-mqtt)"]
    TW -->|1. Parse MQTT message| TMP["TelemetryMessageProcessor<br>.parseMqttMessage()"]
    TMP -->|2. Resolve agronomic context| BO["Backoffice API<br>(HTTP GET /devices/:devEui/context)"]
    BO -->|Plot, SoilTexture, Calibration| TMP
    TMP -->|3. Decode + Convert| LP["LoRaWanPipeline.process()<br>(Pure, In-Memory, Stateless)"]
    LP -->|FirmwareCodec.decodeFPortChannel()| BC["FirmwareCodec<br>(FPort → Float32 LE)"]
    LP -->|Domain converters| SC["@bradtech/sensor-*<br>(soil, air, weather, power, acoustic)"]
    LP -->|PipelineDataPointOutput[]| DPS["DataPointStorage<br>.saveDataPoints()"]
    DPS -->|@bradtech/datapoints| DB["PostgreSQL / TimescaleDB<br>(datapoints hypertable)"]
```

## 🔗 Component Contracts

### 1. MQTT Topic Structure (ChirpStack v4)
ChirpStack v4 publishes device events on structured MQTT topics:

```
application/{application_id}/device/{dev_eui}/event/{event_type}
```

| Event Type | Description |
|-----------|-------------|
| `up` | Uplink measurement data (primary ingestion target) |
| `join` | OTAA join-accept event |
| `ack` | Downlink acknowledgment |
| `txack` | Gateway transmission confirmation |
| `log` | Device log message |
| `status` | Device status / battery / margin |

The telemetry worker subscribes to `application/+/device/+/event/+` and filters for `up` events containing payload data.

### 2. Telemetry Worker Bootstrap

The worker uses `@quatrain/queue-mqtt` (`MosquittoQueueAdapter`) for native MQTT consumption:

```typescript
const queue = new MosquittoQueueAdapter({
    config: {
        brokerUrl: config.mqttBrokerUrl,
        username: config.mqttUsername,
        password: config.mqttPassword,
        reconnectPeriodMs: config.mqttReconnectMs,
    },
})

queue.listen(config.mqttTopicPattern, async (payload, topic) => {
    const result = await processor.process(topic, payload)
    if (result?.dataPoints.length > 0) {
        await storage.saveDataPoints(result.dataPoints, result.event)
    }
})
```

**Critical rules:**
- Use `queue.listen(topic, handler)` — zero custom wrapper classes.
- Use `Queue.info()` / `Queue.error()` for structured logging — zero raw `console.log`.

### 3. Fail-Fast Configuration

All infrastructure parameters are validated at bootstrap with actionable `Error` messages:

| Variable | Required | Description |
|----------|----------|-------------|
| `MQTT_BROKER_URL` | ✅ Always | Mosquitto connection URL (e.g. `tcp://mosquitto:1883`) |
| `MQTT_TOPIC_PATTERN` | ✅ Always | ChirpStack subscription filter |
| `BACKOFFICE_API_URL` | ✅ Always | MDM API for plot/device resolution |
| `DATABASE_URL` | ✅ When `WORKER_DRY_RUN=false` | TimescaleDB connection string |
| `WORKER_DRY_RUN` | Optional | `true` = decode + log, no DB writes |

**Zero hardcoded fallback URLs.** Missing mandatory variables throw immediately at boot.

### 4. In-Memory Pipeline (Pure & Stateless)

The `LoRaWanPipeline` class is **100% synchronous, stateless, and has zero database dependencies**:

1. **Resolve device URI** — normalize device name into canonical `probes/<serial>` or `weather-stations/<serial>` URI.
2. **Build radio metadata** — extract RSSI, SNR, frequency, gateway count from `rxInfo`/`txInfo`.
3. **Emit radio quality DataPoints** — `okf:radio/lorawan/rssi` and `okf:radio/lorawan/snr`.
4. **Decode binary payload** — `FirmwareCodec.decodeFPortChannel(fPort, base64)` → `DecodedRawChannel`.
5. **Route to domain converter** — `switch(channel.channelType)` dispatches to `@bradtech/sensor-*` packages.
6. **Inject agronomic context** — soil texture and custom lab calibration from Backoffice enrich soil moisture conversion.
7. **Map to DataPoint outputs** — each conversion result becomes a `PipelineDataPointOutput` with OKF metric URI.

### 5. Agronomic Context Resolution

The Backoffice API provides real-time plot association and calibration data:

```typescript
interface AgronomicPlotContext {
    plot?: string           // 'plots/parcelle-nord-01'
    company?: string        // 'companies/domaine-alpha'
    soilTexture?: string    // 'clay' | 'sand' | 'loam' | 'silt' | 'peat'
    soilLinearRegression?: {
        slope: number       // Lab calibration model
        intercept: number
    }
}
```

**Critical rule:** Device-to-plot mapping is resolved via HTTP API at processing time. Workers never cache or hardcode associations — the Backoffice is the authoritative master data provider.

### 6. DataPoint Model

The atomic `DataPoint` is the universal output format:

| Field | Type | Description |
|-------|------|-------------|
| `device` | `string` | Canonical device URI (e.g. `probes/b25s004`) |
| `plot` | `string?` | Canonical plot URI |
| `company` | `string?` | Tenant/company URI |
| `metric` | `string` | OKF metric identifier (e.g. `okf:soil/moisture/15cm`) |
| `value` | `number` | Calibrated numerical value |
| `unit` | `string` | Physical unit symbol (`%`, `°C`, `hPa`, `V`) |
| `kind` | `enum` | `measured` (raw sensor) or `computed` (derived algorithm) |
| `confidence` | `number` | Quality score 0.0–1.0 |
| `timestamp` | `Date` | Observation timestamp |
| `recordedat` | `Date?` | Ingestion timestamp |
| `metadata` | `object` | Radio metadata, sensor source, algorithm version |

The `DataPointRepository` provides:
- `createDataPoint(input)` — single record insert
- `insertMany(inputs)` — batch sequential insert
- `getTimeline(options)` — paginated time-range query with device/plot/metric filters
- `getLatest(identifier, metric?)` — most recent reading

### 7. OKF Metric URI Convention

Metrics follow the `okf:<domain>/<category>/<item>` pattern:

| URI | Description |
|-----|-------------|
| `okf:soil/moisture/15cm` | Volumetric water content at 15cm depth |
| `okf:soil/temperature/30cm` | Soil temperature at 30cm depth |
| `okf:soil/ec/15cm` | Electrical conductivity at 15cm depth |
| `okf:soil/water_potential/15cm` | Matric water potential (pF) |
| `okf:weather/solar/uv_index` | UV index from solar sensor |
| `okf:weather/solar/irradiance` | Solar irradiance (W/m²) |
| `okf:weather/wind/speed` | Wind speed |
| `okf:weather/pressure/atmospheric` | Barometric pressure |
| `okf:agronomy/microclimate/canopy_temperature` | Canopy air temperature |
| `okf:agronomy/power/battery_voltage` | Device battery voltage |
| `okf:radio/lorawan/rssi` | Received signal strength |
| `okf:radio/lorawan/snr` | Signal-to-noise ratio |

### 8. Graceful Shutdown

The worker implements proper SIGINT/SIGTERM handlers:
1. Unsubscribe from MQTT topics
2. Close queue connection
3. Close database connection pool
4. Exit cleanly with code 0

### 9. Dual ChirpStack Integration

ChirpStack is configured with **two simultaneous integration backends**:
- **MQTT** (`tcp://mosquitto:1883`): Real-time event stream consumed by the telemetry worker.
- **PostgreSQL** (native ChirpStack integration): Raw uplink/downlink records stored in ChirpStack's own timeseries tables for diagnostic queries and replay.
