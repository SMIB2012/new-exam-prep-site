# Observability Documentation

## Overview

This document describes the observability strategy, monitoring, logging, and tracing for the Medical Exam Platform.

## Current State (Phase 1: Skeleton)

### Logging

**Status:** Basic console logging

**Current Implementation:**
- Python `print()` statements in backend
- Console logs in frontend
- No structured logging
- No log aggregation

**Limitations:**
- No centralized logging
- No log levels
- No log retention
- Difficult to debug production issues

---

## Planned Observability Architecture

### Three Pillars of Observability

1. **Metrics** - Quantitative measurements
2. **Logs** - Event records
3. **Traces** - Request flow tracking

---

## Metrics

### Application Metrics

#### Key Performance Indicators (KPIs)

**User Metrics:**
- Active users (daily/weekly/monthly)
- New user registrations
- User retention rate
- Session completion rate

**Performance Metrics:**
- API response times (p50, p95, p99)
- Request rate (requests/second)
- Error rate (errors/total requests)
- Database query performance

**Business Metrics:**
- Questions answered per day
- Average session duration
- Average score per session
- Questions created per day (admin)

#### Implementation Plan

**Backend (Prometheus):**
```python
from prometheus_client import Counter, Histogram, Gauge

# Counters
api_requests_total = Counter(
    'api_requests_total',
    'Total API requests',
    ['method', 'endpoint', 'status']
)

# Histograms
api_request_duration = Histogram(
    'api_request_duration_seconds',
    'API request duration',
    ['method', 'endpoint']
)

# Gauges
active_sessions = Gauge(
    'active_sessions',
    'Number of active sessions'
)
```

**Frontend (Web Vitals):**
- Core Web Vitals tracking
- Page load times
- Time to Interactive (TTI)
- First Contentful Paint (FCP)

---

### Infrastructure Metrics

**Server Metrics:**
- CPU usage
- Memory usage
- Disk I/O
- Network I/O

**Database Metrics:**
- Connection pool usage
- Query execution time
- Slow query count
- Database size

**Container Metrics:**
- Container CPU/Memory
- Restart count
- Health check status

---

## Logging

### Structured Logging

#### Log Levels

- **DEBUG**: Detailed information for debugging
- **INFO**: General informational messages
- **WARNING**: Warning messages (non-critical)
- **ERROR**: Error messages (handled exceptions)
- **CRITICAL**: Critical errors (system failures)

#### Log Format

**Structured JSON Logs:**
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "INFO",
  "service": "backend",
  "module": "main",
  "function": "create_session",
  "user_id": "student-1",
  "session_id": 123,
  "message": "Session created successfully",
  "duration_ms": 45,
  "request_id": "req-abc123"
}
```

#### Implementation

**Backend (Python):**
```python
import logging
import json
from pythonjsonlogger import jsonlogger

# Configure structured logging
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)

logger = logging.getLogger()
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)

# Usage
logger.info("Session created", extra={
    "user_id": user_id,
    "session_id": session.id,
    "duration_ms": duration
})
```

**Frontend (Browser):**
```typescript
// Structured logging utility
export const log = {
  info: (message: string, data?: object) => {
    console.log(JSON.stringify({
      level: 'INFO',
      message,
      timestamp: new Date().toISOString(),
      ...data
    }));
  },
  error: (message: string, error: Error, data?: object) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      message,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...data
    }));
  }
};
```

---

### Log Aggregation

#### Centralized Logging (Future)

**Options:**
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Loki + Grafana** (lightweight, Prometheus integration)
- **CloudWatch** (AWS)
- **Azure Monitor** (Azure)
- **Datadog** (SaaS)

**Architecture:**
```
Application → Log Shipper (Fluentd/Fluent Bit) → Log Aggregator → Storage
                                                      ↓
                                                 Visualization (Kibana/Grafana)
```

---

## Distributed Tracing

### OpenTelemetry Integration

**Purpose:** Track requests across services

**Implementation Plan:**
```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

# Setup
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

# Usage
with tracer.start_as_current_span("create_session") as span:
    span.set_attribute("user_id", user_id)
    span.set_attribute("question_count", question_count)
    # ... business logic
