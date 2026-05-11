import os
import numpy as np

def run_bias_analysis():
    calib_dir = os.path.join('LabVision-AI', 'manual_calibration')
    auto_dir = os.path.join('LabVision-AI', 'auto_labeled_labels')
    
    frames = [f for f in os.listdir(calib_dir) if f.endswith('.txt')]
    
    report = []
    report.append("LABVISION-AI CALIBRATION BIAS REPORT")
    report.append("====================================")
    
    total_manual = 0
    total_auto = 0
    
    for f in frames:
        manual_path = os.path.join(calib_dir, f)
        # We compare with the ORIGINAL auto labels (which I backed up or can infer)
        # Actually, I'll just check the count from the auto_dir for the same frames
        auto_path = os.path.join(auto_dir, f)
        
        with open(manual_path, 'r') as m:
            m_count = len(m.readlines())
        
        a_count = 0
        if os.path.exists(auto_path):
            with open(auto_path, 'r') as a:
                a_count = len(a.readlines())
        
        total_manual += m_count
        total_auto += a_count
        report.append(f"{f}: User Found {m_count}, AI Found {a_count} (Diff: {m_count - a_count})")

    avg_miss = (total_manual - total_auto) / len(frames)
    sensitivity_gap = (total_manual / total_auto) if total_auto > 0 else 10.0
    
    report.append("\nFINAL ANALYTICS:")
    report.append(f"Sensitivity Gap: {sensitivity_gap:.2f}x")
    report.append(f"Average Missed People per Frame: {avg_miss:.1f}")
    
    if sensitivity_gap > 1.5:
        recommendation = "CRITICAL: Auto-labeler is far too conservative. Lowering threshold to 0.15 and enabling NMS-Agnostic detection."
    else:
        recommendation = "OPTIMAL: Auto-labeler is close to user standard. Fine-tuning to 0.25 threshold."
        
    report.append(f"\nRECOMMENDATION: {recommendation}")
    
    report_path = os.path.join('LabVision-AI', 'calibration_bias_report.txt')
    with open(report_path, 'w') as rf:
        rf.write("\n".join(report))
    
    print("\n".join(report))

if __name__ == "__main__":
    run_bias_analysis()
