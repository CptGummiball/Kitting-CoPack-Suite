import { db } from '@/lib/data';

export const dynamic = 'force-dynamic';

// Confirm storage of a task in warehouse
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const body = await request.json();
    const { userId, userName, webhookSecret } = body;

    // Verify webhook secret if configured
    const settings = await db.getSettings();
    if (settings.wms.webhookSecret && webhookSecret !== settings.wms.webhookSecret) {
      return Response.json({ error: 'Ungültiger Webhook-Secret' }, { status: 401 });
    }

    const task = await db.getTask(taskId);
    if (!task) {
      return Response.json({ error: 'Task nicht gefunden' }, { status: 404 });
    }

    if (task.status !== 'handed-to-warehouse') {
      return Response.json({ 
        error: 'Task muss den Status "An Lager Übergeben" haben' 
      }, { status: 400 });
    }

    // Update timeline
    const timeline = (task.timeline || []).map(entry => {
      if (entry.step === 'stored') {
        return {
          ...entry,
          timestamp: new Date().toISOString(),
          userId: userId || 'system',
          userName: userName || 'WMS System',
        };
      }
      return entry;
    });

    // Update task status
    const updated = await db.updateTask(taskId, {
      status: 'stored',
      timeline,
    });

    // Create audit entry
    await db.createAuditEntry({
      userId: userId || 'system',
      userName: userName || 'WMS System',
      entityType: 'task',
      entityId: taskId,
      action: 'stored',
      changes: `Auftrag "${task.title}" eingelagert`,
    });

    return Response.json({ success: true, task: updated });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'WMS-Fehler' }, { status: 500 });
  }
}
