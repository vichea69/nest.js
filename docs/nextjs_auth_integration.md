# Next.js Auth Integration Guide (with this NestJS API)

This guide shows how to connect a Next.js app to this NestJS backend using the standard auth response structure defined in `auth_api_response_standard.md`.

It covers both the App Router (Next 13+) and the Pages Router.

---

## Overview

- Base URL: `http://localhost:3000/api/v1`
- Endpoints:
  - `POST /login` — log in, sets `access_token` and `refresh_token` httpOnly cookies and returns standard JSON
  - `POST /register` — create account, returns standard JSON
  - `GET /user` — current user (requires auth cookie or Bearer token)
  - `POST /logout` — clears `access_token` cookie

On success, responses follow:

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

On errors:

```json
{
  "success": false,
  "message": "Invalid email or password",
  "error": { "code": "AUTH_INVALID_CREDENTIALS", "details": "..." },
  "timestamp": "...",
  "version": "v1"
}
```

---

## Prerequisites

Backend (NestJS):

- Ensure `.env` contains

```env
PORT=3000
JWT_SECRET=replace_me
FRONTEND_URL=http://localhost:3001
```

- CORS is configured in `src/main.ts` to allow the `FRONTEND_URL` with credentials.

Frontend (Next.js):

- Create `.env.local` in your Next.js project:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

---

## Fetch Helper (Shared)

Create a small helper to call the API and parse the standard response.

```ts
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
  meta?: Record<string, any>;
  timestamp: string;
  version: string;
};

export type ApiError = {
  success: false;
  message: string | string[];
  error?: { code?: string; details?: any };
  timestamp: string;
  version: string;
};

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiSuccess<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    // Required so browser sends/receives httpOnly cookie set by backend
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });

  const json = await res.json();
  if (!json.success) {
    throw json as ApiError;
  }
  return json as ApiSuccess<T>;
}
```

---

## Login (Client Component)

When logging in from the browser, the Nest API sets an `httpOnly` `access_token` cookie. You don’t need to store the token on the client; just keep `credentials: 'include'` in future requests.

```tsx
// app/login/page.tsx (App Router) or pages/login.tsx (Pages Router)
'use client';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';

type LoginRes = { user: any; tokens?: { accessToken: string } };

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await apiFetch<LoginRes>('/login', {
        method: 'POST',
        body: JSON.stringify({ user: { email, password } }),
      });
      // Optionally read res.data.tokens.accessToken if you need it for non-cookie flows
      window.location.href = '/';
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
```

---

## Get Current User

App Router (Server Component/Route Handler): forward cookies to the API when rendering on the server.

```ts
// app/(protected)/layout.tsx
import { headers } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

async function getCurrentUser() {
  const cookieHeader = headers().get('cookie') || '';
  const res = await fetch(`${API_URL}/user`, {
    headers: { Cookie: cookieHeader },
    // Avoid caching user state
    cache: 'no-store',
  });
  const json = await res.json();
  return json;
}

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const me = await getCurrentUser();
  if (!me.success) {
    // Optionally inspect me.error.code for redirects
    return <div>Not authenticated</div>;
  }
  return <>{children}</>;
}
```

Pages Router (SSR):

```ts
// pages/profile.tsx
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;
  const cookie = ctx.req.headers.cookie || '';
  const res = await fetch(`${API_URL}/user`, {
    headers: { Cookie: cookie },
  });
  const json = await res.json();
  if (!json.success) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  return { props: { user: json.data.user } };
};

export default function Profile({ user }: any) {
  return <pre>{JSON.stringify(user, null, 2)}</pre>;
}
```

---

## Logout

```ts
// app/api/logout/route.ts (proxy) or call directly from client
import { NextResponse } from 'next/server';

export async function POST() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;
  await fetch(`${API_URL}/logout`, { method: 'POST', credentials: 'include' });
  return NextResponse.json({ ok: true });
}
```

Client call:

```ts
await fetch('/api/logout', { method: 'POST' }); // or call API_URL/logout directly
```

---

## Error Handling

The backend returns `success: false` with `error.code` and `message`.

```ts
try {
  const res = await apiFetch('/login', { method: 'POST', body: JSON.stringify({ user: { email, password } }) });
} catch (e: any) {
  if (e?.error?.code === 'AUTH_INVALID_CREDENTIALS') {
    // show specific UI
  }
}
```

---

## Axios Alternative

```ts
// lib/axios.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // important for httpOnly cookie
});

export async function login(email: string, password: string) {
  const { data } = await api.post('/login', { user: { email, password } });
  if (!data.success) throw data;
  return data;
}
```

---

## Role-based UI Gating (Client) and Server Protection

Server protection is enforced by NestJS via guards; your UI can also hide/show features based on the current user’s role.

```tsx
// Example: only show admin panel if role === 'admin'
const { user } = me.data; // response from /user
return user.role === 'admin' ? <AdminPanel /> : <p>Insufficient permissions</p>;
```

For hard protection, prefer server-side checks (SSR/App Router server components) and redirect if not allowed.

---

## Notes

- The backend sets `access_token` (15m) and `refresh_token` (7d) httpOnly cookies on login. Keep `credentials: 'include'` for browser requests and forward the `Cookie` header for SSR.
- The standard response includes `data.tokens.accessToken` and `data.tokens.refreshToken` for non-browser clients. For web apps, avoid storing tokens in localStorage; rely on httpOnly cookies.
