import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'demo-data.json');

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: 'E-Mail und Passwort erforderlich' }, { status: 400 });
    }

    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);

    const user = data.users.find(
      (u: { email: string; password: string; status: string }) =>
        u.email === email && u.password === password && u.status === 'active'
    );

    if (!user) {
      return Response.json({ error: 'Ungültige Anmeldedaten' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...safeUser } = user;

    return Response.json({ user: safeUser });
  } catch {
    return Response.json({ error: 'Serverfehler' }, { status: 500 });
  }
}
