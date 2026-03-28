'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import Link from 'next/link';
import type { UserRole } from '@/lib/data/types';

export default function NewUserPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as UserRole,
    status: 'active',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create user api call
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/users');
      } else {
        alert('Fehler beim Erstellen des Benutzers');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  if (!user || !isAdmin) {
    return <div className="empty-state">Zugriff verweigert</div>;
  }

  return (
    <div className="page-animation-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Neuer Benutzer</h1>
          <p className="page-subtitle">Personal im System anlegen</p>
        </div>
        <div className="page-actions">
          <Link href="/users" className="btn btn-ghost">Abbrechen</Link>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label form-label-required">Vollständiger Name</label>
            <input 
              type="text" 
              className="form-input" 
              required
              placeholder="Max Mustermann"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">E-Mail Adresse (Benutzername)</label>
            <input 
              type="email" 
              className="form-input" 
              required
              placeholder="max.mustermann@firma.local"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Passwort</label>
            <input 
              type="password" 
              className="form-input" 
              required
              placeholder="Initiales Passwort setzen"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Rolle</label>
            <select 
              className="form-select"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
            >
              <option value="user">Standard (Produktionsmitarbeiter)</option>
              <option value="supervisor">Supervisor (Teamleiter, Schichtleiter)</option>
              <option value="admin">Administrator (IT, Werksleitung)</option>
            </select>
            <p className="form-help">
              Die Rolle bestimmt die grundlegenden Berechtigungen im System.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Status</label>
            <select 
              className="form-select"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="active">Aktiv</option>
              <option value="inactive">Inaktiv</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-5)', marginTop: 'var(--space-6)' }}>
            <Link href="/users" className="btn btn-ghost">Abbrechen</Link>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || !formData.name || !formData.email || !formData.password}>
              {isSubmitting ? 'Wird erstellt...' : 'Benutzer anlegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
