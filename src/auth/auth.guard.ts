import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { parse } from 'cookie';
import { AuthService, SESSION_COOKIE } from './auth.service';
import type { AuthenticatedRequest } from './auth.types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const cookies = parse(request.headers.cookie ?? '');
    request.user = await this.authService.getUserFromToken(
      cookies[SESSION_COOKIE],
    );
    return true;
  }
}
