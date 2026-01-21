import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export function initializeTracing(): void {
  try {
    const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';
    console.log(`🔍 [TELEMETRY] Inicializando OpenTelemetry com endpoint: ${endpoint}`);

    const otlpExporter = new OTLPTraceExporter({
      url: endpoint,
    });

    const sdk = new NodeSDK({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'teddy-backend',
        [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
      }),
      traceExporter: otlpExporter,
      instrumentations: [getNodeAutoInstrumentations()],
    });

    sdk.start();
    console.log('✅ [TELEMETRY] OpenTelemetry iniciado com sucesso');

    process.on('SIGTERM', () => {
      sdk
        .shutdown()
        .then(() => console.log('🛑 [TELEMETRY] Tracing terminated'))
        .catch((log) => console.log('❌ [TELEMETRY] Error terminating tracing', log))
        .finally(() => process.exit(0));
    });
  } catch (error) {
    console.error('❌ [TELEMETRY] Erro ao inicializar telemetria:', error);
  }
}

export function getTracer() {
  const { trace } = require('@opentelemetry/api');
  return trace.getTracer('teddy-tracer', '1.0.0');
}
