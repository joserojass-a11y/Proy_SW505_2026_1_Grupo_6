import { Transform, type TransformFnParams } from 'class-transformer';
import { IsIn, IsNotEmpty, IsObject, IsOptional, IsString, Length } from 'class-validator';

export class CreateTenantDto {
  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  @IsIn(['PE', 'MX', 'CL', 'AR', 'CO'])
  countryCode!: string;

  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  subdomain!: string;

  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @Length(2, 255)
  name!: string;

  @IsOptional()
  @IsObject()
  globalSettings?: Record<string, unknown>;
}
