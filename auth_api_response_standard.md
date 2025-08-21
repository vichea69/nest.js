# Auth API Response Standard (for Codex CLI & Dev Workflow)

_Last updated: 2025-08-21T07:43:12Z_

This file documents the **professional JSON response format** for authentication APIs, so you can integrate seamlessly
with **Codex CLI** or any developer tooling.

---

## ✅ Success Response (Login / Signup)

```json
{
  "success": true,
  "message": "Authenticated successfully",
  "data": {
    "user": {
      "id": 5,
      "username": "Admin",
      "email": "admin@gmail.com",
      "role": "admin",
      "bio": "Admin",
      "image": "https://res.cloudinary.com/.../photo.jpg"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  },
  "meta": {
    "accessTokenExpiresIn": 900,
    "refreshTokenExpiresIn": 604800
  },
  "timestamp": "2025-08-21T14:22:00Z",
  "version": "v1"
}
```

---

## ❌ Error Response (Invalid Credentials)

```json
{
  "success": false,
  "message": "Invalid email or password",
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "details": "The provided credentials are incorrect."
  },
  "timestamp": "2025-08-21T14:22:00Z",
  "version": "v1"
}
```

---

## 🔄 Refresh Token Response

```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "meta": {
    "accessTokenExpiresIn": 900,
    "refreshTokenExpiresIn": 604800
  },
  "timestamp": "2025-08-21T14:22:00Z",
  "version": "v1"
}
```

---

## 📌 Best Practices

- ❌ **Never include `password`** in any response (even hashed).
- ✅ Place tokens in a **separate `tokens` object**, not inside `user`.
- ✅ Use **httpOnly cookies** for refresh tokens in web apps.
- ✅ Include `meta` with expiry values for client-side token management.
- ✅ Add `timestamp` and `version` for consistency and debugging.
- ✅ Use machine-readable `error.code` values for reliable frontend handling.

---

## 📊 Error Codes Reference

- `AUTH_INVALID_CREDENTIALS`
- `AUTH_TOKEN_EXPIRED`
- `AUTH_TOKEN_REVOKED`
- `AUTH_RATE_LIMITED`
- `AUTH_VALIDATION_FAILED`

---



This JSON contract keeps your **backend, frontend, and CLI tools** in perfect sync.
