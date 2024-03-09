import { IsEmail, IsString, MinLength } from 'class-validator';


// TODO: Fix problem with validation
export class SignUpDto {

  @IsEmail({}, { message: "Please enter correct email"})
  readonly email: string;

  @IsString()
  @MinLength(6)
  readonly password: string;
}
