import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}

  async createTodo(userId: number, title: string) {
    return this.prisma.todo.create({
      data: { title, userId },
    });
  }

  async listTodos(userId: number) {
    return this.prisma.todo.findMany({ where: { userId } });
  }
}
