/**
 * Web NFC Service for Mobile Browsers
 * Supports reading standard physical NDEF NFC tags on technical assets
 * (HVAC, Heat Pumps, Chillers, Electrical Panels, IoT Sensors).
 */

import { Asset } from '../types';

export interface NfcReadResult {
  serialNumber?: string;
  tagData?: string;
  matchedAsset?: Asset;
  rawPayload?: any;
  timestamp: Date;
}

export class NfcService {
  /**
   * Check if Web NFC API (NDEFReader) is available on the current browser/device.
   */
  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'NDEFReader' in window;
  }

  /**
   * Parse an NDEF record into a clean string representation.
   */
  public static parseNdefRecord(record: any): string {
    if (!record) return '';

    try {
      if (record.recordType === 'text') {
        const textDecoder = new TextDecoder(record.encoding || 'utf-8');
        return textDecoder.decode(record.data);
      }
      
      if (record.recordType === 'url' || record.recordType === 'uri') {
        const textDecoder = new TextDecoder();
        return textDecoder.decode(record.data);
      }

      if (record.data) {
        const textDecoder = new TextDecoder();
        return textDecoder.decode(record.data);
      }
    } catch (err) {
      console.warn('Could not decode NDEF record:', err);
    }

    return '';
  }

  /**
   * Match an extracted NFC tag payload or serial number to an asset in the database.
   */
  public static findAssetMatch(rawText: string, serialNumber: string | undefined, assets: Asset[]): Asset | null {
    if (!assets || assets.length === 0) return null;

    const query = rawText.trim().toLowerCase();
    const serial = (serialNumber || '').trim().toLowerCase();

    // 1. Direct code match (e.g. "AST-101", "AST-HVAC-01")
    let match = assets.find(a => a.code.toLowerCase() === query || query.includes(a.code.toLowerCase()));
    if (match) return match;

    // 2. Direct ID match
    match = assets.find(a => a.id.toLowerCase() === query || query.includes(a.id.toLowerCase()));
    if (match) return match;

    // 3. Serial Number match (if asset has a serial or matching tag)
    if (serial) {
      match = assets.find(a => (a as any).serialNumber?.toLowerCase() === serial || a.id.toLowerCase().includes(serial));
      if (match) return match;
    }

    // 4. Match URL path params (e.g. "https://app.example.com/asset/AST-102")
    const urlMatches = rawText.match(/asset[s]?\/([A-Za-z0-9-_]+)/i);
    if (urlMatches && urlMatches[1]) {
      const assetKey = urlMatches[1].toLowerCase();
      match = assets.find(a => a.code.toLowerCase() === assetKey || a.id.toLowerCase() === assetKey);
      if (match) return match;
    }

    // 5. JSON payload (e.g. {"code": "AST-103"})
    try {
      if (query.startsWith('{') && query.endsWith('}')) {
        const parsed = JSON.parse(rawText);
        if (parsed.code || parsed.id) {
          const target = (parsed.code || parsed.id).toLowerCase();
          match = assets.find(a => a.code.toLowerCase() === target || a.id.toLowerCase() === target);
          if (match) return match;
        }
      }
    } catch {
      // Not JSON
    }

    // 6. Substring name match
    match = assets.find(a => a.name.toLowerCase().includes(query) || query.includes(a.name.toLowerCase()));
    return match || null;
  }

  /**
   * Start listening for physical NFC tag taps using Web NFC.
   */
  public static async startReading(
    assets: Asset[],
    onSuccess: (result: NfcReadResult) => void,
    onError: (error: string) => void,
    signal?: AbortSignal
  ): Promise<any> {
    if (!this.isSupported()) {
      onError('Web NFC non supporté sur ce navigateur. Utilisez Chrome/Edge sur Android ou le simulateur de tag.');
      return null;
    }

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan({ signal });

      ndef.onreading = (event: any) => {
        // Trigger haptic feedback on mobile if supported
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([50, 30, 80]);
        }

        const serialNumber = event.serialNumber;
        let payloadText = '';

        if (event.message && event.message.records && event.message.records.length > 0) {
          for (const record of event.message.records) {
            const decoded = NfcService.parseNdefRecord(record);
            if (decoded) {
              payloadText += (payloadText ? ' | ' : '') + decoded;
            }
          }
        }

        const matchedAsset = NfcService.findAssetMatch(payloadText, serialNumber, assets);

        onSuccess({
          serialNumber,
          tagData: payloadText || serialNumber || 'NFC-TAG-READ',
          matchedAsset: matchedAsset || undefined,
          rawPayload: event,
          timestamp: new Date()
        });
      };

      ndef.onreadingerror = () => {
        onError('Erreur de lecture du tag NFC physique. Veuillez repositionner le tag.');
      };

      return ndef;
    } catch (err: any) {
      console.error('NFC scan startup failed:', err);
      let errMsg = 'Impossible de démarrer le lecteur NFC.';
      if (err.name === 'NotAllowedError') {
        errMsg = 'Permission NFC refusée. Veuillez autoriser l\'accès NFC dans votre navigateur.';
      } else if (err.name === 'NotSupportedError') {
        errMsg = 'Puce NFC désactivée ou non supportée sur cet appareil.';
      }
      onError(errMsg);
      return null;
    }
  }

  /**
   * Write asset details (UUID and Redirection URL) to a physical NFC tag.
   */
  public static async writeTag(
    payload: { uuid: string; url: string },
    onSuccess: () => void,
    onError: (error: string) => void,
    signal?: AbortSignal
  ): Promise<void> {
    if (!this.isSupported()) {
      onError('Web NFC non supporté sur ce navigateur.');
      return;
    }

    try {
      const ndef = new (window as any).NDEFReader();
      const textEncoder = new TextEncoder();

      // Write standard NDEF record types:
      // 1. Text record with the asset ID / UUID
      // 2. URL record with the redirection link
      const records = [
        {
          recordType: 'text',
          data: textEncoder.encode(payload.uuid)
        },
        {
          recordType: 'url',
          data: textEncoder.encode(payload.url)
        }
      ];

      await ndef.write({ records }, { signal });

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      onSuccess();
    } catch (err: any) {
      console.error('NFC writing failed:', err);
      let errMsg = "Échec de l'écriture sur le tag NFC.";
      if (err.name === 'NotAllowedError') {
        errMsg = 'Permission NFC refusée ou non accordée.';
      } else if (err.name === 'NotSupportedError') {
        errMsg = 'Puce NFC désactivée ou non supportée.';
      } else if (err.message) {
        errMsg = `Erreur d'écriture: ${err.message}`;
      }
      onError(errMsg);
    }
  }
}
