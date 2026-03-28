'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import type { LabelTemplate } from '@/lib/data/types';
import Link from 'next/link';

export default function LabelsPage() {
  const { user, isAdmin, isSupervisor } = useAuth();
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/labels')
      .then(res => res.json())
      .then(data => {
        setTemplates(data);
        setLoading(false);
      });
  }, []);

  if (!user || (!isAdmin && !isSupervisor)) return null;

  return (
    <div className="page-animation-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Label-Vorlagen</h1>
          <p className="page-subtitle">Verwaltung der Zebra ZPL Druck-Templates</p>
        </div>
        <div className="page-actions">
          {isAdmin && (
            <Link href="/labels/new" className="btn btn-primary">Neue Vorlage</Link>
          )}
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Größe</th>
                <th>Felder</th>
                <th>Status</th>
                <th>Zuletzt geändert</th>
                {isAdmin && <th>Aktionen</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>Laden...</td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5}>
                    <div className="empty-state">Keine Vorlagen gefunden.</div>
                  </td>
                </tr>
              ) : (
                templates.map(tpl => (
                  <tr key={tpl.id}>
                    <td style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      {tpl.name}
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>{tpl.description}</div>
                    </td>
                    <td>{tpl.size}</td>
                    <td>{tpl.fields.length} Variablen</td>
                    <td>
                      {tpl.isActive 
                        ? <span className="badge badge-success">Aktiv</span> 
                        : <span className="badge badge-error">Inaktiv</span>}
                    </td>
                    <td>{new Date(tpl.updatedAt).toLocaleDateString('de-DE')}</td>
                    {isAdmin && (
                      <td>
                        <button className="btn btn-ghost btn-sm">Bearbeiten</button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
