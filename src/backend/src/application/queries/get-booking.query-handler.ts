import { BookingRepository } from '../../domain/repositories/booking.repository';
import { BookingId } from '../../domain/value-objects/booking-id.vo';
import { TenantId } from '../../domain/value-objects/tenant-id.vo';
import { BookingNotFoundException } from '../../domain/exceptions/booking-not-found.exception';
import { GetBookingQuery } from './get-booking.query';
import { BookingDetailDto } from '../dtos/booking-detail.dto';

export class GetBookingQueryHandler {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async execute(query: GetBookingQuery): Promise<BookingDetailDto> {
    const bookingId = BookingId.create(query.bookingId);

    let booking = await this.bookingRepository.findById(bookingId);

    if (!booking) {
      throw new BookingNotFoundException(query.bookingId);
    }

    // If tenantId is provided, verify the booking belongs to this tenant
    if (query.tenantId) {
      const tenantId = TenantId.create(query.tenantId);
      if (!booking.tenantId.equals(tenantId)) {
        throw new BookingNotFoundException(query.bookingId);
      }
    }

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
  }
}
