import { Controller, Get, Query, UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SlotGeneratorService } from '../../../domain/services/slot-generator.service';
import { ResourceId } from '../../../domain/value-objects/resource-id.vo';
import { TypeOrmResourceRepository } from '../../persistence/typeorm/typeorm-resource.repository';
import { DataSource } from 'typeorm';
import { INFRASTRUCTURE_TOKENS } from '../../shared/infrastructure.tokens';

@Controller('slots')
export class SlotController {
  private slotGeneratorService: SlotGeneratorService;
  private resourceRepository: TypeOrmResourceRepository;

  constructor(@Inject(INFRASTRUCTURE_TOKENS.DATA_SOURCE) private readonly dataSource: DataSource) {
    this.resourceRepository = new TypeOrmResourceRepository(dataSource);
    this.slotGeneratorService = new SlotGeneratorService(this.resourceRepository);
  }

  /**
   * GET /slots
   * Retrieve available slots for a service in a given date range
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getSlots(
    @Query('serviceId') serviceId: string,
    @Query('resourceId') resourceId: string,
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string,
    @Query('durationMinutes') durationMinutesStr: string,
  ) {
    if (!serviceId) {
      throw new Error('serviceId is required');
    }

    const startDate = new Date(startDateStr || new Date().toISOString());
    const endDate = new Date(endDateStr || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
    const durationMinutes = durationMinutesStr ? parseInt(durationMinutesStr, 10) : 30;

    // If resourceId is provided, just get slots for that resource.
    // If not, ideally we should query all resources that support this serviceId.
    // But since this is a simplified flow, we expect resourceId to be passed or we fetch all.
    // Assuming the frontend will pass resourceId if one is selected, else it fetches for a specific one or we mock.

    if (resourceId) {
      const slots = await this.slotGeneratorService.generateSlotsForDateRange(
        ResourceId.create(resourceId),
        startDate,
        endDate,
        durationMinutes
      );
      return slots.map(s => s.toPrimitives());
    } else {
      // In a real app we'd find resources by serviceId
      // For now we return empty or we could mock
      return [];
    }
  }
}
