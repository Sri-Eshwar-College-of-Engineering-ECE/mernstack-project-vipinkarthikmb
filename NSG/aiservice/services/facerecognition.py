"""
Face Recognition Service using facenet_pytorch + MTCNN
Works with DeepFace-trained embeddings from face_data_model.pkl
"""

import os
import pickle
import numpy as np
import torch
from scipy.spatial.distance import cosine
from facenet_pytorch import MTCNN, InceptionResnetV1
from pathlib import Path
import cv2

from models.person import Person

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "face_data_model.pkl"

# Initialize device and models
device = 'cuda' if torch.cuda.is_available() else 'cpu'
mtcnn = MTCNN(image_size=160, margin=0, device=device)
facenet = InceptionResnetV1(pretrained='vggface2').eval().to(device)

# Load face database
persons_list = []
try:
    if os.path.exists(DATA_PATH):
        # Custom unpickler to handle Person class
        class PersonUnpickler(pickle.Unpickler):
            def find_class(self, module, name):
                if name == "Person":
                    return Person
                return super().find_class(module, name)
        
        with open(DATA_PATH, "rb") as f:
            unpickler = PersonUnpickler(f)
            persons_list = unpickler.load()
        
        if len(persons_list) > 0:
            print(f"✅ Loaded {len(persons_list)} persons from face database")
            for p in persons_list:
                print(f"   - {p.name}: {len(p.embeddings)} embeddings")
        else:
            print(f"⚠️  Face database is empty - run train_faces.py")
except Exception as e:
    print(f"⚠️  Could not load face database: {e}")
    print(f"Run 'python train_faces.py' to create database")
    persons_list = []


def recognize_face(frame, threshold=0.6):
    """
    Detect and recognize faces in frame using facenet_pytorch + MTCNN.
    Compatible with DeepFace-trained embeddings.
    
    Args:
        frame: OpenCV image (BGR)
        threshold: Cosine distance threshold (default 0.6)
    
    Returns:
        dict with person object, box coordinates, and metadata
    """
    try:
        if not persons_list:
            return {"person": None, "box": None}
        
        # Detect faces and get bounding boxes
        boxes, probs = mtcnn.detect(frame)
        if boxes is None or len(boxes) == 0:
            return {"person": None, "box": None}
        
        # Get face tensors
        faces = mtcnn(frame)
        if faces is None:
            return {"person": None, "box": None}
        
        # Handle single face case
        if len(faces.shape) == 3:
            faces = faces.unsqueeze(0)
        
        # Generate embeddings using InceptionResnetV1
        with torch.no_grad():
            embeddings = facenet(faces.to(device)).detach().cpu().numpy()
        
        # Match first face with database
        if len(embeddings) > 0:
            frame_embedding = embeddings[0]
            
            # Get first face box
            x1, y1, x2, y2 = map(int, boxes[0])
            face_box = (x1, y1, x2, y2)
            
            # Compare with all database embeddings
            for person in persons_list:
                for stored_embedding in person.embeddings:
                    distance = cosine(frame_embedding, stored_embedding)
                    
                    if distance < threshold:
                        # Found a match!
                        return {
                            "person": person,
                            "box": face_box,
                            "name": person.name,
                            "dob": person.dob,
                            "case": person.case_history,
                            "location": person.location,
                            "distance": distance
                        }
            
            # No match found - return box only
            return {"person": None, "box": face_box}
        
        return {"person": None, "box": None}
    
    except Exception as e:
        print(f"Error in face recognition: {e}")
        return {"person": None, "box": None}


