import qz from 'qz-tray';

interface QzTrayConfig {
  host: string;
  port: number;
  useCertificate: boolean;
  certificateData?: string;
}

/**
 * Connect to QZ Tray using the provided config or server settings.
 */
export const connectToQz = async (config?: QzTrayConfig): Promise<void> => {
  if (!qz.websocket.isActive()) {
    try {
      const options: Record<string, unknown> = {};

      if (config) {
        if (config.host && config.host !== 'localhost' && config.host !== '127.0.0.1') {
          options.host = config.host;
        }
        if (config.port && config.port !== 8181) {
          options.port = config.port;
        }
      }

      if (Object.keys(options).length > 0) {
        await qz.websocket.connect(options);
      } else {
        await qz.websocket.connect();
      }
    } catch (err: any) {
      if (err?.message !== 'Already connected') {
        throw err;
      }
    }
  }
};

export const disconnectFromQz = async (): Promise<void> => {
  if (qz.websocket.isActive()) {
    await qz.websocket.disconnect();
  }
};

/**
 * List available printers via QZ Tray.
 */
export const listPrinters = async (config?: QzTrayConfig): Promise<string[]> => {
  await connectToQz(config);
  const printers = await qz.printers.find();
  return Array.isArray(printers) ? printers : (printers ? [printers as string] : []);
};

/**
 * Print ZPL content to a specified printer via QZ Tray.
 */
export const printZpl = async (printerName: string, zplContent: string, config?: QzTrayConfig): Promise<void> => {
  await connectToQz(config);
  const qzConfig = qz.configs.create(printerName);
  const data = [zplContent];
  await qz.print(qzConfig, data);
};

/**
 * Test QZ Tray connection — returns true if reachable.
 */
export const testQzConnection = async (config: QzTrayConfig): Promise<{ success: boolean; error?: string }> => {
  try {
    await connectToQz(config);
    const isActive = qz.websocket.isActive();
    // Disconnect after test
    await disconnectFromQz();
    return { success: isActive };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Verbindung fehlgeschlagen' };
  }
};

/**
 * Fetch QZ Tray config from server settings.
 */
export const fetchQzConfig = async (): Promise<QzTrayConfig | null> => {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) return null;
    const settings = await res.json();
    if (!settings.qzTray?.enabled) return null;
    return {
      host: settings.qzTray.host,
      port: settings.qzTray.port,
      useCertificate: settings.qzTray.useCertificate,
      certificateData: settings.qzTray.certificateData,
    };
  } catch {
    return null;
  }
};
