import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';

@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodosController {
  constructor(private todosService: TodosService) {}

  @Post()
  async create(@Body() body: CreateTodoDto, @Req() req) {
    return this.todosService.createTodo(req.user.id, body.title);
  }

  @Get()
  async list(@Req() req) {
    return this.todosService.listTodos(req.user.id);
  }
}
