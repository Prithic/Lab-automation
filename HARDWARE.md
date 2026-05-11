# LabOS Hardware - Custom Automation PCB (v1.0)

This document outlines the design, components, and specifications for the custom **LabOS Industrial Controller** PCB. This board serves as the hardware interface for the LabOS dashboard, enabling real-time sensor telemetry and multi-channel relay control.

---

## 🎨 PCB Design Preview
![LabOS PCB Design](file:///C:/Users/prith/.gemini/antigravity/brain/79d323c6-c886-462a-adcd-763d09ff22a6/labos_pcb_design_1778425754004.png)

---

## 🛠 Technical Specifications

### 1. Core Controller
- **Microcontroller**: ESP32-WROOM-32D (Dual-core, 2.4GHz Wi-Fi & BT).
- **Communication**: MQTT over Wi-Fi (Optimized for Node-RED integration).
- **Power Input**: 12V DC (Step-down to 5V and 3.3V via on-board buck converters).

### 2. Operational Interfaces
| Component | Quantity | Purpose |
| :--- | :--- | :--- |
| **Mechanical Relays** | 4 | Control 230V AC lights, fans, and lab equipment. |
| **Sensor Headers** | 3 | Modular headers for DHT22, PIR, and MQ-Series sensors. |
| **OLED Display** | 1 | 0.96" I2C display for local IP and system status. |
| **Buzzer** | 1 | Safety alarm for gas leaks or emergency overrides. |
| **Status LEDs** | 3 | Connectivity (Blue), Power (Green), Error (Red). |

---

## 🔌 Pin Mapping (ESP32)

| ESP32 Pin | Component | Function |
| :--- | :--- | :--- |
| **GPIO 25** | Relay 1 | Main Lights |
| **GPIO 26** | Relay 2 | AC / Fan System |
| **GPIO 27** | Relay 3 | Auxiliary Equipment |
| **GPIO 14** | Relay 4 | Safety Lock / Mag-lock |
| **GPIO 32** | PIR Sensor | Occupancy Detection (Digital Input) |
| **GPIO 33** | DHT22 | Temp/Humidity (Single-wire Data) |
| **GPIO 35** | MQ-2 | Gas/Smoke Sensor (Analog Input) |
| **GPIO 21 (SDA)** | OLED / I2C | Data Line |
| **GPIO 22 (SCL)** | OLED / I2C | Clock Line |

---

## 📦 Bill of Materials (BOM)

1. **Integrated Circuits**:
   - 1x ESP32-WROOM-32D Development Board (or Bare Module)
   - 1x LM2596S Buck Converter (Adjusted to 5V)
   - 1x AMS1117-3.3 Linear Regulator
2. **Discrete Components**:
   - 4x SRD-05VDC-SL-C 5V Relays
   - 4x PC817 Optocouplers (For electrical isolation)
   - 4x 1N4007 Flyback Diodes
   - 4x 2N2222 NPN Transistors (Relay Switching)
3. **Connectors**:
   - 4x 3-Pin Screw Terminals (Relay Outputs)
   - 1x DC Barrel Jack (12V Input)
   - Multiple JST-XH 3-Pin Headers (Sensor inputs)

---

## 🚀 Deployment Strategy
1. **Flash Firmware**: Use the Arduino IDE or PlatformIO to flash the ESP32 with the LabOS-Client code (supporting MQTT).
2. **Node-RED Setup**: Configure the MQTT broker (Mosquitto) and connect the LabOS dashboard (`app.js`) to the corresponding topics.
3. **Enclosure**: Housed in a custom 3D-printed DIN-rail mountable industrial casing.
