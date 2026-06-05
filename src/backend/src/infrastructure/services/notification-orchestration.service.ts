import { Injectable, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { NotificationQueueService } from '../../application/services/notification-queue.service.interface';
import { NotificationEventRepository } from '../../domain/repositories/notification-event.repository';
import { NotificationPreferenceRepository } from '../../domain/repositories/notification-preference.repository';
import { EmailService } from '../../application/services/email.service.interface';
import { GetPendingNotificationsQueryHandler } from '../../application/queries/get-pending-notifications.query-handler';
import { MarkNotificationAsSentCommandHandler } from '../../application/commands/mark-notification-as-sent.command-handler';
import { RecordNotificationFailureCommandHandler } from '../../application/commands/record-notification-failure.command-handler';
import { INFRASTRUCTURE_TOKENS } from '../shared/infrastructure.tokens';

/**
 * NotificationOrchestrationService
 * Orquestador principal del sistema de notificaciones
 *
 * Responsabilidades:
 * 1. Obtener eventos pendientes de la cola
 * 2. Validar preferencias del cliente
 * 3. Enviar notificación via SMTP
 * 4. Registrar resultado (éxito/fallo con retry)
 *
 * Utiliza:
 * - Handlers CQS (queries/commands)
 * - Repositorios (acceso a BD)
 * - EmailService (envío SMTP)
 * - QueueService (cola asíncrona)
 *
 * Flujo típico:
 * 1. Worker obtiene eventos pendientes (query)
 * 2. Para cada evento, obtiene preferencias del cliente
 * 3. Valida que cliente no haya deshabilitado el canal
 * 4. Envía email
 * 5. Marca como sent o registra fallo con reintentos
 */
@Injectable()
export class NotificationOrchestrationService
  implements OnModuleInit, OnModuleDestroy
{
  private consumer: NodeJS.Timer | null = null;
  private isProcessing = false;

  constructor(
    @Inject(INFRASTRUCTURE_TOKENS.NOTIFICATION_EVENT_REPOSITORY)
    private readonly eventRepository: NotificationEventRepository,
    @Inject(INFRASTRUCTURE_TOKENS.NOTIFICATION_PREFERENCE_REPOSITORY)
    private readonly prefRepository: NotificationPreferenceRepository,
    private readonly emailService: EmailService,
    private readonly queueService: NotificationQueueService,
    private readonly getPendingNotificationsHandler: GetPendingNotificationsQueryHandler,
    private readonly markAsSentHandler: MarkNotificationAsSentCommandHandler,
    private readonly recordFailureHandler: RecordNotificationFailureCommandHandler,
  ) {}

  /**
   * Inicializar servicio: Inicia consumer al cargar módulo
   */
  async onModuleInit(): Promise<void> {
    console.log('[NotificationOrchestration] Starting queue consumer...');
    await this.queueService.startConsumer();
  }

  /**
   * Limpiar recurso: Detener consumer al descargar módulo
   */
  async onModuleDestroy(): Promise<void> {
    console.log('[NotificationOrchestration] Stopping queue consumer...');
    await this.queueService.stopConsumer();
  }

  /**
   * Procesar cola de notificaciones pendientes
   * Llamado periódicamente (cada 5-10 segundos)
   *
   * Pasos:
   * 1. Obtener eventos pendientes con query handler
   * 2. Para cada evento:
   *    a. Validar preferencias del cliente
   *    b. Enviar via SMTP
   *    c. Registrar resultado
   * 3. Si falla: Registrar error (se reintentará automáticamente)
   */
  async processQueue(): Promise<void> {
    // Evitar procesamiento concurrente
    if (this.isProcessing) {
      console.log('[NotificationOrchestration] Already processing, skipping...');
      return;
    }

    this.isProcessing = true;

    try {
      // Obtener eventos pendientes usando query handler
      const events = await this.getPendingNotificationsHandler.execute({});

      if (events.length === 0) {
        console.log('[NotificationOrchestration] No pending notifications');
        return;
      }

      console.log(
        `[NotificationOrchestration] Processing ${events.length} pending notifications`,
      );

      // Procesar cada evento
      for (const event of events) {
        try {
          // Obtener preferencias del cliente (si es customer)
          if (event.recipientType.value === 'customer') {
            const preferences = await this.prefRepository.findByCustomerId(
              event.recipientId,
            );

            // Validar que el cliente tiene habilitado el canal
            const channelEnabled = preferences.some(
              (p) => p.channelId === event.channelCode.value && p.isEnabled,
            );

            if (!channelEnabled) {
              console.log(
                `[NotificationOrchestration] Customer ${event.recipientId} has disabled channel ${event.channelCode.value}`,
              );
              // Marcar como enviada (no enviar, pero considerar completada)
              await this.markAsSentHandler.execute({
                notificationEventId: event.id.value,
              });
              continue;
            }
          }

          // Enviar email
          console.log(
            `[NotificationOrchestration] Sending notification to ${event.contactPoint}`,
          );
          const result = await this.emailService.send(
            event.contactPoint,
            event.subject || 'Notification',
            event.renderedContent,
          );

          console.log(
            `[NotificationOrchestration] Email sent successfully (messageId: ${result.messageId})`,
          );

          // Marcar como enviada
          await this.markAsSentHandler.execute({
            notificationEventId: event.id.value,
          });
        } catch (error) {
          console.error(
            `[NotificationOrchestration] Error processing event ${event.id.value}:`,
            error,
          );

          // Registrar fallo (con reintentos automáticos)
          try {
            await this.recordFailureHandler.execute({
              notificationEventId: event.id.value,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          } catch (failureError) {
            console.error(
              `[NotificationOrchestration] Failed to record failure for event ${event.id.value}:`,
              failureError,
            );
          }
        }
      }
    } catch (error) {
      console.error('[NotificationOrchestration] Error in processQueue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Enqueue manual: Agregar evento a la cola para procesamiento
   * Usado cuando se crea una notificación vía API/command
   *
   * @param notificationEventId ID del evento a procesar
   * @param delayMs Delay en ms antes de procesar (default: 0 = inmediato)
   */
  async enqueueEvent(notificationEventId: string, delayMs: number = 0): Promise<void> {
    console.log(
      `[NotificationOrchestration] Enqueuing event ${notificationEventId} with delay ${delayMs}ms`,
    );
    await this.queueService.enqueue(notificationEventId, delayMs);
  }

  /**
   * Obtener métricas de cola
   * @returns Información sobre el estado actual de la cola
   */
  async getQueueMetrics(): Promise<{
    pendingCount: number;
    isProcessing: boolean;
  }> {
    const pendingCount = await this.queueService.getQueueLength();
    return {
      pendingCount,
      isProcessing: this.isProcessing,
    };
  }
}
