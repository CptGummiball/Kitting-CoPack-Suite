import { db } from '@/lib/data';
import type { User, UserRole } from '@/lib/data/types';
import { ROLE_TEMPLATES } from '@/lib/data/types';

export const dynamic = 'force-dynamic';

interface ExternalUser {
  email: string;
  name: string;
  role?: string;
  status?: string;
  avatar?: string;
}

/**
 * POST /api/users/sync
 * Synchronize users from an external source (central user pool).
 * Matches by email — creates new users or updates existing ones.
 */
export async function POST() {
  try {
    const settings = await db.getSettings();
    const userSync = (settings as any).userSync;

    if (!userSync?.enabled) {
      return Response.json({ error: 'Benutzer-Synchronisation ist deaktiviert' }, { status: 400 });
    }

    if (!userSync.sourceUrl) {
      return Response.json({ error: 'Keine Quell-URL konfiguriert' }, { status: 400 });
    }

    // Fetch users from external source
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (userSync.apiKey) {
      headers['Authorization'] = `Bearer ${userSync.apiKey}`;
    }

    const res = await fetch(userSync.sourceUrl, { headers });
    if (!res.ok) {
      return Response.json({
        error: `Externe Quelle nicht erreichbar (HTTP ${res.status})`,
      }, { status: 400 });
    }

    const externalData = await res.json();
    const externalUsers: ExternalUser[] = Array.isArray(externalData)
      ? externalData
      : externalData.users || externalData.result || [];

    if (!externalUsers.length) {
      return Response.json({
        success: true,
        message: 'Keine Benutzer in der externen Quelle gefunden',
        synced: 0,
        created: 0,
        updated: 0,
      });
    }

    const existingUsers = await db.getUsers();
    let created = 0;
    let updated = 0;

    for (const extUser of externalUsers) {
      if (!extUser.email) continue;

      const existing = existingUsers.find(u => u.email === extUser.email);
      const role: UserRole = (['admin', 'supervisor', 'user'].includes(extUser.role || '')
        ? extUser.role as UserRole
        : 'user');

      if (existing) {
        // Update existing user
        await db.updateUser(existing.id, {
          name: extUser.name || existing.name,
          role,
          avatar: extUser.avatar || existing.avatar,
        } as Partial<User>);
        updated++;
      } else {
        // Create new user
        await db.createUser({
          email: extUser.email,
          name: extUser.name || extUser.email,
          role,
          status: (extUser.status === 'inactive' ? 'inactive' : 'active') as User['status'],
          permissions: ROLE_TEMPLATES[role] || ROLE_TEMPLATES.user,
          avatar: extUser.avatar,
        } as Omit<User, 'id' | 'createdAt' | 'updatedAt'>);
        created++;
      }
    }

    // Update last sync timestamp
    await db.updateSettings({
      userSync: { ...userSync, lastSyncAt: new Date().toISOString() },
    } as any);

    return Response.json({
      success: true,
      message: 'Benutzer-Synchronisation abgeschlossen',
      synced: created + updated,
      created,
      updated,
    });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Sync-Fehler' }, { status: 500 });
  }
}
