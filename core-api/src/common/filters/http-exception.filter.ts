import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse: any = exception.getResponse();
      
      message = exception.message;
      if (typeof exceptionResponse === 'object') {
        message = exceptionResponse.message || message;
        code = exceptionResponse.error || code;
        details = exceptionResponse.message instanceof Array ? exceptionResponse.message : null;
      }
    } else {
      this.logger.error(`Unhandled Exception: ${exception}`, (exception as Error)?.stack);
    }

    response.status(status).json({
      error: {
        code,
        message,
        details,
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
