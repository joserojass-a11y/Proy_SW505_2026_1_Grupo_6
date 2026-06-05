import { AvailabilitySlot, IAvailabilityService } from './availability.interface';

/**
 * Mock implementation of availability service
 * This is a temporary implementation for Phase 3
 * In Phase 4, this will be replaced with a real availability service
 * that integrates with the scheduling system
 */
export class AvailabilityServiceMock implements IAvailabilityService {
  /**
   * Mock: Always returns true for availability
   * In production, this would check against:
   * - Service operating hours
   * - Service calendar
   * - Staff schedules
   * - Resource availability
   */
  async checkAvailability(serviceId: string, startsAt: Date, endsAt: Date): Promise<boolean> {
    // Check if time is in the future
    if (startsAt <= new Date()) {
      return false;
    }

    // Check if duration is valid (between 15 mins and 8 hours)
    const durationMinutes = (endsAt.getTime() - startsAt.getTime()) / (1000 * 60);
    if (durationMinutes < 15 || durationMinutes > 480) {
      return false;
    }

    // Mock: Simulate 95% availability
    return Math.random() < 0.95;
  }

  /**
   * Mock: Returns 8 hourly slots per day starting from 09:00
   * In production, this would generate slots based on:
   * - Service availability rules
   * - Staff schedules
   * - Existing bookings
   */
  async getAvailableSlots(serviceId: string, date: Date): Promise<AvailabilitySlot[]> {
    const slots: AvailabilitySlot[] = [];

    // Generate slots from 09:00 to 17:00 in 1-hour increments
    for (let hour = 9; hour < 17; hour++) {
      const startsAt = new Date(date);
      startsAt.setHours(hour, 0, 0, 0);

      const endsAt = new Date(startsAt);
      endsAt.setHours(hour + 1, 0, 0, 0);

      // Mock: 90% of slots are available
      const available = Math.random() < 0.9;

      slots.push({
        startsAt,
        endsAt,
        available,
        capacity: 1,
      });
    }

    return slots;
  }
}
