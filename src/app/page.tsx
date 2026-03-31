'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import type { Task } from '@/lib/data/types';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!user) return null;

  const openTasks = tasks.filter(t => t.status === 'open');
  const plannedTasks = tasks.filter(t => t.status === 'planned');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const criticalTasks = tasks.filter(t => t.priority === 'critical' && t.status !== 'completed');
  const pausedTasks = tasks.filter(t => t.status === 'paused');

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      'open': { label: 'Offen', className: 'badge badge-dot badge-open' },
      'planned': { label: 'Geplant', className: 'badge badge-dot badge-planned' },
      'in-progress': { label: 'In Bearbeitung', className: 'badge badge-dot badge-in-progress' },
      'paused': { label: 'Pausiert', className: 'badge badge-dot badge-paused' },
      'completed': { label: 'Abgeschlossen', className: 'badge badge-dot badge-completed' },
      'blocked': { label: 'Gesperrt', className: 'badge badge-dot badge-blocked' },
      'handed-to-warehouse': { label: 'An Lager Übergeben', className: 'badge badge-dot badge-handed-to-warehouse' },
      'stored': { label: 'Eingelagert', className: 'badge badge-dot badge-stored' },
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
    return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className={styles.dashboard}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Willkommen zurück, {user.name.split(' ')[0]}
          </p>
        </div>
        <div className="page-actions">
          {(user.role === 'admin' || user.role === 'supervisor') && (
            <Link href="/tasks/new" className="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Neuer Task
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-stats" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <span className="stat-card-label">Offene Tasks</span>
          <span className="stat-card-value">{loading ? '–' : openTasks.length}</span>
          <span className="stat-card-trend" style={{ color: 'var(--status-open)' }}>Bereit zur Bearbeitung</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">In Bearbeitung</span>
          <span className="stat-card-value">{loading ? '–' : inProgressTasks.length}</span>
          <span className="stat-card-trend up">Aktiv in Produktion</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Geplant</span>
          <span className="stat-card-value">{loading ? '–' : plannedTasks.length}</span>
          <span className="stat-card-trend" style={{ color: 'var(--status-planned)' }}>Wartend</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Abgeschlossen</span>
          <span className="stat-card-value">{loading ? '–' : completedTasks.length}</span>
          <span className="stat-card-trend up">Erledigt</span>
        </div>
      </div>

      {/* Alerts */}
      {criticalTasks.length > 0 && (
        <div className={styles.alertBanner}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div>
            <strong>{criticalTasks.length} kritische{criticalTasks.length > 1 ? ' Tasks' : 'r Task'}</strong>
            <span> erfordern sofortige Aufmerksamkeit</span>
          </div>
        </div>
      )}

      {pausedTasks.length > 0 && (
        <div className={styles.alertBannerWarning}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="10" y1="15" x2="10" y2="9"/>
            <line x1="14" y1="15" x2="14" y2="9"/>
          </svg>
          <div>
            <strong>{pausedTasks.length} pausierte{pausedTasks.length > 1 ? ' Tasks' : 'r Task'}</strong>
            <span> – bitte prüfen</span>
          </div>
        </div>
      )}

      {/* Main content grid */}
      <div className={styles.contentGrid}>
        {/* Critical & High Priority Tasks */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Dringende Tasks</h3>
            <Link href="/tasks?priority=critical,high" className="btn btn-ghost btn-sm">Alle anzeigen</Link>
          </div>
          {loading ? (
            <div className={styles.loadingItems}>
              {[1,2,3].map(i => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : criticalTasks.length === 0 ? (
            <div className={styles.emptyMini}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--color-success)', opacity: 0.5 }}>
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>Keine dringenden Tasks</span>
            </div>
          ) : (
            <div className={styles.taskList}>
              {[...criticalTasks, ...tasks.filter(t => t.priority === 'high' && t.status !== 'completed')].slice(0, 5).map(task => (
                <Link key={task.id} href={`/tasks/${task.id}`} className={styles.taskItem}>
                  <div className={styles.taskInfo}>
                    <span className={styles.taskTitle}>{task.title}</span>
                    <span className={styles.taskMeta}>
                      {task.referenceId} · Fällig: {formatDate(task.dueDate)}
                    </span>
                  </div>
                  <div className={styles.taskBadges}>
                    {priorityBadge(task.priority)}
                    {statusBadge(task.status)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity / All tasks by date */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Nächste Fälligkeiten</h3>
            <Link href="/tasks" className="btn btn-ghost btn-sm">Alle Tasks</Link>
          </div>
          {loading ? (
            <div className={styles.loadingItems}>
              {[1,2,3].map(i => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : (
            <div className={styles.taskList}>
              {tasks
                .filter(t => t.status !== 'completed')
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .slice(0, 6)
                .map(task => (
                  <Link key={task.id} href={`/tasks/${task.id}`} className={styles.taskItem}>
                    <div className={styles.taskInfo}>
                      <span className={styles.taskTitle}>{task.title}</span>
                      <span className={styles.taskMeta}>
                        {task.referenceId} · {task.estimatedQuantity} Stück · Fällig: {formatDate(task.dueDate)}
                      </span>
                    </div>
                    <div className={styles.taskBadges}>
                      {statusBadge(task.status)}
                    </div>
                  </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h3 className={styles.quickTitle}>Schnellzugriff</h3>
        <div className={styles.quickGrid}>
          <Link href="/tasks" className={styles.quickCard}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
            <span>Tasks</span>
          </Link>
          <Link href="/items" className={styles.quickCard}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            </svg>
            <span>Items</span>
          </Link>
          <Link href="/print-center" className={styles.quickCard}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
            </svg>
            <span>Drucken</span>
          </Link>
          <Link href="/users" className={styles.quickCard}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
            <span>Benutzer</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
