import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';


// TODO: Fix problem with validation
export class SignUpDto {
  @IsNotEmpty()
  @MinLength(5)
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsEmail({}, { message: "Please enter correct email"})
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  readonly password: string;
}
