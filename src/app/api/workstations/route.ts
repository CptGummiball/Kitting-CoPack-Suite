import { db } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const workstations = await db.getWorkstations();
    return Response.json(workstations);
  } catch {
    return Response.json({ error: 'Fehler beim Laden der Produktionsplätze' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const workstation = await db.createWorkstation(body);
    return Response.json(workstation, { status: 201 });
  } catch {
    return Response.json({ error: 'Fehler beim Erstellen des Produktionsplatzes' }, { status: 500 });
  }
}
