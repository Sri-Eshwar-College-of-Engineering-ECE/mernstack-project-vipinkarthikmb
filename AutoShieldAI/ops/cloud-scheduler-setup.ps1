param(
  [string]$ProjectId = "autoshieldai4",
  [string]$Region = "asia-south1",
  [string]$FunctionUrl,
  [string]$ServiceAccountEmail,
  [string]$SchedulerSecret
)

$ErrorActionPreference = "Stop"

if (-not $FunctionUrl) {
  throw "FunctionUrl is required. Example: https://<region>-<project>.cloudfunctions.net/ingestDisruptionSnapshot"
}

if (-not $ServiceAccountEmail) {
  throw "ServiceAccountEmail is required for OIDC-authenticated scheduler invocations."
}

gcloud config set project $ProjectId

$headers = "x-autoshield-scheduler-secret=$SchedulerSecret"

$jobName = "autoshield-trigger-evaluator"
gcloud scheduler jobs create http $jobName `
  --location=$Region `
  --schedule="*/5 * * * *" `
  --http-method=POST `
  --uri=$FunctionUrl `
  --oidc-service-account-email=$ServiceAccountEmail `
  --oidc-token-audience=$FunctionUrl `
  --headers=$headers `
  --message-body='{"source":"cloud-scheduler"}' `
  --time-zone="Asia/Kolkata"

Write-Host "Scheduler job '$jobName' created in $Region"
