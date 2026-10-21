---
type: standard
title: Dynamic Test Data & Domain Fakers (Zero Real Business Data)
description: Strict engineering rule mandating that tests and application code must never reference real-world production data, requiring dynamic domain generators (fakers) that strictly adhere to business rules and valid variable domains.
tags:
  - testing
  - tdd
  - fakers
  - data-integrity
  - methodology
  - privacy
timestamp: 2026-10-21T07:57:00.000Z
category: methodology
status: active
---

# Dynamic Test Data & Domain Fakers (Zero Real Business Data)

> **Pillar**: I. Usine Logicielle (Software Factory & Development)  
> **Category**: Methodology & Quality Standards  
> **Cardinal Principle**: *Tests and code must never bind to real production entities; all test fixtures must be dynamically generated artifacts strictly conforming to business domain rules.*

---

## 🧭 Core Directives

### 1. Prohibition of Real-World Production Data
- **Zero Real Entities in Code & Tests:** Never copy-paste real customer names, farm sites, hardware serial numbers (e.g. live probe or gateway serials), real LoRaWAN DevEUIs / Gateway EUIs, or live database UUIDs into test files, test fixtures, or application logic.
- **The Over-Fitting Trap:** Hardcoding specific production equipment in tests breeds fragile test suites that over-fit to arbitrary historical quirks and encourages developers to write specific code hacks instead of sound, generic domain algorithms.
- **Confidentiality & Privacy:** Leaking client infrastructure, geographical coordinates, or equipment identifiers in test suites or git history violates customer privacy and confidentiality standards.

### 2. Mandatory Use of Dynamic Fakers & Generators
- **Dynamic Artifact Generation:** All test data must be produced via dedicated generator functions (Fakers / Mock Factories) residing in shared test utility modules (e.g. `src/test-utils/fakers.ts` or `@domain/fakers`).
- **Domain Invariant Compliance:** Generators must produce synthetic entities that **strictly respect all domain rules and allowed variable spaces**:
  - **Format & Regex Compliance:** Hexadecimal identifiers (EUI-64, MAC addresses) must follow valid lengths and byte structures; device serials must conform to the authoritative nomenclature (e.g. `b[0-9]{2}[s|w][0-9]{3}`).
  - **Allowed Values & Enums:** Statuses, operators, and role fields must only take values from the authoritative Domain Enum or State Machine (e.g. `NetworkServerTechnology`, `SupplyChainStatus`).
  - **Sensible Ranges:** Numerical values must observe physiological and physical boundaries (e.g. battery voltages between 2800 mV and 4200 mV, valid GPS coordinates within target geographical regions, temperatures within realistic environmental bounds).
  - **Relational Integrity:** Foreign keys and sub-structures (e.g. `keychain` referencing a valid `operator` descriptor) must form coherent, valid object graphs.

### 3. Broad Test Coverage & Randomized Diversity
- By generating test artifacts dynamically, test suites can easily verify:
  - Nominal valid values.
  - Boundary and edge conditions (e.g. minimum/maximum battery, epoch boundaries, special Unicode characters in descriptive labels).
  - Random variations on each run, ensuring that business logic does not rely on accidentally hardcoded strings or fixed orderings.

---

## 🛠️ Implementation Pattern: Domain Faker Architecture

Every domain module should expose lightweight, customizable factory functions using the `Partial<T>` override pattern:

```typescript
// Example: Domain Faker Pattern (Pure, Synthetic, Conformant)
export function fakeDevEUI(): string {
   const randomHex = Math.random().toString(16).substring(2, 10).padStart(8, '0')
   return `8c1f00${randomHex}`.toLowerCase().substring(0, 16)
}

export function fakeProbe(overrides: Partial<ProbeEntity> = {}): ProbeEntity {
   const randomNum = Math.floor(100 + Math.random() * 900)
   const serialNumber = overrides.serialNumber || `b26s${randomNum}`

   return {
      serialNumber,
      name: overrides.name || `Synthetic Probe ${randomNum}`,
      status: overrides.status || 'Active',
      operator: overrides.operator || 'chirpstack',
      batteryMv: overrides.batteryMv ?? 3650,
      geolocation: overrides.geolocation || {
         type: 'Point',
         coordinates: [4.8 + Math.random() * 0.1, 43.9 + Math.random() * 0.1],
      },
      ...overrides,
   }
}
```

---

## 🛑 Comparison: Bad vs. Standard Practice

| Anti-Pattern (Prohibited) | Standard Practice (Mandatory) |
| :--- | :--- |
| `const gw = { name: 'brad-fr-avignon-dlos8n-01' }` | `const gw = fakeGateway({ operator: 'chirpstack' })` |
| `devEUI: '8c1f641053260004'` (actual lab probe) | `devEUI: fakeDevEUI()` |
| `it('should work for Avignon site DLOS8N')` | `it('should resolve network adapter based on gateway operator attribute')` |
| Asserting hardcoded production UUID `f3ac4598-...` | Asserting class constants or generated mock UUIDs `Adapter.PROVIDER_ID` |

---

## 🔗 Related Standards
- [Code Serves Data — Zero Hardcoded Business Data](code-serves-data-integrity.md)
- [Test-Driven Development (TDD) & Test Co-Location](tdd-and-test-co-location.md)
- [Public Repository Confidentiality](../workflow/public-repository-confidentiality.md)
- [Fail-Fast Contracts](../architecture/fail-fast-contracts.md)
