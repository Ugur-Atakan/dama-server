import {
    Injectable,
    ExecutionContext,
    HttpException,
    ForbiddenException,
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  import { Reflector } from '@nestjs/core';
  import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
  import { Observable } from 'rxjs';
  
  @Injectable()
  export class ApplicatorJwtAuthGuard extends AuthGuard('applicator-jwt') {
    constructor(private reflector: Reflector) {
      super();
    }
  
    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
  
      if (isPublic) {
        return this.handleOptionalToken(context);
      }
  
      return super.canActivate(context);
    }
  
    // Handle optional token for public endpoints
    async handleOptionalToken(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
  
      if (authHeader) {
        try {
          const token = authHeader.split(' ')[1];
          const applicator = await super.canActivate(context);
  
          if (applicator) {
            request.applicator = applicator;
            // Hem req.user hem de req.applicator olarak ayarlayalım
            request.user = applicator;
          }
        } catch (error) {
          console.warn('Optional Applicator JWT Token validation failed', error.message);
          request.applicator = null;
          request.user = null;
        }
      }
  
      return true; // Public endpoint olduğu için her halükarda erişime izin ver
    }
  
    handleRequest(err, applicator, info, context) {
      if (err || !applicator) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
          context.getHandler(),
          context.getClass(),
        ]);
  
        if (isPublic) {
          return null;
        }
  
        throw err || new ForbiddenException('Forbidden: Invalid or missing applicator token');
      }
      
      // Applicator'ı hem req.applicator hem de req.user olarak ayarlayalım
      const request = context.switchToHttp().getRequest();
      request.applicator = applicator;
      request.user = applicator;
      
      return applicator;
    }
  }