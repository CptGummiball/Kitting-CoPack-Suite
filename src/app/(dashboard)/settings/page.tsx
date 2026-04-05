'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import type { AppSettings } from '@/lib/data/types';
import styles from './settings.module.css';

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [qzTestResult, setQzTestResult] = useState<string | null>(null);
  const [weclappTestResult, setWeclappTestResult] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<{ loading: boolean; result?: string } | null>(null);
  const [userSyncStatus, setUserSyncStatus] = useState<{ loading: boolean; result?: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSuccessMsg('Einstellungen erfolgreich gespeichert.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTestQz = async () => {
    if (!settings?.qzTray) return;
    setQzTestResult('Teste Verbindung...');
    try {
      if (!settings.qzTray.host) {
        setQzTestResult('❌ Host nicht konfiguriert');
        return;
      }
      setQzTestResult(`✅ Konfiguration gültig — Host: ${settings.qzTray.host}:${settings.qzTray.port}`);
    } catch {
      setQzTestResult('❌ Verbindungstest fehlgeschlagen');
    }
    setTimeout(() => setQzTestResult(null), 5000);
  };

  const handleTestWeclapp = async () => {
    if (!settings?.weclapp) return;
    setWeclappTestResult('Teste Verbindung...');
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const res = await fetch('/api/weclapp?action=test');
      const data = await res.json();
      if (data.success) {
        setWeclappTestResult('✅ Verbindung erfolgreich');
      } else {
        setWeclappTestResult(`❌ ${data.error || 'Verbindung fehlgeschlagen'}`);
      }
    } catch {
      setWeclappTestResult('❌ Verbindungstest fehlgeschlagen');
    }
    setTimeout(() => setWeclappTestResult(null), 5000);
  };

  const handleSyncProductionArticles = async () => {
    setSyncStatus({ loading: true });
    try {
      // Save settings first
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const res = await fetch('/api/weclapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync-production-articles' }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncStatus({
          loading: false,
          result: `✅ ${data.synced} Artikel synchronisiert (${data.created} neu, ${data.updated} aktualisiert, ${data.productionArticles} Produktionsartikel, ${data.bomChildren} BOM-Kinder)`,
        });
        // Update lastSyncAt in local state
        if (settings) {
          setSettings({
            ...settings,
            weclapp: { ...settings.weclapp, lastSyncAt: new Date().toISOString() },
          });
        }
      } else {
        setSyncStatus({ loading: false, result: `❌ ${data.error || 'Synchronisation fehlgeschlagen'}` });
      }
    } catch {
      setSyncStatus({ loading: false, result: '❌ Synchronisation fehlgeschlagen' });
    }
    setTimeout(() => setSyncStatus(null), 10000);
  };

  const handleSyncUsers = async () => {
    setUserSyncStatus({ loading: true });
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const res = await fetch('/api/users/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setUserSyncStatus({
          loading: false,
          result: `✅ ${data.synced} Benutzer synchronisiert (${data.created} neu, ${data.updated} aktualisiert)`,
        });
      } else {
        setUserSyncStatus({ loading: false, result: `❌ ${data.error || 'Synchronisation fehlgeschlagen'}` });
      }
    } catch {
      setUserSyncStatus({ loading: false, result: '❌ Synchronisation fehlgeschlagen' });
    }
    setTimeout(() => setUserSyncStatus(null), 10000);
  };

  if (!user || !isAdmin) return null;

  if (loading || !settings) {
    return (
      <div className="empty-state">
        <div className="spinner" style={{ width: 40, height: 40, border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  );

  return (
    <div className={styles.page}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Globale Einstellungen</h1>
          <p className="page-subtitle">Systemweite Konfiguration für Kitting & CoPack Suite</p>
        </div>
      </div>

      <div className={styles.grid}>
        <form onSubmit={handleSave} className={styles.mainCol}>
          {/* General */}
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--space-6)' }}>Allgemein</h3>
            
            <div className="form-group">
              <label className="form-label form-label-required">Unternehmensname</label>
              <input 
                type="text" 
                className="form-input" 
                value={settings.general.companyName}
                onChange={e => setSettings({...settings, general: {...settings.general, companyName: e.target.value}})}
                required
              />
            </div>
          </div>

          {/* QZ Tray */}
          <div className={`card settings-integration-card ${settings.qzTray?.enabled ? 'active' : ''}`} style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
              <div>
                <h3 className="card-title">QZ Tray Verbindung</h3>
                <p className="card-subtitle">Verbindung zum externen QZ Tray Server für Labeldruck</p>
              </div>
              <ToggleSwitch
                checked={settings.qzTray?.enabled || false}
                onChange={v => setSettings({...settings, qzTray: {...settings.qzTray, enabled: v}})}
              />
            </div>
            
            {settings.qzTray?.enabled && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label form-label-required">Host / IP-Adresse</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="192.168.1.50"
                      value={settings.qzTray?.host || ''}
                      onChange={e => setSettings({...settings, qzTray: {...settings.qzTray, host: e.target.value}})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Port</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={settings.qzTray?.port || 8181}
                      onChange={e => setSettings({...settings, qzTray: {...settings.qzTray, port: parseInt(e.target.value) || 8181}})}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={settings.qzTray?.useCertificate || false}
                      onChange={e => setSettings({...settings, qzTray: {...settings.qzTray, useCertificate: e.target.checked}})} />
                    Signiertes Zertifikat verwenden
                  </label>
                </div>
                {settings.qzTray?.useCertificate && (
                  <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                    <label className="form-label">Zertifikat (PEM)</label>
                    <textarea 
                      className="form-textarea" 
                      placeholder="-----BEGIN CERTIFICATE-----"
                      value={settings.qzTray?.certificateData || ''}
                      onChange={e => setSettings({...settings, qzTray: {...settings.qzTray, certificateData: e.target.value}})}
                      style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}
                    />
                  </div>
                )}
                <div className={styles.infoBox}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  <span>Beim ersten Verbindungsaufbau muss die Anfrage am QZ Tray Host bestätigt werden. Da die IPs statisch sind, ist dies nur einmalig pro Gerät erforderlich.</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginTop: 'var(--space-4)' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleTestQz}>
                    Verbindung testen
                  </button>
                  {qzTestResult && (
                    <span style={{ fontSize: 'var(--font-size-sm)', color: qzTestResult.startsWith('✅') ? 'var(--color-success)' : qzTestResult.startsWith('❌') ? 'var(--color-error)' : 'var(--color-text-secondary)' }}>
                      {qzTestResult}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Weclapp */}
          <div className={`card settings-integration-card ${settings.weclapp?.enabled ? 'active' : ''}`} style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
              <div>
                <h3 className="card-title">Weclapp ERP Integration</h3>
                <p className="card-subtitle">Produktionsartikel und Stücklisten mit Weclapp synchronisieren</p>
              </div>
              <ToggleSwitch
                checked={settings.weclapp?.enabled || false}
                onChange={v => setSettings({...settings, weclapp: {...settings.weclapp, enabled: v}})}
              />
            </div>

            {settings.weclapp?.enabled && (
              <>
                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label form-label-required">Tenant URL</label>
                  <input 
                    type="url" 
                    className="form-input" 
                    placeholder="https://meinefirma.weclapp.com"
                    value={settings.weclapp?.tenantUrl || ''}
                    onChange={e => setSettings({...settings, weclapp: {...settings.weclapp, tenantUrl: e.target.value}})}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label form-label-required">API Token</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Weclapp API Token"
                    value={settings.weclapp?.apiToken || ''}
                    onChange={e => setSettings({...settings, weclapp: {...settings.weclapp, apiToken: e.target.value}})}
                  />
                  <span className="form-hint">Erstellen Sie einen API Token in Weclapp unter Mein Konto → API Token.</span>
                </div>

                <div className={styles.infoBox} style={{ marginBottom: 'var(--space-4)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  <span>Es werden nur Produktionsartikel und Artikel aus deren Stücklisten (BOM) synchronisiert. Die Synchronisation erfolgt ausschließlich manuell per Knopfdruck.</span>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label">Artikeltypen für Synchronisation</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="STORABLE, SALES_BILL_OF_MATERIAL"
                    value={(settings.weclapp?.productionArticleTypes || []).join(', ')}
                    onChange={e => setSettings({
                      ...settings,
                      weclapp: {
                        ...settings.weclapp,
                        productionArticleTypes: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                      },
                    })}
                  />
                  <span className="form-hint">Kommaseparierte Weclapp-Artikeltypen. Standard: STORABLE, SALES_BILL_OF_MATERIAL</span>
                </div>

                {settings.weclapp?.lastSyncAt && (
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-3)' }}>
                    Letzte Synchronisation: {new Date(settings.weclapp.lastSyncAt).toLocaleString('de-DE')}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleTestWeclapp}>
                    Verbindung testen
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleSyncProductionArticles}
                    disabled={syncStatus?.loading}
                  >
                    {syncStatus?.loading ? (
                      <>
                        <span className={styles.miniSpinner} />
                        Synchronisiere...
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="23 4 23 10 17 10" />
                          <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                        </svg>
                        Produktionsartikel synchronisieren
                      </>
                    )}
                  </button>
                  {weclappTestResult && (
                    <span style={{ fontSize: 'var(--font-size-sm)', color: weclappTestResult.startsWith('✅') ? 'var(--color-success)' : weclappTestResult.startsWith('❌') ? 'var(--color-error)' : 'var(--color-text-secondary)' }}>
                      {weclappTestResult}
                    </span>
                  )}
                </div>
                {syncStatus?.result && (
                  <div className={styles.syncResult} style={{ marginTop: 'var(--space-3)' }}>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: syncStatus.result.startsWith('✅') ? 'var(--color-success)' : 'var(--color-error)' }}>
                      {syncStatus.result}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* WMS */}
          <div className={`card settings-integration-card ${settings.wms?.enabled ? 'active' : ''}`} style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
              <div>
                <h3 className="card-title">WMS / Lager-Anbindung</h3>
                <p className="card-subtitle">Übergabe und Übernahme von Aufträgen an das Lagerverwaltungssystem</p>
              </div>
              <ToggleSwitch
                checked={settings.wms?.enabled || false}
                onChange={v => setSettings({...settings, wms: {...settings.wms, enabled: v}})}
              />
            </div>

            {settings.wms?.enabled && (
              <>
                {/* Handover Mode Selection */}
                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label">Übergabe-Modus</label>
                  <div className={styles.radioGroup}>
                    <label className={`${styles.radioCard} ${settings.wms.handoverMode === 'simple-webhook' ? styles.radioCardActive : ''}`}>
                      <input
                        type="radio"
                        name="handoverMode"
                        value="simple-webhook"
                        checked={settings.wms.handoverMode === 'simple-webhook'}
                        onChange={() => setSettings({...settings, wms: {...settings.wms, handoverMode: 'simple-webhook'}})}
                      />
                      <div className={styles.radioCardContent}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                        </svg>
                        <div>
                          <strong>Einfacher Webhook</strong>
                          <span>POST-Anfrage an eine konfigurierbare URL</span>
                        </div>
                      </div>
                    </label>
                    <label className={`${styles.radioCard} ${settings.wms.handoverMode === 'wms-message' ? styles.radioCardActive : ''}`}>
                      <input
                        type="radio"
                        name="handoverMode"
                        value="wms-message"
                        checked={settings.wms.handoverMode === 'wms-message'}
                        onChange={() => setSettings({...settings, wms: {...settings.wms, handoverMode: 'wms-message'}})}
                      />
                      <div className={styles.radioCardContent}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                        </svg>
                        <div>
                          <strong>WMS-Nachricht</strong>
                          <span>Strukturierte Nachricht an ein WMS-System</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Simple Webhook fields */}
                {settings.wms.handoverMode === 'simple-webhook' && (
                  <>
                    <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                      <label className="form-label form-label-required">Webhook URL</label>
                      <input 
                        type="url" 
                        className="form-input" 
                        placeholder="https://erp.internal/webhook/handover"
                        value={settings.wms?.webhookUrl || ''}
                        onChange={e => setSettings({...settings, wms: {...settings.wms, webhookUrl: e.target.value}})}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                      <label className="form-label">Webhook Secret</label>
                      <input 
                        type="password" 
                        className="form-input" 
                        placeholder="Optionales Shared Secret"
                        value={settings.wms?.webhookSecret || ''}
                        onChange={e => setSettings({...settings, wms: {...settings.wms, webhookSecret: e.target.value}})}
                      />
                      <span className="form-hint">Wird als X-Webhook-Secret Header mitgesendet.</span>
                    </div>
                  </>
                )}

                {/* WMS Message fields */}
                {settings.wms.handoverMode === 'wms-message' && (
                  <>
                    <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                      <label className="form-label form-label-required">WMS Endpoint URL</label>
                      <input 
                        type="url" 
                        className="form-input" 
                        placeholder="https://wms.example.com/api/v1/inbound"
                        value={settings.wms?.wmsEndpoint || ''}
                        onChange={e => setSettings({...settings, wms: {...settings.wms, wmsEndpoint: e.target.value}})}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                      <label className="form-label">WMS API-Key</label>
                      <input 
                        type="password" 
                        className="form-input" 
                        placeholder="Bearer Token für WMS-Authentifizierung"
                        value={settings.wms?.wmsApiKey || ''}
                        onChange={e => setSettings({...settings, wms: {...settings.wms, wmsApiKey: e.target.value}})}
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={settings.wms?.autoConfirmHandover || false}
                      onChange={e => setSettings({...settings, wms: {...settings.wms, autoConfirmHandover: e.target.checked}})} />
                    Lagerübergabe automatisch bestätigen
                  </label>
                  <span className="form-hint">Wenn aktiv, wird die Einlagerung automatisch nach der Übergabe bestätigt (ohne WMS-Rückmeldung).</span>
                </div>
              </>
            )}
          </div>

          {/* User Sync */}
          <div className={`card settings-integration-card ${(settings as any).userSync?.enabled ? 'active' : ''}`} style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
              <div>
                <h3 className="card-title">Benutzer-Synchronisation</h3>
                <p className="card-subtitle">Benutzer aus einem zentralen Pool abrufen und synchronisieren</p>
              </div>
              <ToggleSwitch
                checked={(settings as any).userSync?.enabled || false}
                onChange={v => setSettings({...settings, userSync: {...(settings as any).userSync, enabled: v}} as any)}
              />
            </div>

            {(settings as any).userSync?.enabled && (
              <>
                <div className={styles.infoBox} style={{ marginBottom: 'var(--space-4)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  <span>Rudimentäre Synchronisation. Benutzer werden über eine externe REST-API abgerufen und lokal angelegt/aktualisiert (Match über E-Mail).</span>
                </div>
                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label form-label-required">Quell-URL</label>
                  <input 
                    type="url" 
                    className="form-input" 
                    placeholder="https://auth.example.com/api/users"
                    value={(settings as any).userSync?.sourceUrl || ''}
                    onChange={e => setSettings({...settings, userSync: {...(settings as any).userSync, sourceUrl: e.target.value}} as any)}
                  />
                  <span className="form-hint">Die API soll ein JSON-Array von Benutzern zurückgeben (Felder: email, name, role).</span>
                </div>
                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label">API-Key</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Bearer Token"
                    value={(settings as any).userSync?.apiKey || ''}
                    onChange={e => setSettings({...settings, userSync: {...(settings as any).userSync, apiKey: e.target.value}} as any)}
                  />
                </div>
                {(settings as any).userSync?.lastSyncAt && (
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-3)' }}>
                    Letzte Synchronisation: {new Date((settings as any).userSync.lastSyncAt).toLocaleString('de-DE')}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleSyncUsers}
                    disabled={userSyncStatus?.loading}
                  >
                    {userSyncStatus?.loading ? (
                      <>
                        <span className={styles.miniSpinner} />
                        Synchronisiere...
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/>
                          <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                        </svg>
                        Jetzt synchronisieren
                      </>
                    )}
                  </button>
                </div>
                {userSyncStatus?.result && (
                  <div style={{ marginTop: 'var(--space-3)' }}>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: userSyncStatus.result.startsWith('✅') ? 'var(--color-success)' : 'var(--color-error)' }}>
                      {userSyncStatus.result}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Tasks & Workflows */}
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--space-6)' }}>Tasks & Workflows</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Standard-Priorität für neue Tasks</label>
                <select className="form-select" defaultValue="medium" disabled>
                  <option value="medium">Mittel</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label form-label-required">Chargennummern-Präfix</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={settings.tasks.batchPrefix}
                  onChange={e => setSettings({...settings, tasks: {...settings.tasks, batchPrefix: e.target.value}})}
                  required
                />
              </div>
            </div>

            {/* Skippable Steps */}
            <div className={styles.subsection}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <div>
                  <h4 className={styles.subsectionTitle}>Zeitstrahl-Schritte überspringen</h4>
                  <p className={styles.subsectionDesc}>Erlaubt es, bestimmte Schritte im Bearbeitungsfenster zu überspringen</p>
                </div>
                <ToggleSwitch
                  checked={settings.tasks.skippableSteps?.enabled || false}
                  onChange={v => setSettings({
                    ...settings,
                    tasks: {
                      ...settings.tasks,
                      skippableSteps: { ...settings.tasks.skippableSteps, enabled: v },
                    },
                  })}
                />
              </div>

              {settings.tasks.skippableSteps?.enabled && (
                <div className={styles.checkboxGrid}>
                  {([
                    { value: 'in-progress' as const, label: 'In Bearbeitung', desc: 'Direkt von Offen/Geplant zu Fertiggestellt' },
                    { value: 'completed' as const, label: 'Fertiggestellt', desc: 'Direkt von In Bearbeitung zu Lagerübergabe' },
                    { value: 'handed-to-warehouse' as const, label: 'Lagerübergabe', desc: 'Direkt von Fertiggestellt zu Eingelagert' },
                  ]).map(step => (
                    <label key={step.value} className={styles.checkboxCard}>
                      <input
                        type="checkbox"
                        checked={(settings.tasks.skippableSteps?.steps || []).includes(step.value)}
                        onChange={e => {
                          const steps = e.target.checked
                            ? [...(settings.tasks.skippableSteps?.steps || []), step.value]
                            : (settings.tasks.skippableSteps?.steps || []).filter(s => s !== step.value);
                          setSettings({
                            ...settings,
                            tasks: {
                              ...settings.tasks,
                              skippableSteps: { ...settings.tasks.skippableSteps, steps },
                            },
                          });
                        }}
                      />
                      <div>
                        <strong>{step.label}</strong>
                        <span>{step.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* APIs & Webhooks */}
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--space-6)' }}>APIs & Webhooks</h3>
            <div className="form-group">
              <label className="form-label">Webhook URL für externe ERP-Synchronisation</label>
              <input 
                type="url" 
                className="form-input" 
                placeholder="https://erp.internal/webhook/copack" 
                value={settings.api?.webhookUrl || ''}
                onChange={e => setSettings({...settings, api: {...settings.api, webhookUrl: e.target.value}})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Trigger-Events</label>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <label className="badge badge-success"><input type="checkbox" checked={settings.api.webhookEvents.includes('task.completed')} onChange={(e) => {
                  const events = e.target.checked ? [...settings.api.webhookEvents, 'task.completed'] : settings.api.webhookEvents.filter(ev => ev !== 'task.completed');
                  setSettings({...settings, api: {...settings.api, webhookEvents: events}});
                }} style={{marginRight: '8px'}} /> task.completed</label>
                <label className="badge badge-success"><input type="checkbox" checked={settings.api.webhookEvents.includes('label.printed')} onChange={(e) => {
                  const events = e.target.checked ? [...settings.api.webhookEvents, 'label.printed'] : settings.api.webhookEvents.filter(ev => ev !== 'label.printed');
                  setSettings({...settings, api: {...settings.api, webhookEvents: events}});
                }} style={{marginRight: '8px'}} /> label.printed</label>
              </div>
            </div>
          </div>

          {/* Theme */}
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--space-6)' }}>Theme & Branding</h3>
            <div className="form-group">
              <label className="form-label">Hauptfarbe (Primary)</label>
              <input 
                type="color" 
                className="form-input" 
                style={{ width: '100px', height: '40px', padding: '4px' }} 
                value={settings.theme?.primaryColor || '#2563eb'}
                onChange={e => setSettings({...settings, theme: { primaryColor: e.target.value }})}
              />
            </div>
            <span className="form-hint">Diese Farbe wird für Buttons, Links und aktive Elemente im System genutzt. Nach dem Speichern muss die Seite neu geladen werden.</span>
          </div>

          {/* Database */}
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--space-6)' }}>Datenbank & Backend</h3>
            <div className="form-group">
              <label className="form-label text-error">Datenbank-Engine (Gefahr! Führt zu Neustart)</label>
              <select 
                className="form-select"
                value={settings.system?.dataBackend || 'flatfile'}
                onChange={e => setSettings({...settings, system: {...settings.system, dataBackend: e.target.value as any}})}
              >
                <option value="flatfile">Flat-File JSON (Demo / Evaluierung)</option>
                <option value="mysql">MySQL / PostgreSQL (Produktion)</option>
                <option value="firebase">Firebase Firestore (Cloud)</option>
              </select>
            </div>
            {settings.system?.dataBackend !== 'flatfile' && (
              <div className="form-group">
                 <label className="form-label">Verbindungs-URL (Database URI)</label>
                 <input 
                   type="text" 
                   className="form-input" 
                   placeholder="mysql://user:pass@localhost:3306/db"
                   value={settings.system?.databaseUrl || ''}
                   onChange={e => setSettings({...settings, system: {...settings.system, databaseUrl: e.target.value}})}
                 />
              </div>
            )}
            <span className="form-hint">Warnung: Nur ändern, wenn eine Migration stattgefunden hat.</span>
          </div>

          <div className="actions" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Wird gespeichert...' : 'Änderungen speichern'}
            </button>
            {successMsg && <span style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-sm)' }}>{successMsg}</span>}
          </div>
        </form>

        <div className={styles.sideCol}>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>System Info</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 'var(--font-size-sm)', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--color-text-secondary)' }}>
              <li><strong>Version:</strong> 0.2.0-beta</li>
              <li><strong>Environment:</strong> Production</li>
              <li><strong>Database:</strong> Flat-File JSON (Demo)</li>
              <li><strong>Last Backup:</strong> {new Date().toLocaleDateString('de-DE')}</li>
            </ul>
          </div>
          <div className="card" style={{ marginTop: 'var(--space-4)' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Integrationen</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 'var(--font-size-sm)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>QZ Tray</span>
                <span className={`badge ${settings.qzTray?.enabled ? 'badge-completed' : 'badge-open'}`}>
                  {settings.qzTray?.enabled ? 'Aktiv' : 'Inaktiv'}
                </span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Weclapp</span>
                <span className={`badge ${settings.weclapp?.enabled ? 'badge-completed' : 'badge-open'}`}>
                  {settings.weclapp?.enabled ? 'Aktiv' : 'Inaktiv'}
                </span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>WMS</span>
                <span className={`badge ${settings.wms?.enabled ? 'badge-completed' : 'badge-open'}`}>
                  {settings.wms?.enabled ? 'Aktiv' : 'Inaktiv'}
                </span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Benutzer-Sync</span>
                <span className={`badge ${(settings as any).userSync?.enabled ? 'badge-completed' : 'badge-open'}`}>
                  {(settings as any).userSync?.enabled ? 'Aktiv' : 'Inaktiv'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
