# LabOS - Industrial Laboratory Operating System (Lite)

LabOS is an enterprise-grade laboratory automation and safety platform. This version integrates **LabVision-AI**, a high-performance computer vision system for real-time occupancy monitoring and security.

## 🚀 Key Modules

### 1. LabVision-AI (Neural Core)
*   **Real-time Occupancy**: GPU-accelerated person detection using fine-tuned YOLOv8s.
*   **Hardware Optimized**: Specifically tuned for NVIDIA RTX 3050 (35ms inference).
*   **False-Positive Suppression**: Trained on custom "Empty Lab" datasets to ignore furniture and static equipment.
*   **Security Mode**: Automated detection of intruders during off-hours.

### 2. Cyber-Operations Dashboard
*   **Pure Vanilla Stack**: No React, no Tailwind, no Node modules—optimized for local edge deployment.
*   **Industrial Design**: Dark-mode interface with cyan accents, technical typography, and glassmorphism.
*   **Tab-Based Navigation**: High-speed switching between operational modules.

### 3. Operational Features
*   **Safety & Critical Monitors**: Master emergency override console.
*   **Real-time Telemetry**: Simulated sensor drift and occupancy tracking.
*   **Facility Mapping**: Direct lab sector management overview.

## 🛠 Tech Stack
*   **AI Engine**: Python, PyTorch, Ultralytics YOLOv8
*   **Hardware**: NVIDIA RTX 3050 (CUDA 12.4 supported)
*   **Frontend**: HTML5, Vanilla CSS3, ES6+ JavaScript
*   **Icons & Fonts**: Font Awesome, Google Fonts (Inter & Outfit)

## 🔧 AI System Usage

### Setup Environment
```bash
cd LabVision-AI
pip install -r requirements.txt
```

### Run Live Monitor
```bash
python LabVision-AI/live_occupancy.py --source 0 --device 0
```

### Training/Fine-Tuning
```bash
python LabVision-AI/train_occupancy.py
```

## 📂 Project Structure
*   `LabVision-AI/`: Core AI source code, training scripts, and utilities.
*   `yolov8s_final.pt`: Fine-tuned production weights.
*   `index.html`: Dashboard entry point.
*   `app.js`: System kernel for dashboard logic.
*   `style.css`: Industrial design system.

---
**LabOS** - *Intelligent Laboratory Automation & Safety Platform (Neural Engine)*
