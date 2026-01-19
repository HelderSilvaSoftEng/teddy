# 📊 Monitoramento com Prometheus e Grafana

## 🚀 Quick Start

Para iniciar os serviços de monitoramento junto com o banco de dados:

```bash
docker-compose up -d
```

Isso iniciará:
- **PostgreSQL** em `localhost:5432`
- **Prometheus** em `http://localhost:9090`
- **Grafana** em `http://localhost:3001`

## 🔗 Acessando os Serviços

### Prometheus
- URL: http://localhost:9090
- Endpoint de Métricas: http://localhost:3000/api/metrics
- Status do Scrape: http://localhost:9090/targets

### Grafana
- URL: http://localhost:3001
- Usuário: `admin`
- Senha: `admin`
- Data Source: Prometheus (já configurado automaticamente)

## 📈 Métricas Disponíveis

### HTTP Requests
- `http_requests_total` - Total de requisições por método, rota e status code
- `http_request_duration_seconds` - Latência das requisições (buckets: 1ms, 10ms, 100ms, 500ms, 1s, 2s, 5s)
- `http_errors_total` - Total de erros HTTP (4xx e 5xx)

### Database
- `db_query_duration_seconds` - Duração de queries (buckets: 10ms, 50ms, 100ms, 500ms, 1s)
- `active_db_connections` - Número de conexões ativas

### Sistema
- `process_uptime_seconds` - Uptime da aplicação
- `process_memory_bytes` - Uso de memória do processo
- `nodejs_gc_duration_seconds` - Duração de garbage collection

## 📊 Queries Úteis no Prometheus

### Requisições por segundo (RPS)
```promql
rate(http_requests_total[5m])
```

### Latência média (p95)
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### Taxa de erro
```promql
rate(http_errors_total[5m]) / rate(http_requests_total[5m])
```

### Uptime
```promql
process_uptime_seconds
```

## 🎨 Criando Dashboards no Grafana

1. Acesse http://localhost:3001
2. Clique em "Create" > "Dashboard"
3. Selecione "Add new panel"
4. Configure a query Prometheus desejada
5. Salve o dashboard

### Dashboard Recomendado

Crie um painel com:
- **Requisições/s** - `rate(http_requests_total[5m])`
- **Latência P95** - `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`
- **Taxa de Erro %** - `(rate(http_errors_total[5m]) / rate(http_requests_total[5m])) * 100`
- **Uptime** - `process_uptime_seconds`
- **Memória** - `process_resident_memory_bytes / 1024 / 1024` (em MB)

## 🛑 Parando os Serviços

```bash
docker-compose down
```

Para remover volumes (banco de dados será deletado):
```bash
docker-compose down -v
```

## 🔍 Troubleshooting

### Prometheus não consegue scrape do backend
- Verifique se o backend está rodando em `http://localhost:3000`
- Confira em http://localhost:9090/targets se há erros
- No Windows/WSL, pode ser necessário usar `host.docker.internal` em vez de `localhost`

### Grafana não conecta ao Prometheus
- Acesse http://localhost:3001/connections/datasources
- Verifique se o Prometheus está em `http://prometheus:9090` (dentro do Docker)
- Clique em "Test" para validar a conexão

### Métricas não aparecem
- Faça algumas requisições para o backend
- Aguarde alguns segundos (interval de scrape é 15s por padrão)
- Acesse http://localhost:3000/api/metrics no navegador para validar se o endpoint está respondendo

## 📚 Referências

- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)
- [Grafana Documentation](https://grafana.com/docs/grafana/latest/)
- [prom-client Node.js Library](https://github.com/siimon/prom-client)
