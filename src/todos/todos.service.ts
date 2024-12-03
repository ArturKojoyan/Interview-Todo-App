import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  async createTodo(userId: number, title: string) {
    return await this.prisma.todo.create({
      data: { title, userId },
    });
  }

  async findOneTodo(id: number, userId: number) {
    const todo = await this.prisma.todo.findFirst({ where: { id } });
    if (!todo) {
      throw new NotFoundException('todo with provided id is not found');
    }
    if (todo.userId !== userId) {
      throw new ForbiddenException('You are not permitted to access this todo');
    }
    return todo;
  }

  async listTodos(userId: number, limit: number = 5, offset: number = 0) {
    return await this.prisma.todo.findMany({
      skip: offset,
      take: limit,
      where: { userId },
    });
  }

  async updateTodo(id: number, userId: number, payload: UpdateTodoDto) {
    const todo = await this.findOneTodo(id, userId);
    if (todo.id) {
      return await this.prisma.todo.update({
        where: {
          id,
          userId,
        },
        data: payload,
      });
    }
  }

  async deleteTodo(id: number, userId: number) {
    const todo = await this.findOneTodo(id, userId);
    if (todo.id) {
      return await this.prisma.todo.delete({ where: { id, userId } });
    }
  }
}
