import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data: any) => {
        // If response already follows the shape, pass through
        if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
          return data as ApiResponse<T>;
        }
        return {
          success: true,
          data: data as T,
        };
      }),
    );
  }
}
