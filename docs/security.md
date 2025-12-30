# Security Documentation

## Overview

This document outlines the security architecture, policies, and practices for the Medical Exam Platform.

## Current State (Phase 1: Skeleton)

### Authentication

**Status:** Temporary / Development Only

**Current Implementation:**
- Header-based authentication: `X-User-Id`
- No password verification
- No token validation
- Demo credentials hardcoded in frontend

**Security Level:** ⚠️ **NOT PRODUCTION READY**

**Risks:**
- Anyone can impersonate any user by setting header
- No session management
- No CSRF protection
- Credentials visible in client code

---

## Planned Security Architecture

### Authentication & Authorization

#### OAuth2 / OpenID Connect

**Implementation Plan:**
- Support multiple providers:
  - Google OAuth
  - Microsoft Azure AD
  - Custom OAuth provider
- JWT token-based authentication
- Refresh token mechanism
- Token expiration and rotation

**Flow:**
```
1. User clicks "Login with Google"
2. Redirect to OAuth provider
3. User authorizes
4. Provider redirects back with authorization code
5. Backend exchanges code for tokens
6. Backend issues JWT access token + refresh token
7. Frontend stores tokens securely
8. Subsequent requests include JWT in Authorization header
```

#### JWT Token Structure

```json
{
  "sub": "user-id",
  "role": "student",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234571490,
  "jti": "token-id"
}
```

**Token Storage:**
- Access token: In-memory (not localStorage)
- Refresh token: HttpOnly cookie (more secure)
- Consider using secure storage APIs

---

### Authorization

#### Role-Based Access Control (RBAC)

**Roles:**
- `student`: Can access student routes, practice sessions
- `admin`: Can access admin routes, question management
- `faculty`: (Future) Can review questions
- `super_admin`: (Future) Full system access

**Implementation:**
```python
# Backend middleware
def require_role(required_role: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            user = get_current_user()
            if user.role != required_role:
                raise HTTPException(403, "Insufficient permissions")
            return func(*args, **kwargs)
        return wrapper
    return decorator
```

**Frontend Route Protection:**
```typescript
// Middleware or layout component
if (user.role !== 'admin') {
  router.push('/unauthorized');
}
```

---

### Data Protection

#### Encryption

**At Rest:**
- Database encryption (PostgreSQL TDE)
- Encrypted backups
- Secure key management (AWS KMS, Azure Key Vault)

**In Transit:**
- HTTPS/TLS 1.3 mandatory
- Certificate pinning (mobile apps)
- HSTS headers

**Sensitive Data:**
- Passwords: bcrypt/Argon2 hashing
- PII: Encryption at application level
- API keys: Environment variables, secrets management

#### Password Security

**Requirements:**
- Minimum 8 characters
- Require uppercase, lowercase, number
- Optional: special character requirement
- Password strength meter
- Prevent common passwords

**Storage:**
```python
# Hashing with bcrypt
import bcrypt

password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
# Store: password_hash (never plaintext)

# Verification
is_valid = bcrypt.checkpw(password.encode(), stored_hash)
```

**Password Reset:**
- Secure token generation
- Time-limited tokens (15 minutes)
- Single-use tokens
- Email verification required

---

### API Security

#### Rate Limiting

**Implementation:**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/sessions")
@limiter.limit("10/minute")  # 10 requests per minute per IP
def create_session():
    ...
```

**Limits:**
- Login attempts: 5 per 15 minutes
- API calls: 100 per minute (authenticated)
- Question creation: 20 per hour (admin)
- Session creation: 10 per hour (student)

#### Input Validation

**Current:** Pydantic schemas validate request data

**Enhancements:**
- Sanitize user inputs
- SQL injection prevention (SQLAlchemy ORM handles this)
- XSS prevention (React escapes by default)
- CSRF tokens for state-changing operations

**Example:**
```python
from pydantic import BaseModel, validator

class QuestionCreate(BaseModel):
    question_text: str
    
    @validator('question_text')
    def sanitize_text(cls, v):
        # Remove potentially dangerous characters
        return v.strip()[:5000]  # Length limit
```

#### CORS Configuration

**Current:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
)
```

**Production:**
- Whitelist specific domains only
- No wildcard origins
- Credentials only for trusted origins
- Preflight request caching

---

### Session Management

#### Session Security

**Current:** No session management

**Planned:**
- Server-side session storage (Redis)
- Session timeout: 30 minutes inactivity
- Absolute timeout: 8 hours
- Secure session cookies:
  - HttpOnly flag
  - Secure flag (HTTPS only)
  - SameSite=Strict
  - Domain restriction

**Implementation:**
```python
# Session configuration
SESSION_COOKIE_NAME = "session_id"
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = True  # HTTPS only
SESSION_COOKIE_SAMESITE = "Strict"
SESSION_TIMEOUT = 1800  # 30 minutes
```

---

### Data Privacy

#### GDPR Compliance (Future)

