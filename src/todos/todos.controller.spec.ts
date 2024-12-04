import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { TodosModule } from './todos.module';

describe('TodosController', () => {
  let controller: TodosController;

  // mocking the service
  const mockTodoService = {
    createTodo: jest.fn((userId, title) => {
      return {
        id: expect.any(Number),
        title,
        completed: expect.any(Boolean),
        userId,
      };
    }),
    findOneTodo: jest.fn((id) => {
      return {
        id,
        title: expect.any(String),
        completed: expect.any(Boolean),
        userId: expect.any(Number),
      };
    }),
    listTodos: jest.fn((userId) => {
      return [
        {
          id: expect.any(Number),
          title: expect.any(String),
          completed: expect.any(Boolean),
          userId,
        },
      ];
    }),
    updateTodo: jest.fn((id, userId, payload) => {
      return {
        id,
        title: payload.title,
        completed: payload.completed,
        userId,
      };
    }),
    deleteTodo: jest.fn((id) => {
      return {
        id,
        title: expect.any(String),
        completed: expect.any(Boolean),
        userId: expect.any(Number),
      };
    }),
  };

  const mockUser = {
    id: 1,
    email: expect.any(String),
    password: expect.any(String),
  };

  beforeEach(async () => {
    // mocking the module
    const module: TestingModule = await Test.createTestingModule({
      imports: [TodosModule],
      controllers: [TodosController],
      providers: [TodosService],
    })
      .overrideProvider(TodosService) // overriding todoService
      .useValue(mockTodoService)
      .overrideGuard(AuthGuard('jwt')) // overriding JwtAuthGuard
      .useValue({
        canActivate: jest.fn(() => true), // Mocking success authorization
      })
      .compile();

    controller = module.get<TodosController>(TodosController);

    // clear the mocks after compile
    mockTodoService.createTodo.mockClear();
    mockTodoService.findOneTodo.mockClear();
    mockTodoService.listTodos.mockClear();
    mockTodoService.updateTodo.mockClear();
    mockTodoService.deleteTodo.mockClear();
  });

  it('todo module: should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('todo controller: should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create handler: should call createTodo service correctly', async () => {
    const dto = {
      id: expect.any(Number),
      title: 'New Todo',
      completed: false,
      userId: 1,
    };
    expect(await controller.create({ title: dto.title }, mockUser)).toEqual(
      dto,
    );

    expect(mockTodoService.createTodo).toHaveBeenCalledTimes(1);
    expect(mockTodoService.createTodo).toHaveBeenCalledWith(
      dto.userId,
      dto.title,
    );
  });

  it('list handler: should call listTodos service correctly', async () => {
    const args = {
      user: mockUser,
      limit: 5,
      offset: 0,
    };
    const dto = [
      {
        id: expect.any(Number),
        title: expect.any(String),
        completed: expect.any(Boolean),
        userId: 1,
      },
    ];
    expect(await controller.list(args.user, args.limit, args.offset)).toEqual(
      dto,
    );

    expect(mockTodoService.listTodos).toHaveBeenCalledTimes(1);
    expect(mockTodoService.listTodos).toHaveBeenCalledWith(
      args.user.id,
      args.limit,
      args.offset,
    );
  });

  it('findOne handler: should call findOneTodo service correctly', async () => {
    const dto = {
      id: 1,
      title: expect.any(String),
      completed: expect.any(Boolean),
      userId: 1,
    };
    expect(await controller.findOne(dto.id, mockUser)).toEqual(dto);

    expect(mockTodoService.findOneTodo).toHaveBeenCalledTimes(1);
    expect(mockTodoService.findOneTodo).toHaveBeenCalledWith(1, dto.userId);
  });

  it('update handler: should call updateTodo service correctly', async () => {
    const dto = {
      id: 1,
      title: 'new title',
      completed: true,
      userId: expect.any(Number),
    };
    // expect update return value to be equal to result
    const result = await controller.update(dto.id, mockUser, {
      title: dto.title,
      completed: dto.completed,
    });
    expect(result).toEqual(dto);

    expect(mockTodoService.updateTodo).toHaveBeenCalledTimes(1);
    expect(mockTodoService.updateTodo).toHaveBeenCalledWith(
      dto.id,
      mockUser.id,
      {
        title: dto.title,
        completed: dto.completed,
      },
    );
  });

  it('delete handler: should call deleteTodo service correctly', async () => {
    const dto = {
      id: 1,
      title: expect.any(String),
      completed: expect.any(Boolean),
      userId: expect.any(Number),
    };
    // expect delete return value to be equal to result
    expect(await controller.delete(dto.id, mockUser)).toEqual(dto);

    expect(mockTodoService.deleteTodo).toHaveBeenCalledTimes(1);
    expect(mockTodoService.deleteTodo).toHaveBeenCalledWith(
      dto.id,
      mockUser.id,
    );
  });
});
