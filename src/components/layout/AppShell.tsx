'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import styles from './app-shell.module.css';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [primaryColor, setPrimaryColor] = React.useState<string | null>(null);

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
