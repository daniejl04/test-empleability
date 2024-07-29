import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    // Define la API key válida (puedes cambiar esto a una configuración más robusta)
    const validApiKey = 'your-valid-api-key';

    if (apiKey && apiKey === validApiKey) {
      return true;
    } else {
      throw new UnauthorizedException('Invalid API key');
    }
  }
}

