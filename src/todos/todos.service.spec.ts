import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { TodosService } from './todos.service';

describe('TodosService', () => {
  let service: TodosService;

  // mock prisma service
  const mockPrisma = {
    todo: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    // create test module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);

    // clear the mocks after compile
    mockPrisma.todo.create.mockClear();
    mockPrisma.todo.findFirst.mockClear();
    mockPrisma.todo.findMany.mockClear();
    mockPrisma.todo.update.mockClear();
    mockPrisma.todo.delete.mockClear();
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  it('createTodo method should work properly', async () => {
    const createDto = {
      id: expect.any(Number),
      title: 'NEW TODO',
      completed: expect.any(Boolean),
      userId: 1,
    };
    mockPrisma.todo.create.mockResolvedValue(createDto);

    // test the returned result of createTodo
    const result = await service.createTodo(createDto.userId, createDto.title);
    expect(result).toEqual(createDto);

    expect(mockPrisma.todo.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.todo.create).toHaveBeenCalledWith({
      data: { title: createDto.title, userId: createDto.userId },
    });
  });

  it('findOneTodo method should work properly', async () => {
    const dto = {
      id: 1,
      title: expect.any(String),
      completed: expect.any(Boolean),
      userId: 1,
    };
    mockPrisma.todo.findFirst.mockResolvedValue(dto);

    // test the returned result of findOneTodo
    const result = await service.findOneTodo(dto.id, dto.userId);
    expect(result).toEqual(dto);

    expect(mockPrisma.todo.findFirst).toHaveBeenCalledTimes(1);
    expect(mockPrisma.todo.findFirst).toHaveBeenCalledWith({
      where: { id: dto.id },
    });
  });

  it('findOneTodo method should throw an error when todo is not found', async () => {
    const dto = {
      id: 15,
      title: expect.any(String),
      completed: expect.any(Boolean),
      userId: 1,
    };
    mockPrisma.todo.findFirst.mockResolvedValue(null);

    // test findOneTodo throws an error
    await expect(service.findOneTodo(dto.id, dto.userId)).rejects.toThrow(
      NotFoundException,
    );

    expect(mockPrisma.todo.findFirst).toHaveBeenCalledTimes(1);
    expect(mockPrisma.todo.findFirst).toHaveBeenCalledWith({
      where: { id: dto.id },
    });
  });

  it('findOneTodo method should throw an error when userId !== todo.userId', async () => {
    const dto = {
      id: 1,
      title: expect.any(String),
      completed: expect.any(Boolean),
      userId: 2,
    };
    mockPrisma.todo.findFirst.mockResolvedValue(dto);

    // test findOneTodo throws an error
    await expect(service.findOneTodo(dto.id, 1)).rejects.toThrow(
      ForbiddenException,
    );

    expect(mockPrisma.todo.findFirst).toHaveBeenCalledTimes(1);
    expect(mockPrisma.todo.findFirst).toHaveBeenCalledWith({
      where: { id: dto.id },
    });
  });

  it('listTodos method should work properly', async () => {
    const query = { limit: 5, offset: 0 };
    const dto = [
      {
        id: 1,
        title: expect.any(String),
        completed: expect.any(Boolean),
        userId: 1,
      },
      {
        id: 2,
        title: expect.any(String),
        completed: expect.any(Boolean),
        userId: 1,
      },
    ];
    mockPrisma.todo.findMany.mockResolvedValue(dto);

    // test the returned result of listTodos
    const result = await service.listTodos(1);
    expect(result).toEqual(dto);

    expect(mockPrisma.todo.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.todo.findMany).toHaveBeenCalledWith({
      skip: query.offset,
      take: query.limit,
      where: { userId: 1 },
    });
  });

  it('updateTodo method should work properly', async () => {
    const dto = {
      id: 1,
      title: 'updated-title',
      completed: true,
      userId: 1,
    };
    mockPrisma.todo.findFirst.mockResolvedValue(dto);
    mockPrisma.todo.update.mockResolvedValue(dto);

    // test the returned result of updateTodo
    const result = await service.updateTodo(dto.id, dto.userId, {
      title: dto.title,
      completed: dto.completed,
    });
    expect(result).toEqual(dto);

    expect(mockPrisma.todo.findFirst).toHaveBeenCalledTimes(1);
    expect(mockPrisma.todo.findFirst).toHaveBeenCalledWith({
      where: { id: dto.id },
    });

    expect(mockPrisma.todo.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.todo.update).toHaveBeenCalledWith({
      where: { id: dto.id, userId: dto.userId },
      data: { title: dto.title, completed: dto.completed },
    });
  });

  it('deleteTodo method should work properly', async () => {
    const dto = {
      id: 1,
      title: expect.any(String),
      completed: expect.any(Boolean),
      userId: 1,
    };
    mockPrisma.todo.findFirst.mockResolvedValue(dto);
    mockPrisma.todo.delete.mockResolvedValue(dto);

    // test the returned result of deleteTodo
    const result = await service.deleteTodo(dto.id, dto.userId);
    expect(result).toEqual(dto);

    expect(mockPrisma.todo.findFirst).toHaveBeenCalledTimes(1);
    expect(mockPrisma.todo.findFirst).toHaveBeenCalledWith({
      where: { id: dto.id },
    });

    expect(mockPrisma.todo.delete).toHaveBeenCalledTimes(1);
    expect(mockPrisma.todo.delete).toHaveBeenCalledWith({
      where: { id: dto.id, userId: dto.userId },
    });
  });
});
