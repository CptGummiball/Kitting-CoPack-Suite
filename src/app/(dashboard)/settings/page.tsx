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

  if (!user || !isAdmin) return null;

  if (loading || !settings) {
    return (
      <div className="empty-state">
        <div className="spinner" style={{ width: 40, height: 40, border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

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
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Drucker-Auswahl</label>
              <select 
                className="form-select"
                value={settings.labels.defaultPrinterName}
                onChange={e => setSettings({...settings, labels: {...settings.labels, defaultPrinterName: e.target.value}})}
              >
                <option value="zebra_zd420">Zebra ZD420 (Produktion Line 1)</option>
                <option value="zebra_zt411">Zebra ZT411 (Warenausgang)</option>
              </select>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--space-6)' }}>Zebra ZPL-Druck-Integration</h3>
            
            <div className="form-group">
              <label className="form-label">ZPL API Endpoint (Optional)</label>
              <input 
                type="url" 
                className="form-input" 
                placeholder="https://intern.print-server.local/api/print"
                value={settings.api?.webhookUrl || ''}
                onChange={e => setSettings({...settings, api: {...settings.api, webhookUrl: e.target.value}})}
              />
              <span className="form-help">Integration aktiv für Printvorgänge via ZPL-over-HTTP.</span>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--space-6)' }}>Tasks & Workflows</h3>
            <div className="grid-2-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
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
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked disabled />
                Automatische E-Mails bei neuen Tasks an Supervisor
              </label>
            </div>
            <span className="form-help">Erweitertes Task Routing.</span>
          </div>

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
            <span className="form-help">Diese Farbe wird für Buttons, Links und aktive Elemente im System genutzt, um die App an Ihr Corporate Design anzupassen. Nach dem Speichern muss die Seite neu geladen werden.</span>
          </div>

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
            <span className="form-help">Warnung: Nur ändern, wenn eine Migration stattgefunden hat.</span>
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
        </div>
      </div>
    </div>
  );
}
