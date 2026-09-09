# BeeCarbonat (BizOS) - GMAO & CAFM Documentation

## Architecture
This document details the architectural decisions for the Enterprise Facility Management system.
The system is built on a modular, event-driven architecture designed to handle both legacy protocols (BACnet, KNX) and modern IoT (MQTT, LoRaWAN).

## Modules
- **Asset Management**: Full lifecycle tracking.
- **Work Orders (MRO)**: Predictive and reactive maintenance workflows.
- **Telemetry & IoT**: Real-time environmental and operational sensors.
- **ESG Reporting**: Automated carbon and water tracking.

## Future Phases
- Immutable Audit Logs via blockchain/append-only ledgers.
- Advanced Predictive Maintenance via Gemini AI models.
