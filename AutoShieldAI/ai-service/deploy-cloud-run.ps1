param(
  [string]$ProjectId = "autoshieldai4",
  [string]$Region = "asia-south1",
  [string]$ServiceName = "autoshield-ai-engine"
)

$ErrorActionPreference = "Stop"

Write-Host "Setting gcloud project..."
gcloud config set project $ProjectId

Write-Host "Deploying AI service to Cloud Run..."
gcloud run deploy $ServiceName `
  --source . `
  --region $Region `
  --allow-unauthenticated=false `
  --cpu=1 `
  --memory=1Gi `
  --timeout=60 `
  --set-env-vars "PYTHONUNBUFFERED=1"

Write-Host "Fetching service URL..."
$serviceUrl = gcloud run services describe $ServiceName --region $Region --format "value(status.url)"
Write-Host "Cloud Run URL: $serviceUrl"
Write-Host "Use these in backend env:"
Write-Host "AI_RISK_URL=$serviceUrl/risk-score"
Write-Host "AI_FRAUD_URL=$serviceUrl/fraud-score"
Write-Host "CLOUD_RUN_AUDIENCE=$serviceUrl"
