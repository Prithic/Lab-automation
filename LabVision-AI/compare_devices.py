from ultralytics import YOLO
import torch
import cv2
import time
import os

def run_dual_video_test():
    videos = {
        'Front Cam': '../Lab footage/iot lab front cam 1 crowded.mp4',
        'Back Cam': '../Lab footage/iot lab back cam 1 crowded.mp4'
    }
    
    model_path = 'runs/detect/runs/train/lab_occupancy_v1/weights/best.pt'
    if not os.path.exists(model_path):
        model_path = 'yolov8s.pt'
    
    model = YOLO(model_path)
    
    for name, path in videos.items():
        if not os.path.exists(path):
            print(f"Error: {name} video not found at {path}")
            continue
            
        print(f"\n--- PROCESSING {name.upper()} ---")
        cap = cv2.VideoCapture(path)
        # Skip some frames to get a good action shot (e.g., 2 seconds in)
        fps = cap.get(cv2.CAP_PROP_FPS)
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(fps * 2))
        
        ret, frame = cap.read()
        if ret:
            start = time.time()
            results = model(frame, device=0, verbose=False)
            end = time.time()
            
            print(f"{name} Detection Time: {(end - start) * 1000:.2f}ms")
            print(f"People detected in {name}: {len(results[0].boxes)}")
            
            # Save result
            annotated = results[0].plot()
            filename = f"demo_{name.lower().replace(' ', '_')}_crowded.jpg"
            cv2.imwrite(filename, annotated)
            print(f"Saved: {filename}")
        cap.release()

if __name__ == '__main__':
    run_dual_video_test()
