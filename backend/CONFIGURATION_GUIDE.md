# Configuration Guide

## Overview

StayEase uses Spring Boot's **YAML configuration** for all settings. The credentials and sensitive data are stored in profile-specific YAML files that are **NOT committed to git**.

## File Structure

```
backend/src/main/resources/
├── application.yml              # Main config (committed to git)
├── application-dev.yml          # Dev credentials (NOT in git)
├── application-dev.yml.template # Template for dev setup (committed)
├── application-prod.yml         # Production credentials (NOT in git)
└── .env                         # Legacy file (NOT used by Spring Boot)
```

## How Spring Boot Loads Configuration

1. **`application.yml`** - Base configuration loaded first
2. **`application-{profile}.yml`** - Profile-specific config (overrides base)
3. **Environment Variables** - Can override any property using `${VAR_NAME:default}`

When you run with `spring.profiles.active=dev`, Spring Boot loads:

- `application.yml` (base)
- `application-dev.yml` (overrides with dev credentials)

## Setup Instructions

### First Time Setup

1. **Copy the template file:**

   ```bash
   cd backend/src/main/resources
   cp application-dev.yml.template application-dev.yml
   ```

2. **Fill in your credentials** in `application-dev.yml`:

   - Database password
   - Google OAuth Client ID and Secret
   - Facebook App ID and Secret
   - JWT secret (base64 encoded)

3. **Never commit** `application-dev.yml` to git (already in .gitignore)

### OAuth2 Credentials

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URI: `http://localhost:8080/oauth2/callback/google`
5. Copy Client ID and Secret to `application-dev.yml`

#### Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create an app
3. Add Facebook Login product
4. Add Valid OAuth Redirect URI: `http://localhost:8080/oauth2/callback/facebook`
5. Copy App ID and App Secret to `application-dev.yml`

## Configuration Hierarchy

Properties are resolved in this order (last wins):

1. `application.yml` defaults
2. `application-dev.yml` overrides
3. Environment variables (e.g., `export GOOGLE_CLIENT_ID=xxx`)
4. Command line arguments (e.g., `--server.port=9090`)

## Example: Using Environment Variables

Instead of storing credentials in YAML files, you can use environment variables:

```bash
# Windows PowerShell
$env:GOOGLE_CLIENT_ID="your-client-id"
$env:GOOGLE_CLIENT_SECRET="your-secret"
.\mvnw spring-boot:run

# Linux/Mac
export GOOGLE_CLIENT_ID="your-client-id"
export GOOGLE_CLIENT_SECRET="your-secret"
./mvnw spring-boot:run
```

The `application.yml` uses syntax like `${GOOGLE_CLIENT_ID:default-value}` to read from environment variables.

## Production Setup

For production, create `application-prod.yml` with production credentials, or better yet, use:

1. **Environment Variables** (recommended for Docker/Kubernetes)
2. **Cloud Config Services** (AWS Secrets Manager, Azure Key Vault)
3. **Spring Cloud Config Server**

Never hardcode production credentials in files!

## About .env File

The `.env` file in the backend root is **NOT automatically loaded by Spring Boot**. It was created for reference but Spring Boot doesn't use it by default.

If you want to use `.env` files, you need to:

1. Add `dotenv-java` dependency to `pom.xml`
2. Configure it to load on startup
3. Or use an IDE plugin that loads .env files

**Current approach:** We use `application-dev.yml` directly, which is the standard Spring Boot way.

## Security Best Practices

✅ **DO:**

- Use `application-dev.yml` for local development
- Add `application-dev.yml` to `.gitignore`
- Use environment variables for production
- Rotate secrets regularly
- Use different credentials for dev/staging/prod

❌ **DON'T:**

- Commit credentials to git
- Share production secrets in Slack/Email
- Use production credentials in development
- Hardcode secrets in source code

## Troubleshooting

**Problem:** OAuth2 not working, seeing "your-google-client-id-here"

**Solution:** Your credentials aren't loaded. Check:

1. Is `application-dev.yml` present? (not just the .template)
2. Are credentials filled in (not placeholders)?
3. Is profile set to `dev`? Check `spring.profiles.active=dev` in `application.yml`

**Problem:** Changes to `application-dev.yml` not taking effect

**Solution:**

1. Restart the Spring Boot application
2. Clear `target/` folder: `mvn clean`
3. Check for typos in property names (YAML is case-sensitive)

## Current Active Configuration

- **Profile:** `dev` (set in `application.yml`)
- **Database:** PostgreSQL at `localhost:5432/stayease_db`
- **Server Port:** `8080`
- **OAuth2:** Enabled with Google and Facebook
- **JWT:** HS512 with 24-hour expiration
- **Frontend Redirect:** `http://localhost:4200/oauth2/redirect`

## Verification

To verify your configuration is loaded correctly:

```bash
# Check what properties are active
curl http://localhost:8080/actuator/configprops

# Check OAuth2 client registrations
curl http://localhost:8080/actuator/health
```

Or look for this in startup logs:

```
OAuth2 Client ID: 457839599348-2bkji0phmcmjfo2h97riogcbth779bng.apps.googleusercontent.com
```

If you see the placeholder value, your credentials aren't loaded!
