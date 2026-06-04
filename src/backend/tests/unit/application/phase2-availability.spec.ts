import { SlotGeneratorService } from '../../../src/domain/services/slot-generator.service';
import { GetAvailableSlotsQueryHandler } from '../../../src/application/queries/get-available-slots.query-handler';
import { TypeOrmAgendaSnapshotRepository } from '../../../src/infrastructure/persistence/typeorm/typeorm-agenda-snapshot.repository';

import { Resource } from '../../../src/domain/entities/resource.entity';
import { ResourceAvailabilityRule } from '../../../src/domain/entities/resource-availability-rule.entity';
import { ResourceBreak } from '../../../src/domain/entities/resource-break.entity';
import { ResourceId } from '../../../src/domain/value-objects/resource-id.vo';
import { BranchId } from '../../../src/domain/value-objects/branch-id.vo';
import { ResourceAvailabilityRuleId } from '../../../src/domain/value-objects/availability-rule-id.vo';
import { ResourceBreakId } from '../../../src/domain/value-objects/break-id.vo';

describe('Phase 2 Availability Engine & Query Handler Unit Tests', () => {
  const validUuid1 = '123e4567-e89b-12d3-a456-426614174001';
  const validUuid2 = '123e4567-e89b-12d3-a456-426614174002';
  const validUuid3 = '123e4567-e89b-12d3-a456-426614174003';

  let mockResourceRepo: any;
  let mockSnapshotRepo: any;
  let mockDataSource: any;

  beforeEach(() => {
    mockResourceRepo = {
      findById: jest.fn(),
      findByBranchId: jest.fn(),
      findAvailabilityRulesByResourceId: jest.fn(),
      findBreaksByAvailabilityRuleId: jest.fn(),
      findTimeOffByResourceId: jest.fn(),
      findBranchExceptionsByBranchId: jest.fn(),
    };
    mockSnapshotRepo = {
      findByResourceIdAndDate: jest.fn(),
      upsert: jest.fn(),
    };
    mockDataSource = {
      query: jest.fn(),
    };
  });

  describe('SlotGeneratorService', () => {
    it('should generate slots for date range excluding breaks, time off, and branch exceptions', async () => {
      const service = new SlotGeneratorService(mockResourceRepo);

      const resource = Resource.create({
        id: validUuid1,
        tenantId: validUuid2,
        branchId: validUuid3,
        typeId: validUuid1,
        name: 'Dr. John Doe',
        capacity: 1,
      });

      const rule = ResourceAvailabilityRule.create({
        id: validUuid1,
        resourceId: validUuid1,
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '11:00',
        validFrom: new Date('2026-06-01T00:00:00Z'),
        validTo: new Date('2026-06-30T23:59:59Z'),
      });

      const brk = ResourceBreak.create({
        id: validUuid1,
        availabilityRuleId: validUuid1,
        startTime: '09:30',
        endTime: '10:00',
      });

      const timeOff = {
        id: validUuid1,
        resourceId: validUuid1,
        startDatetime: new Date('2026-06-08T10:00:00Z'), // Monday June 8th, 10:00 - 10:30
        endDatetime: new Date('2026-06-08T10:30:00Z'),
        reason: 'Medical checkup',
      };

      const branchException = {
        id: validUuid2,
        tenantId: validUuid2,
        branchId: validUuid3,
        startDatetime: new Date('2026-06-08T10:45:00Z'), // Monday June 8th, 10:45 - 11:00
        endDatetime: new Date('2026-06-08T11:00:00Z'),
        reason: 'Maintenance',
        isFullDay: false,
      };

      mockResourceRepo.findById.mockResolvedValue(resource);
      mockResourceRepo.findAvailabilityRulesByResourceId.mockResolvedValue([rule]);
      mockResourceRepo.findBreaksByAvailabilityRuleId.mockResolvedValue([brk]);
      mockResourceRepo.findTimeOffByResourceId.mockResolvedValue([timeOff]);
      mockResourceRepo.findBranchExceptionsByBranchId.mockResolvedValue([branchException]);

      const slots = await service.generateSlotsForDateRange(
        ResourceId.create(validUuid1),
        new Date('2026-06-08T00:00:00Z'), // Monday
        new Date('2026-06-08T23:59:59Z'),
        15 // 15-minute slot size
      );

      // Total work duration: 09:00 to 11:00 (120 minutes)
      // 15-minute slots:
      // 09:00 - 09:15 -> OK
      // 09:15 - 09:30 -> OK
      // 09:30 - 09:45 -> OVERLAPS BREAK (09:30 - 10:00) -> EXCLUDED
      // 09:45 - 10:00 -> OVERLAPS BREAK (09:30 - 10:00) -> EXCLUDED
      // 10:00 - 10:15 -> OVERLAPS TIME OFF (10:00 - 10:30) -> EXCLUDED
      // 10:15 - 10:30 -> OVERLAPS TIME OFF (10:00 - 10:30) -> EXCLUDED
      // 10:30 - 10:45 -> OK
      // 10:45 - 11:00 -> OVERLAPS BRANCH EXCEPTION (10:45 - 11:00) -> EXCLUDED

      expect(slots).toHaveLength(3);
      expect(slots[0].timeRange.startsAt.toISOString()).toBe('2026-06-08T09:00:00.000Z');
      expect(slots[0].timeRange.endsAt.toISOString()).toBe('2026-06-08T09:15:00.000Z');
      expect(slots[1].timeRange.startsAt.toISOString()).toBe('2026-06-08T09:15:00.000Z');
      expect(slots[1].timeRange.endsAt.toISOString()).toBe('2026-06-08T09:30:00.000Z');
      expect(slots[2].timeRange.startsAt.toISOString()).toBe('2026-06-08T10:30:00.000Z');
      expect(slots[2].timeRange.endsAt.toISOString()).toBe('2026-06-08T10:45:00.000Z');
    });
  });

  describe('GetAvailableSlotsQueryHandler', () => {
    it('should query a single resource availability snapshot timeline', async () => {
      const handler = new GetAvailableSlotsQueryHandler(mockSnapshotRepo, mockResourceRepo);

      const cachedTimeline = {
        slots: [
          { startsAt: '2026-06-04T09:00:00Z', endsAt: '2026-06-04T09:30:00Z', status: 'AVAILABLE' },
        ],
      };
      mockSnapshotRepo.findByResourceIdAndDate.mockResolvedValue({
        id: validUuid1,
        resourceId: validUuid1,
        date: new Date('2026-06-04'),
        timeline: cachedTimeline,
        lastCalculatedAt: new Date(),
      });

      const result = await handler.execute({
        tenantId: validUuid2,
        branchId: validUuid3,
        serviceId: validUuid1,
        resourceId: validUuid1,
        date: '2026-06-04',
      });

      expect(result).toEqual(cachedTimeline);
      expect(mockSnapshotRepo.findByResourceIdAndDate).toHaveBeenCalledTimes(1);
    });

    it('should query availability timelines for all branch resources if resourceId not provided', async () => {
      const handler = new GetAvailableSlotsQueryHandler(mockSnapshotRepo, mockResourceRepo);

      const r1 = Resource.create({
        id: validUuid1,
        tenantId: validUuid2,
        branchId: validUuid3,
        typeId: validUuid1,
        name: 'Dr. A',
      });
      const r2 = Resource.create({
        id: validUuid2,
        tenantId: validUuid2,
        branchId: validUuid3,
        typeId: validUuid1,
        name: 'Dr. B',
      });

      mockResourceRepo.findByBranchId.mockResolvedValue([r1, r2]);
      mockSnapshotRepo.findByResourceIdAndDate.mockImplementation((resId: ResourceId) => {
        if (resId.value === validUuid1) {
          return Promise.resolve({ timeline: { slots: ['r1-slots'] } });
        }
        return Promise.resolve({ timeline: { slots: ['r2-slots'] } });
      });

      const result = await handler.execute({
        tenantId: validUuid2,
        branchId: validUuid3,
        serviceId: validUuid1,
        date: '2026-06-04',
      });

      expect(result[validUuid1]).toEqual({ slots: ['r1-slots'] });
      expect(result[validUuid2]).toEqual({ slots: ['r2-slots'] });
      expect(mockResourceRepo.findByBranchId).toHaveBeenCalledTimes(1);
      expect(mockSnapshotRepo.findByResourceIdAndDate).toHaveBeenCalledTimes(2);
    });
  });

  describe('TypeOrmAgendaSnapshotRepository', () => {
    it('should call query SELECT on findByResourceIdAndDate', async () => {
      const repo = new TypeOrmAgendaSnapshotRepository(mockDataSource);
      mockDataSource.query.mockResolvedValue([]);

      const result = await repo.findByResourceIdAndDate(ResourceId.create(validUuid1), new Date('2026-06-04'));

      expect(result).toBeNull();
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, resource_id'),
        [validUuid1, '2026-06-04']
      );
    });

    it('should call query INSERT with ON CONFLICT on upsert', async () => {
      const repo = new TypeOrmAgendaSnapshotRepository(mockDataSource);
      mockDataSource.query.mockResolvedValue([]);

      const timeline = { slots: [] };
      await repo.upsert(ResourceId.create(validUuid1), new Date('2026-06-04'), timeline);

      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO agenda_daily_snapshots'),
        [
          expect.any(String),
          validUuid1,
          '2026-06-04',
          JSON.stringify(timeline),
          expect.any(Date),
        ]
      );
    });
  });
});
