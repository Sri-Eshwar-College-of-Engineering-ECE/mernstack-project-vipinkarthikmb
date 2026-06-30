from datetime import datetime

class Person:
    def __init__(self, folder_name=None, name="", dob="", case_history="", location=""):
        self.folder_name = folder_name        # Folder name (Person1 / Person2 / Person3)
        self.name = name                      # Real name
        self.dob = dob
        self.case_history = case_history
        self.location = location
        self.timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.embeddings = []                  # List of embeddings (DeepFace Facenet512)
    
    def __repr__(self):
        return f"{self.name} ({self.folder_name})" if self.folder_name else self.name
