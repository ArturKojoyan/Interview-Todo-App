import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { AuthGuard } from '@nestjs/passport';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  jest.spyOn(bcrypt, 'hash').mockImplementation((pass) => pass);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(PrismaService) // overriding PrismaService
      .useValue(mockPrisma)
      .overrideGuard(AuthGuard('local')) // overriding JwtAuthGuard
      .useValue({
        canActivate: jest.fn(() => true), // mocking success authorization
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('/auth/register (POST) --> 201', () => {
    const dto = { id: 1, email: 'test@gmail.com', password: '123456' };
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: dto.id,
      email: dto.email,
    });

    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: dto.email, password: dto.password })
      .expect(201)
      .expect('Content-Type', /json/)
      .expect({ id: dto.id, email: dto.email });
  });

  it('/auth/register (POST) --> 400 fails on validation', () => {
    const dto = { id: 1, email: 'testgmail.com', password: '1234' };

    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: dto.email, password: dto.password })
      .expect(400)
      .expect('Content-Type', /json/);
  });

  it('/auth/register (POST) --> 500 fails while creating a new user', () => {
    const dto = { id: 1, email: 'test@gmail.com', password: '123456' };
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue(null);

    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: dto.email, password: dto.password })
      .expect(500)
      .expect('Content-Type', /json/);
  });

  // it('/auth/login (POST)', () => {
  //   mockPrisma.user.findUnique.mockResolvedValue({
  //     id: '1',
  //     email: 'test@gmail.com',
  //   });
  //   return request(app.getHttpServer())
  //     .post('/auth/login')
  //     .expect(201)
  //     .expect({ id: 1, email: 'test@gmail.com' });
  // });
});
