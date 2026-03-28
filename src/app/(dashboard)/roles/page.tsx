'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { PERMISSIONS, ROLE_TEMPLATES } from '@/lib/data/types';
import Link from 'next/link';

export default function RolesMatrixPage() {
  const { user, isAdmin } = useAuth();

  if (!user || !isAdmin) return <div className="empty-state">Zugriff verweigert</div>;

  // Group permissions logically for the table
  const groups: Record<string, typeof PERMISSIONS[number][]> = {
    'Tasks': ['tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.assign', 'tasks.status'],
    'Items': ['items.view', 'items.create', 'items.edit', 'items.delete'],
    'Benutzer': ['users.view', 'users.create', 'users.edit', 'users.delete', 'users.permissions'],
    'Labeldruck': ['labels.view', 'labels.create', 'labels.edit', 'labels.delete', 'labels.print'],
    'System': ['settings.view', 'settings.edit', 'settings.api', 'settings.system', 'audit.view', 'reports.view'],
  };

  const hasPerm = (role: 'admin' | 'supervisor' | 'user', perm: string) => {
    // @ts-expect-error type safety check
    return ROLE_TEMPLATES[role].includes(perm);
  };

  return (
    <div className="page-animation-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Rollen & Rechte Matrix</h1>
          <p className="page-subtitle">Übersicht der System-Berechtigungen pro Rolle</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ margin: 0 }}>
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                <th style={{ width: '40%' }}>Berechtigung</th>
                <th style={{ textAlign: 'center' }}>Administrator</th>
                <th style={{ textAlign: 'center' }}>Supervisor</th>
                <th style={{ textAlign: 'center' }}>Standard User</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groups).map(([group, perms]) => (
                <React.Fragment key={group}>
                  <tr>
                    <td colSpan={4} style={{ backgroundColor: 'var(--color-bg)', fontWeight: 'bold', paddingTop: 'var(--space-4)' }}>
                      {group}
                    </td>
                  </tr>
                  {perms.map(perm => (
                    <tr key={perm}>
                      <td style={{ paddingLeft: 'var(--space-6)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>
                        {perm}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {hasPerm('admin', perm) ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-border-light)" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {hasPerm('supervisor', perm) ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-border-light)" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {hasPerm('user', perm) ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-border-light)" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-info-light)', borderTop: '1px solid var(--color-border)', fontSize: 'var(--font-size-sm)', color: 'var(--color-info-dark)' }}>
          <strong>Hinweis:</strong> Die Matrix zeigt die Standardkonfiguration aus <code>types.ts</code>. Individuelle Berechtigungsanpassungen sind in der aktuellen Version nur über Code-Deployments möglich.
        </div>
      </div>
    </div>
  );
}
