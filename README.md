# Labsense AI | Autonomous Lab Intelligence

Labsense AI is a high-performance, enterprise-grade IoT automation platform designed for modern laboratory environments. It provides a sophisticated interface for real-time device monitoring, complex automation sequences, and intelligent security telemetry.

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0 or higher
- **MQTT Broker**: Mosquitto (configured for WebSockets on port 9001)

### Installation
```bash
# Clone the repository
git clone https://github.com/Prithic/Lab-automation.git

# Navigate to project directory
cd Lab-automation

# Install dependencies
npm install
```

### Running the Dashboard
```bash
npm run dev
```
The application will be live at [http://localhost:8080](http://localhost:8080).

## 🛠 Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: Zustand + TanStack Query
- **Icons**: Lucide React
- **Messaging**: MQTT (WebSocket Bridge)

## 📡 Key Features
- **Overview Dashboard**: High-density bento-grid visualization of lab telemetry.
- **Device Management**: Granular control over lighting arrays, ventilation fans, and climate modules.
- **Smart Automations**: Event-driven logic for lab safety and efficiency.
- **Security Hub**: Real-time presence detection and system arming protocols.
- **Live Logs**: Streaming system events and hardware responses.

## 📁 Project Structure
- `src/components/lab`: Custom lab-specific UI components.
- `src/pages`: Functional views (Overview, Devices, etc.).
- `src/lib`: Core logic and state stores.
- `src/hooks`: Custom React hooks for system interaction.

## 📄 License
This project is licensed under the MIT License.
