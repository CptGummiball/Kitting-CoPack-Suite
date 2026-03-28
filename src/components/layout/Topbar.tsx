'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import styles from './topbar.module.css';

export default function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const roleLabel = user.role === 'admin' ? 'Administrator' : user.role === 'supervisor' ? 'Supervisor' : 'Mitarbeiter';

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        {/* Breadcrumb / search placeholder */}
      </div>
      <div className={styles.right}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userMeta}>
            <span className={styles.userName}>{user.name}</span>
            <span className={styles.userRole}>{roleLabel}</span>
          </div>
          <button className={`btn btn-ghost btn-sm ${styles.logoutBtn}`} onClick={handleLogout} title="Abmelden">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
