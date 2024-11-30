import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodosController {
  constructor(private todosService: TodosService) {}

  @Post()
  async create(@Body() body: CreateTodoDto, @Req() req) {
    return this.todosService.createTodo(req.user.id, body.title);
  }

  @Get('/:id')
  async findOne(@Param('id', ParseIntPipe) id, @Req() req) {
    const todo = await this.todosService.findOneTodo(id, req.user.id);
    if (!todo) {
      throw new NotFoundException();
    }
    return todo;
  }

  @Get()
  async list(@Req() req) {
    return this.todosService.listTodos(req.user.id);
  }

  @Patch('/:id')
  async update(
    @Param('id', ParseIntPipe) id,
    @Body() body: UpdateTodoDto,
    @Req() req,
  ) {
    const todo = await this.todosService.findOneTodo(id, req.user.id);
    if (!todo) {
      throw new NotFoundException('todo with provided id is not found');
    }
    return this.todosService.updateTodo(id, body);
  }

  @Delete('/:id')
  async delete(@Param('id', ParseIntPipe) id, @Req() req) {
    const todo = await this.todosService.findOneTodo(id, req.user.id);
    if (!todo) {
      throw new NotFoundException('todo with provided id is not found');
    }
    return this.todosService.deleteTodo(id);
  }
}
