import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalGuard } from './guards/local.guard';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(AuthInterceptor)
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body.email, body.password);
  }

  @Post('login')
  @UseGuards(LocalGuard)
  async login(@Req() req) {
    return req.user;
  }
}
