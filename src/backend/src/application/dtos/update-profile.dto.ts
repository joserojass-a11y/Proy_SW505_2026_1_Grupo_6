import { Transform, type TransformFnParams } from 'class-transformer';
import { IsEmail, IsString, Length, ValidateIf } from 'class-validator';

export class UpdateProfileDto {
  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @ValidateIf((dto: UpdateProfileDto) => !dto.fullName)
  @IsEmail()
  email?: string;

  @Transform(({ value, obj }: TransformFnParams) => {
    const candidate = value ?? (obj as { full_name?: unknown }).full_name;
    return typeof candidate === 'string' ? candidate.trim() : candidate;
  })
  @ValidateIf((dto: UpdateProfileDto) => !dto.email)
  @IsString()
  @Length(2, 100)
  fullName?: string;
}
