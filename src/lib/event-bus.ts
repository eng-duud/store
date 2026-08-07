/**
 * ENTERPRISE DOMAIN EVENT BUS & INTEGRATION LAYER
 */

export type ERPDomainEventType =
  | "PRODUCT_CREATED"
  | "PRODUCT_UPDATED"
  | "ORDER_CREATED"
  | "ORDER_STATUS_CHANGED"
  | "PURCHASE_ORDER_CREATED"
  | "PURCHASE_ORDER_RECEIVED"
  | "INVENTORY_ADJUSTED"
  | "EXPENSE_CREATED"
  | "QUOTATION_CONVERTED";

export interface DomainEvent<T = any> {
  id: string;
  type: ERPDomainEventType;
  payload: T;
  timestamp: string;
  sourceModule: string;
  correlationId?: string;
}

type EventListener<T = any> = (event: DomainEvent<T>) => Promise<void> | void;

class EnterpriseEventBus {
  private listeners: Map<ERPDomainEventType, EventListener[]> = new Map();
  private eventHistory: DomainEvent[] = [];

  public subscribe<T = any>(eventType: ERPDomainEventType, listener: EventListener<T>) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);
  }

  public async publish<T = any>(type: ERPDomainEventType, payload: T, sourceModule: string) {
    const event: DomainEvent<T> = {
      id: `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      payload,
      timestamp: new Date().toISOString(),
      sourceModule,
    };

    this.eventHistory.unshift(event);
    if (this.eventHistory.length > 500) this.eventHistory.pop();

    const handlers = this.listeners.get(type) || [];
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (err) {
        console.error(`Error processing event ${type}:`, err);
      }
    }

    return event;
  }

  public getEventHistory(): DomainEvent[] {
    return this.eventHistory;
  }
}

export const eventBus = new EnterpriseEventBus();