**Requirements:**
- Right to access: Export user data
- Right to deletion: Delete user account and data
- Data portability: Machine-readable export
- Consent management: Track user consent

**Implementation:**
- User data export endpoint
- Account deletion with cascade
- Audit log for data access
- Privacy policy acceptance tracking

#### PII Handling

**Personal Identifiable Information:**
- Email addresses
- Phone numbers
- Names
- IP addresses (logs)

**Protection:**
- Encryption at rest
- Access logging
- Minimal data collection
- Anonymization for analytics

---

### Security Headers

#### HTTP Security Headers

**Required Headers:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

**Implementation:**
```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000"
    return response
```

---

### Vulnerability Management

#### Dependency Scanning

**Tools:**
- `npm audit` (frontend)
- `pip-audit` or `safety` (backend)
- Snyk integration
- GitHub Dependabot

**Process:**
1. Weekly automated scans
2. Critical vulnerabilities: Patch within 24 hours
3. High vulnerabilities: Patch within 7 days
4. Medium/Low: Patch in next release cycle

#### Penetration Testing

**Frequency:**
- Annual full penetration test
- Quarterly vulnerability assessments
- Continuous automated scanning

**Areas to Test:**
- Authentication bypass
- SQL injection
- XSS vulnerabilities
- CSRF attacks
- Session hijacking
- API abuse

---

### Audit & Logging

#### Security Event Logging

**Events to Log:**
- Login attempts (success/failure)
- Permission denied events
- Unusual API activity
- Data access (admin actions)
- Account changes
- Password resets

**Log Format:**
```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "event": "login_attempt",
  "user_id": "user-123",
  "ip_address": "192.168.1.1",
  "success": true,
  "user_agent": "Mozilla/5.0..."
}
```

**Retention:**
- Security logs: 1 year
- Access logs: 90 days
- Application logs: 30 days

#### Audit Trail

**Tracked Actions:**
- Question creation/modification/deletion
- User role changes
- System configuration changes
- Data exports

**Implementation:**
```python
class AuditLog(Base):
    id = Column(Integer, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    action = Column(String)  # "question_created", "user_updated"
    resource_type = Column(String)  # "question", "user"
    resource_id = Column(String)
    changes = Column(JSON)  # Before/after state
    ip_address = Column(String)
    timestamp = Column(DateTime, default=func.now())
```

---

### Incident Response

#### Security Incident Procedure

1. **Detection**
   - Automated alerts
   - Manual reporting
   - Security monitoring

2. **Containment**
   - Isolate affected systems
   - Revoke compromised credentials
   - Block malicious IPs

3. **Investigation**
   - Log analysis
   - Timeline reconstruction
   - Impact assessment

4. **Remediation**
   - Patch vulnerabilities
   - Reset compromised accounts
   - Restore from backups if needed

5. **Post-Incident**
   - Root cause analysis
   - Process improvements
   - Documentation update

#### Contact Information

**Security Team:**
- Email: security@examprep.com
- Emergency: [To be defined]

**Reporting:**
- Security vulnerabilities: security@examprep.com
- Bug reports: support@examprep.com

---

### Compliance

#### Standards & Regulations

**Target Compliance:**
- GDPR (EU data protection)
- HIPAA (if handling medical records)
- SOC 2 Type II (enterprise customers)
- ISO 27001 (information security)

#### Security Certifications (Future)

- Regular security audits
- Third-party security assessments
- Compliance certifications
- Penetration test reports

---

## Security Checklist

### Development

- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (ORM usage)
- [ ] XSS prevention (React escaping)
- [ ] CSRF protection
- [ ] Rate limiting implemented
- [ ] Security headers configured
- [ ] Error messages don't leak sensitive info

### Deployment

- [ ] HTTPS enforced
- [ ] Secrets in environment variables
- [ ] Database credentials secured
- [ ] API keys not in code
- [ ] Security headers enabled
- [ ] CORS properly configured
- [ ] Firewall rules configured

### Monitoring

- [ ] Security event logging
- [ ] Failed login attempt tracking
- [ ] Unusual activity alerts
- [ ] Regular security scans
- [ ] Dependency updates automated

---

## Security Roadmap

### Phase 1 (Current)
- ⚠️ Temporary authentication (development only)
- ✅ Input validation (Pydantic)
- ✅ CORS configuration
- ⏳ Basic rate limiting (planned)

### Phase 2 (Next)
- ⏳ OAuth2/JWT authentication
- ⏳ Role-based access control
- ⏳ Session management
- ⏳ Password hashing
- ⏳ Security headers

### Phase 3 (Future)
- ⏳ Advanced rate limiting
- ⏳ Audit logging
- ⏳ Encryption at rest
- ⏳ Vulnerability scanning
- ⏳ Penetration testing

### Phase 4 (Advanced)
- ⏳ GDPR compliance
- ⏳ SOC 2 certification
- ⏳ Advanced threat detection
- ⏳ Security monitoring dashboard

