import {
  Injectable,
  ExecutionContext,
  HttpException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { IS_APPLICATOR_ROUTE_KEY } from '../../../common/decorators/applicator-route.decorator';
import { ROLES_KEY } from '../../../common/decorators/roles.decorator';
import { Observable } from 'rxjs';
import { Role } from '../../../common/enums/role.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
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

    // Applicator rotası kontrolü ekleyelim
    const isApplicatorRoute = this.reflector.getAllAndOverride<boolean>(IS_APPLICATOR_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Eğer applicator rotası ise bu guard'ı atlat
    if (isApplicatorRoute) {
      return true; // Guard'ı atlat, ApplicatorJwtAuthGuard bunu halledecek
    }

    if (isPublic) {
      // Public endpoint'lerde bile token'ı kontrol etmek için devam ediyoruz
      return this.handleOptionalToken(context);
    }

    const result = super.canActivate(context);
    const resultAsPromise =
      result instanceof Promise ? result : Promise.resolve(result);

    return resultAsPromise.then((authorized) => {
      if (!authorized) {
        return false;
      }

      const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (!requiredRoles) {
        return true;
      }

      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (
        !user ||
        !user.roles ||
        !requiredRoles.some((role) => user.roles.includes(role))
      ) {
        throw new HttpException('Insufficient role this', 403);
      }

      return true;
    });
  }

  // Diğer metodlar aynı kalabilir...
  // handleOptionalToken ve handleRequest metodları

  async handleOptionalToken(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1]; // "Bearer token" formatından token'ı al
        const user = await super.canActivate(context);

        if (user) {
          request.user = user;
        }
      } catch (error) {
        console.warn('Optional JWT Token validation failed', error.message);
        request.user = null; // Token varsa ama geçersizse user null olsun
      }
    }

    return true; // Public endpoint olduğu için her halükarda erişime izin ver
  }

  handleRequest(err, user, info, context) {
    if (err || !user) {
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      // Applicator rotası kontrolü ekleyelim
      const isApplicatorRoute = this.reflector.getAllAndOverride<boolean>(IS_APPLICATOR_ROUTE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      // Eğer public veya applicator rotası ise izin ver
      if (isPublic || isApplicatorRoute) {
        return null;
      }

      throw err || new ForbiddenException('Forbidden: Invalid or missing token');
    }
    return user;
  }
}