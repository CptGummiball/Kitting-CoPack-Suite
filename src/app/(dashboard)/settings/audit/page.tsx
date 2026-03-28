'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import type { AuditEntry } from '@/lib/data/types';
import Link from 'next/link';

export default function AuditLogPage() {
  const { user, isSupervisor } = useAuth();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/audit')
      .then(res => res.json())
      .then(data => {
        setLogs(data.reverse()); // latest first
        setLoading(false);
      });
  }, []);

  if (!user || !isSupervisor) return null;

  return (
    <div className="page-animation-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit & System Logs</h1>
          <p className="page-subtitle">Rückverfolgbarkeit aller Datenänderungen im System</p>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Zeitpunkt</th>
                <th>Benutzer</th>
                <th>Aktion</th>
                <th>Entität</th>
                <th>ID</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>Lade Logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">Keine Einträge gefunden.</div>
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                      {new Date(log.timestamp).toLocaleString('de-DE')}
                    </td>
                    <td style={{ fontWeight: 'var(--font-weight-medium)' }}>{log.userName}</td>
                    <td>
                      <span className={`badge ${log.action === 'CREATE' ? 'badge-success' : log.action === 'DELETE' ? 'badge-error' : 'badge-planned'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ textTransform: 'uppercase', fontSize: 'var(--font-size-xs)', letterSpacing: '0.05em' }}>{log.entityType}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>{log.entityId}</td>
                    <td style={{ fontSize: 'var(--font-size-sm)' }}>
                      <pre style={{ margin: 0, padding: 0, background: 'none', border: 'none', color: 'inherit', whiteSpace: 'pre-wrap', maxHeight: '100px', overflowY: 'auto' }}>
                        {log.changes}
                      </pre>
                    </td>
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
