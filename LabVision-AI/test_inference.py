from ultralytics import YOLO
import torch
import cv2
import os

def test_single_image():
    # Use best.pt if available, else yolov8s.pt
    model_path = 'runs/detect/runs/train/lab_occupancy_v1/weights/best.pt'
    if not os.path.exists(model_path):
        model_path = 'yolov8s.pt'
    
    print(f"Testing model: {model_path}")
    model = YOLO(model_path)
    
    # Path to a sample validation image
    img_path = 'dataset/images/val/frame_00002.jpg'
    if not os.path.exists(img_path):
        print(f"Error: {img_path} not found.")
        return

    # Run inference on GPU
    device = 0 if torch.cuda.is_available() else 'cpu'
    results = model(img_path, device=device, conf=0.50)
    
    # Save the result
    res_img = results[0].plot()
    cv2.imwrite('test_result.jpg', res_img)
    
    print(f"Test completed. Result saved to 'test_result.jpg'.")
    print(f"Objects detected: {len(results[0].boxes)}")

if __name__ == '__main__':
    test_single_image()
