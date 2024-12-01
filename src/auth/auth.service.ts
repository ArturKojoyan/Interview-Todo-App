import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async register(email: string, password: string) {
    const candidate = await this.prisma.user.findUnique({ where: { email } });
    if (candidate) {
      throw new BadRequestException('user with inputted email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    if (!hashedPassword) {
      throw new InternalServerErrorException('password hashing failed');
    }

    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword },
    });
    if (!user) {
      throw new InternalServerErrorException('failed to create a user');
    }
    const { password: _password, ...rest } = user;

    return rest;
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('user not found with inputted email');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('password does not match');
    }

    const { password: _password, ...rest } = user;
    const payload = this.jwtService.sign(rest);
    return payload;
  }
}
