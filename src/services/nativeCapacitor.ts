import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { App } from '@capacitor/app';

/**
 * Native Android / Capacitor integration service
 * Safely executes native device features on Android while remaining a no-op on Web/PWA
 */
export const NativeDevice = {
  /**
   * Check if running inside native Android wrapper
   */
  isNative(): boolean {
    return Capacitor.isNativePlatform();
  },

  getPlatform(): string {
    return Capacitor.getPlatform();
  },

  /**
   * Initialize native Android UI settings (Status Bar, Back Button handler)
   */
  async initializeApp(onBackPress?: () => boolean): Promise<void> {
    if (!this.isNative()) return;

    try {
      // Configure dark status bar to match dark theme
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#0f172a' });
      await StatusBar.setOverlaysWebView({ overlay: false });
    } catch (e) {
      console.warn('Native StatusBar init error:', e);
    }

    try {
      // Handle Android hardware back button
      App.addListener('backButton', ({ canGoBack }) => {
        if (onBackPress && onBackPress()) {
          // Handled custom back action
          return;
        }
        if (canGoBack) {
          window.history.back();
        } else {
          App.exitApp();
        }
      });
    } catch (e) {
      console.warn('Native App backButton listener error:', e);
    }
  },

  /**
   * Trigger light haptic vibration on tactile touch (e.g. 3D element selection)
   */
  async hapticSelection(): Promise<void> {
    if (!this.isNative()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Silent catch
    }
  },

  /**
   * Trigger medium haptic vibration on alert / status change
   */
  async hapticWarning(): Promise<void> {
    if (!this.isNative()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      // Silent catch
    }
  }
};
