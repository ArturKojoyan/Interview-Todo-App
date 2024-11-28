import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(4, 12, {
    message: 'Password length must be more then 4 and less or equal 12',
  })
  password: string;
}
