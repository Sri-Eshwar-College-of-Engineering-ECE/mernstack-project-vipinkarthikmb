from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
from PIL import Image
import io
import numpy as np
import torch
from scipy.spatial.distance import cosine
import pickle
from pathlib import Path

from core.state import latest_result
from models.person import Person
from services.facerecognition import mtcnn, facenet, persons_list, DATA_PATH, device

router = APIRouter()

@router.get("/analysis")
def get_analysis():
    return latest_result

@router.post("/register-face")
async def register_face(
    file: UploadFile = File(...),
    name: str = Form(...),
    dob: str = Form(...),
    case_history: str = Form(...),
    location: str = Form(...)
):
    """Register a new person with face embedding"""
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        frame = np.array(image)
        
        # Detect face and get embedding
        faces = mtcnn(frame)
        if faces is None:
            return JSONResponse(
                status_code=400,
                content={"error": "No face detected in image"}
            )
        
        # Handle single face case
        if len(faces.shape) == 3:
            faces = faces.unsqueeze(0)
        
        # Generate embedding
        with torch.no_grad():
            embedding = facenet(faces.to(device)).detach().cpu().numpy()[0]
        
        # Check if person already exists
        for person in persons_list:
            if person.name.lower() == name.lower():
                # Add embedding to existing person
                person.embeddings.append(embedding)
                save_face_database()
                return {
                    "status": "success",
                    "message": f"Face added to existing person: {name}",
                    "total_faces": len(persons_list)
                }
        
        # Create new person
        new_person = Person(
            name=name,
            dob=dob,
            case_history=case_history,
            location=location
        )
        new_person.embeddings.append(embedding)
        persons_list.append(new_person)
        
        # Save to pickle
        save_face_database()
        
        return {
            "status": "success",
            "message": f"Person registered: {name}",
            "total_faces": len(persons_list),
            "embeddings": len(new_person.embeddings)
        }
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@router.get("/registered-faces")
def get_registered_faces():
    """Get list of all registered people"""
    faces_list = []
    for person in persons_list:
        faces_list.append({
            "name": person.name,
            "dob": person.dob,
            "case": person.case_history,
            "location": person.location,
            "faces": len(person.embeddings),
            "registered": person.timestamp
        })
    
    return {
        "total_persons": len(persons_list),
        "persons": faces_list
    }

def save_face_database():
    """Save face database to pickle file"""
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_PATH, "wb") as f:
        pickle.dump(persons_list, f)
    print(f"✅ Saved {len(persons_list)} persons to face database")
