import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  X, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Search, 
  Check, 
  Info,
  HelpCircle,
  Building2,
  Thermometer,
  Activity
} from 'lucide-react';
import { Asset } from '../../types';
import { NfcService, NfcReadResult } from '../../services/nfcService';
import confetti from 'canvas-confetti';

interface NfcAssetScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  onInspectAsset: (asset: Asset) => void;
  onCreateTicketForAsset: (asset: Asset) => void;
  lang?: 'fr' | 'en';
}

export const NfcAssetScannerModal: React.FC<NfcAssetScannerModalProps> = ({
  isOpen,
  onClose,
  assets,
  onInspectAsset,
  onCreateTicketForAsset,
  lang = 'fr'
}) => {
  const [isNfcSupported, setIsNfcSupported] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [nfcError, setNfcError] = useState<string | null>(null);
  const [lastReadResult, setLastReadResult] = useState<NfcReadResult | null>(null);
  const [identifiedAsset, setIdentifiedAsset] = useState<Asset | null>(null);
  const [simulatedSearch, setSimulatedSearch] = useState('');
  const [showSimulateList, setShowSimulateList] = useState(false);
  const [scanSeconds, setScanSeconds] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<any>(null);

  // Check hardware Web NFC support when modal opens
  useEffect(() => {
    if (isOpen) {
      const supported = NfcService.isSupported();
      setIsNfcSupported(supported);
      setIdentifiedAsset(null);
      setLastReadResult(null);
      setNfcError(null);
      setShowSimulateList(!supported);

      if (supported) {
        startNfcListening();
      } else {
        setStatusMessage(
          lang === 'fr'
            ? 'Web NFC n\'est pas supporté par ce navigateur ou appareil.'
            : 'Web NFC is not supported on this browser or device.'
        );
      }
    }

    return () => {
      stopNfcListening();
    };
  }, [isOpen]);

  // Scan timer
  useEffect(() => {
    if (scanning) {
      setScanSeconds(0);
      timerRef.current = setInterval(() => {
        setScanSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [scanning]);

  const startNfcListening = async () => {
    setNfcError(null);
    setIdentifiedAsset(null);
    setLastReadResult(null);
    setScanning(true);
    setStatusMessage(
      lang === 'fr'
        ? 'Antenne NFC active. Approchez votre smartphone du tag physique...'
        : 'NFC antenna active. Tap your smartphone near the physical tag...'
    );

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      await NfcService.startReading(
        assets,
        (result: NfcReadResult) => {
          setLastReadResult(result);
          if (result.matchedAsset) {
            handleAssetFound(result.matchedAsset);
          } else {
            setStatusMessage(
              lang === 'fr'
                ? `Tag NFC lu (UID: ${result.serialNumber || 'Inconnu'}), aucun équipement correspondant trouvé.`
                : `NFC tag read (UID: ${result.serialNumber || 'Unknown'}), no matching asset found.`
            );
          }
        },
        (error: string) => {
          setNfcError(error);
          setStatusMessage(error);
          setScanning(false);
        },
        abortControllerRef.current.signal
      );
    } catch (err: any) {
      setNfcError(err.message || 'Erreur d\'initialisation NFC');
      setScanning(false);
    }
  };

  const stopNfcListening = () => {
    setScanning(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleAssetFound = (asset: Asset) => {
    stopNfcListening();
    setIdentifiedAsset(asset);
    
    // Play celebratory particles
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.7 }
    });

    // Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 50, 60]);
    }
  };

  const handleSimulateTagTap = (asset: Asset) => {
    const fakeResult: NfcReadResult = {
      serialNumber: `04:A3:89:${asset.code.replace(/[^0-9]/g, '').slice(-2).padStart(2, '0')}:5B:80`,
      tagData: `urn:nfc:wkt:T:${asset.code}`,
      matchedAsset: asset,
      timestamp: new Date()
    };
    setLastReadResult(fakeResult);
    handleAssetFound(asset);
  };

  if (!isOpen) return null;

  const filteredSimulatedAssets = assets.filter(a => 
    a.name.toLowerCase().includes(simulatedSearch.toLowerCase()) ||
    a.code.toLowerCase().includes(simulatedSearch.toLowerCase()) ||
    a.category.toLowerCase().includes(simulatedSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-mono font-bold text-white uppercase tracking-wider">
                  {lang === 'fr' ? 'Lecteur NFC Équipements' : 'Equipment NFC Tag Reader'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Web NFC 13.56 MHz
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {lang === 'fr'
                  ? 'Identification sans contact des actifs CAFM & GMAO'
                  : 'Contactless hardware asset identification & telemetry lookup'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* ========================================================================= */}
          {/* 1. ACTIVE SCANNING RADAR (WAITING FOR NFC TAG) */}
          {/* ========================================================================= */}
          {scanning && isNfcSupported && !identifiedAsset && (
            <div className="flex flex-col items-center justify-center text-center py-6 space-y-6">
              
              {/* Radar Waves Animation */}
              <div className="relative flex items-center justify-center w-48 h-48">
                <div className="absolute w-44 h-44 rounded-full border border-orange-500/20 animate-ping opacity-40" />
                <div className="absolute w-36 h-36 rounded-full border border-orange-500/30 animate-pulse" />
                <div className="absolute w-28 h-28 rounded-full border border-orange-500/40 bg-orange-500/5 flex items-center justify-center shadow-lg shadow-orange-500/10" />
                
                {/* Center NFC Icon */}
                <div className="relative z-10 p-5 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-xl shadow-orange-500/30 flex flex-col items-center">
                  <Smartphone className="w-10 h-10 animate-bounce" />
                </div>
              </div>

              {/* Waiting Status Box */}
              <div className="space-y-2 max-w-md">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                  <span>{lang === 'fr' ? 'EN ATTENTE D\'UN TAG NFC...' : 'WAITING FOR NFC TAG...'} ({scanSeconds}s)</span>
                </div>
                
                <p className="text-sm font-semibold text-white">
                  {lang === 'fr' 
                    ? 'Approchez votre smartphone du tag NFC fixé sur l\'équipement' 
                    : 'Tap your smartphone near the NFC tag affixed on the equipment'}
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  {statusMessage}
                </p>
              </div>

              {/* Action: Stop Scanning */}
              <button
                onClick={stopNfcListening}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono font-bold transition-all"
              >
                {lang === 'fr' ? 'Arrêter le scan' : 'Cancel Scan'}
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. ASSET IDENTIFIED SUCCESS STATE */}
          {/* ========================================================================= */}
          {identifiedAsset && (
            <div className="space-y-5 animate-in zoom-in-95 duration-200">
              
              {/* Success Badge Banner */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-md">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase block">
                      {lang === 'fr' ? 'Équipement Identifié avec Succès' : 'Equipment Identified Successfully'}
                    </span>
                    <span className="text-[11px] text-slate-300 font-mono">
                      {lastReadResult?.serialNumber ? `UID NFC : ${lastReadResult.serialNumber}` : 'Tag NDEF Validé'}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  MATCH 100%
                </span>
              </div>

              {/* Asset Details Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30 inline-block mb-1">
                      {identifiedAsset.code}
                    </span>
                    <h4 className="text-base font-bold text-white font-sans">{identifiedAsset.name}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {identifiedAsset.buildingName} • {identifiedAsset.floor} • {identifiedAsset.zone}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                    identifiedAsset.status === 'operational' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    identifiedAsset.status === 'maintenance' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                    'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    {identifiedAsset.status}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800/80 font-mono text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Catégorie</span>
                    <span className="text-white font-bold">{identifiedAsset.category}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Score Santé</span>
                    <span className={`font-bold ${identifiedAsset.healthScore > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {identifiedAsset.healthScore}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Prochaine PM</span>
                    <span className="text-slate-300 font-bold">{identifiedAsset.nextService}</span>
                  </div>
                </div>

                {/* Raw NFC Payload details */}
                {lastReadResult && (
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-[11px] space-y-1">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Données Tag NDEF Brutes :</span>
                    <div className="text-slate-300 break-all bg-slate-950 p-2 rounded border border-slate-800">
                      {lastReadResult.tagData || lastReadResult.serialNumber}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    onInspectAsset(identifiedAsset);
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Inspecter la Fiche Complète' : 'Inspect Full Asset Record'}</span>
                </button>

                <button
                  onClick={() => {
                    onCreateTicketForAsset(identifiedAsset);
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-orange-500/20"
                >
                  <Wrench className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Créer un Bon de Travail (WO)' : 'Create Work Order'}</span>
                </button>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={() => {
                    setIdentifiedAsset(null);
                    setLastReadResult(null);
                    if (isNfcSupported) {
                      startNfcListening();
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{lang === 'fr' ? 'Scanner un autre tag NFC' : 'Scan another NFC tag'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. ERROR OR UNSUPPORTED BROWSER BANNER */}
          {/* ========================================================================= */}
          {(!isNfcSupported || nfcError) && !identifiedAsset && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-mono font-bold text-amber-300 uppercase">
                      {!isNfcSupported 
                        ? (lang === 'fr' ? 'Web NFC non supporté sur ce navigateur' : 'Web NFC not supported on this browser')
                        : (lang === 'fr' ? 'Erreur de lecture NFC' : 'NFC Reading Error')}
                    </h4>
                    <p className="text-xs text-slate-300 font-mono mt-1 leading-relaxed">
                      {!isNfcSupported
                        ? (lang === 'fr' 
                            ? 'L\'API Web NFC (NDEFReader) requiert Google Chrome ou Microsoft Edge sur un appareil Android avec puce NFC active et connexion HTTPS.'
                            : 'The Web NFC API (NDEFReader) requires Google Chrome or Microsoft Edge on an Android device with NFC enabled and HTTPS.')
                        : nfcError}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20 text-[11px] font-mono text-slate-400 space-y-1">
                  <span className="text-amber-400 font-bold block">{lang === 'fr' ? 'ℹ️ Bonnes Pratiques :' : 'ℹ️ Best Practices:'}</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                    <li>{lang === 'fr' ? 'Activer le NFC dans les Paramètres Android' : 'Enable NFC in Android Settings'}</li>
                    <li>{lang === 'fr' ? 'Autoriser la permission NFC lorsque le navigateur la demande' : 'Grant NFC permission when prompted by the browser'}</li>
                    <li>{lang === 'fr' ? 'Approcher le dos du smartphone à moins de 2 cm du tag' : 'Hold the back of the phone within 2cm of the tag'}</li>
                  </ul>
                </div>
              </div>

              {/* Retry button if supported but errored */}
              {isNfcSupported && (
                <button
                  onClick={startNfcListening}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-mono text-xs font-bold transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Réessayer le Scan NFC' : 'Retry NFC Scan'}</span>
                </button>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. SIMULATION / TESTING FALLBACK SECTION */}
          {/* ========================================================================= */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-orange-400" />
                {lang === 'fr' ? 'Mode Test & Simulation NFC (Tout Navigateur)' : 'NFC Simulation & Testing Mode (Any Browser)'}
              </span>
              <button
                onClick={() => setShowSimulateList(!showSimulateList)}
                className="text-[11px] font-mono text-orange-400 hover:text-orange-300 font-bold"
              >
                {showSimulateList ? (lang === 'fr' ? 'Masquer' : 'Hide') : (lang === 'fr' ? 'Afficher' : 'Show')}
              </button>
            </div>

            {showSimulateList && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <p className="text-xs text-slate-400 font-mono">
                  {lang === 'fr'
                    ? 'Cliquez sur un équipement ci-dessous pour simuler le passage d\'un tag NFC physique (idéal pour démonstrations et tests sur PC) :'
                    : 'Click an equipment below to simulate a physical NFC tag tap (ideal for PC demos and development):'}
                </p>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder={lang === 'fr' ? 'Rechercher un tag à simuler...' : 'Search tag to simulate...'}
                    value={simulatedSearch}
                    onChange={(e) => setSimulatedSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto divide-y divide-slate-800/80 pr-1 space-y-1">
                  {filteredSimulatedAssets.map(asset => (
                    <div
                      key={asset.id}
                      onClick={() => handleSimulateTagTap(asset)}
                      className="p-2.5 rounded-xl hover:bg-slate-900 flex items-center justify-between cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Radio className="w-3.5 h-3.5 text-orange-400 group-hover:scale-110 transition-transform" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono font-bold text-white group-hover:text-orange-400 transition-colors">
                              {asset.name}
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                              {asset.code}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            {asset.buildingName} • {asset.floor}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-orange-400 font-bold bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white transition-all">
                        Simuler Tap
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isNfcSupported ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{isNfcSupported ? 'Web NFC API Disponible' : 'Web NFC Non Supporté (Mode Simu Dispo)'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors"
          >
            {lang === 'fr' ? 'Fermer' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
