'use client';

import React, { useEffect, useState, useCallback } from 'react';
import styles from './qz-connection-guard.module.css';

type ConnectionStatus = 'idle' | 'connecting' | 'awaiting-approval' | 'connected' | 'rejected' | 'error';

interface QzConnectionGuardProps {
  host: string;
  port: number;
  onConnected: () => void;
  onDismiss?: () => void;
}

export default function QzConnectionGuard({ host, port, onConnected, onDismiss }: QzConnectionGuardProps) {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const attemptConnection = useCallback(async () => {
    setStatus('connecting');
    setErrorMessage('');

    try {
      // Dynamic import of qz-tray (client-side only)
      const qz = (await import('qz-tray')).default;

      if (qz.websocket.isActive()) {
        setStatus('connected');
        onConnected();
        return;
      }

      setStatus('awaiting-approval');

      const options: Record<string, unknown> = {};
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        options.host = host;
      }
      if (port && port !== 8181) {
        options.port = port;
      }

      // Set up connection with timeout
      const connectPromise = Object.keys(options).length > 0
        ? qz.websocket.connect(options)
        : qz.websocket.connect();

      // Race against a timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 30000)
      );

      await Promise.race([connectPromise, timeoutPromise]);

      if (qz.websocket.isActive()) {
        setStatus('connected');
        onConnected();
      } else {
        setStatus('awaiting-approval');
      }
    } catch (err: any) {
      if (err?.message === 'Already connected') {
        setStatus('connected');
        onConnected();
        return;
      }

      if (err?.message === 'TIMEOUT') {
        setStatus('awaiting-approval');
        // Keep polling
      } else {
        setStatus('error');
        setErrorMessage(err?.message || 'Verbindung fehlgeschlagen');
      }
    }

    setAttemptCount(prev => prev + 1);
  }, [host, port, onConnected]);

  // Timer for elapsed time display
  useEffect(() => {
    if (status === 'awaiting-approval' || status === 'connecting') {
      const timer = setInterval(() => setElapsed(prev => prev + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [status]);

  // Auto-retry polling when awaiting approval
  useEffect(() => {
    if (status === 'awaiting-approval') {
      const pollTimer = setTimeout(attemptConnection, 3000);
      return () => clearTimeout(pollTimer);
    }
  }, [status, attemptCount, attemptConnection]);

  // Initial connection attempt
  useEffect(() => {
    attemptConnection();
  }, [attemptConnection]);

  if (status === 'connected') return null;

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return min > 0 ? `${min}:${sec.toString().padStart(2, '0')} min` : `${sec}s`;
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.iconContainer}>
          {(status === 'connecting' || status === 'awaiting-approval') && (
            <div className={styles.spinner}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 18L18 6M6 6l12 12" opacity="0" />
                <rect x="2" y="6" width="10" height="16" rx="2" strokeDasharray="4 2" />
                <rect x="14" y="2" width="8" height="12" rx="2" />
                <path d="M14 8h8" />
                <circle cx="18" cy="11" r="1" fill="currentColor" />
              </svg>
            </div>
          )}
          {status === 'error' || status === 'rejected' ? (
            <div className={styles.errorIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
          ) : null}
        </div>

        <h2 className={styles.title}>
          {status === 'connecting' && 'Verbindung wird hergestellt...'}
          {status === 'awaiting-approval' && 'Warte auf Bestätigung'}
          {status === 'error' && 'Verbindung fehlgeschlagen'}
          {status === 'rejected' && 'Verbindung abgelehnt'}
        </h2>

        <p className={styles.description}>
          {status === 'awaiting-approval' && (
            <>
              Die Verbindungsanfrage muss am QZ Tray Host bestätigt werden.
              <br />
              <strong>Bitte bestätigen Sie die Anfrage am Zielgerät.</strong>
            </>
          )}
          {status === 'connecting' && 'Verbinde mit QZ Tray...'}
          {status === 'error' && (errorMessage || 'Die Verbindung zum QZ Tray konnte nicht hergestellt werden.')}
          {status === 'rejected' && 'Die Verbindungsanfrage wurde abgelehnt. Bitte bestätigen Sie die Anfrage am QZ Tray Host.'}
        </p>

        <div className={styles.connectionInfo}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Host</span>
            <span className={styles.infoValue}>{host || 'localhost'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Port</span>
            <span className={styles.infoValue}>{port || 8181}</span>
          </div>
          {(status === 'awaiting-approval' || status === 'connecting') && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Wartezeit</span>
              <span className={styles.infoValue}>{formatTime(elapsed)}</span>
            </div>
          )}
        </div>

        {status === 'awaiting-approval' && (
          <div className={styles.pulseContainer}>
            <div className={styles.pulse} />
            <div className={styles.pulseRing} />
            <div className={styles.pulseRing2} />
          </div>
        )}

        <div className={styles.actions}>
          {(status === 'error' || status === 'rejected') && (
            <button className="btn btn-primary" onClick={() => { setElapsed(0); attemptConnection(); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
              </svg>
              Erneut versuchen
            </button>
          )}
          {onDismiss && (
            <button className="btn btn-ghost" onClick={onDismiss}>
              Abbrechen
            </button>
          )}
        </div>

        <p className={styles.hint}>
          Da die IP-Adressen statisch sind, muss diese Bestätigung nur einmal pro Gerät erfolgen.
        </p>
      </div>
    </div>
  );
}
