import { db } from '@/lib/data';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/tasks/[id]'>) {
  try {
    const { id } = await ctx.params;
    const task = await db.getTask(id);
    if (!task) return Response.json({ error: 'Task nicht gefunden' }, { status: 404 });
    return Response.json(task);
  } catch {
    return Response.json({ error: 'Serverfehler' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, ctx: RouteContext<'/api/tasks/[id]'>) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();

    // If status is changing, update timeline
    if (body.status) {
      const existingTask = await db.getTask(id);
      if (existingTask && existingTask.status !== body.status) {
        const statusToStep: Record<string, string> = {
          'in-progress': 'in-progress',
          'completed': 'completed',
          'handed-to-warehouse': 'handed-to-warehouse',
          'stored': 'stored',
        };

        const step = statusToStep[body.status];
        if (step && existingTask.timeline) {
          body.timeline = existingTask.timeline.map((entry: any) => {
            if (entry.step === step && !entry.timestamp) {
              return {
                ...entry,
                timestamp: new Date().toISOString(),
                userId: body.userId || 'system',
                userName: body.userName || 'System',
              };
            }
            return entry;
          });
        }
      }
    }

    const task = await db.updateTask(id, body);
    if (!task) return Response.json({ error: 'Task nicht gefunden' }, { status: 404 });
    return Response.json(task);
  } catch {
    return Response.json({ error: 'Serverfehler' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/tasks/[id]'>) {
  try {
    const { id } = await ctx.params;
    const deleted = await db.deleteTask(id);
    if (!deleted) return Response.json({ error: 'Task nicht gefunden' }, { status: 404 });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Serverfehler' }, { status: 500 });
  }
}
