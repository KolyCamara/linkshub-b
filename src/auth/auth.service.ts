import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { randomBytes, createHash } from 'node:crypto';
import { compare, hash } from 'bcryptjs';

export const SESSION_COOKIE = 'linkshub_session';
const SESSION_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Impossible de créer ce compte.');

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName.trim(),
        email,
        passwordHash: await hash(dto.password, 12),
        categories: {
          create: [
            'Développement web',
            'Intelligence artificielle',
            'Data Science',
            'Documentation',
            'Formations',
            'Outils en ligne',
            'Productivité',
            'Design',
          ].map((name) => ({ name })),
        },
      },
    });
    return this.createSession(user.id, user.fullName, user.email);
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    const valid = user ? await compare(dto.password, user.passwordHash) : false;
    if (!user || !valid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }
    return this.createSession(user.id, user.fullName, user.email);
  }

  async createSession(userId: string, fullName: string, email: string) {
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
    await this.prisma.session.create({
      data: { tokenHash, userId, expiresAt },
    });
    return { token, user: { id: userId, fullName, email }, expiresAt };
  }

  async getUserFromToken(token: string | undefined) {
    if (!token) throw new UnauthorizedException('Authentification requise.');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const session = await this.prisma.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (!session || session.expiresAt <= new Date()) {
      if (session)
        await this.prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedException('Session invalide ou expirée.');
    }
    return {
      id: session.user.id,
      fullName: session.user.fullName,
      email: session.user.email,
    };
  }

  async logout(token: string | undefined) {
    if (!token) return;
    const tokenHash = createHash('sha256').update(token).digest('hex');
    await this.prisma.session.deleteMany({ where: { tokenHash } });
  }
}
