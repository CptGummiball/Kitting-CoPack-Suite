'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import type { Task, Item, LabelTemplate } from '@/lib/data/types';
import { useSearchParams } from 'next/navigation';
import styles from './print-center.module.css';

export default function PrintCenterPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialTaskId = searchParams?.get('taskId');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<LabelTemplate | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isPrinting, setIsPrinting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/tasks').then(r => r.json()),
      fetch('/api/labels').then(r => r.json())
    ]).then(([tasksData, templatesData]) => {
      setTasks(tasksData);
      setTemplates(templatesData);
      
      if (initialTaskId) {
        const t = tasksData.find((t: Task) => t.id === initialTaskId);
        if (t) {
          setSelectedTask(t);
          if (t.item?.labelConfigs?.length > 0) {
            const defaultTplId = t.item.labelConfigs[0].templateId;
            const defaultTpl = templatesData.find((tpl: LabelTemplate) => tpl.id === defaultTplId);
            if (defaultTpl) setSelectedTemplate(defaultTpl);
            setQuantity(t.item.labelConfigs[0].defaultQuantity || 1);
          }
        }
      }
      setLoading(false);
    });
  }, [initialTaskId]);

  const handleTaskChange = (taskId: string) => {
    const t = tasks.find(t => t.id === taskId);
    setSelectedTask(t || null);
    
    // Auto-select template based on item defaults
    if (t?.item?.labelConfigs?.length) {
      const defaultTpl = templates.find(tpl => tpl.id === t.item!.labelConfigs[0].templateId);
      if (defaultTpl) setSelectedTemplate(defaultTpl);
      setQuantity(t.item!.labelConfigs[0].defaultQuantity || 1);
    }
  };

  const handlePrint = async () => {
    if (!selectedTemplate || quantity < 1) return;
    setIsPrinting(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          taskId: selectedTask?.id,
          itemId: selectedTask?.itemId,
          quantity,
          printedBy: user?.id,
          printedByName: user?.name,
          printerName: "Zebra ZD420 - Produktion"
        })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } finally {
      setIsPrinting(false);
    }
  };

  if (!user) return null;

  return (
    <div className={styles.page}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Label-Druckcenter</h1>
          <p className="page-subtitle">Zebra-Etiketten direkt aus Tasks oder standalone drucken</p>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.formCol}>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Druckeinstellungen</h3>
            
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">Zugehöriger Task (optional)</label>
              <select 
                className="form-select"
                value={selectedTask?.id || ''}
                onChange={e => handleTaskChange(e.target.value)}
                disabled={loading}
              >
                <option value="">-- Keinen Task auswählen --</option>
                {tasks.filter(t => t.status !== 'completed').map(t => (
                  <option key={t.id} value={t.id}>{t.referenceId} - {t.title}</option>
                ))}
              </select>
            </div>

            {selectedTask?.item && (
              <div className={styles.activeItemCard}>
                <strong>Ausgewähltes Produkt:</strong><br/>
                {selectedTask.item.sku} - {selectedTask.item.name}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label form-label-required">Label-Vorlage</label>
              <select 
                className="form-select"
                value={selectedTemplate?.id || ''}
                onChange={e => setSelectedTemplate(templates.find(t => t.id === e.target.value) || null)}
                disabled={loading}
              >
                <option value="">-- Vorlage wählen --</option>
                {templates.map(tpl => (
                  <option key={tpl.id} value={tpl.id}>{tpl.name} ({tpl.size})</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
              <label className="form-label form-label-required">Druckanzahl</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  className="btn btn-secondary btn-icon" 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >-</button>
                <input 
                  type="number" 
                  className="form-input" 
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ textAlign: 'center', fontWeight: 'bold' }}
                />
                <button 
                  className="btn btn-secondary btn-icon" 
                  onClick={() => setQuantity(quantity + 1)}
                >+</button>
              </div>
            </div>

            <button 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%' }}
              disabled={!selectedTemplate || quantity < 1 || isPrinting}
              onClick={handlePrint}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              {isPrinting ? 'Druckauftrag wird gesendet...' : `${quantity} Label(s) drucken`}
            </button>

            {success && (
              <div className="toast toast-success" style={{ position: 'relative', top: 0, right: 0, marginTop: 'var(--space-4)' }}>
                Druckauftrag erfolgreich an "Zebra ZD420" gesendet.
              </div>
            )}
          </div>
        </div>

        <div className={styles.previewCol}>
          <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Druckvorschau</h3>
            <div className={styles.previewArea}>
              {!selectedTemplate ? (
                <div className="empty-state">
                  <span style={{ color: 'var(--color-text-tertiary)' }}>Wählen Sie eine Vorlage aus</span>
                </div>
              ) : (
                <div className={styles.labelCanvas} style={{ 
                  aspectRatio: `${selectedTemplate.width} / ${selectedTemplate.height}`
                }}>
                  {/* Mock Visual Preview of the ZPL template */}
                  {selectedTemplate.fields.map((field, idx) => {
                    const value = field.dataSource === 'item.sku' ? (selectedTask?.item?.sku || '{SKU}') :
                                  field.dataSource === 'item.ean' ? (selectedTask?.item?.ean || '{EAN}') :
                                  field.dataSource === 'item.name' ? (selectedTask?.item?.name || '{Item Name}') :
                                  field.dataSource === 'task.referenceId' ? (selectedTask?.referenceId || '{Task Ref}') :
                                  field.dataSource === 'task.batchNumber' ? (selectedTask?.batchNumber || '{Batch Nr.}') :
                                  field.dataSource === 'date' ? new Date().toLocaleDateString('de-DE') :
                                  `{${field.name}}`;
                                  
                    if (field.type === 'barcode') {
                      return (
                        <div key={idx} className={styles.fieldBarcode} style={{ 
                          left: `${field.x}%`, top: `${field.y}%`, 
                          width: `${field.width}px`, height: `${field.height}px`
                        }}>
                          <div className={styles.barcodeLines} />
                          <span style={{ fontSize: '10px' }}>{value}</span>
                        </div>
                      );
                    }
                    if (field.type === 'qrcode') {
                      return (
                        <div key={idx} className={styles.fieldQrcode} style={{ 
                          left: `${field.x}%`, top: `${field.y}%`, 
                          width: `${field.width}px`, height: `${field.height}px`
                        }}>
                          <div className={styles.qrGrid} />
                        </div>
                      );
                    }
                    return (
                      <div key={idx} className={styles.fieldText} style={{ 
                        left: `${field.x}%`, top: `${field.y}%`, 
                        fontSize: `${Math.max(10, (field.fontSize || 14) * 0.8)}px` 
                      }}>
                        {value}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
