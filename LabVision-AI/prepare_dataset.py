import os
import shutil
from tqdm import tqdm

def prepare_dataset():
    # Paths setup
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
    
    raw_img_dir = os.path.join(PROJECT_ROOT, 'dataset_raw')
    label_dir = os.path.join(SCRIPT_DIR, 'auto_labeled_labels')
    
    base_dataset_dir = os.path.join(SCRIPT_DIR, 'dataset')
    train_img_dir = os.path.join(base_dataset_dir, 'images', 'train')
    val_img_dir = os.path.join(base_dataset_dir, 'images', 'val')
    train_label_dir = os.path.join(base_dataset_dir, 'labels', 'train')
    val_label_dir = os.path.join(base_dataset_dir, 'labels', 'val')
    
    # Setup directory structure
    sub_dirs = [
        'images/train', 'images/val',
        'labels/train', 'labels/val'
    ]
    
    for sub in sub_dirs:
        os.makedirs(os.path.join(base_dataset_dir, sub), exist_ok=True)
            
    # Get all images that have labels, SORTED CHRONOLOGICALLY
    images = sorted([f for f in os.listdir(raw_img_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    valid_data = []
    
    for img_name in images:
        label_name = img_name.rsplit('.', 1)[0] + '.txt'
        if os.path.exists(os.path.join(label_dir, label_name)):
            valid_data.append(img_name)
            
    if not valid_data:
        print("Error: No valid image-label pairs found.")
        return

    # CHRONOLOGICAL SPLIT (Critical for generalization)
    split_idx = int(len(valid_data) * 0.8)
    train_files = valid_data[:split_idx]
    val_files = valid_data[split_idx:]
    
    print(f"Total valid image-label pairs found: {len(valid_data)}")
    print(f"Temporal Splitting: {len(train_files)} for Training, {len(val_files)} for Validation")
    
    def copy_set(file_list, target_img_dir, target_label_dir, desc):
        for img_name in tqdm(file_list, desc=desc):
            label_name = img_name.rsplit('.', 1)[0] + '.txt'
            shutil.copy2(os.path.join(raw_img_dir, img_name), os.path.join(target_img_dir, img_name))
            shutil.copy2(os.path.join(label_dir, label_name), os.path.join(target_label_dir, label_name))

    copy_set(train_files, train_img_dir, train_label_dir, "Copying Training Set")
    copy_set(val_files, val_img_dir, val_label_dir, "Copying Validation Set")
    
    yaml_content = f"path: {base_dataset_dir}\ntrain: images/train\nval: images/val\n\nnc: 1\nnames: ['person']\n"
    with open(os.path.join(SCRIPT_DIR, 'data.yaml'), 'w') as f:
        f.write(yaml_content)
    print(f"Generated data.yaml at {os.path.join(SCRIPT_DIR, 'data.yaml')}")

if __name__ == "__main__":
    prepare_dataset()
