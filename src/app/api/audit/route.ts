import { db } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auditLog = await db.getAuditLog();
    return Response.json(auditLog);
  } catch {
    return Response.json({ error: 'Fehler beim Laden des Audit-Logs' }, { status: 500 });
  }
}
