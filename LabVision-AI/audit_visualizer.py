import os
import cv2
import random
import numpy as np

def audit_visualize(sample_size=30):
    # Paths
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
    
    img_dir = os.path.join(PROJECT_ROOT, 'dataset_raw')
    label_dir = os.path.join(SCRIPT_DIR, 'auto_labeled_labels')
    report_file = os.path.join(SCRIPT_DIR, 'labeling_quality_report.txt')
    audit_output = os.path.join(SCRIPT_DIR, 'audit_samples')
    
    if not os.path.exists(audit_output):
        os.makedirs(audit_output)
        
    # Find suspect frames first
    suspects = []
    if os.path.exists(report_file):
        with open(report_file, 'r') as r:
            for line in r:
                if '[SUSPECT]' in line:
                    # Format: [SUSPECT] frame_name.jpg - Low confidence (0.45)
                    parts = line.split(' ')
                    if len(parts) >= 2:
                        suspects.append(parts[1])
    
    labels = [f for f in os.listdir(label_dir) if f.endswith('.txt')]
    if not labels:
        print("No labels found for audit.")
        return
        
    # Prioritize suspects, then fill with random
    to_audit = suspects[:sample_size]
    if len(to_audit) < sample_size:
        remaining = [l for l in labels if l.replace('.txt', '.jpg') not in to_audit]
        to_audit.extend(random.sample(remaining, min(len(remaining), sample_size - len(to_audit))))
    
    print(f"Generating {len(to_audit)} audit samples (including {len(suspects)} suspects)...")
    
    for item in to_audit:
        label_name = item if item.endswith('.txt') else item.rsplit('.', 1)[0] + '.txt'
        img_name = label_name.replace('.txt', '.jpg')
        img_path = os.path.join(img_dir, img_name)
        label_path = os.path.join(label_dir, label_name)
        
        img = cv2.imread(img_path)
        if img is None: continue
            
        h, w, _ = img.shape
        with open(label_path, 'r') as f:
            for line in f:
                parts = line.split()
                if len(parts) >= 5:
                    cls_id, x, y, bw, bh = map(float, parts[:5])
                    
                    x1, y1 = int((x - bw/2) * w), int((y - bh/2) * h)
                    x2, y2 = int((x + bw/2) * w), int((y + bh/2) * h)
                    
                    cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(img, "person", (x1, y1-5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        cv2.imwrite(os.path.join(audit_output, f"audit_{img_name}"), img)

    print(f"Audit samples saved to: {audit_output}")

if __name__ == "__main__":
    audit_visualize(20) # 20 random samples for the expert audit
