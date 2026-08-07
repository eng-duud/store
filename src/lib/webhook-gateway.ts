/**
 * ENTERPRISE WEBHOOK GATEWAY
 */

export interface WebhookEndpoint {
  id: string;
  name: string;
  targetUrl: string;
  secretToken: string;
  subscribedEvents: string[];
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export interface WebhookDeliveryLog {
  id: string;
  endpointId: string;
  eventType: string;
  statusCode: number;
  payload: any;
  response: string;
  timestamp: string;
  status: "SUCCESS" | "FAILED";
}

const MOCK_WEBHOOKS: WebhookEndpoint[] = [
  {
    id: "WH-001",
    name: "مربوط الشحن واللوجستيات (Shipping Gateway)",
    targetUrl: "https://api.logistics-partner.com/v1/webhooks/orders",
    secretToken: "whsec_live_9f8a7b6c5d4e3f2a1b0c9d8e7f",
    subscribedEvents: ["ORDER_CREATED", "ORDER_STATUS_CHANGED"],
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  },
];

const MOCK_DELIVERIES: WebhookDeliveryLog[] = [
  {
    id: "DELIV-101",
    endpointId: "WH-001",
    eventType: "ORDER_CREATED",
    statusCode: 200,
    payload: { orderNumber: "ORD-2026-001", status: "PENDING" },
    response: '{"success": true, "trackingNumber": "TRK-987654"}',
    timestamp: new Date().toISOString(),
    status: "SUCCESS",
  },
];

export function getRegisteredWebhooks(): WebhookEndpoint[] {
  return MOCK_WEBHOOKS;
}

export function getWebhookLogs(): WebhookDeliveryLog[] {
  return MOCK_DELIVERIES;
}

export function registerWebhook(data: Omit<WebhookEndpoint, "id" | "createdAt">): WebhookEndpoint {
  const newWh: WebhookEndpoint = {
    ...data,
    id: `WH-${Date.now().toString().slice(-4)}`,
    createdAt: new Date().toISOString(),
  };

  MOCK_WEBHOOKS.unshift(newWh);
  return newWh;
}
