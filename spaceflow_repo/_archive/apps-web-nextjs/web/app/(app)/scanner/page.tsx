"use client";

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useRouter } from 'next/navigation';
import { Camera, AlertTriangle, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    let scanner: Html5QrcodeScanner | null = null;
    
    try {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          setScanResult(decodedText);
          scanner?.clear();
          
          // Simulation of routing to the asset
          // Assuming decodedText is an asset ID
          // router.push(`/assets?search=${decodedText}`);
          setTimeout(() => {
            router.push('/assets');
          }, 2000);
        },
        (errorMessage) => {
          // just ignore typical scan errors (like 'no QR found in this frame')
        }
      );
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de l'initialisation de la caméra.");
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error(e));
      }
    };
  }, [router]);

  return (
    <div className="relative min-h-full bg-zinc-950 text-zinc-100 font-sans p-6 lg:p-8 flex flex-col items-center justify-center max-w-[1600px] mx-auto w-full">
      <div className="w-full max-w-lg bg-zinc-900/80 border border-zinc-800/60 shadow-2xl rounded-xl overflow-hidden flex flex-col">
        
        <div className="p-6 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight font-display uppercase text-zinc-50 flex items-center gap-3">
            Scanner QR
          </h1>
          <Camera className="w-5 h-5 text-brand-cyan" />
        </div>

        <div className="p-6 flex flex-col items-center gap-6">
          {error ? (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 w-full">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          ) : scanResult ? (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-8 rounded-xl flex flex-col items-center gap-4 w-full animate-in zoom-in duration-300">
              <CheckCircle2 className="w-12 h-12" />
              <div className="text-center">
                <div className="text-xs uppercase tracking-widest font-mono mb-1">Code Détecté</div>
                <div className="font-mono text-lg text-green-300 bg-green-950/50 px-4 py-2 rounded-lg border border-green-900/50">
                  {scanResult}
                </div>
              </div>
              <p className="text-sm text-green-500/80 mt-2">Redirection en cours...</p>
            </div>
          ) : (
            <div className="w-full relative">
              <div id="reader" className="w-full overflow-hidden rounded-xl bg-black border-2 border-dashed border-zinc-700"></div>
              
              <style jsx global>{`
                /* Overriding html5-qrcode default ugly styles */
                #reader__scan_region {
                  background: #000 !important;
                }
                #reader__dashboard_section_csr button {
                  background-color: #f38020 !important;
                  color: black !important;
                  border: none !important;
                  padding: 8px 16px !important;
                  border-radius: 4px !important;
                  font-family: monospace !important;
                  font-weight: bold !important;
                  text-transform: uppercase !important;
                  cursor: pointer;
                  margin-top: 10px;
                }
                #reader__dashboard_section_csr button:hover {
                  background-color: #ea580c !important;
                }
                #reader__dashboard_section_swaplink {
                  color: #00dbe7 !important;
                  text-decoration: none !important;
                  font-family: monospace !important;
                }
              `}</style>
            </div>
          )}

          {!scanResult && !error && (
            <p className="text-xs text-zinc-500 text-center">
              Pointez la caméra vers un QR Code d'équipement BEECARBONIT pour afficher ses détails ou démarrer une intervention.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
