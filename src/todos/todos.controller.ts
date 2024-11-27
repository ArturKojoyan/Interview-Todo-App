import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { TodosService } from './todos.service';

@Controller('todos')
export class TodosController {
  constructor(private todosService: TodosService) {}

  @Post()
  async create(@Body() body: { title: string }, @Req() req) {
    return this.todosService.createTodo(req.user.id, body.title);
  }

  @Get()
  async list(@Req() req) {
    return this.todosService.listTodos(req.user.id);
  }
}
