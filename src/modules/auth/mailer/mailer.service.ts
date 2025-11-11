import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly resendApiKey = process.env.RESEND_API_KEY;
  private readonly frontendBaseUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  private readonly fromAddress = process.env.RESEND_FROM_EMAIL ?? 'no-reply@localhost.dev';

  async sendPasswordResetEmail(recipient: string, token: string): Promise<void> {
    if (!this.resendApiKey) {
      this.logger.warn('RESEND_API_KEY is not configured; skip sending password reset email.');
      return;
    }

    const fetchFn = (globalThis as any).fetch as
      | ((input: any, init?: any) => Promise<any>)
      | undefined;
    if (typeof fetchFn !== 'function') {
      this.logger.warn('Global fetch is not available; skip sending password reset email.');
      return;
    }

    const trimmedBase = this.frontendBaseUrl.endsWith('/')
      ? this.frontendBaseUrl.slice(0, -1)
      : this.frontendBaseUrl;
     const resetUrl = `${trimmedBase}/auth/reset-password?token=${token}`;
    //const resetUrl = `${trimmedBase}/auth/reset-password`;

    try {
      const response = await fetchFn('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromAddress,
          to: [recipient],
          subject: 'Reset your password',
          html: [
            '<p>You requested to reset your password.</p>',
            `<p><a href="${resetUrl}">Click here to reset your password</a>.</p>`,
            '<p>If you did not request this, you can safely ignore this email.</p>',
          ].join(''),
        }),
      });

      if (!response?.ok) {
        const errorPayload = typeof response?.text === 'function' ? await response.text() : 'Unknown error';
        this.logger.error(`Resend API returned ${response?.status}: ${errorPayload}`);
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to send password reset email via Resend: ${err.message}`, err.stack);
    }
  }
}
