export interface AvailabilitySlot {
  startsAt: Date;
  endsAt: Date;
  available: boolean;
  capacity: number;
}

export interface IAvailabilityService {
  checkAvailability(serviceId: string, startsAt: Date, endsAt: Date): Promise<boolean>;
  getAvailableSlots(serviceId: string, date: Date): Promise<AvailabilitySlot[]>;
}
