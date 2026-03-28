'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import type { User } from '@/lib/data/types';
import styles from './users.module.css';

export default function UsersPage() {
  const { user, isSupervisor, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!user || !isSupervisor) return null;

  return (
    <div className={styles.page}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Benutzerverwaltung</h1>
          <p className="page-subtitle">Verwalten Sie Mitarbeiter, Supervisor und Administratoren</p>
        </div>
        <div className="page-actions">
          {isAdmin && (
            <button className="btn btn-primary">Benutzer hinzufügen</button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>E-Mail / Benutzername</th>
                <th>Rolle</th>
                <th>Status</th>
                <th>Letzter Login</th>
                {isAdmin && <th>Aktionen</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                    Lade Benutzer...
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 'var(--font-weight-medium)' }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${
                        u.role === 'admin' ? 'badge-critical' : 
                        u.role === 'supervisor' ? 'badge-high' : 
                        ''
                      }`}>
                        {u.role === 'admin' ? 'Administrator' : 
                         u.role === 'supervisor' ? 'Supervisor' : 'Standard'}
                      </span>
                    </td>
                    <td>
                      {u.status === 'active' 
                        ? <span className="badge badge-success">Aktiv</span>
                        : <span className="badge badge-error">Inaktiv</span>
                      }
                    </td>
                    <td>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('de-DE') : 'Nie'}</td>
                    {isAdmin && (
                      <td>
                        <button className="btn btn-ghost btn-sm" disabled={u.id === user.id}>Bearbeiten</button>
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
