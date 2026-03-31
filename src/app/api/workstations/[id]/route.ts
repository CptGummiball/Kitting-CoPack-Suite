import { db } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workstation = await db.getWorkstation(id);
    if (!workstation) {
      return Response.json({ error: 'Produktionsplatz nicht gefunden' }, { status: 404 });
    }
    return Response.json(workstation);
  } catch {
    return Response.json({ error: 'Fehler beim Laden des Produktionsplatzes' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const workstation = await db.updateWorkstation(id, body);
    if (!workstation) {
      return Response.json({ error: 'Produktionsplatz nicht gefunden' }, { status: 404 });
    }
    return Response.json(workstation);
  } catch {
    return Response.json({ error: 'Fehler beim Aktualisieren des Produktionsplatzes' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await db.deleteWorkstation(id);
    if (!deleted) {
      return Response.json({ error: 'Produktionsplatz nicht gefunden' }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Fehler beim Löschen des Produktionsplatzes' }, { status: 500 });
  }
}
