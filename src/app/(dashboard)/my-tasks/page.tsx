'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import type { Task } from '@/lib/data/types';

export default function MyTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    // In a real app we would pass ?assignedTo=userId to the API
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => {
        const myTasks = data.filter((t: Task) => t.assignedTo === user.id);
        
        // Sort: In-Progress first, then Critical, High priority...
        myTasks.sort((a: Task, b: Task) => {
          if (a.status === 'in-progress' && b.status !== 'in-progress') return -1;
          if (b.status === 'in-progress' && a.status !== 'in-progress') return 1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        
        setTasks(myTasks);
        setLoading(false);
      });
  }, [user]);

  if (!user) return null;

  return (
    <div className="page-animation-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Meine Aufgaben</h1>
          <p className="page-subtitle">Alle Tasks, die Ihnen direkt zugewiesen sind</p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>Aufgaben werden geladen...</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1" style={{ marginBottom: 'var(--space-4)' }}>
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p>Juhu! Sie haben keine offenen Zugewiesenen Aufgaben.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Referenz & Titel</th>
                  <th>Produkt</th>
                  <th>Status</th>
                  <th>Fortschritt</th>
                  <th>Deadline</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} style={{ borderLeft: task.status === 'in-progress' ? '3px solid var(--color-primary)' : '3px solid transparent' }}>
                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{task.referenceId}</div>
                      <div style={{ fontWeight: '500' }}>{task.title}</div>
                      {task.priority === 'critical' && <span className="badge badge-error" style={{ zoom: 0.8, marginTop: '4px' }}>Kritisch</span>}
                    </td>
                    <td style={{ fontSize: '12px' }}>
                      {task.item?.sku || task.itemId}
                    </td>
                    <td>
                      <span className={`badge ${
                        task.status === 'completed' ? 'badge-success' :
                        task.status === 'in-progress' ? 'badge-info' :
                        task.status === 'blocked' ? 'badge-error' : 'badge-planned'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td style={{ width: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>
                        <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--color-bg-hover)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${task.progress}%`, height: '100%', backgroundColor: task.status === 'completed' ? 'var(--color-success)' : 'var(--color-primary)', transition: 'width 0.3s ease' }} />
                        </div>
                        <span style={{ minWidth: '35px', textAlign: 'right', fontWeight: '500' }}>{task.progress}%</span>
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {task.completedQuantity} / {task.estimatedQuantity}
                      </div>
                    </td>
                    <td style={{ fontSize: '12px', color: new Date(task.dueDate) < new Date() ? 'var(--color-error)' : 'inherit' }}>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                    <td>
                      <Link href={`/tasks/${task.id}`} className="btn btn-secondary btn-sm">Bearbeiten</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
