'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import Link from 'next/link';
import type { Component, InstructionStep } from '@/lib/data/types';

export default function NewItemPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Basic Details
  const [sku, setSku] = useState('');
  const [ean, setEan] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [requiresBatchNumber, setRequiresBatchNumber] = useState(false);
  
  // Components (BOM)
  const [components, setComponents] = useState<Omit<Component, 'id'>[]>([]);
  
  // Instructions
  const [instructions, setInstructions] = useState<InstructionStep[]>([]);

  const addComponent = () => {
    setComponents([...components, { name: '', quantity: 1, unit: 'Stück', notes: '' }]);
  };

  const updateComponent = (index: number, field: string, value: string | number) => {
    const updated = [...components];
    // @ts-expect-error dynamic update
    updated[index][field] = value;
    setComponents(updated);
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const addInstruction = () => {
    setInstructions([...instructions, { step: instructions.length + 1, title: '', description: '' }]);
  };

  const updateInstruction = (index: number, field: string, value: string) => {
    const updated = [...instructions];
    // @ts-expect-error dynamic update
    updated[index][field] = value;
    setInstructions(updated);
  };

  const removeInstruction = (index: number) => {
    const updated = instructions.filter((_, i) => i !== index).map((inst, i) => ({ ...inst, step: i + 1 }));
    setInstructions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku,
          ean,
          name,
          description,
          specialNotes,
          requiresBatchNumber,
          components: components.map((c, i) => ({ ...c, id: `comp-new-${i}` })),
          instructions,
          labelConfigs: [], // Can be configured later
          isActive: true
        }),
      });

      if (res.ok) {
        const newItem = await res.json();
        router.push(`/items/${newItem.id}`); // Assuming you have an item detail page, or /items
      } else {
        alert('Fehler beim Erstellen des Items');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  if (!user || parseInt(user.role === 'admin' ? "3" : user.role === 'supervisor' ? "2" : "1") < 2) {
    return <div className="empty-state">Zugriff verweigert</div>;
  }

  return (
    <div className="page-animation-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Neues Endprodukt (Item)</h1>
          <p className="page-subtitle">Artikel, Stückliste und Bauanleitung definieren</p>
        </div>
        <div className="page-actions">
          <Link href="/items" className="btn btn-ghost">Abbrechen</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>1. Grunddaten</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label form-label-required">SKU (Artikelnummer)</label>
              <input 
                type="text" 
                className="form-input" 
                required
                style={{ fontFamily: 'var(--font-mono)' }}
                placeholder="z.B. PROD-1002"
                value={sku}
                onChange={e => setSku(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">EAN (Barcode)</label>
              <input 
                type="text" 
                className="form-input" 
                style={{ fontFamily: 'var(--font-mono)' }}
                placeholder="Optional (z.B. 4001234567890)"
                value={ean}
                onChange={e => setEan(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">Name</label>
              <input 
                type="text" 
                className="form-input" 
                required
                placeholder="z.B. Geschenkbox Premium"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Beschreibung</label>
            <textarea 
              className="form-input" 
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={requiresBatchNumber}
                onChange={e => setRequiresBatchNumber(e.target.checked)}
              />
              <strong>Chargennummer für Kitting-Tasks generieren</strong>
            </label>
            <span className="form-help">Wenn aktiviert, wird bei jedem neuen Task für dieses Produkt automatisch eine eindeutige Chargennummer erstellt.</span>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Wichtige Hinweise (werden im Task prominent angezeigt)</label>
            <textarea 
              className="form-input" 
              rows={2}
              value={specialNotes}
              onChange={e => setSpecialNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h3 className="card-title">2. Stückliste (Bill of Materials)</h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addComponent}>+ Material hinzufügen</button>
          </div>

          {components.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-6)' }}>Keine Materialien definiert</div>
          ) : (
            <table className="table" style={{ marginBottom: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Menge</th>
                  <th style={{ width: '120px' }}>Einheit</th>
                  <th>Material / Komponente</th>
                  <th>Hinweis</th>
                  <th style={{ width: '60px' }}></th>
                </tr>
              </thead>
              <tbody>
                {components.map((comp, idx) => (
                  <tr key={idx}>
                    <td>
                      <input type="number" className="form-input" style={{ padding: '6px' }} min="0.1" step="0.1" required value={comp.quantity} onChange={e => updateComponent(idx, 'quantity', parseFloat(e.target.value))} />
                    </td>
                    <td>
                      <input type="text" className="form-input" style={{ padding: '6px' }} required value={comp.unit} onChange={e => updateComponent(idx, 'unit', e.target.value)} />
                    </td>
                    <td>
                      <input type="text" className="form-input" style={{ padding: '6px' }} required value={comp.name} placeholder="Materialbezeichnung..." onChange={e => updateComponent(idx, 'name', e.target.value)} />
                    </td>
                    <td>
                      <input type="text" className="form-input" style={{ padding: '6px' }} value={comp.notes} onChange={e => updateComponent(idx, 'notes', e.target.value)} />
                    </td>
                    <td>
                      <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }} onClick={() => removeComponent(idx)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h3 className="card-title">3. Bauanleitung (Schritte)</h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addInstruction}>+ Schritt hinzufügen</button>
          </div>

          {instructions.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-6)' }}>Keine Anleitung definiert</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {instructions.map((inst, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)' }}>
                  <div style={{ 
                    width: 30, height: 30, borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0
                  }}>
                    {inst.step}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Titel des Schritts (z.B. Karton falten)" 
                      required 
                      value={inst.title} 
                      onChange={e => updateInstruction(idx, 'title', e.target.value)} 
                    />
                    <textarea 
                      className="form-input" 
                      rows={2} 
                      placeholder="Detaillierte Anweisung..." 
                      required 
                      value={inst.description} 
                      onChange={e => updateInstruction(idx, 'description', e.target.value)} 
                    />
                  </div>
                  <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', color: 'var(--color-error)' }} onClick={() => removeInstruction(idx)}>
                    Löschen
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
          <Link href="/items" className="btn btn-ghost">Abbrechen</Link>
          <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting || !sku || !name}>
            {isSubmitting ? 'Wird gespeichert...' : 'Produkt speichern'}
          </button>
        </div>
      </form>
    </div>
  );
}
