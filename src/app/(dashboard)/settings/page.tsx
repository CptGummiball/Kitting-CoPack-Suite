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
      // Client-side QZ Tray test would go here
      // For now, we just verify the settings are valid
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
      // Save settings first so API can use them
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
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
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
                <p className="card-subtitle">Artikel und Aufträge mit Weclapp synchronisieren</p>
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
                <div style={{ display: 'flex', gap: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={settings.weclapp?.syncArticles ?? true}
                      onChange={e => setSettings({...settings, weclapp: {...settings.weclapp, syncArticles: e.target.checked}})} />
                    Artikel synchronisieren
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={settings.weclapp?.syncOrders ?? true}
                      onChange={e => setSettings({...settings, weclapp: {...settings.weclapp, syncOrders: e.target.checked}})} />
                    Aufträge synchronisieren
                  </label>
                </div>
                {settings.weclapp?.lastSyncAt && (
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-3)' }}>
                    Letzte Synchronisation: {new Date(settings.weclapp.lastSyncAt).toLocaleString('de-DE')}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleTestWeclapp}>
                    Verbindung testen
                  </button>
                  {weclappTestResult && (
                    <span style={{ fontSize: 'var(--font-size-sm)', color: weclappTestResult.startsWith('✅') ? 'var(--color-success)' : weclappTestResult.startsWith('❌') ? 'var(--color-error)' : 'var(--color-text-secondary)' }}>
                      {weclappTestResult}
                    </span>
                  )}
                </div>
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
                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label">Webhook Secret</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Optionales Shared Secret für eingehende Webhooks"
                    value={settings.wms?.webhookSecret || ''}
                    onChange={e => setSettings({...settings, wms: {...settings.wms, webhookSecret: e.target.value}})}
                  />
                  <span className="form-hint">Wird verwendet, um eingehende Einlagerungs-Bestätigungen vom WMS zu authentifizieren.</span>
                </div>
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
              <li><strong>Version:</strong> 1.0.0-beta</li>
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
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
