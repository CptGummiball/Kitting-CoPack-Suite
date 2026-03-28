'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import type { Item, User } from '@/lib/data/types';
import Link from 'next/link';

export default function NewTaskPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    referenceId: '',
    itemId: '',
    priority: 'medium',
    status: 'planned',
    estimatedQuantity: 100,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next week
    assignedTo: '',
    specialInstructions: '',
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/items').then(res => res.json()),
      fetch('/api/users').then(res => res.json()),
    ]).then(([itemsData, usersData]) => {
      setItems(itemsData);
      setUsers(usersData);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          completedQuantity: 0,
          progress: 0,
          plannedDate: new Date().toISOString(),
          createdBy: user?.id,
          // We don't send item/assignedToUser full objects, backend handles relations or we store IDs
        }),
      });

      if (res.ok) {
        const newTask = await res.json();
        router.push(`/tasks/${newTask.id}`);
      } else {
        alert('Fehler beim Erstellen des Tasks');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'supervisor')) {
    return (
      <div className="empty-state">
        <p>Sie haben keine Berechtigung, Tasks zu erstellen.</p>
      </div>
    );
  }

  return (
    <div className="page-animation-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Neuer Task</h1>
          <p className="page-subtitle">Produktions- oder CoPack-Auftrag anlegen</p>
        </div>
        <div className="page-actions">
          <Link href="/tasks" className="btn btn-ghost">Abbrechen</Link>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          <div className="grid-2-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            
            {/* Left Column */}
            <div>
              <div className="form-group">
                <label className="form-label form-label-required">Titel</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  placeholder="z.B. Sommer-Promotions-Box zusammenstellen"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Referenz / Auftragsnummer</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  style={{ fontFamily: 'var(--font-mono)' }}
                  placeholder="z.B. TASK-2026-04-001"
                  value={formData.referenceId}
                  onChange={e => setFormData({...formData, referenceId: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Endprodukt (Item)</label>
                <select 
                  className="form-select"
                  required
                  value={formData.itemId}
                  onChange={e => setFormData({...formData, itemId: e.target.value})}
                >
                  <option value="">-- Produkt wählen --</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>{item.sku} - {item.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Zielmenge</label>
                <input 
                  type="number" 
                  className="form-input" 
                  required
                  min="1"
                  value={formData.estimatedQuantity}
                  onChange={e => setFormData({...formData, estimatedQuantity: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="form-group">
                <label className="form-label form-label-required">Fällig am</label>
                <input 
                  type="date" 
                  className="form-input" 
                  required
                  value={formData.dueDate}
                  onChange={e => setFormData({...formData, dueDate: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Priorität</label>
                <select 
                  className="form-select"
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="critical">Kritisch</option>
                  <option value="high">Hoch</option>
                  <option value="medium">Mittel</option>
                  <option value="low">Niedrig</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Zuweisung (Optional)</label>
                <select 
                  className="form-select"
                  value={formData.assignedTo}
                  onChange={e => setFormData({...formData, assignedTo: e.target.value})}
                >
                  <option value="">-- Nicht zugewiesen --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-8)' }}>
            <label className="form-label">Besondere Anweisungen</label>
            <textarea 
              className="form-input" 
              rows={4}
              placeholder="Hinweise für die Mitarbeiter in der Produktion..."
              value={formData.specialInstructions}
              onChange={e => setFormData({...formData, specialInstructions: e.target.value})}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-5)' }}>
            <Link href="/tasks" className="btn btn-ghost">Abbrechen</Link>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || !formData.title || !formData.referenceId || !formData.itemId}>
              {isSubmitting ? 'Wird erstellt...' : 'Task erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
