# ================================================================
# ReclamTrack - Sync GitHub depuis VSCode vers la VM
# Usage: ./scripts/github-sync.ps1 [branch]
# Exemple: ./scripts/github-sync.ps1 main
# ================================================================

param(
    [string]$Branch = "main",
    [string]$VmUser = "terix",
    [string]$VmIp   = "127.0.0.1",
    [string]$VmPort = "2222"
)

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  ReclamTrack - Push & Sync GitHub → VM" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# --- Étape 1: Push vers GitHub (terix85 SSH remote) ---
Write-Host "[1/3] Push du code local vers GitHub (remote terix85)..." -ForegroundColor Yellow
git push terix85 $Branch
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERREUR: git push échoué." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Code poussé vers GitHub" -ForegroundColor Green
Write-Host ""

# --- Étape 2: Déclencher le pull dans la VM ---
Write-Host "[2/3] Déclenchement du pull dans la VM ($VmUser@$VmIp:$VmPort)..." -ForegroundColor Yellow
$SyncCmd = "bash ~/reclamtrack/scripts/vm-sync.sh $Branch"
ssh -p $VmPort -o ConnectTimeout=10 -o StrictHostKeyChecking=no $VmUser@$VmIp $SyncCmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Connexion VM échouée. Vérifiez que la VM est démarrée et que le port $VmPort est ouvert." -ForegroundColor Yellow
    Write-Host "   Le code est quand même sur GitHub." -ForegroundColor Gray
} else {
    Write-Host "✅ VM synchronisée avec GitHub" -ForegroundColor Green
}
Write-Host ""

# --- Étape 3: Résumé ---
Write-Host "[3/3] Résumé" -ForegroundColor Yellow
Write-Host "  GitHub remote: git@github.com:terix85/reclamtrackvm.git" -ForegroundColor Gray
Write-Host "  Branche: $Branch" -ForegroundColor Gray
Write-Host "  VM: $VmUser@$VmIp:$VmPort" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Opération terminée !" -ForegroundColor Green
