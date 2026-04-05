/**
 * Weclapp REST API Client
 * Integration for production article sync, BOM management and order handling.
 */

interface WeclappConfig {
  tenantUrl: string;
  apiToken: string;
}

interface WeclappArticle {
  id: string;
  articleNumber: string;
  name: string;
  description?: string;
  ean?: string;
  active: boolean;
  articleType?: string;
  billOfMaterialItems?: WeclappBomItem[];
}

interface WeclappBomItem {
  id: string;
  articleId: string;
  articleNumber?: string;
  articleName?: string;
  quantity: number;
  positionNumber?: number;
}

interface WeclappResponse<T> {
  result: T[];
}

class WeclappClient {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(config: WeclappConfig) {
    this.baseUrl = config.tenantUrl.replace(/\/$/, '') + '/webapp/api/v1';
    this.headers = {
      'AuthenticationToken': config.apiToken,
      'Content-Type': 'application/json',
    };
  }

  async testConnection(): Promise<{ success: boolean; tenantName?: string; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/tenant`, { headers: this.headers });
      if (!res.ok) {
        return { success: false, error: `HTTP ${res.status}: ${res.statusText}` };
      }
      const data = await res.json();
      return { success: true, tenantName: data.company || data.name };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Verbindung fehlgeschlagen' };
    }
  }

  async getArticles(pageSize = 50, page = 1): Promise<WeclappArticle[]> {
    const res = await fetch(
      `${this.baseUrl}/article?pageSize=${pageSize}&page=${page}`,
      { headers: this.headers }
    );
    if (!res.ok) throw new Error(`Weclapp API Error: ${res.status}`);
    const data: WeclappResponse<WeclappArticle> = await res.json();
    return data.result || [];
  }

  /**
   * Fetch articles filtered by article types (e.g. STORABLE, SALES_BILL_OF_MATERIAL).
   * Includes BOM (bill of material) information when available.
   */
  async getProductionArticles(articleTypes: string[]): Promise<WeclappArticle[]> {
    const allArticles: WeclappArticle[] = [];

    for (const articleType of articleTypes) {
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const res = await fetch(
          `${this.baseUrl}/article?pageSize=100&page=${page}&articleType-eq=${encodeURIComponent(articleType)}`,
          { headers: this.headers }
        );

        if (!res.ok) {
          console.error(`Weclapp API Error fetching ${articleType}: ${res.status}`);
          break;
        }

        const data: WeclappResponse<WeclappArticle> = await res.json();
        const articles = data.result || [];
        allArticles.push(...articles);

        hasMore = articles.length === 100;
        page++;
      }
    }

    // Deduplicate by id
    const seen = new Set<string>();
    return allArticles.filter(a => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
  }

  /**
   * Fetch BOM items for a specific article.
   */
  async getBillOfMaterialItems(articleId: string): Promise<WeclappBomItem[]> {
    try {
      const res = await fetch(
        `${this.baseUrl}/article/id/${articleId}`,
        { headers: this.headers }
      );
      if (!res.ok) return [];
      const article = await res.json();
      return article.billOfMaterialItems || [];
    } catch {
      return [];
    }
  }

  /**
   * Fetch all article IDs that appear in BOM positions of production articles.
   * These child articles should also be synced.
   */
  async collectBomChildArticleIds(productionArticles: WeclappArticle[]): Promise<Set<string>> {
    const childIds = new Set<string>();

    for (const article of productionArticles) {
      // If the article already has BOM items inline
      if (article.billOfMaterialItems?.length) {
        for (const bom of article.billOfMaterialItems) {
          childIds.add(bom.articleId);
        }
      } else {
        // Fetch BOM items separately
        const bomItems = await this.getBillOfMaterialItems(article.id);
        for (const bom of bomItems) {
          childIds.add(bom.articleId);
        }
      }
    }

    return childIds;
  }

  /**
   * Fetch specific articles by their IDs.
   */
  async getArticlesByIds(articleIds: string[]): Promise<WeclappArticle[]> {
    const articles: WeclappArticle[] = [];
    // Weclapp doesn't support batch ID fetching, so we fetch individually
    for (const id of articleIds) {
      try {
        const res = await fetch(
          `${this.baseUrl}/article/id/${id}`,
          { headers: this.headers }
        );
        if (res.ok) {
          articles.push(await res.json());
        }
      } catch {
        // Skip articles that can't be fetched
      }
    }
    return articles;
  }

  async createSalesOrder(orderData: {
    customerNumber: string;
    orderItems: { articleId: string; quantity: number }[];
  }): Promise<any> {
    const res = await fetch(`${this.baseUrl}/salesOrder`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        customerNumber: orderData.customerNumber,
        orderItems: orderData.orderItems.map(item => ({
          articleId: item.articleId,
          quantity: item.quantity,
        })),
      }),
    });
    if (!res.ok) throw new Error(`Weclapp API Error: ${res.status}`);
    return res.json();
  }
}

export function createWeclappClient(config: WeclappConfig): WeclappClient {
  return new WeclappClient(config);
}

export type { WeclappConfig, WeclappArticle, WeclappBomItem, WeclappClient };
