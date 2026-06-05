import { NotificationPreferenceRepository } from '../../domain/repositories/notification-preference.repository';
import { NotificationPreference } from '../../domain/entities/notification-preference.entity';
import { GetCustomerPreferencesQuery } from './get-customer-preferences.query';

/**
 * GetCustomerPreferencesQueryHandler
 * CQS Handler: Obtiene preferencias de notificación de un cliente
 *
 * Flujo:
 * 1. Query al repositorio por preferencias del cliente
 * 2. Retorna array de NotificationPreference
 *
 * Utilizado por:
 * - UI para mostrar configuración de notificaciones
 * - Motor de orquestación antes de enviar notificación
 * - Validación de permisos antes de enviar
 *
 * Notas:
 * - Retorna TODAS las preferencias (habilitadas y deshabilitadas)
 * - Cada preferencia incluye isEnabled para filtrado en aplicación
 */
export class GetCustomerPreferencesQueryHandler {
  constructor(
    private readonly notificationPreferenceRepository: NotificationPreferenceRepository,
  ) {}

  async execute(
    query: GetCustomerPreferencesQuery,
  ): Promise<NotificationPreference[]> {
    // Obtener todas las preferencias del cliente
    return this.notificationPreferenceRepository.findByCustomerId(
      query.customerId,
    );
  }
}
