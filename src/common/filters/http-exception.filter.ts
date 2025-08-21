import { ArgumentsHost, Catch, ExceptionFilter, ForbiddenException, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
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
    let details: any = undefined;

    if (isHttp) {
      const res: any = (exception as HttpException).getResponse();
      if (typeof res === 'string') {
        message = res;
        details = res;
      } else if (typeof res === 'object' && res !== null) {
        message = (res.message ?? res.error ?? 'Request failed') as any;
        details = res.message ?? res;
      }
    } else if (exception instanceof Error) {
      message = exception.message || message;
      details = exception.stack ?? exception.message;
    }

    // Derive a machine-readable error code
    const lowerMsg = Array.isArray(message) ? (message[0] || '').toString().toLowerCase() : message.toString().toLowerCase();
    let code = `HTTP_${status}`;
    if (exception instanceof UnauthorizedException) code = 'AUTH_UNAUTHORIZED';
    else if (exception instanceof ForbiddenException) code = 'AUTH_FORBIDDEN';
    else if (status === HttpStatus.UNPROCESSABLE_ENTITY) {
      if (lowerMsg.includes('invalid password') || lowerMsg.includes('user not found')) code = 'AUTH_INVALID_CREDENTIALS';
      else code = 'AUTH_VALIDATION_FAILED';
    }

    response.status(status).json({
      success: false,
      message,
      error: {
        code,
        details,
      },
      timestamp: new Date().toISOString(),
      version: 'v1',
    });
  }
}
