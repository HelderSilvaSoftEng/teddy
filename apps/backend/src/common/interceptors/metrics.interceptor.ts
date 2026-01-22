import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MetricsService } from '../modules/metrics/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const statusCode = context.switchToHttp().getResponse().statusCode;
        const durationSeconds = (Date.now() - startTime) / 1000;

        this.metricsService.recordHttpRequest(
          method,
          url,
          statusCode,
          durationSeconds,
        );
      }),
      catchError((error) => {
        const statusCode = error.status || 500;
        const durationSeconds = (Date.now() - startTime) / 1000;

        this.metricsService.recordHttpRequest(
          method,
          url,
          statusCode,
          durationSeconds,
        );

        throw error;
      }),
    );
  }
}
