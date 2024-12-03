import { AuthService } from './../src/auth/auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  const mockJwt = {
    sign: jest.fn().mockImplementation((payload) => payload.toString()),
  };

  const mockGuard = {
    canActivate: jest.fn(),
  };
  const mockService = {
    validateUser: jest.fn(),
    register: jest.fn(),
  };

  const mockUser = { id: 1, email: 'test@gmail.com', password: '123456' };

  jest.spyOn(bcrypt, 'hash').mockImplementation((pass) => pass);
  jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(PrismaService) // overriding PrismaService
      .useValue(mockPrisma)
      .overrideGuard(AuthGuard('local')) // overriding local AuthGuard
      .useValue(mockGuard)
      .overrideProvider(JwtService) // overriding JwtService
      .useValue(mockJwt)
      .overrideProvider(AuthService) // overriding AuthService
      .useValue(mockService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('/auth/register (POST) --> 201', () => {
    mockService.register.mockResolvedValue(mockUser);

    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: mockUser.id,
      email: mockUser.email,
    });

    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: mockUser.email, password: mockUser.password })
      .expect(201)
      .expect('Content-Type', /json/)
      .expect({ id: mockUser.id, email: mockUser.email });
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
    mockService.register.mockResolvedValue(null);
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue(null);

    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: mockUser.email, password: mockUser.password })
      .expect(500)
      .expect('Content-Type', /json/);
  });

  it('/auth/login (POST) --> 201', () => {
    mockService.validateUser.mockResolvedValue(mockUser);
    mockGuard.canActivate.mockResolvedValue(true);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: mockUser.id,
      email: mockUser.email,
    });

    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: mockUser.email, password: mockUser.password })
      .expect(201);
  });

  it('/auth/login (POST) --> 401', () => {
    mockService.validateUser.mockResolvedValue(null);

    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: mockUser.email, password: mockUser.password })
      .expect(401);
  });
});
