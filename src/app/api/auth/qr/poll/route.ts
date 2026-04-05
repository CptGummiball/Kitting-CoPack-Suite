import { db } from '@/lib/data';

export const dynamic = 'force-dynamic';

// Import the shared session store
// Note: In production this would use a shared store (Redis, DB).
// For the flat-file implementation we use a simple in-memory approach via module-level state.
const qrSessions = new Map<string, {
  createdAt: number;
  userId?: string;
  confirmed: boolean;
}>();

// Re-export for other routes to access
export { qrSessions };

/**
 * GET /api/auth/qr/poll?token=...
 * Long-poll endpoint: Check if a QR code has been scanned and confirmed.
 * Returns the user data once confirmed.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return Response.json({ error: 'Token erforderlich' }, { status: 400 });
  }

  // Try to import the session from the QR route module
  // Since in-memory state doesn't share across modules in Next.js,
  // we use a filesystem-based approach for the demo
  const { promises: fs } = await import('fs');
  const path = await import('path');
  const QR_SESSION_FILE = path.join(process.cwd(), 'data', 'qr-sessions.json');

  try {
    const raw = await fs.readFile(QR_SESSION_FILE, 'utf-8');
    const sessions: Record<string, { createdAt: number; userId?: string; confirmed: boolean }> = JSON.parse(raw);
    const session = sessions[token];

    if (!session) {
      return Response.json({ status: 'invalid', error: 'Token nicht gefunden' }, { status: 400 });
    }

    // Check expiry
    if (Date.now() - session.createdAt > 5 * 60 * 1000) {
      delete sessions[token];
      await fs.writeFile(QR_SESSION_FILE, JSON.stringify(sessions, null, 2));
      return Response.json({ status: 'expired' }, { status: 400 });
    }

    if (session.confirmed && session.userId) {
      // Get user data
      const user = await db.getUser(session.userId);
      // Clean up used session
      delete sessions[token];
      await fs.writeFile(QR_SESSION_FILE, JSON.stringify(sessions, null, 2));

      return Response.json({
        status: 'confirmed',
        user,
      });
    }

    return Response.json({ status: 'pending' });
  } catch {
    // File doesn't exist yet — all sessions are pending
    return Response.json({ status: 'pending' });
  }
}
