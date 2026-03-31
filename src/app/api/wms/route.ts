import { db } from '@/lib/data';

export const dynamic = 'force-dynamic';

// Hand over an order to warehouse
export async function POST(request: Request) {
  try {
    const settings = await db.getSettings();
    const body = await request.json();
    const { taskId, userId, userName } = body;

    if (!taskId) {
      return Response.json({ error: 'taskId ist erforderlich' }, { status: 400 });
    }

    const task = await db.getTask(taskId);
    if (!task) {
      return Response.json({ error: 'Task nicht gefunden' }, { status: 404 });
    }

    if (task.status !== 'completed') {
      return Response.json({ 
        error: 'Task muss den Status "Fertiggestellt" haben, um an das Lager übergeben zu werden' 
      }, { status: 400 });
    }

    // Update timeline
    const timeline = (task.timeline || []).map(entry => {
      if (entry.step === 'handed-to-warehouse') {
        return {
          ...entry,
          timestamp: new Date().toISOString(),
          userId: userId || 'system',
          userName: userName || 'System',
        };
      }
      return entry;
    });

    // Update task status
    const updated = await db.updateTask(taskId, {
      status: 'handed-to-warehouse',
      timeline,
    });

    // Create audit entry
    await db.createAuditEntry({
      userId: userId || 'system',
      userName: userName || 'System',
      entityType: 'task',
      entityId: taskId,
      action: 'handed-to-warehouse',
      changes: `Auftrag "${task.title}" an Lager übergeben`,
    });

    // If WMS webhook is configured, notify external system
    if (settings.wms.enabled && settings.api.webhookUrl) {
      try {
        await fetch(settings.api.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'task.handed-to-warehouse',
            taskId,
            timestamp: new Date().toISOString(),
            data: updated,
          }),
        });
      } catch {
        // Non-blocking: external notification failure should not fail the handover
      }
    }

    return Response.json({ success: true, task: updated });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'WMS-Fehler' }, { status: 500 });
  }
}
