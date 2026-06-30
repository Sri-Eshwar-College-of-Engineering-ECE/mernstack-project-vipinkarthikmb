import cv2

# Lazy loading - don't open camera on import
cap = None
is_camera_enabled = False

def enable_camera():
    """Enable camera - called when user clicks Start"""
    global cap, is_camera_enabled
    if is_camera_enabled and cap is not None:
        return True
    try:
        # Try to find external camera first, fallback to default
        for i in range(5):
            cap_test = cv2.VideoCapture(i)
            if cap_test.isOpened():
                if i != 0:
                    cap = cv2.VideoCapture(i, cv2.CAP_DSHOW)
                    print(f"✅ Using camera index: {i}")
                else:
                    cap = cv2.VideoCapture(0)
                    print(f"✅ Using camera index: 0")
                cap_test.release()
                break
        else:
            # Fallback to camera 0
            cap = cv2.VideoCapture(0)
            print("✅ Using default camera")
        
        # Set resolution
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        
        if cap.isOpened():
            is_camera_enabled = True
            print("✅ Camera enabled successfully")
            return True
        else:
            print("❌ Camera failed to open")
            return False
    except Exception as e:
        print(f"❌ Camera error: {e}")
        return False

def disable_camera():
    """Disable camera - called when user clicks Stop"""
    global cap, is_camera_enabled
    if cap is not None:
        cap.release()
        is_camera_enabled = False
        cap = None
        print("✅ Camera disabled")

def get_frame():
    """Get frame from camera only if enabled"""
    if not is_camera_enabled or cap is None:
        return None
    
    if not cap.isOpened():
        return None

    ret, frame = cap.read()
    if not ret:
        return None

    return frame


