# Postman Auth Testing Guide

This guide shows how to test the NestJS auth endpoints in Postman using the standardized responses in `auth_api_response_standard.md`.

---

## Setup

- Base URL: `http://localhost:3000/api/v1`
- Ensure the API is running and `.env` contains:
  - `PORT=3000`
  - `JWT_SECRET=replace_me`
  - Optionally `JWT_REFRESH_SECRET=replace_me`
- In Postman, create a Collection and add a variable:
  - Key: `BASE_URL`
  - Initial/Current Value: `http://localhost:3000/api/v1`

---

## 1) Login

- Request: `POST {{BASE_URL}}/login`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
  ```json
  {
    "user": {
      "email": "you@example.com",
      "password": "yourpass"
    }
  }
  ```
- Expected response (shape):
  ```json
  {
    "success": true,
    "message": "Authenticated successfully",
    "data": {
      "user": { "id": 1, "username": "...", "email": "...", "role": "user" },
      "tokens": { "accessToken": "...", "refreshToken": "..." }
    },
    "meta": { "accessTokenExpiresIn": 900, "refreshTokenExpiresIn": 604800 },
    "timestamp": "...",
    "version": "v1"
  }
  ```
- Cookies: Postman will receive two httpOnly cookies from the same origin:
  - `access_token` (15 minutes)
  - `refresh_token` (7 days)
  Open the Cookies viewer in Postman (top-right “Cookies”) and verify both are present for `localhost`.

Optional: Save tokens to Postman variables (Tests tab):
```js
const j = pm.response.json();
pm.test('login success', () => {
  pm.expect(j.success).to.be.true;
  pm.expect(j.data.tokens.accessToken).to.be.a('string');
  pm.expect(j.data.tokens.refreshToken).to.be.a('string');
});
pm.collectionVariables.set('ACCESS_TOKEN', j.data.tokens.accessToken);
pm.collectionVariables.set('REFRESH_TOKEN', j.data.tokens.refreshToken);
```

---

## 2) Get Current User (Cookie flow)

- Request: `GET {{BASE_URL}}/user`
- No Authorization header needed. Postman automatically includes cookies for the same host/port.
- Expected: `success: true` and `data.user` with your profile.

---

## 3) Get Current User (Bearer token flow)

- Request: `GET {{BASE_URL}}/user`
- Authorization tab: Type = Bearer Token; Token = `{{ACCESS_TOKEN}}`
- Expected: same as cookie flow.

---

## 4) Logout

- Request: `POST {{BASE_URL}}/logout`
- Expected: clears `access_token` cookie. Verify in Postman Cookies viewer.
- Note: `refresh_token` remains until you implement a refresh/rotate route or also clear it on logout.

---

## Troubleshooting

- 401/Unauthorized: Ensure you used the same origin (`http://localhost:3000`) so cookies are sent. For Bearer flow, verify `{{ACCESS_TOKEN}}` is set.
- CORS: Postman isn’t subject to browser CORS, so any CORS errors are unrelated to Postman.
- Expired tokens: If `access_token` expired, log in again (or add a refresh endpoint—see below).
- Env mismatch: Confirm `JWT_SECRET` (and `JWT_REFRESH_SECRET` if set) matches what the server expects.

---

## Optional: Refresh Flow (to add later)

A `/refresh` endpoint isn’t included yet. Typical behavior:
- `POST {{BASE_URL}}/refresh` reads `refresh_token` httpOnly cookie.
- Verifies and rotates refresh token, sets new cookies, and returns new `data.tokens`.

If you want this implemented, ask to add a `/refresh` route with cookie rotation and blacklisting support.

---

## References

- Standard response contract: `auth_api_response_standard.md`
- Next.js integration: `docs/nextjs_auth_integration.md`

