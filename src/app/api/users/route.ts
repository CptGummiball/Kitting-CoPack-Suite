import { db } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await db.getUsers();
    return Response.json(users);
  } catch {
    return Response.json({ error: 'Fehler beim Laden der Benutzer' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await db.createUser(body);
    return Response.json(user, { status: 201 });
  } catch {
    return Response.json({ error: 'Fehler beim Erstellen des Benutzers' }, { status: 500 });
  }
}
