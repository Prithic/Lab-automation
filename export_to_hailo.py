from ultralytics import YOLO
import os

def export_model(model_path):
    print(f"Loading model: {model_path}")
    model = YOLO(model_path)
    
    # Export to ONNX with dynamic=False and opset=11 (recommended for Hailo)
    # Hailo works best with constant input sizes
    print("Exporting to ONNX...")
    onnx_path = model.export(format="onnx", imgsz=640, opset=11, simplify=False)
    print(f"ONNX model saved at: {onnx_path}")
    return onnx_path

if __name__ == "__main__":
    pt_model = "LabVision-AI/yolov8s_final.pt"
    if os.path.exists(pt_model):
        export_model(pt_model)
    else:
        print(f"Error: {pt_model} not found.")
