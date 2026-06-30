from pathlib import Path
import pickle
from typing import Any
import warnings

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATHS = [
	BASE_DIR / 'models' / 'CryoSphere_AI_Model.pkl',
	BASE_DIR / 'CryoSphere_AI_Model.pkl',
]


class PredictionInput(BaseModel):
	temperature_C: float = Field(..., description='Current storage temperature in Celsius')
	humidity_percent: float = Field(..., description='Current storage humidity percentage')
	door_open_duration_min: float = Field(..., description='Door open duration in minutes')
	door_frequency_per_hour: float = Field(..., description='Door opening frequency per hour')
	storage_hours: float = Field(..., description='Total storage duration in hours')


class PredictionOutput(BaseModel):
	temperature_C: float
	humidity_percent: float
	door_open_duration_min: float
	door_frequency_per_hour: float
	storage_hours: float
	risk_score: float
	spoilage_label: str


class BatchPredictionInput(BaseModel):
	rows: list[PredictionInput] = Field(..., min_length=1, description='Prediction rows to evaluate')


class BatchPredictionRow(BaseModel):
	row_number: int
	temperature_C: float
	humidity_percent: float
	door_open_duration_min: float
	door_frequency_per_hour: float
	storage_hours: float
	risk_score: float
	spoilage_label: str


class BatchPredictionOutput(BaseModel):
	total_rows: int
	processed_rows: int
	failed_rows: int
	results: list[BatchPredictionRow]


app = FastAPI(title='CryoSphere AI Service', version='1.0.0')

app.add_middleware(
	CORSMiddleware,
	allow_origins=['*'],
	allow_credentials=True,
	allow_methods=['*'],
	allow_headers=['*'],
)


def load_model() -> Any:
	model_path = next((path for path in MODEL_PATHS if path.exists()), None)

	if model_path is None:
		checked_paths = ', '.join(str(path) for path in MODEL_PATHS)
		raise FileNotFoundError(f'Model not found. Checked: {checked_paths}')

	load_errors = []

	try:
		with warnings.catch_warnings():
			warnings.simplefilter('ignore')
			return joblib.load(model_path)
	except Exception as joblib_error:
		load_errors.append(f'joblib: {joblib_error}')

	try:
		with model_path.open('rb') as model_file:
			return pickle.load(model_file)
	except Exception as pickle_error:
		load_errors.append(f'pickle: {pickle_error}')

	raise RuntimeError(f'Unable to load model from {model_path}. ' + '; '.join(load_errors))


MODEL = None
MODEL_LOAD_ERROR = None

try:
	MODEL = load_model()
except Exception as model_error:
	MODEL_LOAD_ERROR = str(model_error)


def normalize_label(raw_label: Any) -> str:
	if isinstance(raw_label, np.ndarray):
		if raw_label.size == 0:
			return 'unknown'
		raw_label = raw_label.flatten()[0]

	return str(raw_label)


def extract_risk_score(model: Any, feature_vector: np.ndarray, predicted_label: str) -> float:
	risk_score = 0.0

	if hasattr(model, 'predict_proba'):
		probabilities = model.predict_proba(feature_vector)
		if isinstance(probabilities, np.ndarray) and probabilities.size > 0:
			positive_index = 1 if probabilities.shape[1] > 1 else 0
			risk_score = float(probabilities[0][positive_index]) * 100.0
			return round(max(0.0, min(100.0, risk_score)), 2)

	if predicted_label.lower() in {'spoilage', 'spoiled', 'high_risk', 'high risk', '1', 'true'}:
		return 100.0

	return 0.0


def run_prediction(input_row: PredictionInput) -> PredictionOutput:
	feature_vector = np.array(
		[
			[
				input_row.temperature_C,
				input_row.humidity_percent,
				input_row.door_open_duration_min,
				input_row.door_frequency_per_hour,
				input_row.storage_hours,
			]
		],
		dtype=float,
	)

	raw_prediction = MODEL.predict(feature_vector)
	spoilage_label = normalize_label(raw_prediction)
	risk_score = extract_risk_score(MODEL, feature_vector, spoilage_label)

	return PredictionOutput(
		temperature_C=input_row.temperature_C,
		humidity_percent=input_row.humidity_percent,
		door_open_duration_min=input_row.door_open_duration_min,
		door_frequency_per_hour=input_row.door_frequency_per_hour,
		storage_hours=input_row.storage_hours,
		risk_score=risk_score,
		spoilage_label=spoilage_label,
	)


@app.get('/')
def root():
	return {
		'status': 'ok',
		'service': 'CryoSphere AI Service',
		'version': '1.0.0',
		'endpoints': {
			'health': '/health',
			'predict': '/predict',
			'predict_batch': '/predict-batch',
		},
		'model_status': 'loaded' if MODEL is not None else 'failed',
	}


@app.get('/health')
def health_check():
	return {
		'status': 'ok' if MODEL is not None else 'degraded',
		'service': 'CryoSphere AI Service',
		'model_loaded': MODEL is not None,
		'error': MODEL_LOAD_ERROR,
	}


@app.post('/predict', response_model=PredictionOutput)
def predict(payload: PredictionInput):
	if MODEL is None:
		raise HTTPException(status_code=503, detail=f'AI model could not be loaded: {MODEL_LOAD_ERROR}')

	try:
		return run_prediction(payload)
	except Exception as prediction_error:
		raise HTTPException(status_code=500, detail=f'Prediction failed: {prediction_error}') from prediction_error


@app.post('/predict-batch', response_model=BatchPredictionOutput)
def predict_batch(payload: BatchPredictionInput):
	if MODEL is None:
		raise HTTPException(status_code=503, detail=f'AI model could not be loaded: {MODEL_LOAD_ERROR}')

	results = []

	for index, row in enumerate(payload.rows, start=1):
		try:
			prediction = run_prediction(row)
			results.append(
				BatchPredictionRow(
					row_number=index,
					temperature_C=prediction.temperature_C,
					humidity_percent=prediction.humidity_percent,
					door_open_duration_min=prediction.door_open_duration_min,
					door_frequency_per_hour=prediction.door_frequency_per_hour,
					storage_hours=prediction.storage_hours,
					risk_score=prediction.risk_score,
					spoilage_label=prediction.spoilage_label,
				)
			)
		except Exception:
			continue

	processed_rows = len(results)
	total_rows = len(payload.rows)

	return BatchPredictionOutput(
		total_rows=total_rows,
		processed_rows=processed_rows,
		failed_rows=total_rows - processed_rows,
		results=results,
	)
