import { Controller, Get, Query, Logger } from '@nestjs/common';
import { GetAvailableSlotsQueryHandler } from '../../../application/queries/get-available-slots.query-handler';

@Controller('availability')
export class AvailabilityController {
  private readonly logger = new Logger(AvailabilityController.name);

  constructor(private readonly getAvailableSlotsQueryHandler: GetAvailableSlotsQueryHandler) {}

  @Get()
  async getAvailability(
    @Query('tenantId') tenantId: string,
    @Query('branchId') branchId: string,
    @Query('serviceId') serviceId: string,
    @Query('date') date: string,
    @Query('resourceId') resourceId?: string
  ) {
    this.logger.log(
      `Querying availability for Tenant: ${tenantId}, Branch: ${branchId}, Service: ${serviceId}, Date: ${date}, Resource: ${resourceId ?? 'ANY'}`
    );

    try {
      const result = await this.getAvailableSlotsQueryHandler.execute({
        tenantId,
        branchId,
        serviceId,
        date,
        resourceId,
      });

      this.logger.log(`Successfully retrieved availability for Date: ${date}`);
      return result;
    } catch (error: any) {
      this.logger.error(
        `Failed to retrieve availability for Tenant: ${tenantId}, Branch: ${branchId}, Service: ${serviceId}, Date: ${date}. Error: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }
}
