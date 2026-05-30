import { Transform, type TransformFnParams } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class RegisterUserDto {
  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @Transform(({ value, obj }: TransformFnParams) => {
    const candidate = value ?? (obj as { full_name?: unknown }).full_name;
    return typeof candidate === 'string' ? candidate.trim() : candidate;
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  fullName!: string;
}
