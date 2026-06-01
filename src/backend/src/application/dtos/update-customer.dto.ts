import { Transform, type TransformFnParams } from 'class-transformer';
import { IsBoolean, IsEmail, IsObject, IsOptional, IsString, Length } from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 100)
  firstName?: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 100)
  lastName?: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email?: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  phone?: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsObject()
  preferences?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  consentSigned?: boolean;
}
