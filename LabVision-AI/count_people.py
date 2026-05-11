import cv2
import sys
from ultralytics import YOLO

def run_counting(model_path='yolov8n.pt', source=0):
    """
    Runs real-time detection and counting.
    source=0 for webcam, or provide path to a video file.
    """
    print(f"Loading model: {model_path}")
    model = YOLO(model_path)

    cap = cv2.VideoCapture(source)
    
    if not cap.isOpened():
        print(f"Error: Could not open source {source}")
        return

    # Window setup
    cv2.namedWindow("LabVision - Live Counter", cv2.WINDOW_NORMAL)

    while cap.isOpened():
        success, frame = cap.read()
        if success:
            # Inference using the model (using GPU device=0)
            # Use persist=True if you add tracking later
            results = model.predict(frame, conf=0.5, device=0, verbose=False)
            
            # Draw results on the frame
            annotated_frame = results[0].plot()
            
            # Count logic: Number of detected boxes
            person_count = len(results[0].boxes)
            
            # UI Overlay - Professional Industrial Look
            # Background for text
            cv2.rectangle(annotated_frame, (10, 10), (350, 70), (0, 0, 0), -1)
            cv2.putText(annotated_frame, f"LIVE COUNT: {person_count}", (20, 50), 
                        cv2.FONT_HERSHEY_DUPLEX, 1.2, (0, 255, 255), 2)
            
            # Status Indicator
            status_color = (0, 255, 0) if person_count > 0 else (0, 165, 255)
            cv2.circle(annotated_frame, (330, 40), 10, status_color, -1)

            cv2.imshow("LabVision - Live Counter", annotated_frame)
            
            # Break on 'q' or 'ESC'
            key = cv2.waitKey(1) & 0xFF
            if key == ord("q") or key == 27:
                break
        else:
            break

    cap.release()
    cv2.destroyAllWindows()
    print("Inference stopped.")

if __name__ == "__main__":
    # Usage: python count_people.py [optional_model_path] [optional_video_source]
    model_arg = sys.argv[1] if len(sys.argv) > 1 else 'yolov8n.pt'
    source_arg = sys.argv[2] if len(sys.argv) > 2 else 0
    
    # Handle numeric source for webcam
    try:
        source_arg = int(source_arg)
    except ValueError:
        pass
        
    run_counting(model_arg, source_arg)
