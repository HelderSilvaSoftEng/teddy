import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { trace } from '@opentelemetry/api';

let initialized = false;

export function initializeOpenTelemetry(): void {
  if (initialized) {
    console.log('⚠️  OpenTelemetry já foi inicializado');
    return;
  }

  try {
    const resource = Resource.default().merge(
      new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'teddy-backend',
        [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
        'deployment.environment': process.env.NODE_ENV || 'development',
      }),
    );

    const provider = new NodeTracerProvider({
      resource,
    });

    const otlpExporter = new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
      headers: {},
    });

    provider.addSpanProcessor(new BatchSpanProcessor(otlpExporter));

    provider.register();

    registerInstrumentations({
      instrumentations: [
        new HttpInstrumentation({
          enabled: true,
          requestHook: (span, request: any) => {
            if (request.socket?.remoteAddress) {
              span.setAttribute('http.client_ip', request.socket.remoteAddress);
            }
          },
          responseHook: (span, response: any) => {
            if (response?.getHeaders?.()) {
              const headers = response.getHeaders();
              if (headers['content-length']) {
                span.setAttribute('http.response_content_length', headers['content-length']);
              }
            }
          },
        }),
        new ExpressInstrumentation({
          enabled: true,
        }),
        new PgInstrumentation({
          enabled: true,
        }),
      ],
    });

    initialized = true;
    console.log('✅ OpenTelemetry inicializado com sucesso');
    console.log(`   📍 Exporter: ${process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces'}`);
  } catch (error) {
    console.error('❌ Erro ao inicializar OpenTelemetry:', error);
    // Não lança erro - permite que app continue funcionando
  }
}

export function getTracer(name: string) {
  return trace.getTracer(name, process.env.npm_package_version || '1.0.0');
}


export function withSpan<T>(tracer: any, spanName: string, fn: (span: any) => Promise<T> | T, attributes: Record<string, any> = {}): Promise<T> {
  const span = tracer.startSpan(spanName, {
    attributes,
  });

  return Promise.resolve()
    .then(() => fn(span))
    .then((result) => {
      span.end();
      return result;
    })
    .catch((error) => {
      span.recordException(error);
      span.setStatus({ code: 2 });
      span.end();
      throw error;
    });
}
