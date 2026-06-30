from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from threading import Thread
import cv2
import base64
import json
from datetime import datetime
import time

from api.analysis import router
from services.tracker import run_ai_loop
from services.camera import enable_camera, disable_camera
from core.state import latest_result, camera_frame

app = FastAPI(title="NSG AI Surveillance Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

# Start AI processing thread at startup
ai_thread = None

@app.on_event("startup")
async def startup_event():
    global ai_thread
    ai_thread = Thread(target=run_ai_loop, daemon=True)
    ai_thread.start()
    print("✅ AI processing thread started (camera disabled by default)")

@app.get("/")
def root():
    return {"status": "AI Service Running"}

@app.post("/api/camera/enable")
def camera_enable():
    """Enable camera when user clicks Start"""
    print("📹 Enabling camera...")
    success = enable_camera()
    if success:
        # Give time for first frame to be captured
        time.sleep(0.5)
        return {
            "status": "enabled",
            "message": "Camera enabled successfully"
        }
    else:
        return {
            "status": "failed",
            "message": "Failed to enable camera"
        }

@app.post("/api/camera/disable")
def camera_disable():
    """Disable camera when user clicks Stop"""
    print("⛔ Disabling camera...")
    disable_camera()
    # Clear state
    camera_frame["frame"] = None
    return {
        "status": "disabled",
        "message": "Camera disabled successfully"
    }

@app.get("/api/camera/stream")
def camera_stream():
    """Stream camera feed with detections via Server-Sent Events"""
    def generate():
        frame_count = 0
        while True:
            try:
                frame = camera_frame.get("frame")
                if frame is not None:
                    frame_count += 1
                    _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
                    frame_base64 = base64.b64encode(buffer).decode('utf-8')
                    
                    data = {
                        "frame": frame_base64,
                        "suspect": latest_result.get("suspect"),
                        "bags": latest_result.get("bags"),
                        "weapon": latest_result.get("weapon"),
                        "timestamp": latest_result.get("timestamp"),
                        "linked_bags": latest_result.get("linked_bags", 0),
                        "frame_count": frame_count
                    }
                    yield f"data: {json.dumps(data)}\n\n"
                else:
                    # No frame available yet
                    yield f"data: {json.dumps({'status': 'waiting', 'message': 'No frame available'})}\n\n"
                
                time.sleep(0.05)  # 20 FPS
            except Exception as e:
                print(f"Stream error: {e}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
                time.sleep(0.5)
    
    return StreamingResponse(generate(), media_type="text/event-stream")

@app.get("/api/detection/latest")
def get_latest_detection():
    """Get latest detection results"""
    return {
        "suspect": latest_result.get("suspect"),
        "bags": latest_result.get("bags"),
        "weapon": latest_result.get("weapon"),
        "timestamp": latest_result.get("timestamp"),
        "linked_bags": latest_result.get("linked_bags", 0)
    }

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }


