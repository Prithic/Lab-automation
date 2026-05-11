import cv2
import os
import random
import glob

def audit_samples(image_dir, label_dir, output_dir, num_samples=5):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    image_files = glob.glob(os.path.join(image_dir, "*.jpg"))
    # Prioritize crowded and night samples
    priority_keywords = ["crowded", "night", "morning"]
    priority_files = [f for f in image_files if any(k in f.lower() for k in priority_keywords)]
    
    if len(priority_files) >= num_samples:
        samples = random.sample(priority_files, num_samples)
    else:
        samples = random.sample(image_files, num_samples)
        
    print(f"Auditing {len(samples)} samples...")
    
    for i, img_path in enumerate(samples):
        img = cv2.imread(img_path)
        base_name = os.path.basename(img_path)
        label_path = os.path.join(label_dir, base_name.replace(".jpg", ".txt"))
        
        if os.path.exists(label_path):
            with open(label_path, "r") as f:
                lines = f.readlines()
                for line in lines:
                    parts = line.strip().split()
                    if len(parts) == 5:
                        _, x, y, w, h = map(float, parts)
                        ih, iw = img.shape[:2]
                        x1 = int((x - w/2) * iw)
                        y1 = int((y - h/2) * ih)
                        x2 = int((x + w/2) * iw)
                        y2 = int((y + h/2) * ih)
                        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            output_path = os.path.join(output_dir, f"audit_sample_{i+1}.jpg")
            cv2.imwrite(output_path, img)
            print(f"Saved audit sample to {output_path}")
        else:
            print(f"No labels found for {base_name}")

if __name__ == "__main__":
    audit_samples("dataset_raw", "dataset_raw", "LabVision-AI/audit_results")
