// src/lib/cloudflare-email.ts
export interface CreateRoutePayload {
  matchers: { type: string; field: string; value: string }[];
  actions: { type: string; value: string[] }[];
  enabled?: boolean;
  name?: string;
  priority?: number;
}

export interface CloudflareRouteResponse {
  result: {
    id: string;
    tag: string;
    matchers: { type: string; field: string; value: string }[];
    actions: { type: string; value: string[] }[];
    enabled: boolean;
    name: string;
    priority: number;
  };
  success: boolean;
  errors: any[];
  messages: any[];
}

export class CloudflareEmailService {
  private apiToken: string | undefined;
  private zoneId: string | undefined;
  private isMockMode: boolean;

  constructor() {
    this.apiToken = process.env.CF_API_TOKEN;
    this.zoneId = process.env.CF_ZONE_ID;
    this.isMockMode = !this.apiToken || !this.zoneId;

    if (this.isMockMode) {
      console.warn('⚠️ Cloudflare API Token or Zone ID missing. CloudflareEmailService is running in MOCK mode.');
    }
  }

  private async mockDelay(ms = 800) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create an email routing rule
   */
  async createRoute(alias: string, destinationEmails: string[]): Promise<CloudflareRouteResponse> {
    if (this.isMockMode) {
      await this.mockDelay();
      return {
        success: true,
        errors: [],
        messages: [],
        result: {
          id: `cf_mock_rule_${Date.now()}`,
          tag: `tag_${Date.now()}`,
          matchers: [{ type: 'literal', field: 'to', value: alias }],
          actions: [{ type: 'forward', value: destinationEmails }],
          enabled: true,
          name: `Route for ${alias}`,
          priority: 0,
        }
      };
    }

    const payload: CreateRoutePayload = {
      matchers: [{ type: 'literal', field: 'to', value: alias }],
      actions: [{ type: 'forward', value: destinationEmails }],
      enabled: true,
      name: `Route for ${alias}`
    };

    const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${this.zoneId}/email/routing/rules`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.errors?.[0]?.message || 'Failed to create Cloudflare email route');
    }

    return data;
  }

  /**
   * Delete an email routing rule
   */
  async deleteRoute(ruleId: string): Promise<boolean> {
    if (this.isMockMode) {
      await this.mockDelay();
      return true;
    }

    const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${this.zoneId}/email/routing/rules/${ruleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.errors?.[0]?.message || 'Failed to delete Cloudflare email route');
    }

    return true;
  }

  /**
   * Update (enable/disable) a rule
   */
  async updateRouteStatus(ruleId: string, alias: string, destinationEmails: string[], enabled: boolean): Promise<boolean> {
    if (this.isMockMode) {
      await this.mockDelay();
      return true;
    }

    const payload: CreateRoutePayload = {
      matchers: [{ type: 'literal', field: 'to', value: alias }],
      actions: [{ type: 'forward', value: destinationEmails }],
      enabled: enabled,
      name: `Route for ${alias}`
    };

    const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${this.zoneId}/email/routing/rules/${ruleId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.errors?.[0]?.message || 'Failed to update Cloudflare email route status');
    }

    return true;
  }
}

export const cfEmailService = new CloudflareEmailService();
