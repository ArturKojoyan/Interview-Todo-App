import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async register(email: string, password: string) {
    const candidate = await this.prisma.user.findUnique({ where: { email } });
    if (candidate) {
      throw new HttpException('user with inputted email already exists', 404);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    if (!hashedPassword) {
      throw new HttpException('password hashing failed', 400);
    }

    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword },
    });
    if (!user) {
      throw new HttpException('failed to cerate a user', 400);
    }

    return user;
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpException('user not found with inputted email', 404);
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new HttpException('password does not match', 404);
    }

    const { password: _password, ...rest } = user;
    const payload = this.jwtService.sign(rest);
    return payload;
  }
}
