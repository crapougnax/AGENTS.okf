---
type: standard
title: LoRaWAN Protocol & Payload Encoding
description: Binary payload encoding standards, FPort-to-sensor channel mapping, boot frame structure, OTAA provisioning, Edge ADR strategy, and duty cycle management for LoRaWAN Class A IoT devices.
tags:
  - lorawan
  - protocol
  - payload
  - binary
  - fport
  - iot
timestamp: 2026-09-12T06:44:00.000Z
category: iot-embedded
status: active
---

# LoRaWAN Protocol & Payload Encoding

LoRaWAN payloads must be compact, deterministic, and decodable without external schema negotiation. This fiche defines the binary encoding standard, FPort channel mapping, and radio management strategies for Class A end devices.

## 🧭 Core Directives

### 1. Binary Encoding: IEEE 754 Float32 Little-Endian
- **All telemetry payloads are encoded as 4-byte IEEE 754 Float32 Little-Endian values.**
- No JSON, no string encoding, no Cayenne LPP — raw binary only.
- This maximizes payload efficiency within the LoRaWAN 51-byte (DR0) to 222-byte (DR5) MTU constraints.

```
Byte 0    Byte 1    Byte 2    Byte 3
[LSB]     [...]     [...]     [MSB]
└────────── Float32 LE ──────────┘
```

Decoding in TypeScript:
```typescript
static decodeFloat32(data: string | Buffer): number | null {
    const buffer = typeof data === 'string' ? Buffer.from(data, 'base64') : data
    if (buffer.length < 4) return null
    return buffer.readFloatLE(0)
}
```

### 2. FPort Convention: Channel Multiplexing
The LoRaWAN Application Port (FPort) uniquely identifies the physical sensor channel and measurement type.

| FPort | Channel Type | Sensor Source | Depth | Unit |
|-------|-------------|---------------|-------|------|
| **1** | **Boot Payload** | System | — | 9-byte composite |
| **2** | Battery Voltage | Internal ADC | — | V |
| **9** | Solar UV Index | SI1145 | — | index |
| **11** | Canopy Humidity | SHT40 | — | % |
| **12** | Solar Visible | SI1145 | — | counts |
| **13** | Solar Illuminance | SI1145 | — | lx |
| **14** | Solar Infrared | SI1145 | — | counts |
| **15** | Canopy Temperature | SHT40 | — | °C |
| **16–20** | Soil Moisture | Capacitive | 15/30/60/90/120 cm | % |
| **21** | Wind Speed | Davis 6410 | — | km/h |
| **22** | Wind Direction | Davis 6410 | — | ° |
| **23** | Barometric Pressure | BMP280 | — | hPa |
| **24** | Acoustic SPL | MP34DT01 MEMS | — | dBA |
| **25** | Acoustic Rain | MP34DT01 MEMS | — | index |
| **26–30** | Soil Temperature | Thermistor | 15/30/60/90/120 cm | °C |
| **31–33** | Soil EC | Conductivity | 15/30/60 cm | mS/cm |
| **46–48** | Soil (5cm depth) | Capacitive | 5 cm | mixed |
| **50** | Solar Irradiance | Davis 6450 | — | W/m² |
| **51** | Rainfall | Davis 7852 | — | mm |
| **218–224** | Diagnostic Frames | System | — | binary |

### 3. Boot Payload Structure (FPort 1)
The 9-byte boot frame is transmitted once at device startup:

```
Offset  Size    Field           Encoding
0       1       Major Version   uint8
1       1       Minor Version   uint8
2       1       Patch Version   uint8
3       2       Build DOY       uint16 LE (day of year)
5       2       Battery mV      uint16 LE
7       1       Reset Reason    uint8 bitmask
8       1       Reserved        uint8
```

Example: firmware `v2.1.0`, built DOY 236, battery 3850 mV, power-on reset (0x01):
```
02 01 00 EC 00 0A 0F 01 00
```

### 4. Channel Type Taxonomy
Decoded channels are categorized using a strict enumerated type:

```typescript
type ChannelType =
    | 'canopy_temp' | 'canopy_hum'
    | 'soil_moisture' | 'soil_temp' | 'soil_ec'
    | 'solar' | 'solar_uv' | 'solar_vis' | 'solar_lux' | 'solar_ir' | 'solar_irradiance'
    | 'rain' | 'wind_speed' | 'wind_dir'
    | 'pressure' | 'battery'
    | 'acoustic_spl' | 'acoustic_rain' | 'acoustic_wind'
    | 'generic'
```

Each decoded channel carries metadata:
- `sensorSource` — hardware identifier (e.g. `'SHT40'`, `'BMP280'`)
- `sensorModel` — full model name (e.g. `'Sensirion SHT40'`)
- `depthCm` — depth for multi-layer soil probes (5, 15, 30, 60, 90, 120 cm)
- `unitHint` — human diagnostic unit string

## 📡 Radio Management

### OTAA-Only Provisioning
- **ABP (Activation By Personalization) is strictly forbidden.** All devices use OTAA (Over-The-Air Activation).
- Device credentials (`DevEUI`, `AppEUI`/`JoinEUI`, `AppKey`) are provisioned via a secure API endpoint at build time.
- The provisioning script (`get_otaa_config.py`) fetches credentials by device serial number and generates a source file — keys are never hardcoded in version control.

### Autonomous Edge ADR (Adaptive Data Rate)
- The device locally adjusts its LoRaWAN DataRate based on ACK history and link health.
- Automatic fallback to DR0 (SF12BW125, maximum range) upon sustained link loss.
- This eliminates dependency on network-server-side ADR which may be delayed or unavailable during roaming.

### Fast Commissioning Burst Mode
- On boot, the device performs **3 rapid transmission cycles** at a short interval (`SHORT_CYCLE_SECONDS = 15s`) to accelerate OTAA join, initial telemetry delivery, and link quality assessment.
- After the burst, the device reverts to the nominal duty cycle (`APP_TX_DUTY_CYCLE_MINUTES = 15 min`).

### LoRaWAN Metadata Contract
Every decoded uplink carries radio metadata alongside the physical measurement:

```typescript
const radioMetadata = {
    interface: '@bradtech/types:LoRaWanMetadataInterface',
    vendor: 'brad',
    vendorModel: 'Brad Soil Probe v2.5',
    devEui: '0018b20000001234',
    fPort: 16,
    fCnt: 42,
    frequency: 868100000,  // Hz
    dataRate: 5,
    rssi: -87,             // dBm
    snr: 7.5,              // dB
    gatewayId: 'eui-deadbeef01020304',
    gatewayCount: 2,
}
```
