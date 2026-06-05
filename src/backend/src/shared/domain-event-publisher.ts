import { DomainEvent } from '../domain/events/domain-event.interface';

type DomainEventCallback<T = any> = (event: T) => void | Promise<void>;

export class DomainEventPublisher {
  private static handlers: Map<string, DomainEventCallback[]> = new Map();

  static subscribe<T = any>(eventClass: { new (...args: any[]): T } | string, callback: DomainEventCallback<T>): void {
    const eventName = typeof eventClass === 'string' ? eventClass : eventClass.name;
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(callback);
  }

  static async publish(event: DomainEvent): Promise<void> {
    const eventName = event.constructor.name;
    const callbacks = this.handlers.get(eventName) || [];
    for (const callback of callbacks) {
      try {
        await callback(event);
      } catch (error) {
        console.error(`[DomainEventPublisher] Error handling event ${eventName}:`, error);
      }
    }
  }

  static clear(): void {
    this.handlers.clear();
  }
}
