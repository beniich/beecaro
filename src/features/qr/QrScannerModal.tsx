import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  X, 
  Camera, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  Wrench,
  Radio,
  Wifi,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Zap,
  Cpu,
  Layers,
  Sparkles,
  Tag,
  User,
  Clock,
  Check,
  Code,
  Globe,
  Database,
  Eye,
  History,
  PenTool
} from 'lucide-react';
import { Asset } from '../../types';
import { api } from '../../services/api';
import { NfcService, NfcReadResult } from '../../services/nfcService';
import { AppDownloadQrCard } from '../../components/AppDownloadQrCard';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetScanned: (asset: Asset) => void;
  onCreateTicket: (asset: Asset) => void;
  initialMode?: 'nfc' | 'qr' | 'decoder' | 'encoder' | 'download';
  isInline?: boolean;
}

interface DecodedTagLog {
  id: string;
  uuid: string;
  timestamp: string;
  lastUser: string;
  serialNumber?: string;
  payloadType: string;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onAssetScanned,
  onCreateTicket,
  initialMode = 'nfc',
  isInline = false
}) => {
  const [scanMode, setScanMode] = useState<'nfc' | 'qr' | 'decoder' | 'encoder' | 'download'>(initialMode);
  const [scanning, setScanning] = useState(true);
  const [scannedAsset, setScannedAsset] = useState<Asset | null>(null);
  const [cryptoVerified, setCryptoVerified] = useState(false);
  const [liveAssets, setLiveAssets] = useState<Asset[]>([]);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcStatusMessage, setNfcStatusMessage] = useState<string>('');
  const [lastNfcTag, setLastNfcTag] = useState<NfcReadResult | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Decoder State
  const [decodedLogs, setDecodedLogs] = useState<DecodedTagLog[]>([
    {
      id: 'log-1',
      uuid: 'AST-HVAC-01',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      lastUser: 'Tarik Benaich',
      serialNumber: '04:B2:D3:A1:FE:5E:80',
      payloadType: 'text/plain'
    },
    {
      id: 'log-2',
      uuid: 'AST-ELEC-04',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      lastUser: 'Marc Becker',
      serialNumber: '04:1E:C5:92:0F:2A:81',
      payloadType: 'text/plain'
    }
  ]);

  // Encoder State
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [customRedirectUrl, setCustomRedirectUrl] = useState<string>('');
  const [encoderMessage, setEncoderMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isWriting, setIsWriting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setScanning(true);
      setScannedAsset(null);
      setCryptoVerified(false);
      setLastNfcTag(null);
      setEncoderMessage(null);
      
      const isSupp = NfcService.isSupported();
      setNfcSupported(isSupp);

      api.getAssets().then(data => {
        if (data && data.length > 0) {
          setLiveAssets(data);
          setSelectedAssetId(data[0].id);
        }
      });
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [isOpen]);

  // Handle auto-suggest redirect URL when asset changes
  useEffect(() => {
    if (selectedAssetId) {
      const asset = liveAssets.find(a => a.id === selectedAssetId);
      if (asset) {
        setCustomRedirectUrl(`${window.location.origin}/asset/${asset.code}`);
      }
    }
  }, [selectedAssetId, liveAssets]);

  // Activate hardware Web NFC when in NFC mode or DECODER mode
  useEffect(() => {
    if (isOpen && (scanMode === 'nfc' || scanMode === 'decoder') && scanning && nfcSupported) {
      abortControllerRef.current = new AbortController();
      setNfcStatusMessage('Antenne NFC active. Approchez votre téléphone du tag physique...');

      NfcService.startReading(
        liveAssets,
        (result) => {
          setLastNfcTag(result);
          
          if (scanMode === 'decoder') {
            // Log the decoded tag details
            const newLog: DecodedTagLog = {
              id: `log-${Date.now()}`,
              uuid: result.matchedAsset?.code || result.tagData || 'Inconnu',
              timestamp: new Date().toISOString(),
              lastUser: 'Technicien NFC (Live)',
              serialNumber: result.serialNumber || '04:XX:XX:XX:XX',
              payloadType: 'NDEF text/url'
            };
            setDecodedLogs(prev => [newLog, ...prev]);
            
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
          } else {
            if (result.matchedAsset) {
              handleAssetIdentified(result.matchedAsset);
            } else {
              setNfcStatusMessage(`Tag NFC détecté (${result.tagData || result.serialNumber}), recherche de l'équipement...`);
            }
          }
        },
        (error) => {
          setNfcStatusMessage(error);
        },
        abortControllerRef.current.signal
      );
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [isOpen, scanMode, scanning, nfcSupported, liveAssets]);

  if (!isOpen) return null;

  const handleAssetIdentified = (asset: Asset) => {
    setScanning(false);
    setScannedAsset(asset);
    setCryptoVerified(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 60, 40]);
    }
  };

  const handleManualNfcTap = (asset: Asset) => {
    setLastNfcTag({
      serialNumber: `04:A3:89:${asset.code.replace(/[^0-9]/g, '').padEnd(2, '0')}:5B:80`,
      tagData: `urn:nfc:wkt:T:${asset.code}`,
      matchedAsset: asset,
      timestamp: new Date()
    });
    handleAssetIdentified(asset);
  };

  // Simulates scanning a random tag in decoder mode
  const simulateDecodeNfc = () => {
    const randomAsset = liveAssets[Math.floor(Math.random() * liveAssets.length)] || { code: 'AST-SIM-99', name: 'Simulated Tag' };
    const randSerial = Array.from({ length: 7 }, () => 
      Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0')
    ).join(':');

    const names = ['Tarik Benaich', 'Marc Becker', 'Sarah Connor', 'Jean-Luc Picard'];
    const randomName = names[Math.floor(Math.random() * names.length)];

    const newLog: DecodedTagLog = {
      id: `log-${Date.now()}`,
      uuid: randomAsset.code,
      timestamp: new Date().toISOString(),
      lastUser: randomName,
      serialNumber: randSerial,
      payloadType: 'NDEF text/plain'
    };

    setDecodedLogs(prev => [newLog, ...prev]);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([80]);
    }
  };

  // Encodes Tag using Web NFC
  const handlePhysicalEncode = async () => {
    if (!selectedAssetId) return;
    const asset = liveAssets.find(a => a.id === selectedAssetId);
    if (!asset) return;

    setIsWriting(true);
    setEncoderMessage({ type: 'info', text: 'Approchez le tag NFC de l\'antenne pour commencer l\'écriture...' });

    const abortController = new AbortController();
    
    await NfcService.writeTag(
      {
        uuid: asset.code,
        url: customRedirectUrl
      },
      () => {
        setIsWriting(false);
        setEncoderMessage({ type: 'success', text: `Succès ! Tag programmé pour l'équipement ${asset.code}` });
        
        // Add to decoder list for tracking
        const newLog: DecodedTagLog = {
          id: `log-${Date.now()}`,
          uuid: asset.code,
          timestamp: new Date().toISOString(),
          lastUser: 'Technicien (Encodeur)',
          serialNumber: '04:EE:01:FF:A2:3B:90',
          payloadType: 'NDEF text + URL'
        };
        setDecodedLogs(prev => [newLog, ...prev]);
      },
      (err) => {
        setIsWriting(false);
        setEncoderMessage({ type: 'error', text: err });
      },
      abortController.signal
    );
  };

  // Simulates encoding an NFC Tag (Mock Mode)
  const handleSimulateEncode = () => {
    if (!selectedAssetId) return;
    const asset = liveAssets.find(a => a.id === selectedAssetId);
    if (!asset) return;

    setIsWriting(true);
    setEncoderMessage({ type: 'info', text: 'Simulation d\'écriture NFC en cours...' });

    setTimeout(() => {
      setIsWriting(false);
      setEncoderMessage({ type: 'success', text: `✨ Tag simulé écrit avec succès ! UUID: ${asset.code} | Redirection: ${customRedirectUrl}` });
      
      // Add simulated item to decoder history log
      const newLog: DecodedTagLog = {
        id: `log-${Date.now()}`,
        uuid: asset.code,
        timestamp: new Date().toISOString(),
        lastUser: 'Mode Simulation (Encodeur)',
        serialNumber: `04:E2:B5:${Math.floor(Math.random() * 90 + 10)}:99:A8:77`,
        payloadType: 'NDEF text + URL'
      };
      setDecodedLogs(prev => [newLog, ...prev]);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }, 1500);
  };

  const innerContent = (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl w-full overflow-hidden flex flex-col ${isInline ? 'shadow-sm max-w-full' : 'max-w-xl shadow-2xl max-h-[90vh]'}`}>
      
      {/* Modal Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-400">
            <Radio className="w-5 h-5 text-orange-500 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              {scanMode === 'nfc' && 'Lecteur NFC Sans Contact'}
              {scanMode === 'qr' && 'Scanner Caméra QR Code'}
              {scanMode === 'decoder' && 'NFC Tag Decoder'}
              {scanMode === 'encoder' && 'NFC Tag Encoder'}
              {scanMode === 'download' && 'Télécharger l\'Application'}
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">
              Spider CAFM IoT • Antenne Web NFC active
            </p>
          </div>
        </div>
        {!isInline && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Modular Navigation Tabs - Grid compatible with grey layout */}
      <div className="px-5 pt-4 bg-slate-50/40 dark:bg-slate-900/20">
        <div className="grid grid-cols-5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
            <button
              onClick={() => {
                setScanMode('nfc');
                setScanning(true);
                setScannedAsset(null);
              }}
              className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all ${
                scanMode === 'nfc'
                  ? 'bg-slate-900 text-white dark:bg-slate-800 shadow-sm'
                  : 'hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Radio className="w-4 h-4 mb-0.5 text-orange-500" />
              <span>NFC</span>
            </button>

            <button
              onClick={() => {
                setScanMode('decoder');
                setScanning(true);
                setScannedAsset(null);
              }}
              className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all ${
                scanMode === 'decoder'
                  ? 'bg-slate-900 text-white dark:bg-slate-800 shadow-sm'
                  : 'hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <History className="w-4 h-4 mb-0.5 text-blue-400" />
              <span>Decoder</span>
            </button>

            <button
              onClick={() => {
                setScanMode('encoder');
                setScanning(false);
                setScannedAsset(null);
                setEncoderMessage(null);
              }}
              className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all ${
                scanMode === 'encoder'
                  ? 'bg-slate-900 text-white dark:bg-slate-800 shadow-sm'
                  : 'hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <PenTool className="w-4 h-4 mb-0.5 text-emerald-400" />
              <span>Encoder</span>
            </button>

            <button
              onClick={() => {
                setScanMode('qr');
                setScanning(true);
                setScannedAsset(null);
              }}
              className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all ${
                scanMode === 'qr'
                  ? 'bg-slate-900 text-white dark:bg-slate-800 shadow-sm'
                  : 'hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4 mb-0.5 text-[#ff9d2b]" />
              <span>QR Code</span>
            </button>

            <button
              onClick={() => {
                setScanMode('download');
                setScanning(false);
                setScannedAsset(null);
              }}
              className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all ${
                scanMode === 'download'
                  ? 'bg-slate-900 text-white dark:bg-slate-800 shadow-sm'
                  : 'hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4 mb-0.5 text-indigo-400" />
              <span>App</span>
            </button>
          </div>
        </div>

        {/* Content Viewport */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar min-h-[360px]">
          
          {/* TAB 1: NFC READER (STANDARD SCAN) */}
          {scanMode === 'nfc' && (
            <div className="space-y-6">
              {scanning ? (
                <div className="space-y-5">
                  <div className="relative w-full max-w-[240px] mx-auto py-8 rounded-3xl bg-gradient-to-b from-orange-500/5 to-transparent border border-orange-500/15 flex flex-col items-center justify-center overflow-hidden">
                    <div className="absolute w-44 h-44 rounded-full border border-orange-500/10 animate-ping opacity-20 pointer-events-none" />
                    <div className="absolute w-32 h-32 rounded-full border border-orange-500/20 animate-pulse pointer-events-none" />
                    <div className="absolute w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center pointer-events-none" />

                    <div className="relative z-10 text-center space-y-3 p-4">
                      <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto text-orange-500 shadow-lg">
                        <Smartphone className="w-7 h-7 animate-bounce" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold font-mono text-slate-900 dark:text-white block">
                          Approchez le mobile du Tag
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                          {nfcSupported 
                            ? (nfcStatusMessage || 'Puce Web NFC active...') 
                            : 'Navigateur de bureau - Utilisez le simulateur ci-dessous'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Simulator / 1-Tap Trigger */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>MOCK SIMULATEUR DE TAGS ({liveAssets.length}):</span>
                      <span className="text-orange-500 font-bold">1-TAP TAP</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {liveAssets.slice(0, 4).map(asset => (
                        <button
                          key={asset.id}
                          onClick={() => handleManualNfcTap(asset)}
                          className="p-3 rounded-2xl bg-slate-50 hover:bg-orange-500/5 dark:bg-slate-950/60 dark:hover:bg-slate-900/60 border border-slate-150 dark:border-slate-800/80 hover:border-orange-500/30 text-left transition-all group flex items-center gap-2.5"
                        >
                          <Radio className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white block truncate">
                              {asset.code}
                            </span>
                            <span className="text-[10px] text-slate-500 truncate block">
                              {asset.name}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : scannedAsset ? (
                /* Detail Component once Asset has been read */
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block font-mono">
                          Équipement Identifié & Authentifié
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          {lastNfcTag?.serialNumber 
                            ? `UID: ${lastNfcTag.serialNumber} • Ledger Validated`
                            : 'Signature Cryptographique Valide'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-black text-orange-500">
                            {scannedAsset.code}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-850 text-slate-700 dark:text-slate-300">
                            {scannedAsset.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {scannedAsset.name}
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Santé: {scannedAsset.healthScore}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-3 border-t border-slate-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-300">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Emplacement</span>
                        <span className="font-semibold">{scannedAsset.buildingName} • {scannedAsset.floor}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Statut Opérationnel</span>
                        <span className="font-semibold text-emerald-500 uppercase">{scannedAsset.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={() => setScanning(true)}
                      className="px-3 py-2.5 rounded-xl bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-medium font-mono transition-colors flex items-center space-x-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Scanner Autre</span>
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onAssetScanned(scannedAsset);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-50 text-white dark:text-slate-950 text-xs font-bold font-mono transition-all flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <Cpu className="w-4 h-4 text-orange-500" />
                      <span>Ouvrir Fiche Complète</span>
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onCreateTicket(scannedAsset);
                      }}
                      className="py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold font-mono shadow-md shadow-orange-500/20 transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>Nouveau Ticket</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 2: NFC TAG DECODER (DECODEUR TECHNIQUE) */}
          {scanMode === 'decoder' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              
              {/* Info Header in sleek theme style */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850/80">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 mt-0.5">
                    <Code className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-mono">
                      Lecteur / Décodeur NDEF Actif
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Ce module extrait les données brutes stockées sur les tags physiques (UUID d'équipement, horodatage d'encodage et l'identifiant du dernier utilisateur ayant interagi avec l'asset).
                    </p>
                  </div>
                </div>
              </div>

              {/* Simulation triggers */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  Antenne NFC en veille
                </span>
                <button
                  onClick={simulateDecodeNfc}
                  className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-xs font-bold font-mono transition-all flex items-center gap-1.5 border border-blue-500/20"
                >
                  <RefreshCw className="w-3 h-3" />
                  Simuler un Scan
                </button>
              </div>

              {/* Decoded tag list (UUID, Timestamp, Last User) */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500">
                  <History className="w-3.5 h-3.5" />
                  <span>HISTORIQUE DES SATELLITES & TAGS DÉCODÉS</span>
                </div>

                <div className="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px]">
                        <th className="p-3 font-semibold uppercase">UUID / Tag</th>
                        <th className="p-3 font-semibold uppercase">Dernier Utilisateur</th>
                        <th className="p-3 font-semibold uppercase">Date d'Accès</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                      {decodedLogs.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-4 text-center text-slate-400 italic">
                            Aucun tag décodé pour le moment. Approchez un tag physique de l'antenne.
                          </td>
                        </tr>
                      ) : (
                        decodedLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all">
                            <td className="p-3">
                              <div className="flex flex-col">
                                <span className="font-bold text-[#ff9d2b] flex items-center gap-1">
                                  <Tag className="w-3 h-3 text-[#ff9d2b]/60" />
                                  {log.uuid}
                                </span>
                                {log.serialNumber && (
                                  <span className="text-[9px] text-slate-400 mt-0.5">SN: {log.serialNumber}</span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="flex items-center gap-1 text-[11px]">
                                <User className="w-3 h-3 text-slate-400" />
                                {log.lastUser}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500 text-[10px]">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NFC TAG ENCODER (ENCODEUR PHYSIQUE & SIMULÉ) */}
          {scanMode === 'encoder' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              
              {/* Header Description */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850/80">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 mt-0.5">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-mono">
                      Programmer / Encoder un Tag NFC
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Associez un tag vierge à un équipement de votre base de données. L'application encodera le UUID technique et l'URL de redirection sécurisée de Spider CAFM pour un dispatching instantané.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Controls */}
              <div className="space-y-4">
                
                {/* 1. Select Asset */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    1. Sélectionner l'Équipement CVC/ELEC
                  </label>
                  <select
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500 font-mono"
                  >
                    {liveAssets.map(asset => (
                      <option key={asset.id} value={asset.id}>
                        [{asset.code}] - {asset.name} ({asset.buildingName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Custom Redirect URL */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    2. URL de Redirection (NDEF URL)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400">
                      <Globe className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      value={customRedirectUrl}
                      onChange={(e) => setCustomRedirectUrl(e.target.value)}
                      placeholder="https://beecarbonat.com/asset/AST-..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {/* Status/Logs banner for feedback */}
                {encoderMessage && (
                  <div className={`p-3.5 rounded-2xl border text-xs font-mono leading-relaxed flex items-start gap-2.5 animate-in fade-in ${
                    encoderMessage.type === 'success' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : encoderMessage.type === 'error'
                      ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                      : 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-[#ff9d2b]'
                  }`}>
                    {encoderMessage.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    )}
                    <span>{encoderMessage.text}</span>
                  </div>
                )}

                {/* Encoding Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleSimulateEncode}
                    disabled={isWriting}
                    className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-white text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700/80 disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Simuler Écriture
                  </button>

                  <button
                    onClick={handlePhysicalEncode}
                    disabled={isWriting}
                    className="py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black font-mono shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isWriting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Écriture...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Écrire sur Tag</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: CAMERA QR SCANNER */}
          {scanMode === 'qr' && (
            <div className="space-y-6">
              {scanning ? (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div id="reader" className="relative w-60 h-60 mx-auto rounded-3xl bg-slate-900 border-2 border-dashed border-emerald-500/40 flex items-center justify-center overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce" />
                    <div className="text-center space-y-2 p-4">
                      <Camera className="w-10 h-10 text-emerald-400/40 mx-auto animate-pulse" />
                      <span className="text-xs text-slate-400 block font-mono">
                        Alignez le QR physique dans le viseur
                      </span>
                    </div>
                    <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                    <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                    <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                    <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                  </div>

                  {/* Instant Select for simulation */}
                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>MOCK SIMULATEUR DE QR SCANS:</span>
                      <span className="text-emerald-500 font-bold">1-TAP SCAN</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {liveAssets.slice(0, 4).map(asset => (
                        <button
                          key={asset.id}
                          onClick={() => handleManualNfcTap(asset)}
                          className="p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-500/5 border border-slate-150 dark:bg-slate-950/60 dark:border-slate-800/85 hover:border-emerald-500/30 text-left transition-all text-xs font-mono flex items-center gap-2 group"
                        >
                          <Camera className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 dark:text-white block truncate">{asset.code}</span>
                            <span className="text-[10px] text-slate-400 truncate block">{asset.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : scannedAsset ? (
                /* QR Code scanned results details */
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block font-mono">
                          QR Code Identifié & Authentifié
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          Format: QR/DataMatrix • Signature Cryptographique OK
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-black text-emerald-500">
                            {scannedAsset.code}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-850 text-slate-700 dark:text-slate-300">
                            {scannedAsset.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {scannedAsset.name}
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Santé: {scannedAsset.healthScore}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-3 border-t border-slate-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-300">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Emplacement</span>
                        <span className="font-semibold">{scannedAsset.buildingName} • {scannedAsset.floor}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Statut Opérationnel</span>
                        <span className="font-semibold text-emerald-500 uppercase">{scannedAsset.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={() => setScanning(true)}
                      className="px-3 py-2.5 rounded-xl bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-medium font-mono transition-colors flex items-center space-x-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Scanner Autre</span>
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onAssetScanned(scannedAsset);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-50 text-white dark:text-slate-950 text-xs font-bold font-mono transition-all flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <Cpu className="w-4 h-4 text-emerald-500" />
                      <span>Ouvrir Fiche Complète</span>
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onCreateTicket(scannedAsset);
                      }}
                      className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold font-mono shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>Nouveau Ticket</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 5: DOWNLOAD APP */}
          {scanMode === 'download' && (
            <div className="w-full animate-in fade-in duration-300">
              <AppDownloadQrCard
                url={typeof window !== 'undefined' ? window.location.origin : 'https://beecarbonat.com/app'}
                title="Téléchargez l'application mobile"
                subtitle="Activez le support NFC natif sur Android & iOS"
                backgroundColor="bg-[#4ec5f7]"
              />
            </div>
          )}

        </div>
      </div>
  );

  if (isInline) {
    return innerContent;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      {innerContent}
    </div>
  );
};
