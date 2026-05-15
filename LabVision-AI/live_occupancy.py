import cv2
from ultralytics import YOLO
import time
import os
import torch

def smart_scale(frame, target_width=1280, target_height=720):
    oh, ow = frame.shape[:2]
    scale = min(target_width/ow, target_height/oh, 1.0)
    if scale < 1.0:
        return cv2.resize(frame, (int(ow * scale), int(oh * scale)))
    return frame

def run_live_occupancy(source=0, weights='yolov8s_final.pt', device_override=None):
    """
    Production-Grade Live Occupancy Monitoring System
    Source: 0 (Webcam), or path to 'video.mp4'
    """
    # 1. Load the Model
    # Preference: 1. best_model.pt, 2. yolov8s_final.pt, 3. base weights
    model_path = weights
    # Also check the training run folder for the absolute latest
    train_weights = 'runs/detect/runs/train/lab_occupancy_v1/weights/best.pt'
    
    if os.path.exists('best_model.pt'):
        model_path = 'best_model.pt'
    elif os.path.exists(train_weights):
        model_path = train_weights
    elif os.path.exists('yolov8s_final.pt'):
        model_path = 'yolov8s_final.pt'
    
    print(f"Loading Model: {model_path}")
    model = YOLO(model_path)
    
    # Auto-detect device (use GPU if available, else CPU)
    if device_override is not None:
        device = device_override
    else:
        device = 0 if torch.cuda.is_available() else 'cpu'
    print(f"Using Device: {device}")
    
    # 2. Setup Video Capture
    cap = cv2.VideoCapture(source)
    if not cap.isOpened():
        print(f"Error: Could not open source {source}")
        return

    print("\n--- LABVISION-AI LIVE MONITORING ACTIVE ---")
    print("CONTROLS: [Q] Quit, [P] Pause, [F] Fast Forward (5s), [B] Rewind (5s)\n")

    paused = False
    while cap.isOpened():
        if not paused:
            ret, frame = cap.read()
            if not ret:
                if isinstance(source, str): # Loop video if it's a file
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue
                else:
                    break
        
        # 3. Processing
        display_frame = smart_scale(frame)
        
        # Inference (Optimized: lowered conf to 0.35 and increased imgsz for better detection)
        results = model(display_frame, classes=[0], conf=0.35, imgsz=1280, device=device, verbose=False)
        count = len(results[0].boxes)
        
        # 4. Draw Results
        annotated_frame = results[0].plot()
        
        # HUD
        cv2.putText(annotated_frame, f"Occupancy: {count}", (50, 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        # 5. Display
        cv2.namedWindow("LabVision-AI Real-Time Monitor", cv2.WINDOW_NORMAL)
        cv2.imshow("LabVision-AI Real-Time Monitor", annotated_frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('p'):
            paused = not paused
        elif key == ord('f'):
            current_frame = cap.get(cv2.CAP_PROP_POS_FRAMES)
            cap.set(cv2.CAP_PROP_POS_FRAMES, current_frame + 150)
        elif key == ord('b'):
            current_frame = cap.get(cv2.CAP_PROP_POS_FRAMES)
            cap.set(cv2.CAP_PROP_POS_FRAMES, max(0, current_frame - 150))

    cap.release()
    cv2.destroyAllWindows()
    print("Monitoring system terminated safely.")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="LabVision-AI Occupancy Monitor")
    parser.add_argument("--source", type=str, default="0", help="Webcam index or video path")
    parser.add_argument("--device", type=str, default=None, help="Device to run on (0, 1, 'cpu')")
    args = parser.parse_args()
    
    device = args.device
    if device is not None and device.isdigit():
        device = int(device)
        
    source = args.source
    if source.isdigit():
        source = int(source)
        
    run_live_occupancy(source=source, device_override=device)
