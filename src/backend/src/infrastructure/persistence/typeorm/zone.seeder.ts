import { DataSource } from 'typeorm';
import { TypeOrmZoneEntity } from './entities/typeorm-zone.entity';

export const ZONES_SEED = [
  { id: '11111111-1111-4111-a111-111111111111', name: 'Perú', code: 'PE' },
  { id: '22222222-2222-4222-a222-222222222222', name: 'Colombia', code: 'CO' },
  { id: '33333333-3333-4333-a333-333333333333', name: 'Chile', code: 'CL' },
  { id: '44444444-4444-4444-a444-444444444444', name: 'China', code: 'CN' },
  { id: '55555555-5555-4555-a555-555555555555', name: 'Estados Unidos', code: 'US' },
];

export async function seedZones(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository(TypeOrmZoneEntity);
  for (const zoneData of ZONES_SEED) {
    const exists = await repository.findOne({ where: { code: zoneData.code } });
    if (!exists) {
      const zone = repository.create(zoneData);
      await repository.save(zone);
    }
  }
}
