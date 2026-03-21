import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? (exception as HttpException).getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!isHttp) {
      this.logger.error(`Unhandled exception on ${request.method} ${request.url}: ${exception?.message}`, exception?.stack);
    }

    const resp: any = isHttp ? (exception as HttpException).getResponse() : null;
    const rawMessage = resp?.message ?? exception?.message ?? HttpStatus[status];
    const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : String(rawMessage || 'Error');
    const code = resp?.code
      || this.defaultCodeFromStatus(status)
      || 'INTERNAL_ERROR';

    const payload = {
      ok: false,
      code,
      message,
      status,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(payload);
  }

  private defaultCodeFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST: return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED: return 'INVALID_CREDENTIALS';
      case HttpStatus.FORBIDDEN: return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND: return 'NOT_FOUND';
      case HttpStatus.CONFLICT: return 'EMAIL_TAKEN';
      case HttpStatus.UNPROCESSABLE_ENTITY: return 'UNPROCESSABLE';
      default: return 'INTERNAL_ERROR';
    }
  }
}
