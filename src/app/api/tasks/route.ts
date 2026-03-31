import { db } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tasks = await db.getTasks();
    return Response.json(tasks);
  } catch {
    return Response.json({ error: 'Fehler beim Laden der Tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const item = await db.getItem(body.itemId);
    if (item?.requiresBatchNumber) {
      const settings = await db.getSettings();
      const prefix = settings.tasks.batchPrefix || 'CH-';
      
      const now = new Date();
      const yy = now.getFullYear().toString().slice(2);
      const mm = (now.getMonth() + 1).toString().padStart(2, '0');
      
      const allTasks = await db.getTasks();
      const thisMonthTasks = allTasks.filter(t => {
        if (!t.batchNumber) return false;
        const d = new Date(t.createdAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      });
      
      const increment = (thisMonthTasks.length + 1).toString().padStart(4, '0');
      body.batchNumber = `${prefix}${yy}${mm}-${increment}`;
    }

    // Initialize timeline
    body.timeline = [
      { step: 'created', label: 'Auftrag erstellt', timestamp: new Date().toISOString(), userId: body.createdBy, userName: '' },
      { step: 'in-progress', label: 'In Bearbeitung' },
      { step: 'completed', label: 'Fertiggestellt' },
      { step: 'handed-to-warehouse', label: 'An Lager Übergeben' },
      { step: 'stored', label: 'Eingelagert' },
    ];

    const task = await db.createTask(body);
    return Response.json(task, { status: 201 });
  } catch {
    return Response.json({ error: 'Fehler beim Erstellen des Tasks' }, { status: 500 });
  }
}
