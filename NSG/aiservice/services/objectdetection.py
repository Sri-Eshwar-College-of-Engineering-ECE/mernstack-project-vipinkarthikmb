from ultralytics import YOLO

try:
    yolo = YOLO("aiservice/models/yolov8l.pt")
except:
    try:
        yolo = YOLO("models/yolov8l.pt")
    except Exception as e:
        print(f"Error loading YOLO model: {e}")
        yolo = None

BAG_CLASSES = [28, 31, 33]

def detect_objects(frame):
    """
    Detect bags and weapons in frame (exact IDLE logic).
    Returns: dict with bags list and weapon type
    """
    if yolo is None:
        return {"bags": [], "weapon": None}
    
    try:
        results = yolo(frame, verbose=False)
        if len(results) == 0:
            return {"bags": [], "weapon": None}
        
        result = results[0]
        bags = []
        weapon = None

        # Process EACH detection box (exact IDLE logic)
        for box in result.boxes:
            cls = int(box.cls[0])
            label = yolo.names[cls]  # Get exact class name (no lowercase!)
            
            # Get box coordinates (x1, y1, x2, y2) as integers
            x1, y1, x2, y2 = map(int, box.xyxy[0].cpu().numpy())
            box_coords = (x1, y1, x2, y2)

            # Check for weapons FIRST (exact string match: "knife" or "gun")
            if label in ["knife", "gun"]:
                weapon = label
            
            # Check for bags (by class ID, EXACT IDLE list)
            if cls in BAG_CLASSES:
                bags.append(box_coords)

        return {"bags": bags, "weapon": weapon}
    
    except Exception as e:
        print(f"Error in object detection: {e}")
        return {"bags": [], "weapon": None}


