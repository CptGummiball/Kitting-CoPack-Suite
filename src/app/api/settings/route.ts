import { db } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await db.getSettings();
    return Response.json(settings);
  } catch {
    return Response.json({ error: 'Fehler beim Laden der Einstellungen' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const settings = await db.updateSettings(body);
    return Response.json(settings);
  } catch {
    return Response.json({ error: 'Fehler beim Speichern der Einstellungen' }, { status: 500 });
  }
}
