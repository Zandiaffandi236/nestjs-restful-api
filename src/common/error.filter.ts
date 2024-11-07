import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { ZodError } from 'zod';

@Catch(ZodError, HttpException)
export class ErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).send(exception.getResponse());
    } else if (exception instanceof ZodError) {
      const errorMessage = exception.issues.map((item) => {
        return `${item.message} on value ${item.path}`;
      });

      response.status(400).json({
        status: 'fail',
        message: errorMessage,
      });
    } else {
      response.status(500).json({
        errors: exception.message,
      });
    }
  }
}