```

**Trace Visualization:**
- Jaeger (open source)
- Zipkin (open source)
- AWS X-Ray (AWS)
- Datadog APM (SaaS)

---

## Monitoring Dashboards

### Grafana Dashboards

#### Application Dashboard

**Panels:**
1. Request rate (requests/sec)
2. Response time (p50, p95, p99)
3. Error rate (%)
4. Active sessions
5. Database query time
6. API endpoint breakdown

#### Infrastructure Dashboard

**Panels:**
1. CPU usage (per service)
2. Memory usage (per service)
3. Network I/O
4. Disk I/O
5. Container health
6. Database connections

#### Business Dashboard

**Panels:**
1. Daily active users
2. Questions answered
3. Sessions completed
4. Average scores
5. Question creation rate
6. User growth

---

## Alerting

### Alert Rules

#### Critical Alerts (Immediate Response)

**Conditions:**
- Error rate > 5% for 5 minutes
- API response time p95 > 2 seconds for 10 minutes
- Database connection pool exhausted
- Service down (health check failing)

**Channels:**
- PagerDuty / Opsgenie
- Slack #alerts channel
- Email to on-call engineer

#### Warning Alerts (Investigate)

**Conditions:**
- Error rate > 1% for 15 minutes
- API response time p95 > 1 second for 30 minutes
- High memory usage (>80%)
- Slow database queries

**Channels:**
- Slack notification
- Email digest

---

### Alert Configuration

**Prometheus Alertmanager:**
```yaml
groups:
  - name: application_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(api_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }}%"
      
      - alert: SlowAPIResponse
        expr: histogram_quantile(0.95, api_request_duration_seconds) > 2
        for: 10m
        annotations:
          summary: "API response time is slow"
          description: "p95 response time is {{ $value }}s"
```

---

## Health Checks

### Application Health

**Endpoint:** `GET /health`

**Checks:**
- Database connectivity
- Redis connectivity (if used)
- External API availability
- Disk space
- Memory usage

**Response:**
```json
{
  "status": "healthy",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "disk": "ok"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Implementation:**
```python
@app.get("/health")
async def health_check():
    checks = {
        "database": check_database(),
        "redis": check_redis(),
    }
    status = "healthy" if all(checks.values()) else "unhealthy"
    return {"status": status, "checks": checks}
```

### Readiness Probe

**Endpoint:** `GET /ready`

**Purpose:** Check if service is ready to accept traffic

**Checks:**
- Database connection
- Required services available
- Not in maintenance mode

### Liveness Probe

**Endpoint:** `GET /live`

**Purpose:** Check if service is alive (not crashed)

**Checks:**
- Process is running
- No deadlock detected

---

## Error Tracking

### Sentry Integration (Planned)

**Purpose:** Capture and track application errors

**Implementation:**
```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="https://...@sentry.io/...",
    integrations=[FastApiIntegration()],
    traces_sample_rate=0.1,
    environment="production"
)
```

**Features:**
- Automatic error capture
- Stack traces
- User context
- Release tracking
- Performance monitoring

---

## Performance Monitoring

### Application Performance Monitoring (APM)

#### Key Metrics

**Backend:**
- Request duration
- Database query time
- External API call duration
- Memory usage per request
- CPU usage

**Frontend:**
- Page load time
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)

#### Real User Monitoring (RUM)

**Browser Metrics:**
- Navigation timing API
- Resource timing API
- Web Vitals API
- Custom performance marks

**Implementation:**
```typescript
// Track page load
performance.mark('page-start');
window.addEventListener('load', () => {
  performance.mark('page-end');
  performance.measure('page-load', 'page-start', 'page-end');
  const measure = performance.getEntriesByName('page-load')[0];
  // Send to analytics
});
```

---

## Log Retention & Archival

### Retention Policy

**Log Types:**
- Application logs: 30 days
- Access logs: 90 days
- Security logs: 1 year
- Audit logs: 7 years (compliance)

**Archival:**
- Move old logs to cold storage (S3, Azure Blob)
- Compress before archival
- Index for searchability

---

## Observability Tools

### Current Stack (Planned)

