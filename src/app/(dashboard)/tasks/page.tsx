'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import type { Task } from '@/lib/data/types';
import styles from './tasks.module.css';

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.referenceId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      'open': { label: 'Offen', className: 'badge badge-dot badge-open' },
      'planned': { label: 'Geplant', className: 'badge badge-dot badge-planned' },
      'in-progress': { label: 'In Bearbeitung', className: 'badge badge-dot badge-in-progress' },
      'paused': { label: 'Pausiert', className: 'badge badge-dot badge-paused' },
      'completed': { label: 'Abgeschlossen', className: 'badge badge-dot badge-completed' },
      'blocked': { label: 'Gesperrt', className: 'badge badge-dot badge-blocked' },
    };
    const s = map[status] || map['open'];
    return <span className={s.className}>{s.label}</span>;
  };

  const priorityBadge = (priority: string) => {
    const map: Record<string, { label: string; className: string }> = {
      'critical': { label: 'Kritisch', className: 'badge badge-critical' },
      'high': { label: 'Hoch', className: 'badge badge-high' },
      'medium': { label: 'Mittel', className: 'badge badge-medium' },
      'low': { label: 'Niedrig', className: 'badge badge-low' },
    };
    const p = map[priority] || { label: priority, className: 'badge' };
    return <span className={p.className}>{p.label}</span>;
  };

  const formatDate = (date: string) => {
    if (!date) return '–';
    return new Date(date).toLocaleDateString('de-DE');
  };

  if (!user) return null;

  return (
    <div className={styles.page}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Alle Produktions- und CoPack-Aufträge</p>
        </div>
        <div className="page-actions">
          {(user.role === 'admin' || user.role === 'supervisor') && (
            <Link href="/tasks/new" className="btn btn-primary">Neuer Task</Link>
          )}
        </div>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="search-bar" style={{ flex: 1, maxWidth: '400px' }}>
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input 
              type="text" 
              placeholder="Suchen nach Referenz oder Titel..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-bar">
            <select 
              className="form-select" 
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">Alle Status</option>
              <option value="open">Offen</option>
              <option value="planned">Geplant</option>
              <option value="in-progress">In Bearbeitung</option>
              <option value="paused">Pausiert</option>
              <option value="completed">Abgeschlossen</option>
              <option value="blocked">Gesperrt</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Referenz</th>
                <th>Titel / Produkt</th>
                <th>Status</th>
                <th>Priorität</th>
                <th>Menge</th>
                <th>Fällig am</th>
                <th>Zuständig</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                    Lade Tasks...
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                      <p>Keine Tasks gefunden.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => (
                  <tr key={task.id} className="clickable" onClick={() => window.location.href = `/tasks/${task.id}`}>
                    <td style={{ fontWeight: 'var(--font-weight-medium)' }}>{task.referenceId}</td>
                    <td>
                      <div className={styles.taskTitleCell}>
                        <span className={styles.taskTitle}>{task.title}</span>
                        {task.item && <span className={styles.taskSubtext}>{task.item.name} ({task.item.sku})</span>}
                      </div>
                    </td>
                    <td>{statusBadge(task.status)}</td>
                    <td>{priorityBadge(task.priority)}</td>
                    <td>
                      <div className={styles.progressCell}>
                        <span>{task.completedQuantity} / {task.estimatedQuantity}</span>
                        <div className="progress-bar" style={{ marginTop: '4px' }}>
                          <div className="progress-bar-fill" style={{ width: `${task.progress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td>{formatDate(task.dueDate)}</td>
                    <td>{task.assignedToUser?.name || '–'}</td>
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
