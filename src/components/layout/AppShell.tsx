'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import styles from './app-shell.module.css';
import type { Workstation } from '@/lib/data/types';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading, needsWorkstation, selectWorkstation, workstation } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [primaryColor, setPrimaryColor] = React.useState<string | null>(null);
  const [workstations, setWorkstations] = React.useState<Workstation[]>([]);
  const [wsLoading, setWsLoading] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data?.theme?.primaryColor) {
          setPrimaryColor(data.theme.primaryColor);
        }
      })
      .catch(err => console.error('Failed to load theme settings', err));
  }, []);

  // Load workstations when selection is needed
  React.useEffect(() => {
    if (needsWorkstation) {
      setWsLoading(true);
      fetch('/api/workstations')
        .then(res => res.json())
        .then(data => {
          setWorkstations(Array.isArray(data) ? data.filter((w: Workstation) => w.isActive) : []);
          setWsLoading(false);
        })
        .catch(() => setWsLoading(false));
    }
  }, [needsWorkstation]);

  // Don't show shell on login page
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  // Redirect to login
  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  // Workstation selection modal
  if (needsWorkstation) {
    return (
      <div className={styles.shell}>
        {primaryColor && (
          <style dangerouslySetInnerHTML={{ __html: `
            :root {
              --color-primary: ${primaryColor};
              --color-primary-dark: ${primaryColor}dd;
              --color-primary-light: ${primaryColor}22;
            }
          `}} />
        )}
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)' }}>
                Produktionsplatz auswählen
              </h2>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
                Bitte wählen Sie Ihren Arbeitsplatz aus. Der zugewiesene Drucker wird automatisch für alle Druckaufträge verwendet.
              </p>
              {wsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-8)' }}>
                  <div className={styles.spinner} />
                </div>
              ) : workstations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-tertiary)' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 'var(--space-3)', opacity: 0.5 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p>Keine Produktionsplätze verfügbar. Bitte wenden Sie sich an einen Administrator.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {workstations.map(ws => (
                    <button
                      key={ws.id}
                      className="card card-hover"
                      onClick={() => selectWorkstation(ws)}
                      style={{
                        cursor: 'pointer',
                        textAlign: 'left',
                        border: '1px solid var(--color-border)',
                        padding: 'var(--space-4)',
                        background: 'var(--color-bg-card)',
                        borderRadius: 'var(--radius-lg)',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: '4px' }}>{ws.name}</div>
                          {ws.description && (
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                              {ws.description}
                            </div>
                          )}
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                            </svg>
                            {ws.printerName}
                          </div>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      {primaryColor && (
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --color-primary: ${primaryColor};
            --color-primary-dark: ${primaryColor}dd;
            --color-primary-light: ${primaryColor}22;
          }
        `}} />
      )}
      <Sidebar />
      <div className={styles.main}>
        <Topbar />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
