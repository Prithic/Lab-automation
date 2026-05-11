import cv2
import os
import random

def visualize_labels():
    img_dir = '../dataset_raw'
    label_dir = 'auto_labeled_labels'
    output_dir = 'labeled_samples'
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    # Get all images that have labels
    label_files = [f for f in os.listdir(label_dir) if f.endswith('.txt')]
    if not label_files:
        print("No labels found to visualize.")
        return
        
    # Pick 3 random images to show
    samples = random.sample(label_files, min(3, len(label_files)))
    
    for label_name in samples:
        img_name = label_name.rsplit('.', 1)[0] + '.jpg' # Assuming .jpg based on list_dir
        img_path = os.path.join(img_dir, img_name)
        label_path = os.path.join(label_dir, label_name)
        
        if not os.path.exists(img_path):
            # Try other extensions
            for ext in ['.png', '.jpeg']:
                if os.path.exists(os.path.join(img_dir, label_name.rsplit('.', 1)[0] + ext)):
                    img_path = os.path.join(img_dir, label_name.rsplit('.', 1)[0] + ext)
                    break
        
        img = cv2.imread(img_path)
        if img is None: continue
        
        h, w, _ = img.shape
        
        with open(label_path, 'r') as f:
            lines = f.readlines()
            for line in lines:
                parts = line.split()
                if len(parts) == 5:
                    cls, x, y, bw, bh = map(float, parts)
                    # Convert normalized to pixel coordinates
                    x1 = int((x - bw/2) * w)
                    y1 = int((y - bh/2) * h)
                    x2 = int((x + bw/2) * w)
                    y2 = int((y + bh/2) * h)
                    
                    # Draw box
                    cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(img, "Person", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Save the result
        save_path = os.path.join(output_dir, f"annotated_{img_name}")
        cv2.imwrite(save_path, img)
        print(f"Saved sample visualization: {save_path}")

if __name__ == "__main__":
    visualize_labels()
