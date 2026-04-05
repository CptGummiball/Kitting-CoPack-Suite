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

    // Allow handover from completed status, or from earlier statuses if skipping is enabled
    const allowedStatuses = ['completed'];
    if (settings.tasks.skippableSteps?.enabled) {
      const skippable = settings.tasks.skippableSteps.steps || [];
      if (skippable.includes('completed') || skippable.includes('handed-to-warehouse')) {
        allowedStatuses.push('in-progress', 'open', 'planned', 'paused');
      }
    }

    if (!allowedStatuses.includes(task.status)) {
      return Response.json({
        error: 'Task muss den Status "Fertiggestellt" haben, um an das Lager übergeben zu werden',
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

    // Notify external system based on configured handover mode
    if (settings.wms.enabled) {
      const handoverMode = settings.wms.handoverMode || 'simple-webhook';

      if (handoverMode === 'simple-webhook' && settings.wms.webhookUrl) {
        // Simple Webhook: POST to configured URL
        try {
          const webhookHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(settings.wms.webhookHeaders || {}),
          };

          if (settings.wms.webhookSecret) {
            webhookHeaders['X-Webhook-Secret'] = settings.wms.webhookSecret;
          }

          await fetch(settings.wms.webhookUrl, {
            method: 'POST',
            headers: webhookHeaders,
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
      } else if (handoverMode === 'wms-message' && settings.wms.wmsEndpoint) {
        // WMS Message: Structured message to WMS endpoint
        try {
          const wmsHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          if (settings.wms.wmsApiKey) {
            wmsHeaders['Authorization'] = `Bearer ${settings.wms.wmsApiKey}`;
          }

          await fetch(settings.wms.wmsEndpoint, {
            method: 'POST',
            headers: wmsHeaders,
            body: JSON.stringify({
              messageType: 'WAREHOUSE_HANDOVER',
              version: '1.0',
              timestamp: new Date().toISOString(),
              order: {
                externalId: task.id,
                referenceId: task.referenceId,
                title: task.title,
                quantity: task.completedQuantity || task.estimatedQuantity,
                itemSku: task.item?.sku || '',
                itemName: task.item?.name || '',
                priority: task.priority,
              },
              handover: {
                userId: userId || 'system',
                userName: userName || 'System',
                timestamp: new Date().toISOString(),
              },
            }),
          });
        } catch {
          // Non-blocking
        }
      }
    }

    return Response.json({ success: true, task: updated });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'WMS-Fehler' }, { status: 500 });
  }
}
