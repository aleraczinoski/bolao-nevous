import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OtpPurpose, Role, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { generateOtp, hashPassword, verifyPassword } from './crypto';

const OTP_TTL_MS = 15 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email ja cadastrado.');
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        displayName: dto.displayName.trim(),
        passwordHash: await hashPassword(dto.password),
        role: Role.USER,
        active: true,
        isEmailVerified: false,
      },
    });

    const code = generateOtp();
    await this.prisma.otpCode.create({
      data: {
        userId: user.id,
        code,
        purpose: OtpPurpose.EMAIL_VERIFICATION,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    await this.mailerService.sendOtp(email, code, OtpPurpose.EMAIL_VERIFICATION);

    return { message: 'Cadastro realizado. Verifique seu email para ativar a conta.' };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciais invalidas.');
    }

    if (!user.active) {
      throw new ForbiddenException('Usuario inativo.');
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenException('Email nao verificado. Confirme seu email antes de entrar.');
    }

    return {
      accessToken: this.signToken(user),
      user: this.toUserResponse(user),
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('Codigo invalido ou expirado.');
    }

    const otp = await this.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        purpose: OtpPurpose.EMAIL_VERIFICATION,
        usedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp || otp.code !== dto.code || otp.expiresAt < new Date()) {
      throw new BadRequestException('Codigo invalido ou expirado.');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      }),
      this.prisma.otpCode.update({
        where: { id: otp.id },
        data: { usedAt: new Date() },
      }),
    ]);

    const verified = await this.prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    return {
      accessToken: this.signToken(verified),
      user: this.toUserResponse(verified),
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Resposta silenciosa — não vazar se o email existe
    if (!user) {
      return { message: 'Se o email estiver cadastrado, voce recebera um codigo em breve.' };
    }

    // Invalida OTPs anteriores de redefinição
    await this.prisma.otpCode.updateMany({
      where: { userId: user.id, purpose: OtpPurpose.PASSWORD_RESET, usedAt: null },
      data: { usedAt: new Date() },
    });

    const code = generateOtp();
    await this.prisma.otpCode.create({
      data: {
        userId: user.id,
        code,
        purpose: OtpPurpose.PASSWORD_RESET,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    await this.mailerService.sendOtp(email, code, OtpPurpose.PASSWORD_RESET);

    return { message: 'Se o email estiver cadastrado, voce recebera um codigo em breve.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('Codigo invalido ou expirado.');
    }

    const otp = await this.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        purpose: OtpPurpose.PASSWORD_RESET,
        usedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp || otp.code !== dto.code || otp.expiresAt < new Date()) {
      throw new BadRequestException('Codigo invalido ou expirado.');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await hashPassword(dto.newPassword) },
      }),
      this.prisma.otpCode.update({
        where: { id: otp.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Senha redefinida com sucesso.' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Usuario nao encontrado.');
    }

    return this.toUserResponse(user);
  }

  private signToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
    });
  }

  private toUserResponse(user: User) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
    };
  }
}
