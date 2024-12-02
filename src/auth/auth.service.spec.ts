import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './../prisma/prisma.service';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  // mock prisma service
  const mockPrisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  //mock jwt service
  const mockJwt = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    // create test module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: JwtService,
          useValue: mockJwt,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // clear the mocks after compile
    mockPrisma.user.create.mockClear();
    mockPrisma.user.findUnique.mockClear();
    mockJwt.sign.mockClear();
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  it('register method should throw an error when candidate with inputted email is found', async () => {
    const dto = {
      id: 1,
      email: 'test@gmail.com',
      password: '123456',
    };
    // resolving fundUnique with user data
    mockPrisma.user.findUnique.mockResolvedValue({
      id: dto.id,
      email: dto.email,
    });

    // test if register throws a BadRequestException
    await expect(service.register(dto.email, dto.password)).rejects.toThrow(
      BadRequestException,
    );

    expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: dto.email },
    });
    expect(mockPrisma.user.create).toHaveBeenCalledTimes(0);
  });

  it('register method should throw an error when bcrypt hashing fails', async () => {
    const dto = {
      id: 1,
      email: 'test@gmail.com',
      password: '123456',
    };
    // resolving fundUnique with null
    mockPrisma.user.findUnique.mockResolvedValue(null);

    // making bcrypt hast method to throw an error
    jest.spyOn(bcrypt, 'hash').mockImplementation(() => {
      throw new InternalServerErrorException();
    });

    // expect register method to throw an error
    await expect(service.register(dto.email, dto.password)).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: dto.email },
    });
    expect(mockPrisma.user.create).toHaveBeenCalledTimes(0);
  });

  it('register method should throw an error when user is not created', async () => {
    const dto = {
      id: 1,
      email: 'test@gmail.com',
      password: '123456',
    };

    jest.spyOn(bcrypt, 'hash').mockImplementation((pass) => pass);

    // mocking findUnique to return null
    mockPrisma.user.findUnique.mockResolvedValue(null);
    // mocking create to return null
    mockPrisma.user.create.mockResolvedValue(null);

    // test the returned result of register
    await expect(service.register(dto.email, dto.password)).rejects.toThrow(
      InternalServerErrorException,
    );

    // expect methods above to be called
    expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: dto.email },
    });
    expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: { email: dto.email, password: expect.any(String) },
    });
  });

  it('register method should work properly', async () => {
    const dto = {
      id: 1,
      email: 'test@gmail.com',
      password: '123456',
    };

    jest.spyOn(bcrypt, 'hash').mockImplementation((pass) => pass);

    // mocking findUnique to return null
    mockPrisma.user.findUnique.mockResolvedValue(null);

    // mocking create to return dto object
    mockPrisma.user.create.mockResolvedValue(dto);

    // test the returned result of register
    const result = await service.register(dto.email, dto.password);
    expect(result).toEqual({
      id: dto.id,
      email: dto.email,
      password: dto.password,
    });

    expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: dto.email },
    });
    expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: { email: dto.email, password: expect.any(String) },
    });
  });

  it('validateUser method should throw an error when user not found', async () => {
    const dto = {
      id: 1,
      email: 'test@gmail.com',
      password: '123456',
    };

    // make compare to return true
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);

    // mocking findUnique to return null
    mockPrisma.user.findUnique.mockResolvedValue(null);

    // test if validateUser throws a NotFoundException
    await expect(service.validateUser(dto.email, dto.password)).rejects.toThrow(
      NotFoundException,
    );

    expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: dto.email },
    });
  });

  it('validateUser method should throw an error when bcrypt compare fails', async () => {
    const dto = {
      id: 1,
      email: 'test@gmail.com',
      password: '123456',
    };

    // make compare to return true
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);

    // mocking findUnique to return null
    mockPrisma.user.findUnique.mockResolvedValue({
      id: dto.id,
      email: dto.email,
    });

    // test if validateUser throws a BadRequestException
    await expect(service.validateUser(dto.email, dto.password)).rejects.toThrow(
      BadRequestException,
    );

    expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: dto.email },
    });
  });

  it('validateUser method should work properly', async () => {
    const dto = {
      id: 1,
      email: 'test@gmail.com',
      password: '123456',
    };

    // make compare to return true
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);

    // mocking findUnique to return null
    mockPrisma.user.findUnique.mockResolvedValue({
      id: dto.id,
      email: dto.email,
    });

    mockJwt.sign.mockResolvedValue({
      id: dto.id,
      email: dto.email,
    });

    // test the returned result of register
    const result = await service.validateUser(dto.email, dto.password);
    expect(result).toEqual({ id: dto.id, email: dto.email });

    expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: dto.email },
    });
  });
});
