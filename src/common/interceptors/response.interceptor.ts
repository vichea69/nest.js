import {CallHandler, ExecutionContext, Injectable, NestInterceptor} from '@nestjs/common';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

type AnyObject = Record<string, any>;

const API_VERSION = 'v1';
const ACCESS_TOKEN_EXPIRES_IN = 900; // 15 minutes
const REFRESH_TOKEN_EXPIRES_IN = 604800; // 7 days

function redactPasswords(input: any): any {
    // Format Date objects as YYYY-MM-DD (UTC)
    if (input instanceof Date) return input.toISOString().slice(0, 10);
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
                // If response already follows the shape, still normalize the data
                if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
                    const shaped = payload as AnyObject;
                    return {
                        ...shaped,
                        data: redactPasswords(shaped.data),
                    } as AnyObject;
                }

                // Allow passthrough for paginated list shape: { page, pageSize, total, data }
                if (
                    payload &&
                    typeof payload === 'object' &&
                    'page' in payload &&
                    'pageSize' in payload &&
                    'total' in payload &&
                    'data' in payload
                ) {
                    const shaped = payload as AnyObject;
                    return {
                        page: shaped.page,
                        pageSize: shaped.pageSize,
                        total: shaped.total,
                        data: redactPasswords(shaped.data),
                    } as AnyObject;
                }

                // Allow passthrough for a single page object shape
                if (
                    payload &&
                    typeof payload === 'object' &&
                    'id' in payload &&
                    'title' in payload &&
                    'slug' in payload &&
                    'status' in payload &&
                    'content' in payload &&
                    'seo' in payload
                ) {
                    return redactPasswords(payload);
                }

                // Sanitize sensitive fields
                let data: any = redactPasswords(payload);

                // Normalize common auth payloads: { user: {..., token} } => { user, tokens }
                let meta: AnyObject | undefined;
                if (data && typeof data === 'object' && 'user' in data) {
                    const user = (data as AnyObject).user ?? {};
                    const {token, refreshToken, password, ...restUser} = user || {};

                    const tokens: AnyObject | undefined =
                        token || refreshToken
                            ? {
                                ...(token ? {accessToken: token} : {}),
                                ...(refreshToken ? {refreshToken} : {}),
                            }
                            : undefined;

                    if (tokens) {
                        meta = {
                            accessTokenExpiresIn: ACCESS_TOKEN_EXPIRES_IN,
                            refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRES_IN,
                        };
                    }

                    data = {
                        user: redactPasswords(restUser),
                        ...(tokens ? {tokens} : {}),
                    };
                }

                const response: AnyObject = {
                    success: true,
                    message: defaultMessage(path, method, data),
                    data,
                    ...(meta ? {meta} : {}),
                    timestamp: new Date().toISOString(),
                    version: API_VERSION,
                };

                return response;
            }),
        );
    }
}
