'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

const DEMO_USERS = [
  { email: 'admin@kitting-suite.local', password: 'admin', label: 'Admin', role: 'Administrator' },
  { email: 'supervisor@kitting-suite.local', password: 'supervisor', label: 'Supervisor', role: 'Supervisor' },
  { email: 'worker@kitting-suite.local', password: 'worker', label: 'Mitarbeiter', role: 'Standard' },
];

type LoginMode = 'credentials' | 'qrcode';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // QR Scanner state
  const [scannerActive, setScannerActive] = useState(false);
  const [scanError, setScanError] = useState('');
  const [scanSuccess, setScanSuccess] = useState(false);
  const scannerRef = useRef<any>(null);
  const scannerContainerId = 'qr-scanner-container';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(email, password);
    if (success) {
      router.push('/');
    } else {
      setError('Ungültige Anmeldedaten oder Konto deaktiviert.');
    }
    setIsLoading(false);
  };

  const handleQuickLogin = async (demoEmail: string, demoPassword: string) => {
    setError('');
    setIsLoading(true);
    const success = await login(demoEmail, demoPassword);
    if (success) {
      router.push('/');
    } else {
      setError('Login fehlgeschlagen.');
    }
    setIsLoading(false);
  };

  /**
   * QR code format expected:
   * JSON: { "email": "...", "password": "..." }
   * or Base64-encoded version of the above
   */
  const handleQrResult = useCallback(async (decodedText: string) => {
    // Stop scanner immediately to prevent double-scan
    stopScanner();
    setScanError('');
    setIsLoading(true);

    try {
      let credentials: { email: string; password: string };

      // Try to parse directly as JSON
      try {
        credentials = JSON.parse(decodedText);
      } catch {
        // Try base64 decode
        try {
          const decoded = atob(decodedText);
          credentials = JSON.parse(decoded);
        } catch {
          throw new Error('QR-Code-Format nicht erkannt. Erwartet: JSON mit email und password.');
        }
      }

      if (!credentials.email || !credentials.password) {
        throw new Error('QR-Code enthält keine gültigen Anmeldedaten (email/password fehlt).');
      }

      const success = await login(credentials.email, credentials.password);
      if (success) {
        setScanSuccess(true);
        setTimeout(() => router.push('/'), 800);
      } else {
        setScanError('Ungültige Anmeldedaten im QR-Code.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setScanError(err.message || 'QR-Code konnte nicht verarbeitet werden.');
      setIsLoading(false);
    }
  }, [login, router]);

  const startScanner = useCallback(async () => {
    setScanError('');
    setScanSuccess(false);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      
      // Clean up any existing scanner
      if (scannerRef.current) {
        try { await scannerRef.current.stop(); } catch { /* ignore */ }
        scannerRef.current = null;
      }

      const scanner = new Html5Qrcode(scannerContainerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' }, // Prefer back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText: string) => {
          handleQrResult(decodedText);
        },
        () => {
          // Ignore scan failures (no QR code in frame)
        }
      );

      setScannerActive(true);
    } catch (err: any) {
      if (err?.message?.includes('NotAllowedError') || err?.name === 'NotAllowedError') {
        setScanError('Kamera-Zugriff verweigert. Bitte erlauben Sie den Kamera-Zugriff in den Browser-Einstellungen.');
      } else if (err?.message?.includes('NotFoundError') || err?.name === 'NotFoundError') {
        setScanError('Keine Kamera gefunden. Bitte stellen Sie sicher, dass eine Kamera angeschlossen ist.');
      } else {
        setScanError(err?.message || 'Kamera konnte nicht gestartet werden.');
      }
    }
  }, [handleQrResult]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch { /* ignore */ }
      scannerRef.current = null;
    }
    setScannerActive(false);
  }, []);

  // Start/stop scanner when switching modes
  useEffect(() => {
    if (mode === 'qrcode') {
      // Small delay to ensure DOM element exists
      const timer = setTimeout(() => startScanner(), 200);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { stopScanner(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.backdrop} />
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#2563eb" />
              <path d="M12 14h16v3H12zm0 5h12v3H12zm0 5h16v3H12z" fill="#fff" opacity=".9"/>
              <rect x="26" y="19" width="6" height="12" rx="1" fill="#fff" opacity=".7"/>
            </svg>
          </div>
          <h1 className={styles.title}>Kitting & CoPack Suite</h1>
          <p className={styles.subtitle}>Melden Sie sich an, um fortzufahren</p>
        </div>

        {/* Mode Switcher */}
        <div className={styles.modeSwitcher}>
          <button
            className={`${styles.modeTab} ${mode === 'credentials' ? styles.modeTabActive : ''}`}
            onClick={() => setMode('credentials')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            E-Mail & Passwort
          </button>
          <button
            className={`${styles.modeTab} ${mode === 'qrcode' ? styles.modeTabActive : ''}`}
            onClick={() => setMode('qrcode')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="8" height="8" rx="1"/>
              <rect x="14" y="2" width="8" height="8" rx="1"/>
              <rect x="2" y="14" width="8" height="8" rx="1"/>
              <rect x="14" y="14" width="4" height="4"/>
              <rect x="20" y="14" width="2" height="2"/>
              <rect x="14" y="20" width="2" height="2"/>
              <rect x="20" y="20" width="2" height="2"/>
            </svg>
            QR-Code scannen
          </button>
        </div>

        {mode === 'credentials' && (
          <>
            <form onSubmit={handleSubmit} className={styles.form}>
              {error && (
                <div className={styles.error}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10.5a.75.75 0 110-1.5.75.75 0 010 1.5zM8.75 4.75v4.5a.75.75 0 01-1.5 0v-4.5a.75.75 0 011.5 0z"/>
                  </svg>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email" className="form-label">E-Mail</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="ihre@email.de"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Passwort</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <button type="submit" className={`btn btn-primary btn-lg ${styles.submitBtn}`} disabled={isLoading}>
                {isLoading ? 'Anmelden...' : 'Anmelden'}
              </button>
            </form>

            <div className={styles.divider}>
              <span>Demo-Zugänge</span>
            </div>

            <div className={styles.demoUsers}>
              {DEMO_USERS.map(demo => (
                <button
                  key={demo.email}
                  className={styles.demoButton}
                  onClick={() => handleQuickLogin(demo.email, demo.password)}
                  disabled={isLoading}
                >
                  <span className={styles.demoLabel}>{demo.label}</span>
                  <span className={styles.demoRole}>{demo.role}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {mode === 'qrcode' && (
          <div className={styles.qrSection}>
            {scanSuccess ? (
              <div className={styles.qrConfirmed}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <p>Anmeldung erfolgreich!</p>
                <span className={styles.qrHint}>Sie werden weitergeleitet...</span>
              </div>
            ) : (
              <>
                {/* Camera viewfinder */}
                <div className={styles.scannerWrapper}>
                  <div id={scannerContainerId} className={styles.scannerContainer} />
                  {scannerActive && (
                    <div className={styles.scannerOverlay}>
                      <div className={styles.scannerCorner} data-pos="tl" />
                      <div className={styles.scannerCorner} data-pos="tr" />
                      <div className={styles.scannerCorner} data-pos="bl" />
                      <div className={styles.scannerCorner} data-pos="br" />
                      <div className={styles.scanLine} />
                    </div>
                  )}
                </div>

                {scanError && (
                  <div className={styles.error} style={{ marginTop: 'var(--space-4)' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10.5a.75.75 0 110-1.5.75.75 0 010 1.5zM8.75 4.75v4.5a.75.75 0 01-1.5 0v-4.5a.75.75 0 011.5 0z"/>
                    </svg>
                    {scanError}
                  </div>
                )}

                {!scannerActive && !scanError && (
                  <div className={styles.qrLoading}>
                    <div className={styles.qrSpinner} />
                    <p>Kamera wird gestartet...</p>
                  </div>
                )}

                {scanError && (
                  <button
                    className={`btn btn-primary ${styles.retryBtn}`}
                    onClick={startScanner}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                    </svg>
                    Erneut versuchen
                  </button>
                )}

                <div className={styles.qrInstructions}>
                  <div className={styles.qrStep}>
                    <span className={styles.qrStepNum}>1</span>
                    <span>Kamera auf den QR-Code richten</span>
                  </div>
                  <div className={styles.qrStep}>
                    <span className={styles.qrStepNum}>2</span>
                    <span>QR-Code wird automatisch erkannt</span>
                  </div>
                  <div className={styles.qrStep}>
                    <span className={styles.qrStepNum}>3</span>
                    <span>Automatische Anmeldung</span>
                  </div>
                </div>

                <div className={styles.qrFormatHint}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  <span>QR-Code muss Anmeldedaten enthalten (JSON oder Base64)</span>
                </div>
              </>
            )}
          </div>
        )}

        <p className={styles.footer}>
          Powered by <strong>ePerformances</strong>
        </p>
      </div>
    </div>
  );
}
