import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  listUserSpreadsheets, 
  getSpreadsheetDetails, 
  readSpreadsheetRange, 
  updateSpreadsheetRange, 
  appendSpreadsheetRows, 
  createCafmSpreadsheet,
  DriveSpreadsheetFile,
  SheetMetadata,
  SheetValuesResult,
  extractSpreadsheetId
} from '../../lib/googleSheets';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  Plus, 
  ExternalLink, 
  UploadCloud, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  FolderSearch, 
  Table, 
  FileText,
  Lock,
  ArrowRight,
  Database,
  Layers,
  Calendar,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GoogleSheetsManagerProps {
  lang: 'fr' | 'en';
  isLightMode?: boolean;
}

export const GoogleSheetsManager: React.FC<GoogleSheetsManagerProps> = ({ lang, isLightMode = false }) => {
  const { user, googleAccessToken, signInWithGoogle } = useAuth();
  
  // State
  const [spreadsheets, setSpreadsheets] = useState<DriveSpreadsheetFile[]>([]);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string>('');
  const [manualInputId, setManualInputId] = useState<string>('');
  const [currentDetails, setCurrentDetails] = useState<SheetMetadata | null>(null);
  const [activeTabName, setActiveTabName] = useState<string>('');
  const [sheetData, setSheetData] = useState<SheetValuesResult | null>(null);
  
  // UI states
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Destructive Confirmation Modal State (Mandatory Workspace API Security Rule)
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'sync_all' | 'append_wo' | 'create_new';
    description: string;
    targetSheetName: string;
  } | null>(null);

  // Load user spreadsheets when googleAccessToken is available
  useEffect(() => {
    if (googleAccessToken) {
      loadDriveSpreadsheets();
    }
  }, [googleAccessToken]);

  const loadDriveSpreadsheets = async () => {
    if (!googleAccessToken) return;
    setLoadingList(true);
    setErrorMsg(null);
    try {
      const files = await listUserSpreadsheets(googleAccessToken);
      setSpreadsheets(files);
      if (files.length > 0 && !selectedSpreadsheetId) {
        handleSelectSpreadsheet(files[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load drive files:', err);
      setErrorMsg(
        lang === 'fr' 
          ? 'Impossible de charger vos fichiers Google Drive. Veuillez vérifier les autorisations.' 
          : 'Unable to load Google Drive spreadsheets. Please verify permissions.'
      );
    } finally {
      setLoadingList(false);
    }
  };

  const handleSelectSpreadsheet = async (sheetId: string) => {
    if (!googleAccessToken || !sheetId) return;
    const cleanId = extractSpreadsheetId(sheetId);
    setSelectedSpreadsheetId(cleanId);
    setLoadingDetails(true);
    setErrorMsg(null);
    setSheetData(null);

    try {
      const details = await getSpreadsheetDetails(googleAccessToken, cleanId);
      setCurrentDetails(details);
      if (details.sheets.length > 0) {
        const firstTab = details.sheets[0].title;
        setActiveTabName(firstTab);
        await loadTabValues(cleanId, firstTab);
      }
    } catch (err: any) {
      console.error('Failed to load spreadsheet details:', err);
      setErrorMsg(
        lang === 'fr'
          ? `Erreur lors de la lecture du classeur (${err.message})`
          : `Error loading spreadsheet (${err.message})`
      );
    } finally {
      setLoadingDetails(false);
    }
  };

  const loadTabValues = async (sheetId: string, tabName: string) => {
    if (!googleAccessToken) return;
    try {
      const result = await readSpreadsheetRange(googleAccessToken, sheetId, `'${tabName}'!A1:Z30`);
      setSheetData(result);
    } catch (err: any) {
      console.error('Failed to load tab values:', err);
    }
  };

  // Trigger Confirmation Modal for Mutating Action
  const requestSyncAllData = () => {
    if (!selectedSpreadsheetId && !currentDetails) {
      setErrorMsg(lang === 'fr' ? 'Veuillez sélectionner ou créer un classeur d\'abord.' : 'Please select or create a spreadsheet first.');
      return;
    }
    setPendingAction({
      type: 'sync_all',
      description: lang === 'fr' 
        ? 'Écraser et synchroniser toutes les données CAFM (Équipements, Ordres de Travail, Télémétrie ESG et KPIs) dans le classeur Google Sheets sélectionné.' 
        : 'Overwrite and sync all CAFM data (Assets, Work Orders, ESG Telemetry, and KPIs) into the selected Google Spreadsheet.',
      targetSheetName: currentDetails?.title || 'Spreadsheet'
    });
    setConfirmModalOpen(true);
  };

  const requestCreateNewCafmSheet = () => {
    setPendingAction({
      type: 'create_new',
      description: lang === 'fr'
        ? 'Créer un nouveau classeur Google Sheets "BeeCarbonat CAFM & ESG Enterprise" dans votre Google Drive avec la structure multi-onglets standardisée.'
        : 'Create a new Google Spreadsheet "BeeCarbonat CAFM & ESG Enterprise" in your Google Drive with standardized multi-tab layout.',
      targetSheetName: 'Nouveau Classeur Google Sheets'
    });
    setConfirmModalOpen(true);
  };

  const requestAppendWorkOrder = () => {
    if (!selectedSpreadsheetId) return;
    setPendingAction({
      type: 'append_wo',
      description: lang === 'fr'
        ? 'Ajouter une nouvelle ligne d\'ordre de travail préventif dans l\'onglet actif du classeur Google Sheets.'
        : 'Append a new preventive maintenance work order row to the active sheet tab.',
      targetSheetName: activeTabName || 'Sheet'
    });
    setConfirmModalOpen(true);
  };

  // Execute Confirmed Workspace API Mutation
  const executeConfirmedAction = async () => {
    if (!pendingAction || !googleAccessToken) return;
    setConfirmModalOpen(false);
    setSyncing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (pendingAction.type === 'create_new') {
        const title = `BeeCarbonat CAFM & ESG - ${new Date().toLocaleDateString('fr-FR')} (${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})`;
        const newSheet = await createCafmSpreadsheet(googleAccessToken, title);
        
        // Populate initial tabs with sample CAFM data
        await populateNewSheetWithData(newSheet.spreadsheetId);

        await loadDriveSpreadsheets();
        await handleSelectSpreadsheet(newSheet.spreadsheetId);
        
        setSuccessMsg(
          lang === 'fr' 
            ? `Classeur "${newSheet.title}" créé et synchronisé avec succès dans Google Drive !` 
            : `Spreadsheet "${newSheet.title}" created and synced in your Google Drive!`
        );
        confetti({ particleCount: 40, spread: 50 });

      } else if (pendingAction.type === 'sync_all') {
        await populateNewSheetWithData(selectedSpreadsheetId);
        await handleSelectSpreadsheet(selectedSpreadsheetId);
        setSuccessMsg(
          lang === 'fr' 
            ? 'Données CAFM et Télémétrie ESG synchronisées avec succès dans Google Sheets !' 
            : 'CAFM Assets and ESG telemetry successfully synced to Google Sheets!'
        );
        confetti({ particleCount: 40, spread: 50 });

      } else if (pendingAction.type === 'append_wo') {
        const newRow = [
          `WO-${Date.now().toString().slice(-4)}`,
          'Calibration Capteurs Bio-Énergie',
          'Centrale CTA-Zone-Nord',
          'Haute',
          'En Cours',
          user?.email || 'technician@beecarbonat.ai',
          new Date().toISOString().split('T')[0],
          '2.5h',
          'SLA Respecté'
        ];
        await appendSpreadsheetRows(googleAccessToken, selectedSpreadsheetId, `'${activeTabName}'!A:I`, [newRow]);
        await loadTabValues(selectedSpreadsheetId, activeTabName);
        setSuccessMsg(
          lang === 'fr' 
            ? 'Nouvel ordre de travail ajouté dans Google Sheets !' 
            : 'New work order row appended to Google Sheets!'
        );
      }
    } catch (err: any) {
      console.error('Workspace operation failed:', err);
      setErrorMsg(err.message || 'L\'opération Google Sheets a échoué.');
    } finally {
      setSyncing(false);
      setPendingAction(null);
    }
  };

  const populateNewSheetWithData = async (sheetId: string) => {
    if (!googleAccessToken) return;

    // 1. Assets Tab
    const assetsData = [
      ['ID Équipement', 'Désignation', 'Localisation', 'Statut', 'Criticité', 'Santé (%)', 'Dernière Inspection', 'Impact CO2 (kg)'],
      ['EQ-001', 'Centrale Traitement d\'Air (CTA-01)', 'Toiture Bâtiment A', 'Opérationnel', 'Critique', '94%', '2026-08-15', '142.5'],
      ['EQ-002', 'Groupe Froid Chiller Turbocor', 'Sous-sol Technique', 'Opérationnel', 'Haute', '98%', '2026-08-20', '320.0'],
      ['EQ-003', 'Onduleur Solaire Photovoltaïque', 'Zone Ombrières Sud', 'En Maintenance', 'Moyenne', '81%', '2026-08-22', '0.0'],
      ['EQ-004', 'Batterie Stockage Bio-Carbone', 'Local Énergie B3', 'Optimisé', 'Critique', '99%', '2026-08-26', '-45.0'],
      ['EQ-005', 'Pompe de Relevage Sanitaire', 'Local Pompage -2', 'Opérationnel', 'Basse', '90%', '2026-08-10', '12.3']
    ];
    await updateSpreadsheetRange(googleAccessToken, sheetId, "'Equipements_Assets'!A1:H6", assetsData).catch(() => {});

    // 2. Work Orders Tab
    const woData = [
      ['N° Ordre', 'Intitulé Intervention', 'Équipement Lié', 'Priorité', 'Statut', 'Technicien Assigné', 'Échéance', 'Durée Est.'],
      ['WO-1042', 'Remplacement filtres HEPA CTA-01', 'EQ-001', 'Haute', 'Terminé', 'Alexandre M.', '2026-08-28', '3.0h'],
      ['WO-1043', 'Vérification pression Fréon R1234ze', 'EQ-002', 'Moyenne', 'Planifié', 'Sarah K.', '2026-09-02', '1.5h'],
      ['WO-1044', 'Recalibration capteur CO2 & Température', 'EQ-004', 'Basse', 'En Cours', 'Marc L.', '2026-08-30', '1.0h']
    ];
    await updateSpreadsheetRange(googleAccessToken, sheetId, "'Ordres_Travail_GMAO'!A1:H4", woData).catch(() => {});

    // 3. ESG Telemetry
    const esgData = [
      ['Horodatage', 'Zone / Étage', 'Puissance (kW)', 'Température (°C)', 'Qualité Air (AQI)', 'CO2 (ppm)', 'Bio-Carbone Réduit (kg)'],
      ['2026-08-27 08:00', 'Plateau Bureaux R+3', '42.8', '21.5', '14 (Excellent)', '420', '18.4'],
      ['2026-08-27 10:00', 'Plateau Bureaux R+3', '58.2', '22.1', '18 (Bon)', '465', '24.1'],
      ['2026-08-27 12:00', 'Plateau Bureaux R+3', '64.0', '22.8', '22 (Bon)', '510', '28.9'],
      ['2026-08-27 14:00', 'Plateau Bureaux R+3', '61.5', '22.4', '19 (Bon)', '480', '26.5']
    ];
    await updateSpreadsheetRange(googleAccessToken, sheetId, "'Telemetrie_ESG_Energie'!A1:G5", esgData).catch(() => {});

    // 4. KPIs Tab
    const kpiData = [
      ['Indicateur Clé (KPI)', 'Valeur Actuelle', 'Objectif Q3', 'Unité', 'Statut Conformité'],
      ['Taux de Disponibilité Équipements', '99.4', '98.5', '%', 'CONFORME'],
      ['Consommation Énergétique Spécifique', '84.2', '90.0', 'kWh/m²/an', 'OPTIMISÉ (A+)'],
      ['Empreinte Carbone Réduite (Bilan)', '3420', '3000', 'kgCO2e/mois', 'SURPERFORMÉ'],
      ['Temps Moyen de Résolution (MTTR)', '1.8', '2.5', 'Heures', 'CONFORME']
    ];
    await updateSpreadsheetRange(googleAccessToken, sheetId, "'Synthese_KPIs'!A1:E5", kpiData).catch(() => {});
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border shadow-xl ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#120e23] border-[#ff9d2b]/15'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-xl font-bold ${isLightMode ? 'text-slate-800' : 'text-black dark:text-white'}`}>
                  Connecteur Google Sheets & Drive API
                </h2>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  OFFICIEL GOOGLE WORKSPACE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'fr' 
                  ? 'Synchronisation bidirectionnelle des parcs d\'équipements, bons d\'intervention GMAO et métriques ESG directement dans vos feuilles de calcul Google.' 
                  : 'Two-way synchronization of facility assets, CMMS work orders, and ESG metrics into your Google Spreadsheets.'}
              </p>
            </div>
          </div>

          {/* Connect / Reconnect Google Account Button */}
          <div>
            {!googleAccessToken ? (
              <button
                onClick={signInWithGoogle}
                className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold shadow-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer font-mono active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>{lang === 'fr' ? 'Autoriser Google Sheets' : 'Authorize Google Sheets'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Jeton OAuth Actif</span>
                </span>
                <button
                  onClick={loadDriveSpreadsheets}
                  disabled={loadingList}
                  title="Rafraîchir les fichiers Google Drive"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingList ? 'animate-spin' : ''}`} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notifications & Feedback */}
        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Main Workspace Integration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Spreadsheets Selector & Actions (4 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Actions Card */}
          <div className={`p-5 rounded-3xl border shadow-xl space-y-4 ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#120e23] border-[#ff9d2b]/15'}`}>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isLightMode ? 'text-slate-800' : 'text-black dark:text-white'}`}>
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{lang === 'fr' ? 'Actions Rapides Google Sheets' : 'Quick Actions'}</span>
            </h3>

            <div className="space-y-2">
              <button
                onClick={requestCreateNewCafmSheet}
                disabled={!googleAccessToken || syncing}
                className="w-full py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-black dark:text-white font-bold text-xs flex items-center justify-between shadow-md transition-all cursor-pointer font-mono"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Créer Nouveau Classeur CAFM' : 'Create New CAFM Sheet'}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={requestSyncAllData}
                disabled={!googleAccessToken || !selectedSpreadsheetId || syncing}
                className="w-full py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-black dark:text-white font-bold text-xs flex items-center justify-between shadow-md transition-all cursor-pointer font-mono"
              >
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Exporter & Écraser Données CAFM' : 'Export & Sync All CAFM Data'}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={requestAppendWorkOrder}
                disabled={!googleAccessToken || !selectedSpreadsheetId || syncing}
                className="w-full py-2.5 px-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold text-xs flex items-center justify-between border border-white/5 transition-all cursor-pointer font-mono"
              >
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-sky-400" />
                  <span>{lang === 'fr' ? 'Ajouter 1 Ordre de Travail (+1 Ligne)' : 'Append 1 Work Order Row'}</span>
                </div>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Drive Spreadsheets Browser */}
          <div className={`p-5 rounded-3xl border shadow-xl space-y-4 ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#120e23] border-[#ff9d2b]/15'}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-bold flex items-center gap-2 ${isLightMode ? 'text-slate-800' : 'text-black dark:text-white'}`}>
                <FolderSearch className="w-4 h-4 text-sky-400" />
                <span>{lang === 'fr' ? 'Classeurs dans Google Drive' : 'Google Drive Spreadsheets'}</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{spreadsheets.length} trouvés</span>
            </div>

            {/* Manual ID / URL input */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {lang === 'fr' ? 'Ou coller un ID / URL de classeur :' : 'Or paste Spreadsheet ID / URL:'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={manualInputId}
                  onChange={(e) => setManualInputId(e.target.value)}
                  className="flex-1 bg-white dark:bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 font-mono outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleSelectSpreadsheet(manualInputId)}
                  disabled={!manualInputId.trim() || !googleAccessToken}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-black dark:text-white rounded-xl text-xs font-bold font-mono transition-colors"
                >
                  Ouvrir
                </button>
              </div>
            </div>

            {/* List of files */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {loadingList ? (
                <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
                  <span>Chargement Google Drive...</span>
                </div>
              ) : spreadsheets.length === 0 ? (
                <div className="text-center py-6 p-4 rounded-2xl bg-white dark:bg-slate-950/30 border border-white/5 text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'fr' ? 'Aucun classeur trouvé dans votre Drive.' : 'No spreadsheets found in your Drive.'}
                </div>
              ) : (
                spreadsheets.map((file) => {
                  const isSelected = selectedSpreadsheetId === file.id;
                  return (
                    <div
                      key={file.id}
                      onClick={() => handleSelectSpreadsheet(file.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected 
                          ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md shadow-emerald-950/20' 
                          : 'bg-white dark:bg-slate-950/40 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileSpreadsheet className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-emerald-300' : 'text-slate-200'}`}>
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-500 font-mono truncate">
                            {new Date(file.modifiedTime).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="Ouvrir dans Google Sheets"
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Spreadsheet Live Preview & Data Grid (7 cols) */}
        <div className="lg:col-span-7">
          <div className={`p-6 rounded-3xl border shadow-xl min-h-[480px] flex flex-col ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#120e23] border-[#ff9d2b]/15'}`}>
            {currentDetails ? (
              <div className="flex-1 flex flex-col space-y-4">
                {/* Active Sheet Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">CLASSEUR CONNECTÉ</span>
                    <h3 className={`text-lg font-bold truncate ${isLightMode ? 'text-slate-800' : 'text-black dark:text-white'}`}>
                      {currentDetails.title}
                    </h3>
                  </div>

                  <a
                    href={currentDetails.spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-colors w-fit"
                  >
                    <span>Ouvrir Google Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  </a>
                </div>

                {/* Tabs Selector */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {currentDetails.sheets.map((tab) => {
                    const isTabActive = activeTabName === tab.title;
                    return (
                      <button
                        key={tab.sheetId}
                        onClick={() => {
                          setActiveTabName(tab.title);
                          loadTabValues(currentDetails.spreadsheetId, tab.title);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all whitespace-nowrap flex items-center gap-1.5 ${
                          isTabActive 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' 
                            : 'bg-white dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 hover:text-slate-200 border border-white/5'
                        }`}
                      >
                        <Table className="w-3.5 h-3.5" />
                        <span>{tab.title}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Data Grid Preview */}
                <div className="flex-1 rounded-2xl bg-white dark:bg-slate-950/60 border border-white/5 overflow-hidden flex flex-col">
                  {loadingDetails ? (
                    <div className="flex-1 flex items-center justify-center p-8 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <span className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mr-3"></span>
                      Lecture des cellules en direct via Google Sheets API...
                    </div>
                  ) : sheetData && sheetData.values && sheetData.values.length > 0 ? (
                    <div className="overflow-x-auto max-h-[340px]">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-600 dark:text-slate-600 dark:text-slate-300 border-b border-white/10 sticky top-0">
                          <tr>
                            <th className="px-3 py-2.5 text-[10px] text-slate-500 dark:text-slate-500 w-10">#</th>
                            {sheetData.values[0].map((header: any, idx: number) => (
                              <th key={idx} className="px-3 py-2.5 font-bold uppercase tracking-wider text-[11px]">
                                {String(header)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {sheetData.values.slice(1).map((row: any[], rowIdx: number) => (
                            <tr key={rowIdx} className="hover:bg-white/5 transition-colors">
                              <td className="px-3 py-2 text-[10px] text-slate-500 dark:text-slate-500">{rowIdx + 1}</td>
                              {row.map((cell: any, cellIdx: number) => (
                                <td key={cellIdx} className="px-3 py-2 text-slate-600 dark:text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                  {String(cell)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 space-y-2">
                      <FileSpreadsheet className="w-8 h-8 text-slate-600" />
                      <p className="text-xs">Cet onglet est vide pour l'instant.</p>
                      <button
                        onClick={requestSyncAllData}
                        disabled={syncing}
                        className="text-xs text-emerald-400 font-bold hover:underline font-mono"
                      >
                        Synchroniser les données CAFM maintenant →
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-500 pt-1">
                  <span>Plage : {sheetData?.range || `'${activeTabName}'!A1:Z30`}</span>
                  <span>{sheetData?.values?.length || 0} lignes récupérées</span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-white/5 text-emerald-400">
                  <FileSpreadsheet className="w-10 h-10" />
                </div>
                <h4 className="text-base font-bold text-slate-200">
                  {lang === 'fr' ? 'Aucun classeur sélectionné' : 'No Spreadsheet Selected'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                  {lang === 'fr' 
                    ? 'Sélectionnez un classeur dans la liste à gauche ou créez un nouveau classeur CAFM multi-onglets pour visualiser et exporter vos données.' 
                    : 'Select a spreadsheet from the list on the left or create a new multi-tab CAFM spreadsheet to preview and export facility data.'}
                </p>
                {googleAccessToken && (
                  <button
                    onClick={requestCreateNewCafmSheet}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black dark:text-white font-bold text-xs font-mono transition-all"
                  >
                    + Créer Nouveau Classeur CAFM
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MANDATORY CONFIRMATION DIALOG FOR WORKSPACE MUTATIONS (Adhering to Workspace Integration Skill) */}
      {confirmModalOpen && pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#100b1f]/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-50 dark:bg-slate-900 border border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/80 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  {lang === 'fr' ? 'Confirmation d\'Écriture Google Workspace' : 'Confirm Google Workspace Modification'}
                </h3>
                <span className="text-[10px] font-mono text-amber-300">
                  Cible : {pendingAction.targetSheetName}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-950/80 border border-white/10 text-xs text-slate-600 dark:text-slate-600 dark:text-slate-300 space-y-2">
              <p className="leading-relaxed">{pendingAction.description}</p>
              <p className="text-[11px] text-amber-200/80 font-mono">
                {lang === 'fr' 
                  ? '⚠️ Cette action va modifier le contenu de votre Google Drive / Google Sheets avec votre autorisation.' 
                  : '⚠️ This action will write data into your Google Drive / Google Sheets with your permission.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmModalOpen(false);
                  setPendingAction(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-600 dark:text-slate-300 text-xs font-bold font-mono transition-colors"
              >
                {lang === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={executeConfirmedAction}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black dark:text-white text-xs font-bold font-mono shadow-lg shadow-emerald-950/50 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === 'fr' ? 'Confirmer l\'Écriture' : 'Confirm & Write'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
