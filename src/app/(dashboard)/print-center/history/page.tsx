'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import type { PrintJob } from '@/lib/data/types';
import Link from 'next/link';

export default function PrintHistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/print')
      .then(res => res.json())
      .then(data => {
        setHistory(data.sort((a: PrintJob, b: PrintJob) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setLoading(false);
      });
  }, []);

  if (!user) return null;

  return (
    <div className="page-animation-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Druck-Historie</h1>
          <p className="page-subtitle">Protokoll aller generierten und gesendeten Etiketten</p>
        </div>
        <div className="page-actions">
          <Link href="/print-center" className="btn btn-primary">Zum Print-Center</Link>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Zeitpunkt</th>
                <th>Drucker</th>
                <th>Vorlage</th>
                <th>Menge</th>
                <th>Benutzer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>Laden...</td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">Keine Druckaufträge gefunden.</div>
                  </td>
                </tr>
              ) : (
                history.map(job => (
                  <tr key={job.id}>
                    <td>{new Date(job.createdAt).toLocaleString('de-DE')}</td>
                    <td>{job.printerName || 'Unbekannt'}</td>
                    <td style={{ fontWeight: 'var(--font-weight-medium)' }}>{job.templateName}</td>
                    <td>{job.quantity}x</td>
                    <td>{job.printedByName}</td>
                    <td>
                      {job.status === 'completed' ? <span className="badge badge-success">Erfolgreich</span> :
                       job.status === 'failed' ? <span className="badge badge-error">Fehler</span> :
                       <span className="badge badge-planned">{job.status}</span>}
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
