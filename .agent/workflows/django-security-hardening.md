---
description: Django security hardening for production LMS deployment
---

# Django Security Hardening

Essential security configuration for the LMS Django backend before production deployment.

## 1. Environment Variables

Create `.env` file (never commit to git):

```bash
# Security
SECRET_KEY=your-secret-key-here-64-chars-minimum
DEBUG=0
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lms_db

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Generate secure SECRET_KEY:**
```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

---

## 2. Update `settings.py`

### Security Headers

```python
# Security settings
SECURE_SSL_REDIRECT = True  # Force HTTPS
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'
SECURE_CONTENT_TYPE_NOSNIFF = True

# Referrer policy
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
```

### CORS Configuration

```python
# Update existing CORS settings
CORS_ALLOW_ALL_ORIGINS = False  # Change from True
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS',
    'https://yourdomain.com,https://www.yourdomain.com'
).split(',')
```

### Rate Limiting (DRF)

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day'
    }
}
```

---

## 3. Install Security Middleware

```bash
pip install django-csp django-ratelimit
```

### Content Security Policy

Add to `INSTALLED_APPS`:
```python
INSTALLED_APPS = [
    # ...
    'csp',
]
```

Add to `MIDDLEWARE`:
```python
MIDDLEWARE = [
    # ... existing middleware
    'csp.middleware.CSPMiddleware',
]
```

Configure CSP:
```python
CSP_DEFAULT_SRC = ("'self'",)
CSP_SCRIPT_SRC = ("'self'", "'unsafe-inline'")  # Adjust as needed
CSP_STYLE_SRC = ("'self'", "'unsafe-inline'")
CSP_IMG_SRC = ("'self'", "data:", "https:")
CSP_FONT_SRC = ("'self'", "data:")
CSP_CONNECT_SRC = ("'self'",)
CSP_FRAME_ANCESTORS = ("'none'",)
CSP_BASE_URI = ("'self'",)
CSP_FORM_ACTION = ("'self'",)
```

---

## 4. Database Security

### Use PostgreSQL in Production

Never use SQLite in production. Update `settings.py`:

```python
import dj_database_url

DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        conn_max_age=600,
        conn_health_checks=True,
        ssl_require=True  # Require SSL for database connections
    )
}
```

### Password Validators

Ensure strong password requirements:

```python
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 12,  # Increase from default 8
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]
```

---

## 5. JWT Token Security

```python
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),  # Shorter for security
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

Install token blacklist:
```bash
pip install djangorestframework-simplejwt[blacklist]
```

Add to `INSTALLED_APPS`:
```python
INSTALLED_APPS = [
    # ...
    'rest_framework_simplejwt.token_blacklist',
]
```

Run migrations:
```bash
python manage.py migrate
```

---

## 6. Logging for Security

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': '/var/log/lms/security.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django.security': {
            'handlers': ['file', 'console'],
            'level': 'WARNING',
            'propagate': False,
        },
        'apps': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
        },
    },
}
```

---

## 7. Static Files Security

```python
# Static files (production)
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATIC_URL = '/static/'

MEDIA_ROOT = BASE_DIR / 'media'
MEDIA_URL = '/media/'

# Use whitenoise for serving static files
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add this
    # ... rest of middleware
]

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

Install whitenoise:
```bash
pip install whitenoise
```

---

## 8. Admin Security

### Change admin URL

```python
# urls.py
from django.contrib import admin

admin.site.site_header = "LMS Administration"
admin.site.site_title = "LMS Admin"

urlpatterns = [
    path('secret-admin-path/', admin.site.urls),  # Change from 'admin/'
    # ...
]
```

### Require 2FA for admins (optional)

```bash
pip install django-otp qrcode
```

---

## 9. Requirements Update

Add to `requirements.txt`:

```
django-csp==3.8
django-ratelimit==4.1.0
whitenoise==6.6.0
djangorestframework-simplejwt[blacklist]==5.3.1
```

---

## 10. Security Checklist

Before deployment, verify:

- [ ] `DEBUG = False` in production
- [ ] `SECRET_KEY` is strong and environment-specific
- [ ] `ALLOWED_HOSTS` is properly configured
- [ ] HTTPS is enforced (`SECURE_SSL_REDIRECT = True`)
- [ ] CORS is restricted to your domain
- [ ] Rate limiting is enabled
- [ ] CSP headers are configured
- [ ] PostgreSQL is used (not SQLite)
- [ ] JWT tokens have short lifetimes
- [ ] Admin URL is changed from `/admin/`
- [ ] Static files are served via whitenoise
- [ ] Security logging is configured
- [ ] Database connections use SSL
- [ ] Password validators are strengthened

---

## Pro Tips

1. **Run security checks regularly:**
   ```bash
   python manage.py check --deploy
   ```

2. **Audit dependencies:**
   ```bash
   pip install safety
   safety check
   ```

3. **Use environment-specific settings files:**
   - `settings/base.py` - Shared settings
   - `settings/dev.py` - Development
   - `settings/prod.py` - Production

4. **Monitor failed login attempts** and implement account lockout

5. **Regular security updates:**
   ```bash
   pip list --outdated
   ```
