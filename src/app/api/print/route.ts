import { db } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const printJobs = await db.getPrintJobs();
    return Response.json(printJobs);
  } catch {
    return Response.json({ error: 'Fehler beim Laden der Druckaufträge' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Simulate printing – in production this would send ZPL to a Zebra printer
    const job = await db.createPrintJob({
      ...body,
      status: 'completed', // Simulated success
    });
    return Response.json(job, { status: 201 });
  } catch {
    return Response.json({ error: 'Fehler beim Erstellen des Druckauftrags' }, { status: 500 });
  }
}
