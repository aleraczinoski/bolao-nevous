import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { OtpPurpose } from '@prisma/client';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  private createTransport() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

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
      const transport = this.createTransport();
      await transport.sendMail({
        from: process.env.SMTP_FROM ?? '"Bolão Nevous" <noreply@example.com>',
        to,
        subject,
        html,
      });
    } catch (err) {
      this.logger.error(`Falha ao enviar email para ${to}`, err);
      throw err;
    }
  }
}
