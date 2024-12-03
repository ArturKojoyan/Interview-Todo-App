import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { User, type UserType } from 'src/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodosController {
  constructor(private todosService: TodosService) {}

  @Post()
  async create(@Body() body: CreateTodoDto, @User() user: UserType) {
    return this.todosService.createTodo(user.id, body.title);
  }

  @Get('/:id')
  async findOne(@Param('id', ParseIntPipe) id, @User() user: UserType) {
    return await this.todosService.findOneTodo(id, user.id);
  }

  @Get()
  async list(
    @User() user: UserType,
    @Query('limit', new ParseIntPipe({ optional: true }))
    limit: number | undefined,
    @Query('offset', new ParseIntPipe({ optional: true }))
    offset: number | undefined,
  ) {
    return this.todosService.listTodos(user.id, limit, offset);
  }

  @Patch('/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserType,
    @Body() body: UpdateTodoDto,
  ) {
    return this.todosService.updateTodo(id, user.id, body);
  }

  @Delete('/:id')
  async delete(@Param('id', ParseIntPipe) id: number, @User() user: UserType) {
    return this.todosService.deleteTodo(id, user.id);
  }
}
