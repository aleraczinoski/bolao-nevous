import { Injectable, Logger } from '@nestjs/common';
import { OtpPurpose } from '@prisma/client';
import { Resend } from 'resend';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  private readonly resend = new Resend(process.env.RESEND_API_KEY);

  async sendOtp(to: string, code: string, purpose: OtpPurpose): Promise<void> {
    const isVerification = purpose === OtpPurpose.EMAIL_VERIFICATION;

    const subject = isVerification
      ? 'Confirme seu email — Bolão Nevous'
      : 'Redefinição de senha — Bolão Nevous';

    const action = isVerification
      ? 'confirmar seu email'
      : 'redefinir sua senha';

    const html = `
      <p>Use o código abaixo para ${action}. Ele expira em <strong>15 minutos</strong>.</p>
      <h2 style="letter-spacing:4px">${code}</h2>
      <p>Se você não solicitou isso, ignore este email.</p>
    `;

    try {
      await this.resend.emails.send({
        from: process.env.SMTP_FROM || 'onboarding@resend.dev',
        to,
        subject,
        html,
      });

      this.logger.log(`Email enviado para ${to}`);
    } catch (err) {
      this.logger.error(`Falha ao enviar email para ${to}`, err);
      throw err;
    }
  }
}
