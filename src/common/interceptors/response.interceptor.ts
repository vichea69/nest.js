import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type AnyObject = Record<string, any>;

const API_VERSION = 'v1';
const ACCESS_TOKEN_EXPIRES_IN = 900; // 15 minutes
const REFRESH_TOKEN_EXPIRES_IN = 604800; // 7 days

function redactPasswords(input: any): any {
  if (Array.isArray(input)) return input.map(redactPasswords);
  if (input && typeof input === 'object') {
    const clone: AnyObject = {};
    for (const [k, v] of Object.entries(input)) {
      if (k.toLowerCase() === 'password') continue;
      clone[k] = redactPasswords(v);
    }
    return clone;
  }
  return input;
}

function defaultMessage(path: string, method: string, data: any): string {
  const p = path.toLowerCase();
  if (p.includes('/login')) return 'Authenticated successfully';
  if (p.includes('/register')) return 'Registered successfully';
  if (p.includes('/logout')) return 'Logged out successfully';
  if (method === 'GET') return 'OK';
  if (method === 'POST') return 'Created successfully';
  if (method === 'PUT' || method === 'PATCH') return 'Updated successfully';
  if (method === 'DELETE') return 'Deleted successfully';
  return 'OK';
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, AnyObject> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<AnyObject> {
    const req = context.switchToHttp().getRequest();
    const path = (req?.originalUrl || req?.url || '').toString();
    const method = (req?.method || 'GET').toString();

    return next.handle().pipe(
      map((payload: any) => {
        // If response already follows the shape, pass through
        if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
          return payload as AnyObject;
        }

        // Sanitize sensitive fields
        let data: any = redactPasswords(payload);

        // Normalize common auth payloads: { user: {..., token} } => { user, tokens }
        let meta: AnyObject | undefined;
        if (data && typeof data === 'object' && 'user' in data) {
          const user = (data as AnyObject).user ?? {};
          const { token, password, ...restUser } = user || {};

          const tokens: AnyObject | undefined = token
            ? { accessToken: token }
            : undefined;

          if (tokens) {
            meta = {
              accessTokenExpiresIn: ACCESS_TOKEN_EXPIRES_IN,
              refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRES_IN,
            };
          }

          data = {
            user: redactPasswords(restUser),
            ...(tokens ? { tokens } : {}),
          };
        }

        const response: AnyObject = {
          success: true,
          message: defaultMessage(path, method, data),
          data,
          ...(meta ? { meta } : {}),
          timestamp: new Date().toISOString(),
          version: API_VERSION,
        };

        return response;
      }),
    );
  }
}
