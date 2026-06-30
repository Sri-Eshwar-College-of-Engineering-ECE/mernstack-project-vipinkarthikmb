# AutoShield AI – Income Protection for Gig Workers

A hackathon prototype demonstrating AI-driven, zero-touch income insurance for delivery workers.

## Quick Start

### With Docker (recommended)
```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- AI Service: http://localhost:8000

### Manual Setup

**AI Service (Python)**
```bash
cd ai-service
pip install -r requirements.txt
python train_models.py   # train ML models once
python app.py
```

**Backend (Node.js)**
```bash
cd backend
npm install
npm run dev
```

**Frontend (React)**
```bash
cd frontend
npm install
npm start
```

## Demo Flow
1. Register as a gig worker (name, phone, zone, weekly income)
2. AI instantly calculates your weekly premium (₹20–₹70)
3. Dashboard shows active policy, risk level, and premium
4. Click any **Simulate Disruption** button
5. System auto-detects breach → fraud check → calculates income loss → pays out
6. Claim appears in history instantly — zero manual action

## Architecture
- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **AI Engine**: Python Flask with RandomForest (risk) + IsolationForest (fraud)
- **Triggers**: Rainfall >50mm, Temp >42°C, AQI >300, Demand drop >60%, Curfew

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register + auto-create policy |
| POST | /api/auth/login | Login |
| GET  | /api/policy/mine | Get active policy |
| GET  | /api/claims/mine | Get claim history |
| POST | /api/triggers/simulate | Simulate disruption (demo) |

## AI Models
| Model | Algorithm | Purpose |
|-------|-----------|---------|
| Risk Prediction | RandomForestClassifier | Predicts disruption probability |
| Fraud Detection | IsolationForest | Detects anomalous claims |
| Premium Pricing | Rule-based + ML | ₹20–₹70/week dynamic pricing |
