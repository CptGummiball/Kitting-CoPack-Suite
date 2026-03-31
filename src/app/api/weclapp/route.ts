import { db } from '@/lib/data';

export const dynamic = 'force-dynamic';

// Test connection / get articles
export async function GET(request: Request) {
  try {
    const settings = await db.getSettings();
    if (!settings.weclapp.enabled) {
      return Response.json({ error: 'Weclapp-Integration ist deaktiviert' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'test';

    const baseUrl = settings.weclapp.tenantUrl.replace(/\/$/, '');
    const headers: HeadersInit = {
      'AuthenticationToken': settings.weclapp.apiToken,
      'Content-Type': 'application/json',
    };

    if (action === 'test') {
      // Test connection by fetching tenant info
      const res = await fetch(`${baseUrl}/webapp/api/v1/tenant`, { headers });
      if (!res.ok) {
        return Response.json({ 
          success: false, 
          error: `Verbindung fehlgeschlagen (HTTP ${res.status})` 
        }, { status: 400 });
      }
      const data = await res.json();
      return Response.json({ success: true, tenant: data });
    }

    if (action === 'articles') {
      const res = await fetch(`${baseUrl}/webapp/api/v1/article?pageSize=50`, { headers });
      if (!res.ok) {
        return Response.json({ error: 'Artikel konnten nicht abgerufen werden' }, { status: 400 });
      }
      const data = await res.json();
      return Response.json({ success: true, articles: data.result || [] });
    }

    return Response.json({ error: 'Unbekannte Aktion' }, { status: 400 });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Weclapp-Fehler' }, { status: 500 });
  }
}

// Trigger sync
export async function POST(request: Request) {
  try {
    const settings = await db.getSettings();
    if (!settings.weclapp.enabled) {
      return Response.json({ error: 'Weclapp-Integration ist deaktiviert' }, { status: 400 });
    }

    const body = await request.json();
    const action = body.action || 'sync';

    if (action === 'sync') {
      // Update last sync timestamp
      await db.updateSettings({
        weclapp: { ...settings.weclapp, lastSyncAt: new Date().toISOString() }
      });
      return Response.json({ success: true, message: 'Synchronisation gestartet' });
    }

    return Response.json({ error: 'Unbekannte Aktion' }, { status: 400 });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Weclapp-Sync-Fehler' }, { status: 500 });
  }
}
