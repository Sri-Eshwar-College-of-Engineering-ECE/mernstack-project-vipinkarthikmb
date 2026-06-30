import sys
import tensorflow as tf
import cv2
import numpy as np

harassment_model = tf.keras.models.load_model('hmbackend/models/harrassment_detection_model.h5')
non_harassment_model = tf.keras.models.load_model('hmbackend/models/non_harassment_model.h5')

def preprocess_frame(frame):
    try:
        resized_frame = cv2.resize(frame, (224, 224)) 
        frame_array = np.array(resized_frame, dtype=np.float32) / 255.0
        frame_array = np.expand_dims(frame_array, axis=0)
        return frame_array
    except Exception as e:
        print(f"Error in frame preprocessing: {e}")
        return None

def predict_frame(frame):
    try:
        frame_array = preprocess_frame(frame)
        if frame_array is None:
            return None, None
        harassment_score = harassment_model.predict(frame_array, verbose=0)[0][0]
        non_harassment_score = non_harassment_model.predict(frame_array, verbose=0)[0][0]
        return harassment_score, non_harassment_score
    except Exception as e:
        print(f"Error in frame prediction: {e}")
        return None, None

def analyze_video(video_path):
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise FileNotFoundError(f"Cannot open video file: {video_path}")

        harassment_count = 0
        non_harassment_count = 0
        total_harassment_score = 0
        total_non_harassment_score = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            harassment_score, non_harassment_score = predict_frame(frame)
            if harassment_score is None or non_harassment_score is None:
                continue


            total_harassment_score += harassment_score
            total_non_harassment_score += non_harassment_score

            if harassment_score > non_harassment_score:
                harassment_count += 1
            else:
                non_harassment_count += 1

        cap.release()


        total_frames = harassment_count + non_harassment_count
        avg_harassment_score = (total_harassment_score / total_frames) * 100 if total_frames else 0
        avg_non_harassment_score = (total_non_harassment_score / total_frames) * 100 if total_frames else 0

        if harassment_count > non_harassment_count:
            return "Harassment Detected", avg_harassment_score, avg_non_harassment_score
        else:
            return "No Harassment Detected", avg_harassment_score, avg_non_harassment_score

    except Exception as e:
        print(f"Error in video analysis: {e}")
        return "Error during analysis", 0, 0

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python videoAnalysis.py <video_path>")
        sys.exit(1)

    video_path = sys.argv[1]
    result, harassment_confidence, non_harassment_confidence = analyze_video(video_path)
    print(result)
    print(f"Harassment Confidence: {harassment_confidence}%")
    print(f"No Harassment Confidence: {non_harassment_confidence}%")
