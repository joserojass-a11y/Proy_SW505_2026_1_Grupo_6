import { BookingId } from '../value-objects/booking-id.vo';
import { ServiceId } from '../value-objects/service-id.vo';
import { TenantId } from '../value-objects/tenant-id.vo';
import { Booking } from '../entities/booking.entity';

export interface BookingRepository {
  findById(id: BookingId): Promise<Booking | null>;
  findByIdAndTenant(id: BookingId, tenantId: TenantId): Promise<Booking | null>;
  findConflictingBookings(serviceId: ServiceId, startsAt: Date, endsAt: Date): Promise<Booking[]>;
  findConflictingBookingsForUpdate(serviceId: ServiceId, startsAt: Date, endsAt: Date): Promise<Booking[]>;
  listByServiceId(serviceId: ServiceId): Promise<Booking[]>;
  listByCustomerId(customerId: string): Promise<Booking[]>;
  listByTenantId(tenantId: TenantId): Promise<Booking[]>;
  save(booking: Booking): Promise<Booking>;
  update(booking: Booking): Promise<Booking>;
  deleteById(id: BookingId): Promise<void>;
}
