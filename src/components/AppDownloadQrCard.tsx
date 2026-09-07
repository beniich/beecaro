import React, { useState, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Download, Copy, Check, Smartphone, ExternalLink, Sparkles, X } from 'lucide-react';

interface AppDownloadQrCardProps {
  /** The URL or deep link to encode into the QR code */
  url?: string;
  /** Title text displayed underneath */
  title?: string;
  /** Subtitle or helper description */
  subtitle?: string;
  /** Background color (default sky blue like in the reference image) */
  backgroundColor?: string;
  /** Center logo image URL or SVG data URL */
  logoUrl?: string;
  /** Optional callback to close if used inside a modal */
  onClose?: () => void;
}

export const AppDownloadQrCard: React.FC<AppDownloadQrCardProps> = ({
  url = typeof window !== 'undefined' ? window.location.origin : 'https://beecarbonat.com/app',
  title = "Téléchargez l'application",
  subtitle = "Scannez avec l'appareil photo de votre smartphone",
  backgroundColor = "bg-[#4ec5f7]",
  logoUrl,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeLogo, setActiveLogo] = useState<'app' | 'paypal' | 'none'>('app');
  const qrCanvasRef = useRef<HTMLDivElement>(null);

  // High-res SVG for centered PayPal / App logo
  const defaultAppLogo = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%230f172a'/><path d='M30 50 L50 25 L70 50 L50 75 Z' fill='%23f97316'/><circle cx='50' cy='50' r='12' fill='%23ffffff'/></svg>";
  
  // Stylized double-P icon like in the screenshot
  const paypalLogo = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'><rect width='100' height='100' rx='22' fill='%23ffffff'/><path d='M35 25h24c8.5 0 15 5.5 13.5 14.5-1.5 8.5-8.5 14.5-17 14.5H43l-4 22H27l8-51z' fill='%23003087'/><path d='M43 37h22c8 0 14 5 12.5 13.5-1.5 8-8 13.5-16 13.5H49.5l-3.5 19H34l6.5-46h2.5z' fill='%230079C1' style='mix-blend-mode:multiply'/></svg>";

  const selectedLogo = logoUrl 
    ? logoUrl 
    : activeLogo === 'paypal' 
      ? paypalLogo 
      : activeLogo === 'app' 
        ? defaultAppLogo 
        : undefined;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPng = () => {
    const canvas = qrCanvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    
    // Create an upscale high-res canvas with sky-blue card background
    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');
    const width = 800;
    const height = 1000;
    exportCanvas.width = width;
    exportCanvas.height = height;

    if (ctx) {
      // Sky blue background
      ctx.fillStyle = '#4ec5f7';
      ctx.fillRect(0, 0, width, height);

      // White card with rounded corners
      const cardX = 120;
      const cardY = 120;
      const cardW = 560;
      const cardH = 560;
      const radius = 60;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, radius);
      ctx.fill();

      // Draw QR code centered in the white card
      const qrPadding = 60;
      ctx.drawImage(canvas, cardX + qrPadding, cardY + qrPadding, cardW - qrPadding * 2, cardH - qrPadding * 2);

      // Draw Title text
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 44px Inter, system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, width / 2, 780);

      // Subtitle
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.font = '500 24px Inter, system-ui, -apple-system, sans-serif';
      ctx.fillText(subtitle, width / 2, 830);

      // Trigger download
      const link = document.createElement('a');
      link.download = 'telecharger-application-qr.png';
      link.href = exportCanvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[520px] p-6 sm:p-10 font-sans">
      {/* Background container matching the vibrant cyan/blue in screenshot */}
      <div className={`w-full max-w-sm sm:max-w-md ${backgroundColor} rounded-3xl p-8 sm:p-10 flex flex-col items-center shadow-2xl relative overflow-hidden transition-all`}>
        
        {/* Close button if inside modal */}
        {onClose && (
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-black transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Ambient subtle light glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none" />

        {/* White Rounded Card with QR Code */}
        <div className="bg-white rounded-[32px] sm:rounded-[38px] p-6 sm:p-7 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.18)] flex items-center justify-center transition-transform hover:scale-[1.02] duration-300">
          <div className="relative">
            <QRCodeSVG
              value={url}
              size={230}
              level="H"
              includeMargin={false}
              fgColor="#000000"
              bgColor="#ffffff"
              imageSettings={selectedLogo ? {
                src: selectedLogo,
                x: undefined,
                y: undefined,
                height: 48,
                width: 48,
                opacity: 1,
                excavate: true,
              } : undefined}
            />
          </div>
        </div>

        {/* Hidden canvas for high-res PNG export */}
        <div className="hidden" ref={qrCanvasRef}>
          <QRCodeCanvas
            value={url}
            size={1000}
            level="H"
            includeMargin={false}
            imageSettings={selectedLogo ? {
              src: selectedLogo,
              height: 220,
              width: 220,
              excavate: true,
            } : undefined}
          />
        </div>

        {/* Bold Title Text (Exact match from the screenshot) */}
        <h2 className="mt-8 text-black text-2xl sm:text-3xl font-black tracking-tight text-center leading-tight">
          {title}
        </h2>

        {/* Subtitle / scan instructions */}
        <p className="mt-2 text-black/75 text-sm sm:text-base font-medium text-center max-w-xs">
          {subtitle}
        </p>

        {/* Quick Actions Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 w-full">
          <button
            onClick={handleDownloadPng}
            className="flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-neutral-900 text-white rounded-xl text-xs font-bold font-mono shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>TÉLÉCHARGER PNG</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/90 hover:bg-white text-black rounded-xl text-xs font-bold font-mono shadow-sm transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>LIEN COPIÉ !</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-700" />
                <span>COPIER LIEN</span>
              </>
            )}
          </button>
        </div>

        {/* Logo Selector Pill (App vs PayPal icon) */}
        <div className="mt-5 pt-4 border-t border-black/10 flex items-center justify-center gap-2 text-[11px] font-mono text-black/70">
          <span>Logo central :</span>
          <button
            onClick={() => setActiveLogo('app')}
            className={`px-2 py-0.5 rounded-md font-bold transition-all ${activeLogo === 'app' ? 'bg-black text-white' : 'bg-black/10 hover:bg-black/20 text-black'}`}
          >
            App
          </button>
          <button
            onClick={() => setActiveLogo('paypal')}
            className={`px-2 py-0.5 rounded-md font-bold transition-all ${activeLogo === 'paypal' ? 'bg-black text-white' : 'bg-black/10 hover:bg-black/20 text-black'}`}
          >
            P Icon (Screenshot)
          </button>
          <button
            onClick={() => setActiveLogo('none')}
            className={`px-2 py-0.5 rounded-md font-bold transition-all ${activeLogo === 'none' ? 'bg-black text-white' : 'bg-black/10 hover:bg-black/20 text-black'}`}
          >
            Sans
          </button>
        </div>
      </div>
    </div>
  );
};
