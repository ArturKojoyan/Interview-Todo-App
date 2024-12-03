import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'email field is required' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'password field is required' })
  @Length(5, 12, {
    message: 'password length must be more then 4 and less or equal 12',
  })
  password: string;
}
