import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateTodoDto {
  @IsOptional()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsNotEmpty()
  completed: boolean;
}
