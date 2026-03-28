import { db } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const templates = await db.getLabelTemplates();
    return Response.json(templates);
  } catch {
    return Response.json({ error: 'Fehler beim Laden der Templates' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tpl = await db.createLabelTemplate(body);
    return Response.json(tpl, { status: 201 });
  } catch {
    return Response.json({ error: 'Fehler beim Erstellen' }, { status: 500 });
  }
}
