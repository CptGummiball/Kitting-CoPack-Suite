import { db } from '@/lib/data';
import { createWeclappClient } from '@/lib/weclapp';
import type { Item } from '@/lib/data/types';

export const dynamic = 'force-dynamic';

// Test connection / get articles
export async function GET(request: Request) {
  try {
    const settings = await db.getSettings();
    if (!settings.weclapp.enabled) {
      return Response.json({ error: 'Weclapp-Integration ist deaktiviert' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'test';

    const client = createWeclappClient({
      tenantUrl: settings.weclapp.tenantUrl,
      apiToken: settings.weclapp.apiToken,
    });

    if (action === 'test') {
      const result = await client.testConnection();
      if (!result.success) {
        return Response.json({
          success: false,
          error: result.error || 'Verbindung fehlgeschlagen',
        }, { status: 400 });
      }
      return Response.json({ success: true, tenant: { company: result.tenantName } });
    }

    if (action === 'articles') {
      const articles = await client.getArticles();
      return Response.json({ success: true, articles });
    }

    return Response.json({ error: 'Unbekannte Aktion' }, { status: 400 });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Weclapp-Fehler' }, { status: 500 });
  }
}

// Trigger sync
export async function POST(request: Request) {
  try {
    const settings = await db.getSettings();
    if (!settings.weclapp.enabled) {
      return Response.json({ error: 'Weclapp-Integration ist deaktiviert' }, { status: 400 });
    }

    const body = await request.json();
    const action = body.action || 'sync';

    if (action === 'sync-production-articles') {
      const client = createWeclappClient({
        tenantUrl: settings.weclapp.tenantUrl,
        apiToken: settings.weclapp.apiToken,
      });

      // 1. Fetch production articles filtered by configured articleTypes
      const articleTypes = settings.weclapp.productionArticleTypes || ['STORABLE'];
      const productionArticles = await client.getProductionArticles(articleTypes);

      // 2. Collect BOM child article IDs
      const bomChildIds = await client.collectBomChildArticleIds(productionArticles);

      // 3. Fetch child articles that aren't already in the production list
      const existingIds = new Set(productionArticles.map(a => a.id));
      const missingChildIds = [...bomChildIds].filter(id => !existingIds.has(id));
      const childArticles = missingChildIds.length > 0
        ? await client.getArticlesByIds(missingChildIds)
        : [];

      // 4. Merge all articles to sync
      const allArticles = [...productionArticles, ...childArticles];

      // 5. Sync to local items
      const existingItems = await db.getItems();
      let created = 0;
      let updated = 0;

      for (const article of allArticles) {
        // Match by SKU (articleNumber) or weclappId
        const existing = existingItems.find(
          item => item.sku === article.articleNumber || (item as any).weclappId === article.id
        );

        if (existing) {
          // Update existing item
          await db.updateItem(existing.id, {
            name: article.name,
            description: article.description || existing.description,
            ean: article.ean || existing.ean,
            isActive: article.active,
          } as Partial<Item>);
          updated++;
        } else {
          // Create new item
          await db.createItem({
            sku: article.articleNumber,
            ean: article.ean,
            name: article.name,
            description: article.description || '',
            components: [],
            instructions: [],
            specialNotes: '',
            labelConfigs: [],
            isActive: article.active,
          } as Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'changeHistory'>);
          created++;
        }
      }

      // 6. Update last sync timestamp
      await db.updateSettings({
        weclapp: { ...settings.weclapp, lastSyncAt: new Date().toISOString() },
      });

      return Response.json({
        success: true,
        message: 'Produktionsartikel-Synchronisation abgeschlossen',
        synced: allArticles.length,
        created,
        updated,
        productionArticles: productionArticles.length,
        bomChildren: childArticles.length,
      });
    }

    if (action === 'sync') {
      // Legacy: Update last sync timestamp only
      await db.updateSettings({
        weclapp: { ...settings.weclapp, lastSyncAt: new Date().toISOString() },
      });
      return Response.json({ success: true, message: 'Synchronisation gestartet' });
    }

    return Response.json({ error: 'Unbekannte Aktion' }, { status: 400 });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Weclapp-Sync-Fehler' }, { status: 500 });
  }
}
