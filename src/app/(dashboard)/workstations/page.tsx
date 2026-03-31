'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import type { Workstation } from '@/lib/data/types';

export default function WorkstationsPage() {
  const { user, isAdmin } = useAuth();
  const [workstations, setWorkstations] = useState<Workstation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', printerName: '', isActive: true });
  const [saving, setSaving] = useState(false);

  const fetchWorkstations = () => {
    fetch('/api/workstations')
      .then(res => res.json())
      .then(data => {
        setWorkstations(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchWorkstations(); }, []);

  if (!user || !isAdmin) return null;

  const resetForm = () => {
    setForm({ name: '', description: '', printerName: '', isActive: true });
    setShowCreate(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await fetch(`/api/workstations/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        await fetch('/api/workstations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      resetForm();
      fetchWorkstations();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (ws: Workstation) => {
    setForm({ name: ws.name, description: ws.description || '', printerName: ws.printerName, isActive: ws.isActive });
    setEditingId(ws.id);
    setShowCreate(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Produktionsplatz wirklich löschen?')) return;
    await fetch(`/api/workstations/${id}`, { method: 'DELETE' });
    fetchWorkstations();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Produktionsplätze</h1>
          <p className="page-subtitle">Verwalten Sie Arbeitsplätze und deren Drucker-Zuweisungen</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowCreate(true); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Neuer Platz
          </button>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreate && (
        <div className="modal-backdrop" onClick={resetForm}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                {editingId ? 'Platz bearbeiten' : 'Neuer Produktionsplatz'}
              </h2>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={resetForm}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label form-label-required">Name</label>
                <input className="form-input" placeholder="z.B. Kitting Linie A" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Beschreibung</label>
                <input className="form-input" placeholder="Optionale Beschreibung" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label form-label-required">Drucker</label>
                <input className="form-input" placeholder="z.B. Zebra ZD420 - Produktion" value={form.printerName} onChange={e => setForm({ ...form, printerName: e.target.value })} required />
                <span className="form-hint">Der Name muss exakt mit dem QZ Tray Druckernamen übereinstimmen.</span>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                  Platz aktiv
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={resetForm}>Abbrechen</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.name || !form.printerName}>
                {saving ? 'Speichern...' : editingId ? 'Aktualisieren' : 'Erstellen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workstations Table */}
      {loading ? (
        <div className="empty-state">
          <div className="spinner" style={{ width: 40, height: 40, border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : workstations.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <h2 className="empty-state-title">Keine Produktionsplätze</h2>
          <p className="empty-state-description">Erstellen Sie Produktionsplätze, damit Mitarbeiter bei der Anmeldung ihren Arbeitsplatz auswählen können.</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Ersten Platz erstellen</button>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Beschreibung</th>
                <th>Drucker</th>
                <th>Status</th>
                <th style={{ width: '120px' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {workstations.map(ws => (
                <tr key={ws.id}>
                  <td style={{ fontWeight: 'var(--font-weight-semibold)' }}>{ws.name}</td>
                  <td style={{ color: ws.description ? 'var(--color-text-secondary)' : 'var(--color-text-tertiary)' }}>
                    {ws.description || '–'}
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-mono)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                      </svg>
                      {ws.printerName}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${ws.isActive ? 'badge-completed' : 'badge-blocked'}`}>
                      {ws.isActive ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleEdit(ws)} title="Bearbeiten">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(ws.id)} title="Löschen" style={{ color: 'var(--color-error)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
