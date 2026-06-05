import { BookingRepository } from '../../domain/repositories/booking.repository';
import { Booking } from '../../domain/entities/booking.entity';
import { TenantId } from '../../domain/value-objects/tenant-id.vo';
import { ServiceId } from '../../domain/value-objects/service-id.vo';
import { ListBookingsQuery } from './list-bookings.query';
import { BookingDetailDto } from '../dtos/booking-detail.dto';

export class ListBookingsQueryHandler {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async execute(query: ListBookingsQuery): Promise<BookingDetailDto[]> {
    let bookings: Booking[] = [];

    // Query based on filters
    if (query.serviceId) {
      const serviceId = ServiceId.create(query.serviceId);
      bookings = await this.bookingRepository.listByServiceId(serviceId);
    } else if (query.customerId) {
      bookings = await this.bookingRepository.listByCustomerId(query.customerId);
    } else if (query.tenantId) {
      const tenantId = TenantId.create(query.tenantId);
      bookings = await this.bookingRepository.listByTenantId(tenantId);
    }

    // Filter by status if provided
    if (query.status) {
      bookings = bookings.filter((b) => b.status.value === query.status);
    }

    // Apply pagination if provided
    let result = bookings;
    if (query.limit || query.offset) {
      const offset = query.offset ?? 0;
      const limit = query.limit ?? 20;
      result = bookings.slice(offset, offset + limit);
    }

    // Convert to DTOs
    return result.map((booking) => {
      const primitives = booking.toPrimitives();
      return new BookingDetailDto({
        id: primitives.id,
        tenantId: primitives.tenantId,
        branchId: primitives.branchId,
        serviceId: primitives.serviceId,
        customerId: primitives.customerId,
        startsAt: primitives.startsAt,
        endsAt: primitives.endsAt,
        customerTimezone: primitives.customerTimezone,
        status: primitives.status,
        sourceChannel: primitives.sourceChannel,
        notes: primitives.notes,
        customData: primitives.customData,
        createdBy: primitives.createdBy!,
        createdAt: primitives.createdAt,
        updatedAt: primitives.updatedAt,
      });
    });
  }
}
