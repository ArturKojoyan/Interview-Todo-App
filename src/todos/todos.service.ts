import { Injectable } from '@nestjs/common';
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
    return await this.prisma.todo.findFirst({ where: { id, userId } });
  }

  async listTodos(userId: number) {
    return await this.prisma.todo.findMany({ where: { userId } });
  }

  async updateTodo(id: number, payload: UpdateTodoDto) {
    return await this.prisma.todo.update({
      where: {
        id,
      },
      data: payload,
    });
  }

  async deleteTodo(id: number) {
    return await this.prisma.todo.delete({ where: { id } });
  }
}
