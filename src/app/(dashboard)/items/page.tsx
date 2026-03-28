'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import type { Item } from '@/lib/data/types';
import styles from './items.module.css';

export default function ItemsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/items')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className={styles.page}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Items / Endprodukte</h1>
          <p className="page-subtitle">Verwaltung der Kitting- und CoPack-Produkte</p>
        </div>
        <div className="page-actions">
          {(user.role === 'admin' || user.role === 'supervisor') && (
            <Link href="/items/new" className="btn btn-primary">Neues Item</Link>
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
              placeholder="Suchen nach SKU oder Name..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name / Beschreibung</th>
                <th>Komponenten</th>
                <th>Status</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                    Lade Items...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                      <p>Keine Items gefunden.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="clickable" onClick={() => window.location.href = `/items/${item.id}`}>
                    <td style={{ fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-mono)' }}>{item.sku}</td>
                    <td>
                      <div className={styles.itemTitleCell}>
                        <span className={styles.itemTitle}>{item.name}</span>
                        <span className={styles.itemSubtext}>{item.description.substring(0, 80)}{item.description.length > 80 ? '...' : ''}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                        {item.components?.length || 0} Teile
                      </span>
                    </td>
                    <td>
                      {item.isActive 
                        ? <span className="badge badge-success">Aktiv</span>
                        : <span className="badge badge-error">Inaktiv</span>
                      }
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <Link href={`/items/${item.id}`} className="btn btn-ghost btn-sm">Details</Link>
                    </td>
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
