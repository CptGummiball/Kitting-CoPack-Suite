'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import type { Task, Item, TimelineEntry, AppSettings } from '@/lib/data/types';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './task-detail.module.css';

const TIMELINE_STEPS: { step: TimelineEntry['step']; label: string }[] = [
  { step: 'created', label: 'Auftrag erstellt' },
  { step: 'in-progress', label: 'In Bearbeitung' },
  { step: 'completed', label: 'Fertiggestellt' },
  { step: 'handed-to-warehouse', label: 'An Lager Übergeben' },
  { step: 'stored', label: 'Eingelagert' },
];

function getTimelineState(timeline: TimelineEntry[], step: string): 'completed' | 'active' | 'pending' | 'skipped' {
  const entry = timeline.find(t => t.step === step);
  if (!entry?.timestamp) return 'pending';
  
  // Check if marked as skipped
  if ((entry as any).skipped) return 'skipped' as any;
  
  // Find the last completed step
  const completedSteps = timeline.filter(t => t.timestamp);
  const lastCompleted = completedSteps[completedSteps.length - 1];
  if (lastCompleted?.step === step) return 'active';
  
  return 'completed';
}

export default function TaskDetailPage() {
  const { user, isSupervisor } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [skippableSteps, setSkippableSteps] = useState<{
    enabled: boolean;
    steps: string[];
  }>({ enabled: false, steps: [] });

  useEffect(() => {
    if (!params?.id) return;
    
    // Fetch task
    fetch(`/api/tasks/${params.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setTask(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    // Fetch settings for skippable steps
    fetch('/api/settings')
      .then(res => res.json())
      .then((settings: AppSettings) => {
        if (settings.tasks?.skippableSteps) {
          setSkippableSteps(settings.tasks.skippableSteps);
        }
      })
      .catch(() => {});
  }, [params?.id]);

  if (!user) return null;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="spinner" style={{ width: 40, height: 40, border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="empty-state">
        <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h2 className="empty-state-title">Task nicht gefunden</h2>
        <p className="empty-state-description">Der angeforderte Task existiert nicht oder Sie haben keine Berechtigung ihn zu sehen.</p>
        <button className="btn btn-primary" onClick={() => router.push('/tasks')}>Zurück zur Übersicht</button>
      </div>
    );
  }

  const item = task.item as Item;
  const timeline = task.timeline || [];

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
    return <span className={s.className} style={{ fontSize: 'var(--font-size-sm)', padding: '4px 12px' }}>{s.label}</span>;
  };

  const priorityBadge = (priority: string) => {
    const map: Record<string, { label: string; className: string }> = {
      'critical': { label: 'Kritisch', className: 'badge badge-critical' },
      'high': { label: 'Hoch', className: 'badge badge-high' },
      'medium': { label: 'Mittel', className: 'badge badge-medium' },
      'low': { label: 'Niedrig', className: 'badge badge-low' },
    };
    const p = map[priority] || { label: priority, className: 'badge' };
    return <span className={p.className} style={{ fontSize: 'var(--font-size-sm)', padding: '4px 12px' }}>{p.label}</span>;
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          userId: user.id,
          userName: user.name,
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setTask({ ...task, ...updated });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleHandToWarehouse = async () => {
    try {
      const res = await fetch('/api/wms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          userId: user.id,
          userName: user.name,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTask({ ...task, ...data.task });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmStorage = async () => {
    try {
      const res = await fetch(`/api/wms/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTask({ ...task, ...data.task });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatTimestamp = (ts?: string) => {
    if (!ts) return '';
    return new Date(ts).toLocaleString('de-DE', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  };

  // Determine which skip actions are available
  const canSkipToComplete = skippableSteps.enabled
    && skippableSteps.steps.includes('in-progress')
    && (task.status === 'open' || task.status === 'planned' || task.status === 'paused');

  const canSkipToWarehouse = skippableSteps.enabled
    && skippableSteps.steps.includes('completed')
    && task.status === 'in-progress';

  const canSkipToStored = skippableSteps.enabled
    && skippableSteps.steps.includes('handed-to-warehouse')
    && task.status === 'completed';

  // Also allow direct warehouse handover from earlier statuses when both in-progress and completed are skippable
  const canDirectWarehouseFromOpen = skippableSteps.enabled
    && skippableSteps.steps.includes('in-progress')
    && skippableSteps.steps.includes('completed')
    && (task.status === 'open' || task.status === 'planned' || task.status === 'paused');

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumbs}>
        <Link href="/tasks">Tasks</Link>
        <span className={styles.separator}>/</span>
        <span className={styles.current}>{task.referenceId}</span>
      </div>

      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>{task.title}</h1>
          <div className={styles.badges}>
            {priorityBadge(task.priority)}
            {statusBadge(task.status)}
          </div>
        </div>
        <div className={styles.actions}>
          {/* Standard progression buttons */}
          {(task.status === 'open' || task.status === 'planned' || task.status === 'paused') && (
            <button 
              className="btn btn-primary"
              onClick={() => updateStatus('in-progress')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Starten
            </button>
          )}
          {task.status === 'in-progress' && (
            <>
              <button 
                className="btn btn-secondary"
                onClick={() => updateStatus('paused')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                Pausieren
              </button>
              <button className="btn btn-success" onClick={() => updateStatus('completed')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Abschließen
              </button>
            </>
          )}
          {task.status === 'completed' && (
            <button className="btn btn-primary" onClick={handleHandToWarehouse}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
              An Lager übergeben
            </button>
          )}
          {task.status === 'handed-to-warehouse' && isSupervisor && (
            <button className="btn btn-success" onClick={handleConfirmStorage}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Einlagerung bestätigen
            </button>
          )}

          {/* Skip buttons */}
          {canSkipToComplete && (
            <button className="btn btn-ghost btn-sm" onClick={() => updateStatus('completed')} title="Schritt überspringen">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
              → Fertiggestellt
            </button>
          )}
          {canSkipToWarehouse && (
            <button className="btn btn-ghost btn-sm" onClick={handleHandToWarehouse} title="Schritt überspringen">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
              → Lagerübergabe
            </button>
          )}
          {canSkipToStored && (
            <button className="btn btn-ghost btn-sm" onClick={handleConfirmStorage} title="Schritt überspringen">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
              → Eingelagert
            </button>
          )}
          {canDirectWarehouseFromOpen && (
            <button className="btn btn-ghost btn-sm" onClick={handleHandToWarehouse} title="Direkt an Lager übergeben">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
              → Direkt an Lager
            </button>
          )}

          <Link href={`/print-center?taskId=${task.id}`} className="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Labels
          </Link>
        </div>
      </div>

      {/* Timeline */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="timeline">
          {TIMELINE_STEPS.map(({ step, label }) => {
            const entry = timeline.find(t => t.step === step);
            const state = getTimelineState(timeline, step);
            return (
              <div key={step} className={`timeline-step ${state}`}>
                <div className="timeline-step-dot">
                  {state === 'completed' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : state === 'active' ? (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />
                  ) : (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-border)' }} />
                  )}
                </div>
                <div className="timeline-step-label">{label}</div>
                {entry?.timestamp && (
                  <div className="timeline-step-time">{formatTimestamp(entry.timestamp)}</div>
                )}
                {entry?.userName && entry?.timestamp && (
                  <div className="timeline-step-time" style={{ marginTop: 0 }}>{entry.userName}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {task.specialInstructions && (
        <div className={styles.alertWarning}>
          <div className={styles.alertIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div className={styles.alertContent}>
            <strong>Besondere Anweisung</strong>
            <p>{task.specialInstructions}</p>
          </div>
        </div>
      )}

      {item?.specialNotes && (
        <div className={styles.alertInfo}>
          <div className={styles.alertIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </div>
          <div className={styles.alertContent}>
            <strong>Produkt-Hinweis ({item.sku})</strong>
            <p>{item.specialNotes}</p>
          </div>
        </div>
      )}

      <div className={styles.tabsRow}>
        <div className="tabs">
          <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Übersicht</button>
          <button className={`tab ${activeTab === 'components' ? 'active' : ''}`} onClick={() => setActiveTab('components')}>Stückliste</button>
          <button className={`tab ${activeTab === 'instructions' ? 'active' : ''}`} onClick={() => setActiveTab('instructions')}>Bauanleitung</button>
        </div>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'overview' && (
          <div className={styles.overviewGrid}>
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Details</h3>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Referenz:</span>
                <span className={styles.detailValue} style={{ fontFamily: 'var(--font-mono)' }}>{task.referenceId}</span>
              </div>
              {task.batchNumber && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Charge:</span>
                  <span className={styles.detailValue} style={{ fontFamily: 'var(--font-mono)' }}>{task.batchNumber}</span>
                </div>
              )}
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Endprodukt:</span>
                <span className={styles.detailValue}>
                  <Link href={`/items/${item.id}`} className={styles.link}>{item.name}</Link>
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>SKU:</span>
                <span className={styles.detailValue} style={{ fontFamily: 'var(--font-mono)' }}>{item.sku}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Fällig am:</span>
                <span className={styles.detailValue}>{new Date(task.dueDate).toLocaleDateString('de-DE')}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Verantwortlich:</span>
                <span className={styles.detailValue}>{task.assignedToUser?.name || 'Nicht zugewiesen'}</span>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Fortschritt</h3>
              <div className={styles.progressHeader}>
                <span className={styles.progressText}>{task.completedQuantity} / {task.estimatedQuantity} Stück</span>
                <span className={styles.progressPercent}>{Math.round((task.completedQuantity / task.estimatedQuantity) * 100)}%</span>
              </div>
              <div className="progress-bar" style={{ height: '8px', marginBottom: 'var(--space-6)' }}>
                <div className="progress-bar-fill" style={{ width: `${(task.completedQuantity / task.estimatedQuantity) * 100}%` }} />
              </div>
              
              <div className="form-group" style={{ marginBottom: '0' }}>
                <label className="form-label">Mengenmeldung erfassen</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="number" className="form-input" placeholder="+ Menge" style={{ width: '120px' }} />
                  <button className="btn btn-secondary">Melden</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <div className="card card-flat" style={{ border: '1px solid var(--color-border)' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Menge</th>
                  <th>Einheit</th>
                  <th>Komponente / Material</th>
                  <th>Besonderheiten</th>
                </tr>
              </thead>
              <tbody>
                {item?.components?.map(comp => (
                  <tr key={comp.id}>
                    <td style={{ fontWeight: 'var(--font-weight-bold)' }}>{comp.quantity}</td>
                    <td>{comp.unit}</td>
                    <td>{comp.name}</td>
                    <td>{comp.notes || comp.alternativeComponent || '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'instructions' && (
          <div className={styles.instructionsContainer}>
            {item?.instructions?.map(step => (
              <div key={step.step} className={styles.stepCard}>
                <div className={styles.stepNumber}>{step.step}</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