| Component | Tool | Purpose |
|-----------|------|---------|
| Metrics | Prometheus | Metrics collection |
| Visualization | Grafana | Dashboards |
| Logging | Loki | Log aggregation |
| Tracing | Jaeger | Distributed tracing |
| Error Tracking | Sentry | Error monitoring |
| APM | OpenTelemetry | Performance monitoring |

### Cloud Alternatives

**AWS:**
- CloudWatch (metrics, logs)
- X-Ray (tracing)
- CloudWatch Insights (log analysis)

**Azure:**
- Azure Monitor (metrics, logs)
- Application Insights (APM)
- Log Analytics

**GCP:**
- Cloud Monitoring (metrics)
- Cloud Logging
- Cloud Trace

---

## Implementation Roadmap

### Phase 1 (Current)
- ⚠️ Basic console logging
- ⏳ Health check endpoint

### Phase 2 (Next)
- ⏳ Structured logging
- ⏳ Prometheus metrics
- ⏳ Basic Grafana dashboard
- ⏳ Health checks

### Phase 3 (Future)
- ⏳ Log aggregation (Loki)
- ⏳ Distributed tracing (Jaeger)
- ⏳ Error tracking (Sentry)
- ⏳ Advanced dashboards

### Phase 4 (Advanced)
- ⏳ APM integration
- ⏳ Real User Monitoring
- ⏳ Automated alerting
- ⏳ Anomaly detection

---

## Best Practices

### Logging

1. **Use appropriate log levels**
   - DEBUG: Development only
   - INFO: Important business events
   - WARNING: Recoverable issues
   - ERROR: Handled exceptions
   - CRITICAL: System failures

2. **Include context**
   - User ID
   - Request ID
   - Timestamp
   - Relevant parameters

3. **Avoid sensitive data**
   - No passwords in logs
   - No full credit card numbers
   - Hash PII when necessary

4. **Structured format**
   - Use JSON for machine parsing
   - Consistent field names
   - Include correlation IDs

### Metrics

1. **Cardinality control**
   - Limit label combinations
   - Use histograms for distributions
   - Aggregate when possible

2. **Naming conventions**
   - `service_metric_unit`
   - Example: `api_request_duration_seconds`
   - Consistent prefixes

3. **Sampling**
   - Sample high-volume metrics
   - Full sampling for critical metrics
   - Adaptive sampling based on load

### Tracing

1. **Span naming**
   - Use operation names: `create_session`, `get_questions`
   - Include service name
   - Consistent naming

2. **Span attributes**
   - Include relevant context
   - User ID, request ID
   - Business identifiers

3. **Sampling**
   - Sample 1-10% of requests
   - Always sample errors
   - Adjust based on volume

---

## Cost Considerations

### Logging Costs

**Factors:**
- Log volume (bytes/day)
- Retention period
- Query frequency
- Storage type (hot vs cold)

**Optimization:**
- Reduce log verbosity in production
- Use log levels effectively
- Archive old logs to cold storage
- Compress logs

### Metrics Costs

**Factors:**
- Number of metrics
- Cardinality (label combinations)
- Retention period
- Query frequency

**Optimization:**
- Limit metric cardinality
- Use recording rules for aggregations
- Downsample old metrics
- Delete unused metrics

---

## Compliance & Privacy

### Log Data Privacy

**PII in Logs:**
- Minimize PII in logs
- Hash or redact sensitive data
- User consent for logging
- GDPR right to deletion

**Audit Requirements:**
- Security event logging
- Access logging
- Change tracking
- Compliance reporting

---

## Troubleshooting Guide

### Common Issues

**High Error Rate:**
1. Check error logs for patterns
2. Review recent deployments
3. Check database connectivity
4. Verify external dependencies

**Slow Response Times:**
1. Check database query performance
2. Review slow query logs
3. Check resource utilization (CPU/Memory)
4. Review trace data for bottlenecks

**Service Unavailable:**
1. Check health endpoint
2. Review container logs
3. Check resource limits
4. Verify network connectivity

---

## References

- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Grafana Dashboards](https://grafana.com/docs/grafana/latest/dashboards/)
- [The Three Pillars of Observability](https://www.oreilly.com/library/view/distributed-systems-observability/9781492033431/)

