'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import Link from 'next/link';

type FieldType = 'text' | 'barcode' | 'qrcode';

interface EditorField {
  id: string;
  name: string;
  type: FieldType;
  x: number;
  y: number;
  dataSource: string;
  fontSize: number;
  width: number;
  height: number;
}

export default function NewLabelPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sizeStr, setSizeStr] = useState('100x50mm');
  const [widthMm, setWidthMm] = useState(100);
  const [heightMm, setHeightMm] = useState(50);
  const [isActive, setIsActive] = useState(true);

  const [fields, setFields] = useState<EditorField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  // Auto-update width/height when dropdown changes
  useEffect(() => {
    if (sizeStr === 'custom') return;
    const [w, h] = sizeStr.replace('mm', '').split('x').map(Number);
    if (w && h) {
      setWidthMm(w);
      setHeightMm(h);
    }
  }, [sizeStr]);

  const addField = (type: FieldType) => {
    const newField: EditorField = {
      id: Math.random().toString(36).substring(7),
      name: `Neues Element (${type})`,
      type,
      x: 10,
      y: 10,
      dataSource: type === 'text' ? 'Beispieltext' : '{item.sku}',
      fontSize: type === 'text' ? 4 : 0, // ZPL font size 1-9 or exact dots
      width: type === 'text' ? 0 : 3, // module width for barcode
      height: type === 'text' ? 0 : 10, // mm height for barcode
    };
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const updateField = (id: string, updates: Partial<EditorField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  // Generate ZPL based on fields
  // Assuming 8 dots per mm (203 dpi)
  const generateZPL = () => {
    const DPI = 8; 
    let zpl = '^XA\n'; // Start format
    zpl += `^PW${widthMm * DPI}\n`; // Print width
    zpl += `^LL${heightMm * DPI}\n`; // Label length
    
    fields.forEach(f => {
      const xDots = Math.round(f.x * DPI);
      const yDots = Math.round(f.y * DPI);
      zpl += `^FO${xDots},${yDots}`;
      
      if (f.type === 'text') {
        const fontH = Math.round((f.fontSize || 4) * DPI);
        zpl += `^A0N,${fontH},${Math.round(fontH * 0.8)}^FD${f.dataSource}^FS\n`;
      } else if (f.type === 'barcode') {
        const barH = Math.round((f.height || 10) * DPI);
        const barW = f.width || 2;
        zpl += `^BCN,${barH},Y,N,N,A^BY${barW}^FD${f.dataSource}^FS\n`;
      } else if (f.type === 'qrcode') {
        const qrScale = f.width || 4; // 1-10
        zpl += `^BQN,2,${qrScale}^FDQA,${f.dataSource}^FS\n`;
      }
    });
    
    zpl += '^XZ'; // End format
    return zpl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fields.length === 0) {
      alert("Bitte fügen Sie mindestens ein Element zum Label hinzu.");
      return;
    }
    
    setIsSubmitting(true);
    const zplTemplate = generateZPL();

    try {
      const res = await fetch('/api/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          size: sizeStr === 'custom' ? `${widthMm}x${heightMm}mm` : sizeStr,
          width: widthMm,
          height: heightMm,
          zplTemplate,
          isActive,
          fields: fields.map(f => ({
            name: f.name,
            type: f.type,
            x: f.x,
            y: f.y,
            width: f.width,
            height: f.height,
            fontSize: f.fontSize,
            dataSource: f.dataSource
          }))
        }),
      });

      if (res.ok) {
        router.push('/labels');
      } else {
        alert('Fehler beim Speichern der Vorlage');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  if (!user || !isAdmin) return <div className="empty-state">Zugriff verweigert</div>;

  const selectedField = fields.find(f => f.id === selectedFieldId);

  // Preview Scale
  // Assuming preview area is ~500px wide. We scale the label to roughly fit.
  const previewScale = 400 / widthMm; 

  return (
    <div className="page-animation-fade" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 'calc(100vh - 100px)' }}>
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">Mächtiger Label Editor</h1>
          <p className="page-subtitle">Visuell Labels gestalten & automatisch ZPL für Zebra-Drucker generieren.</p>
        </div>
        <div className="page-actions">
          <Link href="/labels" className="btn btn-ghost">Abbrechen</Link>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting || !name}>
            {isSubmitting ? 'Wird gespeichert...' : 'Vorlage speichern'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-4)', flex: 1, minHeight: 0 }}>
        {/* LEFT COMPONENT: Settings & Elements */}
        <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', overflowY: 'auto', paddingRight: '4px' }}>
          
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <h3 className="card-title" style={{ fontSize: '14px', marginBottom: 'var(--space-3)' }}>1. Label Metadaten</h3>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Name der Vorlage (z.B. Versandetikett)" 
              value={name} 
              onChange={e => setName(e.target.value)}
              style={{ marginBottom: 'var(--space-3)' }}
              required
            />
            <select className="form-select" value={sizeStr} onChange={e => setSizeStr(e.target.value)} style={{ marginBottom: 'var(--space-3)' }}>
              <option value="100x150mm">100 x 150 mm (Groß)</option>
              <option value="100x50mm">100 x 50 mm (Standard)</option>
              <option value="50x25mm">50 x 25 mm (Klein)</option>
              <option value="custom">Benutzerdefiniert</option>
            </select>
            {sizeStr === 'custom' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="number" className="form-input" placeholder="Breite (mm)" value={widthMm} onChange={e => setWidthMm(Number(e.target.value))} />
                <input type="number" className="form-input" placeholder="Höhe (mm)" value={heightMm} onChange={e => setHeightMm(Number(e.target.value))} />
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <h3 className="card-title" style={{ fontSize: '14px', marginBottom: 'var(--space-3)' }}>2. Elemente hinzufügen</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => addField('text')}>Text</button>
              <button className="btn btn-secondary btn-sm" onClick={() => addField('barcode')}>Barcode</button>
              <button className="btn btn-secondary btn-sm" onClick={() => addField('qrcode')}>QR Code</button>
            </div>
          </div>

          {selectedField && (
             <div className="card" style={{ padding: 'var(--space-4)', flex: 1, border: '1px solid var(--color-primary)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                 <h3 className="card-title" style={{ fontSize: '14px', color: 'var(--color-primary)' }}>Eigenschaften: {selectedField.type}</h3>
                 <button onClick={() => removeField(selectedField.id)} style={{ color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Löschen</button>
               </div>
               
               <div className="form-group">
                 <label className="form-label" style={{ fontSize: '11px' }}>Feld-Name (Intern)</label>
                 <input type="text" className="form-input" style={{ padding: '4px 8px', fontSize: '12px' }} value={selectedField.name} onChange={e => updateField(selectedField.id, { name: e.target.value })} />
               </div>

               <div className="form-group">
                 <label className="form-label" style={{ fontSize: '11px' }}>Inhalt / Platzhalter</label>
                 <input type="text" className="form-input" style={{ padding: '4px 8px', fontSize: '12px' }} value={selectedField.dataSource} onChange={e => updateField(selectedField.id, { dataSource: e.target.value })} />
               <span className="form-help" style={{ fontSize: '10px' }}>Platzhalter: {'{item.sku}, {item.ean}, {task.referenceId}, {task.batchNumber}'} usw.</span>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                 <div className="form-group" style={{ marginBottom: 0 }}>
                   <label className="form-label" style={{ fontSize: '11px' }}>X Position (mm)</label>
                   <input type="number" className="form-input" style={{ padding: '4px 8px', fontSize: '12px' }} value={selectedField.x} onChange={e => updateField(selectedField.id, { x: Number(e.target.value) })} />
                 </div>
                 <div className="form-group" style={{ marginBottom: 0 }}>
                   <label className="form-label" style={{ fontSize: '11px' }}>Y Position (mm)</label>
                   <input type="number" className="form-input" style={{ padding: '4px 8px', fontSize: '12px' }} value={selectedField.y} onChange={e => updateField(selectedField.id, { y: Number(e.target.value) })} />
                 </div>
               </div>

               {selectedField.type === 'text' && (
                 <div className="form-group">
                   <label className="form-label" style={{ fontSize: '11px' }}>Schriftgröße (ca. mm)</label>
                   <input type="number" className="form-input" style={{ padding: '4px 8px', fontSize: '12px' }} value={selectedField.fontSize} onChange={e => updateField(selectedField.id, { fontSize: Number(e.target.value) })} />
                 </div>
               )}

               {selectedField.type === 'barcode' && (
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                   <div className="form-group">
                     <label className="form-label" style={{ fontSize: '11px' }}>Höhe (mm)</label>
                     <input type="number" className="form-input" style={{ padding: '4px 8px', fontSize: '12px' }} value={selectedField.height} onChange={e => updateField(selectedField.id, { height: Number(e.target.value) })} />
                   </div>
                   <div className="form-group">
                     <label className="form-label" style={{ fontSize: '11px' }}>Balken-Dicke (1-10)</label>
                     <input type="number" className="form-input" style={{ padding: '4px 8px', fontSize: '12px' }} value={selectedField.width} onChange={e => updateField(selectedField.id, { width: Number(e.target.value) })} />
                   </div>
                 </div>
               )}
               
               {selectedField.type === 'qrcode' && (
                 <div className="form-group">
                   <label className="form-label" style={{ fontSize: '11px' }}>QR-Scale (1-10)</label>
                   <input type="number" className="form-input" style={{ padding: '4px 8px', fontSize: '12px' }} value={selectedField.width} onChange={e => updateField(selectedField.id, { width: Number(e.target.value) })} />
                 </div>
               )}
             </div>
          )}
        </div>

        {/* RIGHT COMPONENT: Visual Preview */}
        <div style={{ flex: 1, backgroundColor: 'var(--color-bg-hover)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'auto' }}>
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-4)', letterSpacing: '1px' }}>Live Vorschau ({widthMm}x{heightMm} mm)</h3>
          
          <div 
            style={{
              width: `${widthMm * previewScale}px`,
              height: `${heightMm * previewScale}px`,
              backgroundColor: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden',
              backgroundImage: 'radial-gradient(circle, #00000011 1px, transparent 1px)',
              backgroundSize: `${previewScale * 5}px ${previewScale * 5}px` // 5mm grid
            }}
          >
            {fields.map(f => {
              const left = f.x * previewScale;
              const top = f.y * previewScale;
              const isSelected = selectedFieldId === f.id;
              
              return (
                <div 
                  key={f.id}
                  onClick={() => setSelectedFieldId(f.id)}
                  style={{
                    position: 'absolute',
                    left: `${left}px`,
                    top: `${top}px`,
                    outline: isSelected ? '2px dashed var(--color-primary)' : '1px solid transparent',
                    cursor: 'pointer',
                    userSelect: 'none',
                    padding: '2px',
                    backgroundColor: isSelected ? 'var(--color-primary-light)' : 'transparent',
                    color: '#000'
                  }}
                >
                  {f.type === 'text' && (
                    <div style={{ fontSize: `${f.fontSize * previewScale}px`, lineHeight: 1, whiteSpace: 'nowrap', fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {f.dataSource}
                    </div>
                  )}
                  {f.type === 'barcode' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ 
                        width: `${f.dataSource.length * f.width * previewScale * 2}px`, 
                        minWidth: '50px',
                        height: `${f.height * previewScale}px`, 
                        backgroundImage: 'repeating-linear-gradient(to right, #000 0, #000 2px, #fff 2px, #fff 4px)',
                        borderLeft: '4px solid #000',
                        borderRight: '4px solid #000'
                      }} />
                      <span style={{ fontSize: `${2 * previewScale}px`, fontFamily: 'monospace' }}>{f.dataSource}</span>
                    </div>
                  )}
                  {f.type === 'qrcode' && (
                    <div style={{ 
                      width: `${f.width * Math.max(5, previewScale)}px`, 
                      height: `${f.width * Math.max(5, previewScale)}px`, 
                      background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' width=\'100%25\' height=\'100%25\'%3E%3Cpath d=\'M3 3h8v8H3zm2 2v4h4V5zm8-2h8v8h-8zm2 2v4h4V5zM3 13h8v8H3zm2 2v4h4v-4zm13-2h3v2h-3zm-5 0h3v2h-3zm0 5h3v2h-3zm-2-3h2v2h-2zm5 3h3v2h-3zm-1-3h2v2h-2z\' fill=\'black\'/%3E%3C/svg%3E") center / contain no-repeat' 
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 'auto', width: '100%', maxWidth: `${widthMm * previewScale}px`, paddingTop: 'var(--space-6)' }}>
             <h4 style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Generierter ZPL Code (Auto)</h4>
             <textarea 
               value={generateZPL()} 
               readOnly
               style={{ width: '100%', height: '80px', fontSize: '10px', fontFamily: 'monospace', resize: 'vertical', backgroundColor: '#1e1e1e', color: '#d4d4d4', padding: '8px', borderRadius: '4px', border: 'none' }}
             />
          </div>

        </div>
      </div>
    </div>
  );
}
