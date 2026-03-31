/**
 * Weclapp REST API Client
 * Rudimentary integration for article sync and order management.
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

export type { WeclappConfig, WeclappArticle, WeclappClient };
