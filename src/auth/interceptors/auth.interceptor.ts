import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

type User = {
  id: number;
  email: string;
  password: string;
};

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<User>,
  ): Observable<any> | Promise<Observable<any>> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return next.handle().pipe(map(({ password, ...rest }) => rest));
  }
}
