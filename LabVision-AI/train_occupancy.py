from ultralytics import YOLO
import torch
import os

def train_model():
    # Force GPU usage
    device = '0' if torch.cuda.is_available() else 'cpu'
    print(f"Using device: {device}")
    
    # Load a pretrained YOLOv8s model
    model = YOLO('yolov8s.pt')
    
    # Training parameters optimized for occupancy detection
    # We use a smaller learning rate and more epochs to bake in the 'empty lab' samples
    results = model.train(
        data='data.yaml',
        epochs=100,
        imgsz=1280,
        batch=8, # Reduced batch size to fit 1280 into VRAM
        device=device,
        name='lab_occupancy_v2_ultra',
        project='runs/train',
        exist_ok=True,
        # False positive suppression settings
        # Including 'empty' images in training is the best way to reduce FPs
    )
    
    print("Training completed successfully!")
    print(f"Model saved to: {results.save_dir}")

if __name__ == '__main__':
    train_model()
