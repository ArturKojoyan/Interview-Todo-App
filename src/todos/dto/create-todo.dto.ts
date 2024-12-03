import { Length } from 'class-validator';

export class CreateTodoDto {
  @Length(4, 24, {
    message: 'title must be more then 4 chars and less then 24 chars',
  })
  title: string;
}
