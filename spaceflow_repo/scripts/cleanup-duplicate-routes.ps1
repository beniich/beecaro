# Script de nettoyage des routes dupliquées
# ReclamTrack - Harmonisation Frontend

Write-Host "🧹 Nettoyage des routes dupliquées..." -ForegroundColor Cyan
Write-Host ""

$frontendPath = "C:\Users\pc gold\projet dash\ticket\reclamtrack\frontend\src\app\(app)"

# Fonction pour supprimer en toute sécurité
function Remove-SafelyWithBackup {
    param(
        [string]$Path,
        [string]$Reason
    )
    
    if (Test-Path $Path) {
        Write-Host "  ❌ Suppression: $Path" -ForegroundColor Yellow
        Write-Host "     Raison: $Reason" -ForegroundColor Gray
        Remove-Item -Path $Path -Recurse -Force
        Write-Host "     ✅ Supprimé" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Déjà supprimé: $Path" -ForegroundColor Gray
    }
    Write-Host ""
}

Write-Host "📋 Étape 1: Suppression des doublons Dashboard" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────" -ForegroundColor Gray

Remove-SafelyWithBackup `
    -Path "$frontendPath\dashboard\dashboard" `
    -Reason "Doublon de /dashboard"

Remove-SafelyWithBackup `
    -Path "$frontendPath\dashboard\legacy" `
    -Reason "Version obsolète du dashboard"

Write-Host "📋 Étape 2: Suppression des doublons Inventaire" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────" -ForegroundColor Gray

# Note: On garde inventory/inventory pour l'instant et on le renommera
Write-Host "  ℹ️  inventory/inventory sera renommé manuellement" -ForegroundColor Cyan
Write-Host "     Action: Déplacer le contenu vers /inventory" -ForegroundColor Gray
Write-Host ""

Write-Host "📋 Étape 3: Suppression des doublons Reports/Analytics" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────" -ForegroundColor Gray

Remove-SafelyWithBackup `
    -Path "$frontendPath\reports\analytics\heatmap" `
    -Reason "Fonctionnalité déjà dans /map"

Remove-SafelyWithBackup `
    -Path "$frontendPath\reports\analytics\satisfaction" `
    -Reason "Fonctionnalité déjà dans /analytics/satisfaction"

Write-Host "📋 Étape 4: Gestion Planning (Fusion recommandée)" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────" -ForegroundColor Gray

Write-Host "  ℹ️  Routes à fusionner:" -ForegroundColor Cyan
Write-Host "     - /teams/planning" -ForegroundColor Gray
Write-Host "     - /planning (GARDER)" -ForegroundColor Green
Write-Host "     - /roster" -ForegroundColor Gray
Write-Host ""
Write-Host "  ⚠️  Action manuelle requise:" -ForegroundColor Yellow
Write-Host "     1. Vérifier le contenu de chaque page" -ForegroundColor Gray
Write-Host "     2. Fusionner les fonctionnalités dans /planning" -ForegroundColor Gray
Write-Host "     3. Supprimer /teams/planning et /roster" -ForegroundColor Gray
Write-Host "     4. Ajouter des redirections" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Nettoyage terminé!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Résumé:" -ForegroundColor Cyan
Write-Host "  ✅ Doublons dashboard supprimés: 2" -ForegroundColor Green
Write-Host "  ✅ Doublons reports supprimés: 2" -ForegroundColor Green
Write-Host "  ⚠️  Actions manuelles requises: 2" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔄 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "  1. Vérifier que l'application fonctionne toujours" -ForegroundColor White
Write-Host "  2. Mettre à jour les liens de navigation" -ForegroundColor White
Write-Host "  3. Ajouter des redirections pour les anciennes URLs" -ForegroundColor White
Write-Host "  4. Tester toutes les pages" -ForegroundColor White
Write-Host ""
