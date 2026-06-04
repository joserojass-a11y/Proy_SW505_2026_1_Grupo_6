import { Transform, type TransformFnParams } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsObject, IsOptional, IsString, Length } from 'class-validator';

export class CreateCustomerDto {
  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  firstName!: string;

  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  lastName!: string;

  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email!: string;

  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  timezone!: string;

  @IsOptional()
  @IsObject()
  preferences?: Record<string, unknown>;

  @IsBoolean()
  consentSigned!: boolean;
}
