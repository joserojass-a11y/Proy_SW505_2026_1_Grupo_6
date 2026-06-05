/**
 * Interface: NotificationQueueService
 * Contrato para servicios de cola asíncrona de notificaciones
 *
 * Implementaciones:
 * - RedisNotificationQueueService
 * - BullNotificationQueueService
 * - MockQueueService (testing)
 */
export interface NotificationQueueService {
  /**
   * Enqueue: Agregar notificación a la cola de procesamiento
   * @param notificationEventId ID del evento a procesar
   * @param delayMs Delay en ms antes de procesar (opcional)
   */
  enqueue(notificationEventId: string, delayMs?: number): Promise<void>;

  /**
   * Obtener cantidad de eventos en cola
   * @returns Cantidad de eventos pendientes
   */
  getQueueLength(): Promise<number>;

  /**
   * Iniciar consumer: procesa eventos de forma asíncrona
   */
  startConsumer(): Promise<void>;

  /**
   * Detener consumer
   */
  stopConsumer(): Promise<void>;
}
