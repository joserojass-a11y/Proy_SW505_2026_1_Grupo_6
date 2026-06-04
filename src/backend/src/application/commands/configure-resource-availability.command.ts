export interface ConfigureResourceAvailabilityCommand {
  resourceId: string;
  rules: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    validFrom?: Date;
    validTo?: Date | null;
    breaks?: Array<{
      startTime: string;
      endTime: string;
    }>;
  }>;
}
