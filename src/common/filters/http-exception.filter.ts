import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = 'Internal server error';
    let error: any = undefined;

    if (isHttp) {
      const res: any = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = (res.message ?? res.error ?? 'Request failed') as any;
        error = res;
      }
    } else if (exception instanceof Error) {
      message = exception.message || message;
    }

    response.status(status).json({
      success: false,
      message,
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
      statusCode: status,
    });
  }
}
