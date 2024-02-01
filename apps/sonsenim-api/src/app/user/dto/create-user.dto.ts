import { IsEmail, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(1)
  @MaxLength(3)
  @IsString()
  password: string;
}
