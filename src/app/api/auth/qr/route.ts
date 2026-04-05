import { db } from '@/lib/data';
import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const QR_SESSION_FILE = path.join(process.cwd(), 'data', 'qr-sessions.json');

interface QrSession {
  createdAt: number;
  userId?: string;
  confirmed: boolean;
}

async function readSessions(): Promise<Record<string, QrSession>> {
  try {
    const raw = await fs.readFile(QR_SESSION_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeSessions(sessions: Record<string, QrSession>): Promise<void> {
  // Clean up expired sessions (older than 5 minutes)
  const now = Date.now();
  for (const [token, session] of Object.entries(sessions)) {
    if (now - session.createdAt > 5 * 60 * 1000) {
      delete sessions[token];
    }
  }
  await fs.writeFile(QR_SESSION_FILE, JSON.stringify(sessions, null, 2));
}

/**
 * GET /api/auth/qr
 * Generate a new QR login token.
 */
export async function GET(request: Request) {
  const sessions = await readSessions();
  const token = randomBytes(32).toString('hex');

  sessions[token] = { createdAt: Date.now(), confirmed: false };
  await writeSessions(sessions);

  // Build the confirmation URL for the mobile device
  const url = new URL(request.url);
  const confirmUrl = `${url.protocol}//${url.host}/api/auth/qr/confirm?token=${token}`;

  return Response.json({
    success: true,
    token,
    confirmUrl,
    expiresIn: 300,
  });
}

/**
 * POST /api/auth/qr
 * Confirm a QR code scan — authenticate the session token with user credentials.
 * Called from the device that scanned the QR code.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, email, password } = body;

    if (!token) {
      return Response.json({ error: 'Token erforderlich' }, { status: 400 });
    }

    const sessions = await readSessions();
    const session = sessions[token];

    if (!session) {
      return Response.json({ error: 'Token ungültig oder abgelaufen' }, { status: 400 });
    }

    if (Date.now() - session.createdAt > 5 * 60 * 1000) {
      delete sessions[token];
      await writeSessions(sessions);
      return Response.json({ error: 'Token abgelaufen' }, { status: 400 });
    }

    if (!email) {
      return Response.json({ error: 'E-Mail erforderlich' }, { status: 400 });
    }

    // Authenticate: read raw data for password check
    const DATA_FILE = path.join(process.cwd(), 'data', 'demo-data.json');
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);
    const user = data.users.find(
      (u: any) => u.email === email && u.password === password && u.status === 'active'
    );

    if (!user) {
      return Response.json({ error: 'Ungültige Anmeldedaten' }, { status: 401 });
    }

    // Mark session as confirmed
    session.userId = user.id;
    session.confirmed = true;
    await writeSessions(sessions);

    const { password: _pw, ...safeUser } = user;

    return Response.json({
      success: true,
      message: 'QR-Login bestätigt',
      user: safeUser,
    });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'QR-Auth-Fehler' }, { status: 500 });
  }
}
