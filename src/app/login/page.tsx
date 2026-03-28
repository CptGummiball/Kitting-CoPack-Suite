'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

const DEMO_USERS = [
  { email: 'admin@kitting-suite.local', password: 'admin', label: 'Admin', role: 'Administrator' },
  { email: 'supervisor@kitting-suite.local', password: 'supervisor', label: 'Supervisor', role: 'Supervisor' },
  { email: 'worker@kitting-suite.local', password: 'worker', label: 'Mitarbeiter', role: 'Standard' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(email, password);
    if (success) {
      router.push('/');
    } else {
      setError('Ungültige Anmeldedaten oder Konto deaktiviert.');
    }
    setIsLoading(false);
  };

  const handleQuickLogin = async (demoEmail: string, demoPassword: string) => {
    setError('');
    setIsLoading(true);
    const success = await login(demoEmail, demoPassword);
    if (success) {
      router.push('/');
    } else {
      setError('Login fehlgeschlagen.');
    }
    setIsLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.backdrop} />
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#2563eb" />
              <path d="M12 14h16v3H12zm0 5h12v3H12zm0 5h16v3H12z" fill="#fff" opacity=".9"/>
              <rect x="26" y="19" width="6" height="12" rx="1" fill="#fff" opacity=".7"/>
            </svg>
          </div>
          <h1 className={styles.title}>Kitting & CoPack Suite</h1>
          <p className={styles.subtitle}>Melden Sie sich an, um fortzufahren</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10.5a.75.75 0 110-1.5.75.75 0 010 1.5zM8.75 4.75v4.5a.75.75 0 01-1.5 0v-4.5a.75.75 0 011.5 0z"/>
              </svg>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">E-Mail</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="ihre@email.de"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Passwort</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? 'Anmelden...' : 'Anmelden'}
          </button>
        </form>

        <div className={styles.divider}>
          <span>Demo-Zugänge</span>
        </div>

        <div className={styles.demoUsers}>
          {DEMO_USERS.map(demo => (
            <button
              key={demo.email}
              className={styles.demoButton}
              onClick={() => handleQuickLogin(demo.email, demo.password)}
              disabled={isLoading}
            >
              <span className={styles.demoLabel}>{demo.label}</span>
              <span className={styles.demoRole}>{demo.role}</span>
            </button>
          ))}
        </div>

        <p className={styles.footer}>
          Powered by <strong>ePerformances</strong>
        </p>
      </div>
    </div>
  );
}
