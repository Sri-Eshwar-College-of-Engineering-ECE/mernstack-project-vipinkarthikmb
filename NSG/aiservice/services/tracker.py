import time
from datetime import datetime
import cv2
import numpy as np

from services.camera import get_frame
from services.facerecognition import recognize_face
from services.objectdetection import detect_objects
from core.state import latest_result, camera_frame

# Global tracking variables (exact IDLE logic)
suspect_id = None
suspect_box = None
suspect_bags = []

def calculate_iou(boxA, boxB):
    """Calculate Intersection Over Union (exact IDLE logic)"""
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])
    inter = max(0, xB - xA) * max(0, yB - yA)
    areaA = (boxA[2]-boxA[0]) * (boxA[3]-boxA[1])
    areaB = (boxB[2]-boxB[0]) * (boxB[3]-boxB[1])
    iou = inter / float(areaA + areaB - inter + 1e-6)
    return iou

def draw_detections(frame, face_box, suspect_name, current_bags, detected_weapon, linked_bags):
    """Draw bounding boxes on frame (exact IDLE colors and logic)"""
    frame_display = frame.copy()
    
    # Draw FACE BOX in GREEN
    if face_box is not None:
        x1, y1, x2, y2 = face_box
        cv2.rectangle(frame_display, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(frame_display, suspect_name, (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    
    # Draw ALL BAG BOXES in MAGENTA (not linked)
    for bag_box in current_bags:
        if bag_box not in linked_bags:  # Only unlinked bags
            x1, y1, x2, y2 = bag_box
            cv2.rectangle(frame_display, (x1, y1), (x2, y2), (255, 0, 255), 2)
            cv2.putText(frame_display, "BAG", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 255), 2)
    
    # Draw LINKED BAGS in YELLOW (linked to suspect) - EXACT IDLE COLOR
    for bag_box in linked_bags:
        x1, y1, x2, y2 = bag_box
        cv2.rectangle(frame_display, (x1, y1), (x2, y2), (255, 255, 0), 2)
        cv2.putText(frame_display, "Suspect Bag", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
    
    return frame_display

def run_ai_loop():
    """Main AI processing loop - runs continuously in background (exact IDLE logic)"""
    global suspect_id, suspect_box, suspect_bags
    
    print("🤖 AI Loop started (waiting for camera to be enabled)...")
    frame_count = 0
    
    while True:
        try:
            frame = get_frame()
            if frame is None:
                time.sleep(0.1)
                continue
            
            frame_count += 1
            height, width, _ = frame.shape
            
            person_detected = None
            detected_weapon = None
            
            # ============ FACE RECOGNITION (exact IDLE logic) ============
            face_result = recognize_face(frame, threshold=0.6)
            person_detected = face_result.get("person")
            face_box = face_result.get("box")
            
            # Update suspect tracking
            if person_detected:
                suspect_id = person_detected.name
                suspect_box = face_box
                if frame_count % 20 == 0:
                    print(f"✅ Suspect detected: {person_detected.name}")
            else:
                suspect_id = None
                suspect_box = None
            
            # ============ OBJECT DETECTION (exact IDLE logic) ============
            detection_result = detect_objects(frame)
            current_bags = detection_result.get("bags", [])
            detected_weapon = detection_result.get("weapon")
            
            if detected_weapon and frame_count % 20 == 0:
                print(f"⚠️ Weapon detected: {detected_weapon}")
            if current_bags and frame_count % 20 == 0:
                print(f"📦 Bags detected: {len(current_bags)}")
            
            # ============ IOU-BASED BAG LINKING (exact IDLE logic) ============
            linked_bags = []
            
            if suspect_box:
                for bag in current_bags:
                    iou_score = calculate_iou(suspect_box, bag)
                    if iou_score > 0.05:
                        linked_bags.append(bag)
                        if frame_count % 20 == 0:
                            print(f"🎒 Bag linked to suspect (IOU: {iou_score:.3f})")
            
            suspect_bags = linked_bags
            
            # ============ DRAW DETECTIONS (exact IDLE colors) ============
            # GREEN for face, MAGENTA for unlinked bags, YELLOW for linked bags
            frame_display = draw_detections(
                frame.copy(),
                face_box,
                suspect_id if person_detected else "Unknown",
                current_bags,
                detected_weapon,
                linked_bags
            )
            
            # ============ UPDATE STATE (for frontend) ============
            latest_result["suspect"] = {
                "name": person_detected.name if person_detected else None,
                "dob": person_detected.dob if person_detected else None,
                "case": person_detected.case_history if person_detected else None,
                "location": person_detected.location if person_detected else None,
            } if person_detected else None
            
            latest_result["bags"] = len(current_bags)
            latest_result["weapon"] = detected_weapon
            latest_result["linked_bags"] = len(linked_bags)
            latest_result["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Store frame for streaming
            camera_frame["frame"] = frame_display
            
            # Log periodically
            if frame_count % 20 == 0:
                print(f"Frame {frame_count}: Suspect={suspect_id}, Bags={len(current_bags)}, Linked={len(linked_bags)}, Weapon={detected_weapon}")
            
            time.sleep(0.05)  # ~20 FPS
        
        except Exception as e:
            print(f"❌ Error in AI loop: {e}")
            import traceback
            traceback.print_exc()
            time.sleep(0.1)
