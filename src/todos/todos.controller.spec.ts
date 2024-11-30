import { Test, TestingModule } from '@nestjs/testing';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';

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
      if (id === 10) {
        return null;
      }
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
    updateTodo: jest.fn((id, payload) => {
      return {
        id,
        title: payload.title,
        completed: payload.completed,
        userId: expect.any(Number),
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

  beforeEach(async () => {
    // mocking the module
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodosController],
      providers: [TodosService],
    })
      // overriding todoService with mockTodoService
      .overrideProvider(TodosService)
      .useValue(mockTodoService)
      .compile();

    controller = module.get<TodosController>(TodosController);

    // clear the mocks after compile
    mockTodoService.createTodo.mockClear();
    mockTodoService.findOneTodo.mockClear();
    mockTodoService.listTodos.mockClear();
    mockTodoService.updateTodo.mockClear();
    mockTodoService.deleteTodo.mockClear();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create new todo', async () => {
    const req = {
      user: { id: 1 },
    };
    const dto = {
      id: expect.any(Number),
      title: 'New Todo',
      completed: false,
      userId: 1,
    };
    expect(await controller.create({ title: dto.title }, req)).toEqual(dto);

    expect(mockTodoService.createTodo).toHaveBeenCalledTimes(1);
    expect(mockTodoService.createTodo).toHaveBeenCalledWith(
      dto.userId,
      dto.title,
    );
  });

  it('should get specific user todos', async () => {
    const req = {
      user: { id: 1 },
    };
    const dto = [
      {
        id: expect.any(Number),
        title: expect.any(String),
        completed: expect.any(Boolean),
        userId: 1,
      },
    ];
    expect(await controller.list(req)).toEqual(dto);

    expect(mockTodoService.listTodos).toHaveBeenCalledTimes(1);
    expect(mockTodoService.listTodos).toHaveBeenCalledWith(1);
  });

  it('should get todo when id is 1', async () => {
    const req = {
      user: { id: 1 },
    };
    const dto = {
      id: 1,
      title: expect.any(String),
      completed: expect.any(Boolean),
      userId: 1,
    };
    expect(await controller.findOne(dto.id, req)).toEqual(dto);

    expect(mockTodoService.findOneTodo).toHaveBeenCalledTimes(1);
    expect(mockTodoService.findOneTodo).toHaveBeenCalledWith(1, dto.userId);
  });

  // it('should throw error when id is 10', async () => {
  //   expect(await controller.findOne(10)).rejects.toThrow(NotFoundException);

  //   expect(mockTodoService.findOneTodo).toHaveBeenCalledTimes(1);
  // });

  it('should update todo correctly', async () => {
    const req = {
      user: { id: 1 },
    };
    const dto = {
      id: 1,
      title: 'new title',
      completed: true,
      userId: expect.any(Number),
    };
    expect(
      await controller.update(
        dto.id,
        {
          title: dto.title,
          completed: dto.completed,
        },
        req,
      ),
    ).toEqual(dto);

    expect(mockTodoService.findOneTodo).toHaveBeenCalled();
    expect(mockTodoService.updateTodo).toHaveBeenCalledTimes(1);
    expect(mockTodoService.updateTodo).toHaveBeenCalledWith(dto.id, {
      title: dto.title,
      completed: dto.completed,
    });
  });

  it('should delete todo correctly', async () => {
    const req = {
      user: { id: 1 },
    };
    const dto = {
      id: 1,
      title: expect.any(String),
      completed: expect.any(Boolean),
      userId: expect.any(Number),
    };
    expect(await controller.delete(dto.id, req)).toEqual(dto);

    expect(mockTodoService.findOneTodo).toHaveBeenCalled();
    expect(mockTodoService.deleteTodo).toHaveBeenCalledTimes(1);
    expect(mockTodoService.deleteTodo).toHaveBeenCalledWith(dto.id);
  });
});
