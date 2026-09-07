import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Download, AlertTriangle, PenTool, Check, Copy, Settings, ArrowRight, ExternalLink, QrCode } from 'lucide-react';

export interface ComplaintQrGeneratorProps {
  lang?: 'fr' | 'en';
  initialTargetType?: 'general' | 'space' | 'asset';
  initialTargetName?: string;
  initialTargetId?: string;
  showControls?: boolean;
  compact?: boolean;
}

export const ComplaintQrGenerator: React.FC<ComplaintQrGeneratorProps> = ({ 
  lang = 'fr',
  initialTargetType = 'space',
  initialTargetName = 'Salle de Réunion A',
  initialTargetId = 'ESP-001',
  showControls = true,
  compact = false
}) => {
  const [targetType, setTargetType] = useState<'general' | 'space' | 'asset'>(initialTargetType);
  const [targetName, setTargetName] = useState(initialTargetName);
  const [targetId, setTargetId] = useState(initialTargetId);
  const [copied, setCopied] = useState(false);
  const qrCanvasRef = useRef<HTMLDivElement>(null);

  // Sync state if props change (e.g. selecting different assets in modal)
  useEffect(() => {
    setTargetType(initialTargetType);
    setTargetName(initialTargetName);
    setTargetId(initialTargetId);
  }, [initialTargetType, initialTargetName, initialTargetId]);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://beecarbonat.com/app';
  const generatedUrl = `${baseUrl}/report-issue?type=${targetType}&id=${encodeURIComponent(targetId)}`;

  // Use a warning/alert styled logo for the QR
  const alertLogo = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23ef4444'/><path d='M50 15 L15 85 L85 85 Z' fill='%23ffffff'/><rect x='46' y='40' width='8' height='25' fill='%23ef4444'/><circle cx='50' cy='75' r='5' fill='%23ef4444'/></svg>";

  const titleText = lang === 'fr' ? 'Signaler un problème' : 'Report an Issue';
  const subtitleText = targetType === 'general' 
    ? (lang === 'fr' ? 'Scannez pour ouvrir un ticket' : 'Scan to open a ticket')
    : (lang === 'fr' ? `Lieu/Équipement concerné :\n${targetName}` : `Location/Asset:\n${targetName}`);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPng = () => {
    const canvas = qrCanvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    
    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');
    const width = 800;
    const height = 1000;
    exportCanvas.width = width;
    exportCanvas.height = height;

    if (ctx) {
      // Background (Red/Orange alert color)
      ctx.fillStyle = '#ef4444'; 
      ctx.fillRect(0, 0, width, height);

      // White card
      const cardX = 120;
      const cardY = 120;
      const cardW = 560;
      const cardH = 560;
      const radius = 60;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, radius);
      ctx.fill();

      // QR Code
      const qrPadding = 60;
      ctx.drawImage(canvas, cardX + qrPadding, cardY + qrPadding, cardW - qrPadding * 2, cardH - qrPadding * 2);

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(titleText, width / 2, 780);

      // Subtitle
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = '500 28px Inter, system-ui, sans-serif';
      if (subtitleText.includes('\n')) {
        const lines = subtitleText.split('\n');
        ctx.fillText(lines[0], width / 2, 840);
        ctx.font = 'bold 34px Inter, system-ui, sans-serif';
        ctx.fillText(lines[1], width / 2, 890);
      } else {
        ctx.fillText(subtitleText, width / 2, 840);
      }

      const link = document.createElement('a');
      link.download = `qr-reclamation-${targetId}.png`;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();
    }
  };

  if (compact) {
    return (
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-black dark:text-white block">
                {lang === 'fr' ? 'QR Code Réclamation Occupant' : 'Occupant Complaint QR Tag'}
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {lang === 'fr' ? 'Scannable directement par smartphone' : 'Directly scannable via smartphone camera'}
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadPng}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 text-[11px] font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PNG</span>
          </button>
        </div>

        <div className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <div className="w-20 h-20 bg-white rounded-lg p-1.5 flex items-center justify-center flex-shrink-0 shadow-sm">
            <QRCodeSVG
              value={generatedUrl}
              size={72}
              level="H"
              includeMargin={false}
              fgColor="#000000"
              bgColor="#ffffff"
              imageSettings={{
                src: alertLogo,
                height: 18,
                width: 18,
                opacity: 1,
                excavate: true,
              }}
            />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate">
              <span className="text-slate-400 font-sans mr-1">{lang === 'fr' ? 'Cible :' : 'Target:'}</span>
              <strong>{targetName}</strong> ({targetId})
            </div>
            <div className="flex items-center gap-1.5">
              <input 
                type="text"
                readOnly
                value={generatedUrl}
                className="text-[10px] font-mono bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 flex-1 text-slate-500 truncate select-all"
              />
              <button
                onClick={handleCopyLink}
                title={lang === 'fr' ? 'Copier le lien' : 'Copy link'}
                className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Hidden canvas for high-res rendering */}
        <div className="hidden" ref={qrCanvasRef}>
          <QRCodeCanvas
            value={generatedUrl}
            size={1000}
            level="H"
            includeMargin={false}
            imageSettings={{
              src: alertLogo,
              height: 220,
              width: 220,
              excavate: true,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center h-full">
      {/* Settings Panel */}
      {showControls && (
        <div className="w-full lg:w-1/3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
            <Settings className="w-5 h-5 text-red-500" />
            {lang === 'fr' ? 'Configuration du QR Code' : 'QR Code Settings'}
          </h3>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {lang === 'fr' ? 'Type de cible' : 'Target Type'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'general', label: lang === 'fr' ? 'Général' : 'General' },
                  { id: 'space', label: lang === 'fr' ? 'Espace' : 'Space' },
                  { id: 'asset', label: lang === 'fr' ? 'Équipement' : 'Asset' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTargetType(t.id as any)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl transition-all border ${
                      targetType === t.id
                        ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30'
                        : 'bg-transparent text-slate-600 border-slate-200 hover:border-slate-300 dark:text-slate-400 dark:border-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {targetType !== 'general' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {lang === 'fr' ? 'Nom affiché' : 'Display Name'}
                  </label>
                  <input
                    type="text"
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500 transition-colors"
                    placeholder={targetType === 'space' ? 'ex: Toilettes RDC' : 'ex: Imprimante A4'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {lang === 'fr' ? 'Identifiant Unique (ID)' : 'Unique ID'}
                  </label>
                  <input
                    type="text"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:border-red-500 transition-colors"
                    placeholder="ex: LOC-012"
                  />
                </div>
              </>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {lang === 'fr' ? 'Lien généré' : 'Generated Link'}
              </label>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 font-mono truncate flex-1 px-2 select-all">
                  {generatedUrl}
                </span>
                <button 
                  onClick={handleCopyLink}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Preview Panel */}
      <div className={`w-full ${showControls ? 'lg:w-2/3' : 'max-w-md mx-auto'} flex justify-center`}>
        <div className="bg-red-500 rounded-3xl p-8 sm:p-12 shadow-xl shadow-red-500/20 relative flex flex-col items-center overflow-hidden max-w-md w-full">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

          {/* QR Code White Card */}
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-2xl relative z-10 w-full aspect-square flex items-center justify-center">
            <QRCodeSVG
              value={generatedUrl}
              size={240}
              level="H"
              includeMargin={false}
              fgColor="#000000"
              bgColor="#ffffff"
              style={{ width: '100%', height: '100%' }}
              imageSettings={{
                src: alertLogo,
                height: 56,
                width: 56,
                opacity: 1,
                excavate: true,
              }}
            />
          </div>

          <div className="hidden" ref={qrCanvasRef}>
            <QRCodeCanvas
              value={generatedUrl}
              size={1000}
              level="H"
              includeMargin={false}
              imageSettings={{
                src: alertLogo,
                height: 220,
                width: 220,
                excavate: true,
              }}
            />
          </div>

          {/* Text Content */}
          <div className="relative z-10 mt-8 text-center w-full">
            <div className="flex items-center justify-center gap-2 mb-2 text-white">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                {titleText}
              </h2>
            </div>
            {targetType !== 'general' && (
              <div className="mt-4 bg-black/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                <p className="text-white/80 text-xs sm:text-sm font-medium uppercase tracking-wider mb-1">
                  {lang === 'fr' ? 'Lieu / Équipement concerné' : 'Location / Asset'}
                </p>
                <p className="text-white text-lg sm:text-xl font-bold truncate">
                  {targetName}
                </p>
              </div>
            )}
            {targetType === 'general' && (
              <p className="mt-4 text-white/90 font-medium">
                {subtitleText}
              </p>
            )}
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownloadPng}
            className="mt-8 relative z-10 w-full flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-slate-50 text-red-600 rounded-2xl font-bold font-mono shadow-xl transition-transform active:scale-95"
          >
            <Download className="w-5 h-5" />
            <span>{lang === 'fr' ? 'TÉLÉCHARGER LE QR CODE (PNG)' : 'DOWNLOAD QR CODE (PNG)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
